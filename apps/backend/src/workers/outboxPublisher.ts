import { prisma } from '../config/database.js';
import {
  excelQueue,
  validationQueue,
  certificateQueue,
  notificationQueue,
  slaQueue,
} from '../queues/index.js';
import { EVENT_TOPICS } from '@certiflow/shared';

export class OutboxPublisher {
  private isRunning = false;
  private intervalTimer: NodeJS.Timeout | null = null;

  public start(pollIntervalMs = 5000): void {
    if (this.isRunning) return;
    this.isRunning = true;

    this.intervalTimer = setInterval(() => {
      this.publishPendingEvents().catch((err) => {
        console.error('[OutboxPublisher Error]', err.message);
      });
    }, pollIntervalMs);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }

  public async publishPendingEvents(): Promise<number> {
    const pendingEvents = await prisma.outboxEvent.findMany({
      where: { status: 'PENDING' },
      take: 20,
      orderBy: { createdAt: 'asc' },
    });

    if (pendingEvents.length === 0) return 0;

    let publishedCount = 0;

    for (const event of pendingEvents) {
      try {
        await this.routeEventToQueue(event.id, event.topic, event.payload as Record<string, unknown>);

        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: {
            status: 'PUBLISHED',
            publishedAt: new Date(),
          },
        });
        publishedCount++;
      } catch (err: any) {
        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: {
            retryCount: { increment: 1 },
            lastError: err?.message || 'Queue dispatch failed',
          },
        });
      }
    }

    return publishedCount;
  }

  private async routeEventToQueue(eventId: string, topic: string, payload: Record<string, unknown>): Promise<void> {
    const jobOptions = { jobId: eventId };

    switch (topic) {
      case EVENT_TOPICS.BATCH_CREATED:
        await excelQueue.add(topic, payload, jobOptions);
        break;
      case EVENT_TOPICS.BATCH_SUBMITTED:
      case EVENT_TOPICS.BATCH_DISTRICT_APPROVED:
      case EVENT_TOPICS.BATCH_QUALITY_REVIEWED:
        await validationQueue.add(topic, payload, jobOptions);
        break;
      case EVENT_TOPICS.BATCH_STATE_APPROVED:
      case EVENT_TOPICS.CERTIFICATE_BATCH_CLEARED:
        await certificateQueue.add(topic, payload, jobOptions);
        break;
      case EVENT_TOPICS.CERTIFICATE_ISSUED:
      case EVENT_TOPICS.CERTIFICATE_REVOKED:
        await notificationQueue.add(topic, payload, jobOptions);
        break;
      default:
        await validationQueue.add(topic, payload, jobOptions);
        break;
    }
  }
}

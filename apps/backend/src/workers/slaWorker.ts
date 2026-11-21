import { prisma } from '../config/database.js';
import { createOutboxEvent } from '../events/outbox.js';
import { SseManager } from '../modules/events/sseManager.js';
import { EVENT_TOPICS } from '@certiflow/shared';

export async function checkSlaDeadlines(): Promise<void> {
  const now = new Date();

  // Find batches that have passed stageDeadline and are not yet marked isOverdue
  const overdueBatches = await prisma.batch.findMany({
    where: {
      status: { in: ['SUBMITTED', 'DISTRICT_PARTIALLY_APPROVED', 'QUALITY_REVIEW'] },
      stageDeadline: { lt: now },
      isOverdue: false,
    },
    include: { district: true },
  });

  for (const batch of overdueBatches) {
    console.warn(`[SlaWorker] SLA deadline breached for batch ${batch.batchNumber}`);

    await prisma.$transaction(async (tx) => {
      await tx.batch.update({
        where: { id: batch.id },
        data: { isOverdue: true },
      });

      await createOutboxEvent(
        EVENT_TOPICS.SLA_BREACHED,
        {
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          districtId: batch.districtId,
          stageDeadline: batch.stageDeadline,
          breachedAt: now.toISOString(),
        },
        tx
      );
    });

    // Real-time broadcast for high-priority escalation in district & state dashboards
    SseManager.broadcast('SLA_BREACHED', {
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      districtName: batch.district?.name,
      stageDeadline: batch.stageDeadline,
    });
  }
}

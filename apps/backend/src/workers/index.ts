import { Worker, Job } from 'bullmq';
import { redis, disconnectRedis } from '../config/redis.js';
import { disconnectDatabase } from '../config/database.js';
import { closeQueues } from '../queues/index.js';
import { OutboxPublisher } from './outboxPublisher.js';
import { processCertificateGeneration } from './certificateWorker.js';
import { processNotification } from './notificationWorker.js';
import { checkSlaDeadlines } from './slaWorker.js';
import { QUEUE_NAMES } from '@certiflow/shared';

console.log('[Worker Process] Initializing background processors...');

const publisher = new OutboxPublisher();
publisher.start(3000);

// Periodic SLA Escalation Checker (every 60 seconds)
const slaInterval = setInterval(() => {
  checkSlaDeadlines().catch((err) => {
    console.error('[SlaWorker Error]', err.message);
  });
}, 60000);

// BullMQ Processors with retry & idempotency handling
const excelWorker = new Worker(
  QUEUE_NAMES.EXCEL_PROCESSING,
  async (job: Job) => {
    console.log(`[Excel Worker] Processing job ${job.id}:`, job.name);
    return { status: 'COMPLETED', jobId: job.id };
  },
  { connection: redis, concurrency: 5 }
);

const certificateWorker = new Worker(
  QUEUE_NAMES.CERTIFICATE_GENERATION,
  async (job: Job) => {
    console.log(`[Certificate Worker] Processing job ${job.id}:`, job.name);
    await processCertificateGeneration(job as any);
    return { status: 'COMPLETED', jobId: job.id };
  },
  { connection: redis, concurrency: 3 }
);

const notificationWorker = new Worker(
  QUEUE_NAMES.NOTIFICATIONS,
  async (job: Job) => {
    console.log(`[Notification Worker] Processing job ${job.id}:`, job.name);
    await processNotification(job as any);
    return { status: 'COMPLETED', jobId: job.id };
  },
  { connection: redis, concurrency: 5 }
);

const workers = [excelWorker, certificateWorker, notificationWorker];

async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`[Worker Process] Received ${signal}. Draining jobs and shutting down gracefully...`);
  clearInterval(slaInterval);
  publisher.stop();

  await Promise.all(workers.map((w) => w.close()));
  await closeQueues();
  await disconnectRedis();
  await disconnectDatabase();

  console.log('[Worker Process] Graceful shutdown complete.');
  process.exit(0);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export { workers, publisher };

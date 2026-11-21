import { Queue } from 'bullmq';
import { redis } from '../config/redis.js';
import { QUEUE_NAMES } from '@certiflow/shared';

const defaultQueueOptions = {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential' as const,
      delay: 2000,
    },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
};

export const excelQueue = new Queue(QUEUE_NAMES.EXCEL_PROCESSING, defaultQueueOptions);
export const validationQueue = new Queue(QUEUE_NAMES.BATCH_VALIDATION, defaultQueueOptions);
export const certificateQueue = new Queue(QUEUE_NAMES.CERTIFICATE_GENERATION, defaultQueueOptions);
export const notificationQueue = new Queue(QUEUE_NAMES.NOTIFICATIONS, defaultQueueOptions);
export const slaQueue = new Queue(QUEUE_NAMES.SLA_REMINDERS, defaultQueueOptions);

export async function closeQueues(): Promise<void> {
  await Promise.all([
    excelQueue.close(),
    validationQueue.close(),
    certificateQueue.close(),
    notificationQueue.close(),
    slaQueue.close(),
  ]);
}

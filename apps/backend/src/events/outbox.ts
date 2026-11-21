import { PrismaClient, OutboxStatus } from '@prisma/client';
import { prisma as defaultPrisma } from '../config/database.js';

export interface OutboxPayload {
  topic: string;
  payload: Record<string, unknown>;
}

export async function createOutboxEvent(
  topicOrTx: string | any,
  payloadOrData?: Record<string, unknown> | OutboxPayload,
  optionalTx?: any
) {
  // Support overload: createOutboxEvent(topic, payload, tx)
  if (typeof topicOrTx === 'string') {
    const topic = topicOrTx;
    const payload = payloadOrData as Record<string, unknown>;
    const client = optionalTx || defaultPrisma;

    return client.outboxEvent.create({
      data: {
        topic,
        payload,
        status: 'PENDING' as OutboxStatus,
      },
    });
  }

  // Support legacy overload: createOutboxEvent(tx, data)
  const client = topicOrTx;
  const data = payloadOrData as OutboxPayload;

  return client.outboxEvent.create({
    data: {
      topic: data.topic,
      payload: data.payload,
      status: 'PENDING' as OutboxStatus,
    },
  });
}

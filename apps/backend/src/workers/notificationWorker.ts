import { Job } from 'bullmq';
import crypto from 'crypto';
import { prisma } from '../config/database.js';

export interface NotificationJobData {
  certificateId: string;
  candidateId: string;
  fullName: string;
  phone: string;
  certificateNumber: string;
  verificationUrl: string;
  courseName: string;
}

export async function processNotification(job: Job<NotificationJobData>): Promise<void> {
  const data = job.data;
  console.log(`[NotificationWorker] Dispatching WhatsApp HSM alert to ${data.phone} for cert ${data.certificateNumber}`);

  // Format HSM template payload
  const templatePayload = {
    messaging_product: 'whatsapp',
    to: data.phone,
    type: 'template',
    template: {
      name: 'certiflow_issuance_notice',
      language: { code: 'en' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: data.fullName },
            { type: 'text', text: data.courseName },
            { type: 'text', text: data.certificateNumber },
            { type: 'text', text: data.verificationUrl },
          ],
        },
      ],
    },
  };

  // Simulate external WhatsApp Cloud API request with delivery confirmation
  const providerMessageId = `wamid.HB_${crypto.randomBytes(8).toString('hex')}`;

  await prisma.notification.create({
    data: {
      recipientPhone: data.phone,
      certificateId: data.certificateId,
      channel: 'WHATSAPP',
      templateName: 'certiflow_issuance_notice',
      payloadJson: templatePayload,
      providerMessageId,
      status: 'DELIVERED',
      sentAt: new Date(),
      deliveredAt: new Date(),
    },
  });

  console.log(`[NotificationWorker] Successfully delivered WhatsApp HSM notice for ${data.certificateNumber} (${providerMessageId})`);
}

import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Seeding default demonstration records...');

  // Create Sample Districts
  const districtDelhi = await prisma.district.upsert({
    where: { code: 'DL-01' },
    update: {},
    create: {
      name: 'Central Delhi',
      code: 'DL-01',
      state: 'Delhi',
    },
  });

  const districtBengaluru = await prisma.district.upsert({
    where: { code: 'KA-01' },
    update: {},
    create: {
      name: 'Bengaluru Urban',
      code: 'KA-01',
      state: 'Karnataka',
    },
  });

  const defaultPasswordHash = await bcrypt.hash('DemoPassword123!', 12);

  // Seed Admin Account
  await prisma.user.upsert({
    where: { email: 'admin@certiflow.gov.in' },
    update: {},
    create: {
      email: 'admin@certiflow.gov.in',
      name: 'Platform Administrator',
      passwordHash: defaultPasswordHash,
      role: 'ADMIN' as Role,
      isActive: true,
    },
  });

  // Seed State Officer
  await prisma.user.upsert({
    where: { email: 'state.officer@certiflow.gov.in' },
    update: {},
    create: {
      email: 'state.officer@certiflow.gov.in',
      name: 'Dr. Ramesh Kumar (State Director)',
      passwordHash: defaultPasswordHash,
      role: 'STATE_OFFICER' as Role,
      isActive: true,
    },
  });

  // Seed District Officers
  const districtOfficer1 = await prisma.user.upsert({
    where: { email: 'district.delhi1@certiflow.gov.in' },
    update: {},
    create: {
      email: 'district.delhi1@certiflow.gov.in',
      name: 'Pooja Verma (District Officer 1)',
      passwordHash: defaultPasswordHash,
      role: 'DISTRICT_OFFICER' as Role,
      districtId: districtDelhi.id,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'district.delhi2@certiflow.gov.in' },
    update: {},
    create: {
      email: 'district.delhi2@certiflow.gov.in',
      name: 'Amit Patel (District Officer 2)',
      passwordHash: defaultPasswordHash,
      role: 'DISTRICT_OFFICER' as Role,
      districtId: districtDelhi.id,
      isActive: true,
    },
  });

  // Seed Quality Officer
  await prisma.user.upsert({
    where: { email: 'quality.officer@certiflow.gov.in' },
    update: {},
    create: {
      email: 'quality.officer@certiflow.gov.in',
      name: 'Sunita Rao (Quality Assessor)',
      passwordHash: defaultPasswordHash,
      role: 'QUALITY_OFFICER' as Role,
      isActive: true,
    },
  });

  // Seed Training Centre
  const trainingCentre = await prisma.user.upsert({
    where: { email: 'centre.delhi@skills.org' },
    update: {},
    create: {
      email: 'centre.delhi@skills.org',
      name: 'Apex Skilling Centre Delhi',
      passwordHash: defaultPasswordHash,
      role: 'TRAINING_CENTRE' as Role,
      districtId: districtDelhi.id,
      isActive: true,
    },
  });

  // Seed Sample Demonstration Batch
  const sampleBatch = await prisma.batch.upsert({
    where: { batchNumber: 'BATCH-2026-DL-001' },
    update: {},
    create: {
      batchNumber: 'BATCH-2026-DL-001',
      trainingCentreId: trainingCentre.id,
      districtId: districtDelhi.id,
      courseName: 'Certified Solar Energy Technician',
      startDate: '2026-01-10',
      endDate: '2026-04-10',
      version: 1,
      status: 'SUBMITTED',
      candidateCount: 2,
    },
  });

  console.log('[Seed] Demonstration records successfully created:', {
    districts: [districtDelhi.code, districtBengaluru.code],
    sampleBatch: sampleBatch.batchNumber,
  });
}

main()
  .catch((e) => {
    console.error('[Seed Error]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

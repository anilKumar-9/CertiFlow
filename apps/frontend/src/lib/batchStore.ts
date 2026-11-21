import { useState, useEffect } from 'react';

export interface CandidateRecord {
  id: string;
  fullName: string;
  fatherName: string;
  dob: string;
  gender: string;
  enrollmentNumber: string;
  maskedAadhaar: string;
  rawAadhaar?: string;
  phone: string;
  email: string;
  attendance: number;
  theoryScore: number;
  practicalScore: number;
  biometricVerified: boolean;
  status: 'PASS' | 'FLAGGED';
  certificateNumber?: string;
  issuedDate?: string;
  audited?: boolean;
}

export interface PlatformBatch {
  id: string;
  batchNumber: string;
  courseName: string;
  trainingCentre: string;
  district: string;
  candidateCount: number;
  version: number;
  status:
    | 'DRAFT'
    | 'SUBMITTED'
    | 'DISTRICT_PARTIALLY_APPROVED'
    | 'DISTRICT_APPROVED'
    | 'APPROVED_QUALITY'
    | 'ISSUED'
    | 'NEEDS_REVISION';
  submittedDate?: string;
  slaHoursLeft: number;
  officer1Approved: boolean;
  officer1Name: string | null;
  officer2Approved: boolean;
  officer2Name: string | null;
  qualityApproved: boolean;
  isHighVolumeAlert: boolean;
  sampleSize: number;
  stateApproved: boolean;
  candidatesList: CandidateRecord[];
  revisionRemarks?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'certiflow_platform_batches_v2';

const INITIAL_DEFAULT_BATCHES: PlatformBatch[] = [
  {
    id: 'batch-001',
    batchNumber: 'BATCH-2026-DL-CENTRAL-001',
    courseName: 'Certified Solar Energy Technician (NSQF Level 4)',
    trainingCentre: 'Apex Skilling Centre, Pusa Campus',
    district: 'Delhi Central',
    candidateCount: 5,
    version: 1,
    status: 'SUBMITTED',
    submittedDate: '2026-03-01 10:30',
    slaHoursLeft: 28,
    officer1Approved: true,
    officer1Name: 'R. Sharma (DO-01)',
    officer2Approved: false,
    officer2Name: null,
    qualityApproved: false,
    isHighVolumeAlert: false,
    sampleSize: 1,
    stateApproved: false,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:30:00Z',
    candidatesList: [
      {
        id: 'c1',
        fullName: 'Rahul Verma',
        fatherName: 'Suresh Verma',
        dob: '2001-05-14',
        gender: 'MALE',
        enrollmentNumber: 'ENR-2026-0001',
        maskedAadhaar: 'XXXXXXXX1245',
        phone: '9876543210',
        email: 'rahul.verma@example.com',
        attendance: 94,
        theoryScore: 82,
        practicalScore: 88,
        biometricVerified: true,
        status: 'PASS',
        certificateNumber: 'CF-2026-DL-000001',
        issuedDate: '10/08/2022',
        audited: true,
      },
      {
        id: 'c2',
        fullName: 'Priya Sharma',
        fatherName: 'Anil Sharma',
        dob: '2002-09-21',
        gender: 'FEMALE',
        enrollmentNumber: 'ENR-2026-0002',
        maskedAadhaar: 'XXXXXXXX8821',
        phone: '9876543211',
        email: 'priya.sharma@example.com',
        attendance: 98,
        theoryScore: 88,
        practicalScore: 92,
        biometricVerified: true,
        status: 'PASS',
        certificateNumber: 'CF-2026-DL-000002',
        issuedDate: '10/08/2022',
        audited: true,
      },
      {
        id: 'c3',
        fullName: 'Amit Kumar',
        fatherName: 'Rajesh Kumar',
        dob: '2000-11-03',
        gender: 'MALE',
        enrollmentNumber: 'ENR-2026-0003',
        maskedAadhaar: 'XXXXXXXX4512',
        phone: '9876543212',
        email: 'amit.kumar@example.com',
        attendance: 86,
        theoryScore: 74,
        practicalScore: 80,
        biometricVerified: true,
        status: 'PASS',
        certificateNumber: 'CF-2026-DL-000003',
        issuedDate: '10/08/2022',
        audited: false,
      },
      {
        id: 'c4',
        fullName: 'Sunita Yadav',
        fatherName: 'Mahesh Yadav',
        dob: '2003-02-18',
        gender: 'FEMALE',
        enrollmentNumber: 'ENR-2026-0004',
        maskedAadhaar: 'XXXXXXXX9934',
        phone: '9876543213',
        email: 'sunita.yadav@example.com',
        attendance: 92,
        theoryScore: 85,
        practicalScore: 89,
        biometricVerified: true,
        status: 'PASS',
        certificateNumber: 'CF-2026-DL-000004',
        issuedDate: '10/08/2022',
        audited: true,
      },
      {
        id: 'c5',
        fullName: 'Vikram Singh',
        fatherName: 'Dharmendra Singh',
        dob: '1999-07-29',
        gender: 'MALE',
        enrollmentNumber: 'ENR-2026-0005',
        maskedAadhaar: 'XXXXXXXX3311',
        phone: '9876543214',
        email: 'vikram.singh@example.com',
        attendance: 88,
        theoryScore: 78,
        practicalScore: 84,
        biometricVerified: true,
        status: 'PASS',
        certificateNumber: 'CF-2026-DL-000005',
        issuedDate: '10/08/2022',
        audited: false,
      },
    ],
  },
  {
    id: 'batch-002',
    batchNumber: 'BATCH-2026-DL-NORTH-007',
    courseName: 'Industrial Electrician & Automation',
    trainingCentre: 'Vidyapeeth Skill Complex',
    district: 'Delhi North',
    candidateCount: 140,
    version: 1,
    status: 'DISTRICT_APPROVED',
    submittedDate: '2026-02-28 14:00',
    slaHoursLeft: 12,
    officer1Approved: true,
    officer1Name: 'S. Rawat (DO-01)',
    officer2Approved: true,
    officer2Name: 'M. Gupta (DO-02)',
    qualityApproved: false,
    isHighVolumeAlert: true,
    sampleSize: 14,
    stateApproved: false,
    createdAt: '2026-02-28T12:00:00Z',
    updatedAt: '2026-02-28T18:00:00Z',
    candidatesList: [
      {
        id: 'cs1',
        fullName: 'Vikas Sharma',
        fatherName: 'Omprakash Sharma',
        dob: '2001-04-12',
        gender: 'MALE',
        enrollmentNumber: 'ENR-2026-7001',
        maskedAadhaar: 'XXXXXXXX9921',
        phone: '9811223344',
        email: 'vikas.sharma@example.com',
        attendance: 95,
        theoryScore: 84,
        practicalScore: 90,
        biometricVerified: true,
        status: 'PASS',
        certificateNumber: 'CF-2026-DL-000006',
        issuedDate: '10/08/2022',
        audited: true,
      },
      {
        id: 'cs2',
        fullName: 'Neha Kumari',
        fatherName: 'Ramprasad Kumari',
        dob: '2002-11-23',
        gender: 'FEMALE',
        enrollmentNumber: 'ENR-2026-7014',
        maskedAadhaar: 'XXXXXXXX4411',
        phone: '9811223345',
        email: 'neha.kumari@example.com',
        attendance: 91,
        theoryScore: 78,
        practicalScore: 85,
        biometricVerified: true,
        status: 'PASS',
        certificateNumber: 'CF-2026-DL-000007',
        issuedDate: '10/08/2022',
        audited: true,
      },
      {
        id: 'cs3',
        fullName: 'Mohammad Farhan',
        fatherName: 'Abdul Kalam',
        dob: '2000-08-15',
        gender: 'MALE',
        enrollmentNumber: 'ENR-2026-7028',
        maskedAadhaar: 'XXXXXXXX8833',
        phone: '9811223346',
        email: 'farhan.k@example.com',
        attendance: 89,
        theoryScore: 82,
        practicalScore: 88,
        biometricVerified: true,
        status: 'PASS',
        certificateNumber: 'CF-2026-DL-000008',
        issuedDate: '10/08/2022',
        audited: true,
      },
      {
        id: 'cs4',
        fullName: 'Pooja Rani',
        fatherName: 'Satish Rani',
        dob: '2003-01-30',
        gender: 'FEMALE',
        enrollmentNumber: 'ENR-2026-7042',
        maskedAadhaar: 'XXXXXXXX1122',
        phone: '9811223347',
        email: 'pooja.rani@example.com',
        attendance: 96,
        theoryScore: 88,
        practicalScore: 94,
        biometricVerified: true,
        status: 'PASS',
        certificateNumber: 'CF-2026-DL-000009',
        issuedDate: '10/08/2022',
        audited: false,
      },
      {
        id: 'cs5',
        fullName: 'Deepak Yadav',
        fatherName: 'Rameshwar Yadav',
        dob: '1999-06-18',
        gender: 'MALE',
        enrollmentNumber: 'ENR-2026-7056',
        maskedAadhaar: 'XXXXXXXX5566',
        phone: '9811223348',
        email: 'deepak.yadav@example.com',
        attendance: 86,
        theoryScore: 75,
        practicalScore: 80,
        biometricVerified: true,
        status: 'PASS',
        certificateNumber: 'CF-2026-DL-000010',
        issuedDate: '10/08/2022',
        audited: true,
      },
    ],
  },
  {
    id: 'batch-003',
    batchNumber: 'BATCH-2026-DL-WEST-004',
    courseName: 'CNC Machine Operator Level 4',
    trainingCentre: 'Apex Vocational Hub',
    district: 'Delhi West',
    candidateCount: 0,
    version: 1,
    status: 'DRAFT',
    slaHoursLeft: 48,
    officer1Approved: false,
    officer1Name: null,
    officer2Approved: false,
    officer2Name: null,
    qualityApproved: false,
    isHighVolumeAlert: false,
    sampleSize: 0,
    stateApproved: false,
    createdAt: '2026-03-02T09:00:00Z',
    updatedAt: '2026-03-02T09:00:00Z',
    candidatesList: [],
  },
  {
    id: 'batch-004',
    batchNumber: 'BATCH-2026-DL-SOUTH-003',
    courseName: 'Healthcare Assistant (Geriatric)',
    trainingCentre: 'Metro Skill Complex',
    district: 'Delhi South',
    candidateCount: 28,
    version: 1,
    status: 'SUBMITTED',
    submittedDate: '2026-02-28 09:00',
    slaHoursLeft: -6, // SLA Breached Overdue
    officer1Approved: false,
    officer1Name: null,
    officer2Approved: false,
    officer2Name: null,
    qualityApproved: false,
    isHighVolumeAlert: false,
    sampleSize: 3,
    stateApproved: false,
    createdAt: '2026-02-28T09:00:00Z',
    updatedAt: '2026-02-28T09:00:00Z',
    candidatesList: [
      {
        id: 'c6',
        fullName: 'Deepak Joshi',
        fatherName: 'Mohan Joshi',
        dob: '2000-03-12',
        gender: 'MALE',
        enrollmentNumber: 'ENR-2026-0201',
        maskedAadhaar: 'XXXXXXXX7744',
        phone: '9811223344',
        email: 'deepak.j@example.com',
        attendance: 95,
        theoryScore: 86,
        practicalScore: 91,
        biometricVerified: true,
        status: 'PASS',
        certificateNumber: 'CF-2026-DL-000011',
        issuedDate: '10/08/2022',
      },
      {
        id: 'c7',
        fullName: 'Ananya Guha',
        fatherName: 'Subhas Guha',
        dob: '2002-12-05',
        gender: 'FEMALE',
        enrollmentNumber: 'ENR-2026-0202',
        maskedAadhaar: 'XXXXXXXX5522',
        phone: '9811223345',
        email: 'ananya.g@example.com',
        attendance: 90,
        theoryScore: 80,
        practicalScore: 85,
        biometricVerified: true,
        status: 'PASS',
        certificateNumber: 'CF-2026-DL-000012',
        issuedDate: '10/08/2022',
      },
    ],
  },
  {
    id: 'batch-005',
    batchNumber: 'BATCH-2026-DL-EAST-019',
    courseName: 'Electric Vehicle Service Specialist',
    trainingCentre: 'Shakti Technical Institute',
    district: 'Delhi East',
    candidateCount: 65,
    version: 1,
    status: 'APPROVED_QUALITY',
    submittedDate: '2026-02-26 11:00',
    slaHoursLeft: 0,
    officer1Approved: true,
    officer1Name: 'K. Patel (DO-01)',
    officer2Approved: true,
    officer2Name: 'R. Sharma (DO-02)',
    qualityApproved: true,
    isHighVolumeAlert: false,
    sampleSize: 7,
    stateApproved: false,
    createdAt: '2026-02-26T10:00:00Z',
    updatedAt: '2026-02-27T16:00:00Z',
    candidatesList: [
      {
        id: 'cs6',
        fullName: 'Rajesh Nair',
        fatherName: 'Gopal Nair',
        dob: '2001-07-14',
        gender: 'MALE',
        enrollmentNumber: 'ENR-2026-1901',
        maskedAadhaar: 'XXXXXXXX6621',
        phone: '9899001122',
        email: 'rajesh.nair@example.com',
        attendance: 94,
        theoryScore: 85,
        practicalScore: 89,
        biometricVerified: true,
        status: 'PASS',
        certificateNumber: 'CF-2026-DL-000013',
        issuedDate: '10/08/2022',
      },
      {
        id: 'cs7',
        fullName: 'Kavita Rawat',
        fatherName: 'Prem Rawat',
        dob: '2001-08-19',
        gender: 'FEMALE',
        enrollmentNumber: 'ENR-2026-1902',
        maskedAadhaar: 'XXXXXXXX6633',
        phone: '9899001123',
        email: 'kavita.rawat@example.com',
        attendance: 92,
        theoryScore: 84,
        practicalScore: 87,
        biometricVerified: true,
        status: 'PASS',
        certificateNumber: 'CF-2026-DL-000014',
        issuedDate: '10/08/2022',
      },
    ],
  },
];

type Listener = (batches: PlatformBatch[]) => void;
const listeners: Set<Listener> = new Set();

function getStoredBatches(): PlatformBatch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse stored batches, loading initial seed:', err);
  }
  // Initialize with seed
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEFAULT_BATCHES));
  } catch {}
  return INITIAL_DEFAULT_BATCHES;
}

let memoryBatches: PlatformBatch[] = getStoredBatches();

function broadcast() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryBatches));
  } catch (e) {
    console.error('Failed to write to localStorage:', e);
  }
  listeners.forEach((fn) => fn([...memoryBatches]));
}

export const platformStore = {
  getBatches(): PlatformBatch[] {
    return [...memoryBatches];
  },

  getBatchById(id: string): PlatformBatch | undefined {
    return memoryBatches.find((b) => b.id === id);
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  createBatch(params: {
    courseName: string;
    startDate?: string;
    endDate?: string;
    trainingCentre?: string;
    district?: string;
  }): PlatformBatch {
    const seq = memoryBatches.length + 1;
    const padded = String(seq).padStart(3, '0');
    const newBatch: PlatformBatch = {
      id: `batch-${Date.now()}`,
      batchNumber: `BATCH-2026-DL-${padded}`,
      courseName: params.courseName,
      trainingCentre: params.trainingCentre || 'Apex Skilling Delhi (TC-084)',
      district: params.district || 'Delhi Central',
      candidateCount: 0,
      version: 1,
      status: 'DRAFT',
      slaHoursLeft: 48,
      officer1Approved: false,
      officer1Name: null,
      officer2Approved: false,
      officer2Name: null,
      qualityApproved: false,
      isHighVolumeAlert: false,
      sampleSize: 0,
      stateApproved: false,
      candidatesList: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryBatches = [newBatch, ...memoryBatches];
    broadcast();
    return newBatch;
  },

  uploadRoster(batchId: string, rawCandidates: Partial<CandidateRecord>[]): PlatformBatch | undefined {
    const batch = memoryBatches.find((b) => b.id === batchId);
    if (!batch) return undefined;

    const formattedCandidates: CandidateRecord[] = rawCandidates.map((c, index) => {
      const rawAadhaar = c.rawAadhaar || c.maskedAadhaar || '234567890123';
      const cleanAadhaar = rawAadhaar.replace(/\D/g, '');
      const masked = cleanAadhaar.length >= 4 ? `XXXXXXXX${cleanAadhaar.slice(-4)}` : 'XXXXXXXX1234';
      const seqNo = String(index + 1).padStart(4, '0');

      return {
        id: `cand-${Date.now()}-${index}`,
        fullName: c.fullName || `Candidate ${index + 1}`,
        fatherName: c.fatherName || `Guardian ${index + 1}`,
        dob: c.dob || '2001-01-01',
        gender: (c.gender || 'MALE').toUpperCase(),
        enrollmentNumber: c.enrollmentNumber || `ENR-2026-${seqNo}`,
        maskedAadhaar: masked,
        rawAadhaar: cleanAadhaar,
        phone: c.phone || '9876543210',
        email: c.email || `candidate${index + 1}@example.com`,
        attendance: c.attendance || Math.floor(Math.random() * 15) + 85, // 85-99%
        theoryScore: c.theoryScore || Math.floor(Math.random() * 20) + 75, // 75-94%
        practicalScore: c.practicalScore || Math.floor(Math.random() * 18) + 80, // 80-97%
        biometricVerified: true,
        status: 'PASS',
        certificateNumber: `CF-2026-DL-${String(index + 1).padStart(6, '0')}`,
        issuedDate: '10/08/2022',
        audited: index === 0 || index % 3 === 0,
      };
    });

    const count = formattedCandidates.length;
    const isHighVolume = count >= 100;
    const sampleSize = Math.max(1, Math.round(count * 0.1));

    batch.candidatesList = formattedCandidates;
    batch.candidateCount = count;
    batch.isHighVolumeAlert = isHighVolume;
    batch.sampleSize = sampleSize;
    batch.updatedAt = new Date().toISOString();

    broadcast();
    return batch;
  },

  submitBatch(batchId: string): PlatformBatch | undefined {
    const batch = memoryBatches.find((b) => b.id === batchId);
    if (!batch) return undefined;

    batch.status = 'SUBMITTED';
    batch.submittedDate = new Date().toISOString().slice(0, 16).replace('T', ' ');
    batch.slaHoursLeft = 48;
    batch.updatedAt = new Date().toISOString();

    broadcast();
    return batch;
  },

  officer1Sign(batchId: string, officerName = 'A. K. Verma (DO-01)'): PlatformBatch | undefined {
    const batch = memoryBatches.find((b) => b.id === batchId);
    if (!batch) return undefined;

    batch.officer1Approved = true;
    batch.officer1Name = officerName;
    batch.status = 'DISTRICT_PARTIALLY_APPROVED';
    batch.updatedAt = new Date().toISOString();

    broadcast();
    return batch;
  },

  officer2Sign(batchId: string, officerName = 'R. Sharma (DO-02)'): PlatformBatch | undefined {
    const batch = memoryBatches.find((b) => b.id === batchId);
    if (!batch) return undefined;

    batch.officer2Approved = true;
    batch.officer2Name = officerName;
    batch.status = 'DISTRICT_APPROVED';
    batch.updatedAt = new Date().toISOString();

    broadcast();
    return batch;
  },

  reviseBatch(batchId: string, remarks: string): PlatformBatch | undefined {
    const batch = memoryBatches.find((b) => b.id === batchId);
    if (!batch) return undefined;

    batch.status = 'NEEDS_REVISION';
    batch.version += 1;
    batch.officer1Approved = false;
    batch.officer2Approved = false;
    batch.revisionRemarks = remarks;
    batch.updatedAt = new Date().toISOString();

    broadcast();
    return batch;
  },

  qualityApprove(batchId: string): PlatformBatch | undefined {
    const batch = memoryBatches.find((b) => b.id === batchId);
    if (!batch) return undefined;

    batch.qualityApproved = true;
    batch.status = 'APPROVED_QUALITY';
    batch.updatedAt = new Date().toISOString();

    broadcast();
    return batch;
  },

  stateIssue(batchId: string): PlatformBatch | undefined {
    const batch = memoryBatches.find((b) => b.id === batchId);
    if (!batch) return undefined;

    batch.stateApproved = true;
    batch.status = 'ISSUED';
    batch.updatedAt = new Date().toISOString();

    broadcast();
    return batch;
  },

  resetToDefaults(): PlatformBatch[] {
    memoryBatches = [...INITIAL_DEFAULT_BATCHES];
    broadcast();
    return memoryBatches;
  },
};

/**
 * React hook to bind any component to live, persistent platform batches
 */
export function usePlatformBatches() {
  const [batches, setBatches] = useState<PlatformBatch[]>(() => platformStore.getBatches());

  useEffect(() => {
    // Initial sync
    setBatches(platformStore.getBatches());
    // Subscribe to reactive updates from any dashboard
    return platformStore.subscribe((updated) => {
      setBatches(updated);
    });
  }, []);

  return {
    batches,
    createBatch: platformStore.createBatch,
    uploadRoster: platformStore.uploadRoster,
    submitBatch: platformStore.submitBatch,
    officer1Sign: platformStore.officer1Sign,
    officer2Sign: platformStore.officer2Sign,
    reviseBatch: platformStore.reviseBatch,
    qualityApprove: platformStore.qualityApprove,
    stateIssue: platformStore.stateIssue,
    resetToDefaults: platformStore.resetToDefaults,
  };
}

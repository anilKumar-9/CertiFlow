const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function generateCompleteTemplate() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CertiFlow National Skilling Registry';
  workbook.created = new Date();
  workbook.views = [{ activeTab: 0, firstSheet: 0 }];

  // ==========================================
  // SHEET 1: Candidate Roster
  // ==========================================
  const rosterSheet = workbook.addWorksheet('Candidate Roster', {
    views: [{ state: 'frozen', ySplit: 1 }]
  });

  rosterSheet.columns = [
    { header: 'fullName', key: 'fullName', width: 24 },
    { header: 'fatherName', key: 'fatherName', width: 24 },
    { header: 'dob', key: 'dob', width: 16 },
    { header: 'gender', key: 'gender', width: 14 },
    { header: 'aadhaar', key: 'aadhaar', width: 18 },
    { header: 'phone', key: 'phone', width: 16 },
    { header: 'email', key: 'email', width: 30 },
    { header: 'enrollmentNumber', key: 'enrollmentNumber', width: 20 },
  ];

  // Style Header Row (Row 1)
  const headerRow = rosterSheet.getRow(1);
  headerRow.height = 32;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF163A5F' } // CertiFlow Deep Navy
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFDCE3EA' } },
      bottom: { style: 'medium', color: { argb: 'FFC49A3A' } }, // Gold Accent
      left: { style: 'thin', color: { argb: 'FFDCE3EA' } },
      right: { style: 'thin', color: { argb: 'FFDCE3EA' } },
    };
  });

  // The 5 Standard Sample Candidate Rows
  const sampleCandidates = [
    {
      fullName: 'Rahul Verma',
      fatherName: 'Suresh Verma',
      dob: '2001-05-14',
      gender: 'MALE',
      aadhaar: '234567890123',
      phone: '9876543210',
      email: 'rahul.verma@example.com',
      enrollmentNumber: 'ENR-2026-0001'
    },
    {
      fullName: 'Priya Sharma',
      fatherName: 'Anil Sharma',
      dob: '2002-09-21',
      gender: 'FEMALE',
      aadhaar: '345678901234',
      phone: '9876543211',
      email: 'priya.sharma@example.com',
      enrollmentNumber: 'ENR-2026-0002'
    },
    {
      fullName: 'Amit Kumar',
      fatherName: 'Rajesh Kumar',
      dob: '2000-11-03',
      gender: 'MALE',
      aadhaar: '456789012345',
      phone: '9876543212',
      email: 'amit.kumar@example.com',
      enrollmentNumber: 'ENR-2026-0003'
    },
    {
      fullName: 'Sunita Yadav',
      fatherName: 'Mahesh Yadav',
      dob: '2003-02-18',
      gender: 'FEMALE',
      aadhaar: '567890123456',
      phone: '9876543213',
      email: 'sunita.yadav@example.com',
      enrollmentNumber: 'ENR-2026-0004'
    },
    {
      fullName: 'Vikram Singh',
      fatherName: 'Dharmendra Singh',
      dob: '1999-07-29',
      gender: 'MALE',
      aadhaar: '678901234567',
      phone: '9876543214',
      email: 'vikram.singh@example.com',
      enrollmentNumber: 'ENR-2026-0005'
    }
  ];

  // Insert Rows 2 to 6 with Sample Data
  sampleCandidates.forEach((cand, idx) => {
    const row = rosterSheet.addRow(cand);
    row.height = 24;
    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF172B3A' } };
      cell.alignment = {
        vertical: 'middle',
        horizontal: colNumber === 1 || colNumber === 2 || colNumber === 7 ? 'left' : 'center'
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
      // Explicit text format for Aadhaar and Phone to prevent scientific notation (2.34E+11)
      if (colNumber === 5 || colNumber === 6) {
        cell.numFmt = '@';
      }
    });
  });

  // Pre-format Rows 7 to 30 as empty rows ready for immediate typing
  for (let i = 7; i <= 30; i++) {
    const row = rosterSheet.addRow({
      fullName: '',
      fatherName: '',
      dob: '',
      gender: '',
      aadhaar: '',
      phone: '',
      email: '',
      enrollmentNumber: ''
    });
    row.height = 22;
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF172B3A' } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
      if (colNumber === 5 || colNumber === 6) {
        cell.numFmt = '@';
      }
    });
  }

  // Add Gender Data Validation Dropdown for rows 2 to 100
  for (let r = 2; r <= 100; r++) {
    rosterSheet.getCell(`D${r}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"MALE,FEMALE,OTHER"'],
      showErrorMessage: true,
      errorTitle: 'Invalid Gender',
      error: 'Please choose MALE, FEMALE, or OTHER from the dropdown.'
    };
  }

  // ==========================================
  // SHEET 2: Instructions (Clear Quick Guide)
  // ==========================================
  const guideSheet = workbook.addWorksheet('Instructions');
  guideSheet.columns = [
    { width: 14 },
    { width: 26 },
    { width: 48 },
    { width: 24 },
  ];

  const titleRow = guideSheet.addRow(['HOW & WHERE TO ENTER CANDIDATE DATA', '', '', '']);
  guideSheet.mergeCells('A1:D1');
  titleRow.height = 32;
  titleRow.getCell(1).font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
  titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF163A5F' } };
  titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };

  guideSheet.addRow([]);

  const stepRows = [
    ['Step 1', 'Open Sheet 1 ("Candidate Roster")', 'This is where candidate records are entered.', 'Sheet 1'],
    ['Step 2', 'Row 1 Column Headers', 'Row 1 contains the 8 fixed column headers. Do not modify or delete Row 1.', 'Row 1'],
    ['Step 3', 'Rows 2–6 Sample Data', 'Rows 2 to 6 show valid sample values. Replace or overwrite these rows with your candidates.', 'Rows 2–6'],
    ['Step 4', 'Row 7 Onwards Empty Rows', 'Enter additional enrolled candidates in Row 7 and downwards.', 'Row 7 downwards'],
    ['Step 5', 'Save & Upload', 'Save this file (.xlsx) and drag-and-drop into CertiFlow Training Centre portal.', 'Upload .xlsx'],
  ];

  stepRows.forEach((row) => {
    const r = guideSheet.addRow(row);
    r.height = 24;
    r.eachCell((cell, colNum) => {
      cell.font = { name: 'Calibri', size: 10, bold: colNum === 1 };
      cell.alignment = { vertical: 'middle', horizontal: colNum === 1 || colNum === 4 ? 'center' : 'left' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFDCE3EA' } },
        bottom: { style: 'thin', color: { argb: 'FFDCE3EA' } },
        left: { style: 'thin', color: { argb: 'FFDCE3EA' } },
        right: { style: 'thin', color: { argb: 'FFDCE3EA' } },
      };
    });
  });

  guideSheet.addRow([]);
  const guideHeader = guideSheet.addRow(['Column Name', 'Format / Type', 'NCVET Validation Rules', 'Valid Sample Value']);
  guideHeader.height = 24;
  guideHeader.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF245B85' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const guideRows = [
    ['fullName', 'Text', 'Full legal candidate name as on official identity card', 'Rahul Verma'],
    ['fatherName', 'Text', "Father's or legal guardian's name", 'Suresh Verma'],
    ['dob', 'YYYY-MM-DD', 'Date of birth in standard ISO format (Minimum 14 years old)', '2001-05-14'],
    ['gender', 'Dropdown', 'Choose MALE, FEMALE, or OTHER from dropdown list', 'MALE'],
    ['aadhaar', '12 Digits (Text)', '12-digit Indian National Identity Number (No spaces or dashes)', '234567890123'],
    ['phone', '10 Digits (Text)', '10-digit mobile number for WhatsApp certificate delivery', '9876543210'],
    ['email', 'Email Address', 'Valid email address for digital verifiable certificate notification', 'rahul.verma@example.com'],
    ['enrollmentNumber', 'Alphanumeric', 'Unique candidate roll number assigned by training centre', 'ENR-2026-0001'],
  ];

  guideRows.forEach((row) => {
    const r = guideSheet.addRow(row);
    r.height = 22;
    r.eachCell((cell, colNum) => {
      cell.font = { name: 'Calibri', size: 9 };
      cell.alignment = { vertical: 'middle', horizontal: colNum === 1 || colNum === 4 ? 'center' : 'left' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFDCE3EA' } },
        bottom: { style: 'thin', color: { argb: 'FFDCE3EA' } },
        left: { style: 'thin', color: { argb: 'FFDCE3EA' } },
        right: { style: 'thin', color: { argb: 'FFDCE3EA' } },
      };
    });
  });

  // Ensure public directories exist
  const publicDir = path.resolve(__dirname, '../apps/frontend/public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const distDir = path.resolve(__dirname, '../apps/frontend/dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const targets = [
    path.resolve(__dirname, '../CertiFlow_Batch_Upload_Template.xlsx'),
    path.resolve(__dirname, '../sample_candidate_roster.xlsx'),
    path.join(publicDir, 'CertiFlow_Batch_Upload_Template.xlsx'),
    path.join(publicDir, 'sample_candidate_roster.xlsx'),
    path.join(distDir, 'CertiFlow_Batch_Upload_Template.xlsx'),
    path.join(distDir, 'sample_candidate_roster.xlsx'),
  ];

  for (const t of targets) {
    await workbook.xlsx.writeFile(t);
    console.log(`Saved: ${t}`);
  }

  console.log('All Excel templates generated with full sample candidate rows successfully.');
}

generateCompleteTemplate().catch(console.error);

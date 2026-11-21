const ExcelJS = require('exceljs');
const path = require('path');

async function generateSimpleTemplate() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CertiFlow Skilling Platform';
  workbook.created = new Date();
  workbook.views = [{ activeTab: 0, firstSheet: 0 }];

  // ==========================================
  // SHEET 1: Candidate Roster (Fill Here)
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
    { header: 'email', key: 'email', width: 28 },
    { header: 'enrollmentNumber', key: 'enrollmentNumber', width: 20 },
  ];

  // Style Header Row (Row 1)
  const headerRow = rosterSheet.getRow(1);
  headerRow.height = 30;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF163A5F' }
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFDCE3EA' } },
      bottom: { style: 'medium', color: { argb: 'FFC49A3A' } },
      left: { style: 'thin', color: { argb: 'FFDCE3EA' } },
      right: { style: 'thin', color: { argb: 'FFDCE3EA' } },
    };
  });

  // Row 2: Initial editable starter row clearly indicating where to enter candidate 1
  const starterRow = rosterSheet.addRow({
    fullName: 'Rahul Verma',
    fatherName: 'Suresh Verma',
    dob: '2001-05-14',
    gender: 'MALE',
    aadhaar: '234567890123',
    phone: '9876543210',
    email: 'rahul.verma@example.com',
    enrollmentNumber: 'ENR-2026-0001'
  });
  starterRow.height = 24;
  starterRow.eachCell((cell, colNumber) => {
    cell.font = { name: 'Arial', size: 10, color: { argb: 'FF172B3A' } };
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
    if (colNumber === 5 || colNumber === 6) cell.numFmt = '@';
  });

  // Pre-format Rows 3 to 25 so users can immediately type candidate 2, candidate 3, etc.
  for (let i = 2; i <= 25; i++) {
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
      cell.font = { name: 'Arial', size: 10, color: { argb: 'FF172B3A' } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
      if (colNumber === 5 || colNumber === 6) cell.numFmt = '@';
    });
  }

  // Add Data Validation dropdown for Gender column (MALE, FEMALE, OTHER)
  for (let r = 2; r <= 30; r++) {
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
  // SHEET 2: Instructions & Where to Enter Data
  // ==========================================
  const guideSheet = workbook.addWorksheet('Instructions');
  guideSheet.columns = [
    { width: 22 },
    { width: 18 },
    { width: 45 },
    { width: 25 },
  ];

  const titleRow = guideSheet.addRow(['HOW & WHERE TO ENTER CANDIDATE DATA', '', '', '']);
  guideSheet.mergeCells('A1:D1');
  titleRow.height = 32;
  titleRow.getCell(1).font = { name: 'Arial', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
  titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF163A5F' } };
  titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };

  guideSheet.addRow([]);

  const stepRows = [
    ['Step 1', 'Open Sheet 1 ("Candidate Roster")', 'This is where you type or paste candidate data.', 'Sheet 1'],
    ['Step 2', 'Keep Row 1 Column Headers', 'Row 1 contains the 8 required column names. Do not edit Row 1.', 'Row 1'],
    ['Step 3', 'Enter Data Starting at Row 2', 'Start typing candidate 1 in Row 2, candidate 2 in Row 3, etc.', 'Row 2 downwards'],
    ['Step 4', 'Skip or Replace Example Data', 'Replace any sample row with your actual candidate information.', 'Real Data Only'],
    ['Step 5', 'Save & Upload to CertiFlow', 'Save this file and upload it in the Training Centre dashboard.', '.xlsx file'],
  ];

  stepRows.forEach((row) => {
    const r = guideSheet.addRow(row);
    r.height = 24;
    r.eachCell((cell, colNum) => {
      cell.font = { name: 'Arial', size: 10, bold: colNum === 1 };
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
  const guideHeader = guideSheet.addRow(['Column Name', 'Format', 'Validation Rules', 'Sample Value']);
  guideHeader.height = 24;
  guideHeader.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF245B85' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const guideRows = [
    ['fullName', 'Text', 'Candidate full legal name', 'Rahul Verma'],
    ['fatherName', 'Text', "Father's or legal guardian's name", 'Suresh Verma'],
    ['dob', 'YYYY-MM-DD', 'Date of birth (ISO format, minimum 14 years old)', '2001-05-14'],
    ['gender', 'Dropdown', 'MALE, FEMALE, or OTHER (Select from dropdown)', 'MALE'],
    ['aadhaar', '12 Digits', '12-digit Indian national identity number (Text format)', '234567890123'],
    ['phone', '10 Digits', '10-digit mobile number for WhatsApp credentials', '9876543210'],
    ['email', 'Valid Email', 'Email address for digital copy delivery', 'rahul.verma@example.com'],
    ['enrollmentNumber', 'String', 'Unique training centre registration ID', 'ENR-2026-0001'],
  ];

  guideRows.forEach((row) => {
    const r = guideSheet.addRow(row);
    r.height = 20;
    r.eachCell((cell, colNum) => {
      cell.font = { name: 'Arial', size: 9 };
      cell.alignment = { vertical: 'middle', horizontal: colNum === 1 || colNum === 4 ? 'center' : 'left' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFDCE3EA' } },
        bottom: { style: 'thin', color: { argb: 'FFDCE3EA' } },
        left: { style: 'thin', color: { argb: 'FFDCE3EA' } },
        right: { style: 'thin', color: { argb: 'FFDCE3EA' } },
      };
    });
  });

  const publicPath = path.resolve(__dirname, '../apps/frontend/public/CertiFlow_Batch_Upload_Template.xlsx');
  const rootTemplatePath = path.resolve(__dirname, '../CertiFlow_Batch_Upload_Template.xlsx');
  const rootSamplePath = path.resolve(__dirname, '../sample_candidate_roster.xlsx');

  await workbook.xlsx.writeFile(publicPath);
  await workbook.xlsx.writeFile(rootTemplatePath);
  await workbook.xlsx.writeFile(rootSamplePath);

  console.log('Template generated successfully.');
}

generateSimpleTemplate().catch(console.error);

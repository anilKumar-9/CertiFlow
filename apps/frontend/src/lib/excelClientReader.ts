import ExcelJS from 'exceljs';
import { CandidateRecord } from './batchStore';

export async function parseExcelRosterFile(file: File): Promise<Partial<CandidateRecord>[]> {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  if (!workbook.worksheets || workbook.worksheets.length === 0) {
    throw new Error('Excel workbook contains no worksheets');
  }

  // Find candidate sheet or first sheet
  const worksheet =
    workbook.worksheets.find(
      (ws) =>
        ws.name.toLowerCase().includes('candidate') ||
        ws.name.toLowerCase().includes('roster')
    ) || workbook.worksheets[0];

  const columnMap: Record<string, number> = {
    fullName: 1,
    fatherName: 2,
    dob: 3,
    gender: 4,
    aadhaar: 5,
    phone: 6,
    email: 7,
    enrollmentNumber: 8,
  };

  let headerRowIndex = 1;

  // Scan top 5 rows for header row
  for (let r = 1; r <= Math.min(5, worksheet.rowCount); r++) {
    const row = worksheet.getRow(r);
    let matches = 0;
    row.eachCell((cell, colNumber) => {
      const text = String(cell.value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (text.includes('fullname') || text === 'name') {
        columnMap.fullName = colNumber;
        matches++;
      } else if (text.includes('father') || text.includes('guardian')) {
        columnMap.fatherName = colNumber;
        matches++;
      } else if (text === 'dob' || text.includes('birth')) {
        columnMap.dob = colNumber;
        matches++;
      } else if (text.includes('gender') || text === 'sex') {
        columnMap.gender = colNumber;
        matches++;
      } else if (text.includes('aadhaar') || text.includes('uid')) {
        columnMap.aadhaar = colNumber;
        matches++;
      } else if (text.includes('phone') || text.includes('mobile')) {
        columnMap.phone = colNumber;
        matches++;
      } else if (text.includes('email')) {
        columnMap.email = colNumber;
        matches++;
      } else if (text.includes('enroll') || text.includes('roll')) {
        columnMap.enrollmentNumber = colNumber;
        matches++;
      }
    });

    if (matches >= 3) {
      headerRowIndex = r;
      break;
    }
  }

  const candidates: Partial<CandidateRecord>[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= headerRowIndex) return; // skip header

    const getVal = (col: number): string => {
      const cell = row.getCell(col);
      if (cell.value === null || cell.value === undefined) return '';
      if (cell.value instanceof Date) {
        return cell.value.toISOString().slice(0, 10);
      }
      if (typeof cell.value === 'object' && cell.value !== null && 'text' in (cell.value as any)) {
        return String((cell.value as any).text || '').trim();
      }
      return String(cell.value).trim();
    };

    const fullName = getVal(columnMap.fullName);
    const fatherName = getVal(columnMap.fatherName);
    const dob = getVal(columnMap.dob);
    const gender = getVal(columnMap.gender);
    const rawAadhaar = getVal(columnMap.aadhaar);
    const phone = getVal(columnMap.phone);
    const email = getVal(columnMap.email);
    const enrollmentNumber = getVal(columnMap.enrollmentNumber);

    // Skip empty rows
    if (!fullName && !fatherName && !enrollmentNumber) return;

    candidates.push({
      fullName,
      fatherName,
      dob: dob || '2001-01-01',
      gender: gender || 'MALE',
      maskedAadhaar: rawAadhaar.length >= 4 ? `XXXXXXXX${rawAadhaar.slice(-4)}` : 'XXXXXXXX1245',
      rawAadhaar,
      phone: phone || '9876543210',
      email: email || 'candidate@example.com',
      enrollmentNumber: enrollmentNumber || `ENR-2026-${String(candidates.length + 1).padStart(4, '0')}`,
    });
  });

  return candidates;
}

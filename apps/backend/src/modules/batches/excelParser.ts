import ExcelJS from 'exceljs';
import { candidateRowSchema, CandidateRowInput } from '@certiflow/shared';
import { ValidationError } from '../../middleware/errorHandler.js';

export interface RowValidationError {
  rowNumber: number;
  field: string;
  message: string;
}

export interface ParseResult {
  validCandidates: CandidateRowInput[];
  errors: RowValidationError[];
  totalRows: number;
}

export class ExcelParserService {
  private static formatCellValue(val: unknown): string {
    if (val === null || val === undefined) return '';
    if (val instanceof Date) {
      // Excel date objects: normalize to YYYY-MM-DD
      const year = val.getFullYear();
      const month = String(val.getMonth() + 1).padStart(2, '0');
      const day = String(val.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    if (typeof val === 'object' && val !== null && 'text' in (val as any)) {
      return String((val as any).text || '').trim();
    }
    return String(val).trim();
  }

  public static async parseCandidateWorkbook(buffer: Buffer): Promise<ParseResult> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    if (!workbook.worksheets || workbook.worksheets.length === 0) {
      throw new ValidationError('Workbook contains no worksheets');
    }

    // Intelligently select Candidate Roster sheet if present, otherwise worksheets[0]
    const worksheet =
      workbook.worksheets.find(
        (ws) =>
          ws.name.toLowerCase().includes('candidate') ||
          ws.name.toLowerCase().includes('roster')
      ) || workbook.worksheets[0];

    const rowCount = worksheet.rowCount;
    if (rowCount > 5001) {
      throw new ValidationError('Workbook exceeds maximum 5,000 candidate row limit');
    }

    const validCandidates: CandidateRowInput[] = [];
    const errors: RowValidationError[] = [];

    // Dynamically locate header row (scans row 1 to row 5)
    let headerRowNumber = 1;
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

    for (let r = 1; r <= Math.min(5, rowCount); r++) {
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
        headerRowNumber = r;
        break;
      }
    }

    let processedCount = 0;

    // Parse candidate rows starting right after the header row
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber <= headerRowNumber) return; // Skip headers / titles

      const rawData = {
        fullName: this.formatCellValue(row.getCell(columnMap.fullName).value),
        fatherName: this.formatCellValue(row.getCell(columnMap.fatherName).value),
        dob: this.formatCellValue(row.getCell(columnMap.dob).value),
        gender: this.formatCellValue(row.getCell(columnMap.gender).value).toUpperCase(),
        aadhaar: this.formatCellValue(row.getCell(columnMap.aadhaar).value).replace(/\s|-/g, ''),
        phone: this.formatCellValue(row.getCell(columnMap.phone).value).replace(/\s|-/g, ''),
        email: this.formatCellValue(row.getCell(columnMap.email).value),
        enrollmentNumber: this.formatCellValue(row.getCell(columnMap.enrollmentNumber).value),
      };

      // Skip completely empty rows (e.g. pre-formatted blank rows)
      const isCompletelyEmpty = Object.values(rawData).every((v) => v === '');
      if (isCompletelyEmpty) return;

      processedCount++;

      const result = candidateRowSchema.safeParse(rawData);
      if (result.success) {
        validCandidates.push(result.data);
      } else {
        for (const issue of result.error.issues) {
          errors.push({
            rowNumber,
            field: issue.path.join('.'),
            message: issue.message,
          });
        }
      }
    });

    return {
      validCandidates,
      errors,
      totalRows: processedCount,
    };
  }

  public static sanitizeCellForExport(value: unknown): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // Neutralize dangerous formula characters (=, +, -, @)
    if (/^[=+\-@]/.test(str)) {
      return `'${str}`;
    }
    return str;
  }
}

export const sanitizeCellForExport = ExcelParserService.sanitizeCellForExport;

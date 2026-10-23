// ============================================================
// Excel Parser Service – Batch Employee & Letter Data Upload
// ============================================================
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import type { BatchRow, TemplateField } from '../types';

export interface ParsedExcelResult {
  headers: string[];
  rawRows: Record<string, any>[];
  batchRows: BatchRow[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
}

// Canonical column mapping (all lowercase and trimmed)
const COLUMN_ALIASES: Record<string, string> = {
  // Employee name
  'full name': 'employee_name',
  'fullname': 'employee_name',
  'employee name': 'employee_name',
  'employeename': 'employee_name',
  'name': 'employee_name',

  // Employee ID
  'employee id': 'employee_id',
  'employeeid': 'employee_id',
  'emp id': 'employee_id',
  'empid': 'employee_id',
  'staff id': 'employee_id',
  'id': 'employee_id',

  // Letter Date
  'letter date': 'letter_date',
  'letterdate': 'letter_date',
  'date of issue': 'letter_date',
  'issue date': 'letter_date',
  'date': 'letter_date',

  // Effective Date
  'effective date': 'effective_date',
  'effectivedate': 'effective_date',
  'date from which affected': 'effective_date',
  'start date': 'effective_date',
  'from date': 'effective_date',

  // Period / PIP Duration
  'time period': 'period',
  'pip period': 'period',
  'period': 'period',
  'duration': 'period',
  'period months': 'period',
  'period days': 'period',
  'pip duration': 'period',

  // Role & Org
  'designation': 'designation',
  'role': 'designation',
  'title': 'designation',
  'department': 'department',
  'dept': 'department',

  // Contact & Manager
  'email': 'employee_email',
  'employee email': 'employee_email',
  'phone': 'employee_phone',
  'reason': 'reason_for_letter',
  'reporting manager': 'reporting_manager',
  'manager': 'reporting_manager',
  'salary': 'revised_salary',
  'last working day': 'last_working_day',
  'notice period': 'notice_period',
};

function formatExcelDate(raw: any): string {
  if (!raw) return '';
  const str = String(raw).trim();
  if (!str) return '';

  // Try dayjs parsing
  const parsed = dayjs(str);
  if (parsed.isValid() && parsed.year() > 2000) {
    return parsed.format('DD MMMM YYYY');
  }
  return str;
}

function formatPeriod(raw: any): string {
  if (raw === undefined || raw === null) return '';
  const str = String(raw).trim();
  if (!str) return '';
  // If it's just a number like "8" or "30", format as "8 Days" / "30 Days"
  if (/^\d+$/.test(str)) {
    return `${str} Days`;
  }
  return str;
}

export async function parseExcelFile(file: File): Promise<ParsedExcelResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });

        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          throw new Error('Excel workbook contains no sheets');
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          defval: '',
        });

        if (jsonRows.length === 0) {
          resolve({
            headers: [],
            rawRows: [],
            batchRows: [],
            totalRows: 0,
            validRows: 0,
            invalidRows: 0,
          });
          return;
        }

        const originalHeaders = Object.keys(jsonRows[0]);
        const batchRows: BatchRow[] = [];
        let validCount = 0;
        let invalidCount = 0;

        jsonRows.forEach((row, index) => {
          const normalizedData: Record<string, string> = {};
          const errors: string[] = [];

          // Map columns to canonical keys (trimming trailing spaces)
          for (const [key, val] of Object.entries(row)) {
            const cleanKey = key.trim().toLowerCase();
            const canonicalKey = COLUMN_ALIASES[cleanKey] || cleanKey.replace(/\s+/g, '_');
            const cleanVal = val !== undefined && val !== null ? String(val).trim() : '';

            if (canonicalKey === 'letter_date' || canonicalKey === 'effective_date') {
              normalizedData[canonicalKey] = formatExcelDate(cleanVal);
            } else if (canonicalKey === 'period') {
              normalizedData[canonicalKey] = formatPeriod(cleanVal);
            } else {
              normalizedData[canonicalKey] = cleanVal;
            }
          }

          // Validation & Defaults
          if (!normalizedData.employee_name) {
            errors.push('Employee name is required');
          }

          // If Employee ID is missing, provide a fallback or keep NA
          if (!normalizedData.employee_id) {
            normalizedData.employee_id = `ESL-NA-${String(index + 1).padStart(3, '0')}`;
          }

          // If Letter Date is missing, default to today
          if (!normalizedData.letter_date) {
            normalizedData.letter_date = dayjs().format('DD MMMM YYYY');
          }

          // If Effective Date is missing, default to letter date
          if (!normalizedData.effective_date) {
            normalizedData.effective_date = normalizedData.letter_date;
          }

          // If Time period is missing, default
          if (!normalizedData.period) {
            normalizedData.period = '30 Days';
          }

          const isValid = errors.length === 0;
          if (isValid) {
            validCount++;
          } else {
            invalidCount++;
          }

          batchRows.push({
            rowNumber: index + 1,
            data: normalizedData,
            status: isValid ? 'valid' : 'invalid',
            errors,
          });
        });

        resolve({
          headers: originalHeaders,
          rawRows: jsonRows,
          batchRows,
          totalRows: jsonRows.length,
          validRows: validCount,
          invalidRows: invalidCount,
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Generate a downloadable sample Excel file
 */
export function generateSampleExcel(customFields?: TemplateField[]): Blob {
  const sampleData = [
    {
      'Employee ID': 'ESL070',
      'Full Name': 'Raiba Tabassum',
      'Letter date': '23 October 2026',
      'Effective Date': '24 October 2026',
      'Time Period': '8 Days',
      'Department': 'Operations',
      'Designation': 'Customer Service Execuitive',
    },
    {
      'Employee ID': 'ESL021',
      'Full Name': 'Sufia Khatoon',
      'Letter date': '23 October 2026',
      'Effective Date': '24 October 2026',
      'Time Period': '8 Days',
      'Department': 'Operations',
      'Designation': 'Customer Service Execuitive',
    },
    {
      'Employee ID': 'ESL028',
      'Full Name': 'Tanisha Roy',
      'Letter date': '23 October 2026',
      'Effective Date': '24 October 2026',
      'Time Period': '8 Days',
      'Department': 'Operations',
      'Designation': 'Customer Support Executive',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Employee Details');

  worksheet['!cols'] = [
    { wch: 15 }, // Employee ID
    { wch: 25 }, // Full Name
    { wch: 20 }, // Letter date
    { wch: 20 }, // Effective Date
    { wch: 15 }, // Time Period
    { wch: 18 }, // Department
    { wch: 30 }, // Designation
  ];

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

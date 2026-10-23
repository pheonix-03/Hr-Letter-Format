// ============================================================
// Dexie.js IndexedDB Database – HR Letter Generator
// ============================================================
import Dexie, { type Table } from 'dexie';
import { v4 as uuidv4 } from 'uuid';
import type {
  User,
  Company,
  Branch,
  Signatory,
  BrandingConfig,
  LetterheadConfig,
  Employee,
  HRTemplate,
  GeneratedDocument,
  DocumentRevision,
  ApprovalWorkflow,
  ApprovalRecord,
  EmployeeBatch,
  AuditLog,
  ReferenceSequence,
  AbsenceRecord,
  TerminationWorkflow,
  AppSettings,
} from '../types';

// ---- Extended AppSettings row (keyed for storage) ----
export interface AppSettingsRow extends AppSettings {
  id: string;
}

// ---- Database class ----
export class HRLetterGeneratorDB extends Dexie {
  users!: Table<User, string>;
  companies!: Table<Company, string>;
  branches!: Table<Branch, string>;
  signatories!: Table<Signatory, string>;
  brandingConfigs!: Table<BrandingConfig, string>;
  letterheads!: Table<LetterheadConfig, string>;
  employees!: Table<Employee, string>;
  templates!: Table<HRTemplate, string>;
  documents!: Table<GeneratedDocument, string>;
  documentRevisions!: Table<DocumentRevision, string>;
  approvalWorkflows!: Table<ApprovalWorkflow, string>;
  approvalRecords!: Table<ApprovalRecord, string>;
  employeeBatches!: Table<EmployeeBatch, string>;
  auditLogs!: Table<AuditLog, string>;
  referenceSequences!: Table<ReferenceSequence, string>;
  absenceRecords!: Table<AbsenceRecord, string>;
  terminationWorkflows!: Table<TerminationWorkflow, string>;
  appSettings!: Table<AppSettingsRow, string>;

  constructor() {
    super('HRLetterGeneratorDB');

    this.version(1).stores({
      // ---- Auth & Users ----
      users: 'id, email, role, isActive',

      // ---- Companies ----
      companies: 'id, legalName, tradeName, country',

      // ---- Branches ----
      branches: 'id, companyId, name, city, isHeadquarters',

      // ---- Signatories ----
      signatories: 'id, companyId, isActive, department',

      // ---- Branding ----
      brandingConfigs: 'id, companyId',

      // ---- Letterheads ----
      letterheads: 'id, companyId, preset, isActive, isDefault',

      // ---- Employees ----
      employees: 'id, companyId, employeeId, email, department, designation, status, fullName',

      // ---- Templates ----
      templates: 'id, companyId, category, subcategory, isGlobal, isDefault, createdBy, [companyId+category]',

      // ---- Documents ----
      documents: 'id, companyId, templateId, employeeId, status, category, referenceNumber, createdBy, letterDate, [companyId+status], [companyId+category]',

      // ---- Document Revisions ----
      documentRevisions: 'id, documentId, version, changedBy',

      // ---- Approval Workflows ----
      approvalWorkflows: 'id, companyId, documentId, status, templateCategory, currentLevel',

      // ---- Approval Records ----
      approvalRecords: 'id, workflowId, documentId, approverId, action, timestamp',

      // ---- Employee Batches ----
      employeeBatches: 'id, companyId, status, templateId, uploadedBy',

      // ---- Audit Logs ----
      auditLogs: 'id, companyId, userId, action, entityType, entityId, timestamp',

      // ---- Reference Sequences ----
      referenceSequences: 'id, companyId, prefix, [companyId+prefix]',

      // ---- Absence Records ----
      absenceRecords: 'id, companyId, employeeId, status, createdBy',

      // ---- Termination Workflows ----
      terminationWorkflows: 'id, companyId, employeeId, category, status, createdBy',

      // ---- App Settings ----
      appSettings: 'id',
    });
  }
}

// ---- Singleton instance ----
export const db = new HRLetterGeneratorDB();

// ============================================================
// Helper utilities
// ============================================================

/**
 * Generate a new v4 UUID.
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Return the current timestamp as an ISO 8601 string.
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Generate a formatted reference number for a document.
 *
 * Format: {prefix}/{YYYY}/{SEQ:4}
 * Example: ACME/HR/2026/0001
 *
 * Automatically creates / increments the sequence stored in IndexedDB.
 */
export async function generateReferenceNumber(
  companyId: string,
  prefix: string,
  _category: string,
): Promise<string> {
  const currentYear = new Date().getFullYear();

  // Wrap in a transaction so concurrent calls are serialised
  return await db.transaction('rw', db.referenceSequences, async () => {
    let seq = await db.referenceSequences
      .where('[companyId+prefix]')
      .equals([companyId, prefix])
      .first();

    if (!seq) {
      // First time – create the sequence
      seq = {
        id: generateId(),
        companyId,
        prefix,
        currentNumber: 0,
        format: '{prefix}/{YYYY}/{SEQ:4}',
        fiscalYearStart: 4, // April
        lastReset: getCurrentTimestamp(),
      };
    }

    // Check if the year rolled over and reset the counter
    const lastResetYear = new Date(seq.lastReset).getFullYear();
    if (lastResetYear < currentYear) {
      seq.currentNumber = 0;
      seq.lastReset = getCurrentTimestamp();
    }

    seq.currentNumber += 1;

    // Upsert
    await db.referenceSequences.put(seq);

    // Build the formatted reference string
    const paddedSeq = String(seq.currentNumber).padStart(4, '0');
    return `${prefix}/${currentYear}/${paddedSeq}`;
  });
}

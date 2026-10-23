// ============================================================
// Universal HR Letter Generator – Core Type Definitions
// ============================================================

// ---- Auth & Users ----
export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  companyIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'super_admin' | 'admin' | 'hr_manager' | 'hr_user' | 'approver' | 'viewer';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  currentCompanyId: string | null;
}

// ---- Companies ----
export interface Company {
  id: string;
  legalName: string;
  tradeName: string;
  logoUrl: string;
  registeredAddress: string;
  corporateAddress: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  officialEmail: string;
  hrEmail: string;
  contactNumber: string;
  website: string;
  registrationNumber: string;
  taxId: string;
  authorizedSignatoryName: string;
  authorizedSignatoryDesignation: string;
  hrRepName: string;
  hrRepDesignation: string;
  sealImageUrl: string;
  defaultLanguage: string;
  defaultDateFormat: string;
  defaultCurrency: string;
  defaultFooter: string;
  confidentialityNotice: string;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: string;
  companyId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  isHeadquarters: boolean;
  createdAt: string;
}

export interface Signatory {
  id: string;
  companyId: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  signatureImageUrl: string;
  isActive: boolean;
  createdAt: string;
}

// ---- Branding & Letterhead ----
export interface BrandingConfig {
  id: string;
  companyId: string;
  primaryFont: string;
  secondaryFont: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontColor: string;
  fontSize: number;
  headerHeight: number;
  footerHeight: number;
  createdAt: string;
  updatedAt: string;
}

export type LetterheadPreset =
  | 'corporate_minimal'
  | 'traditional_corporate'
  | 'modern_professional'
  | 'formal_legal'
  | 'clean_hr'
  | 'executive'
  | 'simple_bw'
  | 'custom';

export interface LetterheadConfig {
  id: string;
  companyId: string;
  name: string;
  preset: LetterheadPreset;
  isActive: boolean;
  isDefault: boolean;

  // Page settings
  pageSize: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;

  // Header
  headerEnabled: boolean;
  headerHeight: number;
  headerBackgroundColor: string;
  headerBorderBottom: boolean;
  headerBorderColor: string;
  headerBorderWidth: number;

  // Logo
  logoEnabled: boolean;
  logoUrl: string;
  logoWidth: number;
  logoHeight: number;
  logoPosition: 'left' | 'center' | 'right';
  logoOffsetX: number;
  logoOffsetY: number;

  // Company name in header
  companyNameEnabled: boolean;
  companyNameFontFamily: string;
  companyNameFontSize: number;
  companyNameFontColor: string;
  companyNameFontWeight: 'normal' | 'bold';
  companyNameAlignment: 'left' | 'center' | 'right';

  // Address block
  addressEnabled: boolean;
  addressFontFamily: string;
  addressFontSize: number;
  addressFontColor: string;
  addressAlignment: 'left' | 'center' | 'right';
  addressContent: string;

  // Contact line
  contactEnabled: boolean;
  contactFontSize: number;
  contactFontColor: string;
  contactContent: string;

  // Registration info
  registrationEnabled: boolean;
  registrationContent: string;
  registrationFontSize: number;

  // Separator line
  separatorEnabled: boolean;
  separatorColor: string;
  separatorWidth: number;
  separatorStyle: 'solid' | 'dashed' | 'dotted' | 'double';

  // Footer
  footerEnabled: boolean;
  footerHeight: number;
  footerContent: string;
  footerFontSize: number;
  footerFontColor: string;
  footerAlignment: 'left' | 'center' | 'right';
  footerBorderTop: boolean;
  footerBorderColor: string;

  // Page numbers
  pageNumberEnabled: boolean;
  pageNumberPosition: 'header-right' | 'footer-center' | 'footer-right';
  pageNumberFormat: 'Page X' | 'Page X of Y' | 'X' | 'X/Y';

  // Confidentiality notice
  confidentialityEnabled: boolean;
  confidentialityText: string;

  // Reference number
  referenceNumberEnabled: boolean;
  referenceNumberPrefix: string;
  referenceNumberFormat: string;

  // Different first page
  differentFirstPage: boolean;
  subsequentHeaderHeight: number;
  subsequentLogoEnabled: boolean;

  // Background
  backgroundImageUrl: string;
  backgroundOpacity: number;

  // Body defaults
  bodyFontFamily: string;
  bodyFontSize: number;
  bodyFontColor: string;
  bodyLineHeight: number;

  // Seal configuration
  sealMode?: 'full_name' | 'line' | 'none';

  createdAt: string;
  updatedAt: string;
}

// ---- Employees ----
export interface Employee {
  id: string;
  companyId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  designation: string;
  department: string;
  reportingManager: string;
  joiningDate: string;
  dateOfBirth: string;
  gender: string;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'intern' | 'temporary';
  probationEndDate: string;
  salary: string;
  bankDetails: string;
  emergencyContact: string;
  status: 'active' | 'on_notice' | 'separated' | 'suspended' | 'absconding';
  lastWorkingDay: string;
  noticePeriodDays: number;
  additionalInfo: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

// ---- Templates ----
export type TemplateCategory =
  | 'employment_onboarding'
  | 'resignation_separation'
  | 'disciplinary_performance'
  | 'general_hr'
  | 'custom';

export interface TemplateField {
  key: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'textarea' | 'select' | 'currency';
  required: boolean;
  defaultValue: string;
  options?: string[];
  helpText?: string;
  group?: string;
  conditional?: {
    dependsOn: string;
    values: string[];
  };
}

export interface TemplateParagraph {
  id: string;
  content: string;
  order: number;
  isConditional: boolean;
  conditionField?: string;
  conditionValues?: string[];
  style?: 'normal' | 'bold' | 'italic' | 'heading';
}

export interface HRTemplate {
  id: string;
  companyId: string | null; // null = global template
  name: string;
  category: TemplateCategory;
  subcategory: string;
  description: string;
  subject: string;
  content: string; // Full template with {{placeholders}}
  paragraphs: TemplateParagraph[];
  fields: TemplateField[];
  isGlobal: boolean;
  isDefault: boolean;
  version: number;
  previousVersionId: string | null;
  tags: string[];
  requiresApproval: boolean;
  approvalLevels: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Documents ----
export type DocumentStatus = 'draft' | 'under_review' | 'revision_requested' | 'approved' | 'issued' | 'superseded' | 'cancelled';

export interface GeneratedDocument {
  id: string;
  companyId: string;
  templateId: string;
  templateVersion: number;
  templateSnapshot: string; // frozen copy of template at generation time
  employeeId: string;
  letterheadId: string;
  referenceNumber: string;
  title: string;
  category: TemplateCategory;
  status: DocumentStatus;
  filledData: Record<string, string>;
  renderedContent: string;
  docxBlob: string | null; // base64
  pdfBlob: string | null;  // base64
  letterDate: string;
  effectiveDate: string;
  issuedDate: string;
  issuedBy: string;
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRevision {
  id: string;
  documentId: string;
  version: number;
  content: string;
  filledData: Record<string, string>;
  changedBy: string;
  changeReason: string;
  createdAt: string;
}

// ---- Approvals ----
export interface ApprovalWorkflow {
  id: string;
  companyId: string;
  documentId: string;
  templateCategory: TemplateCategory;
  levels: ApprovalLevel[];
  currentLevel: number;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalLevel {
  level: number;
  approverId: string;
  approverName: string;
  approverRole: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  comments: string;
  actionDate: string;
}

export interface ApprovalRecord {
  id: string;
  workflowId: string;
  documentId: string;
  approverId: string;
  approverName: string;
  action: 'approve' | 'reject' | 'request_revision' | 'comment';
  comments: string;
  level: number;
  timestamp: string;
}

// ---- Batch Upload ----
export interface EmployeeBatch {
  id: string;
  companyId: string;
  fileName: string;
  rows: BatchRow[];
  status: 'uploaded' | 'validated' | 'error' | 'generating' | 'generated';
  templateId: string | null;
  totalRows: number;
  validRows: number;
  errorRows: number;
  generatedDocs: number;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BatchRow {
  rowNumber: number;
  data: Record<string, string>;
  status: 'valid' | 'invalid';
  errors: string[];
  documentId?: string;
}

// ---- Audit ----
export interface AuditLog {
  id: string;
  companyId: string;
  userId: string;
  userName: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  details: Record<string, any>;
  ipAddress: string;
  timestamp: string;
}

export type AuditAction =
  | 'create' | 'update' | 'delete'
  | 'view' | 'download' | 'print'
  | 'approve' | 'reject' | 'submit_for_review'
  | 'issue' | 'supersede' | 'cancel'
  | 'login' | 'logout'
  | 'upload' | 'batch_generate';

// ---- Reference Numbers ----
export interface ReferenceSequence {
  id: string;
  companyId: string;
  prefix: string;
  currentNumber: number;
  format: string; // e.g., "{prefix}/{YYYY}/{SEQ:4}"
  fiscalYearStart: number; // month (1-12)
  lastReset: string;
}

// ---- Settings ----
export interface AppSettings {
  theme: 'light' | 'dark';
  language: string;
  dateFormat: string;
  sidebarCollapsed: boolean;
}

// ---- Absence / Absconding workflow ----
export interface AbsenceRecord {
  id: string;
  companyId: string;
  employeeId: string;
  absenceDates: string[];
  contactAttempts: ContactAttempt[];
  policyReference: string;
  responseDeadline: string;
  employeeResponse: string;
  status: 'reported' | 'notice_sent' | 'awaiting_response' | 'response_received' | 'escalated' | 'resolved' | 'terminated';
  escalatedTo: string;
  finalDecision: string;
  relatedDocumentIds: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactAttempt {
  date: string;
  method: 'phone' | 'email' | 'letter' | 'in_person' | 'other';
  details: string;
  responseReceived: boolean;
}

// ---- Termination Workflow ----
export type TerminationCategory =
  | 'disciplinary_process'
  | 'during_probation'
  | 'performance'
  | 'misconduct'
  | 'restructuring_redundancy'
  | 'fixed_term_ending'
  | 'contractual_provision'
  | 'post_investigation'
  | 'mutual_agreement'
  | 'other';

export interface TerminationWorkflow {
  id: string;
  companyId: string;
  employeeId: string;
  category: TerminationCategory;
  templateId: string;
  jurisdiction: string;
  effectiveDate: string;
  lastWorkingDay: string;
  noticePeriod: string;
  noticeArrangement: 'work_through' | 'garden_leave' | 'payment_in_lieu' | 'waived' | 'other';
  paymentInLieu: boolean;
  paymentInLieuAmount: string;
  reason: string;
  priorCommunications: string[];
  handoverRequirements: string;
  propertyReturnInstructions: string;
  confidentialityInstructions: string;
  finalPayProcess: string;
  hrContact: string;
  contractReference: string;
  approvedWording: string;
  status: 'draft' | 'under_review' | 'approved' | 'issued';
  documentId: string | null;
  approvals: ApprovalRecord[];
  warnings: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

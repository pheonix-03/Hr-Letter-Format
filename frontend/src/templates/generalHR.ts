// ============================================================
// General HR Letter Templates
// ============================================================
import type { HRTemplate } from '../types';

export const generalHRTemplates: HRTemplate[] = [
  {
    id: 'tpl_salary_certificate',
    companyId: null,
    name: 'Salary & Earnings Certificate',
    category: 'general_hr',
    subcategory: 'Salary & Compensation',
    description: 'Official income and designation verification letter for bank loans, visas, and rentals.',
    subject: 'TO WHOMSOEVER IT MAY CONCERN – Salary Certificate',
    content: `Date: {{letter_date}}

TO WHOMSOEVER IT MAY CONCERN

This is to certify that {{employee_name}} (Employee ID: {{employee_id}}) is a permanent full-time employee of {{company_name}}, currently working as {{designation}} in our {{department}} department since {{joining_date}}.

As per company payroll records, the current monthly and annual compensation of {{employee_name}} is as follows:

• Basic Salary: {{basic_salary}} per month
• House Rent Allowance (HRA): {{hra_amount}} per month
• Special Allowance: {{special_allowance}} per month
• Gross Monthly Compensation: {{monthly_gross}} per month
• Total Annual Cost to Company (CTC): {{annual_ctc}} per annum

This certificate is issued at the request of the employee for the purpose of {{purpose_of_letter}} and carries no financial liability on part of the Company.

For {{company_name}}

{{authorized_signatory}}
{{signatory_designation}}`,
    paragraphs: [],
    fields: [
      { key: 'employee_name', label: 'Employee Name', type: 'text', required: true, defaultValue: '' },
      { key: 'employee_id', label: 'Employee ID', type: 'text', required: true, defaultValue: '' },
      { key: 'designation', label: 'Designation', type: 'text', required: true, defaultValue: '' },
      { key: 'department', label: 'Department', type: 'text', required: true, defaultValue: '' },
      { key: 'joining_date', label: 'Joining Date', type: 'date', required: true, defaultValue: '' },
      { key: 'basic_salary', label: 'Basic Salary (Monthly)', type: 'text', required: true, defaultValue: '₹25,000/-' },
      { key: 'hra_amount', label: 'HRA (Monthly)', type: 'text', required: true, defaultValue: '₹12,500/-' },
      { key: 'special_allowance', label: 'Special Allowance', type: 'text', required: true, defaultValue: '₹12,500/-' },
      { key: 'monthly_gross', label: 'Gross Monthly Salary', type: 'text', required: true, defaultValue: '₹50,000/-' },
      { key: 'annual_ctc', label: 'Annual CTC', type: 'text', required: true, defaultValue: '₹6,00,000/-' },
      { key: 'purpose_of_letter', label: 'Purpose (e.g. Loan / Visa)', type: 'text', required: true, defaultValue: 'Bank Loan Application' },
    ],
    isGlobal: true,
    isDefault: true,
    version: 1,
    previousVersionId: null,
    tags: ['Salary', 'Earnings', 'Income', 'Certificate', 'Bank', 'Loan'],
    requiresApproval: false,
    approvalLevels: 1,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl_employment_certificate',
    companyId: null,
    name: 'Employment Verification Certificate',
    category: 'general_hr',
    subcategory: 'Employment Verification',
    description: 'Bonafide certificate confirming active employment status, role, and tenure.',
    subject: 'TO WHOMSOEVER IT MAY CONCERN – Proof of Employment',
    content: `Date: {{letter_date}}

TO WHOMSOEVER IT MAY CONCERN

This is to verify and confirm that {{employee_name}} (Employee ID: {{employee_id}}) is currently employed with {{company_name}} as a full-time regular employee.

Key employment particulars are as follows:
• Designation: {{designation}}
• Department: {{department}}
• Employment Commencement Date: {{joining_date}}
• Work Location: {{company_address}}
• Current Status: Active and in good standing

This letter is issued upon the request of the employee for {{purpose_of_letter}} without any commercial liability or guarantee on behalf of {{company_name}}.

For {{company_name}}

{{authorized_signatory}}
{{signatory_designation}}`,
    paragraphs: [],
    fields: [
      { key: 'employee_name', label: 'Employee Name', type: 'text', required: true, defaultValue: '' },
      { key: 'employee_id', label: 'Employee ID', type: 'text', required: true, defaultValue: '' },
      { key: 'designation', label: 'Designation', type: 'text', required: true, defaultValue: '' },
      { key: 'department', label: 'Department', type: 'text', required: true, defaultValue: '' },
      { key: 'joining_date', label: 'Joining Date', type: 'date', required: true, defaultValue: '' },
      { key: 'purpose_of_letter', label: 'Verification Purpose', type: 'text', required: true, defaultValue: 'Official Records Verification' },
    ],
    isGlobal: true,
    isDefault: false,
    version: 1,
    previousVersionId: null,
    tags: ['Employment', 'Bonafide', 'Verification', 'Proof'],
    requiresApproval: false,
    approvalLevels: 1,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl_noc_letter',
    companyId: null,
    name: 'No Objection Certificate (NOC)',
    category: 'general_hr',
    subcategory: 'NOC',
    description: 'No Objection Certificate for passport, visa, higher education, or external exams.',
    subject: 'NO OBJECTION CERTIFICATE',
    content: `Date: {{letter_date}}

TO WHOMSOEVER IT MAY CONCERN

Subject: No Objection Certificate

This is to confirm that {{employee_name}} (Employee ID: {{employee_id}}) is employed with {{company_name}} as {{designation}} in the {{department}} department since {{joining_date}}.

The Company has NO OBJECTION to {{employee_name}} applying for {{purpose_of_letter}} or undertaking travel during the approved period from {{leave_start_date}} to {{leave_end_date}}.

It is understood that {{employee_name}} will resume duties with the Company immediately upon completion of the approved period.

Sincerely,
For {{company_name}}

{{authorized_signatory}}
{{signatory_designation}}`,
    paragraphs: [],
    fields: [
      { key: 'employee_name', label: 'Employee Name', type: 'text', required: true, defaultValue: '' },
      { key: 'employee_id', label: 'Employee ID', type: 'text', required: true, defaultValue: '' },
      { key: 'designation', label: 'Designation', type: 'text', required: true, defaultValue: '' },
      { key: 'department', label: 'Department', type: 'text', required: true, defaultValue: '' },
      { key: 'joining_date', label: 'Joining Date', type: 'date', required: true, defaultValue: '' },
      { key: 'purpose_of_letter', label: 'Purpose of NOC (e.g. Visa/Passport)', type: 'text', required: true, defaultValue: 'Tourist Visa Application' },
      { key: 'leave_start_date', label: 'Approved Travel Start Date', type: 'date', required: false, defaultValue: '' },
      { key: 'leave_end_date', label: 'Approved Travel End Date', type: 'date', required: false, defaultValue: '' },
    ],
    isGlobal: true,
    isDefault: false,
    version: 1,
    previousVersionId: null,
    tags: ['NOC', 'Visa', 'Passport', 'Travel', 'Clearance'],
    requiresApproval: false,
    approvalLevels: 1,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

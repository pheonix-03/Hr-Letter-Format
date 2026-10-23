// ============================================================
// Employment & Onboarding HR Letter Templates
// ============================================================
import type { HRTemplate } from '../types';

export const employmentOnboardingTemplates: HRTemplate[] = [
  {
    id: 'tpl_job_offer',
    companyId: null,
    name: 'Job Offer Letter',
    category: 'employment_onboarding',
    subcategory: 'Offer',
    description: 'Formal employment offer letter detailing role, compensation, and joining expectations.',
    subject: 'Offer of Employment – {{designation}}',
    content: `Date: {{letter_date}}

To,
{{employee_name}}
{{employee_address}}
Email: {{employee_email}}

Subject: Offer of Employment for the position of {{designation}}

Dear {{employee_name}},

We are pleased to offer you the position of {{designation}} in the {{department}} department at {{company_name}} ("Company"). We were impressed by your skills, experience, and potential contribution to our team.

1. Role & Reporting:
You will be based at our office located at {{company_address}} and will report to {{reporting_manager}}, or as designated by the management from time to time.

2. Commencement of Employment:
Your employment will commence on {{joining_date}} or an earlier mutually agreed date ("Effective Date").

3. Compensation & Benefits:
You will receive an annual Gross Compensation of {{annual_ctc}} (Rupees/Currency {{annual_ctc_words}}), payable in accordance with the standard monthly payroll cycle of the Company, subject to statutory deductions.

4. Probation Period:
You will be on probation for an initial period of {{probation_period}}, which may be extended at the discretion of the Company based on performance evaluation.

5. Acceptance:
Please sign and return the duplicate copy of this letter within {{offer_validity_days}} days to confirm your acceptance of this offer.

We welcome you to the {{company_name}} family and look forward to a successful and rewarding association.

Yours sincerely,
For {{company_name}}

{{authorized_signatory}}
{{signatory_designation}}`,
    paragraphs: [],
    fields: [
      { key: 'employee_name', label: 'Candidate Name', type: 'text', required: true, defaultValue: '' },
      { key: 'employee_email', label: 'Candidate Email', type: 'text', required: true, defaultValue: '' },
      { key: 'employee_address', label: 'Candidate Address', type: 'textarea', required: false, defaultValue: '' },
      { key: 'designation', label: 'Offered Designation', type: 'text', required: true, defaultValue: '' },
      { key: 'department', label: 'Department', type: 'text', required: true, defaultValue: 'Operations' },
      { key: 'reporting_manager', label: 'Reporting Manager', type: 'text', required: true, defaultValue: 'Reporting Head' },
      { key: 'joining_date', label: 'Date of Joining', type: 'date', required: true, defaultValue: '' },
      { key: 'annual_ctc', label: 'Annual CTC / Salary', type: 'text', required: true, defaultValue: '₹6,00,000/-' },
      { key: 'annual_ctc_words', label: 'Salary in Words', type: 'text', required: false, defaultValue: 'Six Lakhs Only' },
      { key: 'probation_period', label: 'Probation Duration', type: 'text', required: true, defaultValue: '6 Months' },
      { key: 'offer_validity_days', label: 'Offer Validity (Days)', type: 'number', required: false, defaultValue: '3' },
    ],
    isGlobal: true,
    isDefault: true,
    version: 1,
    previousVersionId: null,
    tags: ['Offer', 'Onboarding', 'Hiring', 'Employment'],
    requiresApproval: true,
    approvalLevels: 1,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl_appointment_letter',
    companyId: null,
    name: 'Appointment Letter',
    category: 'employment_onboarding',
    subcategory: 'Appointment',
    description: 'Comprehensive formal appointment letter establishing terms of employment.',
    subject: 'Appointment as {{designation}}',
    content: `Date: {{letter_date}}

To,
{{employee_name}}
Employee ID: {{employee_id}}
Address: {{employee_address}}

Subject: Letter of Appointment

Dear {{employee_name}},

Subsequent to your acceptance of our offer, we have pleasure in appointing you as {{designation}} in the {{department}} department of {{company_name}} with effect from {{joining_date}}.

1. Location and Hours:
You will be posted at our office located at {{company_address}}. Your normal working hours will be as per company policy, and you may be required to work such hours as necessary to fulfill your responsibilities.

2. Emoluments:
Your total remuneration and breakdown of compensation will be as outlined in Annexure A attached herewith.

3. Duties & Responsibilities:
You will perform all duties diligently and carry out all lawful instructions given by your supervisors. You are expected to devote your whole time and attention to the business of the Company.

4. Confidentiality & Non-Disclosure:
During and after your employment with {{company_name}}, you shall maintain the strictest secrecy regarding all proprietary information, client data, and trade secrets of the Company.

5. Termination & Notice Period:
During probation, either party may terminate this employment by giving {{probation_notice}} days notice or payment in lieu thereof. Upon confirmation, the notice period shall be {{regular_notice}} days.

Please sign the duplicate copy of this letter as a token of your acceptance of these terms.

Yours sincerely,
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
      { key: 'probation_notice', label: 'Probation Notice (Days)', type: 'number', required: true, defaultValue: '15' },
      { key: 'regular_notice', label: 'Confirmed Notice (Days)', type: 'number', required: true, defaultValue: '30' },
    ],
    isGlobal: true,
    isDefault: false,
    version: 1,
    previousVersionId: null,
    tags: ['Appointment', 'Employment', 'Joining'],
    requiresApproval: true,
    approvalLevels: 1,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl_probation_confirmation',
    companyId: null,
    name: 'Employment / Probation Confirmation Letter',
    category: 'employment_onboarding',
    subcategory: 'Confirmation',
    description: 'Letter confirming the successful completion of probation and permanent employment.',
    subject: 'Confirmation of Employment – {{employee_name}} ({{employee_id}})',
    content: `Date: {{letter_date}}

To,
{{employee_name}}
Employee ID: {{employee_id}}
Designation: {{designation}}
Department: {{department}}

Subject: Confirmation of Employment

Dear {{employee_name}},

Consequent upon the satisfactory completion of your probationary period and subsequent review of your performance, we have pleasure in confirming your appointment as a permanent employee of {{company_name}} in the position of {{designation}} with effect from {{effective_date}}.

All other terms and conditions of your service as stated in your Letter of Appointment dated {{appointment_letter_date}} shall continue to apply.

We take this opportunity to congratulate you on your confirmation and look forward to your continued dedication, growth, and valuable contributions to the Company's success.

Yours sincerely,
For {{company_name}}

{{authorized_signatory}}
{{signatory_designation}}`,
    paragraphs: [],
    fields: [
      { key: 'employee_name', label: 'Employee Name', type: 'text', required: true, defaultValue: '' },
      { key: 'employee_id', label: 'Employee ID', type: 'text', required: true, defaultValue: '' },
      { key: 'designation', label: 'Designation', type: 'text', required: true, defaultValue: '' },
      { key: 'department', label: 'Department', type: 'text', required: true, defaultValue: '' },
      { key: 'effective_date', label: 'Confirmation Effective Date', type: 'date', required: true, defaultValue: '' },
      { key: 'appointment_letter_date', label: 'Original Appointment Date', type: 'date', required: false, defaultValue: '' },
    ],
    isGlobal: true,
    isDefault: false,
    version: 1,
    previousVersionId: null,
    tags: ['Confirmation', 'Probation', 'Permanent'],
    requiresApproval: false,
    approvalLevels: 1,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl_promotion_letter',
    companyId: null,
    name: 'Promotion & Increment Letter',
    category: 'employment_onboarding',
    subcategory: 'Promotion',
    description: 'Formal announcement of employee promotion and revised compensation.',
    subject: 'Promotion to {{new_designation}}',
    content: `Date: {{letter_date}}

To,
{{employee_name}}
Employee ID: {{employee_id}}
Current Designation: {{designation}}
Department: {{department}}

Subject: Promotion to {{new_designation}}

Dear {{employee_name}},

In recognition of your exceptional performance, dedication, and leadership contributions to {{company_name}}, the management is delighted to promote you to the position of {{new_designation}} with effect from {{effective_date}}.

In your new capacity, your revised annual compensation will be {{revised_salary}} per annum. The detailed breakdown of your compensation structure is attached in the Annexure.

We are confident that you will continue to demonstrate high standards of professional excellence and lead your team towards greater achievements.

Please accept our warmest congratulations on this well-deserved advancement.

Yours sincerely,
For {{company_name}}

{{authorized_signatory}}
{{signatory_designation}}`,
    paragraphs: [],
    fields: [
      { key: 'employee_name', label: 'Employee Name', type: 'text', required: true, defaultValue: '' },
      { key: 'employee_id', label: 'Employee ID', type: 'text', required: true, defaultValue: '' },
      { key: 'designation', label: 'Current Designation', type: 'text', required: true, defaultValue: '' },
      { key: 'new_designation', label: 'New Designation', type: 'text', required: true, defaultValue: '' },
      { key: 'department', label: 'Department', type: 'text', required: true, defaultValue: '' },
      { key: 'effective_date', label: 'Effective Date', type: 'date', required: true, defaultValue: '' },
      { key: 'revised_salary', label: 'Revised Salary / CTC', type: 'text', required: true, defaultValue: '' },
    ],
    isGlobal: true,
    isDefault: false,
    version: 1,
    previousVersionId: null,
    tags: ['Promotion', 'Increment', 'Career'],
    requiresApproval: true,
    approvalLevels: 1,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl_internship_offer',
    companyId: null,
    name: 'Internship Offer Letter',
    category: 'employment_onboarding',
    subcategory: 'Internship',
    description: 'Offer letter for internship engagements, stipends, and terms.',
    subject: 'Internship Offer – {{designation}}',
    content: `Date: {{letter_date}}

To,
{{employee_name}}
Email: {{employee_email}}

Subject: Offer of Internship

Dear {{employee_name}},

We are pleased to offer you an internship as {{designation}} with {{company_name}} starting on {{effective_date}} for a duration of {{period}}.

During your internship, you will receive a monthly stipend of {{stipend_amount}}. You will report directly to {{reporting_manager}} and will gain practical experience in our {{department}} team.

Please confirm your acceptance of this internship offer by signing and returning a copy of this letter.

Yours sincerely,
For {{company_name}}

{{authorized_signatory}}
{{signatory_designation}}`,
    paragraphs: [],
    fields: [
      { key: 'employee_name', label: 'Intern Name', type: 'text', required: true, defaultValue: '' },
      { key: 'designation', label: 'Internship Role', type: 'text', required: true, defaultValue: 'Intern' },
      { key: 'department', label: 'Department', type: 'text', required: true, defaultValue: '' },
      { key: 'effective_date', label: 'Start Date', type: 'date', required: true, defaultValue: '' },
      { key: 'period', label: 'Duration (e.g. 3 Months)', type: 'text', required: true, defaultValue: '3 Months' },
      { key: 'stipend_amount', label: 'Monthly Stipend', type: 'text', required: true, defaultValue: '₹15,000/-' },
      { key: 'reporting_manager', label: 'Mentor / Manager', type: 'text', required: true, defaultValue: '' },
    ],
    isGlobal: true,
    isDefault: false,
    version: 1,
    previousVersionId: null,
    tags: ['Internship', 'Offer', 'Trainee'],
    requiresApproval: false,
    approvalLevels: 1,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

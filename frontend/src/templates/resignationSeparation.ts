// ============================================================
// Resignation & Separation HR Letter Templates
// ============================================================
import type { HRTemplate } from '../types';

export const resignationSeparationTemplates: HRTemplate[] = [
  {
    id: 'tpl_relieving_letter',
    companyId: null,
    name: 'Relieving Letter',
    category: 'resignation_separation',
    subcategory: 'Relieving',
    description: 'Official relieving letter issued upon completion of notice period and exit clearance.',
    subject: 'Relieving Letter – {{employee_name}} ({{employee_id}})',
    content: `Date: {{letter_date}}

To,
{{employee_name}}
Employee ID: {{employee_id}}
Designation: {{designation}}
Department: {{department}}

Subject: Relieving Letter

Dear {{employee_name}},

This has reference to your resignation letter dated {{resignation_date}} from the services of {{company_name}}.

We would like to confirm that your resignation has been accepted and you are hereby relieved from the services of the Company with effect from the close of business hours on {{last_working_day}}.

We confirm that you have successfully completed all handover formalities and handed over all company assets, documents, and equipment in your custody. Your Full and Final settlement will be processed in accordance with the company payroll cycle.

We take this opportunity to thank you for your contributions during your tenure with {{company_name}} and wish you the very best in all your future endeavors.

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
      { key: 'resignation_date', label: 'Resignation Submission Date', type: 'date', required: true, defaultValue: '' },
      { key: 'last_working_day', label: 'Last Working Day', type: 'date', required: true, defaultValue: '' },
    ],
    isGlobal: true,
    isDefault: true,
    version: 1,
    previousVersionId: null,
    tags: ['Relieving', 'Separation', 'Resignation', 'Exit'],
    requiresApproval: true,
    approvalLevels: 1,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl_experience_certificate',
    companyId: null,
    name: 'Experience & Service Certificate',
    category: 'resignation_separation',
    subcategory: 'Experience',
    description: 'Formal certificate verifying tenure, role, and conduct for future employers.',
    subject: 'TO WHOMSOEVER IT MAY CONCERN – Experience Certificate',
    content: `Date: {{letter_date}}

TO WHOMSOEVER IT MAY CONCERN

This is to certify that {{employee_name}} (Employee ID: {{employee_id}}) was employed with {{company_name}} from {{joining_date}} to {{last_working_day}}.

At the time of leaving the organization, {{employee_name}} was designated as {{designation}} in the {{department}} department.

During their tenure with us, we found {{employee_name}} to be diligent, sincere, and professional in discharging their responsibilities. Their conduct and character were good during their period of service.

We wish {{employee_name}} all success in their future career and personal endeavors.

For {{company_name}}

{{authorized_signatory}}
{{signatory_designation}}`,
    paragraphs: [],
    fields: [
      { key: 'employee_name', label: 'Employee Name', type: 'text', required: true, defaultValue: '' },
      { key: 'employee_id', label: 'Employee ID', type: 'text', required: true, defaultValue: '' },
      { key: 'designation', label: 'Designation', type: 'text', required: true, defaultValue: '' },
      { key: 'department', label: 'Department', type: 'text', required: true, defaultValue: '' },
      { key: 'joining_date', label: 'Date of Joining', type: 'date', required: true, defaultValue: '' },
      { key: 'last_working_day', label: 'Relieving / Last Working Date', type: 'date', required: true, defaultValue: '' },
    ],
    isGlobal: true,
    isDefault: false,
    version: 1,
    previousVersionId: null,
    tags: ['Experience', 'Certificate', 'Verification', 'Tenure'],
    requiresApproval: false,
    approvalLevels: 1,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl_resignation_acceptance',
    companyId: null,
    name: 'Resignation Acceptance Letter',
    category: 'resignation_separation',
    subcategory: 'Resignation',
    description: 'Letter formally accepting employee resignation and setting exit timeline.',
    subject: 'Acceptance of Resignation – {{employee_name}} ({{employee_id}})',
    content: `Date: {{letter_date}}

To,
{{employee_name}}
Employee ID: {{employee_id}}
Designation: {{designation}}
Department: {{department}}

Subject: Acceptance of Resignation

Dear {{employee_name}},

We are in receipt of your formal resignation letter dated {{resignation_date}}, tendering your resignation from the position of {{designation}} at {{company_name}}.

Management has accepted your resignation. As per your employment agreement, you are required to serve a notice period of {{notice_period}}. Accordingly, your last working day with {{company_name}} will be {{last_working_day}}.

You are requested to complete all handover tasks with {{reporting_manager}} and surrender all company assets, access badges, and confidential materials prior to your final day.

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
      { key: 'resignation_date', label: 'Resignation Date', type: 'date', required: true, defaultValue: '' },
      { key: 'notice_period', label: 'Notice Period', type: 'text', required: true, defaultValue: '30 Days' },
      { key: 'last_working_day', label: 'Last Working Day', type: 'date', required: true, defaultValue: '' },
      { key: 'reporting_manager', label: 'Reporting Manager', type: 'text', required: true, defaultValue: '' },
    ],
    isGlobal: true,
    isDefault: false,
    version: 1,
    previousVersionId: null,
    tags: ['Resignation', 'Acceptance', 'Notice'],
    requiresApproval: true,
    approvalLevels: 1,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl_absconding_absence_notice',
    companyId: null,
    name: 'Unauthorized Absence and Show-Cause Notice',
    category: 'resignation_separation',
    subcategory: 'Absence & Absconding',
    description: 'Formal notice regarding unexplained continuous absence and request for written explanation.',
    subject: 'Formal Notice of Unauthorized Absence and Failure to Report for Duty',
    content: `Date: {{letter_date}}

To,
{{employee_name}}
Employee ID: {{employee_id}}
Designation: {{designation}}
Department: {{department}}

Subject: Formal Notice of Unauthorized Absence and Failure to Report for Duty

Dear {{employee_name}},

As per the company's official attendance records, you have remained absent from your designated duties without prior authorization or approved leave starting from {{absence_start_date}} to {{absence_end_date}}.

Your failure to report for duty or notify the management of the reasons for your absence is a matter of serious concern and constitutes a violation of the company's attendance, discipline, and employment policies.

You are hereby instructed to submit a written explanation for your unauthorized absence and contact the Human Resources Department within {{response_deadline_hours}} hours of receiving this notice.

Please be advised that failure to respond within the stipulated period, without a satisfactory explanation, may result in your continued absence being treated as suspected voluntary job abandonment / absconding, subject to the company's applicable policies, employment terms, and due process requirements. Further disciplinary action may be initiated in accordance with company rules.

You are requested to treat this communication as urgent and cooperate with management to resolve this matter.

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
      { key: 'absence_start_date', label: 'Absence Start Date', type: 'date', required: true, defaultValue: '' },
      { key: 'absence_end_date', label: 'Absence Till Date', type: 'date', required: true, defaultValue: '' },
      { key: 'response_deadline_hours', label: 'Response Deadline (e.g. 48)', type: 'number', required: true, defaultValue: '48' },
    ],
    isGlobal: true,
    isDefault: false,
    version: 1,
    previousVersionId: null,
    tags: ['Absence', 'Absconding', 'Show-Cause', 'Disciplinary'],
    requiresApproval: true,
    approvalLevels: 1,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl_termination_letter',
    companyId: null,
    name: 'Formal Termination of Employment Letter',
    category: 'resignation_separation',
    subcategory: 'Termination',
    description: 'Formal separation letter stating grounds, effective date, and settlement instructions.',
    subject: 'Notice of Termination of Employment – {{employee_name}} ({{employee_id}})',
    content: `Date: {{letter_date}}

To,
{{employee_name}}
Employee ID: {{employee_id}}
Designation: {{designation}}
Department: {{department}}

Subject: Notice of Termination of Employment

Dear {{employee_name}},

This communication serves as formal notice that your employment with {{company_name}} is being terminated with effect from {{termination_effective_date}} ("Effective Date").

Grounds for Termination:
{{reason_for_letter}}

Notice Arrangement & Severance:
{{notice_arrangement_details}}

Formal Handover & Return of Assets:
You are required to surrender all company property, including your employee identification card, laptop, equipment, keys, data, and access credentials immediately to {{reporting_manager}} or the HR Department.

Final Settlement:
Your full and final compensation, including accrued salary and leave encashment (subject to applicable deductions), will be settled following successful clearance from all relevant departments.

We remind you of your ongoing legal obligations regarding confidentiality and non-disclosure of proprietary information as set forth in your original employment agreement.

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
      { key: 'termination_effective_date', label: 'Effective Date of Termination', type: 'date', required: true, defaultValue: '' },
      { key: 'reason_for_letter', label: 'Reason / Approved Grounds', type: 'textarea', required: true, defaultValue: 'Organizational restructuring resulting in role elimination.' },
      { key: 'notice_arrangement_details', label: 'Notice / Pay in Lieu Details', type: 'textarea', required: true, defaultValue: 'You will receive payment equivalent to 30 days notice in lieu thereof as part of your final settlement.' },
      { key: 'reporting_manager', label: 'Handover Contact Person', type: 'text', required: true, defaultValue: 'Human Resources' },
    ],
    isGlobal: true,
    isDefault: false,
    version: 1,
    previousVersionId: null,
    tags: ['Termination', 'Separation', 'Legal', 'Exit'],
    requiresApproval: true,
    approvalLevels: 2,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

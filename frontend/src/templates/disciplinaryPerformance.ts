// ============================================================
// Disciplinary & Performance HR Letter Templates
// ============================================================
import type { HRTemplate } from '../types';

export const disciplinaryPerformanceTemplates: HRTemplate[] = [
  {
    id: 'tpl_final_warning_behaviour',
    companyId: null,
    name: 'Final Warning Letter – Workplace Conduct & Behaviour',
    category: 'disciplinary_performance',
    subcategory: 'Disciplinary Warning',
    description: 'Comprehensive final warning letter regarding professional behaviour and workplace conduct.',
    subject: 'FINAL WARNING – Inappropriate and Unprofessional Workplace Behaviour',
    content: `Date: {{letter_date}}

To,
{{employee_name}}
Employee ID: {{employee_id}}
Designation: {{designation}}
Department: {{department}}

Subject: Final Warning – Inappropriate and Unprofessional Workplace Behaviour

Dear {{employee_name}},

This letter constitutes a FINAL WARNING concerning serious concerns regarding your conduct and behaviour in the workplace. Management has received and/or observed concerns regarding inappropriate, disrespectful, or unprofessional behaviour during the course of your employment.

Such conduct is inconsistent with the standards of professionalism, discipline, respectful communication, and workplace behaviour expected from every employee of {{company_name}}.

Employees are expected to communicate respectfully with colleagues, supervisors, clients, customers, and other business associates, follow reasonable management instructions, maintain workplace discipline, and contribute to a professional and safe working environment.

Management has reviewed the concerns available to it and is providing you with this final opportunity to immediately correct your conduct and demonstrate sustained compliance with company standards.

This Final Warning is a disciplinary communication and should not be interpreted as a finding of criminal misconduct. Any allegation or incident will be handled in accordance with applicable company policy, contractual terms, and law.

Required Immediate Corrective Action:
• Maintain respectful, professional, and non-threatening communication with all employees, supervisors, clients, customers, and business associates.
• Do not engage in abusive, insulting, aggressive, intimidating, disruptive, discriminatory, or otherwise inappropriate conduct in the workplace or through company communication channels.
• Follow reasonable instructions issued by supervisors and management and raise disagreements through the appropriate reporting channel.
• Maintain professional behaviour during calls, meetings, chats, emails, and all other work-related interactions.
• Do not retaliate against, harass, threaten, or attempt to intimidate any employee who raises a workplace concern or participates in an internal review.
• Immediately correct any conduct that has been identified as inconsistent with company policies or expected workplace standards.

Consequences of Further Misconduct:
Any further substantiated incident of inappropriate or unprofessional behaviour, failure to follow workplace conduct requirements, insubordination, harassment, threats, abusive communication, or other serious misconduct may result in further disciplinary action, up to and including termination of employment, subject to applicable company policy, contractual terms, and law.

You are expected to treat this Final Warning with the utmost seriousness and demonstrate immediate and sustained improvement in your conduct.

Please sign below to acknowledge receipt of this Final Warning Letter. Your signature confirms receipt of the document and does not necessarily indicate agreement with its contents.`,
    paragraphs: [],
    fields: [
      { key: 'employee_name', label: 'Employee Name', type: 'text', required: true, defaultValue: '' },
      { key: 'employee_id', label: 'Employee ID', type: 'text', required: true, defaultValue: '' },
      { key: 'designation', label: 'Designation', type: 'text', required: true, defaultValue: '' },
      { key: 'department', label: 'Department', type: 'text', required: true, defaultValue: '' },
    ],
    isGlobal: true,
    isDefault: true,
    version: 1,
    previousVersionId: null,
    tags: ['Warning', 'Conduct', 'Disciplinary', 'Final Warning', 'Misconduct'],
    requiresApproval: true,
    approvalLevels: 1,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl_pip_letter',
    companyId: null,
    name: 'Performance Improvement Plan (PIP) Letter',
    category: 'disciplinary_performance',
    subcategory: 'Performance',
    description: 'Structured performance improvement letter with explicit review date and evaluation milestones.',
    subject: 'Performance Improvement Plan (PIP) Notification – Review Date: {{review_date}}',
    content: `Date: {{letter_date}}

To,
{{employee_name}}
Employee ID: {{employee_id}}
Designation: {{designation}}
Department: {{department}}

Subject: Performance Improvement Plan (PIP) – Formal Review Date: {{review_date}}

Dear {{employee_name}},

This communication is to formally inform you that you are being placed on a Performance Improvement Plan (PIP) effective from {{effective_date}}, with a formal performance review scheduled on {{review_date}} (Duration: {{period}}).

1. Background & Performance Deficiencies:
During recent reviews and evaluations, management has identified key areas where your performance does not meet the expected standards of {{company_name}}:
{{reason_for_letter}}

2. Objectives and Expected Milestones:
Between {{effective_date}} and the formal review date of {{review_date}}, you will be expected to achieve the following specific goals:
• Attain 100% adherence to defined productivity benchmarks and quality parameters.
• Complete all daily assignments within established turnaround times.
• Attend weekly status and coaching reviews with your reporting manager, {{reporting_manager}}.

3. Support and Interim Monitoring:
The Company is committed to providing you with the necessary guidance, feedback, and support to help you achieve these milestones. Regular progress check-ins will be scheduled leading up to the review date.

4. Performance Review Date & Outcome:
A formal, comprehensive evaluation will take place on the scheduled Review Date: {{review_date}}.
• Satisfactory performance and sustained milestone achievement by {{review_date}} will result in successful closure of this plan.
• Failure to demonstrate the required improvement on or before the review date of {{review_date}} may lead to further action, up to and including reassignment or termination of employment in accordance with company policy.

We encourage you to utilize this opportunity and available coaching to align your output with organizational standards.`,
    paragraphs: [],
    fields: [
      { key: 'employee_name', label: 'Employee Name', type: 'text', required: true, defaultValue: '' },
      { key: 'employee_id', label: 'Employee ID', type: 'text', required: true, defaultValue: '' },
      { key: 'designation', label: 'Designation', type: 'text', required: true, defaultValue: '' },
      { key: 'department', label: 'Department', type: 'text', required: true, defaultValue: '' },
      { key: 'effective_date', label: 'PIP Start / Effective Date', type: 'date', required: true, defaultValue: '' },
      { key: 'review_date', label: 'PIP Review Date', type: 'date', required: true, defaultValue: '' },
      { key: 'period', label: 'Time Period / Duration (e.g. 8 Days, 30 Days)', type: 'text', required: false, defaultValue: '30 Days' },
      { key: 'reason_for_letter', label: 'Performance Deficiencies', type: 'textarea', required: true, defaultValue: 'Target achievement below required threshold and quality metrics inconsistently met.' },
      { key: 'reporting_manager', label: 'Reviewing Manager', type: 'text', required: true, defaultValue: '' },
    ],
    isGlobal: true,
    isDefault: false,
    version: 2,
    previousVersionId: null,
    tags: ['PIP', 'Performance', 'Evaluation', 'Review Date', 'Time Period', 'Coaching'],
    requiresApproval: true,
    approvalLevels: 1,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl_first_written_warning',
    companyId: null,
    name: 'First Written Warning Letter',
    category: 'disciplinary_performance',
    subcategory: 'Disciplinary Warning',
    description: 'Initial formal warning addressing specific lapses in attendance, performance, or policy.',
    subject: 'First Written Warning – {{subject_topic}}',
    content: `Date: {{letter_date}}

To,
{{employee_name}}
Employee ID: {{employee_id}}
Designation: {{designation}}
Department: {{department}}

Subject: First Written Warning – {{subject_topic}}

Dear {{employee_name}},

This letter serves as a formal First Written Warning regarding {{subject_topic}}.

Specifically, on {{incident_date}}, it was noted that {{reason_for_letter}}. This is in contravention of {{company_name}}'s policies and workplace guidelines.

You are hereby advised to rectify this issue immediately. Please note that continuous or repeated infractions may result in further escalation under the company's disciplinary procedures.

Please acknowledge receipt of this letter by signing below.

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
      { key: 'subject_topic', label: 'Warning Topic (e.g. Attendance/Lateness)', type: 'text', required: true, defaultValue: 'Repeated Tardiness' },
      { key: 'incident_date', label: 'Incident / Occurrence Date', type: 'date', required: true, defaultValue: '' },
      { key: 'reason_for_letter', label: 'Incident Description', type: 'textarea', required: true, defaultValue: 'Failure to report at the designated shift start time without prior manager notification.' },
    ],
    isGlobal: true,
    isDefault: false,
    version: 1,
    previousVersionId: null,
    tags: ['Warning', 'Attendance', 'First Warning'],
    requiresApproval: false,
    approvalLevels: 1,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl_show_cause_notice',
    companyId: null,
    name: 'Show-Cause Notice (Disciplinary)',
    category: 'disciplinary_performance',
    subcategory: 'Show Cause',
    description: 'Formal notice directing an employee to show cause why disciplinary action should not be taken.',
    subject: 'Show-Cause Notice – Regarding {{incident_brief}}',
    content: `Date: {{letter_date}}

To,
{{employee_name}}
Employee ID: {{employee_id}}
Designation: {{designation}}
Department: {{department}}

Subject: Show-Cause Notice

Dear {{employee_name}},

It has been brought to the attention of the management that you have engaged in the following conduct on or about {{incident_date}}:
{{reason_for_letter}}

The above alleged conduct, if substantiated, constitutes gross indiscipline and a violation of the service rules of {{company_name}}.

You are hereby called upon to SHOW CAUSE in writing within {{response_deadline_hours}} hours from the receipt of this notice as to why appropriate disciplinary action, which may include suspension or termination of service, should not be initiated against you.

If no explanation is received from you within the stipulated time period, it will be presumed that you have no explanation to offer, and management will proceed with appropriate action in accordance with company policy.

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
      { key: 'incident_brief', label: 'Brief Subject of Notice', type: 'text', required: true, defaultValue: 'Insubordination and Policy Violation' },
      { key: 'incident_date', label: 'Date of Incident', type: 'date', required: true, defaultValue: '' },
      { key: 'reason_for_letter', label: 'Detailed Allegation / Incident', type: 'textarea', required: true, defaultValue: '' },
      { key: 'response_deadline_hours', label: 'Response Deadline (Hours)', type: 'number', required: true, defaultValue: '48' },
    ],
    isGlobal: true,
    isDefault: false,
    version: 1,
    previousVersionId: null,
    tags: ['Show Cause', 'Disciplinary', 'Inquiry', 'Explanation'],
    requiresApproval: true,
    approvalLevels: 1,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

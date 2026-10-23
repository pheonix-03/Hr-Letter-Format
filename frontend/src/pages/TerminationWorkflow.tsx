// ============================================================
// Termination Letter Builder & Dedicated Safeguard Workflow
// ============================================================
import React, { useState } from 'react';
import {
  Card,
  Steps,
  Form,
  Input,
  Select,
  Radio,
  Switch,
  Button,
  Row,
  Col,
  Alert,
  Checkbox,
  Divider,
  Tag,
  Space,
  message,
  Typography,
} from 'antd';
import {
  WarningOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  FileDoneOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import dayjs from 'dayjs';
import { db, generateId, getCurrentTimestamp } from '../store/db';
import { useApp } from '../contexts/AppContext';
import { PageHeader } from '../components/PageHeader';
import { generateReferenceNumber } from '../services/referenceNumberService';
import { logAction } from '../services/auditService';
import type { TerminationCategory, TerminationWorkflow, GeneratedDocument } from '../types';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export const TerminationWorkflowPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { currentCompanyId, currentCompany, user } = useApp();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<TerminationCategory>('performance');
  const [payInLieu, setPayInLieu] = useState(false);
  const [authorizedConfirmed, setAuthorizedConfirmed] = useState(false);
  const [jurisdiction, setJurisdiction] = useState('India (Central / State Shops & Estab.)');
  const [generating, setGenerating] = useState(false);

  const employees = useLiveQuery(async () => {
    if (!currentCompanyId) return [];
    return await db.employees.where('companyId').equals(currentCompanyId).toArray();
  }, [currentCompanyId]);

  const handleSelectEmployee = (empId: string) => {
    const emp = employees?.find((e) => e.id === empId);
    if (emp) {
      form.setFieldsValue({
        employeeName: emp.fullName,
        employeeId: emp.employeeId,
        designation: emp.designation,
        department: emp.department,
        joiningDate: emp.joiningDate,
      });
    }
  };

  const handleFinish = async (values: any) => {
    if (!authorizedConfirmed) {
      message.error('You must confirm authorized executive review before generating termination documents.');
      return;
    }
    if (!currentCompanyId || !currentCompany) {
      message.error('No active company selected');
      return;
    }

    try {
      setGenerating(true);
      const now = getCurrentTimestamp();
      const workflowId = generateId();
      const refNo = await generateReferenceNumber(currentCompanyId, 'resignation_separation', 'TERM');
      const docId = generateId();

      // Assemble termination letter text
      const letterContent = `Date: ${values.letterDate || dayjs().format('DD MMMM YYYY')}

To,
${values.employeeName}
Employee ID: ${values.employeeId}
Designation: ${values.designation}
Department: ${values.department}

Subject: Notice of Termination of Employment – ${getCategoryLabel(selectedCategory)}

Dear ${values.employeeName},

This communication serves as formal notice that your employment with ${currentCompany.tradeName || currentCompany.legalName} is terminated with effect from the close of business hours on ${values.effectiveDate} ("Effective Date").

1. Category & Approved Reason:
This termination is effected under the category of ${getCategoryLabel(selectedCategory)}.
Reason / Findings: ${values.reason}

2. Notice & Severance Terms:
Notice Arrangement: ${values.noticeArrangement}
${payInLieu ? `Payment in Lieu of Notice: Equivalent to ${values.noticePeriod} salary (${values.payInLieuAmount || 'as per contract'}) will be paid as part of full and final settlement.` : `Notice Period: ${values.noticePeriod} to be served.`}

3. Return of Company Property & Handover:
You are instructed to immediately surrender all company assets, including your identity card, access keycards, laptop/equipment, proprietary software credentials, and confidential files to ${values.handoverContact || 'Human Resources'}.

4. Final Settlement & Dues:
Your Full and Final Settlement (including earned salary, accrued encashable leave, and applicable severance, less any lawful deductions) will be disbursed following exit clearance within statutory timeframes.

5. Post-Employment Obligations:
You are reminded of your continuing contractual obligations regarding confidentiality, non-disclosure of proprietary trade secrets, and non-solicitation as stipulated in your employment contract.

Yours sincerely,
For ${currentCompany.tradeName || currentCompany.legalName}

${currentCompany.authorizedSignatoryName || 'Authorized Signatory'}
${currentCompany.authorizedSignatoryDesignation || 'Managing Authority'}

EMPLOYEE ACKNOWLEDGEMENT:
I, ${values.employeeName}, acknowledge receipt of this Termination Notice.
Signature: __________________________        Date: __________________`;

      // Save document record
      const newDoc: GeneratedDocument = {
        id: docId,
        companyId: currentCompanyId,
        templateId: 'tpl_termination_letter',
        templateVersion: 1,
        templateSnapshot: letterContent,
        employeeId: values.employeeId || 'UNKNOWN',
        letterheadId: 'default',
        referenceNumber: refNo,
        title: `Termination Notice – ${values.employeeName}`,
        category: 'resignation_separation',
        status: 'issued',
        filledData: {
          employee_name: values.employeeName,
          employee_id: values.employeeId,
          designation: values.designation,
          department: values.department,
          effective_date: values.effectiveDate,
          reason: values.reason,
        },
        renderedContent: letterContent,
        docxBlob: null,
        pdfBlob: null,
        letterDate: values.letterDate || dayjs().format('YYYY-MM-DD'),
        effectiveDate: values.effectiveDate,
        issuedDate: now,
        issuedBy: user?.name || 'Authorized Signatory',
        notes: `High-impact separation document generated under category: ${selectedCategory}. Jurisdiction: ${jurisdiction}.`,
        createdBy: user?.id || 'anonymous',
        createdAt: now,
        updatedAt: now,
      };

      await db.documents.add(newDoc);

      await logAction(
        currentCompanyId,
        user?.id || 'anonymous',
        user?.name || 'User',
        'issue',
        'termination_document',
        docId,
        {
          ref: refNo,
          employee: values.employeeName,
          category: selectedCategory,
        },
      );

      message.success('Termination document generated with audit trail');
      navigate(`/documents/${docId}`);
    } catch (err: any) {
      console.error(err);
      message.error(`Failed to generate termination document: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <PageHeader
        title="Dedicated Termination & High-Impact Separation Builder"
        subtitle="Controlled workflow for high-risk employment separations with mandatory compliance warnings, jurisdiction validation, and auditable authorization."
      />

      <Alert
        type="warning"
        showIcon
        icon={<WarningOutlined />}
        style={{ marginBottom: '20px' }}
        message="Important Legal Notice & Safeguards"
        description="Employment termination is subject to strict statutory notice, contract terms, and procedural fairness requirements that vary significantly across jurisdictions. This system generates letters strictly from user-authorized factual inputs. Ensure all prior warnings, PIP documents, and required hearings have been formally documented prior to issuance."
      />

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            letterDate: dayjs().format('DD MMMM YYYY'),
            effectiveDate: dayjs().add(1, 'day').format('DD MMMM YYYY'),
            noticePeriod: '30 Days',
            noticeArrangement: 'Payment in lieu of notice',
            jurisdiction: 'India (Central / State Shops & Estab.)',
          }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Select Employee from Directory (or enter below)">
                <Select
                  placeholder="Select employee to auto-fill..."
                  showSearch
                  optionFilterProp="label"
                  onChange={handleSelectEmployee}
                  options={(employees ?? []).map((e) => ({
                    value: e.id,
                    label: `${e.fullName} (${e.employeeId}) – ${e.designation}`,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="jurisdiction"
                label="Governing Employment Jurisdiction"
                rules={[{ required: true }]}
              >
                <Select
                  value={jurisdiction}
                  onChange={setJurisdiction}
                  options={[
                    { value: 'India (Central / State Shops & Estab.)', label: 'India (Shops & Establishments / Industrial Disputes Act)' },
                    { value: 'United States (At-Will / State Specific)', label: 'United States (At-Will / State Specific)' },
                    { value: 'United Kingdom (Employment Rights Act)', label: 'United Kingdom (Employment Rights Act)' },
                    { value: 'UAE / GCC (Labour Law)', label: 'UAE / GCC (Federal Labour Law)' },
                    { value: 'Other International Jurisdiction', label: 'Other International Jurisdiction' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="employeeName"
                label="Employee Full Legal Name"
                rules={[{ required: true, message: 'Name is required' }]}
              >
                <Input placeholder="e.g. Rahul Verma" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="employeeId"
                label="Employee ID / Staff Code"
                rules={[{ required: true, message: 'ID is required' }]}
              >
                <Input placeholder="e.g. ESL045" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="designation" label="Designation" rules={[{ required: true }]}>
                <Input placeholder="e.g. Senior Software Engineer" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="department" label="Department" rules={[{ required: true }]}>
                <Input placeholder="e.g. Engineering" />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '16px 0' }}>Separation Grounds & Reason</Divider>

          <Form.Item label="Separation Category" required>
            <Radio.Group
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: '100%' }}
            >
              <Row gutter={[12, 12]}>
                <Col span={12}>
                  <Radio value="performance">Termination for Performance / Unsuccessful PIP</Radio>
                </Col>
                <Col span={12}>
                  <Radio value="during_probation">Termination During Probation Period</Radio>
                </Col>
                <Col span={12}>
                  <Radio value="disciplinary_process">Termination Following Documented Disciplinary Process</Radio>
                </Col>
                <Col span={12}>
                  <Radio value="misconduct">Termination for Gross Misconduct</Radio>
                </Col>
                <Col span={12}>
                  <Radio value="restructuring_redundancy">Role Elimination / Restructuring / Redundancy</Radio>
                </Col>
                <Col span={12}>
                  <Radio value="fixed_term_ending">Fixed-Term Contract Expiration / Non-Renewal</Radio>
                </Col>
              </Row>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="reason"
            label="Specific Approved Factual Grounds / Findings"
            rules={[{ required: true, message: 'Specific reason wording is required' }]}
          >
            <TextArea
              rows={3}
              placeholder="State the objective, verified findings without inflammatory language (e.g. Failure to meet required performance benchmarks established under the 60-day Performance Improvement Plan dated 20 August 2026)."
            />
          </Form.Item>

          <Divider style={{ margin: '16px 0' }}>Notice & Settlement Terms</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="letterDate" label="Notice Date" rules={[{ required: true }]}>
                <Input placeholder="e.g. 23 October 2026" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="effectiveDate"
                label="Effective Termination Date"
                rules={[{ required: true }]}
              >
                <Input placeholder="e.g. 24 October 2026" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="noticePeriod" label="Notice Period" rules={[{ required: true }]}>
                <Input placeholder="e.g. 30 Days" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="noticeArrangement" label="Notice Arrangement">
                <Select
                  options={[
                    { value: 'Payment in lieu of notice', label: 'Payment in Lieu of Notice (Immediate Release)' },
                    { value: 'Serving full notice period', label: 'Employee Working Through Notice Period' },
                    { value: 'Garden Leave', label: 'Garden Leave for Notice Duration' },
                    { value: 'Notice waived by mutual agreement', label: 'Notice Waived by Mutual Agreement' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Payment in Lieu of Notice Applicable?">
                <Space>
                  <Switch checked={payInLieu} onChange={setPayInLieu} />
                  <Text>{payInLieu ? 'Yes, severance/notice pay included' : 'No'}</Text>
                </Space>
              </Form.Item>
            </Col>
          </Row>

          {payInLieu && (
            <Form.Item name="payInLieuAmount" label="Payment in Lieu Amount / Calculation">
              <Input placeholder="e.g. ₹65,000 (equivalent to 1 month gross salary)" />
            </Form.Item>
          )}

          <Form.Item name="handoverContact" label="Handover & Asset Return Contact Person">
            <Input placeholder="e.g. Head of Human Resources / Department Manager" />
          </Form.Item>

          <Divider style={{ margin: '20px 0' }} />

          {/* Mandatory Executive Confirmation */}
          <div
            style={{
              padding: '16px',
              backgroundColor: '#fffbe6',
              border: '1px solid #ffe58f',
              borderRadius: '8px',
              marginBottom: '20px',
            }}
          >
            <Checkbox
              checked={authorizedConfirmed}
              onChange={(e) => setAuthorizedConfirmed(e.target.checked)}
            >
              <Text strong style={{ color: '#d46b08' }}>
                Human Review & Authorized Signatory Sign-off
              </Text>
            </Checkbox>
            <Paragraph style={{ margin: '8px 0 0 24px', fontSize: '13px', color: '#555' }}>
              I confirm that this separation decision has been reviewed and authorized by an executive officer or HR director in accordance with company policy, relevant employment contracts, and applicable labour regulations.
            </Paragraph>
          </div>

          <Button
            type="primary"
            danger
            size="large"
            icon={<FileDoneOutlined />}
            loading={generating}
            onClick={() => form.submit()}
            style={{ width: '100%', height: '48px', fontSize: '16px' }}
          >
            Validate & Issue Formal Termination Letter
          </Button>
        </Form>
      </Card>
    </div>
  );
};

function getCategoryLabel(category: TerminationCategory): string {
  switch (category) {
    case 'performance':
      return 'Performance-Related Separation';
    case 'during_probation':
      return 'Termination During Probation';
    case 'disciplinary_process':
      return 'Disciplinary Grounds';
    case 'misconduct':
      return 'Misconduct Investigation Findings';
    case 'restructuring_redundancy':
      return 'Organizational Restructuring';
    case 'fixed_term_ending':
      return 'Fixed-Term Contract Expiration';
    default:
      return 'Employment Separation';
  }
}

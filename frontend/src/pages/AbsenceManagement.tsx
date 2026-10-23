// ============================================================
// Absence & Absconding Investigation Management
// ============================================================
import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Alert,
  Divider,
  message,
  Typography,
} from 'antd';
import {
  ClockCircleOutlined,
  PlusOutlined,
  FileDoneOutlined,
  PhoneOutlined,
  MailOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import dayjs from 'dayjs';
import { db, generateId, getCurrentTimestamp } from '../store/db';
import { useApp } from '../contexts/AppContext';
import { PageHeader } from '../components/PageHeader';
import { generateReferenceNumber } from '../services/referenceNumberService';
import { logAction } from '../services/auditService';
import type { AbsenceRecord, GeneratedDocument } from '../types';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export const AbsenceManagement: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { currentCompanyId, currentCompany, user } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const employees = useLiveQuery(async () => {
    if (!currentCompanyId) return [];
    return await db.employees.where('companyId').equals(currentCompanyId).toArray();
  }, [currentCompanyId]);

  const absenceCases = useLiveQuery(async () => {
    if (!currentCompanyId) return [];
    return await db.absenceRecords
      .where('companyId')
      .equals(currentCompanyId)
      .reverse()
      .sortBy('createdAt');
  }, [currentCompanyId]);

  const handleSelectEmployee = (empId: string) => {
    const emp = employees?.find((e) => e.id === empId);
    if (emp) {
      form.setFieldsValue({
        employeeName: emp.fullName,
        employeeId: emp.employeeId,
        designation: emp.designation,
        department: emp.department,
      });
    }
  };

  const handleCreateCase = async () => {
    try {
      const values = await form.validateFields();
      if (!currentCompanyId || !currentCompany) {
        message.error('Please select an active company first');
        return;
      }

      setSaving(true);
      const now = getCurrentTimestamp();
      const caseId = generateId();
      const refNo = await generateReferenceNumber(currentCompanyId, 'resignation_separation', 'ABS');
      const docId = generateId();

      // Formal neutral explanation request notice
      const letterContent = `HUMAN RESOURCES DEPARTMENT
Date: ${dayjs().format('DD MMMM YYYY')}

To:
${values.employeeName}
Employee ID: ${values.employeeId}
Designation: ${values.designation}
Department: ${values.department}

Subject: Formal Notice of Unauthorized Absence and Failure to Report for Duty

Dear ${values.employeeName},

As per the company's official attendance records, you have remained absent from duty from ${values.startDate} to ${values.endDate} without prior approval or any formal communication to the management regarding your continued absence.

Your failure to report for duty or notify the management of the reasons for your absence is a matter of serious concern and constitutes a violation of the company's attendance, leave, and employment policies (${values.policyReference || 'Code of Workplace Discipline & Leave Policy'}).

You are hereby instructed to submit a written explanation for your unauthorized absence and contact the Human Resources Department within ${values.deadlineHours || '48'} hours of receiving this notice.

Please be advised that failure to respond within the stipulated period, without a satisfactory explanation, may result in your continued absence being treated as suspected job abandonment / absconding, subject to the company's applicable policies, employment terms, and due process requirements. Further disciplinary action may be initiated in accordance with the applicable rules and regulations.

You are requested to treat this notice as urgent and cooperate with the management in resolving this matter.

Sincerely,
For ${currentCompany.tradeName || currentCompany.legalName}

Authorized Signatory: ______________________________
Name: ${currentCompany.authorizedSignatoryName || 'Authorized Signatory'}
Designation: ${currentCompany.authorizedSignatoryDesignation || 'HR / Authorized Representative'}
Company Seal: _____________________________________`;

      // Save document
      const newDoc: GeneratedDocument = {
        id: docId,
        companyId: currentCompanyId,
        templateId: 'tpl_absconding_absence_notice',
        templateVersion: 1,
        templateSnapshot: letterContent,
        employeeId: values.employeeId,
        letterheadId: 'default',
        referenceNumber: refNo,
        title: `Absence Notice – ${values.employeeName}`,
        category: 'resignation_separation',
        status: 'issued',
        filledData: {
          employee_name: values.employeeName,
          employee_id: values.employeeId,
          designation: values.designation,
          department: values.department,
          absence_start_date: values.startDate,
          absence_end_date: values.endDate,
        },
        renderedContent: letterContent,
        docxBlob: null,
        pdfBlob: null,
        letterDate: dayjs().format('YYYY-MM-DD'),
        effectiveDate: values.startDate,
        issuedDate: now,
        issuedBy: user?.name || 'HR Admin',
        notes: `Notice of unauthorized absence issued. Recorded absence: ${values.startDate} to ${values.endDate}.`,
        createdBy: user?.id || 'anonymous',
        createdAt: now,
        updatedAt: now,
      };

      await db.documents.add(newDoc);

      // Save absence case
      const absenceRecord: AbsenceRecord = {
        id: caseId,
        companyId: currentCompanyId,
        employeeId: values.employeeId,
        absenceDates: [values.startDate, values.endDate],
        contactAttempts: [
          {
            date: dayjs().format('YYYY-MM-DD'),
            method: 'phone',
            details: values.contactNotes || 'Attempted phone call, no response.',
            responseReceived: false,
          },
        ],
        policyReference: values.policyReference || 'Company Attendance & Discipline Policy',
        responseDeadline: `${values.deadlineHours || '48'} hours`,
        employeeResponse: '',
        status: 'notice_sent',
        escalatedTo: '',
        finalDecision: '',
        relatedDocumentIds: [docId],
        createdBy: user?.id || 'anonymous',
        createdAt: now,
        updatedAt: now,
      };

      await db.absenceRecords.add(absenceRecord);

      await logAction(
        currentCompanyId,
        user?.id || 'anonymous',
        user?.name || 'User',
        'create',
        'absence_case',
        caseId,
        {
          employee: values.employeeName,
          ref: refNo,
        },
      );

      message.success('Absence notice generated and case opened');
      setModalVisible(false);
      navigate(`/documents/${docId}`);
    } catch (err: any) {
      console.error(err);
      message.error(`Failed to record absence case: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: 'Employee ID',
      dataIndex: 'employeeId',
      key: 'employeeId',
      render: (id: string) => <Tag color="blue">{id}</Tag>,
    },
    {
      title: 'Absence Period',
      key: 'dates',
      render: (_: any, r: AbsenceRecord) =>
        r.absenceDates && r.absenceDates.length > 0
          ? `${r.absenceDates[0]} to ${r.absenceDates[r.absenceDates.length - 1]}`
          : '-',
    },
    {
      title: 'Policy Reference',
      dataIndex: 'policyReference',
      key: 'policyReference',
    },
    {
      title: 'Deadline',
      dataIndex: 'responseDeadline',
      key: 'responseDeadline',
      render: (d: string) => <Tag color="volcano">{d}</Tag>,
    },
    {
      title: 'Case Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        switch (status) {
          case 'notice_sent':
            return <Tag color="orange">Notice Sent (Awaiting Response)</Tag>;
          case 'response_received':
            return <Tag color="cyan">Response Received</Tag>;
          case 'resolved':
            return <Tag color="green">Resolved</Tag>;
          case 'terminated':
            return <Tag color="red">Separation Action</Tag>;
          default:
            return <Tag>{status}</Tag>;
        }
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, r: AbsenceRecord) => (
        <Space size="small">
          {r.relatedDocumentIds && r.relatedDocumentIds[0] && (
            <Button
              size="small"
              icon={<FileDoneOutlined />}
              onClick={() => navigate(`/documents/${r.relatedDocumentIds[0]}`)}
            >
              View Notice
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Unauthorized Absence & Job Abandonment Management"
        subtitle="Manage unexplained absence cases, record outreach attempts, issue neutral show-cause notices, and track escalation with statutory due process."
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setModalVisible(true);
            }}
          >
            Report Unauthorized Absence
          </Button>
        }
      />

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: '20px' }}
        message="Standard Legal Practice Reminder"
        description="Do not immediately label an employee as absconding or terminate their employment based on missed attendance alone. Send a neutral explanation notice with a defined response window (e.g. 48 hours) to ensure legal compliance and documentation integrity."
      />

      <Card title="Active Absence Cases & Formal Notices">
        <Table
          dataSource={absenceCases ?? []}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* NEW CASE MODAL */}
      <Modal
        title="Report Unauthorized Absence & Issue Formal Explanation Notice"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={700}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<FileDoneOutlined />}
            loading={saving}
            onClick={handleCreateCase}
          >
            Generate Official Absence Notice
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            deadlineHours: '48',
            policyReference: 'Company Attendance & Discipline Policy Clause 7',
          }}
        >
          <Form.Item label="Select Employee from Directory">
            <Select
              placeholder="Search employee..."
              showSearch
              optionFilterProp="label"
              onChange={handleSelectEmployee}
              options={(employees ?? []).map((e) => ({
                value: e.id,
                label: `${e.fullName} (${e.employeeId}) – ${e.designation}`,
              }))}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="employeeName"
                label="Employee Name"
                rules={[{ required: true }]}
              >
                <Input placeholder="e.g. Tanisha Roy" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="employeeId"
                label="Employee ID"
                rules={[{ required: true }]}
              >
                <Input placeholder="e.g. ESL028" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="designation" label="Designation" rules={[{ required: true }]}>
                <Input placeholder="e.g. Customer Support Executive" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="department" label="Department" rules={[{ required: true }]}>
                <Input placeholder="e.g. Operations" />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '12px 0' }}>Absence Period & Contact</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Absence Start Date"
                rules={[{ required: true }]}
              >
                <Input placeholder="e.g. 18 October 2026" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="Absence Until Date"
                rules={[{ required: true }]}
              >
                <Input placeholder="e.g. 22 October 2026" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="deadlineHours"
                label="Response Deadline (Hours)"
                rules={[{ required: true }]}
              >
                <Input placeholder="48" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="policyReference"
                label="Applicable Attendance Policy Reference"
              >
                <Input placeholder="e.g. Code of Conduct, Section 4.2" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="contactNotes"
            label="Prior Contact Attempts Made (Phone/Email/WhatsApp)"
          >
            <TextArea
              rows={2}
              placeholder="e.g. Telephoned employee mobile number twice on 20 Oct and 21 Oct with no response. Sent WhatsApp follow-up."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

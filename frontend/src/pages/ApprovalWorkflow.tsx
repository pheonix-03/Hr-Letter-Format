// ============================================================
// Approval Workflow Page – Multi-Level Document Review
// ============================================================
import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Input,
  message,
  Typography,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../store/db';
import { useApp } from '../contexts/AppContext';
import { PageHeader } from '../components/PageHeader';
import { logAction } from '../services/auditService';
import type { GeneratedDocument } from '../types';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

export const ApprovalWorkflow: React.FC = () => {
  const navigate = useNavigate();
  const { currentCompanyId, user } = useApp();
  const [selectedDoc, setSelectedDoc] = useState<GeneratedDocument | null>(null);
  const [comments, setComments] = useState('');
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  const pendingDocs = useLiveQuery(async () => {
    if (!currentCompanyId) return [];
    return await db.documents
      .where('companyId')
      .equals(currentCompanyId)
      .and((d) => d.status === 'under_review')
      .toArray();
  }, [currentCompanyId]);

  const approvedDocs = useLiveQuery(async () => {
    if (!currentCompanyId) return [];
    return await db.documents
      .where('companyId')
      .equals(currentCompanyId)
      .and((d) => d.status === 'approved' || d.status === 'issued')
      .reverse()
      .sortBy('updatedAt');
  }, [currentCompanyId]);

  const handleApprove = async () => {
    if (!selectedDoc) return;
    try {
      await db.documents.update(selectedDoc.id, {
        status: 'approved',
        notes: (selectedDoc.notes || '') + ` | Approved by ${user?.name || 'HR Reviewer'}: ${comments}`,
      });
      if (currentCompanyId) {
        await logAction(
          currentCompanyId,
          user?.id || 'anonymous',
          user?.name || 'User',
          'approve',
          'document',
          selectedDoc.id,
          { comments },
        );
      }
      message.success('Document approved successfully');
      setReviewModalVisible(false);
      setComments('');
    } catch (err) {
      message.error('Failed to approve document');
    }
  };

  const handleReject = async () => {
    if (!selectedDoc) return;
    try {
      await db.documents.update(selectedDoc.id, {
        status: 'draft',
        notes: (selectedDoc.notes || '') + ` | Revisions requested by ${user?.name || 'Reviewer'}: ${comments}`,
      });
      if (currentCompanyId) {
        await logAction(
          currentCompanyId,
          user?.id || 'anonymous',
          user?.name || 'User',
          'reject',
          'document',
          selectedDoc.id,
          { comments },
        );
      }
      message.warning('Document returned for revision');
      setReviewModalVisible(false);
      setComments('');
    } catch (err) {
      message.error('Failed to reject document');
    }
  };

  const columns = [
    {
      title: 'Reference No',
      dataIndex: 'referenceNumber',
      key: 'referenceNumber',
      render: (ref: string, r: GeneratedDocument) => (
        <Text strong>{ref || 'DRAFT'}</Text>
      ),
    },
    {
      title: 'Document Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Employee Name',
      key: 'employee',
      render: (_: any, r: GeneratedDocument) => r.filledData?.employee_name || '-',
    },
    {
      title: 'Date Created',
      dataIndex: 'letterDate',
      key: 'letterDate',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'approved' ? 'green' : status === 'issued' ? 'blue' : 'gold'}>
          {status.replace(/_/g, ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: GeneratedDocument) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedDoc(record);
              setReviewModalVisible(true);
            }}
          >
            Review & Sign-Off
          </Button>
          <Button
            size="small"
            onClick={() => navigate(`/documents/${record.id}`)}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Signatures & Document Approval Workflow"
        subtitle="Manage peer-review, manager sign-offs, and multi-level authorization for high-impact employment communications."
      />

      <Card>
        <Tabs
          defaultActiveKey="pending"
          items={[
            {
              key: 'pending',
              label: `Pending Approvals (${(pendingDocs ?? []).length})`,
              children: (
                <Table
                  dataSource={pendingDocs ?? []}
                  columns={columns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
            {
              key: 'history',
              label: `Approval History (${(approvedDocs ?? []).length})`,
              children: (
                <Table
                  dataSource={approvedDocs ?? []}
                  columns={columns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* REVIEW & SIGN-OFF MODAL */}
      <Modal
        title={`Review Document: ${selectedDoc?.title || ''}`}
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        width={650}
        footer={[
          <Button key="cancel" onClick={() => setReviewModalVisible(false)}>
            Close
          </Button>,
          <Button key="reject" danger icon={<CloseOutlined />} onClick={handleReject}>
            Request Revision
          </Button>,
          <Button key="approve" type="primary" icon={<CheckOutlined />} onClick={handleApprove}>
            Approve & Authorize
          </Button>,
        ]}
      >
        {selectedDoc && (
          <div>
            <Paragraph>
              <strong>Employee:</strong> {selectedDoc.filledData?.employee_name} (
              {selectedDoc.filledData?.employee_id})
            </Paragraph>
            <Paragraph>
              <strong>Reference Number:</strong> {selectedDoc.referenceNumber}
            </Paragraph>
            <Paragraph>
              <strong>Date:</strong> {selectedDoc.letterDate}
            </Paragraph>

            <div
              style={{
                backgroundColor: '#f9fafb',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                maxHeight: '220px',
                overflowY: 'auto',
                fontSize: '12px',
                lineHeight: 1.6,
                fontFamily: 'monospace',
                marginBottom: '16px',
                whiteSpace: 'pre-wrap',
              }}
            >
              {selectedDoc.renderedContent}
            </div>

            <Text strong style={{ display: 'block', marginBottom: '6px' }}>
              Review Comments / Sign-off Remarks:
            </Text>
            <TextArea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="e.g. Terms reviewed and approved in accordance with executive policy."
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

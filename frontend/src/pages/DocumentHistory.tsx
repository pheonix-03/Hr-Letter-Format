// ============================================================
// Document History & Library Page with Bulk ZIP Download
// ============================================================
import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Popconfirm,
  Card,
  Alert,
  Progress,
  message,
  Typography,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  DownloadOutlined,
  PlusOutlined,
  FileWordOutlined,
  FilePdfOutlined,
  FileZipOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../store/db';
import { useApp } from '../contexts/AppContext';
import { PageHeader } from '../components/PageHeader';
import { logAction } from '../services/auditService';
import { bulkDownloadDocxZip, bulkDownloadPdfZip } from '../services/bulkDownloadService';
import type { GeneratedDocument } from '../types';

const { Text } = Typography;

export const DocumentHistory: React.FC = () => {
  const navigate = useNavigate();
  const { currentCompanyId, currentCompany, user } = useApp();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState<{ current: number; total: number; name: string } | null>(null);

  const documents = useLiveQuery(async () => {
    if (!currentCompanyId) return [];
    return await db.documents
      .where('companyId')
      .equals(currentCompanyId)
      .reverse()
      .sortBy('createdAt');
  }, [currentCompanyId]);

  const letterheads = useLiveQuery(async () => {
    if (!currentCompanyId) return [];
    return await db.letterheads.where('companyId').equals(currentCompanyId).toArray();
  }, [currentCompanyId]);

  const filteredDocs = (documents ?? []).filter((doc) => {
    const matchesSearch =
      doc.referenceNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
      doc.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      doc.filledData?.employee_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      doc.filledData?.employee_id?.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const selectedDocuments = (documents ?? []).filter((doc) => selectedRowKeys.includes(doc.id));

  const handleBulkDownloadDocx = async (docsToDownload: GeneratedDocument[]) => {
    if (!currentCompany || docsToDownload.length === 0) return;
    try {
      setIsZipping(true);
      const activeLh = letterheads?.find((l) => l.isDefault) || letterheads?.[0] || {};
      const companyTag = (currentCompany.tradeName || currentCompany.legalName).replace(/\s+/g, '_');
      const zipName = `${companyTag}_Selected_HR_Letters_${new Date().toISOString().split('T')[0]}.zip`;

      await bulkDownloadDocxZip(docsToDownload, activeLh, currentCompany, zipName, (curr, tot, name) => {
        setZipProgress({ current: curr, total: tot, name });
      });

      message.success(`Downloaded ${docsToDownload.length} Word (.docx) files as ZIP!`);
    } catch (err: any) {
      console.error(err);
      message.error(`Bulk download error: ${err.message}`);
    } finally {
      setIsZipping(false);
      setZipProgress(null);
    }
  };

  const handleBulkDownloadPdf = async (docsToDownload: GeneratedDocument[]) => {
    if (!currentCompany || docsToDownload.length === 0) return;
    try {
      setIsZipping(true);
      const activeLh = letterheads?.find((l) => l.isDefault) || letterheads?.[0] || {};
      const companyTag = (currentCompany.tradeName || currentCompany.legalName).replace(/\s+/g, '_');
      const zipName = `${companyTag}_Selected_PDFs_${new Date().toISOString().split('T')[0]}.zip`;

      await bulkDownloadPdfZip(docsToDownload, activeLh, currentCompany, zipName, (curr, tot, name) => {
        setZipProgress({ current: curr, total: tot, name });
      });

      message.success(`Downloaded ${docsToDownload.length} PDF files as ZIP!`);
    } catch (err: any) {
      console.error(err);
      message.error(`Bulk PDF download error: ${err.message}`);
    } finally {
      setIsZipping(false);
      setZipProgress(null);
    }
  };

  const handleDelete = async (id: string, ref: string) => {
    try {
      await db.documents.delete(id);
      if (currentCompanyId) {
        await logAction(
          currentCompanyId,
          user?.id || 'anonymous',
          user?.name || 'User',
          'delete',
          'document',
          id,
          { referenceNumber: ref },
        );
      }
      message.success('Document deleted');
    } catch (err) {
      message.error('Failed to delete document');
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'issued':
        return <Tag color="green">Issued</Tag>;
      case 'draft':
        return <Tag color="default">Draft</Tag>;
      case 'under_review':
        return <Tag color="gold">Under Review</Tag>;
      case 'approved':
        return <Tag color="blue">Approved</Tag>;
      case 'superseded':
        return <Tag color="purple">Superseded</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Reference No',
      dataIndex: 'referenceNumber',
      key: 'referenceNumber',
      render: (ref: string, record: GeneratedDocument) => (
        <a onClick={() => navigate(`/documents/${record.id}`)} style={{ fontWeight: 600 }}>
          {ref || 'DRAFT'}
        </a>
      ),
    },
    {
      title: 'Document Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Employee',
      key: 'employee',
      render: (_: any, record: GeneratedDocument) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.filledData?.employee_name || 'Manual Recipient'}
          </div>
          {record.filledData?.employee_id && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              ID: {record.filledData.employee_id}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Issue Date',
      dataIndex: 'letterDate',
      key: 'letterDate',
    },
    {
      title: 'Effective Date',
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      render: (date: string) => date || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: GeneratedDocument) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/documents/${record.id}`)}
          >
            View / Print
          </Button>
          <Popconfirm
            title="Delete Document"
            description="Are you sure you want to delete this document from history?"
            onConfirm={() => handleDelete(record.id, record.referenceNumber)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Documents History & Repository"
        subtitle={`Search, view, download individually, or bulk-export all letters generated for ${currentCompany?.tradeName || currentCompany?.legalName || 'your company'}.`}
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/generate')}
            >
              Generate New Letter
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => navigate('/employees/batch-upload')}
            >
              Excel Batch Upload
            </Button>
          </Space>
        }
      />

      {isZipping && zipProgress && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
          message={`Compressing ${zipProgress.current} of ${zipProgress.total} into ZIP: ${zipProgress.name}`}
          description={
            <Progress
              percent={Math.round((zipProgress.current / zipProgress.total) * 100)}
              status="active"
            />
          }
        />
      )}

      {/* BULK SELECTION ACTION BAR */}
      {selectedRowKeys.length > 0 && (
        <Card
          size="small"
          style={{
            marginBottom: '16px',
            backgroundColor: '#e6f4ff',
            borderColor: '#91caff',
          }}
        >
          <Space direction="horizontal" style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text strong>
              {selectedRowKeys.length} document(s) selected
            </Text>
            <Space>
              <Button
                type="primary"
                icon={<FileWordOutlined />}
                loading={isZipping}
                onClick={() => handleBulkDownloadDocx(selectedDocuments)}
                style={{ backgroundColor: '#2b579a', borderColor: '#2b579a' }}
              >
                Bulk Download Selected as ZIP (Word .docx)
              </Button>
              <Button
                type="primary"
                danger
                icon={<FilePdfOutlined />}
                loading={isZipping}
                onClick={() => handleBulkDownloadPdf(selectedDocuments)}
              >
                Bulk Download Selected as ZIP (PDF)
              </Button>
              <Button onClick={() => setSelectedRowKeys([])}>Clear Selection</Button>
            </Space>
          </Space>
        </Card>
      )}

      <Card style={{ marginBottom: '16px' }}>
        <Space direction="horizontal" size={16} wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space wrap>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search by Ref#, title, employee..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '280px' }}
            />

            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '150px' }}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'issued', label: 'Issued' },
                { value: 'draft', label: 'Draft' },
                { value: 'under_review', label: 'Under Review' },
                { value: 'approved', label: 'Approved' },
              ]}
            />

            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: '220px' }}
              options={[
                { value: 'all', label: 'All Categories' },
                { value: 'employment_onboarding', label: 'Employment & Onboarding' },
                { value: 'resignation_separation', label: 'Resignation & Separation' },
                { value: 'disciplinary_performance', label: 'Disciplinary & Performance' },
                { value: 'general_hr', label: 'General HR & Certificates' },
              ]}
            />
          </Space>

          {filteredDocs.length > 0 && selectedRowKeys.length === 0 && (
            <Button
              icon={<FileZipOutlined />}
              onClick={() => handleBulkDownloadDocx(filteredDocs)}
              loading={isZipping}
            >
              Download All Displayed ({filteredDocs.length}) as ZIP
            </Button>
          )}
        </Space>
      </Card>

      <Card>
        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          dataSource={filteredDocs}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

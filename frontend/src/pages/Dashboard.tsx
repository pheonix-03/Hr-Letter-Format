// ============================================================
// Dashboard Page – HR Letter Generator
// ============================================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Button,
  Typography,
  Space,
  Empty,
  Tooltip,
} from 'antd';
import {
  BankOutlined,
  TeamOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  FileProtectOutlined,
  WarningOutlined,
  UploadOutlined,
  EyeOutlined,
  DownloadOutlined,
  FileDoneOutlined,
  DollarOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../store/db';
import { useApp } from '../contexts/AppContext';
import type { GeneratedDocument, DocumentStatus, Employee } from '../types';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

const statusColorMap: Record<DocumentStatus, string> = {
  draft: 'default',
  under_review: 'processing',
  revision_requested: 'warning',
  approved: 'cyan',
  issued: 'success',
  superseded: 'purple',
  cancelled: 'error',
};

const statusLabelMap: Record<DocumentStatus, string> = {
  draft: 'Draft',
  under_review: 'Under Review',
  revision_requested: 'Revision Requested',
  approved: 'Approved',
  issued: 'Issued',
  superseded: 'Superseded',
  cancelled: 'Cancelled',
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, currentCompanyId } = useApp();

  // -- Statistics --
  const companiesCount = useLiveQuery(() => db.companies.count(), []);
  const employeesCount = useLiveQuery(
    () =>
      currentCompanyId
        ? db.employees.where('companyId').equals(currentCompanyId).count()
        : db.employees.count(),
    [currentCompanyId],
  );
  const documentsCount = useLiveQuery(
    () =>
      currentCompanyId
        ? db.documents.where('companyId').equals(currentCompanyId).count()
        : db.documents.count(),
    [currentCompanyId],
  );
  const pendingApprovalsCount = useLiveQuery(
    () =>
      currentCompanyId
        ? db.approvalWorkflows
            .where('[companyId+status]' as never)
            .equals([currentCompanyId, 'pending'] as never)
            .count()
            .catch(() =>
              db.approvalWorkflows
                .where('companyId')
                .equals(currentCompanyId)
                .filter((w) => w.status === 'pending' || w.status === 'in_progress')
                .count(),
            )
        : db.approvalWorkflows
            .filter((w) => w.status === 'pending' || w.status === 'in_progress')
            .count(),
    [currentCompanyId],
  );

  // -- Recent documents (last 10) --
  const recentDocs = useLiveQuery(async () => {
    let docs: GeneratedDocument[];
    if (currentCompanyId) {
      docs = await db.documents
        .where('companyId')
        .equals(currentCompanyId)
        .reverse()
        .sortBy('createdAt');
    } else {
      docs = await db.documents.orderBy('createdAt').reverse().toArray();
    }
    return docs.slice(0, 10);
  }, [currentCompanyId]);

  // -- Drafts --
  const drafts = useLiveQuery(async () => {
    let docs: GeneratedDocument[];
    if (currentCompanyId) {
      docs = await db.documents
        .where('companyId')
        .equals(currentCompanyId)
        .filter((d) => d.status === 'draft')
        .toArray();
    } else {
      docs = await db.documents.filter((d) => d.status === 'draft').toArray();
    }
    return docs.slice(0, 5);
  }, [currentCompanyId]);

  // -- Pending approvals docs --
  const pendingDocs = useLiveQuery(async () => {
    let docs: GeneratedDocument[];
    if (currentCompanyId) {
      docs = await db.documents
        .where('companyId')
        .equals(currentCompanyId)
        .filter((d) => d.status === 'under_review')
        .toArray();
    } else {
      docs = await db.documents.filter((d) => d.status === 'under_review').toArray();
    }
    return docs.slice(0, 5);
  }, [currentCompanyId]);

  // -- All employees (for name lookup) --
  const employees = useLiveQuery(() => db.employees.toArray(), []);
  const employeeMap = React.useMemo(() => {
    const map: Record<string, Employee> = {};
    (employees ?? []).forEach((e) => {
      map[e.id] = e;
    });
    return map;
  }, [employees]);

  // -- Frequently used templates --
  const frequentTemplates = useLiveQuery(async () => {
    const templates = currentCompanyId
      ? await db.templates
          .where('companyId')
          .equals(currentCompanyId)
          .toArray()
      : await db.templates.toArray();

    const globalTemplates = await db.templates
      .filter((t) => t.isGlobal)
      .toArray();

    const combined = [...templates];
    globalTemplates.forEach((gt) => {
      if (!combined.find((t) => t.id === gt.id)) combined.push(gt);
    });

    return combined.slice(0, 6);
  }, [currentCompanyId]);

  // -- Table columns --
  const docColumns: ColumnsType<GeneratedDocument> = [
    {
      title: 'Reference #',
      dataIndex: 'referenceNumber',
      key: 'referenceNumber',
      width: 160,
      render: (text: string) => (
        <Text strong style={{ fontFamily: 'monospace', fontSize: 13 }}>
          {text || '—'}
        </Text>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Employee',
      dataIndex: 'employeeId',
      key: 'employee',
      width: 180,
      render: (empId: string) => {
        const emp = employeeMap[empId];
        return emp ? emp.fullName : '—';
      },
    },
    {
      title: 'Date',
      dataIndex: 'letterDate',
      key: 'letterDate',
      width: 120,
      render: (d: string) => (d ? new Date(d).toLocaleDateString() : '—'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: DocumentStatus) => (
        <Tag color={statusColorMap[status]}>{statusLabelMap[status]}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: GeneratedDocument) => (
        <Space>
          <Tooltip title="View">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/documents/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Download">
            <Button
              type="text"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => {
                if (record.pdfBlob) {
                  const byteArray = Uint8Array.from(atob(record.pdfBlob), (c) =>
                    c.charCodeAt(0),
                  );
                  const blob = new Blob([byteArray], { type: 'application/pdf' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${record.referenceNumber || record.title}.pdf`;
                  a.click();
                  URL.revokeObjectURL(url);
                } else if (record.docxBlob) {
                  const byteArray = Uint8Array.from(atob(record.docxBlob), (c) =>
                    c.charCodeAt(0),
                  );
                  const blob = new Blob([byteArray], {
                    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${record.referenceNumber || record.title}.docx`;
                  a.click();
                  URL.revokeObjectURL(url);
                }
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // -- Quick Action definitions --
  const quickActions = [
    {
      title: 'Offer Letter',
      icon: <FileTextOutlined style={{ fontSize: 28, color: '#1890ff' }} />,
      color: '#e6f7ff',
      borderColor: '#91d5ff',
      templateSubcategory: 'offer_letter',
    },
    {
      title: 'Experience Certificate',
      icon: <SafetyCertificateOutlined style={{ fontSize: 28, color: '#52c41a' }} />,
      color: '#f6ffed',
      borderColor: '#b7eb8f',
      templateSubcategory: 'experience_certificate',
    },
    {
      title: 'Relieving Letter',
      icon: <FileProtectOutlined style={{ fontSize: 28, color: '#722ed1' }} />,
      color: '#f9f0ff',
      borderColor: '#d3adf7',
      templateSubcategory: 'relieving_letter',
    },
    {
      title: 'Salary Certificate',
      icon: <DollarOutlined style={{ fontSize: 28, color: '#faad14' }} />,
      color: '#fffbe6',
      borderColor: '#ffe58f',
      templateSubcategory: 'salary_certificate',
    },
    {
      title: 'Warning Letter',
      icon: <WarningOutlined style={{ fontSize: 28, color: '#ff4d4f' }} />,
      color: '#fff2f0',
      borderColor: '#ffa39e',
      templateSubcategory: 'warning_letter',
    },
    {
      title: 'Batch Upload',
      icon: <UploadOutlined style={{ fontSize: 28, color: '#13c2c2' }} />,
      color: '#e6fffb',
      borderColor: '#87e8de',
      templateSubcategory: '_batch',
    },
  ];

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ marginBottom: 4 }}>
          Welcome back, {user?.name ?? 'User'}! 👋
        </Title>
        <Text type="secondary">
          Here&apos;s what&apos;s happening with your HR documents today.
        </Text>
      </div>

      {/* Statistics Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card hoverable style={{ borderRadius: 12 }}>
            <Statistic
              title="Total Companies"
              value={companiesCount ?? 0}
              prefix={<BankOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable style={{ borderRadius: 12 }}>
            <Statistic
              title="Total Employees"
              value={employeesCount ?? 0}
              prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable style={{ borderRadius: 12 }}>
            <Statistic
              title="Documents Generated"
              value={documentsCount ?? 0}
              prefix={<FileTextOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable style={{ borderRadius: 12 }}>
            <Statistic
              title="Pending Approvals"
              value={pendingApprovalsCount ?? 0}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card
        title={
          <Space>
            <PlusOutlined />
            <span>Quick Actions</span>
          </Space>
        }
        style={{ marginBottom: 24, borderRadius: 12 }}
      >
        <Row gutter={[12, 12]}>
          {quickActions.map((qa) => (
            <Col xs={12} sm={8} md={4} key={qa.templateSubcategory}>
              <Card
                hoverable
                style={{
                  textAlign: 'center',
                  borderRadius: 12,
                  background: qa.color,
                  border: `1px solid ${qa.borderColor}`,
                  cursor: 'pointer',
                }}
                bodyStyle={{ padding: '20px 12px' }}
                onClick={() => {
                  if (qa.templateSubcategory === '_batch') {
                    navigate('/batch-upload');
                  } else {
                    navigate(`/generate?template=${qa.templateSubcategory}`);
                  }
                }}
              >
                <div style={{ marginBottom: 8 }}>{qa.icon}</div>
                <Text strong style={{ fontSize: 12 }}>
                  {qa.title}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Recent Documents */}
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <span>Recent Documents</span>
          </Space>
        }
        extra={
          <Button type="link" onClick={() => navigate('/documents')}>
            View All
          </Button>
        }
        style={{ marginBottom: 24, borderRadius: 12 }}
      >
        <Table<GeneratedDocument>
          columns={docColumns}
          dataSource={recentDocs ?? []}
          rowKey="id"
          pagination={false}
          size="small"
          locale={{ emptyText: <Empty description="No documents yet" /> }}
        />
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Drafts */}
        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <FileDoneOutlined />
                <span>Drafts Awaiting Completion</span>
              </Space>
            }
            style={{ borderRadius: 12, height: '100%' }}
          >
            {drafts && drafts.length > 0 ? (
              <div>
                {drafts.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    <div>
                      <Text strong style={{ fontSize: 13 }}>
                        {doc.title}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {doc.referenceNumber || 'No reference'} •{' '}
                        {employeeMap[doc.employeeId]?.fullName ?? '—'}
                      </Text>
                    </div>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => navigate(`/generate?edit=${doc.id}`)}
                    >
                      Continue
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="No drafts" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>

        {/* Pending Approvals */}
        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                <span>Pending Approval</span>
              </Space>
            }
            style={{ borderRadius: 12, height: '100%' }}
          >
            {pendingDocs && pendingDocs.length > 0 ? (
              <div>
                {pendingDocs.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    <div>
                      <Text strong style={{ fontSize: 13 }}>
                        {doc.title}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {doc.referenceNumber || 'No reference'} •{' '}
                        {employeeMap[doc.employeeId]?.fullName ?? '—'}
                      </Text>
                    </div>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => navigate(`/documents/${doc.id}`)}
                    >
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <Empty
                description="No pending approvals"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Frequently Used Templates */}
      <Card
        title={
          <Space>
            <StarOutlined />
            <span>Available Templates</span>
          </Space>
        }
        style={{ borderRadius: 12 }}
      >
        {frequentTemplates && frequentTemplates.length > 0 ? (
          <Row gutter={[12, 12]}>
            {frequentTemplates.map((tmpl) => (
              <Col xs={12} sm={8} md={4} key={tmpl.id}>
                <Card
                  hoverable
                  size="small"
                  style={{ textAlign: 'center', borderRadius: 8 }}
                  bodyStyle={{ padding: '16px 8px' }}
                  onClick={() => navigate(`/generate?templateId=${tmpl.id}`)}
                >
                  <FileTextOutlined
                    style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }}
                  />
                  <br />
                  <Text
                    strong
                    style={{ fontSize: 12 }}
                    ellipsis={{ tooltip: tmpl.name }}
                  >
                    {tmpl.name}
                  </Text>
                  <br />
                  <Tag
                    style={{ marginTop: 4, fontSize: 10 }}
                    color={
                      tmpl.category === 'employment_onboarding'
                        ? 'blue'
                        : tmpl.category === 'resignation_separation'
                          ? 'orange'
                          : tmpl.category === 'disciplinary_performance'
                            ? 'red'
                            : 'green'
                    }
                  >
                    {tmpl.category.replace(/_/g, ' ')}
                  </Tag>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty
            description="No templates available"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>
    </div>
  );
};

export default Dashboard;

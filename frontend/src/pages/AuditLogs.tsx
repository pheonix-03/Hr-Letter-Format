// ============================================================
// Audit Logs & Security Trail Page
// ============================================================
import React, { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Input,
  Select,
  Button,
  Space,
  Typography,
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import { useLiveQuery } from 'dexie-react-hooks';
import * as XLSX from 'xlsx';
import { db } from '../store/db';
import { useApp } from '../contexts/AppContext';
import { PageHeader } from '../components/PageHeader';
import type { AuditLog } from '../types';

const { Text } = Typography;

export const AuditLogs: React.FC = () => {
  const { currentCompanyId } = useApp();
  const [searchText, setSearchText] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const logs = useLiveQuery(async () => {
    if (!currentCompanyId) return [];
    return await db.auditLogs
      .where('companyId')
      .equals(currentCompanyId)
      .reverse()
      .sortBy('timestamp');
  }, [currentCompanyId]);

  const filteredLogs = (logs ?? []).filter((log) => {
    const matchesSearch =
      log.action?.toLowerCase().includes(searchText.toLowerCase()) ||
      log.entityType?.toLowerCase().includes(searchText.toLowerCase()) ||
      log.userName?.toLowerCase().includes(searchText.toLowerCase()) ||
      JSON.stringify(log.details).toLowerCase().includes(searchText.toLowerCase());

    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const handleExportAuditExcel = () => {
    const exportData = filteredLogs.map((l) => ({
      Timestamp: l.timestamp,
      User: l.userName,
      Action: l.action,
      'Entity Type': l.entityType,
      'Entity ID': l.entityId,
      Details: JSON.stringify(l.details),
      'IP Address': l.ipAddress,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Logs');
    XLSX.writeFile(workbook, `HR_Letters_Audit_Trail_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getActionTag = (action: string) => {
    switch (action) {
      case 'create':
        return <Tag color="green">CREATE</Tag>;
      case 'issue':
        return <Tag color="blue">ISSUE</Tag>;
      case 'approve':
        return <Tag color="cyan">APPROVE</Tag>;
      case 'reject':
        return <Tag color="red">REJECT</Tag>;
      case 'download':
        return <Tag color="purple">DOWNLOAD</Tag>;
      case 'delete':
        return <Tag color="volcano">DELETE</Tag>;
      case 'batch_generate':
        return <Tag color="gold">BATCH</Tag>;
      default:
        return <Tag>{action.toUpperCase()}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (ts: string) => new Date(ts).toLocaleString(),
    },
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'userName',
      width: 160,
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 120,
      render: (act: string) => getActionTag(act),
    },
    {
      title: 'Entity',
      dataIndex: 'entityType',
      key: 'entityType',
      width: 140,
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      render: (details: Record<string, any>) => (
        <span style={{ fontSize: '12px', color: '#555', fontFamily: 'monospace' }}>
          {JSON.stringify(details)}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Security & Regulatory Audit Trail"
        subtitle="Immutable logging of all document generation, template modifications, approval workflows, and export events."
        extra={
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportAuditExcel}
            disabled={filteredLogs.length === 0}
          >
            Export Audit Trail (Excel)
          </Button>
        }
      />

      <Card style={{ marginBottom: '16px' }}>
        <Space direction="horizontal" size={16} wrap>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search audit trail..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: '300px' }}
          />

          <Select
            value={actionFilter}
            onChange={setActionFilter}
            style={{ width: '160px' }}
            options={[
              { value: 'all', label: 'All Actions' },
              { value: 'create', label: 'Create' },
              { value: 'issue', label: 'Issue' },
              { value: 'approve', label: 'Approve' },
              { value: 'reject', label: 'Reject' },
              { value: 'download', label: 'Download' },
              { value: 'delete', label: 'Delete' },
              { value: 'batch_generate', label: 'Batch Generate' },
            ]}
          />
        </Space>
      </Card>

      <Card>
        <Table
          dataSource={filteredLogs}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 15 }}
        />
      </Card>
    </div>
  );
};

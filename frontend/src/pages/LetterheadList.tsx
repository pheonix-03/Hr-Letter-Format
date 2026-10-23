// ============================================================
// Letterhead List Page – View and Manage Saved Letterheads
// ============================================================
import React from 'react';
import { Card, Table, Button, Space, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../store/db';
import { useApp } from '../contexts/AppContext';
import { PageHeader } from '../components/PageHeader';
import type { LetterheadConfig } from '../types';

export const LetterheadList: React.FC = () => {
  const navigate = useNavigate();
  const { currentCompanyId } = useApp();

  const letterheads = useLiveQuery(async () => {
    if (!currentCompanyId) return [];
    return await db.letterheads.where('companyId').equals(currentCompanyId).toArray();
  }, [currentCompanyId]);

  const handleDelete = async (id: string) => {
    try {
      await db.letterheads.delete(id);
      message.success('Letterhead deleted');
    } catch (err) {
      message.error('Failed to delete letterhead');
    }
  };

  const handleSetDefault = async (record: LetterheadConfig) => {
    try {
      if (!currentCompanyId) return;
      // Clear other defaults
      const all = await db.letterheads.where('companyId').equals(currentCompanyId).toArray();
      for (const lh of all) {
        await db.letterheads.update(lh.id, { isDefault: lh.id === record.id });
      }
      message.success(`Set "${record.name}" as default letterhead`);
    } catch (err) {
      message.error('Failed to set default letterhead');
    }
  };

  const columns = [
    {
      title: 'Letterhead Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: LetterheadConfig) => (
        <div>
          <span style={{ fontWeight: 600 }}>{text}</span>
          {record.isDefault && (
            <Tag color="gold" style={{ marginLeft: '8px' }}>
              Default
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Design Preset',
      dataIndex: 'preset',
      key: 'preset',
      render: (preset: string) => <Tag color="blue">{preset || 'custom'}</Tag>,
    },
    {
      title: 'Page Size',
      dataIndex: 'pageSize',
      key: 'pageSize',
      render: (size: string) => size || 'A4',
    },
    {
      title: 'Margins (T/B/L/R)',
      key: 'margins',
      render: (_: any, r: LetterheadConfig) =>
        `${r.marginTop || 20} / ${r.marginBottom || 20} / ${r.marginLeft || 20} / ${r.marginRight || 20} mm`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: LetterheadConfig) => (
        <Space size="small">
          <Button
            size="small"
            icon={record.isDefault ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
            onClick={() => handleSetDefault(record)}
          >
            {record.isDefault ? 'Default' : 'Make Default'}
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/letterheads/${record.id}/edit`)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Letterhead"
            description="Are you sure you want to delete this letterhead design?"
            onConfirm={() => handleDelete(record.id)}
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
        title="Company Letterheads"
        subtitle="Manage brand letterheads and templates used for official HR letters and document exports."
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/letterheads/new')}
          >
            Create New Letterhead
          </Button>
        }
      />

      <Card>
        <Table
          dataSource={letterheads ?? []}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

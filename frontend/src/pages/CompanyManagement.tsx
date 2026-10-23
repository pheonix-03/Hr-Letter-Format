// ============================================================
// Company Management Page – HR Letter Generator
// ============================================================
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Space,
  Modal,
  Input,
  Avatar,
  Typography,
  Card,
  Tag,
  Tooltip,
  message,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SwapOutlined,
  SearchOutlined,
  BankOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../store/db';
import { useApp } from '../contexts/AppContext';
import type { Company } from '../types';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

const CompanyManagement: React.FC = () => {
  const navigate = useNavigate();
  const { currentCompanyId, switchCompany, user } = useApp();
  const [searchText, setSearchText] = useState('');

  // -- All companies --
  const companies = useLiveQuery(() => db.companies.toArray(), []);

  // -- Employee counts per company --
  const employeeCounts = useLiveQuery(async () => {
    const all = await db.employees.toArray();
    const counts: Record<string, number> = {};
    all.forEach((e) => {
      counts[e.companyId] = (counts[e.companyId] || 0) + 1;
    });
    return counts;
  }, []);

  // -- Filtered data --
  const filteredCompanies = useMemo(() => {
    if (!companies) return [];
    if (!searchText.trim()) return companies;
    const lower = searchText.toLowerCase();
    return companies.filter(
      (c) =>
        c.legalName.toLowerCase().includes(lower) ||
        c.tradeName.toLowerCase().includes(lower) ||
        c.city.toLowerCase().includes(lower) ||
        c.country.toLowerCase().includes(lower) ||
        c.officialEmail.toLowerCase().includes(lower),
    );
  }, [companies, searchText]);

  // -- Delete company --
  const handleDelete = (company: Company) => {
    Modal.confirm({
      title: 'Delete Company',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>
            Are you sure you want to delete{' '}
            <Text strong>{company.legalName}</Text>?
          </p>
          <p style={{ color: '#ff4d4f', fontSize: 13 }}>
            This will also delete all employees, documents, templates, and other
            data associated with this company. This action cannot be undone.
          </p>
        </div>
      ),
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          // Delete associated data
          await db.employees.where('companyId').equals(company.id).delete();
          await db.documents.where('companyId').equals(company.id).delete();
          await db.templates
            .where('companyId')
            .equals(company.id)
            .delete();
          await db.letterheads.where('companyId').equals(company.id).delete();
          await db.brandingConfigs.where('companyId').equals(company.id).delete();
          await db.branches.where('companyId').equals(company.id).delete();
          await db.signatories.where('companyId').equals(company.id).delete();
          await db.employeeBatches.where('companyId').equals(company.id).delete();
          await db.approvalWorkflows.where('companyId').equals(company.id).delete();
          await db.referenceSequences.where('companyId').equals(company.id).delete();
          await db.absenceRecords.where('companyId').equals(company.id).delete();
          await db.terminationWorkflows.where('companyId').equals(company.id).delete();
          await db.auditLogs.where('companyId').equals(company.id).delete();

          // Delete the company itself
          await db.companies.delete(company.id);

          // If this was the current company, switch to another
          if (currentCompanyId === company.id && user) {
            const remaining = await db.companies.toArray();
            if (remaining.length > 0) {
              await switchCompany(remaining[0].id);
            }
          }

          message.success(`"${company.legalName}" has been deleted.`);
        } catch (err) {
          console.error('Delete company error:', err);
          message.error('Failed to delete company.');
        }
      },
    });
  };

  // -- Switch to company --
  const handleSwitch = async (companyId: string) => {
    try {
      await switchCompany(companyId);
      message.success('Switched company successfully.');
    } catch {
      message.error('Failed to switch company.');
    }
  };

  // -- Table columns --
  const columns: ColumnsType<Company> = [
    {
      title: 'Logo',
      dataIndex: 'logoUrl',
      key: 'logo',
      width: 60,
      render: (logoUrl: string, record: Company) => (
        <Avatar
          src={logoUrl || undefined}
          icon={!logoUrl ? <BankOutlined /> : undefined}
          style={{
            backgroundColor: logoUrl ? 'transparent' : '#1890ff',
          }}
        />
      ),
    },
    {
      title: 'Legal Name',
      dataIndex: 'legalName',
      key: 'legalName',
      sorter: (a, b) => a.legalName.localeCompare(b.legalName),
      render: (text: string, record: Company) => (
        <div>
          <Text strong>{text}</Text>
          {record.id === currentCompanyId && (
            <Tag color="blue" style={{ marginLeft: 8, fontSize: 10 }}>
              ACTIVE
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Trade Name',
      dataIndex: 'tradeName',
      key: 'tradeName',
      responsive: ['lg'],
      render: (text: string) => text || '—',
    },
    {
      title: 'Location',
      key: 'location',
      responsive: ['md'],
      render: (_: unknown, record: Company) =>
        [record.city, record.country].filter(Boolean).join(', ') || '—',
    },
    {
      title: 'Email',
      dataIndex: 'officialEmail',
      key: 'email',
      responsive: ['lg'],
      render: (text: string) => text || '—',
    },
    {
      title: 'Phone',
      dataIndex: 'contactNumber',
      key: 'phone',
      responsive: ['xl'],
      render: (text: string) => text || '—',
    },
    {
      title: 'Employees',
      key: 'employeeCount',
      width: 100,
      align: 'center',
      sorter: (a, b) =>
        (employeeCounts?.[a.id] ?? 0) - (employeeCounts?.[b.id] ?? 0),
      render: (_: unknown, record: Company) => (
        <Tag>{employeeCounts?.[record.id] ?? 0}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_: unknown, record: Company) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/companies/${record.id}/edit`);
              }}
            />
          </Tooltip>
          {record.id !== currentCompanyId && (
            <Tooltip title="Switch to this company">
              <Button
                type="text"
                size="small"
                icon={<SwapOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSwitch(record.id);
                }}
              />
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(record);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Company Management
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/companies/new')}
        >
          Add Company
        </Button>
      </div>

      <Card style={{ borderRadius: 12 }}>
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search by name, city, country, or email..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ maxWidth: 400 }}
          />
        </div>

        <Table<Company>
          columns={columns}
          dataSource={filteredCompanies}
          rowKey="id"
          loading={companies === undefined}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} companies`,
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/companies/${record.id}/edit`),
            style: { cursor: 'pointer' },
          })}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default CompanyManagement;

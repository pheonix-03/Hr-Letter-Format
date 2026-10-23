// ============================================================
// CompanySelector – Dropdown to switch active company
// ============================================================
import React, { useCallback } from 'react';
import { Select, Space, Typography, Divider, Button } from 'antd';
import { PlusOutlined, BankOutlined } from '@ant-design/icons';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../store/db';

const { Text } = Typography;

interface CompanySelectorProps {
  currentCompanyId: string | null;
  onCompanyChange: (companyId: string) => void;
  style?: React.CSSProperties;
}

const CompanySelector: React.FC<CompanySelectorProps> = ({
  currentCompanyId,
  onCompanyChange,
  style,
}) => {
  const navigate = useNavigate();

  const companies = useLiveQuery(() => db.companies.toArray(), []);

  const handleAddNewCompany = useCallback(() => {
    navigate('/companies/new');
  }, [navigate]);

  const options = (companies ?? []).map((company) => ({
    value: company.id,
    label: (
      <Space size={8}>
        <BankOutlined style={{ color: '#1677ff' }} />
        <span>{company.tradeName || company.legalName}</span>
      </Space>
    ),
    searchLabel: `${company.tradeName} ${company.legalName}`,
  }));

  const dropdownRender = useCallback(
    (menu: React.ReactNode) => (
      <>
        {menu}
        <Divider style={{ margin: '8px 0' }} />
        <Button
          type="text"
          icon={<PlusOutlined />}
          onClick={handleAddNewCompany}
          block
          style={{
            textAlign: 'left',
            padding: '4px 12px',
            color: '#1677ff',
            fontWeight: 500,
          }}
        >
          Add New Company
        </Button>
      </>
    ),
    [handleAddNewCompany],
  );

  if (!companies) {
    return null;
  }

  if (companies.length === 0) {
    return (
      <Button
        type="primary"
        icon={<PlusOutlined />}
        size="small"
        onClick={handleAddNewCompany}
      >
        Add Company
      </Button>
    );
  }

  return (
    <Select
      value={currentCompanyId ?? undefined}
      onChange={onCompanyChange}
      style={{ minWidth: 220, ...style }}
      placeholder="Select Company"
      showSearch
      filterOption={(input, option) =>
        (option?.searchLabel as string ?? '')
          .toLowerCase()
          .includes(input.toLowerCase())
      }
      options={options}
      dropdownRender={dropdownRender}
      notFoundContent={
        <Text type="secondary" style={{ padding: 8, display: 'block' }}>
          No companies found
        </Text>
      }
      size="middle"
    />
  );
};

export default CompanySelector;

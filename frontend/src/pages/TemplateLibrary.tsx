// ============================================================
// Template Library Page – Search, Filter & Use Templates
// ============================================================
import React, { useState } from 'react';
import {
  Card,
  Input,
  Tabs,
  Row,
  Col,
  Tag,
  Button,
  Space,
  Typography,
  Badge,
} from 'antd';
import {
  SearchOutlined,
  FileAddOutlined,
  EditOutlined,
  PlusOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { allTemplates, getTemplateCategories } from '../templates';
import { db } from '../store/db';
import { useApp } from '../contexts/AppContext';
import { PageHeader } from '../components/PageHeader';
import type { HRTemplate } from '../types';

const { Title, Paragraph, Text } = Typography;

export const TemplateLibrary: React.FC = () => {
  const navigate = useNavigate();
  const { currentCompanyId } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Custom company templates from Dexie
  const customTemplates = useLiveQuery(async () => {
    if (!currentCompanyId) return [];
    return await db.templates.where('companyId').equals(currentCompanyId).toArray();
  }, [currentCompanyId]);

  const combinedTemplates: HRTemplate[] = [
    ...allTemplates,
    ...(customTemplates ?? []),
  ];

  const filteredTemplates = combinedTemplates.filter((t) => {
    const matchesCategory =
      activeCategory === 'all' ||
      t.category === activeCategory ||
      (activeCategory === 'custom' && t.companyId !== null);

    const matchesSearch =
      !searchQuery.trim() ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const categories = getTemplateCategories();

  return (
    <div>
      <PageHeader
        title="HR Letter Template Library"
        subtitle="Search and select from standard, legally sound HR templates across onboarding, discipline, separation, and employee services."
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/templates/new')}
          >
            Create Custom Template
          </Button>
        }
      />

      <Card style={{ marginBottom: '20px' }}>
        <Row gutter={16} align="middle">
          <Col span={14}>
            <Input
              size="large"
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Search templates by keyword (e.g., PIP, Warning, Relieving, Offer, Salary)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={10} style={{ textAlign: 'right' }}>
            <Text type="secondary">
              Showing <strong>{filteredTemplates.length}</strong> available templates
            </Text>
          </Col>
        </Row>
      </Card>

      <Tabs
        activeKey={activeCategory}
        onChange={setActiveCategory}
        style={{ marginBottom: '16px' }}
        items={[
          { key: 'all', label: `All Templates (${combinedTemplates.length})` },
          ...categories.map((c) => ({
            key: c.value,
            label: `${c.label} (${c.count})`,
          })),
          { key: 'custom', label: `Company Custom (${(customTemplates ?? []).length})` },
        ]}
      />

      <Row gutter={[20, 20]}>
        {filteredTemplates.map((template) => (
          <Col xs={24} sm={12} lg={8} key={template.id}>
            <Card
              hoverable
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: '8px',
              }}
              actions={[
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/templates/${template.id}/edit`)}
                >
                  Edit / Duplicate
                </Button>,
                <Button
                  type="primary"
                  icon={<FileAddOutlined />}
                  onClick={() => navigate(`/generate?templateId=${template.id}`)}
                >
                  Use Template
                </Button>,
              ]}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Tag color={getCategoryColor(template.category)}>
                    {template.subcategory || template.category}
                  </Tag>
                  {template.requiresApproval && <Tag color="warning">Requires Approval</Tag>}
                </div>

                <Title level={5} style={{ marginTop: 0, marginBottom: '8px' }}>
                  {template.name}
                </Title>

                <Paragraph
                  type="secondary"
                  ellipsis={{ rows: 2 }}
                  style={{ fontSize: '13px', minHeight: '38px', marginBottom: '12px' }}
                >
                  {template.description}
                </Paragraph>

                <div style={{ marginTop: 'auto' }}>
                  <Space direction="horizontal" size={[4, 4]} wrap>
                    {template.tags?.map((tag) => (
                      <Tag key={tag} style={{ fontSize: '11px', margin: '2px' }}>
                        {tag}
                      </Tag>
                    ))}
                  </Space>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

function getCategoryColor(category: string): string {
  switch (category) {
    case 'employment_onboarding':
      return 'blue';
    case 'resignation_separation':
      return 'orange';
    case 'disciplinary_performance':
      return 'red';
    case 'general_hr':
      return 'green';
    default:
      return 'default';
  }
}

// ============================================================
// PageHeader Component
// ============================================================
import React from 'react';
import { Typography, Space, Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;

interface BreadcrumbItem {
  title: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  extra?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  extra,
}) => {
  return (
    <div
      style={{
        marginBottom: '24px',
        padding: '16px 24px',
        background: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      }}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb
          style={{ marginBottom: '8px' }}
          items={breadcrumbs.map((b) => ({
            title: b.path ? <Link to={b.path}>{b.title}</Link> : b.title,
          }))}
        />
      )}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 600 }}>
            {title}
          </Title>
          {subtitle && (
            <Paragraph type="secondary" style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
              {subtitle}
            </Paragraph>
          )}
        </div>
        {extra && <div>{extra}</div>}
      </div>
    </div>
  );
};

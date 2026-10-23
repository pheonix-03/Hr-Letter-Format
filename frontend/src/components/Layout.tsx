// ============================================================
// Layout – Main application shell with sidebar, header, content
// ============================================================
import React, { useState, useCallback } from 'react';
import { Layout as AntLayout, Avatar, Badge, Dropdown, Space, Typography, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import CompanySelector from './CompanySelector';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../store/db';

const { Sider, Header, Content } = AntLayout;
const { Text } = Typography;

interface LayoutProps {
  children: React.ReactNode;
  currentCompanyId: string | null;
  onCompanyChange: (companyId: string) => void;
  userName?: string;
  onLogout: () => void;
}

const AppLayout: React.FC<LayoutProps> = ({
  children,
  currentCompanyId,
  onCompanyChange,
  userName = 'Admin User',
  onLogout,
}) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const currentCompany = useLiveQuery(
    () => (currentCompanyId ? db.companies.get(currentCompanyId) : undefined),
    [currentCompanyId],
  );

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: onLogout,
    },
  ];

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <AntLayout className="app-layout" style={{ minHeight: '100vh' }}>
      {/* ---- Sidebar ---- */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={256}
        collapsedWidth={80}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
        theme="dark"
      >
        <Sidebar collapsed={collapsed} />
      </Sider>

      {/* ---- Main Content ---- */}
      <AntLayout style={{ marginLeft: collapsed ? 80 : 256, transition: 'margin-left 0.2s ease' }}>
        {/* ---- Header ---- */}
        <Header className="app-header" style={{ position: 'sticky', top: 0, zIndex: 99 }}>
          <div className="app-header__left">
            {/* Collapse toggle */}
            <span
              onClick={toggleCollapsed}
              style={{ fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </span>

            {/* Company selector */}
            <CompanySelector
              currentCompanyId={currentCompanyId}
              onCompanyChange={onCompanyChange}
            />

            {currentCompany && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {currentCompany.city}, {currentCompany.country}
              </Text>
            )}
          </div>

          <div className="app-header__right">
            {/* Help */}
            <Tooltip title="Help & Documentation">
              <QuestionCircleOutlined
                style={{ fontSize: 18, color: 'rgba(0,0,0,0.45)', cursor: 'pointer' }}
              />
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Notifications">
              <Badge count={3} size="small">
                <BellOutlined
                  style={{ fontSize: 18, color: 'rgba(0,0,0,0.65)', cursor: 'pointer' }}
                />
              </Badge>
            </Tooltip>

            {/* User avatar + dropdown */}
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  size={36}
                  style={{ backgroundColor: '#1677ff', fontWeight: 600, fontSize: 14 }}
                >
                  {initials}
                </Avatar>
                <Text strong style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userName}
                </Text>
              </Space>
            </Dropdown>
          </div>
        </Header>

        {/* ---- Content ---- */}
        <Content className="app-content">{children}</Content>
      </AntLayout>
    </AntLayout>
  );
};

export default AppLayout;

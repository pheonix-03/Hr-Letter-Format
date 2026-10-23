// ============================================================
// Sidebar – Navigation sidebar using Ant Design Menu
// ============================================================
import React, { useMemo } from 'react';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import {
  HomeOutlined,
  BankOutlined,
  TeamOutlined,
  FileImageOutlined,
  FileTextOutlined,
  FormOutlined,
  FolderOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  AuditOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileEdit } from 'lucide-react';

type MenuItem = Required<MenuProps>['items'][number];

const Sidebar: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuItem[] = useMemo(
    () => [
      // ---- Main ----
      {
        key: 'main-group',
        label: 'Main',
        type: 'group' as const,
        children: [
          {
            key: '/',
            icon: <HomeOutlined />,
            label: 'Dashboard',
          },
          {
            key: '/companies',
            icon: <BankOutlined />,
            label: 'Companies',
          },
          {
            key: '/employees',
            icon: <TeamOutlined />,
            label: 'Employees',
          },
          {
            key: '/letterheads',
            icon: <FileImageOutlined />,
            label: 'Letterheads',
          },
          {
            key: '/templates',
            icon: <FileTextOutlined />,
            label: 'Templates',
          },
        ],
      },
      // ---- HR Operations ----
      {
        key: 'hr-ops-group',
        label: 'HR Operations',
        type: 'group' as const,
        children: [
          {
            key: '/generate',
            icon: <FormOutlined />,
            label: 'Generate Letter',
          },
          {
            key: '/documents',
            icon: <FolderOutlined />,
            label: 'Documents',
          },
          {
            key: '/employees/batch-upload',
            icon: <UploadOutlined />,
            label: 'Batch Upload',
          },
          {
            key: '/approvals',
            icon: <CheckCircleOutlined />,
            label: 'Approvals',
          },
          {
            key: '/termination',
            icon: <WarningOutlined />,
            label: 'Termination Workflow',
          },
          {
            key: '/absence',
            icon: <ClockCircleOutlined />,
            label: 'Absence Management',
          },
        ],
      },
      // ---- Administration ----
      {
        key: 'admin-group',
        label: 'Administration',
        type: 'group' as const,
        children: [
          {
            key: '/audit',
            icon: <AuditOutlined />,
            label: 'Audit Logs',
          },
          {
            key: '/settings',
            icon: <SettingOutlined />,
            label: 'Settings',
          },
        ],
      },
    ],
    [],
  );

  /**
   * Determine the currently-selected key based on the current pathname.
   * We match the longest prefix from the menu keys to handle nested routes.
   */
  const selectedKey = useMemo(() => {
    const pathname = location.pathname;

    // Collect all leaf-level keys
    const allKeys: string[] = [];
    for (const group of menuItems) {
      if (group && 'children' in group && Array.isArray(group.children)) {
        for (const child of group.children) {
          if (child && 'key' in child) {
            allKeys.push(child.key as string);
          }
        }
      }
    }

    // Exact match first
    if (allKeys.includes(pathname)) {
      return pathname;
    }

    // Longest prefix match
    let best = '/';
    let bestLen = 0;
    for (const key of allKeys) {
      if (key !== '/' && pathname.startsWith(key) && key.length > bestLen) {
        best = key;
        bestLen = key.length;
      }
    }
    return best;
  }, [location.pathname, menuItems]);

  const handleClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  return (
    <>
      {/* Logo area */}
      <div className={`sidebar-logo ${collapsed ? 'sidebar-logo--collapsed' : ''}`}>
        <FileEdit className="sidebar-logo__icon" size={22} />
        {!collapsed && (
          <h2 style={{ marginLeft: 10 }}>HR Letters</h2>
        )}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        onClick={handleClick}
        items={collapsed
          ? menuItems.map((group) => {
              // In collapsed mode, antd hides group labels but keeps children.
              // We keep the structure as-is so the icons display properly.
              return group;
            })
          : menuItems
        }
        style={{ borderRight: 0, flex: 1, overflow: 'auto' }}
      />
    </>
  );
};

export default Sidebar;

// ============================================================
// Settings Page – Company Defaults, Data Backup & Preferences
// ============================================================
import React from 'react';
import {
  Card,
  Form,
  Select,
  Button,
  Tabs,
  Space,
  Divider,
  Popconfirm,
  message,
  Typography,
} from 'antd';
import {
  SaveOutlined,
  DownloadOutlined,
  UploadOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useApp } from '../contexts/AppContext';
import { PageHeader } from '../components/PageHeader';
import { db } from '../store/db';
import { seedDatabase } from '../store/seed';

const { Title, Paragraph, Text } = Typography;

export const Settings: React.FC = () => {
  const { settings, updateSettings, currentCompany, currentCompanyId } = useApp();
  const [form] = Form.useForm();

  const handleSavePreferences = async (values: any) => {
    try {
      await updateSettings(values);
      message.success('Preferences saved');
    } catch (err) {
      message.error('Failed to save preferences');
    }
  };

  const handleExportBackup = async () => {
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        companies: await db.companies.toArray(),
        employees: await db.employees.toArray(),
        letterheads: await db.letterheads.toArray(),
        templates: await db.templates.toArray(),
        documents: await db.documents.toArray(),
        auditLogs: await db.auditLogs.toArray(),
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Universal_HR_Letter_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.success('System backup exported successfully');
    } catch (err) {
      message.error('Failed to export backup');
    }
  };

  const handleResetDemoData = async () => {
    try {
      await db.companies.clear();
      await db.employees.clear();
      await db.documents.clear();
      await db.letterheads.clear();
      await db.absenceRecords.clear();
      await db.users.clear();
      await seedDatabase();
      message.success('Demo environment re-seeded with fresh sample records!');
      window.location.reload();
    } catch (err) {
      message.error('Failed to reset demo data');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <PageHeader
        title="System Settings & Preferences"
        subtitle="Manage default localization, active company profiles, database backups, and environment reset."
      />

      <Card>
        <Tabs
          defaultActiveKey="general"
          items={[
            {
              key: 'general',
              label: 'General Preferences',
              children: (
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={settings}
                  onFinish={handleSavePreferences}
                >
                  <Form.Item name="dateFormat" label="Standard Date Format for Documents">
                    <Select
                      options={[
                        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (e.g. 23/10/2026)' },
                        { value: 'DD MMMM YYYY', label: 'DD MMMM YYYY (e.g. 23 October 2026)' },
                        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (e.g. 10/23/2026)' },
                        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (e.g. 2026-10-23)' },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item name="language" label="Primary Language">
                    <Select
                      options={[
                        { value: 'en', label: 'English (UK / Commonwealth / India)' },
                        { value: 'en-US', label: 'English (United States)' },
                      ]}
                    />
                  </Form.Item>

                  <Button type="primary" icon={<SaveOutlined />} htmlType="submit">
                    Save Preferences
                  </Button>
                </Form>
              ),
            },
            {
              key: 'backup',
              label: 'Data Backup & Reset',
              children: (
                <div>
                  <Title level={5}>System Data Export</Title>
                  <Paragraph type="secondary">
                    Export all companies, employee rosters, custom letterheads, letter templates, and document history as a standalone JSON backup file.
                  </Paragraph>
                  <Button icon={<DownloadOutlined />} onClick={handleExportBackup}>
                    Export JSON Backup
                  </Button>

                  <Divider />

                  <Title level={5} style={{ color: '#cf1322' }}>
                    Reset Demo Environment
                  </Title>
                  <Paragraph type="secondary">
                    Restore the database to its pristine demo state with Empowered Services / Acme Corp sample records, sample employees, and default templates.
                  </Paragraph>
                  <Popconfirm
                    title="Reset to Demo State"
                    description="This will clear current database tables and re-populate the standard demo company and employees. Proceed?"
                    onConfirm={handleResetDemoData}
                    okText="Yes, Reset"
                    cancelText="Cancel"
                  >
                    <Button danger icon={<ReloadOutlined />}>
                      Re-Seed Demo Data
                    </Button>
                  </Popconfirm>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

// ============================================================
// Letterhead Designer Page – Visual Letterhead Editor & Presets
// ============================================================
import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Tabs,
  Row,
  Col,
  Space,
  Divider,
  message,
  Typography,
  Tag,
} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { db, generateId, getCurrentTimestamp } from '../store/db';
import { useApp } from '../contexts/AppContext';
import { LetterheadPreview } from '../components/LetterheadPreview';
import { PageHeader } from '../components/PageHeader';
import { logAction } from '../services/auditService';
import type { LetterheadConfig, LetterheadPreset } from '../types';

const PRESET_CONFIGS: Record<LetterheadPreset, Partial<LetterheadConfig>> = {
  corporate_minimal: {
    preset: 'corporate_minimal',
    name: 'Corporate Minimal',
    pageSize: 'A4',
    orientation: 'portrait',
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 22,
    marginRight: 22,
    headerEnabled: true,
    logoEnabled: true,
    logoWidth: 130,
    logoHeight: 50,
    logoPosition: 'left',
    companyNameEnabled: true,
    companyNameFontSize: 16,
    companyNameFontColor: '#1e3a8a',
    companyNameAlignment: 'left',
    addressEnabled: true,
    addressFontSize: 8.5,
    addressFontColor: '#4b5563',
    contactEnabled: true,
    contactFontSize: 8,
    contactFontColor: '#6b7280',
    separatorEnabled: true,
    separatorColor: '#1e3a8a',
    separatorWidth: 2,
    separatorStyle: 'solid',
    footerEnabled: true,
    footerFontSize: 8.5,
    footerAlignment: 'center',
    footerBorderTop: true,
    footerBorderColor: '#e5e7eb',
    pageNumberEnabled: true,
    confidentialityEnabled: true,
    confidentialityText: 'CONFIDENTIAL – For Designated Recipient Only',
    bodyFontFamily: 'Segoe UI, -apple-system, sans-serif',
    bodyFontSize: 10.5,
    bodyFontColor: '#1f2937',
    bodyLineHeight: 1.6,
  },
  modern_professional: {
    preset: 'modern_professional',
    name: 'Modern Professional',
    pageSize: 'A4',
    orientation: 'portrait',
    marginTop: 18,
    marginBottom: 18,
    marginLeft: 20,
    marginRight: 20,
    headerEnabled: true,
    logoEnabled: true,
    logoWidth: 150,
    logoHeight: 55,
    logoPosition: 'right',
    companyNameEnabled: true,
    companyNameFontSize: 18,
    companyNameFontColor: '#0f766e',
    companyNameAlignment: 'left',
    addressEnabled: true,
    addressFontSize: 9,
    addressFontColor: '#374151',
    contactEnabled: true,
    contactFontSize: 8.5,
    contactFontColor: '#4b5563',
    separatorEnabled: true,
    separatorColor: '#0f766e',
    separatorWidth: 3,
    separatorStyle: 'solid',
    footerEnabled: true,
    footerFontSize: 8.5,
    footerAlignment: 'center',
    footerBorderTop: true,
    footerBorderColor: '#0f766e',
    pageNumberEnabled: true,
    confidentialityEnabled: true,
    confidentialityText: 'STRICTLY PRIVATE & CONFIDENTIAL',
    bodyFontFamily: 'Calibri, Arial, sans-serif',
    bodyFontSize: 11,
    bodyFontColor: '#111827',
    bodyLineHeight: 1.55,
  },
  traditional_corporate: {
    preset: 'traditional_corporate',
    name: 'Traditional Corporate',
    pageSize: 'A4',
    orientation: 'portrait',
    marginTop: 25,
    marginBottom: 25,
    marginLeft: 25,
    marginRight: 25,
    headerEnabled: true,
    logoEnabled: true,
    logoWidth: 120,
    logoHeight: 50,
    logoPosition: 'center',
    companyNameEnabled: true,
    companyNameFontSize: 18,
    companyNameFontColor: '#111827',
    companyNameAlignment: 'center',
    addressEnabled: true,
    addressFontSize: 9,
    addressFontColor: '#374151',
    contactEnabled: true,
    contactFontSize: 8.5,
    contactFontColor: '#6b7280',
    separatorEnabled: true,
    separatorColor: '#111827',
    separatorWidth: 1,
    separatorStyle: 'double',
    footerEnabled: true,
    footerFontSize: 8,
    footerAlignment: 'center',
    footerBorderTop: true,
    footerBorderColor: '#9ca3af',
    pageNumberEnabled: true,
    confidentialityEnabled: true,
    confidentialityText: 'Empowering Enterprise Excellence | Confidential Document',
    bodyFontFamily: 'Georgia, Times New Roman, serif',
    bodyFontSize: 11,
    bodyFontColor: '#111827',
    bodyLineHeight: 1.65,
  },
  formal_legal: {
    preset: 'formal_legal',
    name: 'Formal Legal',
    pageSize: 'A4',
    orientation: 'portrait',
    marginTop: 25,
    marginBottom: 25,
    marginLeft: 25,
    marginRight: 25,
    headerEnabled: true,
    logoEnabled: false,
    companyNameEnabled: true,
    companyNameFontSize: 17,
    companyNameFontColor: '#000000',
    companyNameAlignment: 'center',
    addressEnabled: true,
    addressFontSize: 9,
    addressFontColor: '#222222',
    contactEnabled: true,
    contactFontSize: 8.5,
    contactFontColor: '#444444',
    separatorEnabled: true,
    separatorColor: '#000000',
    separatorWidth: 1.5,
    separatorStyle: 'solid',
    footerEnabled: true,
    footerFontSize: 8,
    footerAlignment: 'center',
    footerBorderTop: true,
    footerBorderColor: '#000000',
    pageNumberEnabled: true,
    confidentialityEnabled: true,
    confidentialityText: 'LEGAL & PRIVILEGED EMPLOYMENT COMMUNICATION',
    bodyFontFamily: 'Times New Roman, serif',
    bodyFontSize: 11.5,
    bodyFontColor: '#000000',
    bodyLineHeight: 1.6,
  },
  clean_hr: {
    preset: 'clean_hr',
    name: 'Clean HR',
    pageSize: 'A4',
    orientation: 'portrait',
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 22,
    marginRight: 22,
    headerEnabled: true,
    logoEnabled: true,
    logoWidth: 140,
    logoHeight: 50,
    logoPosition: 'left',
    companyNameEnabled: true,
    companyNameFontSize: 16,
    companyNameFontColor: '#2563eb',
    companyNameAlignment: 'left',
    addressEnabled: true,
    addressFontSize: 8.5,
    addressFontColor: '#4b5563',
    contactEnabled: true,
    contactFontSize: 8,
    contactFontColor: '#6b7280',
    separatorEnabled: true,
    separatorColor: '#2563eb',
    separatorWidth: 2,
    separatorStyle: 'solid',
    footerEnabled: true,
    footerFontSize: 8.5,
    footerAlignment: 'center',
    footerBorderTop: true,
    footerBorderColor: '#dbeafe',
    pageNumberEnabled: true,
    confidentialityEnabled: true,
    confidentialityText: 'Human Resources Division – Confidential Document',
    bodyFontFamily: 'Segoe UI, Arial, sans-serif',
    bodyFontSize: 10.5,
    bodyFontColor: '#1f2937',
    bodyLineHeight: 1.6,
  },
  executive: {
    preset: 'executive',
    name: 'Executive Letterhead',
    pageSize: 'A4',
    orientation: 'portrait',
    marginTop: 22,
    marginBottom: 22,
    marginLeft: 22,
    marginRight: 22,
    headerEnabled: true,
    logoEnabled: true,
    logoWidth: 160,
    logoHeight: 60,
    logoPosition: 'center',
    companyNameEnabled: true,
    companyNameFontSize: 20,
    companyNameFontColor: '#1e293b',
    companyNameAlignment: 'center',
    addressEnabled: true,
    addressFontSize: 9,
    addressFontColor: '#475569',
    contactEnabled: true,
    contactFontSize: 8.5,
    contactFontColor: '#64748b',
    separatorEnabled: true,
    separatorColor: '#c2410c',
    separatorWidth: 2,
    separatorStyle: 'solid',
    footerEnabled: true,
    footerFontSize: 8.5,
    footerAlignment: 'center',
    footerBorderTop: true,
    footerBorderColor: '#cbd5e1',
    pageNumberEnabled: true,
    confidentialityEnabled: true,
    confidentialityText: 'Office of the Executive Leadership – Highly Confidential',
    bodyFontFamily: 'Garamond, serif',
    bodyFontSize: 11.5,
    bodyFontColor: '#0f172a',
    bodyLineHeight: 1.6,
  },
  simple_bw: {
    preset: 'simple_bw',
    name: 'Simple Black & White',
    pageSize: 'A4',
    orientation: 'portrait',
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
    headerEnabled: true,
    logoEnabled: true,
    logoWidth: 120,
    logoHeight: 45,
    logoPosition: 'left',
    companyNameEnabled: true,
    companyNameFontSize: 15,
    companyNameFontColor: '#000000',
    companyNameAlignment: 'left',
    addressEnabled: true,
    addressFontSize: 8.5,
    addressFontColor: '#333333',
    contactEnabled: true,
    contactFontSize: 8,
    contactFontColor: '#555555',
    separatorEnabled: true,
    separatorColor: '#000000',
    separatorWidth: 1,
    separatorStyle: 'solid',
    footerEnabled: true,
    footerFontSize: 8,
    footerAlignment: 'center',
    footerBorderTop: true,
    footerBorderColor: '#cccccc',
    pageNumberEnabled: true,
    confidentialityEnabled: true,
    confidentialityText: 'Private & Confidential',
    bodyFontFamily: 'Arial, sans-serif',
    bodyFontSize: 10.5,
    bodyFontColor: '#000000',
    bodyLineHeight: 1.55,
  },
  custom: {
    preset: 'custom',
    name: 'Custom Letterhead',
  },
};

const SAMPLE_BODY_TEXT = `Subject: Demonstration of Generated Letterhead Layout & Document Styling

Dear Employee,

This preview demonstrates how your official HR letters, warnings, employment agreements, and certificates will appear when formatted using this letterhead configuration.

The Universal HR Letter Generator automatically positions your company branding, official registered address, tax credentials, contact channels, body text margins, and security confidentiality notices in strict accordance with your customized layout rules.

All generated documents are natively exported to Microsoft Word (.docx) and print-ready high-resolution PDF formats with crisp typography, exact alignment, and optional official company seals.

Yours sincerely,`;

export const LetterheadDesigner: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const { currentCompanyId, currentCompany, user } = useApp();

  const [currentConfig, setCurrentConfig] = useState<Partial<LetterheadConfig>>(
    PRESET_CONFIGS.corporate_minimal,
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      db.letterheads.get(id).then((lh) => {
        if (lh) {
          setCurrentConfig(lh);
          form.setFieldsValue(lh);
        }
      });
    } else {
      form.setFieldsValue(PRESET_CONFIGS.corporate_minimal);
    }
  }, [id, isEditing, form]);

  const handlePresetSelect = (presetKey: LetterheadPreset) => {
    const preset = PRESET_CONFIGS[presetKey];
    if (preset) {
      const merged = { ...currentConfig, ...preset, preset: presetKey };
      setCurrentConfig(merged);
      form.setFieldsValue(merged);
      message.info(`Applied "${preset.name}" preset`);
    }
  };

  const handleFormValuesChange = (_: any, allValues: any) => {
    setCurrentConfig((prev) => ({ ...prev, ...allValues }));
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (!currentCompanyId) {
        message.error('Please select an active company first');
        return;
      }

      setSaving(true);
      const now = getCurrentTimestamp();
      const configId = isEditing && id ? id : generateId();

      const letterheadData: LetterheadConfig = {
        ...currentConfig,
        ...values,
        id: configId,
        companyId: currentCompanyId,
        isActive: true,
        isDefault: values.isDefault ?? false,
        createdAt: isEditing ? (await db.letterheads.get(configId))?.createdAt || now : now,
        updatedAt: now,
      } as LetterheadConfig;

      await db.letterheads.put(letterheadData);

      await logAction(
        currentCompanyId,
        user?.id || 'anonymous',
        user?.name || 'User',
        isEditing ? 'update' : 'create',
        'letterhead',
        configId,
        { name: letterheadData.name },
      );

      message.success('Letterhead design saved successfully!');
      navigate('/letterheads');
    } catch (err) {
      console.error(err);
      message.error('Failed to save letterhead');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={isEditing ? 'Edit Letterhead Design' : 'Universal Letterhead Designer'}
        subtitle="Design professional branded headers, footers, margins, and typography presets for all company HR letters."
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/letterheads')}>
              Back to List
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={handleSave}
            >
              Save Letterhead
            </Button>
          </Space>
        }
      />

      <Row gutter={24}>
        {/* LEFT COLUMN: DESIGN CONTROLS */}
        <Col span={11}>
          <Card
            title="Design & Layout Controls"
            style={{ marginBottom: '24px', height: 'calc(100vh - 200px)', overflowY: 'auto' }}
          >
            <Form
              form={form}
              layout="vertical"
              onValuesChange={handleFormValuesChange}
              initialValues={currentConfig}
            >
              <Form.Item
                name="name"
                label="Letterhead Template Name"
                rules={[{ required: true, message: 'Template name is required' }]}
              >
                <Input placeholder="e.g. Official Headquarters Letterhead" />
              </Form.Item>

              <Form.Item label="Select Design Preset">
                <Select
                  value={currentConfig.preset || 'corporate_minimal'}
                  onChange={handlePresetSelect}
                  options={[
                    { value: 'corporate_minimal', label: 'Corporate Minimal (Default)' },
                    { value: 'modern_professional', label: 'Modern Professional (Teal Accent)' },
                    { value: 'traditional_corporate', label: 'Traditional Corporate (Centered)' },
                    { value: 'formal_legal', label: 'Formal Legal & Disciplinary' },
                    { value: 'clean_hr', label: 'Clean HR Blue' },
                    { value: 'executive', label: 'Executive Letterhead (Warm Crimson)' },
                    { value: 'simple_bw', label: 'Simple Black & White' },
                  ]}
                />
              </Form.Item>

              <Tabs
                defaultActiveKey="page"
                items={[
                  {
                    key: 'page',
                    label: 'Page & Margins',
                    children: (
                      <div>
                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item name="pageSize" label="Page Size">
                              <Select
                                options={[
                                  { value: 'A4', label: 'A4 (210 x 297 mm)' },
                                  { value: 'Letter', label: 'US Letter (8.5 x 11 in)' },
                                ]}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="orientation" label="Orientation">
                              <Select
                                options={[
                                  { value: 'portrait', label: 'Portrait' },
                                  { value: 'landscape', label: 'Landscape' },
                                ]}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Divider style={{ margin: '8px 0 16px 0' }}>Page Margins (mm)</Divider>
                        <Row gutter={12}>
                          <Col span={6}>
                            <Form.Item name="marginTop" label="Top">
                              <InputNumber min={5} max={60} style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item name="marginBottom" label="Bottom">
                              <InputNumber min={5} max={60} style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item name="marginLeft" label="Left">
                              <InputNumber min={5} max={60} style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item name="marginRight" label="Right">
                              <InputNumber min={5} max={60} style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>
                    ),
                  },
                  {
                    key: 'header',
                    label: 'Header & Logo',
                    children: (
                      <div>
                        <Form.Item
                          name="headerEnabled"
                          label="Enable Letterhead Header"
                          valuePropName="checked"
                        >
                          <Switch />
                        </Form.Item>

                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item
                              name="logoEnabled"
                              label="Show Company Logo"
                              valuePropName="checked"
                            >
                              <Switch />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="logoPosition" label="Logo Position">
                              <Select
                                options={[
                                  { value: 'left', label: 'Left Aligned' },
                                  { value: 'center', label: 'Centered' },
                                  { value: 'right', label: 'Right Aligned' },
                                ]}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item name="logoWidth" label="Logo Width (px)">
                              <InputNumber min={40} max={300} style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="companyNameFontSize" label="Company Name Size (pt)">
                              <InputNumber min={12} max={32} style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item name="companyNameFontColor" label="Company Name Color">
                              <Input type="color" style={{ height: '36px' }} />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="companyNameAlignment" label="Name Alignment">
                              <Select
                                options={[
                                  { value: 'left', label: 'Left' },
                                  { value: 'center', label: 'Center' },
                                  { value: 'right', label: 'Right' },
                                ]}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Divider style={{ margin: '8px 0 16px 0' }}>Divider Line</Divider>
                        <Row gutter={12}>
                          <Col span={8}>
                            <Form.Item
                              name="separatorEnabled"
                              label="Separator Line"
                              valuePropName="checked"
                            >
                              <Switch />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item name="separatorWidth" label="Line Thickness (px)">
                              <InputNumber min={1} max={6} style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item name="separatorColor" label="Line Color">
                              <Input type="color" style={{ height: '36px' }} />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>
                    ),
                  },
                  {
                    key: 'footer',
                    label: 'Footer & Notice',
                    children: (
                      <div>
                        <Form.Item
                          name="footerEnabled"
                          label="Enable Document Footer"
                          valuePropName="checked"
                        >
                          <Switch />
                        </Form.Item>

                        <Form.Item
                          name="confidentialityText"
                          label="Confidentiality Notice Text"
                        >
                          <Input.TextArea rows={2} />
                        </Form.Item>

                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item
                              name="pageNumberEnabled"
                              label="Display Page Numbers"
                              valuePropName="checked"
                            >
                              <Switch />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="footerAlignment" label="Footer Alignment">
                              <Select
                                options={[
                                  { value: 'center', label: 'Center' },
                                  { value: 'left', label: 'Left' },
                                  { value: 'right', label: 'Right' },
                                ]}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Divider style={{ margin: '8px 0 16px 0' }}>Company Seal Setting</Divider>
                        <Form.Item name="sealMode" label="Official Seal Display Style">
                          <Select
                            options={[
                              { value: 'full_name', label: 'Full Company Name Stamp (EMPOWERED SERVICES LLP)' },
                              { value: 'line', label: 'Signature Line Only (Company Seal: _________)' },
                              { value: 'none', label: 'None (Remove Seal Completely)' },
                            ]}
                          />
                        </Form.Item>
                      </div>
                    ),
                  },
                  {
                    key: 'typography',
                    label: 'Body Typography',
                    children: (
                      <div>
                        <Form.Item name="bodyFontFamily" label="Font Family">
                          <Select
                            options={[
                              { value: 'Segoe UI, -apple-system, sans-serif', label: 'Segoe UI (Modern Sans)' },
                              { value: 'Calibri, Arial, sans-serif', label: 'Calibri (Corporate Standard)' },
                              { value: 'Times New Roman, serif', label: 'Times New Roman (Legal / Formal)' },
                              { value: 'Georgia, serif', label: 'Georgia (Executive Serif)' },
                              { value: 'Arial, Helvetica, sans-serif', label: 'Arial (Clean Minimal)' },
                            ]}
                          />
                        </Form.Item>

                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item name="bodyFontSize" label="Body Font Size (pt)">
                              <InputNumber min={9} max={14} step={0.5} style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="bodyLineHeight" label="Line Spacing">
                              <InputNumber min={1.2} max={2.2} step={0.1} style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>
                    ),
                  },
                ]}
              />
            </Form>
          </Card>
        </Col>

        {/* RIGHT COLUMN: LIVE PAGE PREVIEW */}
        <Col span={13}>
          <Card
            title="Real-Time Scaled Document Preview"
            extra={<Tag color="blue">Interactive Live View</Tag>}
            style={{ height: 'calc(100vh - 200px)', overflowY: 'auto' }}
          >
            {currentCompany ? (
              <LetterheadPreview
                letterhead={currentConfig}
                company={currentCompany}
                content={SAMPLE_BODY_TEXT}
                title="PREVIEW LETTER TITLE"
                letterDate="23 October 2026"
                referenceNumber="ACME/HR/2026/0001"
                employeeName="Sample Employee"
                scale={0.85}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                Please select or create an active company to see the live preview.
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

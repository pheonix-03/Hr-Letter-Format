// ============================================================
// CompanyForm – Create or Edit Company Profile
// ============================================================
import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Tabs,
  Space,
  Upload,
  Select,
  message,
  Typography,
  Row,
  Col,
} from 'antd';
import {
  UploadOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { db, generateId, getCurrentTimestamp } from '../store/db';
import { useApp } from '../contexts/AppContext';
import { logAction } from '../services/auditService';
import type { Company } from '../types';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export const CompanyForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const { user, switchCompany } = useApp();

  const [logoBase64, setLogoBase64] = useState<string>('');
  const [sealBase64, setSealBase64] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      db.companies.get(id).then((company) => {
        if (company) {
          form.setFieldsValue(company);
          setLogoBase64(company.logoUrl || '');
          setSealBase64(company.sealImageUrl || '');
        } else {
          message.error('Company not found');
          navigate('/companies');
        }
      });
    }
  }, [id, isEditing, form, navigate]);

  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setLogoBase64(reader.result as string);
      message.success('Logo uploaded successfully');
    };
    reader.readAsDataURL(file);
    return false; // prevent default upload
  };

  const handleSealUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setSealBase64(reader.result as string);
      message.success('Seal uploaded successfully');
    };
    reader.readAsDataURL(file);
    return false;
  };

  const onFinish = async (values: any) => {
    try {
      setSaving(true);
      const now = getCurrentTimestamp();
      const companyId = isEditing && id ? id : generateId();

      const companyData: Company = {
        ...values,
        id: companyId,
        logoUrl: logoBase64,
        sealImageUrl: sealBase64,
        createdAt: isEditing ? (await db.companies.get(companyId))?.createdAt || now : now,
        updatedAt: now,
      };

      if (isEditing) {
        await db.companies.put(companyData);
        await logAction(
          companyId,
          user?.id || 'anonymous',
          user?.name || 'User',
          'update',
          'company',
          companyId,
          { name: companyData.legalName },
        );
        message.success('Company updated successfully');
      } else {
        await db.companies.add(companyData);
        await logAction(
          companyId,
          user?.id || 'anonymous',
          user?.name || 'User',
          'create',
          'company',
          companyId,
          { name: companyData.legalName },
        );
        message.success('Company created successfully');
        await switchCompany(companyId);
      }

      navigate('/companies');
    } catch (err) {
      console.error(err);
      message.error('Failed to save company');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px' }}>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/companies')}>
              Back
            </Button>
            <Title level={3} style={{ margin: 0 }}>
              {isEditing ? 'Edit Company Profile' : 'Create New Company'}
            </Title>
          </Space>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={() => form.submit()}
          >
            Save Company
          </Button>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            defaultLanguage: 'en',
            defaultDateFormat: 'DD/MM/YYYY',
            defaultCurrency: 'INR (₹)',
            confidentialityNotice:
              'CONFIDENTIAL – This document contains proprietary information intended only for the designated recipient.',
          }}
        >
          <Card>
            <Tabs
              defaultActiveKey="basic"
              items={[
                {
                  key: 'basic',
                  label: 'General Information',
                  children: (
                    <Row gutter={24}>
                      <Col span={16}>
                        <Form.Item
                          name="legalName"
                          label="Legal Registered Company Name"
                          rules={[{ required: true, message: 'Legal company name is required' }]}
                        >
                          <Input placeholder="e.g. Empowered Services LLP" />
                        </Form.Item>
                        <Form.Item name="tradeName" label="Trade / Brand Name">
                          <Input placeholder="e.g. Empowered Services" />
                        </Form.Item>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item name="registrationNumber" label="CIN / Company Reg No">
                              <Input placeholder="e.g. AAB-1234 or U72200..." />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="taxId" label="Tax ID / GSTIN / PAN">
                              <Input placeholder="e.g. 29AAAAA0000A1Z5" />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Col>

                      <Col span={8} style={{ textAlign: 'center' }}>
                        <Form.Item label="Company Logo">
                          <div
                            style={{
                              border: '1px dashed #d9d9d9',
                              padding: '16px',
                              borderRadius: '8px',
                              backgroundColor: '#fafafa',
                              marginBottom: '12px',
                            }}
                          >
                            {logoBase64 ? (
                              <img
                                src={logoBase64}
                                alt="Company Logo"
                                style={{ maxHeight: '80px', maxWidth: '100%', objectFit: 'contain' }}
                              />
                            ) : (
                              <div style={{ color: '#999', padding: '20px 0' }}>No Logo Uploaded</div>
                            )}
                          </div>
                          <Upload beforeUpload={handleLogoUpload} showUploadList={false}>
                            <Button icon={<UploadOutlined />}>Upload Logo</Button>
                          </Upload>
                        </Form.Item>

                        <Form.Item label="Company Official Seal / Stamp">
                          <div
                            style={{
                              border: '1px dashed #d9d9d9',
                              padding: '16px',
                              borderRadius: '8px',
                              backgroundColor: '#fafafa',
                              marginBottom: '12px',
                            }}
                          >
                            {sealBase64 ? (
                              <img
                                src={sealBase64}
                                alt="Company Seal"
                                style={{ maxHeight: '70px', maxWidth: '100%', objectFit: 'contain' }}
                              />
                            ) : (
                              <div style={{ color: '#999', padding: '16px 0' }}>No Seal Uploaded</div>
                            )}
                          </div>
                          <Upload beforeUpload={handleSealUpload} showUploadList={false}>
                            <Button icon={<UploadOutlined />}>Upload Seal</Button>
                          </Upload>
                        </Form.Item>
                      </Col>
                    </Row>
                  ),
                },
                {
                  key: 'address',
                  label: 'Addresses & Contact',
                  children: (
                    <Row gutter={24}>
                      <Col span={12}>
                        <Form.Item
                          name="registeredAddress"
                          label="Registered Office Address"
                          rules={[{ required: true, message: 'Registered address is required' }]}
                        >
                          <TextArea rows={3} placeholder="Full registered address" />
                        </Form.Item>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item name="city" label="City">
                              <Input placeholder="e.g. Bengaluru" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="state" label="State / Province">
                              <Input placeholder="e.g. Karnataka" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item name="country" label="Country">
                              <Input placeholder="e.g. India" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="postalCode" label="Postal / ZIP Code">
                              <Input placeholder="e.g. 560100" />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Col>

                      <Col span={12}>
                        <Form.Item name="corporateAddress" label="Corporate / Branch Office Address">
                          <TextArea rows={3} placeholder="Corporate address if different" />
                        </Form.Item>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item name="contactNumber" label="Official Phone">
                              <Input placeholder="+91 80 1234 5678" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="website" label="Website URL">
                              <Input placeholder="https://example.com" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item name="officialEmail" label="Official Email">
                              <Input placeholder="info@example.com" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="hrEmail" label="HR Department Email">
                              <Input placeholder="hr@example.com" />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  ),
                },
                {
                  key: 'signatories',
                  label: 'Authorized Signatories',
                  children: (
                    <Row gutter={24}>
                      <Col span={12}>
                        <Card title="Primary Authorized Signatory" size="small">
                          <Form.Item
                            name="authorizedSignatoryName"
                            label="Signatory Full Name"
                            rules={[{ required: true, message: 'Signatory name is required' }]}
                          >
                            <Input placeholder="e.g. Rajesh Kumar" />
                          </Form.Item>
                          <Form.Item
                            name="authorizedSignatoryDesignation"
                            label="Signatory Designation"
                            rules={[{ required: true, message: 'Designation is required' }]}
                          >
                            <Input placeholder="e.g. Managing Partner / Director" />
                          </Form.Item>
                        </Card>
                      </Col>

                      <Col span={12}>
                        <Card title="HR Representative" size="small">
                          <Form.Item name="hrRepName" label="HR Representative Name">
                            <Input placeholder="e.g. Priya Sharma" />
                          </Form.Item>
                          <Form.Item name="hrRepDesignation" label="HR Designation">
                            <Input placeholder="e.g. Head - Human Resources" />
                          </Form.Item>
                        </Card>
                      </Col>
                    </Row>
                  ),
                },
                {
                  key: 'defaults',
                  label: 'Document Formatting Defaults',
                  children: (
                    <Row gutter={24}>
                      <Col span={8}>
                        <Form.Item name="defaultLanguage" label="Document Language">
                          <Select
                            options={[
                              { value: 'en', label: 'English (UK / Commonwealth / India)' },
                              { value: 'en-US', label: 'English (US)' },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="defaultDateFormat" label="Date Format">
                          <Select
                            options={[
                              { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (e.g. 23/10/2026)' },
                              { value: 'DD MMMM YYYY', label: 'DD MMMM YYYY (e.g. 23 October 2026)' },
                              { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (e.g. 10/23/2026)' },
                              { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (e.g. 2026-10-23)' },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="defaultCurrency" label="Currency">
                          <Select
                            options={[
                              { value: 'INR (₹)', label: 'INR (₹)' },
                              { value: 'USD ($)', label: 'USD ($)' },
                              { value: 'GBP (£)', label: 'GBP (£)' },
                              { value: 'EUR (€)', label: 'EUR (€)' },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="confidentialityNotice"
                          label="Default Document Confidentiality Notice"
                        >
                          <TextArea rows={2} />
                        </Form.Item>
                      </Col>
                    </Row>
                  ),
                },
              ]}
            />
          </Card>
        </Form>
      </Space>
    </div>
  );
};

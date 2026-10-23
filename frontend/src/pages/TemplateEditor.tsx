// ============================================================
// Template Editor Page – Create & Customize Templates
// ============================================================
import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Space,
  Row,
  Col,
  Tag,
  Divider,
  message,
  Typography,
} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { db, generateId, getCurrentTimestamp } from '../store/db';
import { useApp } from '../contexts/AppContext';
import { getTemplateById } from '../templates';
import { PageHeader } from '../components/PageHeader';
import { logAction } from '../services/auditService';
import type { HRTemplate, TemplateCategory } from '../types';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

export const TemplateEditor: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const { currentCompanyId, user } = useApp();

  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      // Check Dexie first
      db.templates.get(id).then((t) => {
        if (t) {
          form.setFieldsValue(t);
          setContent(t.content);
        } else {
          // Check standard built-in templates
          const builtIn = getTemplateById(id);
          if (builtIn) {
            form.setFieldsValue(builtIn);
            setContent(builtIn.content);
          } else {
            message.error('Template not found');
            navigate('/templates');
          }
        }
      });
    }
  }, [id, isEditing, form, navigate]);

  const insertVariable = (key: string) => {
    setContent((prev) => prev + ` {{${key}}}`);
    form.setFieldValue('content', content + ` {{${key}}}`);
  };

  const handleSave = async (values: any) => {
    try {
      if (!currentCompanyId) {
        message.error('Please select an active company first');
        return;
      }

      setSaving(true);
      const now = getCurrentTimestamp();
      const templateId = isEditing && id ? id : generateId();

      const templateData: HRTemplate = {
        ...values,
        id: templateId,
        companyId: currentCompanyId, // Company specific override
        content: content || values.content,
        paragraphs: [],
        fields: values.fields || [],
        isGlobal: false,
        isDefault: false,
        version: 1,
        previousVersionId: null,
        tags: typeof values.tags === 'string' ? values.tags.split(',').map((t: string) => t.trim()) : values.tags || [],
        createdBy: user?.id || 'anonymous',
        createdAt: now,
        updatedAt: now,
      };

      await db.templates.put(templateData);

      await logAction(
        currentCompanyId,
        user?.id || 'anonymous',
        user?.name || 'User',
        isEditing ? 'update' : 'create',
        'template',
        templateId,
        { name: templateData.name },
      );

      message.success('Template saved successfully');
      navigate('/templates');
    } catch (err) {
      console.error(err);
      message.error('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const commonVariables = [
    'employee_name',
    'employee_id',
    'designation',
    'department',
    'reporting_manager',
    'joining_date',
    'letter_date',
    'effective_date',
    'period',
    'last_working_day',
    'reason_for_letter',
    'company_name',
    'company_address',
    'authorized_signatory',
    'signatory_designation',
  ];

  return (
    <div>
      <PageHeader
        title={isEditing ? 'Edit Letter Template' : 'Create Custom HR Template'}
        subtitle="Configure the letter text, dynamic placeholders, and category for automated document generation."
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/templates')}>
              Back
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={() => form.submit()}
            >
              Save Template
            </Button>
          </Space>
        }
      />

      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Row gutter={24}>
          <Col span={16}>
            <Card title="Template Content & Wording">
              <Form.Item
                name="name"
                label="Template Name"
                rules={[{ required: true, message: 'Template name is required' }]}
              >
                <Input placeholder="e.g. Performance Improvement Plan Letter" />
              </Form.Item>

              <Form.Item
                name="subject"
                label="Letter Subject Line"
                rules={[{ required: true, message: 'Subject line is required' }]}
              >
                <Input placeholder="e.g. Formal Notification – Performance Improvement Plan (PIP)" />
              </Form.Item>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: 500, marginBottom: '6px' }}>
                  Quick Insert Dynamic Variables:
                </div>
                <Space direction="horizontal" size={[6, 6]} wrap>
                  {commonVariables.map((v) => (
                    <Button
                      key={v}
                      size="small"
                      icon={<TagsOutlined />}
                      onClick={() => insertVariable(v)}
                    >
                      {`{{${v}}}`}
                    </Button>
                  ))}
                </Space>
              </div>

              <Form.Item
                name="content"
                label="Letter Body Text (Use {{placeholder}} for dynamic fields)"
                rules={[{ required: true, message: 'Letter content is required' }]}
              >
                <TextArea
                  rows={16}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{ fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.6 }}
                />
              </Form.Item>
            </Card>
          </Col>

          <Col span={8}>
            <Card title="Template Properties">
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Category is required' }]}
              >
                <Select
                  options={[
                    { value: 'employment_onboarding', label: 'Employment & Onboarding' },
                    { value: 'resignation_separation', label: 'Resignation & Separation' },
                    { value: 'disciplinary_performance', label: 'Disciplinary & Performance' },
                    { value: 'general_hr', label: 'General HR & Certificates' },
                    { value: 'custom', label: 'Custom Document' },
                  ]}
                />
              </Form.Item>

              <Form.Item name="subcategory" label="Subcategory / Badge">
                <Input placeholder="e.g. Performance / Warning / Offer" />
              </Form.Item>

              <Form.Item name="description" label="Description / Instructions">
                <TextArea rows={3} placeholder="Brief guidance for HR users when to issue this letter" />
              </Form.Item>

              <Form.Item name="tags" label="Keywords / Tags (comma separated)">
                <Input placeholder="e.g. PIP, Performance, Warning" />
              </Form.Item>

              <Divider style={{ margin: '16px 0' }} />

              <Form.Item
                name="requiresApproval"
                label="Requires Management Review & Approval Before Issuance"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

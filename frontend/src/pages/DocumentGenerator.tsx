// ============================================================
// Document Generator – Core Step-by-Step Creation Wizard
// ============================================================
import React, { useState, useEffect } from 'react';
import {
  Card,
  Steps,
  Button,
  Space,
  Form,
  Input,
  Select,
  Row,
  Col,
  Tag,
  Alert,
  Divider,
  message,
  Typography,
} from 'antd';
import {
  FileTextOutlined,
  UserOutlined,
  FormOutlined,
  EyeOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  FileWordOutlined,
  FilePdfOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import dayjs from 'dayjs';
import { allTemplates, getTemplateById } from '../templates';
import { computeReviewDate } from '../services/excelParser';
import { fillTemplate, extractPlaceholders } from '../services/templateEngine';
import { generateDocx } from '../services/docxGenerator';
import { generatePdfFromElement, downloadPdfBlob } from '../services/pdfGenerator';
import { generateReferenceNumber } from '../services/referenceNumberService';
import { db, generateId, getCurrentTimestamp } from '../store/db';
import { useApp } from '../contexts/AppContext';
import { LetterheadPreview } from '../components/LetterheadPreview';
import { PageHeader } from '../components/PageHeader';
import { logAction } from '../services/auditService';
import type { GeneratedDocument, HRTemplate, Employee, LetterheadConfig } from '../types';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export const DocumentGenerator: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentCompanyId, currentCompany, user } = useApp();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<HRTemplate | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedLetterhead, setSelectedLetterhead] = useState<Partial<LetterheadConfig>>({});
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [renderedContent, setRenderedContent] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [createdDocId, setCreatedDocId] = useState<string | null>(null);

  // Queries
  const employees = useLiveQuery(async () => {
    if (!currentCompanyId) return [];
    return await db.employees.where('companyId').equals(currentCompanyId).toArray();
  }, [currentCompanyId]);

  const letterheads = useLiveQuery(async () => {
    if (!currentCompanyId) return [];
    return await db.letterheads.where('companyId').equals(currentCompanyId).toArray();
  }, [currentCompanyId]);

  // Initial load from URL query
  useEffect(() => {
    const tplId = searchParams.get('templateId');
    if (tplId) {
      const t = getTemplateById(tplId);
      if (t) {
        setSelectedTemplate(t);
        setCurrentStep(1); // jump to employee selection
      }
    }

    const empId = searchParams.get('employeeId');
    if (empId) {
      db.employees.get(empId).then((emp) => {
        if (emp) {
          setSelectedEmployee(emp);
        }
      });
    }
  }, [searchParams]);

  // Set default letterhead when available
  useEffect(() => {
    if (letterheads && letterheads.length > 0 && !selectedLetterhead.id) {
      const defaultLh = letterheads.find((l) => l.isDefault) || letterheads[0];
      setSelectedLetterhead(defaultLh);
    }
  }, [letterheads, selectedLetterhead]);

  // Initialize reference number when template changes
  useEffect(() => {
    if (currentCompanyId && selectedTemplate) {
      generateReferenceNumber(currentCompanyId, selectedTemplate.category).then((ref) => {
        setReferenceNumber(ref);
      });
    }
  }, [currentCompanyId, selectedTemplate]);

  // Auto-fill template variables when employee or company changes
  useEffect(() => {
    if (!currentCompany) return;

    const todayStr = dayjs().format('DD MMMM YYYY');
    const initial: Record<string, string> = {
      company_name: currentCompany.tradeName || currentCompany.legalName,
      company_address: currentCompany.registeredAddress,
      company_email: currentCompany.officialEmail,
      company_phone: currentCompany.contactNumber,
      company_website: currentCompany.website,
      authorized_signatory: currentCompany.authorizedSignatoryName || 'Authorized Signatory',
      signatory_designation: currentCompany.authorizedSignatoryDesignation || 'Human Resources',
      hr_name: currentCompany.hrRepName || currentCompany.authorizedSignatoryName,
      hr_designation: currentCompany.hrRepDesignation || 'Human Resources',
      letter_date: todayStr,
      effective_date: todayStr,
      period: '30 Days',
      review_date: computeReviewDate(todayStr, '30 Days'),
    };

    if (selectedEmployee) {
      initial.employee_name = selectedEmployee.fullName;
      initial.employee_id = selectedEmployee.employeeId;
      initial.employee_email = selectedEmployee.email;
      initial.employee_address = selectedEmployee.address;
      initial.designation = selectedEmployee.designation;
      initial.department = selectedEmployee.department;
      initial.reporting_manager = selectedEmployee.reportingManager || 'Management';
      initial.joining_date = selectedEmployee.joiningDate || todayStr;
      initial.salary = selectedEmployee.salary || '';
    }

    setFormData((prev) => ({ ...initial, ...prev }));
  }, [currentCompany, selectedEmployee]);

  // Live update of rendered text
  useEffect(() => {
    if (selectedTemplate) {
      const merged = { ...formData, reference_number: referenceNumber };
      const filled = fillTemplate(selectedTemplate.content, merged);
      setRenderedContent(filled);
    }
  }, [selectedTemplate, formData, referenceNumber]);

  const handleFieldChange = (key: string, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'effective_date' || key === 'period') {
        const eff = key === 'effective_date' ? value : next.effective_date;
        const per = key === 'period' ? value : next.period;
        if (eff && per) {
          next.review_date = computeReviewDate(eff, per);
        }
      }
      return next;
    });
  };

  const handleSelectEmployee = (empId: string) => {
    const emp = employees?.find((e) => e.id === empId);
    if (emp) {
      setSelectedEmployee(emp);
      setFormData((prev) => ({
        ...prev,
        employee_name: emp.fullName,
        employee_id: emp.employeeId,
        employee_email: emp.email,
        employee_address: emp.address,
        designation: emp.designation,
        department: emp.department,
        reporting_manager: emp.reportingManager || 'Management',
        joining_date: emp.joiningDate,
        salary: emp.salary,
      }));
    }
  };

  const handleSaveDocument = async (status: 'draft' | 'under_review' | 'issued' = 'issued') => {
    if (!currentCompanyId || !currentCompany || !selectedTemplate) {
      message.error('Missing company or template');
      return null;
    }

    try {
      const now = getCurrentTimestamp();
      const docId = createdDocId || generateId();

      const newDoc: GeneratedDocument = {
        id: docId,
        companyId: currentCompanyId,
        templateId: selectedTemplate.id,
        templateVersion: selectedTemplate.version,
        templateSnapshot: selectedTemplate.content,
        employeeId: selectedEmployee?.id || formData.employee_id || 'MANUAL',
        letterheadId: selectedLetterhead.id || 'default',
        referenceNumber,
        title: selectedTemplate.name,
        category: selectedTemplate.category,
        status,
        filledData: formData,
        renderedContent,
        docxBlob: null,
        pdfBlob: null,
        letterDate: formData.letter_date || dayjs().format('YYYY-MM-DD'),
        effectiveDate: formData.effective_date || dayjs().format('YYYY-MM-DD'),
        issuedDate: status === 'issued' ? now : '',
        issuedBy: user?.name || 'HR Admin',
        notes: `Generated via wizard for ${formData.employee_name} (${formData.employee_id})`,
        createdBy: user?.id || 'anonymous',
        createdAt: now,
        updatedAt: now,
      };

      await db.documents.put(newDoc);
      setCreatedDocId(docId);

      await logAction(
        currentCompanyId,
        user?.id || 'anonymous',
        user?.name || 'User',
        status === 'issued' ? 'issue' : 'create',
        'document',
        docId,
        {
          title: newDoc.title,
          referenceNumber,
          employee: formData.employee_name,
        },
      );

      return newDoc;
    } catch (err: any) {
      console.error(err);
      message.error(`Failed to save document: ${err.message}`);
      return null;
    }
  };

  const handleExportDocx = async () => {
    if (!currentCompany || !selectedTemplate) return;
    try {
      setIsExporting(true);
      const savedDoc = await handleSaveDocument('issued');
      if (!savedDoc) return;

      const blob = await generateDocx(savedDoc, selectedLetterhead, currentCompany);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${referenceNumber.replace(/[\/\\]/g, '_')}_${formData.employee_name || 'Letter'}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.success('Word document (.docx) generated and downloaded');
    } catch (err: any) {
      console.error(err);
      message.error(`DOCX generation error: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    const element = document.getElementById('letter-preview-page');
    if (!element) {
      message.error('Preview element not rendered');
      return;
    }

    try {
      setIsExporting(true);
      await handleSaveDocument('issued');

      const fileName = `${referenceNumber.replace(/[\/\\]/g, '_')}_${formData.employee_name || 'Letter'}.pdf`;
      const blob = await generatePdfFromElement(element, fileName, selectedLetterhead);
      downloadPdfBlob(blob, fileName);
      message.success('PDF document generated and downloaded');
    } catch (err: any) {
      console.error(err);
      message.error(`PDF generation error: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Extract variables needed by current template
  const neededVariables = selectedTemplate
    ? extractPlaceholders(selectedTemplate.content).filter(
        (v) =>
          ![
            'company_name',
            'company_address',
            'company_email',
            'company_phone',
            'company_website',
            'authorized_signatory',
            'signatory_designation',
            'hr_name',
            'hr_designation',
            'reference_number',
          ].includes(v),
      )
    : [];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <PageHeader
        title="Universal HR Letter Generator"
        subtitle="End-to-end document creation: Select Template → Employee Info → Fill Variables → Preview Branded Letterhead → Export Word & PDF."
      />

      <Card style={{ marginBottom: '20px' }}>
        <Steps
          current={currentStep}
          items={[
            { title: '1. Select Template', icon: <FileTextOutlined /> },
            { title: '2. Employee & Data', icon: <UserOutlined /> },
            { title: '3. Fill Variables', icon: <FormOutlined /> },
            { title: '4. Preview & Validate', icon: <EyeOutlined /> },
            { title: '5. Export & Download', icon: <DownloadOutlined /> },
          ]}
        />
      </Card>

      {/* STEP 0: SELECT TEMPLATE */}
      {currentStep === 0 && (
        <Card title="Step 1: Choose an HR Letter Template">
          <Row gutter={[16, 16]}>
            {allTemplates.map((t) => (
              <Col xs={24} sm={12} lg={8} key={t.id}>
                <Card
                  hoverable
                  style={{
                    height: '100%',
                    border: selectedTemplate?.id === t.id ? '2px solid #1677ff' : undefined,
                    backgroundColor: selectedTemplate?.id === t.id ? '#f0f7ff' : undefined,
                  }}
                  onClick={() => {
                    setSelectedTemplate(t);
                    setCurrentStep(1);
                  }}
                >
                  <Tag color="blue" style={{ marginBottom: '8px' }}>
                    {t.subcategory || t.category}
                  </Tag>
                  <Title level={5} style={{ margin: '4px 0 8px 0' }}>
                    {t.name}
                  </Title>
                  <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ fontSize: '13px' }}>
                    {t.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* STEP 1: EMPLOYEE SELECTION */}
      {currentStep === 1 && selectedTemplate && (
        <Card
          title={`Step 2: Select Employee for "${selectedTemplate.name}"`}
          extra={
            <Button onClick={() => setCurrentStep(0)} icon={<ArrowLeftOutlined />}>
              Change Template
            </Button>
          }
        >
          <div style={{ marginBottom: '24px' }}>
            <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '15px' }}>
              Option A: Select from Existing Employee Directory
            </Text>
            <Select
              style={{ width: '100%', maxWidth: '500px' }}
              placeholder="Search by name, employee ID, role..."
              showSearch
              optionFilterProp="label"
              value={selectedEmployee?.id}
              onChange={handleSelectEmployee}
              options={(employees ?? []).map((e) => ({
                value: e.id,
                label: `${e.fullName} (${e.employeeId}) – ${e.designation}, ${e.department}`,
              }))}
            />
          </div>

          <Divider>OR</Divider>

          <Text strong style={{ display: 'block', marginBottom: '16px', fontSize: '15px' }}>
            Option B: Enter Employee Details Manually
          </Text>

          <Row gutter={16}>
            <Col span={12}>
              <div style={{ marginBottom: '12px' }}>
                <Text>Employee Full Name *</Text>
                <Input
                  value={formData.employee_name || ''}
                  onChange={(e) => handleFieldChange('employee_name', e.target.value)}
                  placeholder="e.g. Tanisha Roy"
                />
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: '12px' }}>
                <Text>Employee ID / Staff Code *</Text>
                <Input
                  value={formData.employee_id || ''}
                  onChange={(e) => handleFieldChange('employee_id', e.target.value)}
                  placeholder="e.g. ESL028"
                />
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: '12px' }}>
                <Text>Designation / Role *</Text>
                <Input
                  value={formData.designation || ''}
                  onChange={(e) => handleFieldChange('designation', e.target.value)}
                  placeholder="e.g. Customer Support Executive"
                />
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: '12px' }}>
                <Text>Department *</Text>
                <Input
                  value={formData.department || ''}
                  onChange={(e) => handleFieldChange('department', e.target.value)}
                  placeholder="e.g. Operations"
                />
              </div>
            </Col>
          </Row>

          <div style={{ marginTop: '24px', textAlign: 'right' }}>
            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              onClick={() => {
                if (!formData.employee_name) {
                  message.warning('Please enter or select an employee name');
                  return;
                }
                setCurrentStep(2);
              }}
            >
              Continue to Fill Variables
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: FILL SPECIFIC VARIABLES */}
      {currentStep === 2 && selectedTemplate && (
        <Card
          title={`Step 3: Fill Letter Details & Variables (${selectedTemplate.name})`}
          extra={
            <Button onClick={() => setCurrentStep(1)} icon={<ArrowLeftOutlined />}>
              Back to Employee
            </Button>
          }
        >
          <Row gutter={24}>
            <Col span={12}>
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Letter Issue Date</Text>
                <Input
                  value={formData.letter_date || ''}
                  onChange={(e) => handleFieldChange('letter_date', e.target.value)}
                  placeholder="e.g. 23 October 2026"
                />
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Effective Date (Date From Which Affected)</Text>
                <Input
                  value={formData.effective_date || ''}
                  onChange={(e) => handleFieldChange('effective_date', e.target.value)}
                  placeholder="e.g. 24 October 2026"
                />
              </div>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Time Period / Duration (e.g. for PIP, Probation, Notice)</Text>
                <Input
                  value={formData.period || ''}
                  onChange={(e) => handleFieldChange('period', e.target.value)}
                  placeholder="e.g. 30 Days, 60 Days, 3 Months"
                />
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Reporting Manager / Supervisor</Text>
                <Input
                  value={formData.reporting_manager || ''}
                  onChange={(e) => handleFieldChange('reporting_manager', e.target.value)}
                  placeholder="e.g. Amit Sharma"
                />
              </div>
            </Col>
          </Row>

          {/* Render any additional template-specific fields */}
          {neededVariables
            .filter((v) => !['letter_date', 'effective_date', 'period', 'reporting_manager', 'employee_name', 'employee_id', 'designation', 'department'].includes(v))
            .map((v) => (
              <div key={v} style={{ marginBottom: '16px' }}>
                <Text strong style={{ textTransform: 'capitalize' }}>
                  {v.replace(/_/g, ' ')}
                </Text>
                {v.includes('reason') || v.includes('incident') || v.includes('address') ? (
                  <TextArea
                    rows={3}
                    value={formData[v] || ''}
                    onChange={(e) => handleFieldChange(v, e.target.value)}
                    placeholder={`Enter ${v.replace(/_/g, ' ')}...`}
                  />
                ) : (
                  <Input
                    value={formData[v] || ''}
                    onChange={(e) => handleFieldChange(v, e.target.value)}
                    placeholder={`Enter ${v.replace(/_/g, ' ')}...`}
                  />
                )}
              </div>
            ))}

          <div style={{ marginTop: '24px', textAlign: 'right' }}>
            <Button
              type="primary"
              size="large"
              icon={<EyeOutlined />}
              onClick={() => setCurrentStep(3)}
            >
              Preview Document on Letterhead
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: PREVIEW & VALIDATE */}
      {currentStep === 3 && selectedTemplate && currentCompany && (
        <div>
          <Card style={{ marginBottom: '16px' }}>
            <Row gutter={16} align="middle">
              <Col span={12}>
                <Space>
                  <Text strong>Branded Letterhead:</Text>
                  <Select
                    style={{ width: '280px' }}
                    value={selectedLetterhead.id || 'default'}
                    onChange={(val) => {
                      const lh = letterheads?.find((l) => l.id === val);
                      if (lh) setSelectedLetterhead(lh);
                    }}
                    options={(letterheads ?? []).map((l) => ({
                      value: l.id,
                      label: `${l.name} (${l.preset || 'custom'})`,
                    }))}
                  />
                </Space>
              </Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => setCurrentStep(2)} icon={<ArrowLeftOutlined />}>
                    Edit Details
                  </Button>
                  <Button
                    type="primary"
                    icon={<ArrowRightOutlined />}
                    onClick={() => setCurrentStep(4)}
                  >
                    Proceed to Export
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Scaled Visual Paper Preview */}
          <Card
            title={`Document Preview – Ref: ${referenceNumber}`}
            extra={<Tag color="green">Ready for Generation</Tag>}
          >
            <LetterheadPreview
              letterhead={selectedLetterhead}
              company={currentCompany}
              content={renderedContent}
              letterDate={formData.letter_date}
              referenceNumber={referenceNumber}
              title={selectedTemplate.subject}
              employeeName={formData.employee_name}
              scale={0.9}
            />
          </Card>
        </div>
      )}

      {/* STEP 4: EXPORT & ACTIONS */}
      {currentStep === 4 && selectedTemplate && currentCompany && (
        <Card style={{ textAlign: 'center', padding: '40px 20px' }}>
          <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: '16px' }} />
          <Title level={3}>Document Ready for Distribution & Issuance</Title>
          <Paragraph type="secondary" style={{ fontSize: '16px', maxWidth: '600px', margin: '0 auto 24px auto' }}>
            Letter <strong>{referenceNumber}</strong> has been assembled using{' '}
            <strong>{currentCompany.tradeName || currentCompany.legalName}</strong>'s letterhead design.
          </Paragraph>

          <Space size="large" wrap>
            <Button
              type="primary"
              size="large"
              icon={<FileWordOutlined />}
              loading={isExporting}
              style={{ backgroundColor: '#2b579a', borderColor: '#2b579a', height: '48px', padding: '0 24px' }}
              onClick={handleExportDocx}
            >
              Download Word (.docx)
            </Button>

            <Button
              type="primary"
              size="large"
              icon={<FilePdfOutlined />}
              loading={isExporting}
              danger
              style={{ height: '48px', padding: '0 24px' }}
              onClick={handleExportPdf}
            >
              Download PDF
            </Button>

            <Button
              size="large"
              icon={<SaveOutlined />}
              onClick={async () => {
                await handleSaveDocument('draft');
                message.success('Saved as draft in Documents Library');
                navigate('/documents');
              }}
            >
              Save as Draft
            </Button>
          </Space>

          <Divider style={{ margin: '32px 0' }} />

          <Space>
            <Button onClick={() => setCurrentStep(3)}>Back to Preview</Button>
            <Button
              onClick={() => {
                setSelectedTemplate(null);
                setSelectedEmployee(null);
                setFormData({});
                setCurrentStep(0);
              }}
            >
              Create Another Letter
            </Button>
          </Space>
        </Card>
      )}
    </div>
  );
};

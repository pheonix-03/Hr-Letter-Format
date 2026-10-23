// ============================================================
// Batch Upload Page – Excel Upload & Bulk Letter Generation
// ============================================================
import React, { useState } from 'react';
import {
  Upload,
  Button,
  Card,
  Table,
  Space,
  Typography,
  Tag,
  Select,
  Alert,
  Steps,
  Row,
  Col,
  Statistic,
  Progress,
  Divider,
  message,
} from 'antd';
import {
  InboxOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileDoneOutlined,
  EyeOutlined,
  FileZipOutlined,
  FileWordOutlined,
  FilePdfOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { parseExcelFile, generateSampleExcel, computeReviewDate, type ParsedExcelResult } from '../services/excelParser';
import { allTemplates, getTemplateById } from '../templates';
import { fillTemplate } from '../services/templateEngine';
import { generateReferenceNumber } from '../services/referenceNumberService';
import { bulkDownloadDocxZip, bulkDownloadPdfZip } from '../services/bulkDownloadService';
import { generateDocx } from '../services/docxGenerator';
import { generatePdfFromElement, downloadPdfBlob } from '../services/pdfGenerator';
import { db, generateId, getCurrentTimestamp } from '../store/db';
import { useApp } from '../contexts/AppContext';
import { PageHeader } from '../components/PageHeader';
import { logAction } from '../services/auditService';
import type { GeneratedDocument, BatchRow, Company, LetterheadConfig } from '../types';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

export const BatchUpload: React.FC = () => {
  const navigate = useNavigate();
  const { currentCompanyId, currentCompany, switchCompany, user } = useApp();

  const [currentStep, setCurrentStep] = useState(0);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedExcelResult | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl_final_warning_behaviour');
  const [selectedLetterheadId, setSelectedLetterheadId] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDocument[]>([]);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState<{ current: number; total: number; name: string } | null>(null);

  // Fetch all companies
  const companies = useLiveQuery(() => db.companies.toArray(), []);

  // Fetch letterheads for current company
  const letterheads = useLiveQuery(async () => {
    if (!currentCompanyId) return [];
    return await db.letterheads.where('companyId').equals(currentCompanyId).toArray();
  }, [currentCompanyId]);

  const handleDownloadSample = () => {
    try {
      const blob = generateSampleExcel();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'HR_Letters_Employee_Batch_Template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success('Sample Excel template downloaded');
    } catch (err) {
      message.error('Failed to download template');
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setParsing(true);
      const result = await parseExcelFile(file);
      setParsedData(result);
      if (result.batchRows.length === 0) {
        message.warning('The uploaded sheet is empty');
      } else {
        message.success(`Parsed ${result.totalRows} rows (${result.validRows} valid)`);
        setCurrentStep(1); // advance to preview step
      }
    } catch (err: any) {
      console.error(err);
      message.error(`Failed to parse Excel file: ${err.message || 'Invalid format'}`);
    } finally {
      setParsing(false);
    }
    return false; // prevent default upload
  };

  const handleGenerateLetters = async () => {
    if (!currentCompanyId || !currentCompany) {
      message.error('Please select an active company first');
      return;
    }
    if (!parsedData || parsedData.validRows === 0) {
      message.error('No valid rows available to generate');
      return;
    }
    const template = getTemplateById(selectedTemplateId);
    if (!template) {
      message.error('Selected template not found');
      return;
    }

    try {
      setGenerating(true);
      const now = getCurrentTimestamp();
      const validRows = parsedData.batchRows.filter((r) => r.status === 'valid');
      const docsCreated: GeneratedDocument[] = [];

      for (const row of validRows) {
        const refNo = await generateReferenceNumber(currentCompanyId, template.category);
        const docId = generateId();

        // Merge row data with active company branding
        const mergedData: Record<string, string> = {
          ...row.data,
          company_name: currentCompany.tradeName || currentCompany.legalName,
          company_address: currentCompany.registeredAddress,
          company_email: currentCompany.officialEmail,
          company_phone: currentCompany.contactNumber,
          company_website: currentCompany.website,
          authorized_signatory: currentCompany.authorizedSignatoryName || 'Authorized Signatory',
          signatory_designation: currentCompany.authorizedSignatoryDesignation || 'Human Resources',
          hr_name: currentCompany.hrRepName || currentCompany.authorizedSignatoryName,
          hr_designation: currentCompany.hrRepDesignation || 'Human Resources',
          reference_number: refNo,
          letter_date: row.data.letter_date || now.split('T')[0],
          effective_date: row.data.effective_date || row.data.letter_date || now.split('T')[0],
          period: row.data.period || '8 Days',
          review_date:
            row.data.review_date ||
            computeReviewDate(
              row.data.effective_date || row.data.letter_date || now.split('T')[0],
              row.data.period || '8 Days',
            ),
        };

        const renderedContent = fillTemplate(template.content, mergedData);

        const newDoc: GeneratedDocument = {
          id: docId,
          companyId: currentCompanyId,
          templateId: template.id,
          templateVersion: template.version,
          templateSnapshot: template.content,
          employeeId: row.data.employee_id || 'UNKNOWN',
          letterheadId: selectedLetterheadId || 'default',
          referenceNumber: refNo,
          title: template.name,
          category: template.category,
          status: 'issued',
          filledData: mergedData,
          renderedContent,
          docxBlob: null,
          pdfBlob: null,
          letterDate: mergedData.letter_date,
          effectiveDate: mergedData.effective_date,
          issuedDate: now,
          issuedBy: user?.name || 'HR Admin',
          notes: `Batch generated from Excel for ${row.data.employee_name} (${row.data.employee_id})`,
          createdBy: user?.id || 'anonymous',
          createdAt: now,
          updatedAt: now,
        };

        await db.documents.add(newDoc);
        docsCreated.push(newDoc);
      }

      setGeneratedDocs(docsCreated);
      setCurrentStep(2); // advance to completed step

      await logAction(
        currentCompanyId,
        user?.id || 'anonymous',
        user?.name || 'User',
        'batch_generate',
        'document',
        docsCreated[0]?.id || 'batch',
        {
          count: docsCreated.length,
          templateName: template.name,
          company: currentCompany.legalName,
        },
      );

      message.success(`Successfully generated ${docsCreated.length} official letters!`);
    } catch (err: any) {
      console.error(err);
      message.error(`Failed to generate letters: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleBulkDownloadDocx = async () => {
    if (!currentCompany || generatedDocs.length === 0) return;
    try {
      setIsZipping(true);
      const activeLh = (letterheads ?? []).find((l) => l.id === selectedLetterheadId) || letterheads?.[0] || {};
      const companyTag = (currentCompany.tradeName || currentCompany.legalName).replace(/\s+/g, '_');
      const zipName = `${companyTag}_HR_Letters_DOCX_${new Date().toISOString().split('T')[0]}.zip`;

      await bulkDownloadDocxZip(generatedDocs, activeLh, currentCompany, zipName, (curr, tot, name) => {
        setZipProgress({ current: curr, total: tot, name });
      });

      message.success(`Downloaded all ${generatedDocs.length} Word (.docx) documents in ZIP!`);
    } catch (err: any) {
      console.error(err);
      message.error(`Bulk DOCX download failed: ${err.message}`);
    } finally {
      setIsZipping(false);
      setZipProgress(null);
    }
  };

  const handleBulkDownloadPdf = async () => {
    if (!currentCompany || generatedDocs.length === 0) return;
    try {
      setIsZipping(true);
      const activeLh = (letterheads ?? []).find((l) => l.id === selectedLetterheadId) || letterheads?.[0] || {};
      const companyTag = (currentCompany.tradeName || currentCompany.legalName).replace(/\s+/g, '_');
      const zipName = `${companyTag}_HR_Letters_PDF_${new Date().toISOString().split('T')[0]}.zip`;

      await bulkDownloadPdfZip(generatedDocs, activeLh, currentCompany, zipName, (curr, tot, name) => {
        setZipProgress({ current: curr, total: tot, name });
      });

      message.success(`Downloaded all ${generatedDocs.length} PDF documents in ZIP!`);
    } catch (err: any) {
      console.error(err);
      message.error(`Bulk PDF download failed: ${err.message}`);
    } finally {
      setIsZipping(false);
      setZipProgress(null);
    }
  };

  const handleDownloadSingleDocx = async (doc: GeneratedDocument) => {
    if (!currentCompany) return;
    try {
      const activeLh = (letterheads ?? []).find((l) => l.id === selectedLetterheadId) || letterheads?.[0] || {};
      const blob = await generateDocx(doc, activeLh, currentCompany);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.referenceNumber.replace(/[\/\\]/g, '_')}_${doc.filledData?.employee_name || 'Letter'}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.success('Downloaded Word document');
    } catch (err: any) {
      message.error(`Download failed: ${err.message}`);
    }
  };

  const previewColumns = [
    {
      title: 'Row',
      dataIndex: 'rowNumber',
      key: 'rowNumber',
      width: 60,
    },
    {
      title: 'Employee Name',
      key: 'employee_name',
      render: (_: any, record: BatchRow) => (
        <Text strong>{record.data.employee_name || '-'}</Text>
      ),
    },
    {
      title: 'Employee ID',
      key: 'employee_id',
      render: (_: any, record: BatchRow) => (
        <Tag color="blue">{record.data.employee_id || '-'}</Tag>
      ),
    },
    {
      title: 'Letter Date',
      key: 'letter_date',
      render: (_: any, record: BatchRow) => record.data.letter_date || '-',
    },
    {
      title: 'Effective Date (From)',
      key: 'effective_date',
      render: (_: any, record: BatchRow) => (
        <span style={{ color: '#0958d9', fontWeight: 500 }}>
          {record.data.effective_date || '-'}
        </span>
      ),
    },
    {
      title: 'Time Period',
      key: 'period',
      render: (_: any, record: BatchRow) => (
        <Tag color="purple">{record.data.period || '-'}</Tag>
      ),
    },
    {
      title: 'Review Date',
      key: 'review_date',
      render: (_: any, record: BatchRow) => (
        <Tag color="orange">{record.data.review_date || '-'}</Tag>
      ),
    },
    {
      title: 'Department',
      key: 'department',
      render: (_: any, record: BatchRow) => record.data.department || '-',
    },
    {
      title: 'Designation',
      key: 'designation',
      render: (_: any, record: BatchRow) => record.data.designation || '-',
    },
    {
      title: 'Validation',
      key: 'status',
      render: (_: any, record: BatchRow) =>
        record.status === 'valid' ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Valid
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="error">
            {record.errors.join(', ')}
          </Tag>
        ),
    },
  ];

  const generatedColumns = [
    {
      title: 'Reference No',
      dataIndex: 'referenceNumber',
      key: 'referenceNumber',
      render: (ref: string, record: GeneratedDocument) => (
        <a onClick={() => navigate(`/documents/${record.id}`)} style={{ fontWeight: 600 }}>
          {ref}
        </a>
      ),
    },
    {
      title: 'Employee Name',
      key: 'employee',
      render: (_: any, record: GeneratedDocument) => (
        <div>
          <Text strong>{record.filledData?.employee_name}</Text>
          <div style={{ fontSize: '12px', color: '#666' }}>
            ID: {record.filledData?.employee_id} | {record.filledData?.designation}
          </div>
        </div>
      ),
    },
    {
      title: 'Letter Date',
      dataIndex: 'letterDate',
      key: 'letterDate',
    },
    {
      title: 'Effective Date',
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      render: (d: string) => <Tag color="blue">{d}</Tag>,
    },
    {
      title: 'Duration',
      key: 'period',
      render: (_: any, record: GeneratedDocument) => (
        <Tag color="purple">{record.filledData?.period || '-'}</Tag>
      ),
    },
    {
      title: 'Review Date',
      key: 'review_date',
      render: (_: any, record: GeneratedDocument) => (
        <Tag color="orange">{record.filledData?.review_date || '-'}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: GeneratedDocument) => (
        <Space size="small">
          <Button
            size="small"
            icon={<FileWordOutlined />}
            onClick={() => handleDownloadSingleDocx(record)}
          >
            DOCX
          </Button>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/documents/${record.id}`)}
          >
            Preview
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <PageHeader
        title="Excel Batch Upload & Mass Letter Generator"
        subtitle="Upload an Excel sheet (Employee Names, IDs, Issue Dates, Effective Dates, Time Periods) to generate letters and bulk download as a ZIP package."
        extra={
          <Button icon={<DownloadOutlined />} onClick={handleDownloadSample}>
            Download Sample Excel Template
          </Button>
        }
      />

      <Card style={{ marginBottom: '24px' }}>
        <Steps
          current={currentStep}
          items={[
            { title: '1. Upload Excel File', description: 'Upload .xlsx or .csv' },
            { title: '2. Review & Select Template', description: 'Validate columns & rows' },
            { title: '3. Generate & Bulk Download', description: 'Export all as ZIP archive' },
          ]}
        />
      </Card>

      {/* STEP 0: UPLOAD */}
      {currentStep === 0 && (
        <Card title="Upload Employee Spreadsheet">
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: '20px' }}
            message="Active Company Branding Notice"
            description={
              <div>
                Documents will be generated for:{' '}
                <strong>{currentCompany?.tradeName || currentCompany?.legalName || 'No Company Selected'}</strong>.
                You can switch company at any time using the selector in Step 2.
              </div>
            }
          />

          <Dragger
            accept=".xlsx, .xls, .csv"
            beforeUpload={handleFileUpload}
            showUploadList={false}
            style={{ padding: '36px' }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ color: '#1677ff', fontSize: '52px' }} />
            </p>
            <p className="ant-upload-text" style={{ fontSize: '18px', fontWeight: 500 }}>
              Click or drag your Employee Details Excel file to this area
            </p>
            <p className="ant-upload-hint">
              Supports <strong>Employee Details.xlsx</strong> with columns: Full Name, Employee ID, Letter date, Effective Date, Time Period, Department, Designation.
            </p>
          </Dragger>
        </Card>
      )}

      {/* STEP 1: PREVIEW & CONFIGURATION */}
      {currentStep === 1 && parsedData && (
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          <Row gutter={16}>
            <Col span={8}>
              <Card size="small">
                <Statistic title="Total Employees in Sheet" value={parsedData.totalRows} />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Statistic
                  title="Ready for Generation"
                  value={parsedData.validRows}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Statistic
                  title="Errors / Skipped"
                  value={parsedData.invalidRows}
                  valueStyle={{ color: parsedData.invalidRows > 0 ? '#cf1322' : '#888' }}
                  prefix={parsedData.invalidRows > 0 ? <CloseCircleOutlined /> : undefined}
                />
              </Card>
            </Col>
          </Row>

          <Card title="Letter Generation Settings & Target Organization">
            <Row gutter={24}>
              <Col span={8}>
                <div style={{ marginBottom: '8px', fontWeight: 600 }}>
                  <BankOutlined style={{ marginRight: '6px', color: '#1677ff' }} />
                  Company Workspace:
                </div>
                <Select
                  value={currentCompanyId}
                  onChange={(val) => switchCompany(val)}
                  style={{ width: '100%' }}
                  options={(companies ?? []).map((c) => ({
                    value: c.id,
                    label: `${c.tradeName || c.legalName} (${c.city || 'India'})`,
                  }))}
                />
              </Col>

              <Col span={8}>
                <div style={{ marginBottom: '8px', fontWeight: 600 }}>
                  Select HR Letter Template:
                </div>
                <Select
                  value={selectedTemplateId}
                  onChange={setSelectedTemplateId}
                  style={{ width: '100%' }}
                  showSearch
                  optionFilterProp="label"
                  options={allTemplates.map((t) => ({
                    value: t.id,
                    label: `${t.name} (${t.subcategory || t.category})`,
                  }))}
                />
              </Col>

              <Col span={8}>
                <div style={{ marginBottom: '8px', fontWeight: 600 }}>
                  Letterhead Design:
                </div>
                <Select
                  value={selectedLetterheadId}
                  onChange={setSelectedLetterheadId}
                  style={{ width: '100%' }}
                  placeholder="Default Branded Letterhead"
                  allowClear
                  options={(letterheads ?? []).map((lh) => ({
                    value: lh.id,
                    label: `${lh.name} (${lh.preset || 'preset'})`,
                  }))}
                />
              </Col>
            </Row>
          </Card>

          <Card
            title="Spreadsheet Rows Preview"
            extra={
              <Space>
                <Button onClick={() => setCurrentStep(0)}>Re-upload File</Button>
                <Button
                  type="primary"
                  size="large"
                  icon={<FileDoneOutlined />}
                  loading={generating}
                  disabled={parsedData.validRows === 0}
                  onClick={handleGenerateLetters}
                >
                  Generate {parsedData.validRows} Letters for {currentCompany?.tradeName || 'Company'}
                </Button>
              </Space>
            }
          >
            <Table
              dataSource={parsedData.batchRows}
              columns={previewColumns}
              rowKey="rowNumber"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Space>
      )}

      {/* STEP 2: COMPLETION & BULK DOWNLOAD */}
      {currentStep === 2 && (
        <Card style={{ padding: '30px 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: '16px' }} />
            <Title level={2} style={{ margin: 0 }}>
              Batch Generation Complete!
            </Title>
            <Paragraph type="secondary" style={{ fontSize: '16px', marginTop: '8px' }}>
              Successfully generated <strong>{generatedDocs.length}</strong> customized letters for{' '}
              <strong>{currentCompany?.tradeName || currentCompany?.legalName}</strong>.
            </Paragraph>

            {/* BULK DOWNLOAD HERO BUTTONS */}
            <div
              style={{
                backgroundColor: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: '8px',
                padding: '24px',
                maxWidth: '750px',
                margin: '24px auto',
              }}
            >
              <Title level={4} style={{ marginTop: 0, color: '#389e0d' }}>
                <FileZipOutlined style={{ marginRight: '8px' }} />
                Bulk Download Options
              </Title>
              <Paragraph style={{ color: '#555', marginBottom: '20px' }}>
                Download all {generatedDocs.length} generated documents in a single compressed ZIP archive.
              </Paragraph>

              {isZipping && zipProgress && (
                <div style={{ marginBottom: '16px' }}>
                  <Text strong>
                    Compressing {zipProgress.current} of {zipProgress.total}: {zipProgress.name}
                  </Text>
                  <Progress
                    percent={Math.round((zipProgress.current / zipProgress.total) * 100)}
                    status="active"
                  />
                </div>
              )}

              <Space size="large" wrap>
                <Button
                  type="primary"
                  size="large"
                  icon={<FileWordOutlined />}
                  loading={isZipping}
                  onClick={handleBulkDownloadDocx}
                  style={{
                    backgroundColor: '#2b579a',
                    borderColor: '#2b579a',
                    height: '48px',
                    fontSize: '15px',
                    fontWeight: 600,
                    padding: '0 28px',
                  }}
                >
                  Download All as ZIP (Word .docx)
                </Button>

                <Button
                  type="primary"
                  danger
                  size="large"
                  icon={<FilePdfOutlined />}
                  loading={isZipping}
                  onClick={handleBulkDownloadPdf}
                  style={{
                    height: '48px',
                    fontSize: '15px',
                    fontWeight: 600,
                    padding: '0 28px',
                  }}
                >
                  Download All as ZIP (PDF)
                </Button>
              </Space>
            </div>

            <Space size="middle" style={{ marginTop: '16px' }}>
              <Button
                icon={<EyeOutlined />}
                onClick={() => navigate('/documents')}
              >
                View in Documents Repository
              </Button>
              <Button
                onClick={() => {
                  setParsedData(null);
                  setGeneratedDocs([]);
                  setCurrentStep(0);
                }}
              >
                Upload Another Batch
              </Button>
            </Space>
          </div>

          <Divider style={{ margin: '32px 0 24px 0' }}>
            Generated Documents Roster ({generatedDocs.length} Letters)
          </Divider>

          <Table
            dataSource={generatedDocs}
            columns={generatedColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )}
    </div>
  );
};

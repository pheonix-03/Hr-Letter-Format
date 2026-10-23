// ============================================================
// Document Preview Page – Single Document View & Download
// ============================================================
import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Tag,
  Row,
  Col,
  Descriptions,
  message,
  Typography,
} from 'antd';
import {
  ArrowLeftOutlined,
  FileWordOutlined,
  FilePdfOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../store/db';
import { useApp } from '../contexts/AppContext';
import { LetterheadPreview } from '../components/LetterheadPreview';
import { PageHeader } from '../components/PageHeader';
import { generateDocx } from '../services/docxGenerator';
import { generatePdfFromElement, downloadPdfBlob } from '../services/pdfGenerator';
import { logAction } from '../services/auditService';
import type { GeneratedDocument, LetterheadConfig, Company } from '../types';

const { Title, Text } = Typography;

export const DocumentPreview: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentCompany, user } = useApp();

  const [doc, setDoc] = useState<GeneratedDocument | null>(null);
  const [letterhead, setLetterhead] = useState<Partial<LetterheadConfig>>({});
  const [docCompany, setDocCompany] = useState<Company | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (id) {
      db.documents.get(id).then(async (d) => {
        if (d) {
          setDoc(d);
          // Load company
          const comp = await db.companies.get(d.companyId);
          if (comp) setDocCompany(comp);

          // Load letterhead
          if (d.letterheadId && d.letterheadId !== 'default') {
            const lh = await db.letterheads.get(d.letterheadId);
            if (lh) setLetterhead(lh);
          } else {
            // Find default letterhead for company
            const allLh = await db.letterheads.where('companyId').equals(d.companyId).toArray();
            const defLh = allLh.find((l) => l.isDefault) || allLh[0];
            if (defLh) setLetterhead(defLh);
          }
        } else {
          message.error('Document not found');
          navigate('/documents');
        }
      });
    }
  }, [id, navigate]);

  const activeCompany = docCompany || currentCompany;

  const handleExportDocx = async () => {
    if (!doc || !activeCompany) return;
    try {
      setIsExporting(true);
      const blob = await generateDocx(doc, letterhead, activeCompany);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.referenceNumber.replace(/[\/\\]/g, '_')}_${doc.filledData?.employee_name || 'Letter'}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.success('Word document (.docx) downloaded');

      await logAction(
        doc.companyId,
        user?.id || 'anonymous',
        user?.name || 'User',
        'download',
        'document',
        doc.id,
        { format: 'docx', ref: doc.referenceNumber },
      );
    } catch (err: any) {
      console.error(err);
      message.error(`Failed to export DOCX: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    const element = document.getElementById('letter-preview-page');
    if (!element || !doc) return;
    try {
      setIsExporting(true);
      const fileName = `${doc.referenceNumber.replace(/[\/\\]/g, '_')}_${doc.filledData?.employee_name || 'Letter'}.pdf`;
      const blob = await generatePdfFromElement(element, fileName, letterhead);
      downloadPdfBlob(blob, fileName);
      message.success('PDF document downloaded');

      await logAction(
        doc.companyId,
        user?.id || 'anonymous',
        user?.name || 'User',
        'download',
        'document',
        doc.id,
        { format: 'pdf', ref: doc.referenceNumber },
      );
    } catch (err: any) {
      console.error(err);
      message.error(`Failed to export PDF: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!doc || !activeCompany) {
    return <Card loading style={{ margin: '24px' }} />;
  }

  return (
    <div>
      <PageHeader
        title={`Document: ${doc.referenceNumber || 'DRAFT'}`}
        subtitle={`${doc.title} issued for ${doc.filledData?.employee_name || 'Employee'}`}
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/documents')}>
              Back to Repository
            </Button>
            <Button
              type="primary"
              icon={<FileWordOutlined />}
              loading={isExporting}
              style={{ backgroundColor: '#2b579a', borderColor: '#2b579a' }}
              onClick={handleExportDocx}
            >
              Export DOCX
            </Button>
            <Button
              type="primary"
              danger
              icon={<FilePdfOutlined />}
              loading={isExporting}
              onClick={handleExportPdf}
            >
              Export PDF
            </Button>
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              Print
            </Button>
          </Space>
        }
      />

      <Row gutter={24}>
        <Col span={8}>
          <Card title="Document Metadata" style={{ marginBottom: '20px' }}>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Reference No">
                <strong>{doc.referenceNumber}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={doc.status === 'issued' ? 'green' : 'blue'}>
                  {doc.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Employee Name">
                {doc.filledData?.employee_name}
              </Descriptions.Item>
              <Descriptions.Item label="Employee ID">
                {doc.filledData?.employee_id || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Role / Title">
                {doc.filledData?.designation || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Department">
                {doc.filledData?.department || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Letter Date">
                {doc.letterDate}
              </Descriptions.Item>
              <Descriptions.Item label="Effective Date">
                {doc.effectiveDate || '-'}
              </Descriptions.Item>
              {doc.filledData?.period && (
                <Descriptions.Item label="Time Period / PIP">
                  <Tag color="purple">{doc.filledData.period}</Tag>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Issued By">
                {doc.issuedBy || 'HR Admin'}
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {new Date(doc.createdAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col span={16}>
          <Card title="Rendered Document (Print Preview)">
            <LetterheadPreview
              letterhead={letterhead}
              company={activeCompany}
              content={doc.renderedContent}
              letterDate={doc.letterDate}
              referenceNumber={doc.referenceNumber}
              title={doc.title}
              employeeName={doc.filledData?.employee_name}
              scale={0.95}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

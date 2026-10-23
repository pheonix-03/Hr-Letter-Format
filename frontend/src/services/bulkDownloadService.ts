// ============================================================
// Bulk Download Service – Export Multiple Letters as ZIP Archive
// ============================================================
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { generateDocx } from './docxGenerator';
import jsPDF from 'jspdf';
import type { GeneratedDocument, LetterheadConfig, Company } from '../types';

export interface BulkProgressCallback {
  (completed: number, total: number, currentItem: string): void;
}

/**
 * Generate a ZIP file containing Microsoft Word (.docx) documents for all supplied records
 */
export async function bulkDownloadDocxZip(
  documents: GeneratedDocument[],
  letterhead: Partial<LetterheadConfig>,
  company: Company,
  zipFileName: string = `HR_Letters_${company.tradeName || 'Bulk'}_${new Date().toISOString().split('T')[0]}.zip`,
  onProgress?: BulkProgressCallback,
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('HR_Letters') || zip;
  const total = documents.length;

  for (let i = 0; i < total; i++) {
    const doc = documents[i];
    const empName = (doc.filledData?.employee_name || 'Employee').replace(/[^a-zA-Z0-9_-]/g, '_');
    const empId = (doc.filledData?.employee_id || 'ID').replace(/[^a-zA-Z0-9_-]/g, '_');
    const title = (doc.title || 'Letter').replace(/[^a-zA-Z0-9_-]/g, '_');
    const ref = (doc.referenceNumber || `DOC_${i + 1}`).replace(/[\/\\]/g, '_');

    onProgress?.(i + 1, total, `${empName} (${empId})`);

    const blob = await generateDocx(doc, letterhead, company);
    const fileName = `${ref}_${empId}_${empName}_${title}.docx`;
    folder.file(fileName, blob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, zipFileName);
}

/**
 * Generate a ZIP file containing PDF documents for all supplied records
 */
export async function bulkDownloadPdfZip(
  documents: GeneratedDocument[],
  letterhead: Partial<LetterheadConfig>,
  company: Company,
  zipFileName: string = `HR_Letters_PDF_${company.tradeName || 'Bulk'}_${new Date().toISOString().split('T')[0]}.zip`,
  onProgress?: BulkProgressCallback,
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('HR_Letters_PDF') || zip;
  const total = documents.length;

  for (let i = 0; i < total; i++) {
    const doc = documents[i];
    const empName = (doc.filledData?.employee_name || 'Employee').replace(/[^a-zA-Z0-9_-]/g, '_');
    const empId = (doc.filledData?.employee_id || 'ID').replace(/[^a-zA-Z0-9_-]/g, '_');
    const title = (doc.title || 'Letter').replace(/[^a-zA-Z0-9_-]/g, '_');
    const ref = (doc.referenceNumber || `DOC_${i + 1}`).replace(/[\/\\]/g, '_');

    onProgress?.(i + 1, total, `${empName} (${empId})`);

    // Generate crisp PDF using jsPDF
    const pdf = new jsPDF({
      orientation: letterhead.orientation === 'landscape' ? 'landscape' : 'portrait',
      unit: 'mm',
      format: letterhead.pageSize === 'Letter' ? 'letter' : 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = letterhead.marginLeft || 20;
    const maxLineWidth = pageWidth - margin * 2;

    // Header
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.setTextColor(26, 54, 93);
    pdf.text(company.tradeName || company.legalName, pageWidth / 2, 22, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(100, 100, 100);
    const addressStr = `${company.registeredAddress || ''}, ${company.city || ''} ${company.postalCode || ''}`;
    pdf.text(addressStr, pageWidth / 2, 27, { align: 'center' });

    const contactStr = [company.contactNumber, company.officialEmail, company.website].filter(Boolean).join(' | ');
    if (contactStr) {
      pdf.text(contactStr, pageWidth / 2, 31, { align: 'center' });
    }

    // Divider line
    pdf.setDrawColor(26, 54, 93);
    pdf.setLineWidth(0.6);
    pdf.line(margin, 35, pageWidth - margin, 35);

    // Reference & Date
    pdf.setFontSize(9.5);
    pdf.setTextColor(30, 30, 30);
    pdf.text(`Ref: ${doc.referenceNumber || 'DRAFT'}`, margin, 42);
    pdf.text(`Date: ${doc.letterDate || new Date().toLocaleDateString()}`, pageWidth - margin, 42, { align: 'right' });

    // Subject / Title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text(doc.title.toUpperCase(), pageWidth / 2, 50, { align: 'center' });

    // Body
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9.5);
    pdf.setTextColor(40, 40, 40);

    const cleanBody = doc.renderedContent
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();

    const splitText = pdf.splitTextToSize(cleanBody, maxLineWidth);
    pdf.text(splitText, margin, 58);

    // Signatory
    const yPos = Math.min(240, 60 + splitText.length * 4.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`For and on behalf of ${company.tradeName || company.legalName}`, margin, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text('____________________________________', margin, yPos + 12);
    pdf.text(company.authorizedSignatoryName || 'Authorized Signatory', margin, yPos + 17);
    pdf.text(company.authorizedSignatoryDesignation || 'Human Resources', margin, yPos + 21);

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    pdf.text(
      letterhead.confidentialityText || company.confidentialityNotice || 'CONFIDENTIAL – Official HR Communication',
      pageWidth / 2,
      285,
      { align: 'center' },
    );

    const pdfBlob = pdf.output('blob');
    const fileName = `${ref}_${empId}_${empName}_${title}.pdf`;
    folder.file(fileName, pdfBlob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, zipFileName);
}

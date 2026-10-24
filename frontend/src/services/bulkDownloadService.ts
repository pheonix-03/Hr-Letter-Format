// ============================================================
// Bulk Download Service – Export Multiple Letters as ZIP Archive
// ============================================================
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { generateDocx } from './docxGenerator';
import jsPDF from 'jspdf';
import type { GeneratedDocument, LetterheadConfig, Company } from '../types';
import { stripTrailingSignatures } from './templateEngine';

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

    // Clean body and strip any duplicate trailing signatures/acknowledgements
    const rawBody = doc.renderedContent
      .replace(/<br\s*[\/]?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<li>/gi, '• ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();

    const cleanBody = stripTrailingSignatures(rawBody);

    // Generate crisp multi-page capable PDF using jsPDF
    const pdf = new jsPDF({
      orientation: letterhead.orientation === 'landscape' ? 'landscape' : 'portrait',
      unit: 'mm',
      format: letterhead.pageSize === 'Letter' ? 'letter' : 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = letterhead.marginLeft || 20;
    const maxLineWidth = pageWidth - margin * 2;
    const footerY = pageHeight - 12;

    const renderHeader = (isFirstPage: boolean) => {
      if (isFirstPage) {
        // Company Brand Header
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(15);
        pdf.setTextColor(26, 54, 93);
        pdf.text(company.tradeName || company.legalName, pageWidth / 2, 20, { align: 'center' });

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(90, 90, 90);
        const addressStr = `${company.registeredAddress || ''}, ${company.city || ''} ${company.postalCode || ''}`;
        pdf.text(addressStr, pageWidth / 2, 25, { align: 'center' });

        const contactStr = [company.contactNumber, company.officialEmail, company.website].filter(Boolean).join('  |  ');
        if (contactStr) {
          pdf.text(contactStr, pageWidth / 2, 29, { align: 'center' });
        }

        // Header Divider line
        pdf.setDrawColor(26, 54, 93);
        pdf.setLineWidth(0.6);
        pdf.line(margin, 32, pageWidth - margin, 32);

        // Reference Number & Date Line
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(30, 30, 30);
        pdf.text(`Ref: ${doc.referenceNumber || 'DRAFT'}`, margin, 38);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Date: ${doc.letterDate || new Date().toLocaleDateString('en-GB')}`, pageWidth - margin, 38, { align: 'right' });

        // Letter Title / Subject
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10.5);
        pdf.setTextColor(17, 24, 39);
        pdf.text(doc.title.toUpperCase(), pageWidth / 2, 45, { align: 'center' });
      } else {
        // Subtle continuation header on subsequent pages
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        pdf.setTextColor(130, 130, 130);
        pdf.text(`${company.tradeName || company.legalName} – Ref: ${doc.referenceNumber || 'DRAFT'} (Contd.)`, margin, 15);
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.3);
        pdf.line(margin, 17, pageWidth - margin, 17);
      }
    };

    renderHeader(true);
    let currentY = 52;
    const bottomContentLimit = pageHeight - 25; // Leave space before footer

    // Flow Body Paragraphs
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9.5);
    pdf.setTextColor(35, 35, 35);

    const paragraphs = cleanBody.split(/\n+/).map((p) => p.trim()).filter(Boolean);

    for (const para of paragraphs) {
      const isBullet = para.startsWith('•') || para.startsWith('-');
      const paraIndent = isBullet ? margin + 4 : margin;
      const paraWidth = isBullet ? maxLineWidth - 4 : maxLineWidth;
      const lines = pdf.splitTextToSize(para, paraWidth);

      for (let l = 0; l < lines.length; l++) {
        if (currentY + 5.0 > bottomContentLimit) {
          pdf.addPage();
          renderHeader(false);
          currentY = 25;
        }
        pdf.text(lines[l], paraIndent, currentY);
        currentY += 4.8;
      }
      currentY += 3.0; // paragraph gap
    }

    // Signatory Block
    // Needs approx 36mm space
    currentY += 4;
    if (currentY + 36 > bottomContentLimit) {
      pdf.addPage();
      renderHeader(false);
      currentY = 25;
    }

    const signatoryY = currentY;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9.5);
    pdf.setTextColor(20, 20, 20);
    pdf.text(`For and on behalf of ${company.tradeName || company.legalName}`, margin, signatoryY);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text('____________________________________', margin, signatoryY + 14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(company.authorizedSignatoryName || 'Authorized Signatory', margin, signatoryY + 19);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(80, 80, 80);
    pdf.text(company.authorizedSignatoryDesignation || 'Managing Director / General Manager', margin, signatoryY + 23);

    // Official Seal Circle on the right side
    const sealX = pageWidth - margin - 22;
    const sealY = signatoryY + 12;
    pdf.setDrawColor(22, 119, 255);
    pdf.setLineWidth(0.4);
    pdf.setLineDashPattern([1.8, 1.2], 0);
    pdf.circle(sealX, sealY, 13);
    pdf.setLineDashPattern([], 0); // reset solid

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.5);
    pdf.setTextColor(22, 119, 255);
    const sealLines = pdf.splitTextToSize((company.tradeName || company.legalName || 'EMPOWERED SERVICES LLP').toUpperCase(), 22);
    pdf.text(sealLines, sealX, sealY - (sealLines.length === 1 ? 1 : 2.5), { align: 'center' });
    pdf.setFontSize(5.5);
    pdf.text('OFFICIAL SEAL', sealX, sealY + 4, { align: 'center' });

    currentY = signatoryY + 30;

    // Employee Receipt Acknowledgement Block
    // Needs approx 32mm space
    if (currentY + 32 > bottomContentLimit) {
      pdf.addPage();
      renderHeader(false);
      currentY = 25;
    }

    // Dashed separator for acknowledgement
    pdf.setDrawColor(180, 180, 180);
    pdf.setLineWidth(0.3);
    pdf.setLineDashPattern([1.5, 1.5], 0);
    pdf.line(margin, currentY, pageWidth - margin, currentY);
    pdf.setLineDashPattern([], 0);

    currentY += 5;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(50, 50, 50);
    pdf.text('EMPLOYEE RECEIPT ACKNOWLEDGEMENT', margin, currentY);

    currentY += 4.5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(70, 70, 70);
    const rawEmp = doc.filledData?.employee_name || 'Employee';
    const ackDate = doc.letterDate || new Date().toLocaleDateString('en-GB');
    const ackLines = pdf.splitTextToSize(
      `I, ${rawEmp}, hereby acknowledge that I have received and reviewed the terms of this official letter dated ${ackDate}.`,
      maxLineWidth,
    );
    pdf.text(ackLines, margin, currentY);

    currentY += ackLines.length * 4.0 + 4;
    pdf.text('Employee Signature: ___________________________', margin, currentY);
    pdf.text('Date: ____________________', pageWidth - margin - 45, currentY);

    // Footer on all pages
    const totalPages = pdf.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      pdf.setPage(p);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(130, 130, 130);
      const confNotice =
        letterhead.confidentialityText ||
        company.confidentialityNotice ||
        'CONFIDENTIAL – Official HR Employment Communication';
      pdf.text(confNotice, pageWidth / 2, footerY, { align: 'center' });

      if (totalPages > 1) {
        pdf.setFontSize(7);
        pdf.text(`Page ${p} of ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
      }
    }

    const pdfBlob = pdf.output('blob');
    const fileName = `${ref}_${empId}_${empName}_${title}.pdf`;
    folder.file(fileName, pdfBlob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, zipFileName);
}

// ============================================================
// PDF Generator Service – HR Letter Generator
// ============================================================
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { LetterheadConfig } from '../types';

export async function generatePdfFromElement(
  element: HTMLElement,
  fileName: string,
  letterhead?: Partial<LetterheadConfig>,
): Promise<Blob> {
  const isLandscape = letterhead?.orientation === 'landscape';
  const pageSize = letterhead?.pageSize === 'Letter' ? 'letter' : 'a4';

  // Temporarily ensure high quality
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);

  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: pageSize,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const ratio = canvasWidth / pdfWidth;
  const imgHeight = canvasHeight / ratio;

  let heightLeft = imgHeight;
  let position = 0;

  // First page
  pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
  heightLeft -= pdfHeight;

  // Subsequent pages if content overflows
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;
  }

  const blob = pdf.output('blob');
  return blob;
}

export function downloadPdfBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

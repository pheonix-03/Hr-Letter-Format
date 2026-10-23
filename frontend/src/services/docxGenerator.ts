// ============================================================
// DOCX Generator Service – Native Microsoft Word Generation
// ============================================================
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
} from 'docx';
import type { GeneratedDocument, LetterheadConfig, Company } from '../types';

export async function generateDocx(
  doc: GeneratedDocument,
  letterhead: Partial<LetterheadConfig>,
  company: Company,
): Promise<Blob> {
  const font = letterhead?.bodyFontFamily || 'Calibri';
  const fontSize = (letterhead?.bodyFontSize || 11) * 2; // docx font size is in half-points

  // Clean HTML from renderedContent to paragraphs
  const plainText = doc.renderedContent
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<li>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim();

  const contentParagraphs = plainText.split('\n\n').filter((p) => p.trim().length > 0);

  const docxParagraphs: Paragraph[] = [];

  // 1. Header Information if enabled in letterhead
  if (letterhead?.headerEnabled !== false) {
    docxParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: company.tradeName || company.legalName,
            bold: true,
            size: 28,
            font,
            color: letterhead?.companyNameFontColor || '1A365D',
          }),
        ],
      }),
    );

    if (company.registeredAddress) {
      docxParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: `${company.registeredAddress}, ${company.city || ''} ${company.state || ''} ${company.postalCode || ''}`,
              size: 18,
              font,
              color: '555555',
            }),
          ],
        }),
      );
    }

    const contactLine = [
      company.contactNumber ? `Phone: ${company.contactNumber}` : '',
      company.officialEmail ? `Email: ${company.officialEmail}` : '',
      company.website ? `Web: ${company.website}` : '',
    ]
      .filter(Boolean)
      .join('  |  ');

    if (contactLine) {
      docxParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: contactLine,
              size: 16,
              font,
              color: '666666',
            }),
          ],
        }),
      );
    }

    // Separator line
    docxParagraphs.push(
      new Paragraph({
        border: {
          bottom: {
            color: letterhead?.separatorColor || '1A365D',
            space: 1,
            style: BorderStyle.SINGLE,
            size: 12,
          },
        },
        spacing: { after: 200 },
      }),
    );
  }

  // 2. Reference Number and Date Header
  docxParagraphs.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: `Date: ${doc.letterDate || new Date().toLocaleDateString()}`,
          bold: true,
          size: fontSize,
          font,
        }),
      ],
    }),
  );

  if (doc.referenceNumber) {
    docxParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 160 },
        children: [
          new TextRun({
            text: `Ref No: ${doc.referenceNumber}`,
            bold: true,
            size: fontSize,
            font,
          }),
        ],
      }),
    );
  }

  // 3. Document Title / Subject
  if (doc.title) {
    docxParagraphs.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 200 },
        children: [
          new TextRun({
            text: doc.title.toUpperCase(),
            bold: true,
            size: fontSize + 4,
            font,
            underline: {},
          }),
        ],
      }),
    );
  }

  // 4. Main Body Content
  for (const p of contentParagraphs) {
    docxParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 160, line: 300 },
        children: [
          new TextRun({
            text: p.trim(),
            size: fontSize,
            font,
          }),
        ],
      }),
    );
  }

  // 5. Signatory Block
  docxParagraphs.push(
    new Paragraph({
      spacing: { before: 240, after: 80 },
      children: [
        new TextRun({
          text: `For and on behalf of ${company.tradeName || company.legalName}`,
          bold: true,
          size: fontSize,
          font,
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 200, after: 40 },
      children: [
        new TextRun({
          text: '________________________________________',
          size: fontSize,
          font,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: company.authorizedSignatoryName || 'Authorized Signatory',
          bold: true,
          size: fontSize,
          font,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: company.authorizedSignatoryDesignation || 'Human Resources',
          size: fontSize,
          font,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: 'Company Seal: ___________________________',
          size: fontSize,
          font,
        }),
      ],
    }),
  );

  // 6. Employee Acknowledgement Section (especially for warnings/notices)
  docxParagraphs.push(
    new Paragraph({
      spacing: { before: 240, after: 80 },
      border: {
        top: {
          color: 'CCCCCC',
          space: 4,
          style: BorderStyle.DASHED,
          size: 6,
        },
      },
      children: [
        new TextRun({
          text: 'EMPLOYEE ACKNOWLEDGEMENT',
          bold: true,
          size: fontSize - 2,
          font,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: `I, ${doc.filledData.employee_name || '___________________________'}, acknowledge receipt of this letter dated ${doc.letterDate || '____________'}.`,
          size: fontSize - 2,
          font,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: 'Signature: __________________________        Date: __________________',
          size: fontSize - 2,
          font,
        }),
      ],
    }),
  );

  // Create Document
  const docxFile = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: (letterhead?.marginTop || 25) * 56.7, // mm to dxa
              bottom: (letterhead?.marginBottom || 25) * 56.7,
              left: (letterhead?.marginLeft || 25) * 56.7,
              right: (letterhead?.marginRight || 25) * 56.7,
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: letterhead?.confidentialityText || 'Confidential – For Intended Recipient Only | ',
                    size: 16,
                    font,
                    color: '888888',
                  }),
                  new TextRun({
                    children: ['Page ', PageNumber.CURRENT, ' of ', PageNumber.TOTAL_PAGES],
                    size: 16,
                    font,
                    color: '888888',
                  }),
                ],
              }),
            ],
          }),
        },
        children: docxParagraphs,
      },
    ],
  });

  return await Packer.toBlob(docxFile);
}

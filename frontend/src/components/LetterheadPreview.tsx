// ============================================================
// Letterhead Preview Component – Live Visual Document Rendering
// ============================================================
import React from 'react';
import type { Company, LetterheadConfig } from '../types';
import { SignatureBlock } from './SignatureBlock';

interface LetterheadPreviewProps {
  letterhead: Partial<LetterheadConfig>;
  company: Company;
  content: string;
  letterDate?: string;
  referenceNumber?: string;
  title?: string;
  employeeName?: string;
  scale?: number;
  id?: string;
}

export const LetterheadPreview: React.FC<LetterheadPreviewProps> = ({
  letterhead,
  company,
  content,
  letterDate,
  referenceNumber,
  title,
  employeeName,
  scale = 1,
  id = 'letter-preview-page',
}) => {
  const isA4 = letterhead.pageSize !== 'Letter';
  const widthPx = isA4 ? 794 : 816;
  const minHeightPx = isA4 ? 1123 : 1056;

  const marginTop = letterhead.marginTop ?? 20;
  const marginBottom = letterhead.marginBottom ?? 20;
  const marginLeft = letterhead.marginLeft ?? 22;
  const marginRight = letterhead.marginRight ?? 22;

  const font = letterhead.bodyFontFamily || 'Segoe UI, -apple-system, sans-serif';
  const fontSize = letterhead.bodyFontSize || 11;
  const fontColor = letterhead.bodyFontColor || '#1f2937';
  const lineHeight = letterhead.bodyLineHeight || 1.6;

  // Format content text: convert newlines to paragraphs
  const paragraphs = content ? content.split('\n\n') : [];

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '16px 0',
        backgroundColor: '#e5e7eb',
        borderRadius: '8px',
        overflowX: 'auto',
      }}
    >
      <div
        id={id}
        style={{
          width: `${widthPx}px`,
          minHeight: `${minHeightPx}px`,
          backgroundColor: '#ffffff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          paddingTop: `${marginTop}mm`,
          paddingBottom: `${marginBottom}mm`,
          paddingLeft: `${marginLeft}mm`,
          paddingRight: `${marginRight}mm`,
          boxSizing: 'border-box',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontFamily: font,
          fontSize: `${fontSize}pt`,
          color: fontColor,
          lineHeight,
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
        }}
      >
        {/* Background Watermark if uploaded */}
        {letterhead.backgroundImageUrl && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${letterhead.backgroundImageUrl})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: 'contain',
              opacity: letterhead.backgroundOpacity ?? 0.08,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Top Header Section */}
        <div>
          {letterhead.headerEnabled !== false && (
            <div style={{ marginBottom: '18px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent:
                    letterhead.logoPosition === 'center'
                      ? 'center'
                      : letterhead.logoPosition === 'right'
                      ? 'space-between'
                      : 'flex-start',
                  gap: '20px',
                  flexDirection:
                    letterhead.logoPosition === 'right'
                      ? 'row-reverse'
                      : letterhead.logoPosition === 'center'
                      ? 'column'
                      : 'row',
                }}
              >
                {/* Logo */}
                {(letterhead.logoEnabled ?? true) && (company.logoUrl || letterhead.logoUrl) && (
                  <img
                    src={letterhead.logoUrl || company.logoUrl}
                    alt="Company Logo"
                    style={{
                      width: `${letterhead.logoWidth || 140}px`,
                      maxHeight: `${letterhead.logoHeight || 60}px`,
                      objectFit: 'contain',
                    }}
                  />
                )}

                {/* Company Name & Address */}
                <div
                  style={{
                    textAlign: letterhead.companyNameAlignment || 'left',
                    flex: 1,
                  }}
                >
                  {(letterhead.companyNameEnabled ?? true) && (
                    <div
                      style={{
                        fontSize: `${letterhead.companyNameFontSize || 18}pt`,
                        fontWeight: letterhead.companyNameFontWeight || 'bold',
                        color: letterhead.companyNameFontColor || '#111827',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {company.tradeName || company.legalName}
                    </div>
                  )}

                  {(letterhead.addressEnabled ?? true) && (
                    <div
                      style={{
                        fontSize: `${letterhead.addressFontSize || 9}pt`,
                        color: letterhead.addressFontColor || '#4b5563',
                        marginTop: '3px',
                      }}
                    >
                      {company.registeredAddress}
                      {company.city ? `, ${company.city}` : ''}
                      {company.state ? `, ${company.state}` : ''}
                      {company.postalCode ? ` - ${company.postalCode}` : ''}
                    </div>
                  )}

                  {(letterhead.contactEnabled ?? true) && (
                    <div
                      style={{
                        fontSize: `${letterhead.contactFontSize || 8.5}pt`,
                        color: letterhead.contactFontColor || '#6b7280',
                        marginTop: '2px',
                      }}
                    >
                      {[
                        company.contactNumber && `Tel: ${company.contactNumber}`,
                        company.officialEmail && `Email: ${company.officialEmail}`,
                        company.website && `Web: ${company.website}`,
                      ]
                        .filter(Boolean)
                        .join('  |  ')}
                    </div>
                  )}

                  {(letterhead.registrationEnabled ?? true) && company.registrationNumber && (
                    <div style={{ fontSize: '8pt', color: '#9ca3af', marginTop: '1px' }}>
                      Reg No / CIN: {company.registrationNumber}
                      {company.taxId ? `  |  Tax/GST: ${company.taxId}` : ''}
                    </div>
                  )}
                </div>
              </div>

              {/* Separator Line */}
              {(letterhead.separatorEnabled ?? true) && (
                <div
                  style={{
                    borderBottom: `${letterhead.separatorWidth || 2}px ${
                      letterhead.separatorStyle || 'solid'
                    } ${letterhead.separatorColor || '#1e3a8a'}`,
                    marginTop: '14px',
                  }}
                />
              )}
            </div>
          )}

          {/* Reference Number & Date Line */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '16px',
              fontSize: '10pt',
              fontWeight: 500,
            }}
          >
            <div>
              {referenceNumber && <span>Ref No: {referenceNumber}</span>}
            </div>
            <div>
              Date: {letterDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
          </div>

          {/* Letter Title if specified */}
          {title && (
            <div
              style={{
                textAlign: 'center',
                margin: '16px 0 20px 0',
                fontSize: '13pt',
                fontWeight: 700,
                textDecoration: 'underline',
                textTransform: 'uppercase',
                color: '#111827',
              }}
            >
              {title}
            </div>
          )}

          {/* Body Content */}
          <div style={{ minHeight: '380px' }}>
            {paragraphs.map((p, index) => {
              const trimmed = p.trim();
              if (!trimmed) return null;

              // Check if bullet point
              if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
                return (
                  <div key={index} style={{ marginBottom: '8px', paddingLeft: '16px' }}>
                    {trimmed}
                  </div>
                );
              }

              return (
                <p key={index} style={{ marginBottom: '14px', textAlign: 'justify', whiteSpace: 'pre-wrap' }}>
                  {trimmed}
                </p>
              );
            })}
          </div>

          {/* Signature Block */}
          <SignatureBlock
            companyName={company.legalName || company.tradeName || 'Empowered Services LLP'}
            signatoryName={company.authorizedSignatoryName}
            signatoryDesignation={company.authorizedSignatoryDesignation}
            sealImageUrl={company.sealImageUrl}
            sealMode={letterhead.sealMode || 'full_name'}
            employeeName={employeeName}
            letterDate={letterDate}
          />
        </div>

        {/* Footer Section */}
        {letterhead.footerEnabled !== false && (
          <div
            style={{
              marginTop: '28px',
              paddingTop: '10px',
              borderTop:
                letterhead.footerBorderTop !== false
                  ? `1px solid ${letterhead.footerBorderColor || '#d1d5db'}`
                  : 'none',
              fontSize: `${letterhead.footerFontSize || 8.5}pt`,
              color: letterhead.footerFontColor || '#6b7280',
              textAlign: letterhead.footerAlignment || 'center',
            }}
          >
            <div>
              {letterhead.confidentialityText ||
                company.confidentialityNotice ||
                'CONFIDENTIAL – This document is intended solely for the use of the named individual.'}
            </div>
            {letterhead.pageNumberEnabled !== false && (
              <div style={{ marginTop: '4px', fontSize: '8pt', color: '#9ca3af' }}>
                Page 1 of 1
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

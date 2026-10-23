// ============================================================
// Signature Block Component – Full Company Name & Custom Seal
// ============================================================
import React from 'react';
import { Typography, Row, Col } from 'antd';

const { Text, Paragraph } = Typography;

interface SignatureBlockProps {
  companyName: string;
  signatoryName?: string;
  signatoryDesignation?: string;
  signatureImageUrl?: string;
  sealImageUrl?: string;
  showSeal?: boolean;
  sealMode?: 'full_name' | 'line' | 'none';
  hrName?: string;
  hrDesignation?: string;
  showAcknowledgement?: boolean;
  employeeName?: string;
  letterDate?: string;
}

export const SignatureBlock: React.FC<SignatureBlockProps> = ({
  companyName = 'Empowered Services LLP',
  signatoryName = 'Authorized Signatory',
  signatoryDesignation = 'Human Resources',
  signatureImageUrl,
  sealImageUrl,
  showSeal = true,
  sealMode = 'full_name',
  showAcknowledgement = true,
  employeeName = '_______________________',
  letterDate,
}) => {
  const isSealVisible = showSeal && sealMode !== 'none';

  return (
    <div style={{ marginTop: '32px', pageBreakInside: 'avoid' }}>
      <Paragraph style={{ marginBottom: '12px', fontWeight: 500 }}>
        For and on behalf of <strong>{companyName}</strong>
      </Paragraph>

      <Row gutter={24} align="bottom" style={{ marginBottom: '24px' }}>
        <Col span={14}>
          <div style={{ minHeight: '60px', display: 'flex', alignItems: 'center' }}>
            {signatureImageUrl ? (
              <img
                src={signatureImageUrl}
                alt="Signature"
                style={{ maxHeight: '55px', maxWidth: '180px', objectFit: 'contain' }}
              />
            ) : (
              <div
                style={{
                  borderBottom: '1px solid #333',
                  width: '200px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'flex-end',
                }}
              />
            )}
          </div>
          <Text strong style={{ display: 'block', fontSize: '14px', marginTop: '4px' }}>
            {signatoryName}
          </Text>
          <Text type="secondary" style={{ display: 'block', fontSize: '13px' }}>
            {signatoryDesignation}
          </Text>
        </Col>

        {isSealVisible && (
          <Col span={10} style={{ textAlign: 'center' }}>
            {sealMode === 'line' ? (
              <div style={{ textAlign: 'left', paddingBottom: '8px' }}>
                <Text style={{ fontSize: '12px', color: '#555' }}>
                  Company Seal: ___________________________
                </Text>
              </div>
            ) : (
              <div
                style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  border: '2px dashed #1677ff',
                  display: 'inline-flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: '#1677ff',
                  padding: '8px',
                  backgroundColor: 'rgba(22, 119, 255, 0.03)',
                  boxSizing: 'border-box',
                }}
              >
                {sealImageUrl ? (
                  <img
                    src={sealImageUrl}
                    alt="Company Seal"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '9.5px',
                        textAlign: 'center',
                        lineHeight: 1.25,
                        wordBreak: 'normal',
                        display: 'block',
                        padding: '0 4px',
                      }}
                    >
                      {companyName.toUpperCase()}
                    </span>
                    <span
                      style={{
                        fontSize: '7.5px',
                        letterSpacing: '0.8px',
                        marginTop: '4px',
                        opacity: 0.85,
                      }}
                    >
                      OFFICIAL SEAL
                    </span>
                  </>
                )}
              </div>
            )}
          </Col>
        )}
      </Row>

      {showAcknowledgement && (
        <div
          style={{
            marginTop: '28px',
            paddingTop: '16px',
            borderTop: '1px dashed #bbb',
            pageBreakInside: 'avoid',
          }}
        >
          <Text strong style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Employee Receipt Acknowledgement
          </Text>
          <Paragraph style={{ fontSize: '12px', color: '#555', marginTop: '6px', marginBottom: '16px' }}>
            I, <strong>{employeeName}</strong>, hereby acknowledge receipt of this official letter
            {letterDate ? ` dated ${letterDate}` : ''}.
          </Paragraph>
          <Row gutter={24}>
            <Col span={12}>
              <div style={{ borderBottom: '1px solid #777', height: '24px', width: '90%' }}></div>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                Employee Signature
              </Text>
            </Col>
            <Col span={12}>
              <div style={{ borderBottom: '1px solid #777', height: '24px', width: '60%' }}></div>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                Date
              </Text>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

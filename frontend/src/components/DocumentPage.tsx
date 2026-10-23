// ============================================================
// Document Page Component – Paper-like container
// ============================================================
import React from 'react';

interface DocumentPageProps {
  pageSize?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  scale?: number;
  children: React.ReactNode;
  id?: string;
}

export const DocumentPage: React.FC<DocumentPageProps> = ({
  pageSize = 'A4',
  orientation = 'portrait',
  marginTop = 20,
  marginBottom = 20,
  marginLeft = 20,
  marginRight = 20,
  scale = 1,
  children,
  id,
}) => {
  // A4 dimensions at 96 DPI: 794px x 1123px
  // Letter dimensions at 96 DPI: 816px x 1056px
  const isLetter = pageSize === 'Letter';
  const isLandscape = orientation === 'landscape';

  const baseWidth = isLetter ? (isLandscape ? 1056 : 816) : isLandscape ? 1123 : 794;
  const baseHeight = isLetter ? (isLandscape ? 816 : 1056) : isLandscape ? 794 : 1123;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '20px 0',
        overflowX: 'auto',
      }}
    >
      <div
        id={id}
        className="document-paper"
        style={{
          width: `${baseWidth}px`,
          minHeight: `${baseHeight}px`,
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
          paddingTop: `${marginTop}mm`,
          paddingBottom: `${marginBottom}mm`,
          paddingLeft: `${marginLeft}mm`,
          paddingRight: `${marginRight}mm`,
          boxSizing: 'border-box',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
          fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          color: '#222',
        }}
      >
        {children}
      </div>
    </div>
  );
};

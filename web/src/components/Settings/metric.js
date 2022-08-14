import React from 'react';

const Metric = ({ count = 0, header }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '1rem',
        gap: '1rem',
        isolation: 'isolate',
        maxWidth: '180px',
        width: '100%',
        height: '120px',
        background: '#fff',
        border: '1px solid #eaecf0',
        boxShadow: '0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)',
        borderRadius: '8px',
      }}
    >
      <div
        style={{
          height: '24px',
          fontWeight: '500',
          fontSize: '16px',
          lineHeight: '24px',
          color: '#101828',
          flex: 'none',
          order: 1,
          flexGrow: 1,
        }}
      >
        {header}
      </div>
      <div
        style={{
          height: '44px',
          fontWeight: '600',
          fontSize: '36px',
          lineHeight: '44px',
          letterSpacing: '-0.02em',
          color: '#101828',
          flex: 'none',
          order: 0,
          alignSelf: 'stretch',
          flexGrow: 0,
        }}
      >
        {count ? count : '--'}
      </div>
    </div>
  );
};

export default Metric;

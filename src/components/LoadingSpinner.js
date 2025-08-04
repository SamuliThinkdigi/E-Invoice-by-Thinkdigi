import React from 'react';

const LoadingSpinner = ({ size = 'medium', color = '#3498db', text = 'Loading...' }) => {
  const sizes = {
    small: 20,
    medium: 40,
    large: 60
  };

  const spinnerSize = sizes[size];

  const spinnerStyle = {
    width: spinnerSize,
    height: spinnerSize,
    border: `3px solid #f3f3f3`,
    borderTop: `3px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto'
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    gap: '10px'
  };

  const textStyle = {
    color: '#666',
    fontSize: '14px',
    fontWeight: '500'
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={containerStyle}>
        <div style={spinnerStyle}></div>
        {text && <div style={textStyle}>{text}</div>}
      </div>
    </>
  );
};

export const FullPageLoader = ({ text = 'Loading...' }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  }}>
    <LoadingSpinner size="large" text={text} />
  </div>
);

export const InlineLoader = ({ text = 'Loading...' }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    gap: '10px'
  }}>
    <LoadingSpinner size="small" text={text} />
  </div>
);

export default LoadingSpinner;
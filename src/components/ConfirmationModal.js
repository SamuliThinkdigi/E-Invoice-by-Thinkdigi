import React, { useEffect } from 'react';

const ConfirmationModal = ({ 
  isOpen, 
  title = 'Confirm Action', 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  onConfirm, 
  onCancel,
  type = 'danger' // danger, warning, info
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    const styles = {
      danger: {
        iconColor: '#ef4444',
        confirmButtonColor: '#ef4444',
        confirmButtonHover: '#dc2626'
      },
      warning: {
        iconColor: '#f59e0b',
        confirmButtonColor: '#f59e0b',
        confirmButtonHover: '#d97706'
      },
      info: {
        iconColor: '#3b82f6',
        confirmButtonColor: '#3b82f6',
        confirmButtonHover: '#2563eb'
      }
    };
    return styles[type] || styles.danger;
  };

  const typeStyles = getTypeStyles();

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };

  const modalStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    animation: 'modalSlideIn 0.3s ease-out'
  };

  const iconStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: `${typeStyles.iconColor}20`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    fontSize: '24px',
    color: typeStyles.iconColor
  };

  const titleStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px',
    textAlign: 'center'
  };

  const messageStyle = {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.5',
    marginBottom: '24px',
    textAlign: 'center'
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  };

  const cancelButtonStyle = {
    padding: '8px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#374151',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  const confirmButtonStyle = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: typeStyles.confirmButtonColor,
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return '⚠️';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❓';
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: translateY(-10px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>
      <div style={overlayStyle} onClick={onCancel}>
        <div style={modalStyle} onClick={e => e.stopPropagation()}>
          <div style={iconStyle}>
            {getIcon()}
          </div>
          <h3 style={titleStyle}>{title}</h3>
          <p style={messageStyle}>{message}</p>
          <div style={buttonContainerStyle}>
            <button
              style={cancelButtonStyle}
              onClick={onCancel}
              onMouseEnter={e => e.target.style.backgroundColor = '#f9fafb'}
              onMouseLeave={e => e.target.style.backgroundColor = 'white'}
            >
              {cancelText}
            </button>
            <button
              style={confirmButtonStyle}
              onClick={onConfirm}
              onMouseEnter={e => e.target.style.backgroundColor = typeStyles.confirmButtonHover}
              onMouseLeave={e => e.target.style.backgroundColor = typeStyles.confirmButtonColor}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmationModal;
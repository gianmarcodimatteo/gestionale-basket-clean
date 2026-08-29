import React from 'react';
import { useToast } from '../context/ToastContext';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

export function Toast() {
  const { toasts, removeToast } = useToast();

  const getStyles = (type) => {
    const styles = {
      success: {
        bg: 'rgba(127, 255, 0, 0.1)',
        border: '1px solid #7FFF00',
        text: '#7FFF00',
        icon: <CheckCircle size={20} />,
      },
      error: {
        bg: 'rgba(255, 56, 96, 0.1)',
        border: '1px solid #FF5860',
        text: '#FF5860',
        icon: <AlertCircle size={20} />,
      },
      info: {
        bg: 'rgba(0, 217, 255, 0.1)',
        border: '1px solid #00D9FF',
        text: '#00D9FF',
        icon: <Info size={20} />,
      },
    };
    return styles[type] || styles.info;
  };

  return (
    <div style={{
      position: 'fixed',
      top: '1.5rem',
      right: '1.5rem',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      maxWidth: '400px',
    }}>
      {toasts.map(toast => {
        const style = getStyles(toast.type);
        return (
          <div
            key={toast.id}
            style={{
              background: style.bg,
              border: style.border,
              borderRadius: '0.5rem',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: style.text,
              animation: 'slideIn 300ms ease-out',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}
          >
            {style.icon}
            <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: '500' }}>
              {toast.message}
            </span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: style.text,
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>
        );
      })}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

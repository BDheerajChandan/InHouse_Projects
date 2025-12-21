// components/AuthModal.jsx
import React, { useState, useEffect } from 'react';
import { XCircle, CheckCircle, Lock, AlertTriangle } from 'lucide-react';
// import '../assets/poll_system.css';
// import './poll_system.css';

const AuthModal = ({ isOpen, onClose, onConfirm, title = "Operation under admin control" }) => {
  const [authKey, setAuthKey] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setAuthKey('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsValidating(true);
    
    // Get admin key from environment variable
    const adminKey = import.meta.env.VITE_ADMIN_KEY;
    
    if (!adminKey) {
      setError('Admin key not configured. Please check .env file.');
      setIsValidating(false);
      return;
    }

    if (authKey.trim() === '') {
      setError('Please enter authentication key.');
      setIsValidating(false);
      return;
    }

    if (authKey === adminKey) {
      setIsValidating(false);
      onConfirm(); // Proceed with delete
      onClose(); // Close modal
    } else {
      setError('Invalid authentication key. Retry...');
      setAuthKey(''); // Clear input
      setIsValidating(false);
    }
  };

  const handleCancel = () => {
    setAuthKey('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Lock style={{ width: '24px', height: '24px', color: '#dc2626' }} />
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
              {title}
            </h2>
          </div>
          <button 
            onClick={handleCancel}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <XCircle style={{ width: '24px', height: '24px', color: '#6b7280' }} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '12px',
            background: '#fef3c7',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <AlertTriangle style={{ width: '20px', height: '20px', color: '#d97706', flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400e' }}>
              This action requires administrator authentication and cannot be undone.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label 
                htmlFor="auth-key"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}
              >
                Authentication Key
              </label>
              <input
                id="auth-key"
                type="password"
                value={authKey}
                onChange={(e) => {
                  setAuthKey(e.target.value);
                  setError(''); // Clear error on typing
                }}
                placeholder="Enter admin key"
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px',
                  border: error ? '2px solid #ef4444' : '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => {
                  if (!error) {
                    e.target.style.borderColor = '#4f46e5';
                  }
                }}
                onBlur={(e) => {
                  if (!error) {
                    e.target.style.borderColor = '#d1d5db';
                  }
                }}
              />
              
              {error && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  marginTop: '8px',
                  color: '#dc2626',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  <XCircle style={{ width: '16px', height: '16px' }} />
                  {error}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end',
              marginTop: '24px'
            }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#e5e7eb'}
                onMouseLeave={(e) => e.target.style.background = '#f3f4f6'}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isValidating}
                style={{
                  padding: '10px 20px',
                  background: isValidating ? '#9ca3af' : '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: isValidating ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!isValidating) e.target.style.background = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  if (!isValidating) e.target.style.background = '#dc2626';
                }}
              >
                {isValidating ? (
                  <>
                    <div style={{ 
                      width: '16px', 
                      height: '16px', 
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    Validating...
                  </>
                ) : (
                  <>
                    <XCircle style={{ width: '16px', height: '16px' }} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* CSS for modal */}
        <style>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 20px;
            animation: fadeIn 0.2s ease-out;
          }

          .modal-content {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
                        0 10px 10px -5px rgba(0, 0, 0, 0.04);
            max-width: 500px;
            width: 100%;
            animation: slideUp 0.3s ease-out;
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px 24px 16px 24px;
            border-bottom: 1px solid #e5e7eb;
          }

          .modal-body {
            padding: 24px;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default AuthModal;


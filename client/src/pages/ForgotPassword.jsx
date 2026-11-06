import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { authAPI } from '../services/api.js';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email address');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await authAPI.forgotPassword(email);
      if (res.data.success) {
        setSuccess(true);
        if (res.data.resetToken) {
          setResetToken(res.data.resetToken);
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error processing request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', minHeight: '100%', justifyContent: 'center' }}>
      
      <button
        onClick={() => navigate('/login')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-text)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '20px',
        }}
      >
        <ArrowLeft size={18} /> Back to Sign In
      </button>

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text)' }}>
          Reset Password
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
          Enter your registered email to receive a password reset token
        </p>
      </div>

      {errorMsg && (
        <div style={{
          background: 'var(--color-danger-light)',
          color: 'var(--color-danger)',
          padding: '10px 14px',
          borderRadius: '12px',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
        }}>
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {success ? (
        <div className="wellness-card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: '#DCFCE7',
            color: '#15803D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
          }}>
            <CheckCircle2 size={30} />
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>
            Reset Instructions Dispatched
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
            We have generated a secure password reset token for your account.
          </p>

          {resetToken && (
            <div style={{
              background: '#F8F9F5',
              padding: '12px',
              borderRadius: '12px',
              border: '1px dashed var(--color-primary)',
              marginBottom: '16px',
              wordBreak: 'break-all',
              fontSize: '11px',
            }}>
              <span style={{ fontWeight: 700, color: 'var(--color-primary-dark)', display: 'block', marginBottom: '4px' }}>
                DEMO RESET TOKEN:
              </span>
              <code>{resetToken}</code>
            </div>
          )}

          <button
            onClick={() => navigate(`/reset-password?token=${resetToken}`)}
            className="btn-primary"
          >
            Proceed to Set New Password
          </button>
        </div>
      ) : (
        <div className="wellness-card" style={{ padding: '22px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label">Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ marginTop: '8px' }}
            >
              {loading ? 'Sending...' : 'Request Password Reset'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { authAPI } from '../services/api.js';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token || !newPassword) {
      setErrorMsg('Please provide both the reset token and your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await authAPI.resetPassword({
        token,
        newPassword,
      });

      if (res.data.success) {
        setSuccess(true);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Password reset failed or token expired.');
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
          Create New Password
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
          Enter the reset token and choose a secure new password
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
        <div className="wellness-card" style={{ padding: '24px', textAlign: 'center' }}>
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

          <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '6px' }}>
            Password Reset Complete
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '18px' }}>
            Your password has been successfully updated. You may now log in to your wellness journey.
          </p>

          <button onClick={() => navigate('/login')} className="btn-primary">
            Sign In Now
          </button>
        </div>
      ) : (
        <div className="wellness-card" style={{ padding: '22px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label">Reset Token</label>
              <input
                type="text"
                placeholder="Paste reset token here"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label">New Password</label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label">Confirm New Password</label>
              <input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}

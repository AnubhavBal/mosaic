import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (!privacyConsent) {
      setErrorMsg('You must agree to the privacy terms to continue.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const res = await register({
      name,
      email,
      phone,
      password,
      privacyConsent,
    });

    setLoading(false);

    if (res?.success) {
      navigate('/');
    } else {
      setErrorMsg(res?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', minHeight: '100%', justifyContent: 'center' }}>
      
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text)' }}>
          Start Your Journey
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
          Create your private wellness profile
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
          marginBottom: '14px',
        }}>
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Registration Card */}
      <div className="wellness-card" style={{ padding: '20px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div className="input-group" style={{ margin: 0 }}>
            <label className="input-label">Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Aanya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="input-group" style={{ margin: 0 }}>
            <label className="input-label">Email Address *</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="input-group" style={{ margin: 0 }}>
            <label className="input-label">Phone Number (Optional)</label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="input-group" style={{ margin: 0 }}>
            <label className="input-label">Password *</label>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="input-group" style={{ margin: 0 }}>
            <label className="input-label">Confirm Password *</label>
            <input
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {/* Privacy Consent Checkbox */}
          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            lineHeight: 1.4,
            marginTop: '4px',
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={privacyConsent}
              onChange={(e) => setPrivacyConsent(e.target.checked)}
              style={{ marginTop: '2px', accentColor: 'var(--color-primary)' }}
            />
            <span>
              I accept the privacy policy. I understand my journal entries & progress photos are private to my account.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ marginTop: '8px' }}
          >
            {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={16} />
          </button>

        </form>
      </div>

      {/* Login Link */}
      <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
          Sign In
        </Link>
      </div>

    </div>
  );
}

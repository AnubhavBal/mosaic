import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Bell,
  Download,
  Trash2,
  LogOut,
  Shield,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { userAPI } from '../services/api.js';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, refreshUser, isAdmin } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dailyReminders, setDailyReminders] = useState(true);
  const [weeklyReflections, setWeeklyReflections] = useState(true);
  const [milestoneAlerts, setMilestoneAlerts] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    userAPI.getProfile()
      .then((res) => {
        if (res.data.success) {
          const p = res.data.profile;
          setProfileData(p);
          setName(p.name || '');
          setPhone(p.phone || '');
          if (p.notificationPreferences) {
            setDailyReminders(p.notificationPreferences.dailyReminders ?? true);
            setWeeklyReflections(p.notificationPreferences.weeklyReflections ?? true);
            setMilestoneAlerts(p.notificationPreferences.milestoneAlerts ?? true);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedbackMsg('');

    try {
      const res = await userAPI.updateProfile({
        name,
        phone,
        notificationPreferences: {
          dailyReminders,
          weeklyReflections,
          milestoneAlerts,
        },
      });

      if (res.data.success) {
        setFeedbackMsg('Profile preferences updated successfully.');
        refreshUser();
      }
    } catch (err) {
      setFeedbackMsg('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await userAPI.exportData();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `mosaic_wellness_export_${user?.id || 'data'}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download data export.');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await userAPI.deleteAccount();
      if (res.data.success) {
        logout();
        navigate('/login');
      }
    } catch (err) {
      alert('Failed to delete account: ' + (err.response?.data?.message || err.message));
      setDeleting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '16px 16px 28px 16px' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text)' }}>
          Profile & Privacy
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
          Your account details, security and data preferences
        </p>
      </div>

      {feedbackMsg && (
        <div style={{
          background: '#DCFCE7',
          color: '#15803D',
          padding: '10px 14px',
          borderRadius: '12px',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '14px',
        }}>
          <CheckCircle2 size={16} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Admin Quick Link if user is admin */}
      {isAdmin && (
        <div 
          onClick={() => navigate('/admin')}
          className="wellness-card wellness-card-interactive"
          style={{
            background: 'linear-gradient(135deg, #1C3325 0%, #2A4835 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LayoutDashboard size={20} color="#8CE7AA" />
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
                Admin Metrics Dashboard
              </h4>
              <span style={{ fontSize: '11px', color: '#B3C8BA' }}>
                View aggregate anonymized wellness statistics
              </span>
            </div>
          </div>
          <span className="badge" style={{ background: '#3F6B4F', color: '#FFFFFF', fontSize: '10px' }}>
            Admin Portal &rarr;
          </span>
        </div>
      )}

      {/* Customer Information Card */}
      <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div className="wellness-card">
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>
            Account Details
          </h3>

          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input
              type="email"
              value={profileData?.email || user?.email || ''}
              disabled
              className="input-field"
              style={{ background: '#F8F9F5', color: '#6B7280', cursor: 'not-allowed' }}
            />
          </div>

          <div className="input-group" style={{ margin: 0 }}>
            <label className="input-label">Phone Number (Optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91..."
              className="input-field"
            />
          </div>
        </div>

        {/* Journey Summary Stats */}
        {profileData?.stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div className="wellness-card" style={{ padding: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Total Journeys
              </span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary)', display: 'block' }}>
                {profileData.stats.totalJourneys} ({profileData.stats.activeJourneys} Active)
              </span>
            </div>

            <div className="wellness-card" style={{ padding: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Check-ins & Photos
              </span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary)', display: 'block' }}>
                {profileData.stats.totalCheckins} / {profileData.stats.totalPhotos} 📷
              </span>
            </div>
          </div>
        )}

        {/* Notification Preferences */}
        <div className="wellness-card">
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
            Notification Preferences
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '13px' }}>
              <div>
                <span style={{ fontWeight: 600, display: 'block' }}>Daily Check-in Prompts</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Gentle reminder to log your daily routine</span>
              </div>
              <input
                type="checkbox"
                checked={dailyReminders}
                onChange={(e) => setDailyReminders(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
              />
            </label>

            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '13px' }}>
              <div>
                <span style={{ fontWeight: 600, display: 'block' }}>Weekly Reflections</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Prompt every 7 days to review changes</span>
              </div>
              <input
                type="checkbox"
                checked={weeklyReflections}
                onChange={(e) => setWeeklyReflections(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
              />
            </label>

            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '13px' }}>
              <div>
                <span style={{ fontWeight: 600, display: 'block' }}>Milestone Celebrations</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Alerts for Day 7, 14, 30, 60, and 90</span>
              </div>
              <input
                type="checkbox"
                checked={milestoneAlerts}
                onChange={(e) => setMilestoneAlerts(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
              />
            </label>
          </div>
        </div>

        {/* Save button */}
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving Preferences...' : 'Save Preferences'}
        </button>

      </form>

      {/* Privacy & Data Ownership Section */}
      <div className="wellness-card" style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Shield size={18} color="var(--color-primary)" />
          <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
            Privacy & Data Ownership
          </h3>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
          Your health and skincare journal entries and photographs are strictly private to your account. We never expose your photos to other customers or third parties.
        </p>

        <button
          onClick={handleExportData}
          className="btn-secondary"
          style={{ marginBottom: '10px', fontSize: '13px' }}
        >
          <Download size={15} /> Export Personal Journey Data (JSON)
        </button>

        <button
          onClick={() => setShowDeleteModal(true)}
          style={{
            width: '100%',
            background: 'transparent',
            color: 'var(--color-danger)',
            border: '1px solid #FECACA',
            borderRadius: 'var(--radius-md)',
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Trash2 size={15} /> Request Account & Data Deletion
        </button>
      </div>

      {/* Logout Button */}
      <button
        onClick={() => {
          logout();
          navigate('/login');
        }}
        className="btn-outline"
        style={{ marginTop: '16px' }}
      >
        <LogOut size={16} /> Sign Out
      </button>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(22, 36, 28, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}>
          <div className="wellness-card animate-fade-in" style={{ width: '100%', maxWidth: '360px', padding: '20px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-danger)', marginBottom: '8px' }}>
              Delete Account & Journey Data?
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '18px' }}>
              This will permanently purge your profile, active product journeys, daily check-ins, weekly reflections, and all uploaded photographs. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                style={{
                  width: '100%',
                  background: 'var(--color-danger)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                {deleting ? 'Purging Account...' : 'Yes, Delete Everything'}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

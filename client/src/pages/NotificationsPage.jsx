import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  Trophy,
  Calendar,
  Sparkles,
  Info,
  ExternalLink
} from 'lucide-react';
import { useJourney } from '../context/JourneyContext.jsx';
import { notificationsAPI } from '../services/api.js';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { refreshNotifications } = useJourney();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [browserPermission, setBrowserPermission] = useState('default');

  const fetchNotifs = () => {
    setLoading(true);
    notificationsAPI.getNotifications()
      .then((res) => {
        if (res.data.success) {
          setNotifications(res.data.notifications);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifs();
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      refreshNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      refreshNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const requestBrowserPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return;
    }

    const permission = await Notification.requestPermission();
    setBrowserPermission(permission);
    if (permission === 'granted') {
      new Notification('Mosaic Wellness Journey', {
        body: 'Daily check-in and milestone alerts are now active!',
        icon: '🌿',
      });
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'milestone':
        return <Trophy size={18} color="#EA580C" />;
      case 'weekly_reflection':
        return <Calendar size={18} color="#2563EB" />;
      case 'daily_checkin':
      default:
        return <Sparkles size={18} color="var(--color-primary)" />;
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '16px 16px 28px 16px' }}>
      
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button
          onClick={() => navigate('/')}
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
          }}
        >
          <ArrowLeft size={18} /> Back
        </button>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text)' }}>
          Notifications & Reminders
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
          Gentle habit prompts and milestone achievements
        </p>
      </div>

      {/* Browser Notification Permission Banner */}
      {browserPermission !== 'granted' && (
        <div style={{
          background: 'linear-gradient(135deg, #F0F5EE 0%, #E3EFE0 100%)',
          border: '1px solid #C8DEC3',
          borderRadius: '14px',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} color="var(--color-primary)" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary-dark)' }}>
              Enable browser reminders
            </span>
          </div>
          <button
            onClick={requestBrowserPermission}
            className="btn-primary"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '11px', borderRadius: '8px' }}
          >
            Allow
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="wellness-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Bell size={32} color="var(--color-primary)" style={{ margin: '0 auto 10px auto', opacity: 0.6 }} />
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>
            All Caught Up!
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            You have no pending reminders or alerts right now.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.map((n) => {
            const timeAgo = new Date(n.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={n._id}
                onClick={() => handleMarkAsRead(n._id)}
                className="wellness-card"
                style={{
                  padding: '12px 14px',
                  border: n.isRead ? '1px solid var(--color-border)' : '1.5px solid #C4DFC0',
                  background: n.isRead ? '#FFFFFF' : '#F6FAF4',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: n.isRead ? '#F1F4F0' : 'var(--color-primary-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {getIconForType(n.type)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: n.isRead ? 600 : 700, color: 'var(--color-text)', margin: 0 }}>
                      {n.title}
                    </h4>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                      {timeAgo}
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '2px 0 0 0', lineHeight: 1.4 }}>
                    {n.message}
                  </p>
                </div>

                {!n.isRead && (
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    flexShrink: 0,
                    marginTop: '4px',
                  }} />
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

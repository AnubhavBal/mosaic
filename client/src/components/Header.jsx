import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Sparkles, User, ChevronDown } from 'lucide-react';
import { useJourney } from '../context/JourneyContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeJourney, journeys, setActiveJourney, unreadNotifications } = useJourney();
  const { user } = useAuth();

  return (
    <header style={{
      padding: '12px 18px 8px 18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'rgba(248, 249, 245, 0.92)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      borderBottom: '1px solid rgba(229, 235, 226, 0.6)',
    }}>
      {/* Brand & Active Product Switcher */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div 
          onClick={() => navigate('/')} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            cursor: 'pointer' 
          }}
        >
          <span style={{
            fontSize: '15px',
            fontWeight: 800,
            letterSpacing: '0.06em',
            color: '#1C3325',
            fontFamily: 'var(--font-heading)',
          }}>
            MOSAIC
          </span>
          <span style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '2px 6px',
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary-dark)',
            borderRadius: '10px',
            fontWeight: 700,
          }}>
            Journey
          </span>
        </div>

        {/* Product Switcher Tag if active journey exists */}
        {activeJourney && journeys.length > 0 && (
          <div 
            onClick={() => navigate('/journeys')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: 'var(--color-primary)',
              fontWeight: 600,
              marginTop: '2px',
              cursor: 'pointer',
              maxWidth: '220px',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
            title="Click to view or switch active journey"
          >
            <span style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {activeJourney.productId?.name}
            </span>
            {journeys.length > 1 && <ChevronDown size={12} />}
          </div>
        )}
      </div>

      {/* Right Action Icons: Notification Bell & Profile Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => navigate('/notifications')}
          style={{
            position: 'relative',
            background: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text)',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
          }}
          aria-label="Notifications"
        >
          <Bell size={18} />
          {unreadNotifications > 0 && (
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              background: '#D9383A',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 700,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #FFFFFF',
            }}>
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </button>

        <button
          onClick={() => navigate('/profile')}
          style={{
            background: 'var(--color-primary-light)',
            border: '1px solid rgba(69, 108, 83, 0.25)',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary-dark)',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
          }}
          aria-label="Profile"
        >
          {user?.name ? user.name.charAt(0).toUpperCase() : <User size={18} />}
        </button>
      </div>
    </header>
  );
}

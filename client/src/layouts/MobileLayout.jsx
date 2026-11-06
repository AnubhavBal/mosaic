import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header.jsx';
import BottomNav from '../components/BottomNav.jsx';
import { Wifi, Battery } from 'lucide-react';

export default function MobileLayout() {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState('9:41');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 30000);
    return () => clearInterval(timer);
  }, []);

  // Determine whether to show header and bottom nav (hidden on auth pages)
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <div className="desktop-viewport-container">
      {/* 430px Max Mobile Phone Frame */}
      <div className="phone-mockup-frame">
        {/* Simulated Top Status Bar for Desktop Viewport */}
        <div className="phone-top-bar">
          <span style={{ fontWeight: 600, fontSize: '13px' }}>{currentTime}</span>
          <div className="dynamic-island">
            <span className="island-camera"></span>
            <span className="island-sensor"></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Wifi size={13} strokeWidth={2.5} />
            <Battery size={15} strokeWidth={2.5} />
          </div>
        </div>

        {/* Global App Header (unless on auth page) */}
        {!isAuthPage && <Header />}

        {/* Main Scrollable Viewport */}
        <main className="phone-content-viewport">
          <Outlet />
        </main>

        {/* Fixed Mobile Bottom Navigation (unless on auth page) */}
        {!isAuthPage && <BottomNav />}
      </div>
    </div>
  );
}

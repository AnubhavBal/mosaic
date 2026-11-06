import React, { createContext, useContext, useState, useEffect } from 'react';
import { journeysAPI, notificationsAPI } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const JourneyContext = createContext();

export const JourneyProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [journeys, setJourneys] = useState([]);
  const [activeJourney, setActiveJourney] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const fetchJourneys = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await journeysAPI.getJourneys();
      if (res.data.success) {
        const list = res.data.journeys;
        setJourneys(list);

        // Auto-select first active journey or keep current selection if valid
        if (list.length > 0) {
          setActiveJourney((prev) => {
            if (prev) {
              const stillExists = list.find((j) => j._id === prev._id);
              if (stillExists) return stillExists;
            }
            const firstActive = list.find((j) => j.status === 'active');
            return firstActive || list[0];
          });
        } else {
          setActiveJourney(null);
        }
      }
    } catch (err) {
      console.error('Error fetching journeys:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationStats = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationsAPI.getNotifications();
      if (res.data.success) {
        setUnreadNotifications(res.data.unreadCount || 0);
      }
    } catch (err) {
      // Ignore background notification check errors
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchJourneys();
      fetchNotificationStats();
      // Check reminders
      notificationsAPI.checkReminders().catch(() => {});
    } else {
      setJourneys([]);
      setActiveJourney(null);
      setUnreadNotifications(0);
    }
  }, [isAuthenticated]);

  return (
    <JourneyContext.Provider
      value={{
        journeys,
        activeJourney,
        setActiveJourney,
        loading,
        unreadNotifications,
        refreshJourneys: fetchJourneys,
        refreshNotifications: fetchNotificationStats,
      }}
    >
      {children}
    </JourneyContext.Provider>
  );
};

export const useJourney = () => {
  const context = useContext(JourneyContext);
  if (!context) {
    throw new Error('useJourney must be used within a JourneyProvider');
  }
  return context;
};

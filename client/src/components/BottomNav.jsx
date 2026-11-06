import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, Plus, Images, Package } from 'lucide-react';
import { useJourney } from '../context/JourneyContext.jsx';

export default function BottomNav() {
  const { activeJourney } = useJourney();

  return (
    <nav className="bottom-nav-bar" aria-label="Bottom Navigation">
      <NavLink
        to="/"
        className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`}
        end
      >
        <Home size={20} className="nav-icon" />
        <span>Today</span>
      </NavLink>

      <NavLink
        to="/timeline"
        className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`}
      >
        <Calendar size={20} className="nav-icon" />
        <span>Timeline</span>
      </NavLink>

      {/* Center Check-in Action Button */}
      <NavLink
        to="/checkin"
        className="nav-item-btn center-action"
        title="Log Today's Check-in"
        aria-label="Submit Daily Check-in"
      >
        <Plus size={28} strokeWidth={2.5} />
      </NavLink>

      <NavLink
        to="/comparison"
        className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`}
      >
        <Images size={20} className="nav-icon" />
        <span>Photos</span>
      </NavLink>

      <NavLink
        to="/journeys"
        className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`}
      >
        <Package size={20} className="nav-icon" />
        <span>Journeys</span>
      </NavLink>
    </nav>
  );
}

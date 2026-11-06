import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  Play,
  Pause,
  CheckCircle2,
  Trash2,
  Calendar,
  Flame,
  Check,
  ChevronRight,
  Clock
} from 'lucide-react';
import { useJourney } from '../context/JourneyContext.jsx';
import { journeysAPI } from '../services/api.js';
import NewJourneyModal from './NewJourneyModal.jsx';

export default function JourneysPage() {
  const navigate = useNavigate();
  const { journeys, activeJourney, setActiveJourney, refreshJourneys } = useJourney();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const handleStatusChange = async (journeyId, newStatus, e) => {
    e.stopPropagation();
    setUpdatingId(journeyId);
    try {
      const res = await journeysAPI.updateJourney(journeyId, { status: newStatus });
      if (res.data.success) {
        refreshJourneys();
      }
    } catch (err) {
      alert('Failed to update journey: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteJourney = async (journeyId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this journey and all its check-in records?')) {
      return;
    }

    try {
      const res = await journeysAPI.deleteJourney(journeyId);
      if (res.data.success) {
        refreshJourneys();
      }
    } catch (err) {
      alert('Failed to delete journey: ' + (err.response?.data?.message || err.message));
    }
  };

  const activeList = journeys.filter((j) => j.status === 'active');
  const pastList = journeys.filter((j) => j.status !== 'active');

  return (
    <div className="animate-fade-in" style={{ padding: '16px 16px 28px 16px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text)' }}>
            My Journeys
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Track multiple wellness products simultaneously
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
          style={{ width: 'auto', padding: '8px 14px', fontSize: '13px', gap: '6px' }}
        >
          <Plus size={16} /> New Journey
        </button>
      </div>

      {/* ACTIVE JOURNEYS LIST */}
      <div style={{ marginBottom: '22px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
          Active Product Journeys ({activeList.length})
        </h3>

        {activeList.length === 0 ? (
          <div className="wellness-card" style={{ textAlign: 'center', padding: '32px 18px' }}>
            <Package size={36} color="var(--color-primary)" style={{ margin: '0 auto 10px auto' }} />
            <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>
              No Active Journeys
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
              Start tracking a new product experience today.
            </p>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ width: 'auto', margin: '0 auto' }}>
              Start First Journey
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeList.map((journey) => {
              const isCurrent = activeJourney?._id === journey._id;
              const startDateFormatted = new Date(journey.startDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={journey._id}
                  onClick={() => {
                    setActiveJourney(journey);
                    navigate('/');
                  }}
                  className="wellness-card wellness-card-interactive"
                  style={{
                    border: isCurrent ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: isCurrent ? 'linear-gradient(145deg, #FFFFFF 0%, #F5F9F3 100%)' : '#FFFFFF',
                    cursor: 'pointer',
                    padding: '14px 16px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <img
                      src={journey.productId?.image}
                      alt={journey.productId?.name}
                      style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span className="badge badge-green" style={{ fontSize: '9px', padding: '1px 6px' }}>
                          {journey.productId?.category}
                        </span>
                        {isCurrent && (
                          <span style={{ fontSize: '10px', color: 'var(--color-primary)', fontWeight: 800 }}>
                            ● ACTIVE VIEW
                          </span>
                        )}
                      </div>

                      <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {journey.productId?.name}
                      </h4>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        <span>Day <strong>{journey.daysUsing || 1}</strong> of {journey.targetDurationDays || 90}</span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#EA580C', fontWeight: 700 }}>
                          <Flame size={12} fill="#EA580C" /> {journey.currentStreak || 0}d streak
                        </span>
                      </div>
                    </div>

                    <ChevronRight size={18} color="var(--color-text-muted)" />
                  </div>

                  {/* Actions Row */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '12px',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--color-border)',
                    fontSize: '11px',
                  }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      Started {startDateFormatted}
                    </span>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={(e) => handleStatusChange(journey._id, 'paused', e)}
                        style={{
                          background: '#F1F4F0',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          color: 'var(--color-text)',
                        }}
                      >
                        Pause
                      </button>
                      <button
                        onClick={(e) => handleStatusChange(journey._id, 'completed', e)}
                        style={{
                          background: 'var(--color-primary-light)',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          color: 'var(--color-primary-dark)',
                        }}
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PAST & PAUSED JOURNEYS */}
      {pastList.length > 0 && (
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
            Past & Paused Journeys ({pastList.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pastList.map((journey) => (
              <div
                key={journey._id}
                className="wellness-card"
                style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.85 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={journey.productId?.image}
                    alt={journey.productId?.name}
                    style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div>
                    <h5 style={{ fontSize: '13px', fontWeight: 700, margin: 0 }}>
                      {journey.productId?.name}
                    </h5>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                      Status: <strong>{journey.status}</strong> &bull; {journey.daysUsing || 0} days logged
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {journey.status === 'paused' && (
                    <button
                      onClick={(e) => handleStatusChange(journey._id, 'active', e)}
                      style={{
                        background: 'var(--color-primary)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Resume
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDeleteJourney(journey._id, e)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9CA3AF',
                      padding: '4px',
                      cursor: 'pointer',
                    }}
                    title="Delete journey history"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Journey Modal */}
      <NewJourneyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onJourneyCreated={(newJourney) => {
          refreshJourneys();
          setActiveJourney(newJourney);
          navigate('/');
        }}
      />

    </div>
  );
}

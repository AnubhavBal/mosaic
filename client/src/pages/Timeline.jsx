import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Filter,
  Trash2,
  X,
  ExternalLink,
  Camera,
  CheckCircle,
  Clock,
  Sparkles,
  Smile
} from 'lucide-react';
import { useJourney } from '../context/JourneyContext.jsx';
import { checkinsAPI } from '../services/api.js';

export default function Timeline() {
  const navigate = useNavigate();
  const { activeJourney } = useJourney();

  const [filterDays, setFilterDays] = useState('30'); // '7', '30', '90', 'all'
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchTimeline = () => {
    if (!activeJourney) {
      setLoading(false);
      return;
    }

    setLoading(true);
    checkinsAPI.getCheckins({
      journeyId: activeJourney._id,
      days: filterDays,
      limit: 100,
    })
      .then((res) => {
        if (res.data.success) {
          setCheckins(res.data.checkins);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTimeline();
  }, [activeJourney, filterDays]);

  const handleDeleteCheckin = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this check-in entry?')) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await checkinsAPI.deleteCheckin(id);
      if (res.data.success) {
        setCheckins((prev) => prev.filter((c) => c._id !== id));
        if (selectedEntry?._id === id) {
          setSelectedEntry(null);
        }
      }
    } catch (err) {
      alert('Failed to delete check-in: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  const moodEmojis = {
    very_bad: { emoji: '😫', text: 'Very Bad' },
    bad: { emoji: '🙁', text: 'Bad' },
    okay: { emoji: '😐', text: 'Okay' },
    good: { emoji: '🙂', text: 'Good' },
    excellent: { emoji: '🌟', text: 'Excellent' },
  };

  return (
    <div className="animate-fade-in" style={{ padding: '16px 16px 28px 16px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '14px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text)' }}>
          Journey Timeline
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
          {activeJourney?.productId?.name || 'Your progress history'}
        </p>
      </div>

      {/* Filter Tabs: 7d, 30d, 90d, All */}
      <div style={{
        display: 'flex',
        background: '#EAEFE8',
        borderRadius: '12px',
        padding: '4px',
        gap: '4px',
        marginBottom: '18px',
      }}>
        {[
          { key: '7', label: '7 Days' },
          { key: '30', label: '30 Days' },
          { key: '90', label: '90 Days' },
          { key: 'all', label: 'All Time' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterDays(tab.key)}
            style={{
              flex: 1,
              padding: '8px 4px',
              borderRadius: '8px',
              border: 'none',
              background: filterDays === tab.key ? '#FFFFFF' : 'transparent',
              color: filterDays === tab.key ? 'var(--color-primary-dark)' : 'var(--color-text-muted)',
              fontSize: '12px',
              fontWeight: filterDays === tab.key ? 700 : 500,
              cursor: 'pointer',
              boxShadow: filterDays === tab.key ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Loading journey entries...
        </div>
      ) : checkins.length === 0 ? (
        <div className="wellness-card" style={{ textAlign: 'center', padding: '36px 20px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
          }}>
            <Calendar size={26} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>
            No Entries in this Timeframe
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            Check in daily to build your personal chronological timeline.
          </p>
          <button onClick={() => navigate('/checkin')} className="btn-primary" style={{ width: 'auto', margin: '0 auto' }}>
            Submit Today's Check-in
          </button>
        </div>
      ) : (
        /* Chronological Timeline Stream */
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Vertical Connecting Line */}
          <div style={{
            position: 'absolute',
            top: '20px',
            bottom: '20px',
            left: '20px',
            width: '2px',
            background: 'var(--color-border)',
            zIndex: 1,
          }} />

          {checkins.map((entry) => {
            const dateObj = new Date(entry.date + 'T00:00:00');
            const formattedDate = dateObj.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });

            const moodInfo = moodEmojis[entry.mood] || { emoji: '✨', text: 'Logged' };

            return (
              <div
                key={entry._id}
                onClick={() => setSelectedEntry(entry)}
                className="wellness-card wellness-card-interactive"
                style={{
                  position: 'relative',
                  zIndex: 2,
                  marginLeft: '36px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                }}
              >
                {/* Timeline node icon on the line */}
                <div style={{
                  position: 'absolute',
                  left: '-26px',
                  top: '16px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  border: '3px solid #FFFFFF',
                  boxShadow: '0 0 0 2px var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }} />

                {/* Card Header: Date & Mood */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
                    {formattedDate}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontSize: '12px',
                      background: 'var(--color-primary-light)',
                      color: 'var(--color-primary-dark)',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      <span>{moodInfo.emoji}</span>
                      <span>{moodInfo.text}</span>
                    </span>

                    <button
                      onClick={(e) => handleDeleteCheckin(entry._id, e)}
                      disabled={deletingId === entry._id}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#9CA3AF',
                        padding: '4px',
                        cursor: 'pointer',
                      }}
                      title="Delete entry"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Changes Chips */}
                {entry.changesNoticed && entry.changesNoticed.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                    {entry.changesNoticed.map((ch, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '11px',
                          background: 'var(--color-primary-light)',
                          color: 'var(--color-primary)',
                          padding: '2px 8px',
                          borderRadius: '8px',
                          fontWeight: 600,
                        }}
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                )}

                {/* Additional notes snippet */}
                {entry.additionalNotes && (
                  <p style={{
                    fontSize: '12px',
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.4,
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    "{entry.additionalNotes}"
                  </p>
                )}

                {/* Optional Attached Photograph Thumbnail */}
                {entry.photoUrl && (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img
                      src={entry.photoUrl}
                      alt="Check-in progress photo"
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '10px',
                        objectFit: 'cover',
                        border: '1px solid var(--color-border)',
                      }}
                    />
                    <div style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600 }}>
                      <Camera size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                      View Progress Photo
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* FULL ENTRY DETAILS MODAL */}
      {selectedEntry && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(22, 36, 28, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}>
          <div className="wellness-card animate-fade-in" style={{
            width: '100%',
            maxWidth: '380px',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '20px',
            position: 'relative',
          }}>
            <button
              onClick={() => setSelectedEntry(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#F1F4F0',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text)',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>

            <span className="badge badge-green" style={{ marginBottom: '8px' }}>
              Check-in Details
            </span>

            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>
              {new Date(selectedEntry.date + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', fontSize: '13px' }}>
              
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Mood:
                </span>
                <div style={{ fontWeight: 700, fontSize: '15px', marginTop: '2px' }}>
                  {moodEmojis[selectedEntry.mood]?.emoji} {moodEmojis[selectedEntry.mood]?.text}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Product Usage:
                </span>
                <div style={{ fontWeight: 600, textTransform: 'capitalize', marginTop: '2px' }}>
                  {selectedEntry.usageConsistency?.replace(/_/g, ' ')}
                </div>
              </div>

              {selectedEntry.changesNoticed?.length > 0 && (
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Changes Noticed:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                    {selectedEntry.changesNoticed.map((c, i) => (
                      <span key={i} className="badge badge-green" style={{ textTransform: 'none' }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Discomfort / Unwanted Effects:
                </span>
                <div style={{ fontWeight: 500, textTransform: 'capitalize', marginTop: '2px' }}>
                  {selectedEntry.discomfort?.replace(/_/g, ' ')}
                </div>
              </div>

              {selectedEntry.additionalNotes && (
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Personal Notes:
                  </span>
                  <p style={{ background: '#F8F9F5', padding: '10px', borderRadius: '10px', marginTop: '4px', color: 'var(--color-text)' }}>
                    {selectedEntry.additionalNotes}
                  </p>
                </div>
              )}

              {selectedEntry.photoUrl && (
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Progress Photograph:
                  </span>
                  <img
                    src={selectedEntry.photoUrl}
                    alt="Progress photograph"
                    style={{
                      width: '100%',
                      maxHeight: '260px',
                      objectFit: 'cover',
                      borderRadius: '14px',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  />
                </div>
              )}

            </div>

            <button
              onClick={() => setSelectedEntry(null)}
              className="btn-secondary"
              style={{ marginTop: '20px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Calendar, Plus, MessageSquare, TrendingUp } from 'lucide-react';
import { useJourney } from '../context/JourneyContext.jsx';
import { reflectionsAPI } from '../services/api.js';

export default function ReflectionsList() {
  const navigate = useNavigate();
  const { activeJourney } = useJourney();
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeJourney) {
      setLoading(false);
      return;
    }

    reflectionsAPI.getReflections({ journeyId: activeJourney._id })
      .then((res) => {
        if (res.data.success) {
          setReflections(res.data.reflections);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [activeJourney]);

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

        <button
          onClick={() => navigate('/reflection/new')}
          className="btn-secondary"
          style={{ padding: '6px 12px', fontSize: '12px', width: 'auto', gap: '4px' }}
        >
          <Plus size={14} /> New Reflection
        </button>
      </div>

      <div style={{ marginBottom: '18px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text)' }}>
          Weekly Reflections
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
          Historical reviews for {activeJourney?.productId?.name || 'Active Product'}
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Loading your reflections...
        </div>
      ) : reflections.length === 0 ? (
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
            <MessageSquare size={26} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>
            No Weekly Reflections Yet
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
            Every 7 days, complete a short weekly reflection to measure progress, identify positive changes, and stay focused.
          </p>
          <button onClick={() => navigate('/reflection/new')} className="btn-primary" style={{ width: 'auto', margin: '0 auto' }}>
            Start Week 1 Reflection
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {reflections.map((r) => {
            const formattedDate = new Date(r.weekStartDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div key={r._id} className="wellness-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-amber" style={{ fontSize: '11px' }}>
                      Week {r.weekNumber}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      {formattedDate}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'var(--color-primary-light)',
                    padding: '3px 8px',
                    borderRadius: '8px',
                    color: 'var(--color-primary-dark)',
                    fontWeight: 800,
                    fontSize: '13px',
                  }}>
                    <Star size={14} fill="var(--color-primary)" />
                    {r.rating}/10
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>
                      Weekly Experience:
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--color-text)', textTransform: 'capitalize' }}>
                      {r.experience.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {r.positiveChanges && (
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>
                        Positive Changes:
                      </span>
                      <p style={{ margin: '2px 0 0 0', color: 'var(--color-text)' }}>
                        {r.positiveChanges}
                      </p>
                    </div>
                  )}

                  {r.challenges && (
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>
                        Challenges:
                      </span>
                      <p style={{ margin: '2px 0 0 0', color: 'var(--color-text-muted)' }}>
                        {r.challenges}
                      </p>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', paddingTop: '8px', borderTop: '1px solid var(--color-border)', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    <span>Continuation: <strong style={{ textTransform: 'capitalize', color: 'var(--color-text)' }}>{r.continuationLikelihood.replace(/_/g, ' ')}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Package,
  Activity,
  Heart,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { adminAPI } from '../services/api.js';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats()
      .then((res) => {
        if (res.data.success) {
          setStats(res.data.stats);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const moodLabels = {
    excellent: { emoji: '🌟', label: 'Excellent' },
    good: { emoji: '🙂', label: 'Good' },
    okay: { emoji: '😐', label: 'Okay' },
    bad: { emoji: '🙁', label: 'Bad' },
    very_bad: { emoji: '😫', label: 'Very Bad' },
  };

  const discomfortLabels = {
    none: 'None Noticed',
    mild: 'Mild Discomfort',
    moderate: 'Moderate Discomfort',
    significant: 'Significant Discomfort',
    described_in_notes: 'Described In Notes',
  };

  return (
    <div className="animate-fade-in" style={{ padding: '16px 16px 28px 16px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button
          onClick={() => navigate('/profile')}
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
          <ArrowLeft size={18} /> Profile
        </button>

        <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ShieldCheck size={12} /> Admin Portal
        </span>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text)' }}>
          Anonymized Analytics
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
          Aggregated product performance & cohort health telemetry
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>
          Loading admin telemetry...
        </div>
      ) : !stats ? (
        <div className="wellness-card" style={{ textAlign: 'center', padding: '30px' }}>
          <p>Failed to load admin metrics. Verify administrator credentials.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* 1. Core KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div className="wellness-card" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Users size={16} color="var(--color-primary)" />
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  Total Customers
                </span>
              </div>
              <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text)' }}>
                {stats.totalCustomers}
              </span>
            </div>

            <div className="wellness-card" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Activity size={16} color="#2563EB" />
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  Active Journeys
                </span>
              </div>
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#2563EB' }}>
                {stats.activeJourneys} / {stats.totalJourneys}
              </span>
            </div>

            <div className="wellness-card" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <CheckCircle size={16} color="#15803D" />
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  Logged Check-ins
                </span>
              </div>
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#15803D' }}>
                {stats.totalCheckins}
              </span>
            </div>

            <div className="wellness-card" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <TrendingUp size={16} color="#D97706" />
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  Avg Experience
                </span>
              </div>
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#D97706' }}>
                {stats.avgReflectionRating} / 10
              </span>
            </div>
          </div>

          {/* 2. Aggregate Mood Trends */}
          <div className="wellness-card">
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Heart size={16} color="var(--color-primary)" />
              Aggregate Mood Distribution
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(stats.moodDistribution).map(([key, count]) => {
                const total = stats.totalCheckins || 1;
                const percentage = Math.round((count / total) * 100);
                const info = moodLabels[key] || { emoji: '●', label: key };

                return (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                      <span>{info.emoji} {info.label}</span>
                      <span style={{ fontWeight: 700 }}>{count} ({percentage}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#EAEFE8', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background: 'var(--color-primary)',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Discomfort & Tolerability Telemetry */}
          <div className="wellness-card">
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={16} color="#D97706" />
              Reported Tolerability & Discomfort
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(stats.discomfortBreakdown).map(([key, count]) => {
                const total = stats.totalCheckins || 1;
                const percentage = Math.round((count / total) * 100);

                return (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                      <span>{discomfortLabels[key] || key}</span>
                      <span style={{ fontWeight: 700 }}>{count} ({percentage}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#EAEFE8', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background: key === 'none' ? '#15803D' : '#F59E0B',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Active Journeys by Product */}
          {stats.journeysByProduct?.length > 0 && (
            <div className="wellness-card">
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Package size={16} color="var(--color-primary)" />
                Journeys By Product
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stats.journeysByProduct.map((p) => (
                  <div key={p.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', paddingBottom: '6px', borderBottom: '1px solid var(--color-border)' }}>
                    <div>
                      <span style={{ fontWeight: 700, display: 'block' }}>{p.productName}</span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{p.category}</span>
                    </div>
                    <span className="badge badge-green">
                      {p.activeJourneys} Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

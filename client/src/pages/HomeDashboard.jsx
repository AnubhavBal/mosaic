import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Trophy,
  Award,
  ChevronRight,
  Clock,
  Heart,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext.jsx';
import { useJourney } from '../context/JourneyContext.jsx';
import { checkinsAPI } from '../services/api.js';

export default function HomeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeJourney, journeys, refreshJourneys } = useJourney();

  const [weeklyDays, setWeeklyDays] = useState([]);
  const [weeklyRate, setWeeklyRate] = useState(0);
  const [todayMood, setTodayMood] = useState('');
  const [todayCheckedIn, setTodayCheckedIn] = useState(false);
  const [submittingQuickMood, setSubmittingQuickMood] = useState(false);

  // Compute Monday-Sunday of current week
  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday);

    const week = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const isToday = dateStr === today.toISOString().split('T')[0];
      const isPastOrToday = d <= today;

      week.push({
        name: dayNames[i],
        dateStr,
        dayNum: d.getDate(),
        isToday,
        isPastOrToday,
        completed: false,
      });
    }

    // Query recent check-ins for the active journey to populate calendar
    if (activeJourney) {
      checkinsAPI.getCheckins({ journeyId: activeJourney._id, limit: 30 })
        .then((res) => {
          if (res.data.success) {
            const checkins = res.data.checkins;
            const completedDates = new Set(checkins.map((c) => c.date));

            const updatedWeek = week.map((w) => ({
              ...w,
              completed: completedDates.has(w.dateStr),
            }));

            setWeeklyDays(updatedWeek);

            // Compute rate for days up to today
            const pastDaysCount = updatedWeek.filter((w) => w.isPastOrToday).length;
            const completedPastDays = updatedWeek.filter((w) => w.isPastOrToday && w.completed).length;
            const rate = pastDaysCount > 0 ? Math.round((completedPastDays / pastDaysCount) * 100) : 0;
            setWeeklyRate(rate);

            // Check if checked in today
            const todayStr = new Date().toISOString().split('T')[0];
            const hasCheckedInToday = completedDates.has(todayStr);
            setTodayCheckedIn(hasCheckedInToday);
            if (hasCheckedInToday) {
              const todayEntry = checkins.find((c) => c.date === todayStr);
              if (todayEntry) setTodayMood(todayEntry.mood);
            }
          }
        })
        .catch((err) => console.error(err));
    } else {
      setWeeklyDays(week);
    }
  }, [activeJourney]);

  // Quick mood selection handler
  const handleQuickMood = async (mood) => {
    if (!activeJourney) return;
    setTodayMood(mood);
    setSubmittingQuickMood(true);

    try {
      const formData = new FormData();
      formData.append('journeyId', activeJourney._id);
      formData.append('mood', mood);
      formData.append('usageConsistency', 'used_as_directed');
      formData.append('discomfort', 'none');
      formData.append('date', new Date().toISOString().split('T')[0]);

      const res = await checkinsAPI.submitCheckin(formData);
      if (res.data.success) {
        setTodayCheckedIn(true);
        refreshJourneys();

        // Celebration confetti
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    } catch (err) {
      console.error('Quick checkin error:', err);
    } finally {
      setSubmittingQuickMood(false);
    }
  };

  const moods = [
    { key: 'very_bad', emoji: '😫', label: 'Very bad' },
    { key: 'bad', emoji: '🙁', label: 'Bad' },
    { key: 'okay', emoji: '😐', label: 'Okay' },
    { key: 'good', emoji: '🙂', label: 'Good' },
    { key: 'excellent', emoji: '🌟', label: 'Excellent' },
  ];

  const milestones = [
    { day: 1, label: 'Day 1' },
    { day: 7, label: 'Day 7' },
    { day: 14, label: 'Day 14' },
    { day: 30, label: 'Day 30' },
    { day: 60, label: 'Day 60' },
    { day: 90, label: 'Day 90' },
  ];

  const daysUsing = activeJourney?.daysUsing || 1;

  return (
    <div className="animate-fade-in" style={{ padding: '16px 16px 24px 16px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* 1. GREETING */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            Welcome back,
          </span>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text)', marginTop: '-2px' }}>
            Hello, {user?.name || 'Customer'}
          </h1>
        </div>

        {/* Journey Streak Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
          border: '1px solid #FED7AA',
          padding: '6px 12px',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <Flame size={18} color="#EA580C" fill="#EA580C" />
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#C2410C' }}>
            {activeJourney?.currentStreak || 0} Day Streak
          </span>
        </div>
      </section>

      {/* NO ACTIVE JOURNEY STATE */}
      {(!activeJourney || journeys.length === 0) && (
        <div className="wellness-card" style={{ textAlign: 'center', padding: '28px 20px', background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F9F3 100%)' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--color-primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px auto',
            color: 'var(--color-primary)',
          }}>
            <Sparkles size={28} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
            Start Your Wellness Journey
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '18px', lineHeight: 1.5 }}>
            Pick any wellness, skincare, or haircare product you purchased to track daily progress, reflections, and visible transformation.
          </p>
          <button
            onClick={() => navigate('/journeys')}
            className="btn-primary"
          >
            Select Product Journey <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* 2. ACTIVE PRODUCT CARD */}
      {activeJourney && (
        <section className="wellness-card" style={{ padding: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <img
              src={activeJourney.productId?.image}
              alt={activeJourney.productId?.name}
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '14px',
                objectFit: 'cover',
                border: '1px solid var(--color-border)',
                flexShrink: 0,
              }}
            />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span className="badge badge-green" style={{ fontSize: '10px' }}>
                  {activeJourney.productId?.category || 'Wellness'}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                  Active Journey
                </span>
              </div>

              <h2 style={{
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--color-text)',
                lineHeight: 1.3,
                marginBottom: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {activeJourney.productId?.name}
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} color="var(--color-primary)" />
                  Day <strong>{daysUsing}</strong> of {activeJourney.targetDurationDays || 90}
                </span>
              </div>
            </div>
          </div>

          {/* Target Progress Bar */}
          <div style={{ marginTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '5px' }}>
              <span>Journey Completion</span>
              <span style={{ color: 'var(--color-primary)' }}>
                {Math.min(100, Math.round((daysUsing / (activeJourney.targetDurationDays || 90)) * 100))}%
              </span>
            </div>
            <div style={{ width: '100%', height: '7px', background: 'var(--color-border)', borderRadius: '10px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, (daysUsing / (activeJourney.targetDurationDays || 90)) * 100)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #456C53 0%, #6BA37D 100%)',
                  borderRadius: '10px',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        </section>
      )}

      {/* 4. DAILY CHECK-IN CARD */}
      {activeJourney && (
        <section className="wellness-card" style={{
          background: todayCheckedIn
            ? 'linear-gradient(145deg, #FFFFFF 0%, #F3F8F2 100%)'
            : 'linear-gradient(145deg, #FFFFFF 0%, #FAFBF8 100%)',
          border: todayCheckedIn ? '1.5px solid #C4DFC0' : '1px solid var(--color-border)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: todayCheckedIn ? '#DCFCE7' : 'var(--color-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: todayCheckedIn ? '#15803D' : 'var(--color-primary)',
              }}>
                {todayCheckedIn ? <CheckCircle2 size={18} /> : <Heart size={18} />}
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
                  {todayCheckedIn ? "Today's Check-in Completed!" : 'Daily Check-in'}
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  {todayCheckedIn ? 'Great job staying consistent today' : 'How are you feeling today?'}
                </span>
              </div>
            </div>

            {todayCheckedIn && (
              <span className="badge badge-green" style={{ fontSize: '10px' }}>
                Done ✓
              </span>
            )}
          </div>

          {/* Quick Mood Selector Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '6px',
            margin: '14px 0 16px 0',
          }}>
            {moods.map((m) => {
              const isSelected = todayMood === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => handleQuickMood(m.key)}
                  disabled={submittingQuickMood}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '10px 4px',
                    borderRadius: '14px',
                    border: isSelected
                      ? '2px solid var(--color-primary)'
                      : '1px solid var(--color-border)',
                    background: isSelected ? 'var(--color-primary-light)' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 8px rgba(69, 108, 83, 0.2)' : 'var(--shadow-sm)',
                  }}
                  title={m.label}
                >
                  <span style={{ fontSize: '22px', lineHeight: 1 }}>{m.emoji}</span>
                  <span style={{ fontSize: '10px', fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--color-primary-dark)' : 'var(--color-text-muted)' }}>
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Detailed Check-in CTA */}
          <button
            onClick={() => navigate('/checkin')}
            className={todayCheckedIn ? 'btn-secondary' : 'btn-primary'}
            style={{ fontSize: '14px', padding: '12px 16px' }}
          >
            {todayCheckedIn ? 'Edit Today\'s Check-in or Add Photo' : 'Complete Full Check-in & Photo'}
            <ArrowRight size={15} />
          </button>
        </section>
      )}

      {/* 5. WEEKLY CONSISTENCY CALENDAR */}
      {activeJourney && (
        <section className="wellness-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} color="var(--color-primary)" />
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Weekly Consistency</h3>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)' }}>
              {weeklyRate}% Consistent
            </span>
          </div>

          {/* Mon to Sun Circles */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px' }}>
            {weeklyDays.map((d, index) => {
              return (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span style={{
                    fontSize: '11px',
                    fontWeight: d.isToday ? 700 : 500,
                    color: d.isToday ? 'var(--color-primary)' : 'var(--color-text-muted)'
                  }}>
                    {d.name}
                  </span>

                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: d.completed
                      ? 'var(--color-primary)'
                      : (d.isToday ? 'var(--color-primary-light)' : '#F1F4F0'),
                    color: d.completed ? '#FFFFFF' : (d.isToday ? 'var(--color-primary-dark)' : 'var(--color-text-muted)'),
                    border: d.isToday ? '2px solid var(--color-primary)' : 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    boxShadow: d.completed ? '0 2px 6px rgba(69, 108, 83, 0.3)' : 'none',
                  }}>
                    {d.completed ? '✓' : d.dayNum}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. JOURNEY STATISTICS */}
      {activeJourney && (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          <div className="wellness-card" style={{ padding: '14px 10px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
              Check-ins
            </span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
              {activeJourney.totalCheckins || 0}
            </span>
          </div>

          <div 
            onClick={() => navigate('/reflections')}
            className="wellness-card wellness-card-interactive" 
            style={{ padding: '14px 10px', textAlign: 'center', cursor: 'pointer' }}
          >
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
              Reflections
            </span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#2563EB' }}>
              {activeJourney.reflectionsCount || 0}
            </span>
          </div>

          <div className="wellness-card" style={{ padding: '14px 10px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
              Duration
            </span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text)' }}>
              {daysUsing}d
            </span>
          </div>
        </section>
      )}

      {/* 7. PROGRESS MILESTONES */}
      {activeJourney && (
        <section className="wellness-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Trophy size={16} color="#EA580C" />
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Milestones</h3>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              Goal: 90 Days
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
            {/* Connecting Horizontal Line */}
            <div style={{
              position: 'absolute',
              top: '18px',
              left: '14px',
              right: '14px',
              height: '3px',
              background: 'var(--color-border)',
              zIndex: 1,
            }} />

            {milestones.map((m) => {
              const isUnlocked = daysUsing >= m.day;
              const isCurrent = daysUsing >= m.day && (m.day === 90 || daysUsing < [1, 7, 14, 30, 60, 90][[1, 7, 14, 30, 60, 90].indexOf(m.day) + 1]);

              return (
                <div
                  key={m.day}
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: isUnlocked
                      ? (isCurrent ? '#F59E0B' : 'var(--color-primary)')
                      : '#FFFFFF',
                    border: isUnlocked
                      ? 'none'
                      : '2px solid var(--color-border)',
                    color: isUnlocked ? '#FFFFFF' : 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    boxShadow: isUnlocked ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
                  }}>
                    {isUnlocked ? '★' : m.day}
                  </div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: isCurrent ? 800 : 600,
                    color: isCurrent ? '#B45309' : (isUnlocked ? 'var(--color-text)' : 'var(--color-text-muted)'),
                  }}>
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* WEEKLY REFLECTION BANNER CALLOUT */}
      {activeJourney && (
        <section 
          onClick={() => navigate('/reflection/new')}
          style={{
            background: 'linear-gradient(135deg, #EBF3E8 0%, #DCE9D8 100%)',
            border: '1px solid #C4DFC0',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <TrendingUp size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                Weekly Reflection
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Reflect on your habit and changes this week
              </p>
            </div>
          </div>
          <ChevronRight size={18} color="var(--color-primary)" />
        </section>
      )}

    </div>
  );
}

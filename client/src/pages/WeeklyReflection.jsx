import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, Star, Sparkles, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useJourney } from '../context/JourneyContext.jsx';
import { reflectionsAPI } from '../services/api.js';

export default function WeeklyReflection() {
  const navigate = useNavigate();
  const { activeJourney, refreshJourneys } = useJourney();

  // Form states
  const [weekNumber, setWeekNumber] = useState(1);
  const [experience, setExperience] = useState('much_better');
  const [positiveChanges, setPositiveChanges] = useState('');
  const [challenges, setChallenges] = useState('');
  const [unwantedEffects, setUnwantedEffects] = useState('');
  const [continuationLikelihood, setContinuationLikelihood] = useState('very_likely');
  const [rating, setRating] = useState(9);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);

  // Compute current week number from journey start date
  useEffect(() => {
    if (!activeJourney) return;

    const startDate = new Date(activeJourney.startDate);
    const now = new Date();
    const daysDiff = Math.max(1, Math.floor((now - startDate) / (1000 * 60 * 60 * 24)) + 1);
    const currentWeek = Math.max(1, Math.floor((daysDiff - 1) / 7) + 1);
    setWeekNumber(currentWeek);

    // Check if reflection already recorded for this week
    reflectionsAPI.getReflections({ journeyId: activeJourney._id })
      .then((res) => {
        if (res.data.success) {
          const match = res.data.reflections.find((r) => r.weekNumber === currentWeek);
          if (match) {
            setIsUpdate(true);
            setExperience(match.experience || 'much_better');
            setPositiveChanges(match.positiveChanges || '');
            setChallenges(match.challenges || '');
            setUnwantedEffects(match.unwantedEffects || '');
            setContinuationLikelihood(match.continuationLikelihood || 'very_likely');
            setRating(match.rating || 9);
          }
        }
      })
      .catch((err) => console.error(err));
  }, [activeJourney]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeJourney) {
      setErrorMsg('No active journey selected');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await reflectionsAPI.submitReflection({
        journeyId: activeJourney._id,
        weekNumber,
        weekStartDate: new Date().toISOString(),
        experience,
        positiveChanges,
        challenges,
        unwantedEffects,
        continuationLikelihood,
        rating,
      });

      if (res.data.success) {
        setSubmitted(true);
        refreshJourneys();
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit reflection.');
    } finally {
      setLoading(false);
    }
  };

  const experienceOptions = [
    { key: 'much_better', label: 'Much better' },
    { key: 'a_little_better', label: 'A little better' },
    { key: 'no_change', label: 'No noticeable change' },
    { key: 'worse', label: 'Worse' },
    { key: 'not_sure', label: 'Not sure' },
  ];

  const likelihoodOptions = [
    { key: 'very_likely', label: 'Very likely' },
    { key: 'likely', label: 'Likely' },
    { key: 'not_sure', label: 'Not sure' },
    { key: 'unlikely', label: 'Unlikely' },
  ];

  if (submitted) {
    return (
      <div className="animate-fade-in" style={{ padding: '28px 18px', textAlign: 'center' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'var(--color-primary-light)',
          color: 'var(--color-primary-dark)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '20px auto 16px auto',
        }}>
          <CheckCircle2 size={40} />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '8px' }}>
          {isUpdate ? 'Reflection Updated!' : 'Reflection Recorded!'}
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '24px' }}>
          Thank you for taking the time to reflect on Week {weekNumber}. Consistent self-reflection helps recognize subtle health and wellness transformations.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={() => navigate('/reflections')} className="btn-primary">
            View Past Reflections
          </button>
          <button onClick={() => navigate('/')} className="btn-secondary">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '16px 16px 28px 16px' }}>
      {/* Top Header */}
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
          onClick={() => navigate('/reflections')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-primary)',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <BookOpen size={15} /> Past Reviews
        </button>
      </div>

      <div style={{ marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-amber">Week {weekNumber} Review</span>
          {isUpdate && <span className="badge badge-green">Editing Previous Entry</span>}
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text)', marginTop: '4px' }}>
          Weekly Reflection
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
          {activeJourney?.productId?.name || 'Active Product'}
        </p>
      </div>

      {errorMsg && (
        <div style={{
          background: 'var(--color-danger-light)',
          color: 'var(--color-danger)',
          padding: '10px 14px',
          borderRadius: '12px',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
        }}>
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        
        {/* QUESTION 1: Experience Changed */}
        <div className="wellness-card">
          <label className="input-label" style={{ fontSize: '14px', marginBottom: '10px', display: 'block' }}>
            1. How has your experience changed this week?
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {experienceOptions.map((opt) => (
              <label
                key={opt.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: experience === opt.key ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: experience === opt.key ? 'var(--color-primary-light)' : '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: experience === opt.key ? 700 : 400,
                  color: experience === opt.key ? 'var(--color-primary-dark)' : 'var(--color-text)',
                }}
              >
                <input
                  type="radio"
                  name="experience"
                  checked={experience === opt.key}
                  onChange={() => setExperience(opt.key)}
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* QUESTION 2: Positive Changes */}
        <div className="wellness-card">
          <label className="input-label" style={{ fontSize: '14px', marginBottom: '6px', display: 'block' }}>
            2. What positive changes have you noticed?
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Skin feels more hydrated, hair shedding has decreased in the shower..."
            value={positiveChanges}
            onChange={(e) => setPositiveChanges(e.target.value)}
            className="input-field"
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* QUESTION 3: Challenges */}
        <div className="wellness-card">
          <label className="input-label" style={{ fontSize: '14px', marginBottom: '6px', display: 'block' }}>
            3. Have you faced any challenges?
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Forgetting to apply on busy days, traveling..."
            value={challenges}
            onChange={(e) => setChallenges(e.target.value)}
            className="input-field"
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* QUESTION 4: Unwanted Effects */}
        <div className="wellness-card">
          <label className="input-label" style={{ fontSize: '14px', marginBottom: '6px', display: 'block' }}>
            4. Have you experienced any unwanted effects?
          </label>
          <textarea
            rows={2}
            placeholder="e.g. None noticed, or any mild sensitivity..."
            value={unwantedEffects}
            onChange={(e) => setUnwantedEffects(e.target.value)}
            className="input-field"
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* QUESTION 5: Continuation Likelihood */}
        <div className="wellness-card">
          <label className="input-label" style={{ fontSize: '14px', marginBottom: '10px', display: 'block' }}>
            5. How likely are you to continue using this product?
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {likelihoodOptions.map((opt) => (
              <label
                key={opt.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: continuationLikelihood === opt.key ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: continuationLikelihood === opt.key ? 'var(--color-primary-light)' : '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: continuationLikelihood === opt.key ? 700 : 500,
                  color: continuationLikelihood === opt.key ? 'var(--color-primary-dark)' : 'var(--color-text)',
                }}
              >
                <input
                  type="radio"
                  name="continuationLikelihood"
                  checked={continuationLikelihood === opt.key}
                  onChange={() => setContinuationLikelihood(opt.key)}
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* QUESTION 6: 1 to 10 Rating */}
        <div className="wellness-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="input-label" style={{ fontSize: '14px', margin: 0 }}>
              6. Rate your overall experience (1 to 10)
            </label>
            <span style={{
              fontSize: '18px',
              fontWeight: 800,
              color: 'var(--color-primary)',
              background: 'var(--color-primary-light)',
              padding: '2px 10px',
              borderRadius: '12px',
            }}>
              {rating} / 10
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px', margin: '12px 0 6px 0' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                type="button"
                key={num}
                onClick={() => setRating(num)}
                style={{
                  flex: 1,
                  height: '38px',
                  borderRadius: '10px',
                  border: rating === num ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: rating === num ? 'var(--color-primary)' : '#FFFFFF',
                  color: rating === num ? '#FFFFFF' : 'var(--color-text)',
                  fontWeight: rating === num ? 800 : 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {num}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-text-muted)' }}>
            <span>1 - Needs improvement</span>
            <span>10 - Outstanding</span>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading || !activeJourney}
          className="btn-primary"
        >
          {loading ? 'Submitting Reflection...' : (isUpdate ? 'Update Reflection' : 'Save Weekly Reflection')}
        </button>

      </form>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  Trash2,
  CheckCircle,
  AlertCircle,
  UploadCloud,
  Sparkles,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useJourney } from '../context/JourneyContext.jsx';
import { checkinsAPI } from '../services/api.js';

export default function DailyCheckin() {
  const navigate = useNavigate();
  const { activeJourney, refreshJourneys } = useJourney();
  const fileInputRef = useRef(null);

  // Form states
  const [mood, setMood] = useState('good');
  const [usageConsistency, setUsageConsistency] = useState('used_as_directed');
  const [changesNoticed, setChangesNoticed] = useState([]);
  const [discomfort, setDiscomfort] = useState('none');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  // Status & modal states
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Check if today already has a check-in
  useEffect(() => {
    if (!activeJourney) return;

    const todayStr = new Date().toISOString().split('T')[0];
    checkinsAPI.getCheckins({ journeyId: activeJourney._id, limit: 10 })
      .then((res) => {
        if (res.data.success) {
          const todayEntry = res.data.checkins.find((c) => c.date === todayStr);
          if (todayEntry) {
            setIsEdit(true);
            setMood(todayEntry.mood || 'good');
            setUsageConsistency(todayEntry.usageConsistency || 'used_as_directed');
            setChangesNoticed(todayEntry.changesNoticed || []);
            setDiscomfort(todayEntry.discomfort || 'none');
            setAdditionalNotes(todayEntry.additionalNotes || '');
            if (todayEntry.photoUrl) {
              setPhotoPreview(todayEntry.photoUrl);
            }
          }
        }
      })
      .catch((err) => console.error(err));
  }, [activeJourney]);

  // Handle photo file selection
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size <= 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 5 MB. Please choose a smaller file.');
      return;
    }

    setErrorMsg('');
    setPhotoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleChange = (item) => {
    if (item === 'No noticeable changes') {
      setChangesNoticed(['No noticeable changes']);
      return;
    }
    setChangesNoticed((prev) => {
      const filtered = prev.filter((i) => i !== 'No noticeable changes');
      if (filtered.includes(item)) {
        return filtered.filter((i) => i !== item);
      } else {
        return [...filtered, item];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeJourney) {
      setErrorMsg('No active journey selected');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('journeyId', activeJourney._id);
      formData.append('date', new Date().toISOString().split('T')[0]);
      formData.append('mood', mood);
      formData.append('usageConsistency', usageConsistency);
      formData.append('changesNoticed', JSON.stringify(changesNoticed));
      formData.append('discomfort', discomfort);
      formData.append('additionalNotes', additionalNotes);

      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const res = await checkinsAPI.submitCheckin(formData);
      if (res.data.success) {
        setSubmissionResult(res.data);
        setSubmittedSuccess(true);
        refreshJourneys();

        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error('Checkin submit error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit check-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const moodOptions = [
    { key: 'very_bad', emoji: '😫', title: 'Very bad' },
    { key: 'bad', emoji: '🙁', title: 'Bad' },
    { key: 'okay', emoji: '😐', title: 'Okay' },
    { key: 'good', emoji: '🙂', title: 'Good' },
    { key: 'excellent', emoji: '🌟', title: 'Excellent' },
  ];

  const consistencyOptions = [
    { key: 'used_as_directed', label: 'Used as directed' },
    { key: 'used_most_days', label: 'Used most days' },
    { key: 'used_occasionally', label: 'Used occasionally' },
    { key: 'did_not_use', label: 'Did not use today' },
  ];

  const changeChoices = [
    'More energy',
    'Better skin',
    'Better hair',
    'Better sleep',
    'Feeling calmer',
    'Improved confidence',
    'No noticeable changes',
    'Other',
  ];

  const discomfortOptions = [
    { key: 'none', label: 'None noticed' },
    { key: 'mild', label: 'Mild discomfort' },
    { key: 'moderate', label: 'Moderate discomfort' },
    { key: 'significant', label: 'Significant discomfort' },
    { key: 'described_in_notes', label: 'Prefer to describe below' },
  ];

  // CONFIRMATION SCREEN
  if (submittedSuccess) {
    return (
      <div className="animate-fade-in" style={{ padding: '24px 18px', textAlign: 'center' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: '#DCFCE7',
          color: '#15803D',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '20px auto 16px auto',
          boxShadow: '0 8px 20px rgba(21, 128, 61, 0.2)',
        }}>
          <CheckCircle size={40} />
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-primary-dark)', marginBottom: '8px' }}>
          {isEdit ? 'Check-in Updated!' : 'Check-in Recorded!'}
        </h2>

        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '24px' }}>
          {submissionResult?.message || 'Your daily check-in has been securely saved to your personal timeline.'}
        </p>

        {photoPreview && (
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>
              Documented Progress Photo:
            </span>
            <img
              src={photoPreview}
              alt="Progress preview"
              style={{
                width: '160px',
                height: '160px',
                borderRadius: '16px',
                objectFit: 'cover',
                boxShadow: 'var(--shadow-md)',
                border: '2px solid #FFFFFF',
              }}
            />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={() => navigate('/timeline')} className="btn-primary">
            View Personal Timeline
          </button>
          <button onClick={() => navigate('/')} className="btn-secondary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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

        <span className="badge badge-green">
          {isEdit ? 'Edit Today\'s Entry' : `Day ${activeJourney?.daysUsing || 1}`}
        </span>
      </div>

      <div style={{ marginBottom: '18px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text)' }}>
          Daily Check-in
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
          {activeJourney ? activeJourney.productId?.name : 'Select a product journey'}
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

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* QUESTION 1: Mood */}
        <div className="wellness-card">
          <label className="input-label" style={{ fontSize: '14px', marginBottom: '10px', display: 'block' }}>
            1. How are you feeling today?
          </label>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px' }}>
            {moodOptions.map((opt) => (
              <button
                type="button"
                key={opt.key}
                onClick={() => setMood(opt.key)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '10px 2px',
                  borderRadius: '14px',
                  border: mood === opt.key ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: mood === opt.key ? 'var(--color-primary-light)' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '22px' }}>{opt.emoji}</span>
                <span style={{ fontSize: '10px', marginTop: '4px', fontWeight: mood === opt.key ? 700 : 500, color: mood === opt.key ? 'var(--color-primary-dark)' : 'var(--color-text-muted)' }}>
                  {opt.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* QUESTION 2: Consistency */}
        <div className="wellness-card">
          <label className="input-label" style={{ fontSize: '14px', marginBottom: '10px', display: 'block' }}>
            2. How consistently did you use the product?
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {consistencyOptions.map((opt) => (
              <label
                key={opt.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: usageConsistency === opt.key ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: usageConsistency === opt.key ? 'var(--color-primary-light)' : '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: usageConsistency === opt.key ? 600 : 400,
                  color: usageConsistency === opt.key ? 'var(--color-primary-dark)' : 'var(--color-text)',
                }}
              >
                <input
                  type="radio"
                  name="usageConsistency"
                  checked={usageConsistency === opt.key}
                  onChange={() => setUsageConsistency(opt.key)}
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* QUESTION 3: Changes Noticed */}
        <div className="wellness-card">
          <label className="input-label" style={{ fontSize: '14px', marginBottom: '4px', display: 'block' }}>
            3. What changes have you noticed?
          </label>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '10px' }}>
            Select all that apply
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {changeChoices.map((choice) => {
              const selected = changesNoticed.includes(choice);
              return (
                <button
                  type="button"
                  key={choice}
                  onClick={() => toggleChange(choice)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '20px',
                    border: selected ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: selected ? 'var(--color-primary)' : '#FFFFFF',
                    color: selected ? '#FFFFFF' : 'var(--color-text)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        </div>

        {/* QUESTION 4: Discomfort */}
        <div className="wellness-card">
          <label className="input-label" style={{ fontSize: '14px', marginBottom: '10px', display: 'block' }}>
            4. Have you experienced any discomfort or unwanted effects?
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {discomfortOptions.map((opt) => (
              <label
                key={opt.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: discomfort === opt.key ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: discomfort === opt.key ? 'var(--color-primary-light)' : '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: discomfort === opt.key ? 600 : 400,
                  color: discomfort === opt.key ? 'var(--color-primary-dark)' : 'var(--color-text)',
                }}
              >
                <input
                  type="radio"
                  name="discomfort"
                  checked={discomfort === opt.key}
                  onChange={() => setDiscomfort(opt.key)}
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* QUESTION 5: Additional Notes */}
        <div className="wellness-card">
          <label className="input-label" style={{ fontSize: '14px', marginBottom: '6px', display: 'block' }}>
            5. Additional notes (optional)
          </label>
          <textarea
            rows={3}
            placeholder="Describe your routine, feel, textures, or daily observations..."
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            className="input-field"
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* QUESTION 6: PROGRESS PHOTO (OPTIONAL) */}
        <div className="wellness-card" style={{ border: photoPreview ? '1.5px solid #A7D3B5' : '1px dashed var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="input-label" style={{ fontSize: '14px', margin: 0 }}>
              6. Progress Photo <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(Optional)</span>
            </label>
            <span className="badge badge-gray" style={{ fontSize: '10px' }}>
              JPG, PNG, WebP &bull; Max 5MB
            </span>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '14px', lineHeight: 1.4 }}>
            Take an optional photo under natural light to visually document your transformation over time.
          </p>

          {/* Photo Preview or Upload Zone */}
          {photoPreview ? (
            <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', width: '100%', height: '220px', background: '#000' }}>
              <img
                src={photoPreview}
                alt="Selected checkin progress"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              <div style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                display: 'flex',
                gap: '8px',
              }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    cursor: 'pointer',
                  }}
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  style={{
                    background: 'rgba(217, 56, 58, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                borderRadius: '16px',
                border: '1.5px dashed var(--color-primary)',
                background: 'var(--color-primary-subtle)',
                padding: '24px 16px',
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: '#FFFFFF',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px auto',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <Camera size={22} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-dark)', display: 'block' }}>
                Tap to attach a photograph
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px', display: 'block' }}>
                You can submit without uploading a photo
              </span>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            style={{ display: 'none' }}
            onChange={handlePhotoSelect}
          />
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading || !activeJourney}
          className="btn-primary"
          style={{ marginTop: '6px' }}
        >
          {loading ? 'Saving Check-in...' : (isEdit ? 'Update Today\'s Check-in' : 'Submit Daily Check-in')}
        </button>

      </form>
    </div>
  );
}

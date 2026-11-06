import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Images,
  Trash2,
  Calendar,
  Columns2,
  SlidersHorizontal,
  Info,
  Camera,
  Plus,
  AlertCircle
} from 'lucide-react';
import { useJourney } from '../context/JourneyContext.jsx';
import { photosAPI } from '../services/api.js';
import PhotoCompareSlider from '../components/PhotoCompareSlider.jsx';

export default function PhotoComparison() {
  const navigate = useNavigate();
  const { activeJourney } = useJourney();

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBeforeId, setSelectedBeforeId] = useState(null);
  const [selectedAfterId, setSelectedAfterId] = useState(null);
  const [comparisonMode, setComparisonMode] = useState('slider'); // 'slider' | 'side-by-side'
  const [deletingId, setDeletingId] = useState(null);

  const fetchPhotos = () => {
    if (!activeJourney) {
      setLoading(false);
      return;
    }

    setLoading(true);
    photosAPI.getPhotos({ journeyId: activeJourney._id })
      .then((res) => {
        if (res.data.success) {
          const fetchedPhotos = res.data.photos;
          setPhotos(fetchedPhotos);

          // Auto-select first (oldest) as before, and most recent as after
          if (fetchedPhotos.length >= 2) {
            setSelectedBeforeId(fetchedPhotos[fetchedPhotos.length - 1]._id);
            setSelectedAfterId(fetchedPhotos[0]._id);
          } else if (fetchedPhotos.length === 1) {
            setSelectedBeforeId(fetchedPhotos[0]._id);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPhotos();
  }, [activeJourney]);

  const handleDeletePhoto = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this photograph?')) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await photosAPI.deletePhoto(id);
      if (res.data.success) {
        setPhotos((prev) => prev.filter((p) => p._id !== id));
        if (selectedBeforeId === id) setSelectedBeforeId(null);
        if (selectedAfterId === id) setSelectedAfterId(null);
      }
    } catch (err) {
      alert('Failed to delete photo: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  const beforePhoto = photos.find((p) => p._id === selectedBeforeId);
  const afterPhoto = photos.find((p) => p._id === selectedAfterId);

  return (
    <div className="animate-fade-in" style={{ padding: '16px 16px 28px 16px' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '14px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text)' }}>
          Visual Progress
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
          {activeJourney?.productId?.name || 'Photo journal & transformation'}
        </p>
      </div>

      {/* Medical Disclaimer Banner */}
      <div style={{
        background: 'var(--color-primary-subtle)',
        border: '1px solid #D0E1F3',
        borderRadius: '12px',
        padding: '10px 14px',
        fontSize: '11px',
        color: '#133A6B',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        lineHeight: 1.4,
        marginBottom: '16px',
      }}>
        <Info size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-primary)' }} />
        <span>
          <strong>Personal Visual Tracking:</strong> Photos are saved privately for your personal comparison. Lighting, angle, and timing can vary. This visual tracking does not constitute an automated medical diagnosis or guaranteed efficacy claim.
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Loading your progress gallery...
        </div>
      ) : photos.length === 0 ? (
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
            <Images size={26} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>
            No Progress Photos Yet
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
            Upload optional photographs during your daily check-in to visually compare your transformation over 30, 60, and 90 days.
          </p>
          <button onClick={() => navigate('/checkin')} className="btn-primary" style={{ width: 'auto', margin: '0 auto' }}>
            <Camera size={16} /> Add Photo in Check-in
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* COMPARISON WORKSPACE (If 2 photos are available/selected) */}
          {beforePhoto && afterPhoto && beforePhoto._id !== afterPhoto._id && (
            <div className="wellness-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Transformation Comparison</h3>
                
                {/* View toggle (slider vs side by side) */}
                <div style={{ display: 'flex', background: '#EAEFE8', borderRadius: '8px', padding: '2px' }}>
                  <button
                    onClick={() => setComparisonMode('slider')}
                    style={{
                      background: comparisonMode === 'slider' ? '#FFFFFF' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: comparisonMode === 'slider' ? 'var(--color-primary-dark)' : 'var(--color-text-muted)',
                    }}
                  >
                    <SlidersHorizontal size={12} /> Slider
                  </button>
                  <button
                    onClick={() => setComparisonMode('side-by-side')}
                    style={{
                      background: comparisonMode === 'side-by-side' ? '#FFFFFF' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: comparisonMode === 'side-by-side' ? 'var(--color-primary-dark)' : 'var(--color-text-muted)',
                    }}
                  >
                    <Columns2 size={12} /> Side-by-Side
                  </button>
                </div>
              </div>

              {comparisonMode === 'slider' ? (
                <PhotoCompareSlider beforePhoto={beforePhoto} afterPhoto={afterPhoto} />
              ) : (
                /* Side-by-Side View */
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary-dark)', display: 'block', marginBottom: '4px' }}>
                      BEFORE: {beforePhoto.date} {beforePhoto.dayNumber ? `(Day ${beforePhoto.dayNumber})` : ''}
                    </span>
                    <img
                      src={beforePhoto.imageUrl}
                      alt={beforePhoto.caption || 'Before'}
                      style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px' }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#1E40AF', display: 'block', marginBottom: '4px' }}>
                      AFTER: {afterPhoto.date} {afterPhoto.dayNumber ? `(Day ${afterPhoto.dayNumber})` : ''}
                    </span>
                    <img
                      src={afterPhoto.imageUrl}
                      alt={afterPhoto.caption || 'After'}
                      style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px' }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PHOTO GALLERY SECTION */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
                Uploaded Progress Photos ({photos.length})
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                Tap photo to assign Before / After
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {photos.map((p) => {
                const isBefore = selectedBeforeId === p._id;
                const isAfter = selectedAfterId === p._id;

                return (
                  <div
                    key={p._id}
                    className="wellness-card"
                    style={{
                      padding: '8px',
                      position: 'relative',
                      border: isBefore
                        ? '2px solid var(--color-primary)'
                        : (isAfter ? '2px solid #2563EB' : '1px solid var(--color-border)'),
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ position: 'relative', height: '140px', borderRadius: '10px', overflow: 'hidden' }}>
                      <img
                        src={p.imageUrl}
                        alt={p.caption || 'Progress photograph'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />

                      {/* Before / After Badges */}
                      {isBefore && (
                        <span style={{
                          position: 'absolute',
                          top: '6px',
                          left: '6px',
                          background: 'var(--color-primary)',
                          color: '#FFFFFF',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '6px',
                        }}>
                          BEFORE
                        </span>
                      )}

                      {isAfter && (
                        <span style={{
                          position: 'absolute',
                          top: '6px',
                          left: '6px',
                          background: '#2563EB',
                          color: '#FFFFFF',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '6px',
                        }}>
                          AFTER
                        </span>
                      )}

                      <button
                        onClick={(e) => handleDeletePhoto(p._id, e)}
                        disabled={deletingId === p._id}
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          background: 'rgba(0,0,0,0.6)',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '50%',
                          width: '26px',
                          height: '26px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                        title="Delete photo"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text)', display: 'block' }}>
                          Day {p.dayNumber || 1}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                          {p.date}
                        </span>
                      </div>

                      {/* Select as Before/After Buttons */}
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => setSelectedBeforeId(p._id)}
                          style={{
                            background: isBefore ? 'var(--color-primary)' : '#EAEFE8',
                            color: isBefore ? '#FFFFFF' : 'var(--color-primary-dark)',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '3px 6px',
                            fontSize: '9px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          B
                        </button>
                        <button
                          onClick={() => setSelectedAfterId(p._id)}
                          style={{
                            background: isAfter ? '#2563EB' : '#DBEAFE',
                            color: isAfter ? '#FFFFFF' : '#1E40AF',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '3px 6px',
                            fontSize: '9px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          A
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

import React, { useState, useRef, useCallback } from 'react';

export default function PhotoCompareSlider({ beforePhoto, afterPhoto }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      {/* Date Header Badges */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
        <span style={{ color: 'var(--color-primary-dark)', background: 'var(--color-primary-light)', padding: '3px 8px', borderRadius: '8px' }}>
          Before: {beforePhoto.date || 'Baseline'} {beforePhoto.dayNumber ? `(Day ${beforePhoto.dayNumber})` : ''}
        </span>
        <span style={{ color: '#1E40AF', background: '#DBEAFE', padding: '3px 8px', borderRadius: '8px' }}>
          After: {afterPhoto.date || 'Recent'} {afterPhoto.dayNumber ? `(Day ${afterPhoto.dayNumber})` : ''}
        </span>
      </div>

      {/* Interactive Slider Container */}
      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        style={{
          position: 'relative',
          width: '100%',
          height: '320px',
          borderRadius: '16px',
          overflow: 'hidden',
          userSelect: 'none',
          cursor: 'ew-resize',
          boxShadow: 'var(--shadow-md)',
          background: '#000',
        }}
      >
        {/* 'After' Image (Base Layer) */}
        <img
          src={afterPhoto.imageUrl}
          alt={afterPhoto.caption || 'After photo'}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            pointerEvents: 'none',
          }}
        />

        {/* 'Before' Image (Clipped Overlay Layer) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${sliderPosition}%`,
            height: '100%',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <img
            src={beforePhoto.imageUrl}
            alt={beforePhoto.caption || 'Before photo'}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
              minWidth: '350px',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>

        {/* Vertical Divider Line and Circular Drag Handle */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${sliderPosition}%`,
            width: '2px',
            backgroundColor: '#FFFFFF',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            boxShadow: '0 0 6px rgba(0,0,0,0.5)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '34px',
              height: '34px',
              backgroundColor: '#FFFFFF',
              borderRadius: '50%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 800,
              color: 'var(--color-primary)',
            }}
          >
            ↔
          </div>
        </div>

        {/* Floating subtle indicators */}
        <span style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.6)',
          color: '#fff',
          fontSize: '10px',
          padding: '2px 6px',
          borderRadius: '4px',
          pointerEvents: 'none',
        }}>
          BEFORE
        </span>
        <span style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.6)',
          color: '#fff',
          fontSize: '10px',
          padding: '2px 6px',
          borderRadius: '4px',
          pointerEvents: 'none',
        }}>
          AFTER
        </span>
      </div>

      <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', textAlign: 'center', margin: 0 }}>
        👆 Drag the slider across to compare transformation progress
      </p>
    </div>
  );
}

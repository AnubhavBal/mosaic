import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, AlertCircle } from 'lucide-react';
import { productsAPI, journeysAPI } from '../services/api.js';

export default function NewJourneyModal({ isOpen, onClose, onJourneyCreated }) {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [targetDurationDays, setTargetDurationDays] = useState(90);
  const [personalGoal, setPersonalGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      productsAPI.getProducts()
        .then((res) => {
          if (res.data.success) {
            setProducts(res.data.products);
            if (res.data.products.length > 0) {
              setSelectedProductId(res.data.products[0]._id);
              setTargetDurationDays(res.data.products[0].recommendedDurationDays || 90);
            }
          }
        })
        .catch((err) => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProductChange = (productId) => {
    setSelectedProductId(productId);
    const prod = products.find((p) => p._id === productId);
    if (prod && prod.recommendedDurationDays) {
      setTargetDurationDays(prod.recommendedDurationDays);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProductId) {
      setErrorMsg('Please select a product');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await journeysAPI.createJourney({
        productId: selectedProductId,
        startDate,
        targetDurationDays: parseInt(targetDurationDays, 10),
        personalGoal,
      });

      if (res.data.success) {
        onJourneyCreated(res.data.journey);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to start journey');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(22, 36, 28, 0.65)',
      backdropFilter: 'blur(4px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div className="wellness-card animate-fade-in" style={{
        width: '100%',
        maxWidth: '390px',
        maxHeight: '85vh',
        overflowY: 'auto',
        padding: '20px',
        position: 'relative',
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
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
          New Habit
        </span>

        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '4px' }}>
          Start a Product Journey
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
          Track daily consistency and visible results over time.
        </p>

        {errorMsg && (
          <div style={{
            background: 'var(--color-danger-light)',
            color: 'var(--color-danger)',
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '14px',
          }}>
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Select Product */}
          <div>
            <label className="input-label" style={{ fontSize: '13px', marginBottom: '8px', display: 'block' }}>
              Select Product:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
              {products.map((prod) => {
                const isSelected = selectedProductId === prod._id;
                return (
                  <div
                    key={prod._id}
                    onClick={() => handleProductChange(prod._id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      background: isSelected ? 'var(--color-primary-light)' : '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  >
                    <img
                      src={prod.image}
                      alt={prod.name}
                      style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span className="badge badge-green" style={{ fontSize: '9px', padding: '1px 6px' }}>
                        {prod.category}
                      </span>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {prod.name}
                      </h4>
                    </div>
                    {isSelected && <Check size={16} color="var(--color-primary)" strokeWidth={3} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Start Date */}
          <div className="input-group" style={{ margin: 0 }}>
            <label className="input-label" style={{ fontSize: '13px' }}>
              When did you start using it?
            </label>
            <input
              type="date"
              value={startDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {/* Target Duration Days */}
          <div className="input-group" style={{ margin: 0 }}>
            <label className="input-label" style={{ fontSize: '13px' }}>
              Target Journey Duration (Days):
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[30, 60, 90, 180].map((days) => (
                <button
                  type="button"
                  key={days}
                  onClick={() => setTargetDurationDays(days)}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: '10px',
                    border: targetDurationDays === days ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: targetDurationDays === days ? 'var(--color-primary)' : '#FFFFFF',
                    color: targetDurationDays === days ? '#FFFFFF' : 'var(--color-text)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>

          {/* Personal Goal */}
          <div className="input-group" style={{ margin: 0 }}>
            <label className="input-label" style={{ fontSize: '13px' }}>
              Personal Goal / Intention (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g. Healthier scalp, fade acne spots..."
              value={personalGoal}
              onChange={(e) => setPersonalGoal(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !selectedProductId}
            className="btn-primary"
            style={{ marginTop: '8px' }}
          >
            {loading ? 'Starting Journey...' : 'Begin Product Journey'}
          </button>

        </form>
      </div>
    </div>
  );
}

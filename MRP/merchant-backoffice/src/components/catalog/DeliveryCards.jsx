import { useState } from 'react';
import { NumberField, Popup } from '../../ce-ui';

// ─── Availability toggle card (Show on Website / Fragile Handling) ────────────
export function ToggleCard({ title, subtitle, on, onClick, loading, bordered = true }) {
  return (
    <div style={{
      background: '#FFFFFF', border: bordered ? '1px solid #E9E9E9' : 'none', borderRadius: '12px',
      padding: bordered ? '16px' : 0, display: 'flex', flexDirection: 'column', gap: '8px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '14px', fontWeight: 700, color: '#282828', fontFamily: "'Lato', sans-serif", letterSpacing: '0.096px' }}>
          {title}
        </span>
        <div
          onClick={!loading ? onClick : undefined}
          style={{
            width: '44px', height: '24px', borderRadius: '999px',
            background: on ? '#006BFF' : '#D1D5DB',
            position: 'relative', cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s', flexShrink: 0, opacity: loading ? 0.5 : 1,
          }}
        >
          <div style={{
            position: 'absolute', top: '3px', left: on ? 'calc(100% - 21px)' : '3px',
            width: '18px', height: '18px', borderRadius: '50%', background: '#FFFFFF',
            transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} />
        </div>
      </div>
      <p style={{ margin: 0, fontSize: '14px', color: '#7E7E7E', fontFamily: "'Lato', sans-serif", lineHeight: '20px', letterSpacing: '0.096px' }}>
        {subtitle}
      </p>
    </div>
  );
}

function NumInput({ value, onChange, placeholder, unit, error }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <NumberField
        size="lg"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rightAddon={unit}
        allowNegative={false}
        errorText={error}
        className="w-full"
      />
    </div>
  );
}

const DELIVERY_FIELD_LABELS = { weight: 'Total Weight', length: 'Length', width: 'Width', height: 'Height' };

function validateDeliveryForm(form) {
  const errors = {};
  Object.keys(DELIVERY_FIELD_LABELS).forEach(field => {
    if (form[field] !== '' && Number(form[field]) <= 0) {
      errors[field] = `${DELIVERY_FIELD_LABELS[field]} must be greater than 0`;
    }
  });
  return errors;
}

// ─── Delivery Properties edit modal ─────────────────────────────────────────────
// Holds a local draft seeded from `initial`; changes are only committed via onSave.
export function DeliveryPropertiesModal({ initial, onClose, onSave, onLearnMore }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const onChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
  };
  const handleSave = () => {
    const nextErrors = validateDeliveryForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onSave(form);
  };
  return (
    <Popup
      open
      onClose={onClose}
      platform="desktop"
      title="Delivery Properties"
      primaryAction={{ label: 'Save', onClick: handleSave }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Lato', sans-serif" }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#282828', lineHeight: '20px', letterSpacing: '0.096px' }}>
              <span style={{ color: '#D0021B' }}>*</span> Total Weight
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#7E7E7E', lineHeight: '18px', letterSpacing: '0.0825px' }}>
              Make sure the weight includes packaging
            </p>
          </div>
          <NumInput value={form.weight} onChange={v => onChange('weight', v)} placeholder="Input weight" unit="gr" error={errors.weight} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#282828', lineHeight: '20px', letterSpacing: '0.096px' }}>
              <span style={{ color: '#D0021B' }}>*</span> Volume
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#7E7E7E', lineHeight: '18px', letterSpacing: '0.0825px' }}>
              Ensure catalog dimensions after packaging are used to calculate volumetric weight.{' '}
              <span onClick={onLearnMore} style={{ color: '#006BFF', cursor: 'pointer' }}>Learn More</span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <NumInput value={form.length} onChange={v => onChange('length', v)} placeholder="Length" unit="cm" error={errors.length} />
            <NumInput value={form.width} onChange={v => onChange('width', v)} placeholder="Width" unit="cm" error={errors.width} />
            <NumInput value={form.height} onChange={v => onChange('height', v)} placeholder="Height" unit="cm" error={errors.height} />
          </div>
        </div>
      </div>
    </Popup>
  );
}

// ─── "How to Calculate Size" info modal ─────────────────────────────────────────
export function HowToCalculateSizeModal({ onClose }) {
  return (
    <Popup
      open
      onClose={onClose}
      platform="tablet"
      title="How to Calculate Size"
      description="Make sure to measure the catalog after it is packaged to avoid weight discrepancies with the shipping courier, which can result in additional shipping costs."
      primaryAction={{ label: 'Okay, Got it', onClick: onClose }}
    >
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg width="180" height="170" viewBox="0 0 180 170" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M40 60 L40 120 L90 148" stroke="#D4D4D4" strokeWidth="1" strokeDasharray="3 3" />
          <path d="M90 148 L140 120" stroke="#D4D4D4" strokeWidth="1" strokeDasharray="3 3" />
          <path d="M90 42 L140 62 L90 82 L40 62 Z" fill="#E7B384" />
          <path d="M40 62 L90 82 L90 138 L40 118 Z" fill="#C98E52" />
          <path d="M140 62 L90 82 L90 138 L140 118 Z" fill="#D9A066" />
          <path d="M90 42 L108 49 L58 69 L40 62 Z" fill="#F0C6A0" />
          <text x="20" y="92" fill="#7E7E7E" fontSize="10" fontFamily="Lato, sans-serif">Height</text>
          <text x="46" y="160" fill="#7E7E7E" fontSize="10" fontFamily="Lato, sans-serif">Length</text>
          <text x="120" y="160" fill="#7E7E7E" fontSize="10" fontFamily="Lato, sans-serif">Width</text>
        </svg>
      </div>
    </Popup>
  );
}

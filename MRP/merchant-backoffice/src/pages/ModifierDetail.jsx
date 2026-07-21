import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchModifierById } from '../services/catalogService';
import { useSnackbar } from '../contexts/SnackbarContext';
import { Toggle, Breadcrumbs, Infobox } from '../ce-ui';

const MIN_ACTIVE = 2; // at least 2 options must be active to enable a modifier

// ─── Deactivate-modifier confirmation modal ──────────────────────────────────
function DeactivateModal({ onConfirm, onCancel }) {
  return (
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(126,126,126,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: '16px', padding: '20px', width: '100%', maxWidth: '420px', fontFamily: "'Lato', sans-serif" }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, color: '#282828', display: 'flex' }} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style={{ textAlign: 'center', margin: '0 0 24px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#282828', lineHeight: '26px', letterSpacing: '0.1238px' }}>
            Services connected to this modifier will become unavailable
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#7E7E7E', lineHeight: '18px', letterSpacing: '0.0825px' }}>
            This modifier must be selected at least {MIN_ACTIVE}.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button onClick={onConfirm} style={{ width: '100%', height: '44px', background: '#006BFF', border: 'none', borderRadius: '10px', color: '#FFFFFF', fontSize: '14px', fontWeight: 700, fontFamily: "'Lato', sans-serif", cursor: 'pointer' }}>
            Deactivate Modifier
          </button>
          <button onClick={onCancel} style={{ width: '100%', height: '44px', background: '#FFFFFF', border: '1px solid #006BFF', borderRadius: '10px', color: '#006BFF', fontSize: '14px', fontWeight: 700, fontFamily: "'Lato', sans-serif", cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function formatOptionPrice(price) {
  if (!price) return 'Free';
  return `+IDR ${new Intl.NumberFormat('id-ID').format(price)}`;
}

function ImageThumb() {
  return (
    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#F4F4F4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
      </svg>
    </div>
  );
}

export default function ModifierDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [modifier, setModifier] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [available, setAvailable] = useState(true);
  const [optionState, setOptionState] = useState([]); // [{ ...option, active }]
  const [pendingIdx, setPendingIdx] = useState(null);  // option pending deactivation confirmation

  useEffect(() => {
    async function load() {
      setLoading(true); setError(null);
      try {
        const res = await fetchModifierById(id);
        setModifier(res.data);
        setOptionState((res.data?.options || []).map(o => ({ ...o, active: true })));
        setAvailable(true);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const activeCount = optionState.filter(o => o.active).length;

  // The modifier is "available" whenever at least MIN_ACTIVE options are active.
  // Apply a new option list, firing the enabled/disabled snackbar on transitions.
  function applyOptions(nextList) {
    const nextAvailable = nextList.filter(o => o.active).length >= MIN_ACTIVE;
    if (nextAvailable !== available) {
      showSnackbar(nextAvailable ? 'Modifier has been enabled' : 'Modifier has been disabled', 'success');
    }
    setOptionState(nextList);
    setAvailable(nextAvailable);
  }

  // Master "Modifier Availability" toggle — applies to all options.
  function toggleMaster(checked) {
    applyOptions(optionState.map(o => ({ ...o, active: checked })));
  }

  // Per-option toggle (always interactive, even while the modifier is disabled).
  function toggleOption(idx, checked) {
    // Deactivating an option that would drop an enabled modifier below the
    // minimum → confirm before turning the whole modifier off.
    if (!checked && available && activeCount <= MIN_ACTIVE) {
      setPendingIdx(idx);
      return;
    }
    applyOptions(optionState.map((o, i) => i === idx ? { ...o, active: checked } : o));
  }

  // Confirm from the modal: turn off every option (incl. the last remaining) and disable the modifier.
  function confirmDeactivate() {
    applyOptions(optionState.map(o => ({ ...o, active: false })));
    setPendingIdx(null);
  }

  return (
    <div style={{ padding: '24px', background: '#F4F4F4', minHeight: 'calc(100vh - 56px)', fontFamily: "'Lato', sans-serif" }}>
      <style>{`@keyframes skeleton-pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }`}</style>

      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <Breadcrumbs
          title={loading ? 'Modifier' : (modifier?.name || 'Modifier')}
          breadcrumbs={[{ name: 'Modifier', onClick: () => navigate('/catalog/modifier') }]}
          onBack={() => navigate('/catalog/modifier')}
        />
      </div>

      {error && !loading && (
        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', padding: '64px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 4px', fontSize: '16px', color: '#D0021B' }}>Failed to load modifier</p>
          <p style={{ margin: 0, fontSize: '13px', color: '#7E7E7E' }}>{error}</p>
        </div>
      )}

      {!error && (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>

          {/* Availability card */}
          <div style={{ flex: 1, minWidth: 0, background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[0,1,2,3].map(i => <div key={i} style={{ height: '40px', background: '#E9E9E9', borderRadius: '6px', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />)}
              </div>
            ) : modifier ? (
              <>
                {/* Header row */}
                <div style={{ padding: '20px', borderBottom: '1px solid #E9E9E9' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 700, color: '#282828', letterSpacing: '0.096px' }}>Modifier Availability</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#7E7E7E', letterSpacing: '0.0825px' }}>Click the toggle to set availability</p>
                    </div>
                    <Toggle checked={available} onChange={toggleMaster} />
                  </div>
                  {/* Rule hint — only when exactly the minimum options remain active */}
                  {activeCount === MIN_ACTIVE && (
                    <div style={{ marginTop: '12px' }}>
                      <Infobox variant="info" message={`At least ${MIN_ACTIVE} options must be active to enable this modifier.`} />
                    </div>
                  )}
                </div>
                {/* Option rows */}
                {optionState.map((opt, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '16px 20px', borderBottom: idx < optionState.length - 1 ? '1px solid #E9E9E9' : 'none' }}>
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: '14px', color: '#282828', letterSpacing: '0.096px' }}>{opt.name}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#7E7E7E', letterSpacing: '0.0825px' }}>{formatOptionPrice(opt.price)}</p>
                    </div>
                    <Toggle checked={opt.active} onChange={checked => toggleOption(idx, checked)} />
                  </div>
                ))}
              </>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: '#7E7E7E' }}>Modifier not found</div>
            )}
          </div>

          {/* Connected Catalog card */}
          {!loading && modifier && (
            <div style={{ flex: 1, minWidth: 0, background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#282828', letterSpacing: '0.096px' }}>Connected Catalog</p>
              {modifier.connected.length === 0 ? (
                <p style={{ margin: 0, fontSize: '14px', color: '#7E7E7E' }}>No connected catalog</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {modifier.connected.map((name, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <ImageThumb />
                      <p style={{ margin: 0, fontSize: '14px', color: '#282828', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {pendingIdx !== null && (
        <DeactivateModal onConfirm={confirmDeactivate} onCancel={() => setPendingIdx(null)} />
      )}
    </div>
  );
}

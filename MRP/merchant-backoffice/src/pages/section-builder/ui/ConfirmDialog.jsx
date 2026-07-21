import { useEffect } from 'react';
import { Popup } from '../../../ce-ui';

/**
 * Shared modal confirmation for irreversible actions (US-6.4's page delete,
 * US-8.4's discard) — built on ce-ui's Popup. Popup handles backdrop-click
 * and its own close (X) button, but not Escape-to-close or Tab focus
 * trapping, so Escape is added here; Tab-trapping is left to Popup as-is
 * (it's the vendored component's own gap, not something to work around).
 */
export default function ConfirmDialog({ open, title, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === 'Escape' && onCancel();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  return (
    <Popup
      open={open}
      onClose={onCancel}
      description={title}
      platform="desktop"
      primaryAction={{ label: confirmLabel, onClick: onConfirm, destructive: danger }}
      secondaryAction={{ label: 'Cancel', onClick: onCancel }}
    />
  );
}

function timeAgo(isoString) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(isoString).getTime()) / 1000));
  if (seconds < 60) return 'moments ago';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hour${hours === 1 ? '' : 's'} ago`;
}

/** US-8.5 — stays until the merchant chooses; does not auto-dismiss. */
export default function DraftRecoveryBanner({ restoredAt, onKeep, onDiscard }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm">
      <span className="text-amber-900">Draft restored from {timeAgo(restoredAt)}.</span>
      <div className="flex gap-2">
        <button type="button" onClick={onKeep} className="rounded-md border border-amber-300 px-2 py-1 text-xs text-amber-900 hover:bg-amber-100">
          Keep draft
        </button>
        <button type="button" onClick={onDiscard} className="rounded-md border border-amber-300 px-2 py-1 text-xs text-amber-900 hover:bg-amber-100">
          Discard and load last published
        </button>
      </div>
    </div>
  );
}

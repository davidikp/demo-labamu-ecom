/**
 * US-8.6 stub — real-time co-editing detection needs a backend presence
 * channel this repo doesn't have. Triggered only via `?simulateEditor=Name`
 * for demo purposes; non-blocking, one-way (this user isn't notified that
 * anyone joined).
 */
export default function ConcurrentEditingBanner({ editorName }) {
  if (!editorName) return null;

  return (
    <div className="border-b border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-900">
      {editorName} is currently editing this store. Publishing may overwrite their changes.
    </div>
  );
}

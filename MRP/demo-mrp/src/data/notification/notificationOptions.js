export const NOTIFICATION_DELIVERY_OPTIONS = [
  { value: "Suggested", label: "Suggested" },
  { value: "Instant", label: "Instant" },
  { value: "Hourly Digest", label: "Hourly Digest" },
  { value: "Daily Digest", label: "Daily Digest" },
  { value: "Only High Priority", label: "Only High Priority" },
  { value: "Mentions Only", label: "Mentions Only" },
];

// What "Suggested" resolves to, per notification rule.
// Recommendation follows each rule's nature: action-required/urgent → Instant,
// planning/summaries → Daily Digest, escalation-only → Only High Priority,
// mention-scoped → Mentions Only.
export const SUGGESTED_DELIVERY_BY_RULE = {
  // Email
  po_approval_request: "Instant",
  po_revision_cancel: "Instant",
  receipt_confirmation: "Instant",
  wo_ready_process: "Daily Digest",
  rfq_quote_update: "Daily Digest",
  daily_digest: "Daily Digest",
  // Push
  pending_approval_task: "Instant",
  routing_delay_blocked: "Only High Priority",
  outsource_assignment_update: "Instant",
  material_shortage_alert: "Only High Priority",
  quote_response_received: "Instant",
  // In-App
  status_transition: "Instant",
  comments_mentions: "Mentions Only",
  document_uploaded: "Instant",
  assignment_changes: "Instant",
  system_announcements: "Only High Priority",
  // Real-Time
  browser_toast: "Instant",
  sound_alert: "Only High Priority",
  header_badge: "Instant",
  focus_mode: "Only High Priority",
};

export const SUGGESTED_DELIVERY_FALLBACK = "Instant"; // unknown/future rule

export const NOTIFICATION_CATEGORY_OPTIONS = [
  { id: "approvals", label: "Approvals" },
  { id: "operations", label: "Operations" },
  { id: "documents", label: "Documents" },
  { id: "collaboration", label: "Collaboration" },
  { id: "system_updates", label: "System Updates" },
];

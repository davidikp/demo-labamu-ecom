import React from "react";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { DownloadIcon } from "../../../components/icons/Icons.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { LabelValue } from "../../../components/molecules/LabelValue.jsx";

const STATUS_VARIANT = {
  Mapping: "orange",
  "Normalizing Data": "yellow",
  Review: "grey",
  Processing: "blue",
  Completed: "green",
  Cancelled: "red",
};

const formatDate = (iso) => {
  try {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    const datePart = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const timePart = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return `${datePart}; ${timePart}`;
  } catch {
    return iso;
  }
};

const openSourceFile = (batch) => {
  const rows = batch.rows || batch.rawRows || [];
  const headers = rows.length
    ? Array.from(rows.reduce((set, row) => {
        Object.keys(row).forEach((k) => set.add(k));
        return set;
      }, new Set()))
    : ["fileName"];
  const csvLines = rows.length
    ? [
        headers.join(","),
        ...rows.map((row) => headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",")),
      ]
    : [batch.fileName];
  const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 30000);
};

const downloadFailedRowsCsv = (batch) => {
  const rows = batch.failedRows || [];
  if (rows.length === 0) return;
  const headers = Array.from(rows.reduce((set, row) => {
    Object.keys(row).forEach((k) => set.add(k));
    return set;
  }, new Set()));
  const csvLines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",")),
  ];
  const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${batch.id}-failed-items.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const BulkUploadDetailModal = ({ isOpen, onClose, batch }) => {
  if (!batch) return null;

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Upload Detail"
      width="640px"
      footer={
        batch.failedCount > 0 && (
          <Button variant="secondary" size="large" leftIcon={DownloadIcon} onClick={() => downloadFailedRowsCsv(batch)} style={{ flex: 1 }}>
            Download Invalid Data
          </Button>
        )
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            padding: "16px",
            borderRadius: "var(--radius-card)",
            border: "1px solid var(--neutral-line-separator-1)",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
              <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>File Name</span>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  openSourceFile(batch);
                }}
                style={{
                  fontSize: "var(--text-title-3)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--feature-brand-primary)",
                  textDecoration: "underline",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  cursor: "pointer",
                }}
              >
                {batch.fileName}
              </a>
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--neutral-on-surface-tertiary)",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                }}
              >
                {batch.id}
              </span>
            </div>
            <LabelValue label="Created At" value={formatDate(batch.createdAt)} />
            <LabelValue label="Created By" value={batch.createdBy} />
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
              <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>Status</span>
              <div>
                <StatusBadge variant={STATUS_VARIANT[batch.status] || "grey"}>{batch.status}</StatusBadge>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
            <LabelValue label="Total Product" value={batch.totalProducts} />
            <LabelValue label="Valid Data" value={batch.successCount} />
            <LabelValue label="Invalid Data" value={batch.failedCount} />
          </div>
        </div>
      </div>
    </GeneralModal>
  );
};

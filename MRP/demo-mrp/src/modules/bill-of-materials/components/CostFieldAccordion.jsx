import React, { useState } from "react";
import { AddIcon, ChevronDownIcon, ChevronRightIcon, DeleteIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { ChipTabBar } from "../../../components/molecules/ChipTabBar.jsx";
import { InputField } from "../../../components/molecules/InputField.jsx";
import { fieldTotal, formatIDR } from "../utils/bomUtils.js";

const MODE_TABS = [
  { id: "single", label: "Single entry" },
  { id: "breakdown", label: "Breakdown" },
];

let nextLineId = 1;
const newLine = () => ({ id: `new-line-${nextLineId++}`, label: "", amount: 0 });

// One collapsible COGS row, shared by the read-only detail view and the
// editable create/edit form. Styled after the Orders module's Material
// Breakdown drawer collapse/expand rows (chevron + bold title + grey
// description + value, indented children on expand) — see
// modules/orders/pages/OrderDetailPage.jsx "Demand" row group.
export const CostFieldAccordion = ({ icon: Icon, title, description, isNew, field, onChange, readOnly = false }) => {
  const [expanded, setExpanded] = useState(true);
  const total = fieldTotal(field);

  // Preserve the field's value across a mode switch instead of silently
  // dropping it — switching to Breakdown with no existing lines seeds one
  // line with the current flat amount (min-1-row rule); switching to Single
  // carries over the current breakdown subtotal.
  const setMode = (mode) => {
    if (mode === "breakdown" && field.lines.length === 0) {
      onChange({ ...field, mode, lines: [{ ...newLine(), amount: field.amount || 0 }] });
      return;
    }
    if (mode === "single") {
      onChange({ ...field, mode, amount: total });
      return;
    }
    onChange({ ...field, mode });
  };
  const setAmount = (amount) => onChange({ ...field, amount: Number(amount) || 0 });
  const updateLine = (idx, patch) =>
    onChange({ ...field, lines: field.lines.map((l, i) => (i === idx ? { ...l, ...patch } : l)) });
  const addLine = () => onChange({ ...field, lines: [...field.lines, newLine()] });
  const removeLine = (idx) =>
    onChange({ ...field, lines: field.lines.length > 1 ? field.lines.filter((_, i) => i !== idx) : field.lines });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronDownIcon size={16} color="var(--neutral-on-surface-tertiary)" />
            ) : (
              <ChevronRightIcon size={16} color="var(--neutral-on-surface-tertiary)" />
            )}
          </div>
          {Icon ? <Icon size={16} color="var(--neutral-on-surface-tertiary)" /> : null}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--neutral-on-surface-primary)", fontWeight: "bold" }}>
              {title}
              {isNew ? <StatusBadge variant="blue-light">New</StatusBadge> : null}
            </span>
            {description ? (
              <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>{description}</span>
            ) : null}
          </div>
        </div>
        <span style={{ fontWeight: "bold", fontSize: "16px", color: "var(--neutral-on-surface-primary)" }}>
          {formatIDR(total)}
        </span>
      </div>

      {expanded ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingLeft: "32px" }}>
          {!readOnly ? <ChipTabBar tabs={MODE_TABS} activeTab={field.mode} onChange={setMode} size="sm" /> : null}

          {field.mode === "single" ? (
            readOnly ? (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", alignItems: "center" }}>
                <span style={{ color: "var(--neutral-on-surface-primary)" }}>Amount</span>
                <span style={{ fontWeight: "bold", color: "var(--neutral-on-surface-secondary)" }}>
                  {formatIDR(field.amount)}
                </span>
              </div>
            ) : (
              <InputField type="number" prefix="IDR" value={field.amount} onChange={(e) => setAmount(e.target.value)} />
            )
          ) : (
            <>
              {field.lines.map((l, idx) =>
                readOnly ? (
                  <div
                    key={l.id || idx}
                    style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", alignItems: "center" }}
                  >
                    <span style={{ color: "var(--neutral-on-surface-primary)" }}>{l.label || "-"}</span>
                    <span style={{ fontWeight: "bold", color: "var(--neutral-on-surface-secondary)" }}>
                      {formatIDR(l.amount)}
                    </span>
                  </div>
                ) : (
                  <div key={l.id || idx} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div style={{ flex: 2 }}>
                      <InputField
                        placeholder="Breakdown item name"
                        value={l.label}
                        onChange={(e) => updateLine(idx, { label: e.target.value })}
                      />
                    </div>
                    <div style={{ width: "180px" }}>
                      <InputField
                        type="number"
                        prefix="IDR"
                        value={l.amount}
                        onChange={(e) => updateLine(idx, { amount: Number(e.target.value) || 0 })}
                      />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => removeLine(idx)}
                        disabled={field.lines.length === 1}
                        style={{ borderColor: "var(--status-red-primary)" }}
                      >
                        <DeleteIcon size={16} color="var(--status-red-primary)" />
                      </Button>
                    </div>
                  </div>
                )
              )}
              {!readOnly ? (
                <Button
                  variant="outlined"
                  size="small"
                  leftIcon={AddIcon}
                  onClick={addLine}
                  style={{ alignSelf: "flex-start" }}
                >
                  {`Add ${title}`}
                </Button>
              ) : null}
              {!readOnly ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderTop: "1px solid var(--neutral-line-separator-2)",
                    fontSize: "var(--text-title-3)",
                    fontWeight: "var(--font-weight-medium)",
                  }}
                >
                  <span>{`${title} Subtotal`}</span>
                  <span>{formatIDR(total)}</span>
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
};

import React, { useState } from "react";
import { AddIcon, ChevronDownIcon, ChevronRightIcon, DeleteIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { Checkbox } from "../../../components/common/Checkbox.jsx";
import { InputField } from "../../../components/molecules/InputField.jsx";
import { fieldTotal, formatIDR } from "../utils/bomUtils.js";

let nextLineId = 1;
const newLine = () => ({ id: `new-line-${nextLineId++}`, label: "", amount: 0 });

// One COGS row, shared by the read-only detail view and the editable
// create/edit form. Styled after the Orders module's Material Breakdown
// drawer rows (bold title + grey description + value) — see
// modules/orders/pages/OrderDetailPage.jsx "Demand" row group.
//
// Editable mode keeps a chevron that collapses/expands the whole row body
// (the Cost Breakdown checkbox + line editor). Read-only mode has no such
// chevron — the header is always shown, and only the breakdown line list
// (when the field actually has a breakdown) gets its own "See/Hide Cost
// Breakdown" toggle, defaulting to expanded.
export const CostFieldAccordion = ({ icon: Icon, title, description, isNew, field, onChange, readOnly = false }) => {
  const [expanded, setExpanded] = useState(true);
  const [breakdownVisible, setBreakdownVisible] = useState(true);
  const total = fieldTotal(field);
  const isBreakdown = field.mode === "breakdown";

  // Preserve the field's value across a mode switch instead of silently
  // dropping it — switching to Breakdown with no existing lines seeds one
  // line with the current flat amount (min-1-row rule); switching to Single
  // carries over the current breakdown subtotal.
  const setBreakdownEnabled = (enabled) => {
    if (enabled && field.lines.length === 0) {
      onChange({ ...field, mode: "breakdown", lines: [{ ...newLine(), amount: field.amount || 0 }] });
      return;
    }
    if (!enabled) {
      onChange({ ...field, mode: "single", amount: total });
      return;
    }
    onChange({ ...field, mode: "breakdown" });
  };
  const setAmount = (amount) => onChange({ ...field, amount: Number(amount) || 0 });
  const updateLine = (idx, patch) =>
    onChange({ ...field, lines: field.lines.map((l, i) => (i === idx ? { ...l, ...patch } : l)) });
  const addLine = () => onChange({ ...field, lines: [...field.lines, newLine()] });
  const removeLine = (idx) =>
    onChange({ ...field, lines: field.lines.length > 1 ? field.lines.filter((_, i) => i !== idx) : field.lines });

  const header = (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", alignItems: "flex-start" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {!readOnly ? (
          <div
            style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "2px" }}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronDownIcon size={16} color="var(--neutral-on-surface-tertiary)" />
            ) : (
              <ChevronRightIcon size={16} color="var(--neutral-on-surface-tertiary)" />
            )}
          </div>
        ) : null}
        {Icon ? <Icon size={16} color="var(--neutral-on-surface-tertiary)" style={{ marginTop: "2px" }} /> : null}
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

      {readOnly ? (
        <span style={{ fontWeight: "bold", fontSize: "16px", color: "var(--neutral-on-surface-primary)" }}>
          {formatIDR(total)}
        </span>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
          <div style={{ width: "200px" }}>
            <InputField
              type="number"
              prefix="IDR"
              value={isBreakdown ? total : field.amount}
              disabled={isBreakdown}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          {isBreakdown ? (
            <span style={{ fontSize: "11px", color: "var(--neutral-on-surface-tertiary)", textAlign: "right" }}>
              Calculated from cost breakdown below
            </span>
          ) : null}
        </div>
      )}
    </div>
  );

  if (readOnly) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {header}
        {isBreakdown ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingLeft: "24px" }}>
            <Button
              variant="tertiary"
              size="small"
              rightIcon={breakdownVisible ? ChevronDownIcon : ChevronRightIcon}
              onClick={() => setBreakdownVisible((v) => !v)}
              style={{ alignSelf: "flex-start", padding: 0 }}
            >
              {breakdownVisible ? "Hide Cost Breakdown" : "See Cost Breakdown"}
            </Button>
            {breakdownVisible
              ? field.lines.map((l, idx) => (
                  <div
                    key={l.id || idx}
                    style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", alignItems: "center" }}
                  >
                    <span style={{ color: "var(--neutral-on-surface-primary)" }}>{l.label || "-"}</span>
                    <span style={{ fontWeight: "bold", color: "var(--neutral-on-surface-secondary)" }}>
                      {formatIDR(l.amount)}
                    </span>
                  </div>
                ))
              : null}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {header}

      {expanded ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingLeft: "32px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <Checkbox checked={isBreakdown} onChange={setBreakdownEnabled} />
            <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-primary)" }}>Cost Breakdown</span>
          </label>

          {isBreakdown ? (
            <>
              {field.lines.map((l, idx) => (
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
                      style={field.lines.length === 1 ? undefined : { borderColor: "var(--status-red-primary)" }}
                    >
                      <DeleteIcon size={16} color={field.lines.length === 1 ? undefined : "var(--status-red-primary)"} />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outlined" size="small" leftIcon={AddIcon} onClick={addLine} style={{ alignSelf: "flex-start" }}>
                Add Cost Item
              </Button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

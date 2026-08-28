import React from "react";
import { AddIcon, DeleteIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { InputField } from "../../../components/index.js";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { COUNTRY_CODE_OPTIONS } from "../../../constants/appConstants.js";

const ROLE_OPTIONS = [
  { value: "Viewer", label: "Viewer" },
  { value: "Approver", label: "Approver" },
];

const cellStyle = (overrides) => ({
  minWidth: 0,
  padding: "8px 12px",
  display: "flex",
  alignItems: "center",
  ...overrides,
});

let picRowSeq = 0;
export const nextPicRowId = () => `pic-row-${Date.now()}-${++picRowSeq}`;

// Reusable "Person In Charge" table used by the customer create/edit page.
// `readOnly` renders it as a plain read-only table (used on the detail page).
export const PersonInChargeTable = ({ pics, onChange, readOnly = false, errors = {} }) => {
  const setPics = (next) => onChange(next);

  const addRow = () => {
    setPics([
      ...pics,
      {
        id: nextPicRowId(),
        primary: pics.length === 0,
        name: "",
        email: "",
        role: "Approver",
        phoneCode: "+62",
        phone: "",
      },
    ]);
  };

  const updateRow = (id, patch) => {
    setPics(pics.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const setPrimary = (id) => {
    setPics(pics.map((row) => ({ ...row, primary: row.id === id })));
  };

  const removeRow = (id) => {
    const wasPrimary = pics.find((row) => row.id === id)?.primary;
    const remaining = pics.filter((row) => row.id !== id);
    if (wasPrimary && remaining.length > 0) {
      remaining[0] = { ...remaining[0], primary: true };
    }
    setPics(remaining);
  };

  const columns = readOnly
    ? [
        { label: "Primary", flex: "0.6" },
        { label: "Name", flex: "1.4" },
        { label: "Email", flex: "1.6" },
        { label: "Role", flex: "1" },
        { label: "Phone", flex: "1.2" },
      ]
    : [
        { label: "Primary", flex: "0.6" },
        { label: "Name", flex: "1.4" },
        { label: "Email", flex: "1.6" },
        { label: "Role", flex: "1" },
        { label: "Phone", flex: "1.2" },
        { label: "Actions", flex: "0.6" },
      ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div
        style={{
          border: "1px solid var(--neutral-line-separator-1)",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            background: "var(--neutral-surface-grey-lighter)",
            borderBottom: "1px solid var(--neutral-line-separator-1)",
          }}
        >
          {columns.map((col, idx) => (
            <div
              key={idx}
              style={cellStyle({
                flex: col.flex,
                height: "44px",
                fontSize: "var(--text-title-3)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--neutral-on-surface-primary)",
              })}
            >
              {col.label}
            </div>
          ))}
        </div>

        {pics.length === 0 ? (
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              fontSize: "var(--text-title-3)",
              color: "var(--neutral-on-surface-tertiary)",
            }}
          >
            No person in charge added yet.
          </div>
        ) : (
          pics.map((row) => (
            <div
              key={row.id}
              style={{
                display: "flex",
                borderBottom: "1px solid var(--neutral-line-separator-1)",
                alignItems: "center",
              }}
            >
              <div style={cellStyle({ flex: columns[0].flex, justifyContent: "center" })}>
                <input
                  type="checkbox"
                  checked={!!row.primary}
                  disabled={readOnly}
                  onChange={() => !readOnly && setPrimary(row.id)}
                  style={{ width: "18px", height: "18px", cursor: readOnly ? "default" : "pointer" }}
                />
              </div>
              <div style={cellStyle({ flex: columns[1].flex })}>
                {readOnly ? (
                  row.name || "-"
                ) : (
                  <InputField
                    value={row.name}
                    onChange={(e) => updateRow(row.id, { name: e.target.value })}
                    placeholder="Input Name"
                    errorState={!!errors[`${row.id}_name`]}
                  />
                )}
              </div>
              <div style={cellStyle({ flex: columns[2].flex })}>
                {readOnly ? (
                  row.email || "-"
                ) : (
                  <InputField
                    value={row.email}
                    onChange={(e) => updateRow(row.id, { email: e.target.value })}
                    placeholder="Input Email"
                  />
                )}
              </div>
              <div style={cellStyle({ flex: columns[3].flex })}>
                {readOnly ? (
                  row.role || "-"
                ) : (
                  <DropdownSelect
                    value={row.role}
                    onChange={(val) => updateRow(row.id, { role: val })}
                    options={ROLE_OPTIONS}
                    placeholder="Select role"
                  />
                )}
              </div>
              <div style={cellStyle({ flex: columns[4].flex })}>
                {readOnly ? (
                  `${row.phoneCode || ""} ${row.phone || ""}`.trim() || "-"
                ) : (
                  <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                    <div style={{ width: "104px" }}>
                      <DropdownSelect
                        value={row.phoneCode}
                        onChange={(val) => updateRow(row.id, { phoneCode: val })}
                        options={COUNTRY_CODE_OPTIONS.map((c) => ({
                          value: c.code,
                          label: `${c.flag} ${c.code}`,
                        }))}
                        placeholder="+62"
                      />
                    </div>
                    <InputField
                      value={row.phone}
                      onChange={(e) => updateRow(row.id, { phone: e.target.value })}
                      placeholder="Phone number"
                    />
                  </div>
                )}
              </div>
              {!readOnly && (
                <div style={cellStyle({ flex: columns[5].flex, justifyContent: "center" })}>
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      padding: "4px",
                    }}
                  >
                    <DeleteIcon size={18} color="var(--status-red-primary)" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {!readOnly && (
        <Button variant="outlined" size="small" leftIcon={AddIcon} onClick={addRow} style={{ alignSelf: "flex-start" }}>
          Add PIC
        </Button>
      )}
    </div>
  );
};

import React from "react";
import { Table } from "../../../../ce-ui";
import { Info } from "../../../../components/icons/Icons.jsx";
import { StatusBadge } from "../../../../components/common/StatusBadge.jsx";
import { DropdownSelect } from "../../../../components/common/DropdownSelect.jsx";
import { PRODUCT_FIELDS_CONFIG, NOT_MAPPED } from "../../mock/productFieldsConfig.js";

// Presentational/controlled: `mapping` and `recommendation` are owned by the
// parent page so the fixed "Normalize and Review" / "Cancel Upload" footer
// buttons (rendered by the page, not this step) can read/act on the same
// state. `recommendation` is a one-time snapshot computed when the file was
// analyzed — it stays fixed even if the user later changes a Source Column
// selection, since it's meant to show what the AI originally matched.
export const MappingStep = ({ headers, mapping, recommendation, onMappingChange, missingRequired = [] }) => {
  const headerOptions = [
    { value: NOT_MAPPED, label: "— Not mapped —" },
    ...headers.map((h) => ({ value: h, label: h })),
  ];

  const data = PRODUCT_FIELDS_CONFIG.map((field) => ({ id: field.key, field }));

  const columns = [
    {
      key: "field",
      header: "Product Field",
      width: 260,
      render: (_, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 0" }}>
          <span style={{ fontSize: "var(--text-title-3)" }}>{row.field.label}</span>
          {row.field.required && <StatusBadge variant="blue-light">Required</StatusBadge>}
        </div>
      ),
    },
    {
      key: "example",
      header: "Example Value",
      width: 200,
      render: (_, row) => (
        <div style={{ padding: "12px 0" }}>
          <span style={{ color: "var(--neutral-on-surface-primary)" }}>{row.field.example}</span>
        </div>
      ),
    },
    {
      key: "sourceColumn",
      header: "Source Column",
      render: (_, row) => {
        const mappedValue = mapping[row.field.key] ?? NOT_MAPPED;
        const isMissing = missingRequired.includes(row.field.key);
        return (
          <div style={{ padding: "8px 0" }}>
            <DropdownSelect
              value={mappedValue}
              options={headerOptions}
              onChange={(val) => onMappingChange(row.field.key, val === "" ? NOT_MAPPED : val)}
              hasError={isMissing}
              placeholder="— Not mapped —"
            />
          </div>
        );
      },
    },
    {
      key: "recommendation",
      header: "AI Recommendation",
      width: 240,
      render: (_, row) => {
        const recommended = recommendation[row.field.key] ?? NOT_MAPPED;
        return (
          <div style={{ padding: "12px 0" }}>
            <span style={{ color: "var(--neutral-on-surface-primary)" }}>
              {recommended === NOT_MAPPED ? "No match found" : `Matched to "${recommended}"`}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "24px 0", flex: 1, minHeight: 0 }}>
      <style>{`
        .pc-mapping-table > div:last-child { display: none; }
        .pc-mapping-table th, .pc-mapping-table td { height: auto !important; }
        .pc-mapping-table th { padding-top: 12px !important; padding-bottom: 12px !important; }
      `}</style>
      <div
        style={{
          background: "var(--feature-brand-container-lighter)",
          borderRadius: "12px",
          padding: "16px 20px",
          margin: "0 24px",
          display: "flex",
          gap: "16px",
          alignItems: "flex-start",
        }}
      >
        <div style={{ marginTop: "2px" }}>
          <Info size={20} color="var(--feature-brand-primary)" />
        </div>
        <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
          Check that each product field matches the correct column from your file. Once everything looks right, continue to normalize and review your data.
        </span>
      </div>

      <div style={{ height: "calc(100vh - 480px)", minHeight: "280px" }}>
        <Table className="pc-mapping-table" columns={columns} data={data} showPagination={false} />
      </div>

      {missingRequired.length > 0 && (
        <div style={{ padding: "12px 16px", borderRadius: "8px", background: "var(--status-red-container)", color: "var(--status-red-primary)", fontSize: "14px" }}>
          Please map all required fields before continuing: {missingRequired.map((k) => PRODUCT_FIELDS_CONFIG.find((f) => f.key === k)?.label).join(", ")}
        </div>
      )}
    </div>
  );
};

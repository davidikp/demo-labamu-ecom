import React, { useEffect, useState } from "react";
import { AddIcon, DeleteIcon } from "../../../../components/icons/Icons.jsx";
import { Table, TextField } from "../../../../ce-ui";
import { Button } from "../../../../components/common/Button.jsx";
import { IconButton } from "../../../../components/common/IconButton.jsx";
import { Checkbox } from "../../../../components/common/Checkbox.jsx";
import { StatusBadge } from "../../../../components/common/StatusBadge.jsx";
import { DropdownSelect } from "../../../../components/common/DropdownSelect.jsx";
import { TableSearchField } from "../../../../components/table/TableSearchField.jsx";
import { TablePaginationFooter } from "../../../../components/table/TablePaginationFooter.jsx";
import { PRODUCT_FIELDS_CONFIG, isRowInvalid, STATUS_OPTIONS } from "../../mock/productFieldsConfig.js";
import { DeleteRowConfirmModal } from "../DeleteRowConfirmModal.jsx";

let blankRowSeq = 0;
const makeBlankRow = () => {
  const row = { __rowId: `blank-${Date.now()}-${++blankRowSeq}` };
  PRODUCT_FIELDS_CONFIG.forEach((f) => { row[f.key] = f.key === "status" ? "Active" : ""; });
  return row;
};

// Per-field column widths (px), as specified by product.
const COLUMN_WIDTH = {
  sku: 160,
  name: 200,
  categoryName: 200,
  status: 160,
  primaryMaterial: 200,
  finishing: 200,
  leadTime: 220,
  sellingPrice: 160,
  weightKg: 160,
  finishedHeightCm: 160,
  finishedWidthCm: 160,
  finishedLengthCm: 160,
  packedHeightCm: 160,
  packedWidthCm: 160,
  packedLengthCm: 160,
  container20ft: 160,
  container40ft: 160,
  container40ftHighCube: 160,
};

// Fields whose values are plain numbers and should show a "," thousands
// separator while editing (raw/stored value stays comma-free).
const NUMBER_FIELD_KEYS = new Set([
  "sellingPrice", "weightKg",
  "finishedHeightCm", "finishedWidthCm", "finishedLengthCm",
  "packedHeightCm", "packedWidthCm", "packedLengthCm",
  "container20ft", "container40ft", "container40ftHighCube",
]);

const formatNumber = (raw) => {
  const str = String(raw ?? "");
  if (!str) return "";
  const [intPart, decPart] = str.split(".");
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart !== undefined ? `${withCommas}.${decPart}` : withCommas;
};

const stripNumberFormatting = (formatted) => {
  const cleaned = String(formatted ?? "").replace(/,/g, "").replace(/[^0-9.]/g, "");
  // Collapse any extra decimal points from stray keystrokes down to one.
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return cleaned;
  return cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
};

// Lead Time is edited as a number + unit pair but stored as a single
// "leadTime" string (e.g. "10 Days") so the rest of the schema/upload
// pipeline is unaffected.
const LEAD_TIME_UNITS = ["Days", "Weeks", "Months"];
const parseLeadTime = (value) => {
  const str = String(value ?? "").trim();
  const match = str.match(/^([\d,.]+)\s*(\w+)?/);
  if (!match) return { amount: "", unit: "Days" };
  const amount = match[1].replace(/,/g, "");
  const rawUnit = (match[2] || "Days").toLowerCase().replace(/s$/, "");
  const unit = LEAD_TIME_UNITS.find((u) => u.toLowerCase().startsWith(rawUnit)) || "Days";
  return { amount, unit };
};
const formatLeadTime = (amount, unit) => (amount ? `${amount} ${unit}` : "");

// Fields whose label carries a trailing "(Unit)" — e.g. "Weight (Kg)" — shown
// as an input suffix instead of baked into the column header.
const UOM_LABEL_PATTERN = /^(.*?)\s*\(([^)]+)\)\s*$/;
const splitLabelUom = (label) => {
  const match = String(label || "").match(UOM_LABEL_PATTERN);
  return match ? { baseLabel: match[1], uom: match[2] } : { baseLabel: label, uom: null };
};

// Presentational — the page-level fixed footer (Cancel Upload / Save as
// Draft / Input Data) reads `rows` directly via the parent's own state, so
// this step only needs to manage the table's local view state (search,
// filter, selection, pagination) and mutate rows via `onRowsChange`.
// `normalizationStats`, if provided, reflects the just-completed simulated
// AI normalization pass (see BulkUploadNewPage) — including any rows that
// were skipped mid-process (e.g. the AI ran out of tokens).
export const ReviewStep = ({ rows, onRowsChange, normalizationStats }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyInvalid, setShowOnlyInvalid] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null); // { ids: [...] } | null
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const invalidCount = rows.filter(isRowInvalid).length;

  const filteredRows = rows.filter((row) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || ["sku", "name", "categoryName"].some((key) => String(row[key] || "").toLowerCase().includes(query));
    const matchesInvalidFilter = !showOnlyInvalid || isRowInvalid(row);
    return matchesSearch && matchesInvalidFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const visibleRows = filteredRows.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, showOnlyInvalid]);

  useEffect(() => {
    // Keep the current page in range whenever the underlying row/filter set
    // shrinks (e.g. after a delete).
    if (currentPage > totalPages) setCurrentPage(totalPages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  const updateCell = (rowId, key, value) => {
    onRowsChange(rows.map((r) => (r.__rowId === rowId ? { ...r, [key]: value } : r)));
  };

  const deleteRows = (ids) => {
    onRowsChange(rows.filter((r) => !ids.includes(r.__rowId)));
    setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
  };

  const addRow = () => {
    onRowsChange([makeBlankRow(), ...rows]);
    // New rows are inserted first — jump back to page 1 so it's visible.
    setSearchQuery("");
    setShowOnlyInvalid(false);
    setCurrentPage(1);
  };

  const data = visibleRows.map((row) => ({ ...row, id: row.__rowId }));

  const stopRowToggle = (e) => e.stopPropagation();

  const columns = [
    ...PRODUCT_FIELDS_CONFIG.map((field) => {
      const { baseLabel, uom } = splitLabelUom(field.label);
      const header = `${field.required ? "* " : ""}${baseLabel}`;
      const width = COLUMN_WIDTH[field.key] || 160;

      if (field.key === "status") {
        return {
          key: field.key,
          header,
          width,
          render: (value, row) => {
            // Status is never actually blank — it defaults to "Active"
            // wherever rows are produced (normalization, new/blank rows,
            // resumed drafts). This is just a last-resort display fallback.
            const displayStatus = row.status || "Active";
            return (
              <div className="status-dropdown" onClick={stopRowToggle} onMouseDown={stopRowToggle}>
                <DropdownSelect
                  size="md"
                  value={displayStatus}
                  placeholder="Select status"
                  options={STATUS_OPTIONS.map((s) => ({ value: s, label: s }))}
                  onChange={(val) => updateCell(row.__rowId, "status", val)}
                />
              </div>
            );
          },
        };
      }

      if (field.key === "leadTime") {
        return {
          key: field.key,
          header,
          width,
          render: (value, row) => {
            const { amount, unit } = parseLeadTime(row.leadTime);
            const isEmptyRequired = !String(row.leadTime || "").trim();
            const commit = (nextAmount, nextUnit) => updateCell(row.__rowId, "leadTime", formatLeadTime(nextAmount, nextUnit));
            return (
              <div onClick={stopRowToggle} onMouseDown={stopRowToggle} style={{ display: "flex", gap: "6px" }}>
                <div style={{ width: "76px", flexShrink: 0 }}>
                  <TextField
                    size="md"
                    value={formatNumber(amount)}
                    onChange={(e) => commit(stripNumberFormatting(e.target.value), unit)}
                    errorText={isEmptyRequired ? "Field cannot be empty" : undefined}
                  />
                </div>
                <div className="lead-time-unit-dropdown" style={{ flex: 1, minWidth: 0 }}>
                  <DropdownSelect
                    size="md"
                    value={unit}
                    options={LEAD_TIME_UNITS.map((u) => ({ value: u, label: u }))}
                    onChange={(val) => commit(amount, val)}
                  />
                </div>
              </div>
            );
          },
        };
      }

      const isNumberField = NUMBER_FIELD_KEYS.has(field.key);
      return {
        key: field.key,
        header,
        width,
        render: (value, row) => {
          const isEmptyRequired = field.required && !String(row[field.key] || "").trim();
          const displayValue = isNumberField ? formatNumber(row[field.key]) : (row[field.key] || "");
          const currencyWarning = field.key === "sellingPrice" ? row.sellingPriceSourceCurrency : null;
          return (
            <div onClick={stopRowToggle} onMouseDown={stopRowToggle}>
              <TextField
                size="md"
                value={displayValue}
                onChange={(e) => updateCell(row.__rowId, field.key, isNumberField ? stripNumberFormatting(e.target.value) : e.target.value)}
                errorText={isEmptyRequired ? "Field cannot be empty" : undefined}
                helperText={!isEmptyRequired && currencyWarning ? `Detected in ${currencyWarning} — value kept as-is, please verify.` : undefined}
                leftIcon={field.key === "sellingPrice" ? "IDR" : undefined}
                rightIcon={uom}
              />
            </div>
          );
        },
      };
    }),
    {
      key: "__actions",
      header: "",
      width: 56,
      render: (_, row) => (
        <div onClick={stopRowToggle} onMouseDown={stopRowToggle}>
          <IconButton icon={DeleteIcon} size="small" color="var(--status-red-primary)" onClick={() => setConfirmDelete({ ids: [row.__rowId] })} />
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "0", flex: 1, minHeight: 0 }}>
      <style>{`
        .pc-review-table table { table-layout: fixed; width: max-content; min-width: 100%; }
        .pc-review-table th, .pc-review-table td { height: auto !important; overflow: hidden; vertical-align: top; }
        .pc-review-table td > div { padding: 8px 0; }
        .pc-review-table td:first-child { padding-top: 16px; }
        .pc-review-table th {
          padding-top: 12px !important;
          padding-bottom: 12px !important;
          /* border-bottom on a sticky <th> can vanish while scrolling under
             border-collapse — a box-shadow paints reliably instead. */
          border-bottom: none !important;
          box-shadow: inset 0 -1px 0 var(--neutral-line-separator-2);
        }
        .pc-review-table { border-radius: var(--radius-card) var(--radius-card) 0 0 !important; }
        .pc-review-table > div:last-child { display: none; }
        .lead-time-unit-dropdown [aria-label="Clear"] { display: none; }
        .status-dropdown [aria-label="Clear"] { display: none; }
      `}</style>

      <div style={{ flex: 1, minHeight: "320px", display: "flex", flexDirection: "column" }}>
        <Table
          className="pc-review-table flex-1 min-h-0"
          columns={columns}
          data={data}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          totalRows={filteredRows.length}
          page={safePage}
          perPage={rowsPerPage}
          onPageChange={setCurrentPage}
          emptyStateTitle="No rows found"
          emptyStateDescription="Try adjusting your search or the needs-attention filter."
          toolbar={
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                    <Checkbox checked={showOnlyInvalid} onChange={(checked) => setShowOnlyInvalid(checked)} />
                    Show only products that need attention{invalidCount > 0 ? ` (${invalidCount})` : ""}
                  </label>
                  {normalizationStats && (
                    <StatusBadge variant={normalizationStats.skipped > 0 ? "yellow-light" : "green-light"}>
                      {normalizationStats.normalized} of {normalizationStats.total} rows normalized by AI
                      {normalizationStats.skipped > 0 ? ` (${normalizationStats.skipped} skipped)` : ""}
                    </StatusBadge>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <TableSearchField value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by SKU, Name, or Category" width="320px" />
                  <Button variant="outlined" leftIcon={AddIcon} onClick={addRow}>New Row</Button>
                </div>
              </div>

              {selectedIds.length > 0 && (
                <div
                  style={{
                    margin: "12px -20px -12px",
                    padding: "12px 20px",
                    background: "var(--feature-brand-container)",
                    borderTop: "1px solid var(--neutral-line-separator-2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: "14px", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
                    {selectedIds.length} Selected
                  </span>
                  <Button variant="outlined" leftIcon={DeleteIcon} onClick={() => setConfirmDelete({ ids: selectedIds })} style={{ borderColor: "var(--status-red-primary)", color: "var(--status-red-primary)" }}>
                    Delete
                  </Button>
                </div>
              )}
            </div>
          }
        />
        {filteredRows.length > 0 && (
          <TablePaginationFooter
            totalRows={filteredRows.length}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(n) => { setRowsPerPage(n); setCurrentPage(1); }}
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            style={{
              background: "var(--neutral-surface-primary)",
              borderBottomLeftRadius: "var(--radius-card)",
              borderBottomRightRadius: "var(--radius-card)",
              border: "1px solid var(--neutral-line-separator-1)",
              borderTop: "none",
            }}
          />
        )}
      </div>

      <DeleteRowConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        count={confirmDelete?.ids?.length || 1}
        onConfirm={() => confirmDelete && deleteRows(confirmDelete.ids)}
      />
    </div>
  );
};

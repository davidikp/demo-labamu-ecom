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
import {
  MATERIAL_FIELDS_CONFIG,
  isRowInvalid,
  rowNeedsAttention,
  ABC_CLASSIFICATION_OPTIONS,
  MATERIAL_TYPE_OPTIONS,
} from "../../mock/materialFieldsConfig.js";
import { DeleteRowConfirmModal } from "../DeleteRowConfirmModal.jsx";

let blankRowSeq = 0;
const makeBlankRow = () => {
  const row = { __rowId: `blank-${Date.now()}-${++blankRowSeq}` };
  MATERIAL_FIELDS_CONFIG.forEach((f) => { row[f.key] = ""; });
  return row;
};

// Per-field column widths (px).
const COLUMN_WIDTH = {
  sku: 180,
  name: 220,
  category: 200,
  abcClassification: 200,
  materialType: 220,
  uom: 160,
};

const MATERIAL_TYPE_LABEL = {
  Raw: "Raw Material",
  SemiFinished: "Semi-Finished Material",
  Finished: "Finished Material",
};

// Presentational — the page-level fixed footer (Cancel Upload / Save as
// Draft / Input Data) reads `rows` directly via the parent's own state, so
// this step only needs to manage the table's local view state (search,
// filter, selection, pagination) and mutate rows via `onRowsChange`.
// `normalizationStats`, if provided, reflects the just-completed simulated
// AI normalization pass (see MaterialUploadNewPage) — including any rows
// that were skipped mid-process (e.g. the AI ran out of tokens).
export const ReviewStep = ({ rows, onRowsChange, normalizationStats }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyInvalid, setShowOnlyInvalid] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null); // { ids: [...] } | null
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const attentionCount = rows.filter(rowNeedsAttention).length;

  const filteredRows = rows.filter((row) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || ["sku", "name", "category"].some((key) => String(row[key] || "").toLowerCase().includes(query));
    const matchesInvalidFilter = !showOnlyInvalid || rowNeedsAttention(row);
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
    ...MATERIAL_FIELDS_CONFIG.map((field) => {
      const header = `${field.required ? "* " : ""}${field.label}`;
      const width = COLUMN_WIDTH[field.key] || 180;

      if (field.key === "abcClassification") {
        return {
          key: field.key,
          header,
          width,
          render: (value, row) => {
            const isUnrecognized = !!row.abcClassification && !ABC_CLASSIFICATION_OPTIONS.includes(row.abcClassification);
            const isEmpty = !String(row.abcClassification || "").trim();
            return (
              <div className="abc-dropdown" onClick={stopRowToggle} onMouseDown={stopRowToggle}>
                <DropdownSelect
                  size="md"
                  value={isUnrecognized ? undefined : row.abcClassification || undefined}
                  placeholder="Select classification"
                  options={ABC_CLASSIFICATION_OPTIONS.map((v) => ({ value: v, label: v }))}
                  onChange={(val) => updateCell(row.__rowId, "abcClassification", val)}
                  state={isUnrecognized || isEmpty ? "error" : "default"}
                  errorText={isUnrecognized || isEmpty ? "Field cannot be empty" : undefined}
                />
              </div>
            );
          },
        };
      }

      if (field.key === "materialType") {
        return {
          key: field.key,
          header,
          width,
          render: (value, row) => {
            const isUnrecognized = !!row.materialType && !MATERIAL_TYPE_OPTIONS.includes(row.materialType);
            const isEmpty = !String(row.materialType || "").trim();
            return (
              <div className="material-type-dropdown" onClick={stopRowToggle} onMouseDown={stopRowToggle}>
                <DropdownSelect
                  size="md"
                  value={isUnrecognized ? undefined : row.materialType || undefined}
                  placeholder="Select material type"
                  options={MATERIAL_TYPE_OPTIONS.map((v) => ({ value: v, label: MATERIAL_TYPE_LABEL[v] || v }))}
                  onChange={(val) => updateCell(row.__rowId, "materialType", val)}
                  state={isUnrecognized || isEmpty ? "error" : "default"}
                  errorText={isUnrecognized || isEmpty ? "Field cannot be empty" : undefined}
                />
              </div>
            );
          },
        };
      }

      return {
        key: field.key,
        header,
        width,
        render: (value, row) => {
          const isEmptyRequired = field.required && !String(row[field.key] || "").trim();
          return (
            <div onClick={stopRowToggle} onMouseDown={stopRowToggle}>
              <TextField
                size="md"
                value={row[field.key] || ""}
                onChange={(e) => updateCell(row.__rowId, field.key, e.target.value)}
                errorText={isEmptyRequired ? "Field cannot be empty" : undefined}
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
        .mc-review-table table { table-layout: fixed; width: max-content; min-width: 100%; }
        .mc-review-table th, .mc-review-table td { height: auto !important; overflow: hidden; vertical-align: top; }
        .mc-review-table td > div { padding: 8px 0; }
        /* Checkbox + delete-icon columns don't have per-field error text
           pushing their row taller, so top-aligning them (like every other
           cell) would drift out of true vertical center once a sibling cell
           grows for a helper/error message — true middle alignment tracks
           the row's actual height regardless. */
        .mc-review-table td:first-child, .mc-review-table td:last-child { vertical-align: middle !important; }
        .mc-review-table th {
          padding-top: 12px !important;
          padding-bottom: 12px !important;
          /* border-bottom on a sticky <th> can vanish while scrolling under
             border-collapse — a box-shadow paints reliably instead. */
          border-bottom: none !important;
          box-shadow: inset 0 -1px 0 var(--neutral-line-separator-2);
        }
        .mc-review-table { border-radius: var(--radius-card) var(--radius-card) 0 0 !important; }
        .mc-review-table > div:last-child { display: none; }
        .abc-dropdown [aria-label="Clear"] { display: none; }
        .material-type-dropdown [aria-label="Clear"] { display: none; }
      `}</style>

      <div style={{ flex: 1, minHeight: "320px", display: "flex", flexDirection: "column" }}>
        <Table
          className="mc-review-table flex-1 min-h-0"
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
                    Show only materials that need attention{attentionCount > 0 ? ` (${attentionCount})` : ""}
                  </label>
                  {normalizationStats && (
                    <>
                      <div style={{ width: "1px", height: "20px", background: "var(--neutral-line-separator-2)" }} />
                      <StatusBadge variant={normalizationStats.skipped > 0 ? "yellow-light" : "green-light"}>
                        {normalizationStats.normalized} of {normalizationStats.total} rows normalized by AI
                        {normalizationStats.skipped > 0 ? ` (${normalizationStats.skipped} skipped)` : ""}
                      </StatusBadge>
                    </>
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

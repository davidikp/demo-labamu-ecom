import React, { useEffect, useState } from "react";
import { AddIcon, DeleteIcon } from "../../../../components/icons/Icons.jsx";
import { Table, TextField } from "../../../../ce-ui";
import { Button } from "../../../../components/common/Button.jsx";
import { IconButton } from "../../../../components/common/IconButton.jsx";
import { Checkbox } from "../../../../components/common/Checkbox.jsx";
import { StatusBadge } from "../../../../components/common/StatusBadge.jsx";
import { TableSearchField } from "../../../../components/table/TableSearchField.jsx";
import { PRODUCT_FIELDS_CONFIG, isRowInvalid } from "../../mock/productFieldsConfig.js";
import { DeleteRowConfirmModal } from "../DeleteRowConfirmModal.jsx";

let blankRowSeq = 0;
const makeBlankRow = () => {
  const row = { __rowId: `blank-${Date.now()}-${++blankRowSeq}` };
  PRODUCT_FIELDS_CONFIG.forEach((f) => { row[f.key] = ""; });
  return row;
};

// Per-field column widths (px), as specified by product.
const COLUMN_WIDTH = {
  sku: 120,
  name: 200,
  categoryName: 200,
  primaryMaterial: 200,
  finishing: 200,
  leadTime: 160,
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

// Presentational — the page-level fixed footer (Cancel Upload / Save as
// Draft / Input Data) reads `rows` directly via the parent's own state, so
// this step only needs to manage the table's local view state (search,
// filter, selection, pagination) and mutate rows via `onRowsChange`.
export const ReviewStep = ({ rows, onRowsChange }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyInvalid, setShowOnlyInvalid] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null); // { ids: [...] } | null
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const invalidCount = rows.filter(isRowInvalid).length;

  const filteredRows = rows.filter((row) => {
    const matchesSearch = !searchQuery || Object.values(row).some((v) => String(v || "").toLowerCase().includes(searchQuery.toLowerCase()));
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
    ...PRODUCT_FIELDS_CONFIG.map((field) => ({
      key: field.key,
      header: `${field.label}${field.required ? " *" : ""}`,
      width: COLUMN_WIDTH[field.key] || 160,
      render: (value, row) => {
        const isEmptyRequired = field.required && !String(row[field.key] || "").trim();
        return (
          <div onClick={stopRowToggle} onMouseDown={stopRowToggle}>
            <TextField
              size="md"
              value={row[field.key] || ""}
              onChange={(e) => updateCell(row.__rowId, field.key, e.target.value)}
              state={isEmptyRequired ? "error" : "default"}
            />
          </div>
        );
      },
    })),
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
        .pc-review-table th, .pc-review-table td { overflow: hidden; }
      `}</style>
      <div style={{ height: "calc(100vh - 400px)", minHeight: "320px" }}>
        <Table
          className="pc-review-table"
          columns={columns}
          data={data}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          totalRows={filteredRows.length}
          page={safePage}
          perPage={rowsPerPage}
          onPageChange={setCurrentPage}
          filters={{
            rowsPerPage: { onChange: (n) => { setRowsPerPage(n); setCurrentPage(1); } },
          }}
          emptyStateTitle="No rows found"
          emptyStateDescription="Try adjusting your search or invalid-row filter."
          toolbar={
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: "12px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                  <Checkbox checked={showOnlyInvalid} onChange={(checked) => setShowOnlyInvalid(checked)} />
                  Show only invalid rows
                </label>
                {invalidCount > 0 && (
                  <StatusBadge variant="red-light">{invalidCount} invalid row{invalidCount > 1 ? "s" : ""}</StatusBadge>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {selectedIds.length > 0 && (
                  <Button variant="outlined" leftIcon={DeleteIcon} onClick={() => setConfirmDelete({ ids: selectedIds })} style={{ borderColor: "var(--status-red-primary)", color: "var(--status-red-primary)" }}>
                    Delete selected ({selectedIds.length})
                  </Button>
                )}
                <TableSearchField value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search rows" width="280px" />
                <Button variant="outlined" leftIcon={AddIcon} onClick={addRow}>New Row</Button>
              </div>
            </div>
          }
        />
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

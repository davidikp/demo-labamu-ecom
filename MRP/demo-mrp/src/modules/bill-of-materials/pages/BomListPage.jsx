import React, { useEffect, useState } from "react";
import { AddIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { FilterMenu } from "../../../components/molecules/FilterMenu.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { getBoms } from "../mock/bomMocks.js";
import { bomStatusBadgeVariant } from "../utils/bomUtils.js";
import { cellStyle } from "../components/BomShared.jsx";

const STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

export const BomListPage = ({ onNavigate, t }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatuses, setFilterStatuses] = useState(["Active"]);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const tableColumns = [
    { label: "BOM Name", flex: "2" },
    { label: "Version", flex: "0.8" },
    { label: "Created at", flex: "1" },
    { label: "Updated at", flex: "1" },
    { label: "Status", flex: "1" },
  ];

  const allRows = getBoms();

  const filteredRows = allRows.filter((row) => {
    const matchesStatus = filterStatuses.length === 0 || filterStatuses.includes(row.status);
    const matchesSearch = !searchQuery || row.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const visibleRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatuses.join("|"), searchQuery, rowsPerPage]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  return (
    <div
      style={{
        height: "calc(100vh - 64px)",
        padding: "24px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "var(--text-big-title)",
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          {t("bill_of_materials.title", "Bill of Materials")}
        </h1>
        <Button variant="filled" leftIcon={AddIcon} onClick={() => onNavigate("create")}>
          {t("bill_of_materials.new", "New BOM")}
        </Button>
      </div>

      <div
        style={{
          background: "var(--neutral-surface-primary)",
          borderRadius: "var(--radius-card)",
          border: "1px solid var(--neutral-line-separator-1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--neutral-line-separator-2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              position: "relative",
            }}
          >
            <FilterMenu
              label="Status"
              multiple
              searchable={false}
              options={STATUS_OPTIONS}
              values={filterStatuses}
              onChangeMultiple={setFilterStatuses}
            />
          </div>

          <TableSearchField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search BOM Name..."
            width="360px"
          />
        </div>

        <div style={{ overflowX: "auto", overflowY: "auto", width: "100%" }}>
          <div style={{ minWidth: "100%", width: "100%", display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                background: "var(--neutral-surface-primary)",
                borderBottom: "1px solid var(--neutral-line-separator-1)",
                position: "sticky",
                top: 0,
                zIndex: 20,
              }}
            >
              {tableColumns.map((col, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: col.flex,
                    minWidth: 0,
                    height: "49px",
                    padding: "0 12px",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "var(--text-title-3)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--neutral-on-surface-primary)",
                  }}
                >
                  {col.label}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", flex: filteredRows.length === 0 ? 1 : "0 0 auto" }}>
              {visibleRows.map((row) => (
                <div
                  key={row.id}
                  onClick={() => onNavigate("detail", row)}
                  style={{
                    display: "flex",
                    background: "var(--neutral-surface-primary)",
                    borderBottom: "1px solid var(--neutral-line-separator-1)",
                    transition: "background 0.12s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--neutral-surface-primary)")}
                >
                  <div style={cellStyle({ flex: tableColumns[0].flex, color: "var(--feature-brand-primary)", fontWeight: "var(--font-weight-medium)" })}>
                    {row.name}
                  </div>
                  <div style={cellStyle({ flex: tableColumns[1].flex })}>{row.version}</div>
                  <div style={cellStyle({ flex: tableColumns[2].flex })}>{row.createdAt}</div>
                  <div style={cellStyle({ flex: tableColumns[3].flex })}>{row.updatedAt}</div>
                  <div style={cellStyle({ flex: tableColumns[4].flex })}>
                    <StatusBadge variant={bomStatusBadgeVariant(row.status)}>{row.status}</StatusBadge>
                  </div>
                </div>
              ))}

              {filteredRows.length === 0 ? (
                <div
                  style={{
                    flex: 1,
                    padding: "32px",
                    textAlign: "center",
                    color: "var(--neutral-on-surface-tertiary)",
                    fontSize: "var(--text-title-3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  No bill of materials found.
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <TablePaginationFooter
          totalRows={filteredRows.length}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={setRowsPerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

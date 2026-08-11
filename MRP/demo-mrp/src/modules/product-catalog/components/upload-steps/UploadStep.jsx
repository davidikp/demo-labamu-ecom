import React from "react";
import { CloudUploadIcon } from "../../../../components/icons/Icons.jsx";
import { PRODUCT_FIELDS_CONFIG } from "../../mock/productFieldsConfig.js";
import { UploadDescriptionCard } from "../../../purchase-order/components/detail/shared/PoDetailSharedComponents.jsx";

// Naive CSV line/field splitter — good enough for the demo's plain-JS
// constraint (no papaparse/xlsx). Handles simple double-quoted fields that
// may contain commas; anything more exotic (embedded newlines inside a
// quoted field, escaped quotes) is out of scope.
const parseCsvLine = (line) => {
  const cells = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
};

const parseCsvText = (text) => {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = cells[idx] ?? "";
    });
    return row;
  });
  return { headers, rows };
};

// .xlsx/.xls can't be parsed client-side without a library, so we simulate a
// plausible parsed result (canned headers/rows built from the product field
// examples) so the rest of the wizard flow still works end-to-end.
const buildSimulatedXlsxData = () => {
  const headers = PRODUCT_FIELDS_CONFIG.filter((f) => f.key !== "sku").map((f) => f.label);
  const rowCount = 6;
  const rows = Array.from({ length: rowCount }).map((_, i) => {
    const row = {};
    PRODUCT_FIELDS_CONFIG.filter((f) => f.key !== "sku").forEach((f) => {
      row[f.label] = f.key === "name" ? `${f.example} ${i + 1}` : f.example;
    });
    return row;
  });
  return { headers, rows };
};

// Runs the (simulated, ~3.5s) file analysis and calls back with
// (headers, rows, fileName). Exported so the parent page can drive this from
// its own fixed "Analyze File" footer button.
export const analyzeFile = (file, onDone) => {
  const isCsv = /\.csv$/i.test(file.name);

  setTimeout(() => {
    if (isCsv) {
      const reader = new FileReader();
      reader.onload = () => {
        const { headers, rows } = parseCsvText(String(reader.result || ""));
        onDone(headers, rows, file.name);
      };
      reader.onerror = () => {
        const { headers, rows } = buildSimulatedXlsxData();
        onDone(headers, rows, file.name);
      };
      reader.readAsText(file);
    } else {
      // .xlsx / .xls — simulated parse (see buildSimulatedXlsxData above).
      const { headers, rows } = buildSimulatedXlsxData();
      onDone(headers, rows, file.name);
    }
  }, 3500);
};

export const UploadStep = ({ selectedFile, onFileSelected, isAnalyzing }) => {
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
  };

  if (isAnalyzing) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", padding: "80px 24px", flex: 1, minHeight: 0, height: "100%" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid var(--neutral-line-separator-2)",
            borderTopColor: "var(--feature-brand-primary)",
            borderRadius: "50%",
            animation: "pc-spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes pc-spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>
          Analyzing your file...
        </span>
      </div>
    );
  }

  const hasFile = !!selectedFile;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "40px 24px", maxWidth: "560px", margin: "0 auto", width: "100%", flex: 1, minHeight: 0 }}>
      <div
        style={{
          flex: 1,
          minHeight: "220px",
          border: `2px dashed ${hasFile ? "var(--neutral-line-separator-2)" : "var(--feature-brand-primary)"}`,
          borderRadius: "24px",
          background: hasFile ? "var(--neutral-surface-grey-lighter)" : "var(--neutral-surface-primary)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          cursor: hasFile ? "not-allowed" : "pointer",
        }}
        onClick={() => !hasFile && document.getElementById("pc-upload-file-input").click()}
      >
        <input
          id="pc-upload-file-input"
          type="file"
          accept=".csv,.xlsx,.xls"
          style={{ display: "none" }}
          onChange={handleFileChange}
          disabled={hasFile}
        />
        <CloudUploadIcon size={48} color={hasFile ? "var(--neutral-on-surface-tertiary)" : "var(--feature-brand-primary)"} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center" }}>
          <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-tertiary)" }}>Allowed formats (.csv, .xlsx, .xls)</span>
          <div style={{ marginTop: "4px", fontSize: "14px", fontWeight: "var(--font-weight-bold)", color: hasFile ? "var(--neutral-on-surface-tertiary)" : "var(--neutral-on-surface-primary)" }}>
            {hasFile ? (
              "File selected below"
            ) : (
              <>Drag file or <span style={{ color: "var(--feature-brand-primary)" }}>browse file</span></>
            )}
          </div>
        </div>
      </div>

      {selectedFile && (
        <UploadDescriptionCard
          file={selectedFile}
          onRemove={() => onFileSelected(null)}
          hideDescriptionField
        />
      )}
    </div>
  );
};

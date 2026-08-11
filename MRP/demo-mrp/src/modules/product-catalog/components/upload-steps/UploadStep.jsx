import React from "react";
import { DownloadIcon } from "../../../../components/icons/Icons.jsx";
import { Button } from "../../../../components/common/Button.jsx";
import { DocumentUploadField } from "../../../../ce-ui";
import { PRODUCT_FIELDS_CONFIG } from "../../mock/productFieldsConfig.js";

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

export const UploadStep = ({ selectedFile, onFileSelected, isAnalyzing, error, onDownloadTemplate }) => {
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

  const uploadedDocs = selectedFile
    ? [{ id: "pc-upload-file", file: selectedFile, name: selectedFile.name, description: "" }]
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "24px", width: "100%", flex: 1, minHeight: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
            Import Products
          </span>
          <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-secondary)" }}>
            Upload your product file in any spreadsheet format. We'll map and prepare the data for your product catalog.
          </span>
        </div>
        <Button variant="outlined" leftIcon={DownloadIcon} onClick={onDownloadTemplate} style={{ flexShrink: 0 }}>
          Download Template
        </Button>
      </div>

      <DocumentUploadField
        files={uploadedDocs}
        maxFiles={1}
        maxSizeMB={25}
        accept=".csv,.xlsx,.xls"
        showDescription={false}
        formatsHint="Allowed formats (.csv, .xlsx, .xls)"
        error={error}
        onAdd={(files) => files[0] && onFileSelected(files[0])}
        onRemove={() => onFileSelected(null)}
      />
    </div>
  );
};

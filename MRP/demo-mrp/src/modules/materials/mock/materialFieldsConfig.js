// Material field schema used to drive the Bulk Upload wizard's Mapping and
// Review steps. `synonyms` are lowercase, normalized (no spaces/punctuation)
// alternate header spellings used for fuzzy auto-matching against an
// uploaded file's column headers. Mirrors
// product-catalog/mock/productFieldsConfig.js's shape/logic, scoped to
// materials' actual catalog fields (no price/lead-time/packaging — those
// don't exist on the material record).
export const MATERIAL_FIELDS_CONFIG = [
  {
    key: "sku",
    label: "SKU",
    required: false,
    example: "ALU-SH-2MM",
    synonyms: ["sku", "materialsku", "code", "materialcode", "itemcode"],
  },
  {
    key: "name",
    label: "Material Name",
    required: true,
    example: "Aluminium Sheet 2mm",
    synonyms: ["name", "materialname", "itemname", "title"],
  },
  {
    key: "category",
    label: "Category",
    required: true,
    example: "Raw Material",
    synonyms: ["category", "materialcategory", "categoryname"],
  },
  {
    key: "abcClassification",
    label: "ABC Classification",
    required: true,
    example: "A",
    synonyms: ["abcclassification", "abcclass", "abc", "classification"],
  },
  {
    key: "materialType",
    label: "Material Type",
    required: true,
    example: "Raw",
    synonyms: ["materialtype", "type", "materialkind"],
  },
  {
    key: "uom",
    label: "Unit of Measurement (UOM)",
    required: true,
    example: "Sheet",
    synonyms: ["uom", "unit", "unitofmeasurement", "unitofmeasure"],
  },
];

export const REQUIRED_MATERIAL_FIELD_KEYS = MATERIAL_FIELDS_CONFIG.filter((f) => f.required).map((f) => f.key);

// A row is invalid when any required field is blank — used by the Review
// step's table (red-outline cells) and by the page-level "Input Data" footer
// button (disabled while any row is invalid).
export const isRowInvalid = (row) => REQUIRED_MATERIAL_FIELD_KEYS.some((key) => !String(row[key] || "").trim());

export const NOT_MAPPED = "__not_mapped__";

export const ABC_CLASSIFICATION_OPTIONS = ["A", "B", "C"];
export const MATERIAL_TYPE_OPTIONS = ["Raw", "SemiFinished", "Finished"];

// Best-effort normalization for ABC Classification — accepts the bare letter
// or a few common longer spellings from an uploaded file and maps them to the
// canonical single-letter value. Anything unrecognized is left as-is so it
// still surfaces as flagged (see hasUnrecognizedAbcClassification below) for
// manual fixing.
const ABC_ALIASES = {
  a: "A", "a-highvalue": "A", high: "A", highvalue: "A",
  b: "B", "b-mediumvalue": "B", medium: "B", mediumvalue: "B",
  c: "C", "c-lowvalue": "C", low: "C", lowvalue: "C",
};
const normalizeForAlias = (s) => String(s || "").trim().toLowerCase().replace(/[^a-z]/g, "");
export const normalizeAbcValue = (raw) => {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return "";
  const mapped = ABC_ALIASES[normalizeForAlias(trimmed)];
  return mapped || trimmed;
};
const hasUnrecognizedAbcClassification = (row) => {
  const value = String(row.abcClassification || "").trim();
  return !!value && !ABC_CLASSIFICATION_OPTIONS.includes(value);
};

// Same idea for Material Type — maps common spellings ("Raw Material", "Semi
// Finished", etc.) to the canonical Raw/SemiFinished/Finished values.
const MATERIAL_TYPE_ALIASES = {
  raw: "Raw", rawmaterial: "Raw",
  semifinished: "SemiFinished", semifinishedmaterial: "SemiFinished", semi: "SemiFinished",
  finished: "Finished", finishedmaterial: "Finished",
};
export const normalizeMaterialTypeValue = (raw) => {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return "";
  const mapped = MATERIAL_TYPE_ALIASES[normalizeForAlias(trimmed)];
  return mapped || trimmed;
};
const hasUnrecognizedMaterialType = (row) => {
  const value = String(row.materialType || "").trim();
  return !!value && !MATERIAL_TYPE_OPTIONS.includes(value);
};

// Broader than `isRowInvalid` — also flags rows that skipped the AI
// normalization pass (see `__skippedNormalization`, set by the wizard page
// when the "Skip Process" control or an interrupted normalization leaves a
// row un-cleaned) or have an ABC Classification/Material Type value we don't
// recognize. These rows aren't necessarily missing any required field (so
// they don't block import), but still need a human look before the user can
// be confident in them. Used by the Review step's "needs attention"
// filter/counter; import-blocking logic keeps using `isRowInvalid` as-is.
export const rowNeedsAttention = (row) =>
  isRowInvalid(row) ||
  !!row.__skippedNormalization ||
  hasUnrecognizedAbcClassification(row) ||
  hasUnrecognizedMaterialType(row);

// Strips everything except letters/digits so headers like "Unit of
// Measurement (UOM)", "uom", "Unit-Of-Measurement" all normalize the same.
const normalizeHeader = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

// Fuzzy-matches each material field against the parsed file's headers using
// synonym/label equality or substring containment on normalized strings.
// Used both to pre-fill the Source Column mapping and to compute the fixed
// AI Recommendation shown in the Mapping step (which does NOT change if the
// user later overrides the Source Column selection).
export const autoMatchHeaders = (headers) => {
  const normalizedHeaders = (headers || []).map((h) => ({ raw: h, norm: normalizeHeader(h) }));
  const result = {};

  MATERIAL_FIELDS_CONFIG.forEach((field) => {
    const candidates = [normalizeHeader(field.label), ...field.synonyms.map(normalizeHeader)];
    let bestMatch = null;

    // Exact match first.
    for (const h of normalizedHeaders) {
      if (candidates.includes(h.norm)) {
        bestMatch = h.raw;
        break;
      }
    }
    // Fall back to substring containment either direction.
    if (!bestMatch) {
      for (const h of normalizedHeaders) {
        if (candidates.some((c) => c && (h.norm.includes(c) || c.includes(h.norm)))) {
          bestMatch = h.raw;
          break;
        }
      }
    }
    result[field.key] = bestMatch || NOT_MAPPED;
  });

  return result;
};

// Shared row-normalization logic used by the simulated background
// "Normalizing Data" processing timer, building normalized rows from the raw
// parsed rows + chosen field mapping once the delay ends.
export const normalizeMappedRows = (rawRows, mapping) => {
  const rows = rawRows || [];
  const fieldMapping = mapping || {};
  return rows.map((row, idx) => {
    const normalized = { __rowId: `row-${idx}-${Date.now()}` };
    MATERIAL_FIELDS_CONFIG.forEach((field) => {
      const sourceHeader = fieldMapping[field.key];
      const rawValue = sourceHeader && sourceHeader !== NOT_MAPPED ? row[sourceHeader] ?? "" : "";
      if (field.key === "abcClassification") {
        normalized[field.key] = normalizeAbcValue(rawValue);
      } else if (field.key === "materialType") {
        normalized[field.key] = normalizeMaterialTypeValue(rawValue);
      } else {
        normalized[field.key] = rawValue;
      }
    });
    return normalized;
  });
};

// Triggers a browser download of a blank CSV template — one column per
// material field, headers only — so users have a known-good starting point
// instead of guessing at the expected structure.
export const downloadMaterialTemplateCsv = () => {
  const headers = MATERIAL_FIELDS_CONFIG.map((f) => f.label);
  const exampleRow = MATERIAL_FIELDS_CONFIG.map((f) => f.example);
  const csvLines = [headers.join(","), exampleRow.join(",")];
  const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "labamu_material_upload_template.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Builds the Review-ready rows for a normalization pass, simulating the AI
// occasionally leaving the last `skipCount` rows un-cleaned — either because
// it randomly "ran out of tokens" mid-run, or because the user hit "Skip
// Process" partway through. Skipped rows are still mapped (so nothing goes
// missing) but flagged with `__skippedNormalization` so the Review step's
// "needs attention" filter picks them up even when otherwise valid.
export const buildNormalizationResult = (rawRows, mapping, skipCount = 0) => {
  const normalizedAll = normalizeMappedRows(rawRows, mapping);
  const effectiveSkip = Math.min(skipCount, normalizedAll.length);
  const skipStartIdx = normalizedAll.length - effectiveSkip;
  const rows = normalizedAll.map((row, idx) =>
    effectiveSkip > 0 && idx >= skipStartIdx ? { ...row, __skippedNormalization: true } : row
  );
  return {
    rows,
    stats: { total: normalizedAll.length, normalized: normalizedAll.length - effectiveSkip, skipped: effectiveSkip },
  };
};

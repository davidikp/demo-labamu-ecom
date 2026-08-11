// Product field schema used to drive the Bulk Upload wizard's Mapping and
// Review steps. `synonyms` are lowercase, normalized (no spaces/punctuation)
// alternate header spellings used for fuzzy auto-matching against an
// uploaded file's column headers.
export const PRODUCT_FIELDS_CONFIG = [
  {
    key: "sku",
    label: "SKU",
    required: false,
    example: "WBD-TEAK-120",
    synonyms: ["sku", "productsku", "code", "productcode", "itemcode"],
  },
  {
    key: "name",
    label: "Name",
    required: true,
    example: "Mountain Bike 2",
    synonyms: ["name", "productname", "itemname", "title"],
  },
  {
    key: "categoryName",
    label: "Category Name",
    required: true,
    example: "Sport",
    synonyms: ["categoryname", "category", "productcategory"],
  },
  {
    key: "leadTime",
    label: "Lead Time",
    required: true,
    example: "10 Days",
    synonyms: ["leadtime", "productionleadtime", "leadtimedays"],
  },
  {
    key: "sellingPrice",
    label: "Selling Price",
    required: true,
    example: "20000",
    synonyms: ["sellingprice", "price", "unitprice", "sellprice"],
  },
  {
    key: "primaryMaterial",
    label: "Primary Material",
    required: false,
    example: "Aluminium Alloy",
    synonyms: ["primarymaterial", "material", "mainmaterial"],
  },
  {
    key: "finishing",
    label: "Finishing",
    required: false,
    example: "Powder Coating",
    synonyms: ["finishing", "finish", "surfacefinish"],
  },
  {
    key: "weightKg",
    label: "Weight (Kg)",
    required: false,
    example: "12.5",
    synonyms: ["weightkg", "weight", "netweight"],
  },
  {
    key: "finishedHeightCm",
    label: "Finished Height (cm)",
    required: false,
    example: "110",
    synonyms: ["finishedheightcm", "finishedheight", "height"],
  },
  {
    key: "finishedWidthCm",
    label: "Finished Width (cm)",
    required: false,
    example: "60",
    synonyms: ["finishedwidthcm", "finishedwidth", "width"],
  },
  {
    key: "finishedLengthCm",
    label: "Finished Length (cm)",
    required: false,
    example: "180",
    synonyms: ["finishedlengthcm", "finishedlength", "length"],
  },
  {
    key: "packedHeightCm",
    label: "Packed Height (cm)",
    required: false,
    example: "30",
    synonyms: ["packedheightcm", "packedheight", "boxheight"],
  },
  {
    key: "packedWidthCm",
    label: "Packed Width (cm)",
    required: false,
    example: "70",
    synonyms: ["packedwidthcm", "packedwidth", "boxwidth"],
  },
  {
    key: "packedLengthCm",
    label: "Packed Length (cm)",
    required: false,
    example: "190",
    synonyms: ["packedlengthcm", "packedlength", "boxlength"],
  },
  {
    key: "container20ft",
    label: "Container 20ft (Qty)",
    required: false,
    example: "180",
    synonyms: ["container20ft", "20ftcontainer", "qty20ft"],
  },
  {
    key: "container40ft",
    label: "Container 40ft (Qty)",
    required: false,
    example: "380",
    synonyms: ["container40ft", "40ftcontainer", "qty40ft"],
  },
  {
    key: "container40ftHighCube",
    label: "Container 40ft High Cube (Qty)",
    required: false,
    example: "440",
    synonyms: ["container40fthighcube", "40fthighcube", "hc40ft", "qty40fthc"],
  },
];

export const REQUIRED_PRODUCT_FIELD_KEYS = PRODUCT_FIELDS_CONFIG.filter((f) => f.required).map((f) => f.key);

// A row is invalid when any required field is blank — used by the Review
// step's table (red-outline cells) and by the page-level "Input Data" footer
// button (disabled while any row is invalid).
export const isRowInvalid = (row) => REQUIRED_PRODUCT_FIELD_KEYS.some((key) => !String(row[key] || "").trim());

export const NOT_MAPPED = "__not_mapped__";

// Strips everything except letters/digits so headers like "Weight (Kg)",
// "weight_kg", "Weight-KG" and "weight kg" all normalize to the same key.
const normalizeHeader = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

// Fuzzy-matches each product field against the parsed file's headers using
// synonym/label equality or substring containment on normalized strings.
// Used both to pre-fill the Source Column mapping and to compute the fixed
// AI Recommendation shown in the Mapping step (which does NOT change if the
// user later overrides the Source Column selection).
export const autoMatchHeaders = (headers) => {
  const normalizedHeaders = (headers || []).map((h) => ({ raw: h, norm: normalizeHeader(h) }));
  const result = {};

  PRODUCT_FIELDS_CONFIG.forEach((field) => {
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

// Shared row-normalization logic used both by MappingStep (kept for
// reference/back-compat) and by the simulated background "Mapping"
// processing timer in bulkUploadsStore.js, which needs to build normalized
// rows from the raw parsed rows + chosen field mapping once the delay ends.
export const normalizeMappedRows = (rawRows, mapping) => {
  const rows = rawRows || [];
  const fieldMapping = mapping || {};
  return rows.map((row, idx) => {
    const normalized = { __rowId: `row-${idx}-${Date.now()}` };
    PRODUCT_FIELDS_CONFIG.forEach((field) => {
      const sourceHeader = fieldMapping[field.key];
      normalized[field.key] = sourceHeader && sourceHeader !== NOT_MAPPED ? row[sourceHeader] ?? "" : "";
    });
    return normalized;
  });
};

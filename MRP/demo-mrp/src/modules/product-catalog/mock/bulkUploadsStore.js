// Bulk Upload batches mock store — module-level array + pub-sub subscribe
// pattern, mirroring modules/materials/mock/batchesStore.js (minus
// localStorage persistence, which isn't needed for this demo flow).
import { CURRENT_USER, NOTIFICATION_USERS } from "../../../data/notification/notificationConfig.js";

let seq = 7;
const nextId = () => `BUP-${String(++seq).padStart(4, "0")}`;

// ── Activity log helpers ─────────────────────────────────────────────────────
// Every batch carries a `logs` array — one entry per status change (plus the
// initial "created" entry) — shown in the Bulk Upload Detail modal's Logs
// tab. Shape mirrors the app's other activity-log lists: name, email,
// activity (title + optional description), timestamp.
const USER_EMAIL_BY_NAME = new Map(NOTIFICATION_USERS.map((u) => [u.name, u.email]));
const actorForName = (name) => ({
  name: name || CURRENT_USER.name,
  email: USER_EMAIL_BY_NAME.get(name) || CURRENT_USER.email,
});

const makeLog = (actor, title, desc, timestamp) => ({
  name: actor.name,
  email: actor.email,
  title,
  desc,
  timestamp: timestamp || new Date().toISOString(),
});

// Default copy for each status a batch can land on — used whenever
// `updateBulkUpload` sees `patch.status` differ from the current one.
// `patch.logDesc` can override the description for a specific transition
// (e.g. "AI normalization skipped by user.").
const STATUS_LOG_COPY = {
  Mapping: { title: "Column mapping saved", desc: "Field mapping was set for this upload." },
  "Normalizing Data": { title: "AI normalization started", desc: "The uploaded data is being normalized in the background." },
  Review: { title: "Normalization finished", desc: "Data is ready for review." },
  Processing: { title: "Import started", desc: "Reviewed products are being imported into the catalog." },
  Completed: { title: "Import completed", desc: "Products were added to the product catalog." },
  Cancelled: { title: "Upload cancelled", desc: "This upload was cancelled and will not be imported." },
};

// ── Dummy data generator for BUP-0004 ────────────────────────────────────────
// Expands the "draft_boards_batch.csv" Review-status draft to 50 rows so the
// Review step has enough data to demo pagination/search/filtering, with a
// few deliberate edge cases mixed in alongside the original 3 invalid rows:
//  - row[4] — Lead Time unit isn't one of our options ("Fortnights"), so the
//             unit dropdown renders in its unset/error state.
//  - row[5] — Selling Price came in a foreign currency ($) — the numeric
//             value is kept as-is and flagged for the user to verify.
// Both are on page 1 (first 10 rows) so they're easy to spot without paging.
const DRAFT_CATEGORIES = ["Wooden Boards", "Trays", "Vases", "Bowls", "Baskets", "Coasters"];
const DRAFT_PRODUCT_NAMES = [
  "Teak Board", "Rattan Tray", "Ceramic Vase", "Mango Wood Bowl", "Woven Basket", "Bamboo Coaster",
  "Acacia Board", "Palm Leaf Tray", "Stoneware Vase", "Walnut Bowl", "Seagrass Basket", "Cork Coaster",
];

const generateDraftBoardsRows = () => {
  const rows = [];
  for (let i = 0; i < 50; i++) {
    const category = DRAFT_CATEGORIES[i % DRAFT_CATEGORIES.length];
    const productName = DRAFT_PRODUCT_NAMES[i % DRAFT_PRODUCT_NAMES.length];
    rows.push({
      __rowId: `draft-row-${i + 1}`,
      sku: `DFT-${String(i + 1).padStart(3, "0")}`,
      name: `${productName} ${i + 1}`,
      categoryName: category,
      leadTime: `${5 + (i % 10)} Days`,
      sellingPrice: String(120000 + i * 5000),
    });
  }

  rows[1] = { ...rows[1], sku: "", name: "" };
  rows[2] = { ...rows[2], categoryName: "", leadTime: "" };
  rows[3] = { ...rows[3], sellingPrice: "" };
  rows[4] = { ...rows[4], leadTime: "10 Fortnights" };
  rows[5] = { ...rows[5], sellingPrice: "120", sellingPriceSourceCurrency: "$" };

  return rows;
};

const SEED_BATCHES = [
  {
    id: "BUP-0001",
    fileName: "product_catalog_master.xlsx",
    createdAt: "2026-08-01T09:12:00Z",
    createdBy: CURRENT_USER.name,
    totalProducts: 24,
    status: "Completed",
    successCount: 24,
    failedCount: 0,
    failedRows: [],
    sourceDocumentName: "product_catalog_master.xlsx",
    logs: [
      makeLog(actorForName(CURRENT_USER.name), "Upload created", "File \"product_catalog_master.xlsx\" was uploaded (24 products).", "2026-08-01T09:12:00Z"),
      makeLog(actorForName(CURRENT_USER.name), "Import completed", "Products were added to the product catalog.", "2026-08-01T09:19:00Z"),
    ],
  },
  {
    id: "BUP-0002",
    fileName: "wooden_trays_q3.csv",
    createdAt: "2026-08-04T14:30:00Z",
    createdBy: NOTIFICATION_USERS[1].name,
    totalProducts: 15,
    status: "Completed",
    successCount: 13,
    failedCount: 2,
    failedRows: [
      { row: 6, name: "", categoryName: "Trays", leadTime: "7 Days", sellingPrice: "210000", reason: "Missing required field: Name" },
      { row: 11, name: "Wooden Bowl XL", categoryName: "", leadTime: "9 Days", sellingPrice: "195000", reason: "Missing required field: Category Name" },
    ],
    sourceDocumentName: "wooden_trays_q3.csv",
    logs: [
      makeLog(actorForName(NOTIFICATION_USERS[1].name), "Upload created", "File \"wooden_trays_q3.csv\" was uploaded (15 products).", "2026-08-04T14:30:00Z"),
      makeLog(actorForName(NOTIFICATION_USERS[1].name), "Import completed", "13 of 15 products were added; 2 rows were skipped for missing required fields.", "2026-08-04T14:36:00Z"),
    ],
  },
  {
    id: "BUP-0003",
    fileName: "vases_new_arrivals.xlsx",
    createdAt: "2026-08-07T11:05:00Z",
    createdBy: NOTIFICATION_USERS[2].name,
    totalProducts: 18,
    status: "Processing",
    successCount: 0,
    failedCount: 0,
    failedRows: [],
    sourceDocumentName: "vases_new_arrivals.xlsx",
    logs: [
      makeLog(actorForName(NOTIFICATION_USERS[2].name), "Upload created", "File \"vases_new_arrivals.xlsx\" was uploaded (18 products).", "2026-08-07T11:05:00Z"),
      makeLog(actorForName(NOTIFICATION_USERS[2].name), "Import started", "Reviewed products are being imported into the catalog.", "2026-08-07T11:14:00Z"),
    ],
  },
  {
    id: "BUP-0004",
    fileName: "draft_boards_batch.csv",
    createdAt: "2026-08-08T16:45:00Z",
    createdBy: NOTIFICATION_USERS[3].name,
    totalProducts: 50,
    status: "Review",
    successCount: 0,
    failedCount: 0,
    failedRows: [],
    sourceDocumentName: "draft_boards_batch.csv",
    sourceHeaders: ["Product Name", "Category", "Lead Time", "Price", "SKU"],
    fieldMapping: {
      sku: "SKU",
      name: "Product Name",
      categoryName: "Category",
      leadTime: "Lead Time",
      sellingPrice: "Price",
    },
    rows: generateDraftBoardsRows(),
    logs: [
      makeLog(actorForName(NOTIFICATION_USERS[3].name), "Upload created", "File \"draft_boards_batch.csv\" was uploaded (50 products).", "2026-08-08T16:45:00Z"),
      makeLog(actorForName(NOTIFICATION_USERS[3].name), "Column mapping saved", "Field mapping was set for this upload.", "2026-08-08T16:47:00Z"),
      makeLog(actorForName(NOTIFICATION_USERS[3].name), "Normalization finished", "Data is ready for review.", "2026-08-08T16:52:00Z"),
    ],
  },
  {
    id: "BUP-0006",
    fileName: "trays_batch_two.csv",
    createdAt: "2026-08-09T10:15:00Z",
    createdBy: NOTIFICATION_USERS[1].name,
    totalProducts: 12,
    status: "Mapping",
    successCount: 0,
    failedCount: 0,
    failedRows: [],
    sourceDocumentName: "trays_batch_two.csv",
    sourceHeaders: ["Product Name", "Category", "Lead Time", "Price", "SKU"],
    fieldMapping: {
      sku: "SKU",
      name: "Product Name",
      categoryName: "Category",
      leadTime: "Lead Time",
      sellingPrice: "Price",
    },
    rawRows: [
      { SKU: "TRY-B2-01", "Product Name": "Rattan Tray Medium", Category: "Trays", "Lead Time": "7 Days", Price: "175000" },
      { SKU: "TRY-B2-02", "Product Name": "Rattan Tray Large", Category: "Trays", "Lead Time": "8 Days", Price: "220000" },
    ],
    rows: [],
    logs: [
      makeLog(actorForName(NOTIFICATION_USERS[1].name), "Upload created", "File \"trays_batch_two.csv\" was uploaded (12 products).", "2026-08-09T10:15:00Z"),
      makeLog(actorForName(NOTIFICATION_USERS[1].name), "Column mapping saved", "Field mapping was set for this upload.", "2026-08-09T10:17:00Z"),
    ],
  },
  {
    id: "BUP-0007",
    fileName: "vases_batch_normalizing.csv",
    createdAt: "2026-08-09T15:40:00Z",
    createdBy: NOTIFICATION_USERS[2].name,
    totalProducts: 10,
    status: "Normalizing Data",
    successCount: 0,
    failedCount: 0,
    failedRows: [],
    sourceDocumentName: "vases_batch_normalizing.csv",
    sourceHeaders: ["Product Name", "Category", "Lead Time", "Price", "SKU"],
    fieldMapping: {
      sku: "SKU",
      name: "Product Name",
      categoryName: "Category",
      leadTime: "Lead Time",
      sellingPrice: "Price",
    },
    rawRows: [
      { SKU: "VAS-NRM-01", "Product Name": "Ceramic Vase Medium", Category: "Vases", "Lead Time": "9 Days", Price: "230000" },
      { SKU: "VAS-NRM-02", "Product Name": "Ceramic Vase Tall", Category: "Vases", "Lead Time": "11 Days", Price: "310000" },
    ],
    rows: [],
    logs: [
      makeLog(actorForName(NOTIFICATION_USERS[2].name), "Upload created", "File \"vases_batch_normalizing.csv\" was uploaded (10 products).", "2026-08-09T15:40:00Z"),
      makeLog(actorForName(NOTIFICATION_USERS[2].name), "Column mapping saved", "Field mapping was set for this upload.", "2026-08-09T15:41:00Z"),
      makeLog(actorForName(NOTIFICATION_USERS[2].name), "AI normalization started", "The uploaded data is being normalized in the background.", "2026-08-09T15:41:30Z"),
    ],
  },
  {
    id: "BUP-0005",
    fileName: "bulk_import_cancelled.xlsx",
    createdAt: "2026-07-28T08:20:00Z",
    createdBy: CURRENT_USER.name,
    totalProducts: 30,
    status: "Cancelled",
    successCount: 0,
    failedCount: 30,
    failedRows: [
      { row: 2, name: "Wooden Vase A", categoryName: "Vases", leadTime: "10 Days", sellingPrice: "300000", reason: "Upload cancelled by user" },
    ],
    sourceDocumentName: "bulk_import_cancelled.xlsx",
    logs: [
      makeLog(actorForName(CURRENT_USER.name), "Upload created", "File \"bulk_import_cancelled.xlsx\" was uploaded (30 products).", "2026-07-28T08:20:00Z"),
      makeLog(actorForName(CURRENT_USER.name), "Upload cancelled", "This upload was cancelled and will not be imported.", "2026-07-28T08:24:00Z"),
    ],
  },
];

let batches = SEED_BATCHES.map((b) => ({ ...b }));
const listeners = new Set();

const notify = () => listeners.forEach((fn) => fn(batches));

export const getBulkUploads = () => batches;

export const getBulkUpload = (id) => batches.find((b) => b.id === id) || null;

export const subscribeBulkUploads = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const addBulkUpload = (data) => {
  const actor = actorForName(data.createdBy);
  const record = {
    id: nextId(),
    fileName: data.fileName || "untitled.csv",
    createdAt: new Date().toISOString(),
    createdBy: data.createdBy || CURRENT_USER.name,
    totalProducts: data.totalProducts || 0,
    status: data.status || "Mapping",
    successCount: data.successCount || 0,
    failedCount: data.failedCount || 0,
    failedRows: data.failedRows || [],
    sourceDocumentName: data.sourceDocumentName || data.fileName || "untitled.csv",
    rows: data.rows || [],
    rawRows: data.rawRows || [],
    fieldMapping: data.fieldMapping || {},
    sourceHeaders: data.sourceHeaders || [],
    logs: [
      makeLog(actor, "Upload created", `File "${data.fileName || "untitled.csv"}" was uploaded (${data.totalProducts || 0} products).`),
    ],
  };
  batches = [record, ...batches];
  notify();
  return record;
};

export const updateBulkUpload = (id, patch) => {
  const { logActorName, logDesc, ...rest } = patch;
  batches = batches.map((b) => {
    if (b.id !== id) return b;
    const next = { ...b, ...rest, id: b.id };
    if (rest.status && rest.status !== b.status) {
      const copy = STATUS_LOG_COPY[rest.status];
      const actor = actorForName(logActorName || CURRENT_USER.name);
      const log = makeLog(actor, copy?.title || `Status changed to "${rest.status}"`, logDesc || copy?.desc);
      next.logs = [...(b.logs || []), log];
    }
    return next;
  });
  notify();
  return getBulkUpload(id);
};

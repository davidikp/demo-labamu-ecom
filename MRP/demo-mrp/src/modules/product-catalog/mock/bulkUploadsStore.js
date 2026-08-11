// Bulk Upload batches mock store — module-level array + pub-sub subscribe
// pattern, mirroring modules/materials/mock/batchesStore.js (minus
// localStorage persistence, which isn't needed for this demo flow).
import { CURRENT_USER, NOTIFICATION_USERS } from "../../../data/notification/notificationConfig.js";

let seq = 7;
const nextId = () => `BUP-${String(++seq).padStart(4, "0")}`;

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
  },
  {
    id: "BUP-0004",
    fileName: "draft_boards_batch.csv",
    createdAt: "2026-08-08T16:45:00Z",
    createdBy: NOTIFICATION_USERS[3].name,
    totalProducts: 9,
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
    rows: [
      {
        __rowId: "draft-row-1",
        sku: "WBD-DFT-01",
        name: "Teak Board Draft 90cm",
        categoryName: "Wooden Boards",
        leadTime: "8 Days",
        sellingPrice: "450000",
      },
      {
        __rowId: "draft-row-2",
        sku: "",
        name: "",
        categoryName: "Trays",
        leadTime: "6 Days",
        sellingPrice: "180000",
      },
      {
        __rowId: "draft-row-3",
        sku: "BWL-DFT-02",
        name: "Draft Bowl Set",
        categoryName: "",
        leadTime: "",
        sellingPrice: "260000",
      },
      {
        __rowId: "draft-row-4",
        sku: "",
        name: "Draft Vase Small",
        categoryName: "Vases",
        leadTime: "10 Days",
        sellingPrice: "",
      },
      {
        __rowId: "draft-row-5",
        sku: "TRY-DFT-03",
        name: "Draft Serving Tray",
        categoryName: "Trays",
        leadTime: "5 Days",
        sellingPrice: "150000",
      },
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
  };
  batches = [record, ...batches];
  notify();
  return record;
};

export const updateBulkUpload = (id, patch) => {
  batches = batches.map((b) => (b.id === id ? { ...b, ...patch, id: b.id } : b));
  notify();
  return getBulkUpload(id);
};

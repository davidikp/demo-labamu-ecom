# Bulk Upload — English vs Bahasa Indonesia

Covers the Bulk Upload flow in both **Product Catalog** and **Materials** modules: list page, wizard (Upload → Mapping → Review), confirm modals, detail modal, field labels, and status/activity-log copy.

**How to read this doc:**
- Every string currently lives in the app as plain English (no Bahasa Indonesia version exists yet for the flow's own UI) — those rows have an **empty** Bahasa Indonesia column for you to fill in.
- The **Notifications** sections at the end of each module already have a Bahasa Indonesia translation in the codebase (`src/data/notification/notificationCatalog.js`) — those rows are pre-filled with the current translation so you can review/adjust rather than start from scratch.
- `{placeholder}` markers indicate a dynamic value substituted at runtime (file name, counts, etc.) — keep the placeholder token as-is when translating.

---

# Part 1 — Product Catalog Bulk Upload

## 1. Bulk Upload List page

`src/modules/product-catalog/pages/BulkUploadListPage.jsx`

| Element | English | Bahasa Indonesia |
|---|---|---|
| Page title | Bulk Upload | |
| Breadcrumb | Product Catalog | |
| Breadcrumb | Bulk Upload | |
| Button | New Upload | |
| Filter label | Status | |
| Status option | Mapping | |
| Status option | Normalizing Data | |
| Status option | Review | |
| Status option | Processing | |
| Status option | Completed | |
| Status option | Cancelled | |
| Search placeholder | Search by File Name or Upload ID | |
| Column header | File Name | |
| Column header | Upload ID | |
| Column header | Created At | |
| Column header | Created By | |
| Column header | Total Data | |
| Column header | Status | |
| Empty state title | No uploads found | |
| Empty state description | Try adjusting your filters or search keywords. | |

## 2. Add New Upload — wizard chrome

`src/modules/product-catalog/pages/BulkUploadNewPage.jsx`

| Element | English | Bahasa Indonesia |
|---|---|---|
| Page title | Add New Upload | |
| Breadcrumb | Product Catalog | |
| Breadcrumb | Bulk Upload | |
| Breadcrumb | Add New Upload | |
| Stepper step | Upload | |
| Stepper step | Mapping | |
| Stepper step | Review | |
| Footer button | Analyze File | |
| Footer button (loading) | Analyzing... | |
| Footer button | Cancel | |
| Footer button | Normalize and Review | |
| Footer button | Save as Draft | |
| Footer button | Import Data | |
| Toast | Field cannot be empty | |
| Toast | No data found in this file | |
| Toast | Failed to analyze file | |
| Toast | Upload cancelled | |
| Toast | Upload saved as draft | |
| Background screen title | Your file is being normalized | |
| Background screen message | We're also validating your data to prepare it for review. You can leave this page and we'll notify you by email when it's ready. | |
| Background screen button | Back to Bulk Upload | |
| Background screen secondary action | Skip Process | |
| Background screen title | Your products are being imported | |
| Background screen message | We're adding the reviewed data from "{fileName}" to your product catalog. You can leave this page and we'll notify you by email when it's ready. | |

## 3. Upload step

`src/modules/product-catalog/components/upload-steps/UploadStep.jsx`

| Element | English | Bahasa Indonesia |
|---|---|---|
| Section title | Import Products | |
| Section description | Upload your product file in any spreadsheet format. We'll map and prepare the data for your product catalog. | |
| Button | Download Template | |
| Upload field hint | Allowed formats (.csv, .xlsx, .xls) | |
| Loading title | Analyzing your file... | |
| Loading description | We're reading your file and getting it ready for column mapping. This usually takes a few seconds. | |
| Demo panel label | Demo: simulate a failure | |
| Demo button | Simulate Timeout | |
| Demo button | Simulate Empty File | |
| Auto-generated header | Untitled Column | |
| Auto-generated header (duplicate) | Untitled Column (1) | |

## 4. Mapping step

`src/modules/product-catalog/components/upload-steps/MappingStep.jsx`

| Element | English | Bahasa Indonesia |
|---|---|---|
| Info banner | Check that each product field matches the correct column from your file. Once everything looks right, continue to normalize and review your data. | |
| Column header | Product Field | |
| Column header | Source Column | |
| Column header | Example Value | |
| Column header | AI Recommendation | |
| Required badge | Required | |
| Dropdown placeholder / option | — Not mapped — | |
| Validation error | Field cannot be empty | |
| Recommendation text | No match found | |
| Recommendation text | Matched to "{sourceColumn}" | |

## 5. Review step

`src/modules/product-catalog/components/upload-steps/ReviewStep.jsx`

| Element | English | Bahasa Indonesia |
|---|---|---|
| Checkbox label | Show only products that need attention {(count)} | |
| Search placeholder | Search by SKU, Name, or Category | |
| Button | New Row | |
| Normalization badge | {n} of {total} rows normalized by AI {(x skipped)} | |
| Selection bar | {n} Selected | |
| Button | Delete | |
| Empty state title | No rows found | |
| Empty state description | Try adjusting your search or the needs-attention filter. | |
| Status dropdown placeholder | Select status | |
| Status option | Active | |
| Status option | Inactive | |
| Lead Time unit placeholder | Select unit | |
| Lead Time unit option | Days | |
| Lead Time unit option | Weeks | |
| Lead Time unit option | Months | |
| Field error | Field cannot be empty | |
| Field warning | Different currency detected. Value kept as is. | |
| Delete confirm title | Delete this row? | |
| Delete confirm title (plural) | Delete {n} rows? | |
| Delete confirm description | These rows will be removed from this upload and won't be imported. | |
| Delete confirm button | Cancel | |
| Delete confirm button | Yes, Delete | |

## 6. Confirm modals

| Modal | Element | English | Bahasa Indonesia |
|---|---|---|---|
| Cancel Upload | Title | Cancel this upload? | |
| Cancel Upload | Description | You won't be able to continue this upload. It will remain in the Bulk Upload list with a Cancelled status. | |
| Cancel Upload | Field label | Cancellation Reason | |
| Cancel Upload | Field placeholder | Add a reason for canceling this upload. | |
| Cancel Upload | Field error | Field cannot be empty | |
| Cancel Upload | Button | Keep Editing | |
| Cancel Upload | Button | Yes, Cancel | |
| Discard Changes | Title | Discard changes? | |
| Discard Changes | Description | Any changes you made on this page will be lost. | |
| Discard Changes | Button | Keep Editing | |
| Discard Changes | Button | Yes, Discard | |
| Invalid Data | Title | {n} product(s) need(s) attention | |
| Invalid Data | Description | Some required information is missing. You can update these products now or continue importing the products that are ready. | |
| Invalid Data | Button | Keep Editing | |
| Invalid Data | Button | Import Ready Products | |
| Input Data (import confirm) | Title | Import {n} product(s)? | |
| Input Data | Description | These products will be added to your product catalog. | |
| Input Data | Button | Cancel | |
| Input Data | Button | Yes, Import Products | |
| Skip Normalization | Title | Skip normalization? | |
| Skip Normalization | Description | The remaining data won't be normalized by AI. Those rows will need your attention later in the Review step. | |
| Skip Normalization | Button | Keep Waiting | |
| Skip Normalization | Button | Yes, Skip | |
| Use Template Suggestion | Title | Try uploading with our template | |
| Use Template Suggestion | Description | Use our template to organize your product data in a format that's easier to process. | |
| Use Template Suggestion | Button | Not Now | |
| Use Template Suggestion | Button | Download Template | |
| No Data To Import | Title | No products to import | |
| No Data To Import | Description | There are no products ready to import. Add or update your product data before continuing. | |
| No Data To Import | Button | Back to Review | |

## 7. Bulk Upload Detail modal

`src/modules/product-catalog/components/BulkUploadDetailModal.jsx`

| Element | English | Bahasa Indonesia |
|---|---|---|
| Modal title | Bulk Upload Detail | |
| Processing banner | **Import in progress:** Your products are being added to the product catalog. We'll notify you by email when it's complete. | |
| Field label | Created At | |
| Field label | Created By | |
| Field label | Upload ID | |
| Field label | Total Data | |
| Field label | Imported Data | |
| Field label | Invalid Data | |
| Section title | Activity Logs | |
| Column header | Name | |
| Column header | Email | |
| Column header | Activity | |
| Column header | Timestamp | |
| Empty state | No activity yet. | |
| Button | Download Invalid Data | |

## 8. Activity log status copy

`src/modules/product-catalog/mock/bulkUploadsStore.js`

| Log title | English description | Bahasa Indonesia |
|---|---|---|
| Upload Created | File "{fileName}" was uploaded ({n} products). | |
| Normalization Started | The uploaded data is being normalized in the background. | |
| Normalization Finished | Data is ready for review. | |
| Normalization Skipped | AI normalization was skipped by the user — remaining rows need attention. | |
| Import Started | Reviewed products are being imported into the catalog. | |
| Import Completed | Products were added to the product catalog. | |
| Upload Cancelled | *(user-entered cancellation reason)* | |

## 9. Product field labels (Mapping / Review columns, CSV template)

`src/modules/product-catalog/mock/productFieldsConfig.js`

| Field key | English label | Bahasa Indonesia |
|---|---|---|
| sku | SKU | |
| name | Name | |
| categoryName | Category Name | |
| status | Status | |
| leadTime | Lead Time | |
| sellingPrice | Selling Price | |
| primaryMaterial | Primary Material | |
| finishing | Finishing | |
| weightKg | Weight (Kg) | |
| finishedHeightCm | Finished Height (cm) | |
| finishedWidthCm | Finished Width (cm) | |
| finishedLengthCm | Finished Length (cm) | |
| packedHeightCm | Packed Height (cm) | |
| packedWidthCm | Packed Width (cm) | |
| packedLengthCm | Packed Length (cm) | |
| container20ft | Container 20ft (Qty) | |
| container40ft | Container 40ft (Qty) | |
| container40ftHighCube | Container 40ft High Cube (Qty) | |

## 10. Notifications — `product_catalog` bulk upload

`src/data/notification/notificationCatalog.js` — already bilingual in code; shown here for reference/review.

| Trigger | Channel | English | Bahasa Indonesia (current) |
|---|---|---|---|
| bulk_upload_completed | In-app title | Bulk upload finished — {fileName} | Bulk upload selesai — {fileName} |
| bulk_upload_completed | In-app body | {fileName} finished processing — {n} product(s) added to your catalog. | {fileName} selesai diproses — {n} produk ditambahkan ke katalog Anda. |
| bulk_upload_completed | CTA | View Upload | Lihat Upload |
| bulk_upload_completed | Email subject | Bulk upload finished — {fileName} | Bulk upload selesai — {fileName} |
| bulk_upload_completed | Email body | Hi {requesterName}, {fileName} finished processing — {n} product(s) added to your catalog. | Halo {requesterName}, {fileName} selesai diproses — {n} produk ditambahkan ke katalog Anda. |
| bulk_upload_mapping_ready | In-app title | Mapping finished — {fileName} | Mapping selesai — {fileName} |
| bulk_upload_mapping_ready | In-app body | {fileName} finished mapping and is ready for review. | {fileName} selesai dipetakan dan siap untuk ditinjau. |
| bulk_upload_mapping_ready | CTA | Review | Tinjau |
| bulk_upload_mapping_ready | Email subject | Mapping finished — {fileName} | Mapping selesai — {fileName} |
| bulk_upload_mapping_ready | Email body | Hi {requesterName}, {fileName} finished mapping and is ready for review. | Halo {requesterName}, {fileName} selesai dipetakan dan siap untuk ditinjau. |
| bulk_upload_cancelled | In-app title | Bulk upload cancelled — {fileName} | Bulk upload dibatalkan — {fileName} |
| bulk_upload_cancelled | In-app body | {fileName} was cancelled before it finished processing. | {fileName} dibatalkan sebelum selesai diproses. |
| bulk_upload_cancelled | CTA | View Upload | Lihat Upload |
| bulk_upload_cancelled | Email subject | Bulk upload cancelled — {fileName} | Bulk upload dibatalkan — {fileName} |
| bulk_upload_cancelled | Email body | Hi {requesterName}, {fileName} was cancelled before it finished processing. | Halo {requesterName}, {fileName} dibatalkan sebelum selesai diproses. |

---

# Part 2 — Materials Bulk Upload

## 1. Bulk Upload List page

`src/modules/materials/pages/MaterialUploadListPage.jsx`

| Element | English | Bahasa Indonesia |
|---|---|---|
| Page title | Bulk Upload | |
| Breadcrumb | Materials | |
| Breadcrumb | Bulk Upload | |
| Button | New Upload | |
| Filter label | Status | |
| Status option | Mapping | |
| Status option | Normalizing Data | |
| Status option | Review | |
| Status option | Processing | |
| Status option | Completed | |
| Status option | Cancelled | |
| Search placeholder | Search by File Name or Upload ID | |
| Column header | File Name | |
| Column header | Upload ID | |
| Column header | Created At | |
| Column header | Created By | |
| Column header | Total Data | |
| Column header | Status | |
| Empty state title | No uploads found | |
| Empty state description | Try adjusting your filters or search keywords. | |

## 2. Add New Upload — wizard chrome

`src/modules/materials/pages/MaterialUploadNewPage.jsx`

| Element | English | Bahasa Indonesia |
|---|---|---|
| Page title | Add New Upload | |
| Breadcrumb | Materials | |
| Breadcrumb | Bulk Upload | |
| Breadcrumb | Add New Upload | |
| Stepper step | Upload | |
| Stepper step | Mapping | |
| Stepper step | Review | |
| Footer button | Analyze File | |
| Footer button (loading) | Analyzing... | |
| Footer button | Cancel | |
| Footer button | Normalize and Review | |
| Footer button | Save as Draft | |
| Footer button | Import Data | |
| Toast | Field cannot be empty | |
| Toast | No data found in this file | |
| Toast | Failed to analyze file | |
| Toast | Upload cancelled | |
| Toast | Upload saved as draft | |
| Background screen title | Your file is being normalized | |
| Background screen message | We're also validating your data to prepare it for review. You can leave this page and we'll notify you by email when it's ready. | |
| Background screen button | Back to Bulk Upload | |
| Background screen secondary action | Skip Process | |
| Background screen title | Your materials are being imported | |
| Background screen message | We're adding the reviewed data from "{fileName}" to your material catalog. You can leave this page and we'll notify you by email when it's ready. | |

## 3. Upload step

`src/modules/materials/components/upload-steps/UploadStep.jsx`

| Element | English | Bahasa Indonesia |
|---|---|---|
| Section title | Import Materials | |
| Section description | Upload your material file in any spreadsheet format. We'll map and prepare the data for your material catalog. | |
| Button | Download Template | |
| Upload field hint | Allowed formats (.csv, .xlsx, .xls) | |
| Loading title | Analyzing your file... | |
| Loading description | We're reading your file and getting it ready for column mapping. This usually takes a few seconds. | |
| Demo panel label | Demo: simulate a failure | |
| Demo button | Simulate Timeout | |
| Demo button | Simulate Empty File | |
| Auto-generated header | Untitled Column | |
| Auto-generated header (duplicate) | Untitled Column (1) | |

## 4. Mapping step

`src/modules/materials/components/upload-steps/MappingStep.jsx`

| Element | English | Bahasa Indonesia |
|---|---|---|
| Info banner | Check that each material field matches the correct column from your file. Once everything looks right, continue to normalize and review your data. | |
| Column header | Material Field | |
| Column header | Source Column | |
| Column header | Example Value | |
| Column header | AI Recommendation | |
| Required badge | Required | |
| Dropdown placeholder / option | — Not mapped — | |
| Validation error | Field cannot be empty | |
| Recommendation text | No match found | |
| Recommendation text | Matched to "{sourceColumn}" | |

## 5. Review step

`src/modules/materials/components/upload-steps/ReviewStep.jsx`

| Element | English | Bahasa Indonesia |
|---|---|---|
| Checkbox label | Show only materials that need attention {(count)} | |
| Search placeholder | Search by SKU, Name, or Category | |
| Button | New Row | |
| Normalization badge | {n} of {total} rows normalized by AI {(x skipped)} | |
| Selection bar | {n} Selected | |
| Button | Delete | |
| Empty state title | No rows found | |
| Empty state description | Try adjusting your search or the needs-attention filter. | |
| ABC Classification placeholder | Select classification | |
| Material Type placeholder | Select material type | |
| Material Type option | Raw Material | |
| Material Type option | Semi-Finished Material | |
| Material Type option | Finished Material | |
| Field error | Field cannot be empty | |
| Delete confirm title | Delete this row? | |
| Delete confirm title (plural) | Delete {n} rows? | |
| Delete confirm description | These rows will be removed from this upload and won't be imported. | |
| Delete confirm button | Cancel | |
| Delete confirm button | Yes, Delete | |

## 6. Confirm modals

| Modal | Element | English | Bahasa Indonesia |
|---|---|---|---|
| Cancel Upload | Title | Cancel this upload? | |
| Cancel Upload | Description | You won't be able to continue this upload. It will remain in the Bulk Upload list with a Cancelled status. | |
| Cancel Upload | Field label | Cancellation Reason | |
| Cancel Upload | Field placeholder | Add a reason for canceling this upload. | |
| Cancel Upload | Field error | Field cannot be empty | |
| Cancel Upload | Button | Keep Editing | |
| Cancel Upload | Button | Yes, Cancel | |
| Discard Changes | Title | Discard changes? | |
| Discard Changes | Description | Any changes you made on this page will be lost. | |
| Discard Changes | Button | Keep Editing | |
| Discard Changes | Button | Yes, Discard | |
| Invalid Data | Title | {n} material(s) need(s) attention | |
| Invalid Data | Description | Some required information is missing. You can update these materials now or continue importing the materials that are ready. | |
| Invalid Data | Button | Keep Editing | |
| Invalid Data | Button | Import Ready Materials | |
| Input Data (import confirm) | Title | Import {n} material(s)? | |
| Input Data | Description | These materials will be added to your material catalog. | |
| Input Data | Button | Cancel | |
| Input Data | Button | Yes, Import Materials | |
| Skip Normalization | Title | Skip normalization? | |
| Skip Normalization | Description | The remaining data won't be normalized by AI. Those rows will need your attention later in the Review step. | |
| Skip Normalization | Button | Keep Waiting | |
| Skip Normalization | Button | Yes, Skip | |
| Use Template Suggestion | Title | Try uploading with our template | |
| Use Template Suggestion | Description | Use our template to organize your material data in a format that's easier to process. | |
| Use Template Suggestion | Button | Not Now | |
| Use Template Suggestion | Button | Download Template | |
| No Data To Import | Title | No materials to import | |
| No Data To Import | Description | There are no materials ready to import. Add or update your material data before continuing. | |
| No Data To Import | Button | Back to Review | |

## 7. Material Upload Detail modal

`src/modules/materials/components/MaterialUploadDetailModal.jsx`

| Element | English | Bahasa Indonesia |
|---|---|---|
| Modal title | Bulk Upload Detail | |
| Processing banner | **Import in progress:** Your materials are being added to the material catalog. We'll notify you by email when it's complete. | |
| Field label | Created At | |
| Field label | Created By | |
| Field label | Upload ID | |
| Field label | Total Data | |
| Field label | Imported Data | |
| Field label | Invalid Data | |
| Section title | Activity Logs | |
| Column header | Name | |
| Column header | Email | |
| Column header | Activity | |
| Column header | Timestamp | |
| Empty state | No activity yet. | |
| Button | Download Invalid Data | |

## 8. Activity log status copy

`src/modules/materials/mock/materialUploadsStore.js`

| Log title | English description | Bahasa Indonesia |
|---|---|---|
| Upload Created | File "{fileName}" was uploaded ({n} materials). | |
| Normalization Started | The uploaded data is being normalized in the background. | |
| Normalization Finished | Data is ready for review. | |
| Normalization Skipped | AI normalization was skipped by the user — remaining rows need attention. | |
| Import Started | Reviewed materials are being imported into the catalog. | |
| Import Completed | Materials were added to the material catalog. | |
| Upload Cancelled | *(user-entered cancellation reason)* | |

## 9. Material field labels (Mapping / Review columns, CSV template)

`src/modules/materials/mock/materialFieldsConfig.js`

| Field key | English label | Bahasa Indonesia |
|---|---|---|
| sku | SKU | |
| name | Material Name | |
| category | Category | |
| abcClassification | ABC Classification | |
| materialType | Material Type | |
| uom | Unit of Measurement (UOM) | |

## 10. Notifications — `material_bulk_upload`

`src/data/notification/notificationCatalog.js` — already bilingual in code; shown here for reference/review.

| Trigger | Channel | English | Bahasa Indonesia (current) |
|---|---|---|---|
| bulk_upload_completed | In-app title | Bulk upload finished — {fileName} | Bulk upload selesai — {fileName} |
| bulk_upload_completed | In-app body | {fileName} finished processing — {n} material(s) added to your catalog. | {fileName} selesai diproses — {n} material ditambahkan ke katalog Anda. |
| bulk_upload_completed | CTA | View Upload | Lihat Upload |
| bulk_upload_completed | Email subject | Bulk upload finished — {fileName} | Bulk upload selesai — {fileName} |
| bulk_upload_completed | Email body | Hi {requesterName}, {fileName} finished processing — {n} material(s) added to your catalog. | Halo {requesterName}, {fileName} selesai diproses — {n} material ditambahkan ke katalog Anda. |
| bulk_upload_mapping_ready | In-app title | Mapping finished — {fileName} | Mapping selesai — {fileName} |
| bulk_upload_mapping_ready | In-app body | {fileName} finished mapping and is ready for review. | {fileName} selesai dipetakan dan siap untuk ditinjau. |
| bulk_upload_mapping_ready | CTA | Review | Tinjau |
| bulk_upload_mapping_ready | Email subject | Mapping finished — {fileName} | Mapping selesai — {fileName} |
| bulk_upload_mapping_ready | Email body | Hi {requesterName}, {fileName} finished mapping and is ready for review. | Halo {requesterName}, {fileName} selesai dipetakan dan siap untuk ditinjau. |
| bulk_upload_cancelled | In-app title | Bulk upload cancelled — {fileName} | Bulk upload dibatalkan — {fileName} |
| bulk_upload_cancelled | In-app body | {fileName} was cancelled before it finished processing. | {fileName} dibatalkan sebelum selesai diproses. |
| bulk_upload_cancelled | CTA | View Upload | Lihat Upload |
| bulk_upload_cancelled | Email subject | Bulk upload cancelled — {fileName} | Bulk upload dibatalkan — {fileName} |
| bulk_upload_cancelled | Email body | Hi {requesterName}, {fileName} was cancelled before it finished processing. | Halo {requesterName}, {fileName} dibatalkan sebelum selesai diproses. |

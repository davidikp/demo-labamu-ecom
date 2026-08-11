import React, { useState } from "react";
import { ChevronLeft, CheckIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { UploadStep, analyzeFile } from "../components/upload-steps/UploadStep.jsx";
import { MappingStep } from "../components/upload-steps/MappingStep.jsx";
import { ReviewStep } from "../components/upload-steps/ReviewStep.jsx";
import { addBulkUpload, updateBulkUpload, getBulkUpload } from "../mock/bulkUploadsStore.js";
import { addProducts } from "../mock/productsMocks.js";
import { normalizeMappedRows, autoMatchHeaders, REQUIRED_PRODUCT_FIELD_KEYS, NOT_MAPPED, isRowInvalid } from "../mock/productFieldsConfig.js";
import { BackgroundProcessingScreen } from "../components/BackgroundProcessingScreen.jsx";
import { CancelUploadConfirmModal } from "../components/CancelUploadConfirmModal.jsx";
import { InvalidDataConfirmModal } from "../components/InvalidDataConfirmModal.jsx";
import { InputDataConfirmModal } from "../components/InputDataConfirmModal.jsx";

const STEPS = [
  { key: "upload", label: "Upload" },
  { key: "mapping", label: "Mapping" },
  { key: "review", label: "Review" },
];

const Stepper = ({ currentKey }) => {
  const currentIndex = STEPS.findIndex((s) => s.key === currentKey);
  return (
    <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
      {STEPS.map((step, idx) => {
        const isDone = idx < currentIndex;
        const isActive = idx === currentIndex;
        return (
          <React.Fragment key={step.key}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: "var(--font-weight-bold)",
                  background: isDone || isActive ? "var(--feature-brand-primary)" : "var(--neutral-surface-grey-lighter)",
                  color: isDone || isActive ? "#fff" : "var(--neutral-on-surface-tertiary)",
                }}
              >
                {isDone ? <CheckIcon size={14} color="#fff" /> : idx + 1}
              </div>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: isActive ? "var(--font-weight-bold)" : "var(--font-weight-regular)",
                  color: isActive ? "var(--neutral-on-surface-primary)" : "var(--neutral-on-surface-tertiary)",
                }}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div style={{ flex: 1, height: "1px", margin: "0 8px", background: isDone ? "var(--feature-brand-primary)" : "var(--neutral-line-separator-2)" }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const BulkUploadNewPage = ({ onNavigate, showSnackbar, initialData, isSidebarCollapsed }) => {
  const resumeDraftId = initialData?.resumeDraftId || null;
  const resumeRecord = resumeDraftId ? getBulkUpload(resumeDraftId) : null;
  const resumeAtMapping = resumeRecord?.status === "Mapping";

  const [step, setStep] = useState(resumeRecord ? (resumeAtMapping ? "mapping" : "review") : "upload");
  const [fileName, setFileName] = useState(resumeRecord?.fileName || "");
  const [parsedHeaders, setParsedHeaders] = useState(resumeRecord?.sourceHeaders || []);
  const [parsedRows, setParsedRows] = useState(resumeRecord?.rawRows || []);
  const [normalizedRows, setNormalizedRows] = useState(resumeRecord?.rows || []);
  const [fieldMapping, setFieldMapping] = useState(resumeRecord?.fieldMapping || {});
  const [sourceHeaders, setSourceHeaders] = useState(resumeRecord?.sourceHeaders || []);
  const [editingDraftId, setEditingDraftId] = useState(resumeRecord?.id || null);
  const [processingRecordId, setProcessingRecordId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mapping, setMapping] = useState(() =>
    resumeAtMapping ? autoMatchHeaders(resumeRecord?.sourceHeaders || []) : {}
  );
  // Fixed snapshot of what the AI matched at analysis time — doesn't change
  // if the user later overrides a Source Column selection.
  const [recommendation, setRecommendation] = useState(() =>
    resumeAtMapping ? autoMatchHeaders(resumeRecord?.sourceHeaders || []) : {}
  );
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showInvalidConfirm, setShowInvalidConfirm] = useState(false);
  const [showInputDataConfirm, setShowInputDataConfirm] = useState(false);

  const missingRequired = REQUIRED_PRODUCT_FIELD_KEYS.filter(
    (key) => !mapping[key] || mapping[key] === NOT_MAPPED
  );

  const handleAnalyzeClick = () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    analyzeFile(selectedFile, (headers, rows, uploadedFileName) => {
      setIsAnalyzing(false);
      handleAnalyzed(headers, rows, uploadedFileName);
    });
  };

  const handleAnalyzed = (headers, rows, uploadedFileName) => {
    const effectiveFileName = uploadedFileName || fileName || "untitled-upload.csv";
    if (uploadedFileName) setFileName(uploadedFileName);
    setParsedHeaders(headers);
    setParsedRows(rows);

    // "Mapping" now represents the batch while the user is actively on the
    // Mapping step (not a background job) — persist it as soon as analysis
    // finishes so it shows up in the Bulk Upload list even before the user
    // finishes mapping columns.
    const payload = {
      fileName: effectiveFileName,
      totalProducts: rows.length,
      status: "Mapping",
      successCount: 0,
      failedCount: 0,
      sourceDocumentName: effectiveFileName,
      rawRows: rows,
      sourceHeaders: headers,
      fieldMapping: {},
    };

    const record = editingDraftId
      ? updateBulkUpload(editingDraftId, payload)
      : addBulkUpload(payload);

    setEditingDraftId(record.id);

    const matched = autoMatchHeaders(headers);
    setMapping(matched);
    setRecommendation(matched);
    setStep("mapping");
  };

  const handleNormalizeAndReview = () => {
    if (missingRequired.length > 0) return;
    const effectiveMapping = mapping;
    const effectiveHeaders = parsedHeaders;
    setFieldMapping(effectiveMapping);
    setSourceHeaders(effectiveHeaders);

    // Flip the same record (already persisted with status "Mapping" once the
    // Mapping step was reached) to "Normalizing Data" and show the shared
    // background-processing interstitial. After the simulated delay the
    // normalized rows are built and the record flips to "Review".
    const payload = {
      fileName: fileName || "untitled-upload.csv",
      totalProducts: parsedRows.length,
      status: "Normalizing Data",
      successCount: 0,
      failedCount: 0,
      sourceDocumentName: fileName || "untitled-upload.csv",
      rawRows: parsedRows,
      fieldMapping: effectiveMapping,
      sourceHeaders: effectiveHeaders,
    };

    const record = editingDraftId
      ? updateBulkUpload(editingDraftId, payload)
      : addBulkUpload(payload);

    setEditingDraftId(record.id);
    setStep("mapping-processing");

    setTimeout(() => {
      const normalized = normalizeMappedRows(parsedRows, effectiveMapping);
      updateBulkUpload(record.id, {
        status: "Review",
        rows: normalized,
        totalProducts: normalized.length,
      });
    }, 5000);
  };

  const handleCancelUpload = () => {
    if (editingDraftId) {
      updateBulkUpload(editingDraftId, { status: "Cancelled" });
    }
    showSnackbar?.("Upload cancelled", "info");
    onNavigate("product_catalog_bulk-upload-list");
  };

  const handleSaveDraft = () => {
    const payload = {
      fileName: fileName || "untitled-upload.csv",
      totalProducts: normalizedRows.length,
      status: "Review",
      successCount: 0,
      failedCount: 0,
      sourceDocumentName: fileName || "untitled-upload.csv",
      rows: normalizedRows,
      fieldMapping,
      sourceHeaders,
    };

    if (editingDraftId) {
      updateBulkUpload(editingDraftId, payload);
    } else {
      addBulkUpload(payload);
    }
    showSnackbar?.("Upload saved as draft", "success");
    onNavigate("product_catalog_bulk-upload-list");
  };

  const handleStartUpload = () => {
    const validRows = normalizedRows.filter((r) => !isRowInvalid(r));
    const invalidRows = normalizedRows.filter(isRowInvalid);

    const payload = {
      fileName: fileName || "untitled-upload.csv",
      totalProducts: normalizedRows.length,
      status: "Processing",
      successCount: 0,
      failedCount: 0,
      sourceDocumentName: fileName || "untitled-upload.csv",
      rows: normalizedRows,
      fieldMapping,
      sourceHeaders,
    };

    const record = editingDraftId
      ? updateBulkUpload(editingDraftId, payload)
      : addBulkUpload(payload);

    setProcessingRecordId(record.id);
    setStep("processing");

    // The completion timer lives independently of this page/component — it
    // keeps running via the module-level store even after the user navigates
    // away using the interstitial's "Back to list" button. Notifying is
    // handled separately by BulkUploadNotifier, which watches the store for
    // status transitions regardless of which page is mounted. Invalid rows
    // (if the user chose "Continue Anyway") are skipped from the catalog and
    // reported back as failed items in the batch detail.
    setTimeout(() => {
      updateBulkUpload(record.id, {
        status: "Completed",
        successCount: validRows.length,
        failedCount: invalidRows.length,
        failedRows: invalidRows,
      });
      addProducts(validRows);
    }, 5000);
  };

  const handleInputDataClick = () => {
    if (normalizedRows.some(isRowInvalid)) {
      setShowInvalidConfirm(true);
    } else {
      setShowInputDataConfirm(true);
    }
  };

  return (
    <div style={{ height: "calc(100vh - 64px)", padding: "24px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto", paddingBottom: (step === "upload" || step === "mapping" || step === "review") ? "96px" : "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", marginLeft: "-4px" }}
            onClick={() => onNavigate("product_catalog_bulk-upload-list")}
          >
            <ChevronLeft size={28} color="var(--neutral-on-surface-primary)" />
            <h1
              style={{
                margin: 0,
                fontSize: "var(--text-large-title)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--neutral-on-surface-primary)",
              }}
            >
              Add New Upload
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-title-3)", marginLeft: "32px" }}>
            <span
              style={{ color: "var(--neutral-on-surface-secondary)", cursor: "pointer" }}
              onClick={() => onNavigate("product_catalog_list")}
            >
              Product Catalog
            </span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
            <span
              style={{ color: "var(--neutral-on-surface-secondary)", cursor: "pointer" }}
              onClick={() => onNavigate("product_catalog_bulk-upload-list")}
            >
              Bulk Upload
            </span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
            <span style={{ color: "var(--neutral-on-surface-secondary)" }}>Add New Upload</span>
          </div>
        </div>
      </div>

      {step !== "processing" && (
        <div style={{ background: "var(--neutral-surface-primary)", borderRadius: "var(--radius-card)", border: "1px solid var(--neutral-line-separator-1)", padding: "20px 24px" }}>
          <Stepper currentKey={step === "mapping-processing" ? "mapping" : step} />
        </div>
      )}

      <div
        style={{
          background: "var(--neutral-surface-primary)",
          borderRadius: "var(--radius-card)",
          border: "1px solid var(--neutral-line-separator-1)",
          ...(step === "upload" || step === "mapping" || step === "review" ? { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" } : {}),
        }}
      >
        {step === "upload" && <UploadStep selectedFile={selectedFile} onFileSelected={setSelectedFile} isAnalyzing={isAnalyzing} />}
        {step === "mapping" && (
          <MappingStep
            headers={parsedHeaders}
            mapping={mapping}
            recommendation={recommendation}
            onMappingChange={(key, val) => setMapping((prev) => ({ ...prev, [key]: val }))}
            missingRequired={missingRequired}
          />
        )}
        {step === "review" && (
          <ReviewStep
            rows={normalizedRows}
            onRowsChange={setNormalizedRows}
          />
        )}
        {step === "mapping-processing" && (
          <BackgroundProcessingScreen
            title="Your file is being normalized"
            message="We’re also validating your data to prepare it for review. You can leave this page and we’ll notify you by email when it’s ready."
            buttonLabel="Back to Bulk Upload"
            onBackToList={() => onNavigate("product_catalog_bulk-upload-list")}
          />
        )}
        {step === "processing" && (
          <BackgroundProcessingScreen
            title="Your upload is being processed in the background"
            message={`${fileName ? `“${fileName}” is` : "Your file is"} being validated and imported. You'll be notified in-app and by email once it's done — feel free to leave this page.`}
            onBackToList={() => onNavigate("product_catalog_bulk-upload-list")}
          />
        )}
      </div>

      {(step === "upload" || step === "mapping" || step === "review") && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: isSidebarCollapsed ? "82px" : "286px",
            right: 0,
            transition: "left 0.2s ease",
            background: "var(--neutral-surface-primary)",
            borderTop: "1px solid var(--neutral-line-separator-1)",
            padding: "14px 24px",
            display: "flex",
            justifyContent: step === "upload" ? "flex-end" : "space-between",
            alignItems: "center",
            zIndex: 100,
          }}
        >
          {step === "upload" && (
            <Button variant="filled" size="large" disabled={!selectedFile || isAnalyzing} onClick={handleAnalyzeClick}>
              {isAnalyzing ? "Analyzing..." : "Analyze File"}
            </Button>
          )}
          {step === "mapping" && (
            <>
              <Button size="large" variant="tertiary" onClick={() => setShowCancelConfirm(true)} style={{ color: "var(--status-red-primary)" }}>
                Cancel Upload
              </Button>
              <Button variant="filled" size="large" disabled={missingRequired.length > 0} onClick={handleNormalizeAndReview}>
                Normalize and Review
              </Button>
            </>
          )}
          {step === "review" && (
            <>
              <Button size="large" variant="tertiary" onClick={() => setShowCancelConfirm(true)} style={{ color: "var(--status-red-primary)" }}>
                Cancel Upload
              </Button>
              <div style={{ display: "flex", gap: "12px" }}>
                <Button variant="outlined" size="large" onClick={handleSaveDraft}>Save as Draft</Button>
                <Button variant="filled" size="large" onClick={handleInputDataClick}>
                  Input Data
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      <CancelUploadConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancelUpload}
      />

      <InvalidDataConfirmModal
        isOpen={showInvalidConfirm}
        onClose={() => setShowInvalidConfirm(false)}
        onContinue={handleStartUpload}
        invalidCount={normalizedRows.filter(isRowInvalid).length}
      />

      <InputDataConfirmModal
        isOpen={showInputDataConfirm}
        onClose={() => setShowInputDataConfirm(false)}
        onConfirm={handleStartUpload}
        productCount={normalizedRows.length}
      />
    </div>
  );
};

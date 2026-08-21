import React from "react";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { DownloadIcon } from "../../../components/icons/Icons.jsx";

// Shown right after an analyze failure redirects the user back to the upload
// field. Two variants depending on what actually went wrong:
// - "error": analyzeFile() itself failed (unreadable file structure, timeout,
//   or the demo's "Simulate Timeout" control) — the secondary action is
//   "Try Again", which re-runs analysis on the same file (see
//   BulkUploadNewPage.handleTryAgainAnalyze).
// - "empty": the file was read fine but contained no rows — the secondary
//   action is just dismissing the modal, since retrying the same file would
//   produce the same empty result; the user needs to fix/replace the file.
export const UseTemplateSuggestionModal = ({ isOpen, onClose, onDownloadTemplate, onTryAgain, variant = "empty" }) => {
  const isError = variant === "error";
  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title={isError ? "Unable to analyze file" : "No data found"}
      description={
        isError
          ? "We couldn’t process your file. Try again, or use our template to prepare your data in the recommended format."
          : "We couldn’t find any data to process in your file. Add your data and try again, or use our template to get started."
      }
      width="560px"
      hideFooterDivider
      footerPaddingTop={24}
      footer={
        <>
          <Button
            variant="outlined"
            size="large"
            onClick={() => {
              if (isError) {
                onTryAgain?.();
              }
              onClose();
            }}
            style={{ flex: 1 }}
          >
            {isError ? "Try Again" : "Not Now"}
          </Button>
          <Button
            variant="filled"
            size="large"
            leftIcon={DownloadIcon}
            onClick={() => {
              onDownloadTemplate();
              onClose();
            }}
            style={{ flex: 1 }}
          >
            Download Template
          </Button>
        </>
      }
    />
  );
};

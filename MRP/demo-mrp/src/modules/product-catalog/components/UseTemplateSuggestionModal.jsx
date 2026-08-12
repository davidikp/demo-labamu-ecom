import React from "react";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { DownloadIcon } from "../../../components/icons/Icons.jsx";

// Shown right after an analyze failure (timed out / no data found) redirects
// the user back to the upload field — nudges them toward the Labamu
// template instead of leaving them to guess why their file didn't work.
export const UseTemplateSuggestionModal = ({ isOpen, onClose, onDownloadTemplate }) => (
  <GeneralModal
    isOpen={isOpen}
    onClose={onClose}
    title="Try uploading with our template"
    description="Use our template to organize your product data in a format that’s easier to process."
    width="560px"
    hideFooterDivider
    footerPaddingTop={24}
    footer={
      <>
        <Button variant="outlined" size="large" onClick={onClose} style={{ flex: 1 }}>
          Not Now
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

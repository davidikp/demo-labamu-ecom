import React from "react";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { Button } from "../../../components/common/Button.jsx";

export const CancelUploadConfirmModal = ({ isOpen, onClose, onConfirm }) => (
  <GeneralModal
    isOpen={isOpen}
    onClose={onClose}
    title="Cancel this upload?"
    description="You won’t be able to continue this upload. It will remain in the Bulk Upload list with a Cancelled status."
    width="560px"
    hideFooterDivider
    footerPaddingTop={24}
    footer={
      <>
        <Button variant="outlined" size="large" onClick={onClose} style={{ flex: 1 }}>
          Keep Editing
        </Button>
        <Button
          variant="danger-filled"
          size="large"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          style={{ flex: 1 }}
        >
          Yes, Cancel
        </Button>
      </>
    }
  />
);

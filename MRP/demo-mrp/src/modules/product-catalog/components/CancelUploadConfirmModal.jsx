import React from "react";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { Button } from "../../../components/common/Button.jsx";

export const CancelUploadConfirmModal = ({ isOpen, onClose, onConfirm }) => (
  <GeneralModal
    isOpen={isOpen}
    onClose={onClose}
    title="Cancel this upload?"
    description="The upload process will be cancelled and marked as Cancelled in the Bulk Upload list. This action cannot be undone."
    width="400px"
    footer={
      <>
        <Button variant="outlined" size="large" onClick={onClose} style={{ flex: 1 }}>
          Keep Editing
        </Button>
        <Button
          variant="danger"
          size="large"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          style={{ flex: 1 }}
        >
          Cancel Upload
        </Button>
      </>
    }
  />
);

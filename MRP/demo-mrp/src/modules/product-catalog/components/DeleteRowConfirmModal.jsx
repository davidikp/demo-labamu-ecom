import React from "react";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { Button } from "../../../components/common/Button.jsx";

export const DeleteRowConfirmModal = ({ isOpen, onClose, onConfirm, count = 1 }) => (
  <GeneralModal
    isOpen={isOpen}
    onClose={onClose}
    title={count > 1 ? `Delete ${count} rows?` : "Delete this row?"}
    description="This action cannot be undone."
    width="400px"
    footer={
      <>
        <Button variant="outlined" size="large" onClick={onClose} style={{ flex: 1 }}>
          Cancel
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
          Delete
        </Button>
      </>
    }
  />
);

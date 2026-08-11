import React from "react";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { Button } from "../../../components/common/Button.jsx";

export const InputDataConfirmModal = ({ isOpen, onClose, onConfirm, productCount }) => (
  <GeneralModal
    isOpen={isOpen}
    onClose={onClose}
    title="Input this data?"
    description={`${productCount} product${productCount > 1 ? "s" : ""} will be added to your catalog. This action cannot be undone.`}
    width="420px"
    footer={
      <>
        <Button variant="outlined" size="large" onClick={onClose} style={{ flex: 1 }}>
          Cancel
        </Button>
        <Button
          variant="filled"
          size="large"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          style={{ flex: 1 }}
        >
          Input Data
        </Button>
      </>
    }
  />
);

import React from "react";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { Button } from "../../../components/common/Button.jsx";

export const InvalidDataConfirmModal = ({ isOpen, onClose, onContinue, invalidCount }) => (
  <GeneralModal
    isOpen={isOpen}
    onClose={onClose}
    title="Some rows are invalid"
    description={`${invalidCount} row${invalidCount > 1 ? "s are" : " is"} missing required fields. Do you want to continue anyway?`}
    width="420px"
    footer={
      <>
        <Button variant="outlined" size="large" onClick={onClose} style={{ flex: 1 }}>
          Review Data
        </Button>
        <Button
          variant="filled"
          size="large"
          onClick={() => {
            onContinue();
            onClose();
          }}
          style={{ flex: 1 }}
        >
          Continue Anyway
        </Button>
      </>
    }
  />
);

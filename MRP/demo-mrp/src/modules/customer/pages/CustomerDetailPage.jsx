import React, { useState } from "react";
import { ChevronLeftIcon, EditIcon, DeleteIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { SectionCard, LabelValue } from "../../purchase-order/components/detail/shared/PoDetailSharedComponents.jsx";
import { PersonInChargeTable } from "../components/PersonInChargeTable.jsx";
import { deleteCustomer, getCustomerTagLabel } from "../mock/customerMocks.js";

export const CustomerDetailPage = ({ customer, onNavigate, showSnackbar, t }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (!customer) {
    return (
      <div style={{ padding: "24px" }}>
        <span>Customer not found.</span>
      </div>
    );
  }

  const handleDelete = () => {
    deleteCustomer(customer.id);
    setIsDeleteModalOpen(false);
    showSnackbar?.("Customer successfully deleted", "success");
    onNavigate("list");
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        background: "var(--neutral-background-primary)",
        height: "100%",
        overflowY: "auto",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", marginLeft: "-4px" }}
            onClick={() => onNavigate("list")}
          >
            <ChevronLeftIcon size={28} color="var(--neutral-on-surface-primary)" />
            <h1 style={{ margin: 0, fontSize: "var(--text-large-title)", fontWeight: "var(--font-weight-bold)" }}>
              Customer Detail
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-title-3)", marginLeft: "32px" }}>
            <span style={{ color: "var(--neutral-on-surface-secondary)", cursor: "pointer" }} onClick={() => onNavigate("list")}>
              Customers
            </span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
            <span style={{ color: "var(--neutral-on-surface-secondary)" }}>Customer Detail</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <Button variant="outlined" leftIcon={EditIcon} onClick={() => onNavigate("create", customer)}>
            Edit
          </Button>
          <Button
            variant="outlined"
            leftIcon={DeleteIcon}
            onClick={() => setIsDeleteModalOpen(true)}
            style={{ borderColor: "var(--status-red-primary)", color: "var(--status-red-primary)" }}
          >
            Delete
          </Button>
        </div>
      </div>

      <SectionCard title="Screening Status">
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <StatusBadge variant={customer.screeningStatus === "Pass" ? "green-light" : "red-light"}>
            {customer.screeningStatus || "Pending"}
          </StatusBadge>
          <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>
            {customer.lastScreenedAt ? `Last screened: ${customer.lastScreenedAt}` : "Not screened yet"}
          </span>
        </div>
      </SectionCard>

      <SectionCard title="Customer Information">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
          <LabelValue label="Customer Name" value={customer.name || "-"} />
          <LabelValue label="Customer Email" value={customer.email || "-"} />
          <LabelValue label="Customer Phone" value={customer.phone ? `${customer.phoneCode || ""} ${customer.phone}`.trim() : "-"} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
          <LabelValue
            label="Customer Tag"
            value={customer.tags?.length ? customer.tags.map(getCustomerTagLabel).join(", ") : "-"}
          />
          <LabelValue label="Customer Country" value={customer.country || "-"} />
        </div>
        <LabelValue label="Customer Address" value={customer.address || "-"} />
      </SectionCard>

      <SectionCard title="Person In Charge">
        <PersonInChargeTable pics={customer.pics || []} onChange={() => {}} readOnly />
      </SectionCard>

      <GeneralModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Customer?"
        width="440px"
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <Button variant="outlined" size="large" onClick={() => setIsDeleteModalOpen(false)} style={{ flex: 1 }}>
              Cancel
            </Button>
            <Button
              variant="filled"
              size="large"
              onClick={handleDelete}
              style={{ flex: 1, background: "var(--status-red-primary)" }}
            >
              Delete
            </Button>
          </div>
        }
      >
        <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)" }}>
          This action cannot be undone. Are you sure you want to delete "{customer.name}"?
        </span>
      </GeneralModal>
    </div>
  );
};

import React, { useState } from "react";
import { ChevronLeftIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { FormField, InputField } from "../../../components/index.js";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { FilterMenu } from "../../../components/molecules/FilterMenu.jsx";
import { SectionCard } from "../../purchase-order/components/detail/shared/PoDetailSharedComponents.jsx";
import { PersonInChargeTable, nextPicRowId } from "../components/PersonInChargeTable.jsx";
import { COUNTRY_CODE_OPTIONS, COUNTRY_OPTIONS } from "../../../constants/appConstants.js";
import { MOCK_CUSTOMER_TAGS, createCustomer, updateCustomer } from "../mock/customerMocks.js";

const EMPTY_FORM = {
  name: "",
  email: "",
  phoneCode: "+62",
  phone: "",
  tags: [],
  country: "",
  address: "",
};

// Used for both "New Customer" (no initialData) and "Edit Customer"
// (initialData = the customer record being edited) — same component per the
// user's requirement that Edit reuses this page pre-filled.
export const CustomerCreatePage = ({ onNavigate, showSnackbar, t, initialData }) => {
  // App.jsx's route resolver falls back to a placeholder `{ id: "create", ... }`
  // object as `location.state` whenever the URL has no real state (e.g. a
  // fresh "New Customer" navigation) — checking `.name` (always present on a
  // real customer record) avoids misreading that placeholder as edit mode.
  const isEditMode = !!initialData?.name;

  const [form, setForm] = useState(() =>
    isEditMode
      ? {
          name: initialData.name || "",
          email: initialData.email || "",
          phoneCode: initialData.phoneCode || "+62",
          phone: initialData.phone || "",
          tags: initialData.tags || [],
          country: initialData.country || "",
          address: initialData.address || "",
        }
      : EMPTY_FORM
  );
  const [pics, setPics] = useState(() =>
    isEditMode && initialData.pics?.length
      ? initialData.pics
      : [{ id: nextPicRowId(), primary: true, name: "", email: "", role: "Approver", phoneCode: "+62", phone: "" }]
  );
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Field cannot be empty";
    if (!form.country) newErrors.country = "Field cannot be empty";
    if (!form.address.trim()) newErrors.address = "Field cannot be empty";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const payload = { ...form, pics };

    if (isEditMode) {
      const updated = updateCustomer(initialData.id, payload);
      showSnackbar?.("Customer successfully updated", "success");
      onNavigate("detail", updated);
    } else {
      const created = createCustomer(payload);
      showSnackbar?.("Customer successfully created", "success");
      onNavigate("detail", created);
    }
  };

  const handleBack = () => {
    if (isEditMode) onNavigate("detail", initialData);
    else onNavigate("list");
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
          <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", marginLeft: "-4px" }} onClick={handleBack}>
            <ChevronLeftIcon size={28} color="var(--neutral-on-surface-primary)" />
            <h1 style={{ margin: 0, fontSize: "var(--text-large-title)", fontWeight: "var(--font-weight-bold)" }}>
              {isEditMode ? "Edit Customer" : "Create Customer"}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-title-3)", marginLeft: "32px" }}>
            <span style={{ color: "var(--neutral-on-surface-secondary)", cursor: "pointer" }} onClick={() => onNavigate("list")}>
              Customers
            </span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
            <span style={{ color: "var(--neutral-on-surface-secondary)" }}>
              {isEditMode ? "Edit Customer" : "Create Customer"}
            </span>
          </div>
        </div>

        <Button variant="filled" onClick={handleSave}>
          {isEditMode ? "Update" : "Save"}
        </Button>
      </div>

      <SectionCard title="Customer Information">
        <div style={{ display: "flex", gap: "16px" }}>
          <div style={{ flex: 1 }}>
            <InputField
              label="Customer Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter customer name"
              error={errors.name}
            />
          </div>
          <div style={{ flex: 1 }}>
            <InputField
              label="Customer Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="customer@example.com"
            />
          </div>
          <div style={{ flex: 1 }}>
            <FormField label="Customer Phone">
              <div style={{ display: "flex", gap: "8px" }}>
                <div style={{ width: "110px" }}>
                  <DropdownSelect
                    value={form.phoneCode}
                    onChange={(val) => setForm({ ...form, phoneCode: val })}
                    options={COUNTRY_CODE_OPTIONS.map((c) => ({ value: c.code, label: `${c.flag} ${c.code}` }))}
                    placeholder="+62"
                  />
                </div>
                <InputField
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
            </FormField>
          </div>
        </div>

        <FormField label="Customer Tag">
          <FilterMenu
            label="Select customer tags"
            multiple
            searchable={false}
            options={MOCK_CUSTOMER_TAGS.filter((tag) => tag.status === "Active").map((tag) => ({ value: tag.id, label: tag.name }))}
            values={form.tags}
            onChangeMultiple={(vals) => setForm({ ...form, tags: vals })}
          />
        </FormField>

        <div style={{ display: "flex", gap: "16px" }}>
          <div style={{ flex: 1 }}>
            <FormField label="Customer Country" required error={errors.country}>
              <DropdownSelect
                value={form.country}
                onChange={(val) => setForm({ ...form, country: val })}
                options={COUNTRY_OPTIONS.map((c) => ({ value: c.value, label: `${c.flag} ${c.label}` }))}
                placeholder="Select customer country"
                hasError={!!errors.country}
                searchable
              />
            </FormField>
          </div>
          <div style={{ flex: 1 }} />
        </div>

        <InputField
          label="Customer Address"
          required
          multiline
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="Enter customer address"
          error={errors.address}
        />
      </SectionCard>

      <SectionCard title="Person In Charge">
        <PersonInChargeTable pics={pics} onChange={setPics} />
      </SectionCard>
    </div>
  );
};

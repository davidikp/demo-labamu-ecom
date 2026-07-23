import React, { useEffect, useRef, useState } from "react";
import { CloseIcon, SearchIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { FormField, InputField } from "../../../components/index.js";
import { MOCK_MATERIALS_DATA } from "../../materials/mock/materialsMocks.js";
import { getBomLinkedToMaterial } from "../../bill-of-materials/mock/bomMocks.js";
import { createWorkOrder } from "../mock/workOrderMocks.js";

const PRIORITY_OPTIONS = [
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
];

const EMPTY_FORM = { materialId: "", materialSearchText: "", quantity: "", priority: "Medium", notes: "" };

// Combobox with the search typed directly into the field itself (rather than
// a separate search box inside a dropdown menu, like DropdownSelect uses).
// Options show the material name as the primary label and "SKU • BOM name"
// as the description underneath.
const MaterialComboBox = ({ value, searchText, options, onSelect, onSearchChange, placeholder, hasError }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointerDown = (event) => {
      if (containerRef.current?.contains(event.target)) return;
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  const filteredOptions = options.filter((opt) => {
    const term = searchText.trim().toLowerCase();
    if (!term) return true;
    return (
      opt.name.toLowerCase().includes(term) ||
      opt.sku.toLowerCase().includes(term) ||
      (opt.bomName || "").toLowerCase().includes(term)
    );
  });

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <div style={{ position: "relative" }}>
        <input
          value={searchText}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          style={{
            width: "100%",
            height: "46px",
            padding: "0 16px 0 40px",
            borderRadius: "8px",
            border: `1px solid ${hasError ? "var(--status-red-primary)" : isOpen ? "var(--feature-brand-primary)" : "#e9e9e9"}`,
            outline: "none",
            fontSize: "var(--text-subtitle-1)",
            fontFamily: "inherit",
            boxSizing: "border-box",
            background: "var(--neutral-surface-primary)",
            color: "var(--neutral-on-surface-primary)",
          }}
        />
        <SearchIcon
          size={18}
          color="var(--neutral-on-surface-tertiary)"
          style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
        />
      </div>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            maxHeight: "260px",
            overflowY: "auto",
            background: "var(--neutral-surface-primary)",
            border: "1px solid var(--neutral-line-separator-1)",
            borderRadius: "12px",
            boxShadow: "var(--elevation-lg)",
            zIndex: 5100,
            padding: "6px",
          }}
        >
          {filteredOptions.length === 0 ? (
            <div style={{ padding: "16px", textAlign: "center", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-tertiary)" }}>
              No materials found.
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const selected = opt.id === value;
              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    onSelect(opt);
                    setIsOpen(false);
                  }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    background: selected ? "var(--feature-brand-container-lighter)" : "transparent",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                  onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)"; }}
                  onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{
                    fontSize: "var(--text-title-3)",
                    fontWeight: selected ? "var(--font-weight-bold)" : "var(--font-weight-regular)",
                    color: selected ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-primary)",
                  }}>
                    {opt.name}
                  </span>
                  <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>
                    {opt.sku} • {opt.bomName}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

// Standalone Work Order creation entry point for producing a Material into
// stock (a "Stock Build" work order) — separate from the existing Product /
// Customer Order work order creation flow (which still goes through
// PurchaseOrderCreatePage). Only Materials that already have a linked BOM
// are eligible targets, since the Materials table on the WO Detail page is
// BOM-driven. Mirrors the right-side drawer pattern used by
// StockBatchesTab.jsx's "Add Stock Batch" drawer.
export const WorkOrderCreateDrawer = ({ isOpen, onClose, onCreated }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData(EMPTY_FORM);
      setErrors({});
    }
  }, [isOpen]);

  const eligibleMaterials = MOCK_MATERIALS_DATA.filter(
    (m) => !!getBomLinkedToMaterial(m.id)
  );

  const materialOptions = eligibleMaterials.map((m) => ({
    id: m.id,
    name: m.name,
    sku: m.sku,
    bomName: getBomLinkedToMaterial(m.id)?.name || "-",
  }));

  const validate = () => {
    const newErrors = {};
    if (!formData.materialId) newErrors.materialId = "Field cannot be empty";
    if (!formData.quantity || Number(formData.quantity) <= 0) newErrors.quantity = "Field cannot be empty";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const material = eligibleMaterials.find((m) => m.id === formData.materialId);
    const linkedBom = getBomLinkedToMaterial(formData.materialId);

    const record = createWorkOrder({
      product: material?.name,
      sku: material?.sku,
      materialId: material?.id,
      qty: Number(formData.quantity),
      priority: formData.priority,
      notes: formData.notes,
      bomId: linkedBom?.id || null,
    });

    onClose();
    onCreated?.(record);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.28)",
      display: "flex",
      justifyContent: "flex-end",
      zIndex: 13000,
    }}>
      <div style={{ position: "absolute", inset: 0 }} onClick={onClose} />
      <div style={{
        position: "relative",
        width: "520px",
        maxWidth: "calc(100vw - 24px)",
        height: "100vh",
        background: "var(--neutral-surface-primary)",
        boxShadow: "-12px 0 32px rgba(0, 0, 0, 0.08)",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Drawer Header */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid var(--neutral-line-separator-1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--neutral-surface-primary)"
        }}>
          <h2 style={{
            margin: 0,
            fontSize: "var(--text-title-1)",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--neutral-on-surface-primary)"
          }}>
            Add New Work Order
          </h2>
          <IconButton icon={CloseIcon} onClick={onClose} size="small" color="var(--neutral-on-surface-primary)" />
        </div>

        {/* Drawer Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
          <FormField label="Target Material" required error={errors.materialId}>
            <MaterialComboBox
              value={formData.materialId}
              searchText={formData.materialSearchText}
              options={materialOptions}
              hasError={!!errors.materialId}
              placeholder={
                materialOptions.length === 0
                  ? "No materials with a linked BOM available"
                  : "Search material name"
              }
              onSearchChange={(text) =>
                setFormData((prev) => ({ ...prev, materialSearchText: text, materialId: "" }))
              }
              onSelect={(opt) =>
                setFormData((prev) => ({ ...prev, materialId: opt.id, materialSearchText: opt.name }))
              }
            />
          </FormField>

          <FormField label="Quantity" required error={errors.quantity}>
            <InputField
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="Enter quantity"
              error={errors.quantity}
            />
          </FormField>

          <FormField label="Priority" required>
            <DropdownSelect
              showDivider
              value={formData.priority}
              onChange={(val) => setFormData({ ...formData, priority: val })}
              options={PRIORITY_OPTIONS}
              placeholder="Select priority"
            />
          </FormField>

          <InputField
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add notes (optional)"
            multiline
            maxLength={400}
            showCounter
          />
        </div>

        {/* Drawer Footer */}
        <div style={{
          padding: "20px 24px",
          borderTop: "1px solid var(--neutral-line-separator-1)",
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
          background: "var(--neutral-surface-primary)"
        }}>
          <Button variant="outlined" size="large" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
          <Button variant="filled" size="large" onClick={handleSave} style={{ flex: 1 }}>Save</Button>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../../components/common/Button.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { ToggleSwitch } from "../../../components/common/ToggleSwitch.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { ChipTabs, Table } from "../../../ce-ui";
import {
  clearNavigationGuard,
  setNavigationGuard,
} from "../../../utils/navigationGuard.js";
import {
  ALL_NOTIFICATION_RULES,
  DEFAULT_NOTIFICATION_SETTINGS,
  MAX_REMIND_BEFORE_DAYS,
  MIN_REMIND_BEFORE_DAYS,
  NOTIFICATION_GROUPS,
  REMINDER_SUPPORTED_RULE_IDS,
  buildDefaultCompanySettings,
  cloneCompanySettings,
  pickLocalized,
} from "../../../data/notification/notificationDefaults.js";

const cellPadStyle = { padding: "12px 0", lineHeight: "20px" };
const toggleCellStyle = {
  padding: "12px 0",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

// Darker grey for a locked (disabled + on) toggle so it reads as "on but
// locked", clearly distinct from a disabled-off toggle.
const LOCKED_ON_TOGGLE_CLASS = "!bg-[#9AA0A6]";

const remindBeforeInvalid = (value) =>
  !Number.isInteger(value) ||
  value < MIN_REMIND_BEFORE_DAYS ||
  value > MAX_REMIND_BEFORE_DAYS;

// Collapse grouped admin toggles (e.g. "Receipt Status Updates") into one row.
const buildDisplayUnits = (items, language) => {
  const units = [];
  const seenGroups = new Set();
  items.forEach((rule) => {
    if (!rule.groupId) {
      units.push({ kind: "rule", key: rule.id, rule, memberIds: [rule.id] });
      return;
    }
    if (seenGroups.has(rule.groupId)) return;
    seenGroups.add(rule.groupId);
    const group = NOTIFICATION_GROUPS[rule.groupId];
    const memberIds = group?.memberIds || [rule.id];
    units.push({
      kind: "group",
      key: rule.groupId,
      memberIds,
      rule: {
        id: rule.groupId,
        name: group?.label ? pickLocalized(group.label, language) : rule.name,
        description: group?.description || {
          en: "Outsourced receipt recorded and fully received updates.",
          id: "Pembaruan saat penerimaan outsource dicatat dan telah diterima sepenuhnya.",
        },
        type: "configurable",
        recipient: rule.recipient,
        permission: rule.permission,
        todo: null,
      },
    });
  });
  return units;
};

const NotificationSettingsPage = ({
  isSidebarCollapsed, // preserved for API compatibility with the shell
  notificationSettings,
  onSaveNotificationSettings,
  language = "en",
}) => {
  const [activeModule, setActiveModule] = useState(
    DEFAULT_NOTIFICATION_SETTINGS[0]?.id
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [settings, setSettings] = useState(() =>
    cloneCompanySettings(notificationSettings || buildDefaultCompanySettings())
  );
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    cloneCompanySettings(notificationSettings || buildDefaultCompanySettings())
  );
  const [toastMessage, setToastMessage] = useState("");
  // Pending navigation awaiting discard confirmation: null | {type:"cancel"}
  const [pendingAction, setPendingAction] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    const next = cloneCompanySettings(
      notificationSettings || buildDefaultCompanySettings()
    );
    setSettings(next);
    setSavedSnapshot(cloneCompanySettings(next));
  }, [notificationSettings]);

  useEffect(
    () => () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    },
    []
  );

  const showToast = (message) => {
    setToastMessage(message);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMessage(""), 3200);
  };

  const isDirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSnapshot),
    [settings, savedSnapshot]
  );

  // Register a navigation guard so leaving Notification Settings with unsaved
  // changes prompts to discard. Switching chip tabs stays internal (not routed
  // through the guard), so drafts persist across modules.
  const isDirtyRef = useRef(false);
  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);
  useEffect(() => {
    const guard = (proceed) => {
      if (!isDirtyRef.current) return true;
      setPendingAction({ type: "leave", proceed });
      return false;
    };
    setNavigationGuard(guard);
    return () => clearNavigationGuard(guard);
  }, []);

  const patchRules = (ids, patch) => {
    setSettings((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        next[id] = { ...next[id], ...patch };
      });
      return next;
    });
  };

  const setChannel = (unit, channel, nextValue) => {
    patchRules(unit.memberIds, { [channel]: nextValue });
  };

  const setRemind = (unit, rawValue) => {
    patchRules(unit.memberIds, {
      remindBefore: rawValue === "" ? "" : Number(rawValue),
    });
  };

  const handleSave = () => {
    // Reminder validity is shown inline per input; block the save if anything
    // is still invalid.
    const hasReminderOffender = ALL_NOTIFICATION_RULES.filter((rule) =>
      REMINDER_SUPPORTED_RULE_IDS.has(rule.id)
    ).some((rule) => remindBeforeInvalid(settings[rule.id]?.remindBefore));
    if (hasReminderOffender) return;

    const saved = cloneCompanySettings(settings);
    setSavedSnapshot(saved);
    onSaveNotificationSettings?.(saved);
    showToast("Notification settings saved");
  };

  // Switching module tabs keeps the draft — no confirmation (drafts persist
  // across modules within Notification Settings).
  const requestModule = (id) => {
    if (id === activeModule) return;
    setActiveModule(id);
    setSearchQuery("");
  };

  const requestCancel = () => {
    if (!isDirty) return;
    setPendingAction({ type: "cancel" });
  };

  const confirmDiscard = () => {
    const action = pendingAction;
    setSettings(cloneCompanySettings(savedSnapshot));
    setPendingAction(null);
    if (action?.type === "leave") {
      // Allow the deferred navigation to proceed (component will unmount).
      clearNavigationGuard();
      action.proceed?.();
      return;
    }
    showToast("Changes discarded");
  };

  const chipTabs = DEFAULT_NOTIFICATION_SETTINGS.map((section) => ({
    id: section.id,
    label: pickLocalized(section.title, language),
    count: buildDisplayUnits(section.items, language).length,
  }));

  const activeSection = useMemo(
    () =>
      DEFAULT_NOTIFICATION_SETTINGS.find((s) => s.id === activeModule) ||
      DEFAULT_NOTIFICATION_SETTINGS[0],
    [activeModule]
  );

  const renderToggle = (unit, channel) => {
    const primaryId = unit.memberIds[0];
    const state = settings[primaryId] || { inApp: false, email: false };
    const isRequired = unit.kind === "rule" && unit.rule.type === "required";
    if (isRequired) {
      return (
        <ToggleSwitch checked disabled className={LOCKED_ON_TOGGLE_CLASS} onChange={() => {}} />
      );
    }
    return (
      <ToggleSwitch
        checked={state[channel]}
        onChange={(next) => setChannel(unit, channel, next)}
      />
    );
  };

  const renderRemindBefore = (unit) => {
    const primaryId = unit.memberIds[0];
    if (!REMINDER_SUPPORTED_RULE_IDS.has(primaryId)) return null;
    const value = settings[primaryId]?.remindBefore;
    const invalid = remindBeforeInvalid(value);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-secondary)" }}>
            Remind
          </span>
          <input
            type="number"
            min={MIN_REMIND_BEFORE_DAYS}
            max={MAX_REMIND_BEFORE_DAYS}
            step={1}
            value={value ?? ""}
            onChange={(event) => setRemind(unit, event.target.value)}
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "56px",
              height: "34px",
              padding: "0 8px",
              borderRadius: "8px",
              border: `1px solid ${
                invalid ? "var(--status-red-primary)" : "var(--neutral-line-separator-1)"
              }`,
              fontSize: "var(--text-title-3)",
              textAlign: "center",
              boxSizing: "border-box",
            }}
          />
          <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-secondary)" }}>
            days before
          </span>
        </div>
        {invalid ? (
          <span
            style={{
              fontSize: "11px",
              lineHeight: "14px",
              color: "var(--status-red-primary)",
            }}
          >
            {`Remind Day must be between ${MIN_REMIND_BEFORE_DAYS}-${MAX_REMIND_BEFORE_DAYS} days`}
          </span>
        ) : null}
      </div>
    );
  };

  const filteredUnits = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return buildDisplayUnits(activeSection.items, language).filter((unit) => {
      if (!q) return true;
      const r = unit.rule;
      return `${r.name} ${pickLocalized(r.description, language)} ${r.permission || "No permission mapping"}`
        .toLowerCase()
        .includes(q);
    });
  }, [activeSection, searchQuery, language]);

  const rows = filteredUnits.map((unit) => ({
    id: unit.key,
    unit,
    name: unit.rule.name,
    permission: unit.rule.permission,
  }));

  const columns = [
    {
      key: "name",
      header: "Notification",
      width: 320,
      render: (_value, row) => {
        const isRequired =
          row.unit.kind === "rule" && row.unit.rule.type === "required";
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "12px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontWeight: "var(--font-weight-bold)" }}>{row.name}</span>
              {isRequired ? (
                <StatusBadge variant="blue-light">Required</StatusBadge>
              ) : null}
            </div>
            <span
              style={{
                fontSize: "12px",
                lineHeight: "16px",
                color: "var(--neutral-on-surface-secondary)",
              }}
            >
              {pickLocalized(row.unit.rule.description, language)}
            </span>
            {renderRemindBefore(row.unit)}
          </div>
        );
      },
    },
    {
      key: "permission",
      header: "Permission",
      width: 220,
      render: (value) => (
        <div style={cellPadStyle}>{value || "No permission mapping"}</div>
      ),
    },
    {
      key: "unit",
      columnId: "inapp",
      header: "In-app",
      align: "center",
      width: 100,
      render: (_value, row) => (
        <div style={toggleCellStyle}>{renderToggle(row.unit, "inApp")}</div>
      ),
    },
    {
      key: "unit",
      columnId: "email",
      header: "Email",
      align: "center",
      width: 100,
      render: (_value, row) => (
        <div style={toggleCellStyle}>{renderToggle(row.unit, "email")}</div>
      ),
    },
  ];

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        padding: "24px 24px 0",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        overflow: "visible",
      }}
    >
      {toastMessage ? (
        <div
          style={{
            position: "sticky",
            top: "16px",
            alignSelf: "flex-end",
            background: "var(--status-green-primary)",
            color: "var(--status-green-on-primary)",
            padding: "12px 16px",
            borderRadius: "var(--radius-small)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            boxShadow: "var(--elevation-sm)",
            zIndex: 10,
            minWidth: "320px",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "var(--text-title-3)" }}>{toastMessage}</span>
          <span
            style={{
              fontWeight: "var(--font-weight-bold)",
              cursor: "pointer",
              fontSize: "var(--text-title-3)",
            }}
            onClick={() => setToastMessage("")}
          >
            Okay
          </span>
        </div>
      ) : null}

      <h1
        style={{
          margin: 0,
          fontSize: "var(--text-large-title)",
          fontWeight: "var(--font-weight-bold)",
        }}
      >
        Notification Settings
      </h1>

      {/* Module chip tabs — outside the content card, wrapping instead of scrolling */}
      <ChipTabs
        tabs={chipTabs}
        activeTab={activeModule}
        onChange={requestModule}
        className="flex-wrap"
      />

      {/* Content card — no accent bar, no divider between header and table.
          Scoped rule aligns the ce-ui table cells (default px-4) to 20px. */}
      <style>{`.notif-card table th, .notif-card table td { padding-left: 20px; padding-right: 20px; }
        .notif-card table td { vertical-align: top; }`}</style>
      <div
        className="notif-card"
        style={{
          background: "var(--neutral-surface-primary)",
          borderRadius: "16px",
          border: "1px solid var(--neutral-line-separator-1)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "20px 20px 12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
            <span style={{ fontSize: "16px", fontWeight: "var(--font-weight-bold)" }}>
              {pickLocalized(activeSection.title, language)}
            </span>
            <span
              style={{
                fontSize: "var(--text-title-3)",
                lineHeight: "20px",
                color: "var(--neutral-on-surface-secondary)",
              }}
            >
              {pickLocalized(activeSection.description, language)}
            </span>
          </div>
          <TableSearchField
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search notification, description, or permission"
            width="360px"
          />
        </div>
        <Table
          columns={columns}
          data={rows}
          totalRows={rows.length}
          showPagination={false}
          className="!h-auto"
          selectedRowId={null}
        />
      </div>

      {/* Footer action bar */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          marginTop: "auto",
          marginLeft: "-24px",
          marginRight: "-24px",
          padding: "16px 24px",
          background: "var(--neutral-surface-primary)",
          borderTop: "1px solid var(--neutral-line-separator-1)",
          boxShadow: "0 -4px 12px rgba(0,0,0,0.04)",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "12px",
          zIndex: 5,
        }}
      >
        <Button variant="outlined" size="large" onClick={requestCancel}>
          Cancel
        </Button>
        <Button variant="filled" size="large" onClick={handleSave}>
          Save Changes
        </Button>
      </div>

      {/* Discard-changes confirmation modal (matches Purchase Order create). */}
      <GeneralModal
        isOpen={pendingAction !== null}
        onClose={() => setPendingAction(null)}
        title="Discard changes?"
        footer={
          <>
            <Button
              variant="filled"
              size="large"
              style={{ width: "100%" }}
              onClick={confirmDiscard}
            >
              Yes, Discard
            </Button>
            <Button
              variant="outlined"
              size="large"
              style={{ width: "100%" }}
              onClick={() => setPendingAction(null)}
            >
              Keep Editing
            </Button>
          </>
        }
      />
    </div>
  );
};

export { NotificationSettingsPage };

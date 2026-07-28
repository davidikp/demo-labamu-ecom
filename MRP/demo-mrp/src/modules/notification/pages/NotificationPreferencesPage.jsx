import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../../components/common/Button.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { ToggleSwitch } from "../../../components/common/ToggleSwitch.jsx";
import { ChipTabs, Table } from "../../../ce-ui";
import {
  ALL_NOTIFICATION_RULES,
  DEFAULT_NOTIFICATION_SETTINGS,
  NOTIFICATION_GROUPS,
  PERSONAL_PREFERENCE_OPTIONS,
  REMINDER_SUPPORTED_RULE_IDS,
  buildDefaultCompanySettings,
  buildDefaultPersonalPreferences,
  clonePersonalPreferences,
} from "../../../data/notification/notificationDefaults.js";
import {
  effectiveSourceLabel,
  resolveEffectiveStatus,
} from "../../../utils/notification/notificationUtils.js";

// The demo user (Owner) can access every module, so no rows are hidden. In a
// real build this set would come from the user's sub-resource permissions and
// gate visibility per PRD AC #9.
const ACCESSIBLE_PERMISSIONS = null; // null = all accessible

const cellPadStyle = { padding: "12px 0", lineHeight: "20px" };
const toggleCellStyle = {
  padding: "12px 0",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const PREFERENCE_CHOICES = [
  { value: PERSONAL_PREFERENCE_OPTIONS.useCompanyDefault, label: "Default" },
  { value: PERSONAL_PREFERENCE_OPTIONS.on, label: "On" },
  { value: PERSONAL_PREFERENCE_OPTIONS.off, label: "Off" },
];

const prefPillStyle = (isActive) => ({
  flex: 1,
  height: "28px",
  padding: "0 10px",
  borderRadius: "8px",
  border: "none",
  background: isActive ? "var(--feature-brand-primary)" : "transparent",
  color: isActive
    ? "var(--feature-brand-on-primary, #FFFFFF)"
    : "var(--neutral-on-surface-secondary)",
  fontSize: "12px",
  fontWeight: isActive ? "var(--font-weight-bold)" : "var(--font-weight-regular)",
  cursor: "pointer",
  whiteSpace: "nowrap",
});

// Collapse grouped admin toggles (e.g. "Receipt Status Updates") into one row.
const buildDisplayUnits = (items) => {
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
        name: group?.label || rule.name,
        trigger: "Outsource receipt recorded / fully received",
        type: "configurable",
        recipient: rule.recipient,
        permission: rule.permission,
        todo: null,
      },
    });
  });
  return units;
};

const canAccess = (permission) =>
  ACCESSIBLE_PERMISSIONS === null ||
  permission === null ||
  ACCESSIBLE_PERMISSIONS.includes(permission);

const NotificationPreferencesPage = ({
  isSidebarCollapsed, // preserved for API compatibility with the shell
  companySettings,
  personalPreferences,
  onSavePersonalPreferences,
}) => {
  const company = companySettings || buildDefaultCompanySettings();

  const [activeModule, setActiveModule] = useState(
    DEFAULT_NOTIFICATION_SETTINGS[0]?.id
  );
  const [prefs, setPrefs] = useState(() =>
    clonePersonalPreferences(personalPreferences || buildDefaultPersonalPreferences())
  );
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    clonePersonalPreferences(personalPreferences || buildDefaultPersonalPreferences())
  );
  const [toastMessage, setToastMessage] = useState("");
  const [validationError, setValidationError] = useState("");
  const toastTimerRef = useRef(null);

  useEffect(() => {
    const next = clonePersonalPreferences(
      personalPreferences || buildDefaultPersonalPreferences()
    );
    setPrefs(next);
    setSavedSnapshot(clonePersonalPreferences(next));
  }, [personalPreferences]);

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

  const patchRules = (ids, patch) => {
    setValidationError("");
    setPrefs((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        next[id] = { ...next[id], ...patch };
      });
      return next;
    });
  };

  const ruleById = useMemo(
    () =>
      ALL_NOTIFICATION_RULES.reduce((acc, r) => {
        acc[r.id] = r;
        return acc;
      }, {}),
    []
  );

  const handleSave = () => {
    const offenders = ALL_NOTIFICATION_RULES.filter((rule) => {
      if (rule.type === "required") return false;
      const { status } = resolveEffectiveStatus(rule, company, prefs);
      if (status !== "on") return false;
      const p = prefs[rule.id];
      return !p?.inApp && !p?.email;
    });
    if (offenders.length > 0) {
      setValidationError(
        `Enable at least one delivery channel (In-app or Email) for: ${offenders
          .map((r) => r.name)
          .join(", ")}.`
      );
      return;
    }
    const saved = clonePersonalPreferences(prefs);
    setSavedSnapshot(saved);
    onSavePersonalPreferences?.(saved);
    showToast("Notification preferences saved");
  };

  const handleCancel = () => {
    setPrefs(clonePersonalPreferences(savedSnapshot));
    setValidationError("");
    showToast("Changes discarded");
  };

  const chipTabs = DEFAULT_NOTIFICATION_SETTINGS.map((section) => ({
    id: section.id,
    label: section.title,
    count: buildDisplayUnits(
      section.items.filter((item) => canAccess(item.permission))
    ).length,
  }));

  const activeSection = useMemo(
    () =>
      DEFAULT_NOTIFICATION_SETTINGS.find((s) => s.id === activeModule) ||
      DEFAULT_NOTIFICATION_SETTINGS[0],
    [activeModule]
  );

  const renderToggle = (unit, channel) => {
    const primaryId = unit.memberIds[0];
    const rule = ruleById[primaryId] || unit.rule;
    const pref = prefs[primaryId] || { inApp: false, email: false };
    const { status } = resolveEffectiveStatus(rule, company, prefs);
    const isRequired = rule.type === "required";
    const channelsDisabled = isRequired || status !== "on";
    return (
      <ToggleSwitch
        checked={isRequired ? true : pref[channel]}
        disabled={channelsDisabled}
        onChange={(next) => patchRules(unit.memberIds, { [channel]: next })}
      />
    );
  };

  const rows = useMemo(
    () =>
      buildDisplayUnits(
        activeSection.items.filter((item) => canAccess(item.permission))
      ).map((unit) => ({
        id: unit.key,
        unit,
        name: unit.rule.name,
        recipient: unit.rule.recipient,
        permission: unit.rule.permission,
        todo: unit.rule.todo,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeSection]
  );

  const columns = [
    {
      key: "name",
      header: "Notification",
      width: 240,
      render: (_value, row) => {
        const isRequired =
          row.unit.kind === "rule" && row.unit.rule.type === "required";
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              padding: "12px 0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontWeight: "var(--font-weight-bold)" }}>{row.name}</span>
              <StatusBadge variant={isRequired ? "blue-light" : "grey-light"}>
                {isRequired ? "Required" : "Configurable"}
              </StatusBadge>
            </div>
            <span
              style={{
                fontSize: "12px",
                lineHeight: "16px",
                color: "var(--neutral-on-surface-secondary)",
              }}
            >
              {row.unit.rule.description}
            </span>
          </div>
        );
      },
    },
    {
      key: "recipient",
      header: "Recipient",
      width: 200,
      render: (value) => <div style={cellPadStyle}>{value}</div>,
    },
    {
      key: "permission",
      header: "Permission",
      width: 160,
      render: (value) => (
        <div style={cellPadStyle}>{value || "No permission mapping"}</div>
      ),
    },
    {
      key: "todo",
      header: "Todo",
      width: 130,
      render: (value) => <div style={cellPadStyle}>{value || "No Todo"}</div>,
    },
    {
      key: "unit",
      columnId: "remind",
      header: "Remind Before",
      width: 150,
      render: (_value, row) => {
        const primaryId = row.unit.memberIds[0];
        if (!REMINDER_SUPPORTED_RULE_IDS.has(primaryId)) {
          return (
            <div style={{ ...cellPadStyle, color: "var(--neutral-on-surface-secondary)" }}>
              —
            </div>
          );
        }
        const days = company[primaryId]?.remindBefore;
        return (
          <div style={{ ...cellPadStyle, color: "var(--neutral-on-surface-secondary)" }}>
            Company reminder: {days} {days === 1 ? "day" : "days"} before
          </div>
        );
      },
    },
    {
      key: "unit",
      columnId: "preference",
      header: "Preference",
      width: 190,
      render: (_value, row) => {
        const rule = ruleById[row.unit.memberIds[0]] || row.unit.rule;
        if (rule.type === "required") {
          return (
            <div style={cellPadStyle}>
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--neutral-on-surface-secondary)",
                }}
              >
                Required — always on
              </span>
            </div>
          );
        }
        const pref = prefs[row.unit.memberIds[0]] || {
          preference: PERSONAL_PREFERENCE_OPTIONS.useCompanyDefault,
        };
        return (
          <div style={{ padding: "12px 0" }}>
            <div
              style={{
                display: "flex",
                gap: "4px",
                padding: "3px",
                borderRadius: "10px",
                border: "1px solid var(--neutral-line-separator-1)",
              }}
            >
              {PREFERENCE_CHOICES.map((choice) => (
                <button
                  key={choice.value}
                  type="button"
                  onClick={() =>
                    patchRules(row.unit.memberIds, { preference: choice.value })
                  }
                  style={prefPillStyle(pref.preference === choice.value)}
                >
                  {choice.label}
                </button>
              ))}
            </div>
          </div>
        );
      },
    },
    {
      key: "unit",
      columnId: "status",
      header: "Current status",
      width: 130,
      render: (_value, row) => {
        const rule = ruleById[row.unit.memberIds[0]] || row.unit.rule;
        const { status, source } = resolveEffectiveStatus(rule, company, prefs);
        const on = status === "on";
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              alignItems: "flex-start",
              padding: "12px 0",
            }}
          >
            <StatusBadge variant={on ? "green-light" : "grey-light"}>
              {on ? "On" : "Off"}
            </StatusBadge>
            <span style={{ fontSize: "11px", color: "var(--neutral-on-surface-secondary)" }}>
              {effectiveSourceLabel(source)}
            </span>
          </div>
        );
      },
    },
    {
      key: "unit",
      columnId: "inapp",
      header: "In-app",
      align: "center",
      width: 80,
      render: (_value, row) => (
        <div style={toggleCellStyle}>{renderToggle(row.unit, "inApp")}</div>
      ),
    },
    {
      key: "unit",
      columnId: "email",
      header: "Email",
      align: "center",
      width: 80,
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
        Notification Preferences
      </h1>

      {/* Module chip tabs — outside the content card, wrapping instead of scrolling */}
      <ChipTabs
        tabs={chipTabs}
        activeTab={activeModule}
        onChange={setActiveModule}
        className="flex-wrap"
      />

      {validationError ? (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "12px",
            border: "1px solid var(--status-red-primary)",
            background: "var(--status-red-container, #FEF2F2)",
            color: "var(--status-red-primary)",
            fontSize: "var(--text-title-3)",
          }}
        >
          {validationError}
        </div>
      ) : null}

      {/* Content card — no accent bar, no divider between header and table.
          The scoped rule aligns the ce-ui table cells (default px-4) to the
          20px header padding. */}
      <style>{`.notif-card table th, .notif-card table td { padding-left: 20px; padding-right: 20px; }`}</style>
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
            padding: "20px 20px 4px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <span style={{ fontSize: "16px", fontWeight: "var(--font-weight-bold)" }}>
            {activeSection.title}
          </span>
          <span
            style={{
              fontSize: "var(--text-title-3)",
              lineHeight: "20px",
              color: "var(--neutral-on-surface-secondary)",
            }}
          >
            {activeSection.description}
          </span>
        </div>
        <Table
          columns={columns}
          data={rows}
          totalRows={rows.length}
          showPagination={false}
          className="!h-auto"
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
        <Button variant="outlined" size="large" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="filled" size="large" onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export { NotificationPreferencesPage };

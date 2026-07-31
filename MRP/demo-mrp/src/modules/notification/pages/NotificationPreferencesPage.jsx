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
  pickLocalized,
} from "../../../data/notification/notificationDefaults.js";
import { resolveEffectiveStatus } from "../../../utils/notification/notificationUtils.js";
import { Info } from "lucide-react";

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
  language = "en",
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
    setPrefs((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        next[id] = { ...next[id], ...patch };
      });
      return next;
    });
  };

  // Clears the personal override for every rule in the unit, reverting each
  // channel to mirror the current company default (PRD "Use Company Default").
  const resetToCompanyDefault = (unit) => {
    setPrefs((prev) => {
      const next = { ...prev };
      unit.memberIds.forEach((id) => {
        const companyEntry = company[id] || { inApp: false, email: false };
        next[id] = {
          preference: PERSONAL_PREFERENCE_OPTIONS.useCompanyDefault,
          inApp: companyEntry.inApp,
          email: companyEntry.email,
        };
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
    const saved = clonePersonalPreferences(prefs);
    setSavedSnapshot(saved);
    onSavePersonalPreferences?.(saved);
    showToast("Notification preferences saved");
  };

  const handleCancel = () => {
    setPrefs(clonePersonalPreferences(savedSnapshot));
    showToast("Changes discarded");
  };

  const chipTabs = DEFAULT_NOTIFICATION_SETTINGS.map((section) => ({
    id: section.id,
    label: pickLocalized(section.title, language),
    count: buildDisplayUnits(
      section.items.filter((item) => canAccess(item.permission)),
      language
    ).length,
  }));

  const activeSection = useMemo(
    () =>
      DEFAULT_NOTIFICATION_SETTINGS.find((s) => s.id === activeModule) ||
      DEFAULT_NOTIFICATION_SETTINGS[0],
    [activeModule]
  );

  const renderToggle = (unit, channel, { showReset = false } = {}) => {
    const primaryId = unit.memberIds[0];
    const rule = ruleById[primaryId] || unit.rule;
    const pref = prefs[primaryId] || { inApp: false, email: false };
    const { status } = resolveEffectiveStatus(rule, company, prefs);
    const isRequired = rule.type === "required";
    const channelsDisabled = isRequired || status !== "on";
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <ToggleSwitch
          checked={isRequired ? true : pref[channel]}
          disabled={channelsDisabled}
          onChange={(next) => patchRules(unit.memberIds, { [channel]: next })}
        />
        {showReset && !isRequired ? (
          <Button
            variant="tertiary"
            size="small"
            onClick={() => resetToCompanyDefault(unit)}
          >
            Set to company default
          </Button>
        ) : null}
      </div>
    );
  };

  const rows = useMemo(
    () =>
      buildDisplayUnits(
        activeSection.items.filter((item) => canAccess(item.permission)),
        language
      ).map((unit) => ({
        id: unit.key,
        unit,
        name: unit.rule.name,
        permission: unit.rule.permission,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeSection, language]
  );

  const columns = [
    {
      key: "name",
      header: "Notification",
      width: 340,
      render: (_value, row) => {
        const isRequired =
          row.unit.kind === "rule" && row.unit.rule.type === "required";
        const primaryId = row.unit.memberIds[0];
        const showsReminder = REMINDER_SUPPORTED_RULE_IDS.has(primaryId);
        const days = company[primaryId]?.remindBefore;
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
            {showsReminder ? (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  color: "var(--neutral-on-surface-secondary)",
                }}
              >
                <Info size={14} />
                {`Reminder: ${days} ${days === 1 ? "day" : "days"} before`}
              </span>
            ) : null}
          </div>
        );
      },
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
      key: "unit",
      columnId: "inapp",
      header: "In-app",
      align: "center",
      width: 80,
      render: (_value, row) => (
        <div style={toggleCellStyle}>
          {renderToggle(row.unit, "inApp", { showReset: true })}
        </div>
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

      {/* Content card — no accent bar, no divider between header and table.
          The scoped rule aligns the ce-ui table cells (default px-4) to the
          20px header padding. */}
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
            padding: "20px 20px 4px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
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

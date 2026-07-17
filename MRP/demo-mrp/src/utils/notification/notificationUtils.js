import {
  SUGGESTED_DELIVERY_BY_RULE,
  SUGGESTED_DELIVERY_FALLBACK,
} from "../../data/notification/notificationOptions.js";

// Turns a stored delivery value into its effective one.
// "Suggested" defers to the per-rule recommendation; everything else is literal.
export const resolveDelivery = (delivery, ruleId) =>
  delivery === "Suggested"
    ? SUGGESTED_DELIVERY_BY_RULE[ruleId] ?? SUGGESTED_DELIVERY_FALLBACK
    : delivery;

export const getEnabledNotificationRuleIds = (settings = []) =>
  new Set(
    settings.flatMap((section) =>
      (section.items || [])
        .filter((item) => item.enabled)
        .map((item) => item.id)
    )
  );

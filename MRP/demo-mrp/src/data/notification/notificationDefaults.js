// Company Notification Settings catalog.
//
// Rebuilt to match the "Notification System - Expansion & Preferences" PRD:
// notifications are grouped BY MODULE (not by delivery channel), each rule is
// Required or Configurable, and each carries two independent delivery channels
// (In-app and Email) plus read-only metadata (trigger, recipient, permission
// mapping, Todo eligibility). There is no cadence/"delivery mode" concept.
//
// Everything here is in-memory demo data — no backend. Bahasa Indonesia copy
// follows house style: "Anda" (never kamu/-mu) and "Material" (never "Bahan
// Baku"). CTA wording is standard: "See Detail" (EN) / "Lihat Detail" (ID).

const SEE_DETAIL = { en: "See Detail", id: "Lihat Detail" };

// Notification type. Required notifications are workflow-driven, cannot be
// disabled, and render locked controls. Configurable notifications can be
// toggled per channel by an admin (company) or user (personal preference).
export const NOTIFICATION_TYPES = {
  required: "required",
  configurable: "configurable",
};

// The nine modules, in display order (PRD acceptance criterion #2).
export const DEFAULT_NOTIFICATION_SETTINGS = [
  {
    id: "approval",
    title: "Approval",
    description:
      "Workflow approval events across RFQ, Quote, Order, Purchase Order, Custom Product Request, and Invoice. Recipients resolve directly from the approval workflow.",
    items: [
      {
        id: "approval_submission",
        name: "Approval Submission",
        trigger: "Submitted for approval",
        type: "required",
        recipient: "Configured approver",
        permission: null,
        todo: "Needs your approval",
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "[Entity] [Number] needs your approval\n[Submitter Name] submitted [Entity] [Number] for your approval.\nCTA: See Detail",
            id: "[Entity] [Number] memerlukan persetujuan Anda\n[Submitter Name] mengirim [Entity] [Number] untuk persetujuan Anda.\nCTA: Lihat Detail",
          },
          email: {
            subject: "[Entity] [Number] needs your approval",
            body: "[Submitter Name] submitted [Entity] [Number] for your approval.",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "approval_progress_update",
        name: "Approval Progress Update",
        trigger: "One approver approves",
        type: "required",
        recipient: "Latest submitter",
        permission: null,
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "[Entity] [Number] approval progressed\n[Approver Name] approved [Entity] [Number]. Awaiting remaining approvers.\nCTA: See Detail",
            id: "Persetujuan [Entity] [Number] berlanjut\n[Approver Name] menyetujui [Entity] [Number]. Menunggu approver lainnya.\nCTA: Lihat Detail",
          },
          email: {
            subject: "[Entity] [Number] approval progressed",
            body: "[Approver Name] approved [Entity] [Number]. The request is awaiting the remaining approvers.",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "final_approval",
        name: "Final Approval",
        trigger: "All approvers approve",
        type: "required",
        recipient: "Latest submitter",
        permission: null,
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "[Entity] [Number] has been approved\n[Entity] [Number] has received all required approvals.\nCTA: See Detail",
            id: "[Entity] [Number] telah disetujui\n[Entity] [Number] telah menerima seluruh persetujuan yang diperlukan.\nCTA: Lihat Detail",
          },
          email: {
            subject: "[Entity] [Number] has been approved",
            body: "[Entity] [Number] has received all required approvals.",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "approval_rejected",
        name: "Approval Rejected",
        trigger: "Rejected",
        type: "required",
        recipient: "Latest submitter",
        permission: null,
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "[Entity] [Number] was rejected\n[Approver Name] rejected [Entity] [Number]. Reason: [Reason].\nCTA: See Detail",
            id: "[Entity] [Number] ditolak\n[Approver Name] menolak [Entity] [Number]. Alasan: [Reason].\nCTA: Lihat Detail",
          },
          email: {
            subject: "[Entity] [Number] was rejected",
            body: "[Approver Name] rejected [Entity] [Number]. Reason: [Reason].",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "revision_requested",
        name: "Revision Requested",
        trigger: "Needs revision",
        type: "required",
        recipient: "Latest submitter",
        permission: null,
        todo: "Needs revision",
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "[Entity] [Number] needs revision\n[Approver Name] requested changes on [Entity] [Number]. Note: [Revision Note].\nCTA: See Detail",
            id: "[Entity] [Number] perlu revisi\n[Approver Name] meminta perubahan pada [Entity] [Number]. Catatan: [Revision Note].\nCTA: Lihat Detail",
          },
          email: {
            subject: "[Entity] [Number] needs revision",
            body: "[Approver Name] requested changes on [Entity] [Number]. Note: [Revision Note].",
            cta: SEE_DETAIL,
          },
        },
      },
    ],
  },
  {
    id: "inventory",
    title: "Inventory",
    description:
      "Stock-level and batch-expiry alerts for materials. Sent to subscribed users with Inventory access.",
    items: [
      {
        id: "material_running_low",
        name: "Material Running Low",
        trigger: "Stock reaches minimum",
        type: "configurable",
        recipient: "Subscribed users with Inventory access",
        permission: "Materials",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: false },
        content: {
          inApp: {
            en: "Material [Material Name] is running low\nAvailable stock is [Qty] [UOM], at or below the minimum level.\nCTA: See Detail",
            id: "Stok Material [Material Name] menipis\nStok tersedia adalah [Qty] [UOM], sama dengan atau di bawah batas minimum.\nCTA: Lihat Detail",
          },
          email: {
            subject: "Material [Material Name] is running low",
            body: "Available stock is [Qty] [UOM], at or below the minimum level.",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "material_out_of_stock",
        name: "Material Out of Stock",
        trigger: "Stock reaches zero",
        type: "configurable",
        recipient: "Subscribed users with Inventory access",
        permission: "Materials",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Material [Material Name] is out of stock\nAvailable stock has reached 0 [UOM].\nCTA: See Detail",
            id: "Material [Material Name] habis\nStok tersedia telah mencapai 0 [UOM].\nCTA: Lihat Detail",
          },
          email: {
            subject: "Material [Material Name] is out of stock",
            body: "Material [Material Name] has reached zero available stock. Please review the material and replenishment plan.",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "material_expiring_soon",
        name: "Material Expiring Soon",
        trigger: "Batch approaching expiry",
        type: "configurable",
        recipient: "Subscribed users with Inventory access",
        permission: "Batches",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: false },
        content: {
          inApp: {
            en: "Batch [Batch Number] is expiring soon\nBatch [Batch Number] for [Material Name] will expire on [Expiry Date].\nCTA: See Detail",
            id: "Batch [Batch Number] akan segera kedaluwarsa\nBatch [Batch Number] untuk [Material Name] akan kedaluwarsa pada [Expiry Date].\nCTA: Lihat Detail",
          },
          email: {
            subject: "Batch [Batch Number] is expiring soon",
            body: "Batch [Batch Number] for [Material Name] will expire on [Expiry Date].",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "material_expired",
        name: "Material Expired",
        trigger: "Batch expires",
        type: "configurable",
        recipient: "Subscribed users with Inventory access",
        permission: "Batches",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Batch [Batch Number] has expired\nBatch [Batch Number] for [Material Name] expired on [Expiry Date].\nCTA: See Detail",
            id: "Batch [Batch Number] telah kedaluwarsa\nBatch [Batch Number] untuk [Material Name] kedaluwarsa pada [Expiry Date].\nCTA: Lihat Detail",
          },
          email: {
            subject: "Batch [Batch Number] has expired",
            body: "Batch [Batch Number] for [Material Name] expired on [Expiry Date]. Please review the remaining quantity and take the required action.",
            cta: SEE_DETAIL,
          },
        },
      },
    ],
  },
  {
    id: "material_request",
    title: "Material Request",
    description:
      "Material transfer and receipt workflow. Material Preparation permission is used for preparers; Material Receipt for the requester or receiver.",
    items: [
      {
        id: "mr_transfer_started",
        name: "Transfer Started",
        trigger: "Transfer started",
        type: "required",
        recipient: "Requester / material receiver",
        permission: "Material Receipt",
        todo: "Confirm receipt",
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Material Request [MR Number] transfer started\n[Preparer Name] started the transfer. Please confirm receipt.\nCTA: See Detail",
            id: "Transfer Material Request [MR Number] dimulai\n[Preparer Name] memulai transfer. Silakan konfirmasi penerimaan.\nCTA: Lihat Detail",
          },
          email: {
            subject: "Material Request [MR Number] transfer started",
            body: "[Preparer Name] started the transfer for Material Request [MR Number]. Please confirm receipt.",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "mr_receipt_confirmed",
        name: "Receipt Confirmed",
        trigger: "Receipt confirmed",
        type: "required",
        recipient: "Material preparer",
        permission: "Material Preparation",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Material Request [MR Number] receipt confirmed\n[Receiver Name] confirmed receipt of Material Request [MR Number].\nCTA: See Detail",
            id: "Penerimaan Material Request [MR Number] dikonfirmasi\n[Receiver Name] mengonfirmasi penerimaan Material Request [MR Number].\nCTA: Lihat Detail",
          },
          email: {
            subject: "Material Request [MR Number] receipt confirmed",
            body: "[Receiver Name] confirmed receipt of Material Request [MR Number].",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "mr_receipt_rejected",
        name: "Receipt Rejected",
        trigger: "Receipt rejected",
        type: "required",
        recipient: "Material preparer",
        permission: "Material Preparation",
        todo: "Resolve issue",
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Material Request [MR Number] receipt rejected\n[Receiver Name] rejected the receipt. Please resolve the issue.\nCTA: See Detail",
            id: "Penerimaan Material Request [MR Number] ditolak\n[Receiver Name] menolak penerimaan. Silakan selesaikan masalahnya.\nCTA: Lihat Detail",
          },
          email: {
            subject: "Material Request [MR Number] receipt rejected",
            body: "[Receiver Name] rejected the receipt for Material Request [MR Number]. Please resolve the issue.",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "mr_cancelled_by_preparer",
        name: "Material Request Cancelled by Preparer",
        trigger: "Cancelled by preparer",
        type: "required",
        recipient: "Requester / material receiver",
        permission: "Material Receipt",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Material Request [MR Number] was cancelled\n[Preparer Name] cancelled Material Request [MR Number].\nCTA: See Detail",
            id: "Material Request [MR Number] dibatalkan\n[Preparer Name] membatalkan Material Request [MR Number].\nCTA: Lihat Detail",
          },
          email: {
            subject: "Material Request [MR Number] was cancelled",
            body: "[Preparer Name] cancelled Material Request [MR Number].",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "mr_new_material_request",
        name: "New Material Request",
        trigger: "New Material Request is created",
        type: "configurable",
        recipient: "Subscribed material preparers",
        permission: "Material Preparation",
        todo: null,
        groupId: null,
        // Off by default (PRD System Rules: New Material Request is Off by default).
        defaults: { enabled: false, inApp: true, email: false },
        content: {
          inApp: {
            en: "New Material Request [MR Number]\n[Requester Name] created a new Material Request for [Work Order / Purpose].\nCTA: See Detail",
            id: "Material Request baru [MR Number]\n[Requester Name] membuat Material Request baru untuk [Work Order / Tujuan].\nCTA: Lihat Detail",
          },
          email: {
            subject: "New Material Request [MR Number]",
            body: "[Requester Name] created a new Material Request for [Work Order / Purpose].",
            cta: SEE_DETAIL,
          },
        },
      },
    ],
  },
  {
    id: "work_order",
    title: "Work Order",
    description:
      "Work Order deadlines, status changes, new work orders, and outsourced Purchase Order activity. Sent to subscribed users with Work Order access.",
    items: [
      {
        id: "wo_deadline_approaching",
        name: "Deadline Approaching",
        trigger: "7 days before deadline",
        type: "configurable",
        recipient: "Subscribed users with Work Order access",
        permission: "Work Orders",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Work Order [Number] is due in 7 days\nThe deadline is [Deadline Date]. Current status: [Status].\nCTA: See Detail",
            id: "Work Order [Number] jatuh tempo dalam 7 hari\nBatas waktunya adalah [Deadline Date]. Status saat ini: [Status].\nCTA: Lihat Detail",
          },
          email: {
            subject: "Work Order [Number] is due in 7 days",
            body: "Work Order [Number] is due on [Deadline Date]. Current status: [Status].",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "wo_deadline_overdue",
        name: "Deadline Overdue",
        trigger: "Deadline passed",
        type: "configurable",
        recipient: "Subscribed users with Work Order access",
        permission: "Work Orders",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Work Order [Number] is overdue\nThe deadline was [Deadline Date]. Current status: [Status].\nCTA: See Detail",
            id: "Work Order [Number] terlambat\nBatas waktunya adalah [Deadline Date]. Status saat ini: [Status].\nCTA: Lihat Detail",
          },
          email: {
            subject: "Work Order [Number] is overdue",
            body: "Work Order [Number] passed its deadline on [Deadline Date] and remains [Status].",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "wo_changed_to_completed",
        name: "Changed to Completed",
        trigger: "Status changes to Completed",
        type: "configurable",
        recipient: "Subscribed users with Work Order access",
        permission: "Work Orders",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: false },
        content: {
          inApp: {
            en: "Work Order [Number] has been completed\nThe Work Order status changed to Completed.\nCTA: See Detail",
            id: "Work Order [Number] telah selesai\nStatus Work Order berubah menjadi Completed.\nCTA: Lihat Detail",
          },
          email: {
            subject: "Work Order [Number] has been completed",
            body: "The Work Order status changed to Completed.",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "wo_changed_to_cancelled",
        name: "Changed to Cancelled",
        trigger: "Status changes to Cancelled",
        type: "configurable",
        recipient: "Subscribed users with Work Order access",
        permission: "Work Orders",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: false },
        content: {
          inApp: {
            en: "Work Order [Number] was cancelled\nThe Work Order status changed to Cancelled by [Updated By].\nCTA: See Detail",
            id: "Work Order [Number] dibatalkan\nStatus Work Order berubah menjadi Cancelled oleh [Updated By].\nCTA: Lihat Detail",
          },
          email: {
            subject: "Work Order [Number] was cancelled",
            body: "The Work Order status changed to Cancelled by [Updated By].",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "wo_new_work_order",
        name: "New Work Order",
        trigger: "Work Order is created with status Not Started",
        type: "configurable",
        recipient: "Subscribed users with Work Order access",
        permission: "Work Orders",
        todo: null,
        groupId: null,
        // Off by default (PRD System Rules: New Work Order is Off by default).
        defaults: { enabled: false, inApp: true, email: false },
        content: {
          inApp: {
            en: "New Work Order [WO Number]\nA new Work Order was created for [Product / Order Number] and is currently Not Started.\nCTA: See Detail",
            id: "Work Order baru [WO Number]\nWork Order baru dibuat untuk [Produk / Nomor Order] dan saat ini berstatus Not Started.\nCTA: Lihat Detail",
          },
          email: {
            subject: "New Work Order [WO Number]",
            body: "A new Work Order was created for [Product / Order Number] and is currently Not Started.",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "wo_outsource_po_issued",
        name: "Outsource Purchase Order Issued",
        trigger:
          "A Purchase Order containing one or more outsourced Work Orders changes to Issued (one notification per linked Work Order)",
        type: "configurable",
        recipient: "Eligible subscribed users with access to the related Work Order",
        permission: "Work Orders",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Purchase Order [PO Number] for Work Order [WO Number] has been issued\nThe Purchase Order for outsourced Work Order [WO Number] has been issued to [Vendor Name].\nCTA: See Detail",
            id: "Purchase Order [PO Number] untuk Work Order [WO Number] telah diterbitkan\nPurchase Order untuk Work Order outsource [WO Number] telah diterbitkan kepada [Vendor Name].\nCTA: Lihat Detail",
          },
          email: {
            subject: "Purchase Order [PO Number] for Work Order [WO Number] has been issued",
            body: "The Purchase Order for outsourced Work Order [WO Number] has been issued to [Vendor Name].",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "wo_outsource_po_receipt_recorded",
        name: "Outsource Purchase Order Receipt Recorded",
        trigger:
          "A receipt transaction is recorded for an outsourced Work Order that remains partially received",
        type: "configurable",
        recipient: "Eligible subscribed users with access to the related Work Order",
        permission: "Work Orders",
        todo: null,
        // Grouped admin toggle: "Receipt Status Updates" controls both
        // Receipt Recorded and Fully Received (PRD §6.9 grouped-setting note).
        groupId: "wo_receipt_status",
        defaults: { inApp: true, email: false },
        content: {
          inApp: {
            en: "Receipt recorded for Work Order [WO Number]\n[Received Qty] was received under Purchase Order [PO Number]. Total received for this Work Order: [Cumulative WO Received Qty] of [WO Ordered Qty].\nCTA: See Detail",
            id: "Penerimaan dicatat untuk Work Order [WO Number]\n[Received Qty] diterima melalui Purchase Order [PO Number]. Total diterima untuk Work Order ini: [Cumulative WO Received Qty] dari [WO Ordered Qty].\nCTA: Lihat Detail",
          },
          email: null,
        },
      },
      {
        id: "wo_outsource_po_fully_received",
        name: "Outsource Purchase Order Fully Received",
        trigger:
          "A receipt transaction brings an outsourced Work Order to its total ordered quantity",
        type: "configurable",
        recipient: "Eligible subscribed users with access to the related Work Order",
        permission: "Work Orders",
        todo: null,
        groupId: "wo_receipt_status",
        defaults: { inApp: true, email: false },
        content: {
          inApp: {
            en: "Work Order [WO Number] has been fully received\nAll outsourced items for Work Order [WO Number] under Purchase Order [PO Number] have been received.\nCTA: See Detail",
            id: "Work Order [WO Number] telah diterima seluruhnya\nSeluruh item outsource untuk Work Order [WO Number] melalui Purchase Order [PO Number] telah diterima.\nCTA: Lihat Detail",
          },
          email: null,
        },
      },
    ],
  },
  {
    id: "custom_product_request",
    title: "Custom Product Request",
    description:
      "Custom Product Request creation. Sent to subscribed users with Custom Product Request access.",
    items: [
      {
        id: "cpr_new_request",
        name: "New Request",
        trigger: "New request",
        type: "configurable",
        recipient: "Subscribed users with CPR access",
        permission: "Custom Product Requests",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: false },
        content: {
          inApp: {
            en: "New Custom Product Request [Number]\nCreated by [Requester Name] for [Customer Name].\nCTA: See Detail",
            id: "Custom Product Request baru [Number]\nDibuat oleh [Requester Name] untuk [Customer Name].\nCTA: Lihat Detail",
          },
          email: {
            subject: "New Custom Product Request [Number]",
            body: "Created by [Requester Name] for [Customer Name].",
            cta: SEE_DETAIL,
          },
        },
      },
    ],
  },
  {
    id: "quotes",
    title: "Quotes",
    description:
      "Quote validity reminders and Customer Portal outcomes. Customer Portal events resolve to the portal sender.",
    items: [
      {
        id: "quote_valid_until_reminder",
        name: "Quote Valid Until Reminder",
        trigger: "7 days before valid-until date",
        type: "configurable",
        recipient: "Subscribed users with Quote access",
        permission: "Quotes",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Quote [Number] will expire in 7 days\nThe quote is valid until [Valid Until Date].\nCTA: See Detail",
            id: "Quote [Number] akan berakhir dalam 7 hari\nQuote berlaku sampai [Valid Until Date].\nCTA: Lihat Detail",
          },
          email: {
            subject: "Quote [Number] will expire in 7 days",
            body: "Quote [Number] is valid until [Valid Until Date]. Please review and follow up before it expires.",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "quote_approved_by_customer",
        name: "Quote Approved by Customer",
        trigger: "Customer approves Quote through Customer Portal",
        type: "required",
        recipient: "Customer Portal sender",
        permission: "Quotes",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Quote [Number] was approved by the customer\n[Customer Name] approved Quote [Number] through the Customer Portal.\nCTA: See Detail",
            id: "Quote [Number] disetujui oleh pelanggan\n[Customer Name] menyetujui Quote [Number] melalui Customer Portal.\nCTA: Lihat Detail",
          },
          email: {
            subject: "Quote [Number] was approved by the customer",
            body: "[Customer Name] approved Quote [Number] through the Customer Portal.",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "quote_rejected_by_customer",
        name: "Quote Rejected by Customer",
        trigger: "Customer rejects Quote through Customer Portal",
        type: "required",
        recipient: "Customer Portal sender",
        permission: "Quotes",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Quote [Number] was rejected by the customer\n[Customer Name] rejected Quote [Number] through the Customer Portal.\nCTA: See Detail",
            id: "Quote [Number] ditolak oleh pelanggan\n[Customer Name] menolak Quote [Number] melalui Customer Portal.\nCTA: Lihat Detail",
          },
          email: {
            subject: "Quote [Number] was rejected by the customer",
            body: "[Customer Name] rejected Quote [Number] through the Customer Portal.",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "quote_revision_requested_by_customer",
        name: "Quote Revision Requested by Customer",
        trigger: "Customer requests changes through Customer Portal",
        type: "required",
        recipient: "Customer Portal sender",
        permission: "Quotes",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Quote [Number] revision requested by the customer\n[Customer Name] requested changes on Quote [Number] through the Customer Portal.\nCTA: See Detail",
            id: "Revisi Quote [Number] diminta oleh pelanggan\n[Customer Name] meminta perubahan pada Quote [Number] melalui Customer Portal.\nCTA: Lihat Detail",
          },
          email: {
            subject: "Quote [Number] revision requested by the customer",
            body: "[Customer Name] requested changes on Quote [Number] through the Customer Portal.",
            cta: SEE_DETAIL,
          },
        },
      },
    ],
  },
  {
    id: "orders",
    title: "Orders",
    description:
      "Order deadlines, status changes, new orders, and linked-invoice payment. Sent to subscribed users with Order access.",
    items: [
      {
        id: "order_deadline_approaching",
        name: "Order Deadline Approaching",
        trigger: "7 days before deadline",
        type: "configurable",
        recipient: "Subscribed users with Order access",
        permission: "Orders",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Order [Number] is due in 7 days\nThe deadline is [Deadline Date]. Current status: [Status].\nCTA: See Detail",
            id: "Order [Number] jatuh tempo dalam 7 hari\nBatas waktunya adalah [Deadline Date]. Status saat ini: [Status].\nCTA: Lihat Detail",
          },
          email: {
            subject: "Order [Number] is due in 7 days",
            body: "Order [Number] is due on [Deadline Date]. Current status: [Status].",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "order_deadline_overdue",
        name: "Order Deadline Overdue",
        trigger: "Deadline passed",
        type: "configurable",
        recipient: "Subscribed users with Order access",
        permission: "Orders",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Order [Number] is overdue\nThe deadline was [Deadline Date]. Current status: [Status].\nCTA: See Detail",
            id: "Order [Number] terlambat\nBatas waktunya adalah [Deadline Date]. Status saat ini: [Status].\nCTA: Lihat Detail",
          },
          email: {
            subject: "Order [Number] is overdue",
            body: "Order [Number] passed its deadline on [Deadline Date] and remains [Status].",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "order_changed_to_completed",
        name: "Changed to Completed",
        trigger: "Status changes to Completed",
        type: "configurable",
        recipient: "Subscribed users with Order access",
        permission: "Orders",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: false },
        content: {
          inApp: {
            en: "Order [Number] has been completed\nThe Order status changed to Completed.\nCTA: See Detail",
            id: "Order [Number] telah selesai\nStatus Order berubah menjadi Completed.\nCTA: Lihat Detail",
          },
          email: {
            subject: "Order [Number] has been completed",
            body: "The Order status changed to Completed.",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "order_changed_to_cancelled",
        name: "Changed to Cancelled",
        trigger: "Status changes to Cancelled",
        type: "configurable",
        recipient: "Subscribed users with Order access",
        permission: "Orders",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: false },
        content: {
          inApp: {
            en: "Order [Number] was cancelled\nThe Order status changed to Cancelled by [Updated By].\nCTA: See Detail",
            id: "Order [Number] dibatalkan\nStatus Order berubah menjadi Cancelled oleh [Updated By].\nCTA: Lihat Detail",
          },
          email: {
            subject: "Order [Number] was cancelled",
            body: "The Order status changed to Cancelled by [Updated By].",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "order_new_order",
        name: "New Order",
        trigger: "Order is created with status Not Started",
        type: "configurable",
        recipient: "Subscribed users with Order access",
        permission: "Orders",
        todo: null,
        groupId: null,
        // Off by default (PRD System Rules: New Order is Off by default).
        defaults: { enabled: false, inApp: true, email: false },
        content: {
          inApp: {
            en: "New Order [Order Number]\nA new Order was created for [Customer Name] and is currently Not Started.\nCTA: See Detail",
            id: "Order baru [Order Number]\nOrder baru dibuat untuk [Customer Name] dan saat ini berstatus Not Started.\nCTA: Lihat Detail",
          },
          email: {
            subject: "New Order [Order Number]",
            body: "A new Order was created for [Customer Name] and is currently Not Started.",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "order_invoice_paid",
        name: "Order Invoice Paid",
        trigger: "An Invoice linked to an Order changes to Paid",
        type: "configurable",
        recipient: "Eligible subscribed users with access to the related Order",
        permission: "Orders",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Invoice [Invoice Number] for Order [Order Number] has been paid\nThe invoice payment has been completed. Paid amount: [Paid Amount].\nCTA: See Detail",
            id: "Invoice [Invoice Number] untuk Order [Order Number] telah dibayar\nPembayaran invoice telah selesai. Jumlah dibayar: [Paid Amount].\nCTA: Lihat Detail",
          },
          email: {
            subject: "Invoice [Invoice Number] for Order [Order Number] has been paid",
            body: "Invoice [Invoice Number] linked to Order [Order Number] has been paid. Paid amount: [Paid Amount].",
            cta: SEE_DETAIL,
          },
        },
      },
    ],
  },
  {
    id: "invoice",
    title: "Invoice",
    description:
      "Invoice due-date reminders, overdue alerts, Customer Portal outcomes, and payment proof review. Invoice has no internal approval/revision flow.",
    items: [
      {
        id: "invoice_due_date_approaching",
        name: "Due Date Approaching",
        trigger: "7 days before due date",
        type: "configurable",
        recipient: "Subscribed users with Invoice access",
        permission: "Invoices",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Invoice [Number] is due in 7 days\nThe due date is [Due Date]. Outstanding amount: [Amount] [Currency].\nCTA: See Detail",
            id: "Invoice [Number] jatuh tempo dalam 7 hari\nTanggal jatuh tempo adalah [Due Date]. Sisa tagihan: [Amount] [Currency].\nCTA: Lihat Detail",
          },
          email: {
            subject: "Invoice [Number] is due in 7 days",
            body: "Invoice [Number] is due on [Due Date]. Outstanding amount: [Amount] [Currency].",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "invoice_overdue",
        name: "Invoice Overdue",
        trigger: "Due date passed and unpaid",
        type: "configurable",
        recipient: "Subscribed users with Invoice access",
        permission: "Invoices",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Invoice [Number] is overdue\nThe invoice was due on [Due Date]. Outstanding amount: [Amount] [Currency].\nCTA: See Detail",
            id: "Invoice [Number] terlambat\nInvoice jatuh tempo pada [Due Date]. Sisa tagihan: [Amount] [Currency].\nCTA: Lihat Detail",
          },
          email: {
            subject: "Invoice [Number] is overdue",
            body: "Invoice [Number] passed its due date on [Due Date]. Outstanding amount: [Amount] [Currency].",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "invoice_approved_by_customer",
        name: "Invoice Approved by Customer",
        trigger: "Customer approves Invoice through Customer Portal",
        type: "required",
        recipient: "Invoice owner or Customer Portal sender",
        permission: "Invoices",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Invoice [Number] was approved by the customer\n[Customer Name] approved Invoice [Number] through the Customer Portal.\nCTA: See Detail",
            id: "Invoice [Number] disetujui oleh pelanggan\n[Customer Name] menyetujui Invoice [Number] melalui Customer Portal.\nCTA: Lihat Detail",
          },
          email: {
            subject: "Invoice [Number] was approved by the customer",
            body: "[Customer Name] approved Invoice [Number] through the Customer Portal.",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "invoice_rejected_by_customer",
        name: "Invoice Rejected by Customer",
        trigger: "Customer rejects Invoice through Customer Portal",
        type: "required",
        recipient: "Invoice owner or Customer Portal sender",
        permission: "Invoices",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Invoice [Number] was rejected by the customer\n[Customer Name] rejected Invoice [Number] through the Customer Portal.\nCTA: See Detail",
            id: "Invoice [Number] ditolak oleh pelanggan\n[Customer Name] menolak Invoice [Number] melalui Customer Portal.\nCTA: Lihat Detail",
          },
          email: {
            subject: "Invoice [Number] was rejected by the customer",
            body: "[Customer Name] rejected Invoice [Number] through the Customer Portal.",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "invoice_revision_requested_by_customer",
        name: "Invoice Revision Requested by Customer",
        trigger: "Customer requests changes through Customer Portal",
        type: "required",
        recipient: "Invoice owner or Customer Portal sender",
        permission: "Invoices",
        todo: "Needs revision",
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Invoice [Number] revision requested by the customer\n[Customer Name] requested changes on Invoice [Number] through the Customer Portal.\nCTA: See Detail",
            id: "Revisi Invoice [Number] diminta oleh pelanggan\n[Customer Name] meminta perubahan pada Invoice [Number] melalui Customer Portal.\nCTA: Lihat Detail",
          },
          email: {
            subject: "Invoice [Number] revision requested by the customer",
            body: "[Customer Name] requested changes on Invoice [Number] through the Customer Portal.",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "invoice_payment_proof_submitted",
        name: "Payment Proof Submitted",
        trigger: "Payment proof submitted through portal",
        type: "required",
        recipient: "Invoice owner or portal sender",
        permission: "Invoices",
        todo: "Review proof",
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Payment proof submitted for Invoice [Number]\n[Customer Name] submitted payment proof for Invoice [Number]. Please review.\nCTA: See Detail",
            id: "Bukti pembayaran dikirim untuk Invoice [Number]\n[Customer Name] mengirim bukti pembayaran untuk Invoice [Number]. Silakan tinjau.\nCTA: Lihat Detail",
          },
          email: {
            subject: "Payment proof submitted for Invoice [Number]",
            body: "[Customer Name] submitted payment proof for Invoice [Number]. Please review.",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "invoice_payment_proof_rejected",
        name: "Payment Proof Rejected",
        trigger: "Internal reviewer rejects customer payment proof",
        type: "required",
        recipient: "Customer",
        permission: "Invoices",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Payment proof for Invoice [Number] was rejected\nYour payment proof for Invoice [Number] was rejected. Reason: [Reason]. Please re-upload.\nCTA: See Detail",
            id: "Bukti pembayaran untuk Invoice [Number] ditolak\nBukti pembayaran Anda untuk Invoice [Number] ditolak. Alasan: [Reason]. Silakan unggah ulang.\nCTA: Lihat Detail",
          },
          email: {
            subject: "Payment proof for Invoice [Number] was rejected",
            body: "Your payment proof for Invoice [Number] was rejected. Reason: [Reason]. Please re-upload the payment proof.",
            cta: { en: "Re-upload payment proof", id: "Unggah ulang bukti pembayaran" },
          },
        },
      },
    ],
  },
  {
    id: "purchase_order",
    title: "Purchase Order",
    description:
      "Purchase Order payment and expected-end-date tracking. Sent to subscribed users with Purchase Order access.",
    items: [
      {
        id: "po_payment_overdue",
        name: "Payment Overdue",
        trigger: "Payment due date passed",
        type: "configurable",
        recipient: "Subscribed users with Purchase Order access",
        permission: "Purchase Orders",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Payment for Purchase Order [Number] is overdue\nThe payment due date was [Due Date]. Outstanding amount: [Amount] [Currency].\nCTA: See Detail",
            id: "Pembayaran Purchase Order [Number] terlambat\nTanggal jatuh tempo pembayaran adalah [Due Date]. Sisa pembayaran: [Amount] [Currency].\nCTA: Lihat Detail",
          },
          email: {
            subject: "Payment for Purchase Order [Number] is overdue",
            body: "Payment for Purchase Order [Number] passed its due date on [Due Date]. Outstanding amount: [Amount] [Currency].",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "po_expected_end_date_approaching",
        name: "Expected End Date Approaching",
        trigger: "7 days before expected end date",
        type: "configurable",
        recipient: "Subscribed users with Purchase Order access",
        permission: "Purchase Orders",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: false },
        content: {
          inApp: {
            en: "Purchase Order [Number] is expected to end in 7 days\nThe expected end date is [Expected End Date]. Current status: [Status].\nCTA: See Detail",
            id: "Purchase Order [Number] diperkirakan selesai dalam 7 hari\nTanggal selesai yang diharapkan adalah [Expected End Date]. Status saat ini: [Status].\nCTA: Lihat Detail",
          },
          email: {
            subject: "Purchase Order [Number] is expected to end in 7 days",
            body: "The expected end date is [Expected End Date]. Current status: [Status].",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "po_expected_end_date_overdue",
        name: "Expected End Date Overdue",
        trigger: "Expected end date passed",
        type: "configurable",
        recipient: "Subscribed users with Purchase Order access",
        permission: "Purchase Orders",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Purchase Order [Number] is overdue against its expected end date\nThe expected end date was [Expected End Date]. Current status: [Status].\nCTA: See Detail",
            id: "Purchase Order [Number] melewati tanggal selesai yang diharapkan\nTanggal selesai yang diharapkan adalah [Expected End Date]. Status saat ini: [Status].\nCTA: Lihat Detail",
          },
          email: {
            subject: "Purchase Order [Number] is overdue",
            body: "Purchase Order [Number] passed its expected end date on [Expected End Date] and remains [Status].",
            cta: SEE_DETAIL,
          },
        },
      },
    ],
  },
];

// Grouped admin toggles: one control writes to several rule ids at once.
// (PRD §6.9 "Receipt Status Updates".)
export const NOTIFICATION_GROUPS = {
  wo_receipt_status: {
    id: "wo_receipt_status",
    label: "Receipt Status Updates",
    memberIds: [
      "wo_outsource_po_receipt_recorded",
      "wo_outsource_po_fully_received",
    ],
  },
};

// Flat list of every rule with its owning module id attached — convenient for
// building the per-rule settings state and for the personal-preference engine.
export const ALL_NOTIFICATION_RULES = DEFAULT_NOTIFICATION_SETTINGS.flatMap(
  (section) => section.items.map((item) => ({ ...item, moduleId: section.id }))
);

// Build the default company-settings state: per rule id →
// { enabled, inApp, email }. `enabled` is the notification's Default status;
// inApp/email are the delivery channels. Required rules are always fully on
// and cannot be changed. `enabled` defaults to true unless a rule opts out.
export const buildDefaultCompanySettings = () =>
  ALL_NOTIFICATION_RULES.reduce((acc, rule) => {
    acc[rule.id] =
      rule.type === "required"
        ? { enabled: true, inApp: true, email: true }
        : {
            enabled: rule.defaults.enabled !== false,
            inApp: rule.defaults.inApp,
            email: rule.defaults.email,
          };
    return acc;
  }, {});

// Deep clone a company-settings state object so edits never mutate the source.
export const cloneCompanySettings = (settings) =>
  Object.entries(settings || buildDefaultCompanySettings()).reduce(
    (acc, [id, channels]) => {
      acc[id] = { ...channels };
      return acc;
    },
    {}
  );

// Personal preference options (PRD Personal Notification Preferences AC #2).
export const PERSONAL_PREFERENCE_OPTIONS = {
  useCompanyDefault: "use_company_default",
  on: "on",
  off: "off",
};

// Build the default personal-preference state: every rule → "use_company_default".
export const buildDefaultPersonalPreferences = () =>
  ALL_NOTIFICATION_RULES.reduce((acc, rule) => {
    acc[rule.id] = {
      preference: PERSONAL_PREFERENCE_OPTIONS.useCompanyDefault,
      // Channel choices apply when the effective status resolves to On.
      inApp: rule.defaults.inApp,
      email: rule.defaults.email,
    };
    return acc;
  }, {});

export const clonePersonalPreferences = (prefs) =>
  Object.entries(prefs || buildDefaultPersonalPreferences()).reduce(
    (acc, [id, value]) => {
      acc[id] = { ...value };
      return acc;
    },
    {}
  );

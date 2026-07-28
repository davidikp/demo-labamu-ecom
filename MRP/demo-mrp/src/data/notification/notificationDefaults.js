// Company Notification Settings catalog.
//
// Matches "Notification System - Expansion & Preferences" (Remind Before
// revision): notifications grouped BY MODULE, each Required or Configurable,
// with independent In-app / Email channels and read-only metadata (description,
// recipient, permission mapping, Todo eligibility). The six "approaching"
// notifications additionally carry a company-configured Remind Before (days).
//
// In-memory demo data — no backend. Bahasa Indonesia copy follows house style:
// "Anda" (never kamu/-mu) and "Material" (never "Bahan Baku"). CTA wording is
// standard: "See Detail" (EN) / "Lihat Detail" (ID).

const SEE_DETAIL = { en: "See Detail", id: "Lihat Detail" };

export const NOTIFICATION_TYPES = {
  required: "required",
  configurable: "configurable",
};

// Reminder-timing (Remind Before) defaults and bounds.
export const DEFAULT_REMIND_BEFORE_DAYS = 7;
export const MIN_REMIND_BEFORE_DAYS = 1;
export const MAX_REMIND_BEFORE_DAYS = 90;

// The nine modules, in display order (PRD acceptance criterion #2).
export const DEFAULT_NOTIFICATION_SETTINGS = [
  {
    id: "approval",
    title: "Approval",
    description:
      "Workflow approval events across RFQ, Quote, Order, Purchase Order, and Custom Product Request. Recipients resolve directly from the approval workflow.",
    items: [
      {
        id: "approval_submission",
        name: "Approval Submission",
        description: "Notify the approver when a record is submitted for their approval.",
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
        description: "Update the submitter as each approver approves the record.",
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
        description: "Confirm to the submitter when all required approvals are complete.",
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
        description: "Alert the submitter when an approver rejects the record.",
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
        description: "Alert the submitter when an approver requests changes.",
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
      "Stock-level and batch-expiry alerts for materials. Sent to eligible users with Inventory access.",
    items: [
      {
        id: "material_running_low",
        name: "Material Running Low",
        description: "Warn when a material's available stock reaches its minimum level.",
        trigger: "Stock reaches minimum",
        type: "configurable",
        recipient: "Eligible users with Inventory access",
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
        description: "Alert when a material's available stock reaches zero.",
        trigger: "Stock reaches zero",
        type: "configurable",
        recipient: "Eligible users with Inventory access",
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
        description: "Remind ahead of a material batch's expiry date.",
        trigger: "Configured number of days before the batch expiry date",
        type: "configurable",
        recipient: "Eligible users with Inventory access",
        permission: "Batches",
        todo: null,
        groupId: null,
        remindBefore: DEFAULT_REMIND_BEFORE_DAYS,
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
        description: "Notify when a material batch has expired.",
        trigger: "Batch expires",
        type: "configurable",
        recipient: "Eligible users with Inventory access",
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
        description: "Ask the requester to confirm receipt once the transfer starts.",
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
        description: "Tell the preparer when the requester confirms receipt.",
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
        description: "Ask the preparer to resolve a rejected material receipt.",
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
        description: "Notify the requester when the preparer cancels the request.",
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
        description: "Announce a newly created material request to preparers.",
        trigger: "New Material Request is created",
        type: "configurable",
        recipient: "Eligible material preparers with access",
        permission: "Material Preparation",
        todo: null,
        groupId: null,
        // Off by default (PRD System Rules).
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
      "Work Order deadlines, status changes, new work orders, and outsourced Purchase Order activity. Sent to eligible users with Work Order access.",
    items: [
      {
        id: "wo_deadline_approaching",
        name: "Deadline Approaching",
        description: "Remind ahead of a work order's deadline.",
        trigger: "Configured reminder date before deadline",
        type: "configurable",
        recipient: "Eligible users with Work Orders access",
        permission: "Work Orders",
        todo: null,
        groupId: null,
        remindBefore: DEFAULT_REMIND_BEFORE_DAYS,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Work Order [Number] is approaching its deadline\nThe deadline is [Deadline Date]. Current status: [Status].\nCTA: See Detail",
            id: "Work Order [Number] mendekati batas waktu\nBatas waktunya adalah [Deadline Date]. Status saat ini: [Status].\nCTA: Lihat Detail",
          },
          email: {
            subject: "Work Order [Number] is approaching its deadline",
            body: "Work Order [Number] is approaching its deadline on [Deadline Date]. Current status: [Status].",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "wo_deadline_overdue",
        name: "Deadline Overdue",
        description: "Alert when a work order passes its deadline unresolved.",
        trigger: "Deadline passed",
        type: "configurable",
        recipient: "Eligible users with Work Orders access",
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
        description: "Notify when a work order is marked completed.",
        trigger: "Status changes to Completed",
        type: "configurable",
        recipient: "Eligible users with Work Orders access",
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
        description: "Notify when a work order is cancelled.",
        trigger: "Status changes to Cancelled",
        type: "configurable",
        recipient: "Eligible users with Work Orders access",
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
        description: "Announce a newly created work order.",
        trigger: "Work Order is created with status Not Started",
        type: "configurable",
        recipient: "Eligible users with Work Orders access",
        permission: "Work Orders",
        todo: null,
        groupId: null,
        // Off by default (PRD System Rules).
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
        description: "Notify when a purchase order for an outsourced work order is issued.",
        trigger:
          "A Purchase Order containing one or more outsourced Work Orders changes to Issued (one notification per linked Work Order)",
        type: "configurable",
        recipient: "Eligible users with access to the related Work Order",
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
        description: "Notify when a partial receipt is recorded for an outsourced work order.",
        trigger:
          "A receipt transaction is recorded for an outsourced Work Order that remains partially received",
        type: "configurable",
        recipient: "Eligible users with access to the related Work Order",
        permission: "Work Orders",
        todo: null,
        // Grouped admin toggle: "Receipt Status Updates" (PRD §6.9).
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
        description: "Notify when an outsourced work order is fully received.",
        trigger:
          "A receipt transaction brings an outsourced Work Order to its total ordered quantity",
        type: "configurable",
        recipient: "Eligible users with access to the related Work Order",
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
        description: "Announce a newly created custom product request.",
        trigger: "New request",
        type: "configurable",
        recipient: "Subscribed users with CPR access",
        permission: "Custom Product Requests",
        todo: null,
        groupId: null,
        // Off by default (PRD System Rules).
        defaults: { enabled: false, inApp: true, email: false },
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
        description: "Remind ahead of a quote's validity expiry.",
        trigger: "Configured reminder date before valid-until date",
        type: "configurable",
        recipient: "Subscribed users with Quote access",
        permission: "Quotes",
        todo: null,
        groupId: null,
        remindBefore: DEFAULT_REMIND_BEFORE_DAYS,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Quote [Number] is approaching its validity date\nThe Quote is valid until [Valid Until Date].\nCTA: See Detail",
            id: "Quote [Number] mendekati tanggal berakhir\nQuote berlaku sampai [Valid Until Date].\nCTA: Lihat Detail",
          },
          email: {
            subject: "Quote [Number] is approaching its validity date",
            body: "Quote [Number] is valid until [Valid Until Date]. Please review and follow up before it expires.",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "quote_approved_by_customer",
        name: "Quote Approved by Customer",
        description: "Notify when a customer approves a quote in the portal.",
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
        description: "Notify when a customer rejects a quote in the portal.",
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
        description: "Notify when a customer requests quote changes in the portal.",
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
      "Order deadlines, status changes, new orders, and linked-invoice payment. Sent to eligible users with Order access.",
    items: [
      {
        id: "order_deadline_approaching",
        name: "Order Deadline Approaching",
        description: "Remind ahead of an order's deadline.",
        trigger: "Configured reminder date before deadline",
        type: "configurable",
        recipient: "Eligible users with Orders access",
        permission: "Orders",
        todo: null,
        groupId: null,
        remindBefore: DEFAULT_REMIND_BEFORE_DAYS,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Order [Number] is approaching its deadline\nThe deadline is [Deadline Date]. Current status: [Status].\nCTA: See Detail",
            id: "Order [Number] mendekati batas waktu\nBatas waktunya adalah [Deadline Date]. Status saat ini: [Status].\nCTA: Lihat Detail",
          },
          email: {
            subject: "Order [Number] is approaching its deadline",
            body: "Order [Number] is approaching its deadline on [Deadline Date]. Current status: [Status].",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "order_deadline_overdue",
        name: "Order Deadline Overdue",
        description: "Alert when an order passes its deadline unresolved.",
        trigger: "Deadline passed",
        type: "configurable",
        recipient: "Eligible users with Orders access",
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
        description: "Notify when an order is marked completed.",
        trigger: "Status changes to Completed",
        type: "configurable",
        recipient: "Eligible users with Orders access",
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
        description: "Notify when an order is cancelled.",
        trigger: "Status changes to Cancelled",
        type: "configurable",
        recipient: "Eligible users with Orders access",
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
        description: "Announce a newly created order.",
        trigger: "Order is created with status Not Started",
        type: "configurable",
        recipient: "Eligible users with Orders access",
        permission: "Orders",
        todo: null,
        groupId: null,
        // Off by default (PRD System Rules).
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
        description: "Notify when an invoice linked to an order is fully paid.",
        trigger: "An Invoice linked to an Order changes to Paid",
        type: "configurable",
        recipient: "Eligible users with access to the related Order",
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
        description: "Remind ahead of an invoice's due date.",
        trigger: "Configured reminder date before due date",
        type: "configurable",
        recipient: "Subscribed users with Invoice access",
        permission: "Invoices",
        todo: null,
        groupId: null,
        remindBefore: DEFAULT_REMIND_BEFORE_DAYS,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Invoice [Number] is approaching its due date\nThe due date is [Due Date]. Outstanding amount: [Amount] [Currency].\nCTA: See Detail",
            id: "Invoice [Number] mendekati tanggal jatuh tempo\nTanggal jatuh tempo adalah [Due Date]. Sisa tagihan: [Amount] [Currency].\nCTA: Lihat Detail",
          },
          email: {
            subject: "Invoice [Number] is approaching its due date",
            body: "Invoice [Number] is approaching its due date on [Due Date]. Outstanding amount: [Amount] [Currency].",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "invoice_overdue",
        name: "Invoice Overdue",
        description: "Alert when an invoice passes its due date unpaid.",
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
        description: "Notify when a customer approves an invoice in the portal.",
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
        description: "Notify when a customer rejects an invoice in the portal.",
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
        description: "Notify when a customer requests invoice changes in the portal.",
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
        description: "Ask the owner to review customer-submitted payment proof.",
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
        description: "Notify the customer when their payment proof is rejected.",
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
        description: "Alert when a purchase order payment passes its due date.",
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
        description: "Remind ahead of a purchase order's expected end date.",
        trigger: "Configured reminder date before expected end date",
        type: "configurable",
        recipient: "Subscribed users with Purchase Order access",
        permission: "Purchase Orders",
        todo: null,
        groupId: null,
        remindBefore: DEFAULT_REMIND_BEFORE_DAYS,
        defaults: { inApp: true, email: false },
        content: {
          inApp: {
            en: "Purchase Order [Number] is approaching its expected end date\nThe expected end date is [Expected End Date]. Current status: [Status].\nCTA: See Detail",
            id: "Purchase Order [Number] mendekati tanggal selesai yang diperkirakan\nTanggal selesai yang diharapkan adalah [Expected End Date]. Status saat ini: [Status].\nCTA: Lihat Detail",
          },
          email: {
            subject: "Purchase Order [Number] is approaching its expected end date",
            body: "Purchase Order [Number] is approaching its expected end date on [Expected End Date]. Current status: [Status].",
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "po_expected_end_date_overdue",
        name: "Expected End Date Overdue",
        description: "Alert when a purchase order passes its expected end date.",
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

// Rules that support a company-configured "approaching" reminder (Remind Before).
export const REMINDER_SUPPORTED_RULE_IDS = new Set([
  "material_expiring_soon",
  "wo_deadline_approaching",
  "quote_valid_until_reminder",
  "order_deadline_approaching",
  "invoice_due_date_approaching",
  "po_expected_end_date_approaching",
]);

// Flat list of every rule with its owning module id attached.
export const ALL_NOTIFICATION_RULES = DEFAULT_NOTIFICATION_SETTINGS.flatMap(
  (section) => section.items.map((item) => ({ ...item, moduleId: section.id }))
);

// Build the default company-settings state: per rule id →
// { inApp, email, [remindBefore] }. A notification's on/off status is derived
// from its channels — it is "on" when at least one channel is enabled, and at
// least one channel must always stay on. remindBefore (days) is present only
// for reminder-supported rules. Required rules are always fully on.
export const buildDefaultCompanySettings = () =>
  ALL_NOTIFICATION_RULES.reduce((acc, rule) => {
    const base =
      rule.type === "required"
        ? { inApp: true, email: true }
        : { inApp: rule.defaults.inApp, email: rule.defaults.email };
    if (REMINDER_SUPPORTED_RULE_IDS.has(rule.id)) {
      base.remindBefore = rule.remindBefore ?? DEFAULT_REMIND_BEFORE_DAYS;
    }
    acc[rule.id] = base;
    return acc;
  }, {});

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

export const buildDefaultPersonalPreferences = () =>
  ALL_NOTIFICATION_RULES.reduce((acc, rule) => {
    acc[rule.id] = {
      preference: PERSONAL_PREFERENCE_OPTIONS.useCompanyDefault,
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

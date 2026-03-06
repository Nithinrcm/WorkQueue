import type { DocumentItem } from "./documents";

export interface DocumentField {
  key: string;
  label: string;
  value: string;
  highlighted?: boolean;
  category?: string;
  // confidence score from 0-100 (optional)
  confidence?: number;
}

const deterministicConfidence = (docId: string, key: string) => {
  // stable pseudo-random confidence based on doc id and field key
  const s = `${docId}:${key}`;
  let sum = 0;
  for (let i = 0; i < s.length; i++) sum += s.charCodeAt(i);
  // produce value between 50 and 99
  return (sum % 50) + 50;
};

export const getDocumentFields = (doc: DocumentItem): DocumentField[] => {
  const base: DocumentField[] = [
    {
      key: "fileName",
      label: "File Name",
      value: doc.fileName,
      highlighted: false,
      category: "Document Info",
      confidence: deterministicConfidence(doc.id, "fileName"),
    },
    {
      key: "uploadedBy",
      label: "Uploaded By",
      value: doc.uploadedBy,
      highlighted: false,
      category: "Document Info",
      confidence: deterministicConfidence(doc.id, "uploadedBy"),
    },
    {
      key: "uploadDate",
      label: "Upload Date",
      value: doc.uploadDate,
      highlighted: false,
      category: "Document Info",
      confidence: deterministicConfidence(doc.id, "uploadDate"),
    },
  ];

  if (doc.type === "Distribution") {
    return [
      ...base,
      {
        key: "fundName",
        label: "Fund Name",
        value: "Alpha Growth Fund",
        highlighted: true,
        category: "Fund Details",
        confidence: deterministicConfidence(doc.id, "fundName"),
      },
      {
        key: "distributionType",
        label: "Distribution Type",
        value: "Dividend",
        highlighted: true,
        category: "Fund Details",
        confidence: deterministicConfidence(doc.id, "distributionType"),
      },
      {
        key: "amount",
        label: "Amount ($)",
        value: "125,430.00",
        highlighted: true,
        category: "Fund Details",
        confidence: deterministicConfidence(doc.id, "amount"),
      },
      {
        key: "recordDate",
        label: "Record Date",
        value: "2026-02-15",
        highlighted: true,
        category: "Schedule",
        confidence: deterministicConfidence(doc.id, "recordDate"),
      },
      {
        key: "payDate",
        label: "Pay Date",
        value: "2026-03-01",
        highlighted: true,
        category: "Schedule",
        confidence: deterministicConfidence(doc.id, "payDate"),
      },
      {
        key: "currency",
        label: "Currency",
        value: "USD",
        highlighted: true,
        category: "Account & Tax",
        confidence: deterministicConfidence(doc.id, "currency"),
      },
      {
        key: "accountNumber",
        label: "Account Number",
        value: "ACC-8834-XJ",
        highlighted: true,
        category: "Account & Tax",
        confidence: deterministicConfidence(doc.id, "accountNumber"),
      },
      {
        key: "taxRate",
        label: "Tax Rate (%)",
        value: "15",
        highlighted: true,
        category: "Account & Tax",
        confidence: deterministicConfidence(doc.id, "taxRate"),
      },
    ];
  }

  if (doc.type === "Re-org") {
    return [
      ...base,
      {
        key: "reorgEventType",
        label: "Re-org Event",
        value: "Merger",
        highlighted: true,
        category: "Event Details",
        confidence: deterministicConfidence(doc.id, "reorgEventType"),
      },
      {
        key: "issuer",
        label: "Issuer",
        value: "Acme Corp",
        highlighted: true,
        category: "Event Details",
        confidence: deterministicConfidence(doc.id, "issuer"),
      },
      {
        key: "cusip",
        label: "CUSIP",
        value: "00206R102",
        highlighted: true,
        category: "Event Details",
        confidence: deterministicConfidence(doc.id, "cusip"),
      },
      {
        key: "effectiveDate",
        label: "Effective Date",
        value: "2026-03-15",
        highlighted: true,
        category: "Transaction",
        confidence: deterministicConfidence(doc.id, "effectiveDate"),
      },
      {
        key: "ratio",
        label: "Exchange Ratio",
        value: "1:2.5",
        highlighted: true,
        category: "Transaction",
        confidence: deterministicConfidence(doc.id, "ratio"),
      },
      {
        key: "acquirer",
        label: "Acquirer",
        value: "Global Industries Inc",
        highlighted: true,
        category: "Transaction",
        confidence: deterministicConfidence(doc.id, "acquirer"),
      },
      {
        key: "electionDeadline",
        label: "Election Deadline",
        value: "2026-03-10",
        highlighted: true,
        category: "Transaction",
        confidence: deterministicConfidence(doc.id, "electionDeadline"),
      },
      {
        key: "cashConsideration",
        label: "Cash Consideration ($)",
        value: "45.00",
        highlighted: true,
        category: "Transaction",
        confidence: deterministicConfidence(doc.id, "cashConsideration"),
      },
    ];
  }

  return [
    ...base,
    {
      key: "fundName",
      label: "Fund Name",
      value: "Beta Income Fund",
      highlighted: true,
      category: "Fund Details",
      confidence: deterministicConfidence(doc.id, "fundName"),
    },
    {
      key: "redemptionType",
      label: "Redemption Type",
      value: "Full",
      highlighted: true,
      category: "Fund Details",
      confidence: deterministicConfidence(doc.id, "redemptionType"),
    },
    {
      key: "shares",
      label: "Shares",
      value: "10,000",
      highlighted: true,
      category: "Fund Details",
      confidence: deterministicConfidence(doc.id, "shares"),
    },
    {
      key: "nav",
      label: "NAV ($)",
      value: "24.56",
      highlighted: true,
      category: "Fund Details",
      confidence: deterministicConfidence(doc.id, "nav"),
    },
    {
      key: "totalValue",
      label: "Total Value ($)",
      value: "245,600.00",
      highlighted: true,
      category: "Fund Details",
      confidence: deterministicConfidence(doc.id, "totalValue"),
    },
    {
      key: "settlementDate",
      label: "Settlement Date",
      value: "2026-03-05",
      highlighted: true,
      category: "Settlement",
      confidence: deterministicConfidence(doc.id, "settlementDate"),
    },
    {
      key: "accountNumber",
      label: "Account Number",
      value: "RDM-4421-KP",
      highlighted: true,
      category: "Settlement",
      confidence: deterministicConfidence(doc.id, "accountNumber"),
    },
    {
      key: "wireInstructions",
      label: "Wire Instructions",
      value: "JPM Chase — ABA 021000021",
      highlighted: true,
      category: "Settlement",
      confidence: deterministicConfidence(doc.id, "wireInstructions"),
    },
  ];
};

// Original (non-editable) values for the PDF — these never change
const getOriginalFieldValues = (doc: DocumentItem): Record<string, string> => {
  const fields = getDocumentFields(doc);
  const map: Record<string, string> = {};
  fields.forEach((f) => {
    map[f.key] = f.value;
  });
  return map;
};

type PdfLine = { text: string; isHighlighted: boolean; fieldKey?: string };

export const getPdfContent = (
  doc: DocumentItem,
  _fieldValues?: Record<string, string>,
  page?: number,
): PdfLine[] => {
  // Always use original values — PDF is read-only
  const fv = getOriginalFieldValues(doc);
  const v = (key: string) => fv[key] || "";
  const p = page || 1;

  if (doc.type === "Distribution") {
    if (p === 1) {
      return [
        { text: "DISTRIBUTION NOTICE", isHighlighted: false },
        { text: "", isHighlighted: false },
        {
          text: `Document: ${v("fileName")}`,
          isHighlighted: true,
          fieldKey: "fileName",
        },
        {
          text: `Uploaded By: ${v("uploadedBy")}`,
          isHighlighted: true,
          fieldKey: "uploadedBy",
        },
        {
          text: `Date: ${v("uploadDate")}`,
          isHighlighted: true,
          fieldKey: "uploadDate",
        },
        { text: "", isHighlighted: false },
        { text: "To Whom It May Concern,", isHighlighted: false },
        { text: "", isHighlighted: false },
        {
          text: "This notice is to inform you of the following distribution:",
          isHighlighted: false,
        },
        { text: "", isHighlighted: false },
        {
          text: `Fund Name: ${v("fundName")}`,
          isHighlighted: true,
          fieldKey: "fundName",
        },
        {
          text: `Distribution Type: ${v("distributionType")}`,
          isHighlighted: true,
          fieldKey: "distributionType",
        },
        {
          text: `Amount: $${v("amount")}`,
          isHighlighted: true,
          fieldKey: "amount",
        },
      ];
    }
    if (p === 2) {
      return [
        { text: "DISTRIBUTION NOTICE — Page 2", isHighlighted: false },
        { text: "", isHighlighted: false },
        { text: "SCHEDULE & PAYMENT DETAILS", isHighlighted: false },
        { text: "", isHighlighted: false },
        {
          text: `Record Date: ${v("recordDate")}`,
          isHighlighted: true,
          fieldKey: "recordDate",
        },
        {
          text: `Pay Date: ${v("payDate")}`,
          isHighlighted: true,
          fieldKey: "payDate",
        },
        { text: "", isHighlighted: false },
        {
          text: "Payment will be processed on the pay date specified above.",
          isHighlighted: false,
        },
        {
          text: "Eligible shareholders as of the record date will receive payment.",
          isHighlighted: false,
        },
      ];
    }
    if (p === 3) {
      return [
        { text: "DISTRIBUTION NOTICE — Page 3", isHighlighted: false },
        { text: "", isHighlighted: false },
        { text: "ACCOUNT & TAX DETAILS", isHighlighted: false },
        { text: "", isHighlighted: false },
        {
          text: `Currency: ${v("currency")}`,
          isHighlighted: true,
          fieldKey: "currency",
        },
        {
          text: `Account Number: ${v("accountNumber")}`,
          isHighlighted: true,
          fieldKey: "accountNumber",
        },
        {
          text: `Tax Rate: ${v("taxRate")}%`,
          isHighlighted: true,
          fieldKey: "taxRate",
        },
        { text: "", isHighlighted: false },
        {
          text: "Tax withholding will be applied at the rate specified above.",
          isHighlighted: false,
        },
        {
          text: "For tax-exempt accounts, please provide documentation.",
          isHighlighted: false,
        },
        { text: "", isHighlighted: false },
        { text: "Payment Method: Wire Transfer", isHighlighted: false },
        { text: "Processing Time: T+2 Business Days", isHighlighted: false },
      ];
    }
    return [
      { text: `DISTRIBUTION NOTICE — Page ${p}`, isHighlighted: false },
      { text: "", isHighlighted: false },
      { text: "DISCLAIMERS & LEGAL NOTICES", isHighlighted: false },
      { text: "", isHighlighted: false },
      {
        text: "Please ensure all details are verified before the pay date.",
        isHighlighted: false,
      },
      {
        text: "For questions, contact the Fund Administrator.",
        isHighlighted: false,
      },
      { text: "", isHighlighted: false },
      {
        text: "This notice is provided for informational purposes only.",
        isHighlighted: false,
      },
      {
        text: "Past distributions do not guarantee future distributions.",
        isHighlighted: false,
      },
      { text: "", isHighlighted: false },
      { text: "Regards,", isHighlighted: false },
      { text: "Fund Operations Team", isHighlighted: false },
    ];
  }

  if (doc.type === "Re-org") {
    if (p === 1) {
      return [
        { text: "CORPORATE REORGANIZATION NOTICE", isHighlighted: false },
        { text: "", isHighlighted: false },
        {
          text: `Document: ${v("fileName")}`,
          isHighlighted: true,
          fieldKey: "fileName",
        },
        {
          text: `Uploaded By: ${v("uploadedBy")}`,
          isHighlighted: true,
          fieldKey: "uploadedBy",
        },
        {
          text: `Date: ${v("uploadDate")}`,
          isHighlighted: true,
          fieldKey: "uploadDate",
        },
        { text: "", isHighlighted: false },
        {
          text: "RE: Corporate Action — Mandatory Event",
          isHighlighted: false,
        },
        { text: "", isHighlighted: false },
        {
          text: `Event Type: ${v("reorgEventType")}`,
          isHighlighted: true,
          fieldKey: "reorgEventType",
        },
        {
          text: `Issuer: ${v("issuer")}`,
          isHighlighted: true,
          fieldKey: "issuer",
        },
        {
          text: `CUSIP: ${v("cusip")}`,
          isHighlighted: true,
          fieldKey: "cusip",
        },
      ];
    }
    if (p === 2) {
      return [
        { text: "CORPORATE REORGANIZATION — Page 2", isHighlighted: false },
        { text: "", isHighlighted: false },
        { text: "TRANSACTION DETAILS", isHighlighted: false },
        { text: "", isHighlighted: false },
        {
          text: `Effective Date: ${v("effectiveDate")}`,
          isHighlighted: true,
          fieldKey: "effectiveDate",
        },
        {
          text: `Exchange Ratio: ${v("ratio")}`,
          isHighlighted: true,
          fieldKey: "ratio",
        },
        {
          text: `Acquirer: ${v("acquirer")}`,
          isHighlighted: true,
          fieldKey: "acquirer",
        },
        {
          text: `Cash Consideration: $${v("cashConsideration")} per share`,
          isHighlighted: true,
          fieldKey: "cashConsideration",
        },
        { text: "", isHighlighted: false },
        {
          text: `Election Deadline: ${v("electionDeadline")}`,
          isHighlighted: true,
          fieldKey: "electionDeadline",
        },
      ];
    }
    return [
      { text: `CORPORATE REORGANIZATION — Page ${p}`, isHighlighted: false },
      { text: "", isHighlighted: false },
      { text: "SHAREHOLDER INSTRUCTIONS", isHighlighted: false },
      { text: "", isHighlighted: false },
      {
        text: "Shareholders are advised to review the terms carefully.",
        isHighlighted: false,
      },
      {
        text: "Contact your broker for election instructions.",
        isHighlighted: false,
      },
      { text: "", isHighlighted: false },
      {
        text: "All elections must be received by the deadline above.",
        isHighlighted: false,
      },
      {
        text: "Unelected positions will receive the default consideration.",
        isHighlighted: false,
      },
      { text: "", isHighlighted: false },
      { text: "Corporate Actions Department", isHighlighted: false },
    ];
  }

  // Redemption
  if (p === 1) {
    return [
      { text: "REDEMPTION REQUEST", isHighlighted: false },
      { text: "", isHighlighted: false },
      {
        text: `Document: ${v("fileName")}`,
        isHighlighted: true,
        fieldKey: "fileName",
      },
      {
        text: `Uploaded By: ${v("uploadedBy")}`,
        isHighlighted: true,
        fieldKey: "uploadedBy",
      },
      {
        text: `Date: ${v("uploadDate")}`,
        isHighlighted: true,
        fieldKey: "uploadDate",
      },
      { text: "", isHighlighted: false },
      {
        text: "This document confirms the following redemption request:",
        isHighlighted: false,
      },
      { text: "", isHighlighted: false },
      {
        text: `Fund Name: ${v("fundName")}`,
        isHighlighted: true,
        fieldKey: "fundName",
      },
      {
        text: `Redemption Type: ${v("redemptionType")}`,
        isHighlighted: true,
        fieldKey: "redemptionType",
      },
      {
        text: `Shares: ${v("shares")}`,
        isHighlighted: true,
        fieldKey: "shares",
      },
      { text: `NAV: $${v("nav")}`, isHighlighted: true, fieldKey: "nav" },
      {
        text: `Total Value: $${v("totalValue")}`,
        isHighlighted: true,
        fieldKey: "totalValue",
      },
    ];
  }
  if (p === 2) {
    return [
      { text: "REDEMPTION REQUEST — Page 2", isHighlighted: false },
      { text: "", isHighlighted: false },
      { text: "SETTLEMENT DETAILS", isHighlighted: false },
      { text: "", isHighlighted: false },
      {
        text: `Settlement Date: ${v("settlementDate")}`,
        isHighlighted: true,
        fieldKey: "settlementDate",
      },
      {
        text: `Account Number: ${v("accountNumber")}`,
        isHighlighted: true,
        fieldKey: "accountNumber",
      },
      {
        text: `Wire: ${v("wireInstructions")}`,
        isHighlighted: true,
        fieldKey: "wireInstructions",
      },
      { text: "", isHighlighted: false },
      {
        text: "Please confirm all details prior to settlement.",
        isHighlighted: false,
      },
      { text: "Fund Administration Office", isHighlighted: false },
    ];
  }
  return [
    { text: `REDEMPTION REQUEST — Page ${p}`, isHighlighted: false },
    { text: "", isHighlighted: false },
    { text: "ADDITIONAL TERMS & CONDITIONS", isHighlighted: false },
    { text: "", isHighlighted: false },
    {
      text: "Early redemption fees may apply per the fund prospectus.",
      isHighlighted: false,
    },
    {
      text: "Settlement is subject to available liquidity.",
      isHighlighted: false,
    },
    { text: "", isHighlighted: false },
    {
      text: "For partial redemptions, remaining shares will continue",
      isHighlighted: false,
    },
    { text: "to be held under the same account terms.", isHighlighted: false },
    { text: "", isHighlighted: false },
    { text: "Investor Services Department", isHighlighted: false },
  ];
};

// Simple in-memory store that persists document edits across navigation
import type { DocumentField } from "./documentFields";

interface SavedDocumentData {
  fields: Record<string, string>;
  eventType: string;
  approved?: boolean;
  // optional per-field review comment
  comments?: Record<string, string>;
}

const store: Record<string, SavedDocumentData> = {};

export const saveDocumentData = (
  docId: string,
  fields: DocumentField[],
  eventType: string,
) => {
  const existing = store[docId];
  const map: Record<string, string> = {};
  fields.forEach((f) => {
    map[f.key] = f.value;
  });
  store[docId] = {
    fields: map,
    eventType,
    approved: existing?.approved,
    comments: existing?.comments,
  };
};

export const getSavedDocumentData = (
  docId: string,
): SavedDocumentData | undefined => {
  return store[docId];
};

export const approveDocument = (
  docId: string,
  fields: DocumentField[],
  eventType: string,
) => {
  const map: Record<string, string> = {};
  fields.forEach((f) => {
    map[f.key] = f.value;
  });
  store[docId] = {
    fields: map,
    eventType,
    approved: true,
    comments: store[docId]?.comments,
  };
};

// store or update a review comment for a specific field
export const saveFieldComment = (
  docId: string,
  fieldKey: string,
  comment: string,
) => {
  const existing = store[docId] || { fields: {}, eventType: "" };
  const comments = existing.comments ? { ...existing.comments } : {};
  comments[fieldKey] = comment;
  store[docId] = { ...existing, comments };
};

export const isDocumentApproved = (docId: string): boolean => {
  return store[docId]?.approved === true;
};

// Build a map: fieldKey -> page number for a given doc type
export const getFieldPageMap = (docType: string): Record<string, number> => {
  if (docType === "Distribution") {
    return {
      fileName: 1,
      uploadedBy: 1,
      uploadDate: 1,
      fundName: 1,
      distributionType: 1,
      amount: 1,
      recordDate: 2,
      payDate: 2,
      currency: 3,
      accountNumber: 3,
      taxRate: 3,
    };
  }
  if (docType === "Re-org") {
    return {
      fileName: 1,
      uploadedBy: 1,
      uploadDate: 1,
      reorgEventType: 1,
      issuer: 1,
      cusip: 1,
      effectiveDate: 2,
      ratio: 2,
      acquirer: 2,
      cashConsideration: 2,
      electionDeadline: 2,
    };
  }
  // Redemption
  return {
    fileName: 1,
    uploadedBy: 1,
    uploadDate: 1,
    fundName: 1,
    redemptionType: 1,
    shares: 1,
    nav: 1,
    totalValue: 1,
    settlementDate: 2,
    accountNumber: 2,
    wireInstructions: 2,
  };
};

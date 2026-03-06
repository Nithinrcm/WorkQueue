export interface DocumentItem {
  id: string;
  fileName: string;
  fileSize: string;
  uploadedBy: string;
  uploadDate: string;
  type: "Distribution" | "Re-org" | "Redemption";
  pages: number;
  status: "to_be_processed" | "processed" | "exception";
  exceptionReason?: string;
  approved?: boolean;
}

export const mockDocuments: DocumentItem[] = [
  {
    id: "1",
    fileName: "Dist_Fund_Alpha_Q1.pdf",
    fileSize: "1.2 MB",
    uploadedBy: "John Smith",
    uploadDate: "2026-02-28",
    type: "Distribution",
    pages: 3,
    status: "to_be_processed",
  },
  {
    id: "2",
    fileName: "Reorg_Merger_Acme.pdf",
    fileSize: "850 KB",
    uploadedBy: "Sarah Lee",
    uploadDate: "2026-02-27",
    type: "Re-org",
    pages: 12,
    status: "to_be_processed",
  },
  {
    id: "3",
    fileName: "Redemption_ClientA.pdf",
    fileSize: "340 KB",
    uploadedBy: "Mike Chen",
    uploadDate: "2026-02-27",
    type: "Redemption",
    pages: 2,
    status: "to_be_processed",
  },
  {
    id: "4",
    fileName: "Dist_Dividend_Feb.pdf",
    fileSize: "2.1 MB",
    uploadedBy: "Emily Davis",
    uploadDate: "2026-02-26",
    type: "Distribution",
    pages: 4,
    status: "to_be_processed",
  },
  {
    id: "5",
    fileName: "Reorg_Spinoff_XYZ.pdf",
    fileSize: "5.4 MB",
    uploadedBy: "John Smith",
    uploadDate: "2026-02-25",
    type: "Re-org",
    pages: 28,
    status: "to_be_processed",
  },
  {
    id: "6",
    fileName: "Redemption_FundB.pdf",
    fileSize: "620 KB",
    uploadedBy: "Sarah Lee",
    uploadDate: "2026-02-24",
    type: "Redemption",
    pages: 2,
    status: "processed",
  },
  {
    id: "7",
    fileName: "Dist_Capital_Gain.pdf",
    fileSize: "1.0 MB",
    uploadedBy: "Mike Chen",
    uploadDate: "2026-02-24",
    type: "Distribution",
    pages: 2,
    status: "processed",
  },
  {
    id: "8",
    fileName: "Reorg_Acquisition.pdf",
    fileSize: "3.8 MB",
    uploadedBy: "Emily Davis",
    uploadDate: "2026-02-23",
    type: "Re-org",
    pages: 18,
    status: "processed",
  },
  {
    id: "9",
    fileName: "Redemption_PartialC.pdf",
    fileSize: "920 KB",
    uploadedBy: "John Smith",
    uploadDate: "2026-02-22",
    type: "Redemption",
    pages: 5,
    status: "processed",
  },
  {
    id: "10",
    fileName: "Dist_Corrupted_003.pdf",
    fileSize: "45 KB",
    uploadedBy: "Sarah Lee",
    uploadDate: "2026-02-26",
    type: "Distribution",
    pages: 1,
    status: "exception",
    exceptionReason:
      "File is corrupted — unable to extract text content. The PDF structure is damaged and cannot be parsed.",
  },
  {
    id: "11",
    fileName: "Reorg_Blank_Upload.pdf",
    fileSize: "12 KB",
    uploadedBy: "Mike Chen",
    uploadDate: "2026-02-25",
    type: "Re-org",
    pages: 1,
    status: "exception",
    exceptionReason:
      "Uploaded file contains no readable pages. The document appears to be blank or improperly scanned.",
  },
  {
    id: "12",
    fileName: "Redemption_Protected.pdf",
    fileSize: "1.5 MB",
    uploadedBy: "Emily Davis",
    uploadDate: "2026-02-24",
    type: "Redemption",
    pages: 1,
    status: "exception",
    exceptionReason:
      "PDF is password-protected. Unable to access document content for field extraction without the correct password.",
  },
];

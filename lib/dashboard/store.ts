export type OrderStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "QUOTE_SENT"
  | "AWAITING_APPROVAL"
  | "PAYMENT_PENDING"
  | "SCHEDULED"
  | "IN_TRANSLATION"
  | "QUALITY_REVIEW"
  | "CLIENT_REVIEW"
  | "REVISION_REQUESTED"
  | "COMPLETED"
  | "ARCHIVED"
  | "CANCELLED";

export type ServiceType =
  | "STANDARD"
  | "CERTIFIED"
  | "NOTARIZED"
  | "LEGAL"
  | "MEDICAL"
  | "TECHNICAL"
  | "LOCALIZATION"
  | "PROOFREADING";

export type Priority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type ClientRole = "OWNER" | "BILLING_MANAGER" | "REQUESTER" | "VIEWER";
export type AdminRole =
  | "ADMIN"
  | "PROJECT_MANAGER"
  | "TRANSLATOR"
  | "QA_REVIEWER"
  | "FINANCE_MANAGER"
  | "SUPPORT_AGENT";

export interface UploadedFile {
  id: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  uploadedAt: string;
  sha256: string;
  scanStatus: "CLEAN" | "SCANNING" | "FLAGGED";
  previewUrl?: string;
}

export interface DeliveredFile {
  id: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  deliveredAt: string;
  sha256: string;
  verifyCode: string;
  certifiedPdfUrl: string;
  downloadCount: number;
  version: number;
}

export interface ThreadMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "CLIENT" | "STAFF" | "SYSTEM";
  body: string;
  attachments?: { name: string; size: string; url: string }[];
  createdAt: string;
  isInternal: boolean;
  read: boolean;
}

export interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  actor: string;
  timestamp: string;
}

export interface OrderQuote {
  id: string;
  version: number;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED";
  baseAmount: number;
  rushAmount: number;
  certAmount: number;
  notaryAmount: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  expiresAt: string;
  acceptedAt?: string;
}

export interface OrderInvoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: "PAID" | "PENDING" | "OVERDUE" | "REFUNDED";
  issuedAt: string;
  dueDate: string;
  paidAt?: string;
  stripePaymentIntentId?: string;
}

export interface OrderRevision {
  id: string;
  requestedAt: string;
  clientNotes: string;
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED";
  resolvedAt?: string;
  assignedTo?: string;
}

export interface QAChecklist {
  terminologyVerified: boolean;
  formattingMirrored: boolean;
  completenessChecked: boolean;
  cfrAffidavitSigned: boolean;
  stampsTranscribed: boolean;
  reviewerNotes: string;
  reviewerName: string;
  completedAt: string | null;
}

export interface DashboardOrder {
  id: string;
  publicCode: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  organizationId?: string;
  organizationName?: string;
  matterNumber?: string;
  serviceType: ServiceType;
  sourceLang: string;
  targetLangs: string[];
  status: OrderStatus;
  priority: Priority;
  pageCount: number;
  wordCount: number;
  subtotal: number;
  rushFee: number;
  certificationFee: number;
  notarizationFee: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  receivingParty?: string;
  assignedPM: string;
  assignedTranslator?: string;
  assignedReviewer?: string;
  submittedAt: string;
  promisedAt: string;
  completedAt?: string;
  uploadedFiles: UploadedFile[];
  deliveredFiles: DeliveredFile[];
  messages: ThreadMessage[];
  timeline: TimelineEvent[];
  quote: OrderQuote;
  invoices: OrderInvoice[];
  revisions: OrderRevision[];
  qualityChecklist: QAChecklist;
}

export interface TranslatorProfile {
  id: string;
  name: string;
  email: string;
  languages: string[];
  credentials: string;
  specialties: string[];
  internalRatePerWord: number;
  internalRatePerPage: number;
  rating: number;
  completedOrders: number;
  activeWorkload: number;
  availability: "AVAILABLE" | "BUSY" | "AWAY";
  ndaSigned: boolean;
  complianceDocStatus: "VERIFIED" | "PENDING" | "EXPIRED";
}

export interface OrganizationRecord {
  id: string;
  name: string;
  slug: string;
  tier: "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
  membersCount: number;
  activeOrdersCount: number;
  totalSpent: number;
  customDiscountPercent: number;
  billingEmail: string;
}

export interface SupportTicketRecord {
  id: string;
  ticketNumber: string;
  clientName: string;
  clientEmail: string;
  orderId?: string;
  subject: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  priority: "URGENT" | "HIGH" | "MEDIUM" | "LOW";
  slaDueAt: string;
  createdAt: string;
  messagesCount: number;
}

export interface SystemSettingsRecord {
  supportedLanguages: {
    code: string;
    name: string;
    nativeName: string;
    active: boolean;
    rateMultiplier: number;
  }[];
  services: {
    id: ServiceType;
    name: string;
    baseRatePerPage: number;
    turnAroundHours: number;
    active: boolean;
    description: string;
  }[];
  pricingRules: {
    standardPerWord: number;
    certifiedPerPage: number;
    rushMultiplier: number;
    notarizationFee: number;
    minimumOrderFee: number;
  };
  retentionPolicyDays: number;
  businessHours: {
    open: string;
    close: string;
    timezone: string;
  };
}

// Initial In-Memory Database Seed
let ordersStore: DashboardOrder[] = [
  {
    id: "ord-1",
    publicCode: "VL-7X9K2",
    clientId: "usr-1",
    clientName: "Alejandro Hernandez",
    clientEmail: "alejandro.hernandez@lawdesk.org",
    organizationId: "org-1",
    organizationName: "Apex Immigration Law Group",
    matterNumber: "Matter #USCIS-I485-8910",
    serviceType: "CERTIFIED",
    sourceLang: "Spanish",
    targetLangs: ["English"],
    status: "IN_TRANSLATION",
    priority: "HIGH",
    pageCount: 2,
    wordCount: 480,
    subtotal: 49.90,
    rushFee: 0,
    certificationFee: 0,
    notarizationFee: 0,
    discount: 0,
    tax: 0,
    total: 49.90,
    currency: "USD",
    receivingParty: "USCIS",
    assignedPM: "Marcus Vance",
    assignedTranslator: "Elena V. (ATA Member No. 271892)",
    assignedReviewer: "David Chen, Lead QA",
    submittedAt: "2026-09-09T14:20:00Z",
    promisedAt: "2026-09-11T12:00:00Z",
    uploadedFiles: [
      {
        id: "f-1",
        name: "Acta_Nacimiento_Hernandez.pdf",
        sizeBytes: 1420500,
        mimeType: "application/pdf",
        uploadedAt: "2026-09-09T14:20:00Z",
        sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        scanStatus: "CLEAN",
      },
    ],
    deliveredFiles: [],
    messages: [
      {
        id: "m-1",
        senderId: "sys",
        senderName: "VerifyLingua System",
        senderRole: "SYSTEM",
        body: "Order received and confirmed for USCIS 8 CFR 103.2 certification compliance. Processing queued.",
        createdAt: "2026-09-09T14:20:10Z",
        isInternal: false,
        read: true,
      },
      {
        id: "m-2",
        senderId: "staff-1",
        senderName: "Elena V. (Translator)",
        senderRole: "STAFF",
        body: "Internal Note: Watermark on page 2 civil registry stamp is partially faint. Cross-checked with Mexican civil registry standard format.",
        createdAt: "2026-09-09T15:00:00Z",
        isInternal: true,
        read: true,
      },
      {
        id: "m-3",
        senderId: "usr-1",
        senderName: "Alejandro Hernandez",
        senderRole: "CLIENT",
        body: "Please ensure the maternal surname 'Valenzuela' matches the passport spelling exactly.",
        createdAt: "2026-09-09T16:15:00Z",
        isInternal: false,
        read: true,
      },
      {
        id: "m-4",
        senderId: "staff-2",
        senderName: "Marcus Vance (Project Manager)",
        senderRole: "STAFF",
        body: "Noted with thanks, Alejandro. We have locked 'Valenzuela' in our CAT terminology enforcement table.",
        createdAt: "2026-09-09T16:22:00Z",
        isInternal: false,
        read: true,
      },
    ],
    timeline: [
      {
        id: "t-1",
        type: "ORDER_CREATED",
        title: "Translation Request Submitted",
        description: "Submitted with 1 document (2 pages) for USCIS Certification.",
        actor: "Alejandro Hernandez",
        timestamp: "2026-09-09T14:20:00Z",
      },
      {
        id: "t-2",
        type: "TRIAGE_COMPLETE",
        title: "Automated OCR & Layout Triage",
        description: "Text extracted with 98.4% OCR confidence. Zero format collision detected.",
        actor: "VerifyLingua AI Triage",
        timestamp: "2026-09-09T14:22:15Z",
      },
      {
        id: "t-3",
        type: "STAFF_ASSIGNED",
        title: "Linguist Assigned",
        description: "Assigned to Elena V. (ATA Member No. 271892).",
        actor: "Marcus Vance, PM",
        timestamp: "2026-09-09T14:45:00Z",
      },
      {
        id: "t-4",
        type: "TRANSLATION_IN_PROGRESS",
        title: "Translation Underway",
        description: "Segments 1 to 48 translated. Proper nouns validated against glossary.",
        actor: "Elena V.",
        timestamp: "2026-09-09T15:30:00Z",
      },
    ],
    quote: {
      id: "q-1",
      version: 1,
      status: "ACCEPTED",
      baseAmount: 49.90,
      rushAmount: 0,
      certAmount: 0,
      notaryAmount: 0,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 49.90,
      expiresAt: "2026-09-16T14:20:00Z",
      acceptedAt: "2026-09-09T14:21:00Z",
    },
    invoices: [
      {
        id: "inv-1",
        invoiceNumber: "INV-2026-0914",
        amount: 49.90,
        status: "PAID",
        issuedAt: "2026-09-09T14:21:00Z",
        dueDate: "2026-09-09T14:21:00Z",
        paidAt: "2026-09-09T14:21:05Z",
        stripePaymentIntentId: "pi_3M8Q19014XQ",
      },
    ],
    revisions: [],
    qualityChecklist: {
      terminologyVerified: true,
      formattingMirrored: true,
      completenessChecked: false,
      cfrAffidavitSigned: false,
      stampsTranscribed: true,
      reviewerNotes: "Waiting for linguist final run submission.",
      reviewerName: "David Chen",
      completedAt: null,
    },
  },
  {
    id: "ord-2",
    publicCode: "VL-3M8Q1",
    clientId: "usr-2",
    clientName: "Dr. Sofia Rostova",
    clientEmail: "sofia.rostova@novabiomed.com",
    organizationId: "org-2",
    organizationName: "Nova BioMed Labs",
    matterNumber: "Matter #CLIN-TRIAL-EUROPE",
    serviceType: "MEDICAL",
    sourceLang: "German",
    targetLangs: ["English"],
    status: "CLIENT_REVIEW",
    priority: "URGENT",
    pageCount: 6,
    wordCount: 1650,
    subtotal: 149.70,
    rushFee: 50.00,
    certificationFee: 25.00,
    notarizationFee: 0,
    discount: 15.00,
    tax: 0,
    total: 209.70,
    currency: "USD",
    receivingParty: "FDA / EMA",
    assignedPM: "Marcus Vance",
    assignedTranslator: "Hans K. (Medical Linguist)",
    assignedReviewer: "David Chen, Lead QA",
    submittedAt: "2026-09-08T10:00:00Z",
    promisedAt: "2026-09-09T18:00:00Z",
    completedAt: "2026-09-09T17:30:00Z",
    uploadedFiles: [
      {
        id: "f-2",
        name: "Clinical_Trial_Protocol_Munich.pdf",
        sizeBytes: 3850000,
        mimeType: "application/pdf",
        uploadedAt: "2026-09-08T10:00:00Z",
        sha256: "7a9b2c8f0d1e3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
        scanStatus: "CLEAN",
      },
    ],
    deliveredFiles: [
      {
        id: "df-1",
        name: "Clinical_Trial_Protocol_EN_Certified.pdf",
        sizeBytes: 3920000,
        mimeType: "application/pdf",
        deliveredAt: "2026-09-09T17:30:00Z",
        sha256: "9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a",
        verifyCode: "VL-CERT-3M8Q1",
        certifiedPdfUrl: "/api/certificate/VL-CERT-3M8Q1",
        downloadCount: 1,
        version: 1,
      },
    ],
    messages: [
      {
        id: "m-5",
        senderId: "sys",
        senderName: "VerifyLingua System",
        senderRole: "SYSTEM",
        body: "Translation completed and QA verified. Document ready for client inspection.",
        createdAt: "2026-09-09T17:30:00Z",
        isInternal: false,
        read: false,
      },
    ],
    timeline: [
      {
        id: "t-5",
        type: "DELIVERED_TO_CLIENT",
        title: "Translation Ready for Review",
        description: "Delivered certified PDF with 8 CFR compliance certificate.",
        actor: "David Chen, QA",
        timestamp: "2026-09-09T17:30:00Z",
      },
    ],
    quote: {
      id: "q-2",
      version: 1,
      status: "ACCEPTED",
      baseAmount: 149.70,
      rushAmount: 50.00,
      certAmount: 25.00,
      notaryAmount: 0,
      discountAmount: 15.00,
      taxAmount: 0,
      totalAmount: 209.70,
      expiresAt: "2026-09-15T10:00:00Z",
      acceptedAt: "2026-09-08T10:05:00Z",
    },
    invoices: [
      {
        id: "inv-2",
        invoiceNumber: "INV-2026-0908",
        amount: 209.70,
        status: "PAID",
        issuedAt: "2026-09-08T10:05:00Z",
        dueDate: "2026-09-08T10:05:00Z",
        paidAt: "2026-09-08T10:05:12Z",
        stripePaymentIntentId: "pi_9014XQ3M8Q1",
      },
    ],
    revisions: [],
    qualityChecklist: {
      terminologyVerified: true,
      formattingMirrored: true,
      completenessChecked: true,
      cfrAffidavitSigned: true,
      stampsTranscribed: true,
      reviewerNotes: "All clinical terminology matched MedDRA medical lexicon standard.",
      reviewerName: "David Chen",
      completedAt: "2026-09-09T17:25:00Z",
    },
  },
  {
    id: "ord-3",
    publicCode: "VL-8921-XQ",
    clientId: "usr-1",
    clientName: "Alejandro Hernandez",
    clientEmail: "alejandro.hernandez@lawdesk.org",
    organizationId: "org-1",
    organizationName: "Apex Immigration Law Group",
    matterNumber: "Matter #USCIS-I130-9921",
    serviceType: "NOTARIZED",
    sourceLang: "Arabic",
    targetLangs: ["English"],
    status: "QUOTE_SENT",
    priority: "NORMAL",
    pageCount: 4,
    wordCount: 920,
    subtotal: 99.80,
    rushFee: 0,
    certificationFee: 24.95,
    notarizationFee: 19.95,
    discount: 0,
    tax: 0,
    total: 144.70,
    currency: "USD",
    receivingParty: "US Embassy Cairo",
    assignedPM: "Marcus Vance",
    submittedAt: "2026-09-10T11:00:00Z",
    promisedAt: "2026-09-13T18:00:00Z",
    uploadedFiles: [
      {
        id: "f-3",
        name: "Family_Registry_Alexandria.pdf",
        sizeBytes: 2100000,
        mimeType: "application/pdf",
        uploadedAt: "2026-09-10T11:00:00Z",
        sha256: "c18a9e0f2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e",
        scanStatus: "CLEAN",
      },
    ],
    deliveredFiles: [],
    messages: [
      {
        id: "m-6",
        senderId: "staff-2",
        senderName: "Marcus Vance (Project Manager)",
        senderRole: "STAFF",
        body: "Formal quote generated including Arabic-to-English Certified Translation and Digital Notarization with e-apostille readiness.",
        createdAt: "2026-09-10T11:30:00Z",
        isInternal: false,
        read: true,
      },
    ],
    timeline: [
      {
        id: "t-6",
        type: "QUOTE_GENERATED",
        title: "Quote Sent to Client",
        description: "Formal estimate of $144.70 USD with digital notary add-on issued.",
        actor: "Marcus Vance, PM",
        timestamp: "2026-09-10T11:30:00Z",
      },
    ],
    quote: {
      id: "q-3",
      version: 1,
      status: "SENT",
      baseAmount: 99.80,
      rushAmount: 0,
      certAmount: 24.95,
      notaryAmount: 19.95,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 144.70,
      expiresAt: "2026-09-17T11:30:00Z",
    },
    invoices: [
      {
        id: "inv-3",
        invoiceNumber: "INV-2026-0922",
        amount: 144.70,
        status: "PENDING",
        issuedAt: "2026-09-10T11:30:00Z",
        dueDate: "2026-09-17T11:30:00Z",
      },
    ],
    revisions: [],
    qualityChecklist: {
      terminologyVerified: false,
      formattingMirrored: false,
      completenessChecked: false,
      cfrAffidavitSigned: false,
      stampsTranscribed: false,
      reviewerNotes: "Awaiting quote acceptance and payment confirmation.",
      reviewerName: "Unassigned",
      completedAt: null,
    },
  },
  {
    id: "ord-4",
    publicCode: "VL-9104-MN",
    clientId: "usr-3",
    clientName: "Kenji Takahashi",
    clientEmail: "kenji.takahashi@globalmobility.jp",
    organizationId: "org-3",
    organizationName: "Global Mobility Corp",
    matterNumber: "Matter #TOKYO-EXP-4401",
    serviceType: "LEGAL",
    sourceLang: "Japanese",
    targetLangs: ["English"],
    status: "REVISION_REQUESTED",
    priority: "HIGH",
    pageCount: 3,
    wordCount: 750,
    subtotal: 74.85,
    rushFee: 0,
    certificationFee: 24.95,
    notarizationFee: 0,
    discount: 0,
    tax: 0,
    total: 99.80,
    currency: "USD",
    receivingParty: "Immigration Court New York",
    assignedPM: "Marcus Vance",
    assignedTranslator: "Akira S. (Court Certified)",
    assignedReviewer: "David Chen, Lead QA",
    submittedAt: "2026-09-07T08:00:00Z",
    promisedAt: "2026-09-09T18:00:00Z",
    uploadedFiles: [
      {
        id: "f-4",
        name: "Corporate_Registration_Tokyo.pdf",
        sizeBytes: 1950000,
        mimeType: "application/pdf",
        uploadedAt: "2026-09-07T08:00:00Z",
        sha256: "f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3",
        scanStatus: "CLEAN",
      },
    ],
    deliveredFiles: [
      {
        id: "df-2",
        name: "Corporate_Registration_EN_v1.pdf",
        sizeBytes: 2010000,
        mimeType: "application/pdf",
        deliveredAt: "2026-09-09T16:00:00Z",
        sha256: "e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6",
        verifyCode: "VL-CERT-9104",
        certifiedPdfUrl: "/api/certificate/VL-CERT-9104",
        downloadCount: 2,
        version: 1,
      },
    ],
    messages: [
      {
        id: "m-7",
        senderId: "usr-3",
        senderName: "Kenji Takahashi",
        senderRole: "CLIENT",
        body: "On page 2, line 14, the corporate director's surname is transliterated as 'Saito', but our official US registered subsidiary uses 'Saitoh'. Please update this.",
        createdAt: "2026-09-10T09:15:00Z",
        isInternal: false,
        read: false,
      },
    ],
    timeline: [
      {
        id: "t-7",
        type: "REVISION_SUBMITTED",
        title: "Client Requested Revision",
        description: "Client specified proper noun adjustment on Page 2 (Saito -> Saitoh).",
        actor: "Kenji Takahashi",
        timestamp: "2026-09-10T09:15:00Z",
      },
    ],
    quote: {
      id: "q-4",
      version: 1,
      status: "ACCEPTED",
      baseAmount: 74.85,
      rushAmount: 0,
      certAmount: 24.95,
      notaryAmount: 0,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 99.80,
      expiresAt: "2026-09-14T08:00:00Z",
      acceptedAt: "2026-09-07T08:10:00Z",
    },
    invoices: [
      {
        id: "inv-4",
        invoiceNumber: "INV-2026-0902",
        amount: 99.80,
        status: "PAID",
        issuedAt: "2026-09-07T08:10:00Z",
        dueDate: "2026-09-07T08:10:00Z",
        paidAt: "2026-09-07T08:10:20Z",
      },
    ],
    revisions: [
      {
        id: "rev-1",
        requestedAt: "2026-09-10T09:15:00Z",
        clientNotes: "Transliteration update: 'Saito' -> 'Saitoh' on page 2.",
        status: "IN_PROGRESS",
        assignedTo: "Akira S.",
      },
    ],
    qualityChecklist: {
      terminologyVerified: true,
      formattingMirrored: true,
      completenessChecked: true,
      cfrAffidavitSigned: true,
      stampsTranscribed: true,
      reviewerNotes: "Revision in progress by Akira S. ETA 2 hours.",
      reviewerName: "David Chen",
      completedAt: null,
    },
  },
  {
    id: "ord-5",
    publicCode: "VL-2290-BB",
    clientId: "usr-2",
    clientName: "Dr. Sofia Rostova",
    clientEmail: "sofia.rostova@novabiomed.com",
    organizationId: "org-2",
    organizationName: "Nova BioMed Labs",
    matterNumber: "Matter #CERT-EVAL-2026",
    serviceType: "CERTIFIED",
    sourceLang: "Russian",
    targetLangs: ["English"],
    status: "COMPLETED",
    priority: "NORMAL",
    pageCount: 2,
    wordCount: 520,
    subtotal: 49.90,
    rushFee: 0,
    certificationFee: 0,
    notarizationFee: 0,
    discount: 0,
    tax: 0,
    total: 49.90,
    currency: "USD",
    receivingParty: "WES Academic Evaluation",
    assignedPM: "Marcus Vance",
    assignedTranslator: "Tariq A. (ATA Member)",
    assignedReviewer: "David Chen, Lead QA",
    submittedAt: "2026-09-01T12:00:00Z",
    promisedAt: "2026-09-03T12:00:00Z",
    completedAt: "2026-09-02T16:40:00Z",
    uploadedFiles: [
      {
        id: "f-5",
        name: "Diploma_Medical_Academy_Moscow.pdf",
        sizeBytes: 1680000,
        mimeType: "application/pdf",
        uploadedAt: "2026-09-01T12:00:00Z",
        sha256: "3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a",
        scanStatus: "CLEAN",
      },
    ],
    deliveredFiles: [
      {
        id: "df-3",
        name: "Diploma_Medical_Academy_Moscow_EN_Certified.pdf",
        sizeBytes: 1720000,
        mimeType: "application/pdf",
        deliveredAt: "2026-09-02T16:40:00Z",
        sha256: "1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e",
        verifyCode: "VL-CERT-2290",
        certifiedPdfUrl: "/api/certificate/VL-CERT-2290",
        downloadCount: 4,
        version: 1,
      },
    ],
    messages: [],
    timeline: [
      {
        id: "t-8",
        type: "ORDER_COMPLETED",
        title: "Order Approved & Completed",
        description: "Client approved translation. Official certificate archived.",
        actor: "Dr. Sofia Rostova",
        timestamp: "2026-09-02T17:00:00Z",
      },
    ],
    quote: {
      id: "q-5",
      version: 1,
      status: "ACCEPTED",
      baseAmount: 49.90,
      rushAmount: 0,
      certAmount: 0,
      notaryAmount: 0,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 49.90,
      expiresAt: "2026-09-08T12:00:00Z",
      acceptedAt: "2026-09-01T12:05:00Z",
    },
    invoices: [
      {
        id: "inv-5",
        invoiceNumber: "INV-2026-0891",
        amount: 49.90,
        status: "PAID",
        issuedAt: "2026-09-01T12:05:00Z",
        dueDate: "2026-09-01T12:05:00Z",
        paidAt: "2026-09-01T12:05:15Z",
      },
    ],
    revisions: [],
    qualityChecklist: {
      terminologyVerified: true,
      formattingMirrored: true,
      completenessChecked: true,
      cfrAffidavitSigned: true,
      stampsTranscribed: true,
      reviewerNotes: "Approved without exceptions.",
      reviewerName: "David Chen",
      completedAt: "2026-09-02T16:35:00Z",
    },
  },
];

let translatorsStore: TranslatorProfile[] = [
  {
    id: "tr-1",
    name: "Elena Valenzuela",
    email: "elena.v@verifylingua-linguists.com",
    languages: ["Spanish", "English", "Portuguese"],
    credentials: "ATA Member No. 271892 ? Mexican Bar Sworn Legal Translator",
    specialties: ["Vital Records", "USCIS Immigration", "Civil Litigation"],
    internalRatePerWord: 0.06,
    internalRatePerPage: 12.00,
    rating: 4.98,
    completedOrders: 342,
    activeWorkload: 2,
    availability: "AVAILABLE",
    ndaSigned: true,
    complianceDocStatus: "VERIFIED",
  },
  {
    id: "tr-2",
    name: "Hans Kruger",
    email: "hans.k@verifylingua-linguists.com",
    languages: ["German", "English", "French"],
    credentials: "BD? Certified ? Sworn Court Translator (Munich OLG)",
    specialties: ["Medical Protocols", "Clinical Trials", "Patents & IP"],
    internalRatePerWord: 0.08,
    internalRatePerPage: 16.00,
    rating: 4.95,
    completedOrders: 189,
    activeWorkload: 1,
    availability: "AVAILABLE",
    ndaSigned: true,
    complianceDocStatus: "VERIFIED",
  },
  {
    id: "tr-3",
    name: "Akira Saitoh",
    email: "akira.s@verifylingua-linguists.com",
    languages: ["Japanese", "English"],
    credentials: "JTF Master Translator ? Certified Legal Interpreter",
    specialties: ["Corporate Governance", "Commercial Contracts", "M&A"],
    internalRatePerWord: 0.09,
    internalRatePerPage: 18.00,
    rating: 4.92,
    completedOrders: 145,
    activeWorkload: 1,
    availability: "BUSY",
    ndaSigned: true,
    complianceDocStatus: "VERIFIED",
  },
  {
    id: "tr-4",
    name: "Tariq Al-Mansoor",
    email: "tariq.m@verifylingua-linguists.com",
    languages: ["Arabic", "English", "French"],
    credentials: "ATA Member No. 310984 ? Certified Court Interpreter (NY State)",
    specialties: ["Immigration", "Academic Credentials", "Civil Status"],
    internalRatePerWord: 0.07,
    internalRatePerPage: 14.00,
    rating: 4.99,
    completedOrders: 278,
    activeWorkload: 0,
    availability: "AVAILABLE",
    ndaSigned: true,
    complianceDocStatus: "VERIFIED",
  },
  {
    id: "tr-5",
    name: "Marcelle Dupont",
    email: "marcelle.d@verifylingua-linguists.com",
    languages: ["French", "English"],
    credentials: "SFT Certified Expert ? Court of Appeal Paris",
    specialties: ["Legal Contracts", "Notarial Deeds", "Corporate Finance"],
    internalRatePerWord: 0.07,
    internalRatePerPage: 14.00,
    rating: 4.96,
    completedOrders: 210,
    activeWorkload: 0,
    availability: "AVAILABLE",
    ndaSigned: true,
    complianceDocStatus: "VERIFIED",
  },
];

let organizationsStore: OrganizationRecord[] = [
  {
    id: "org-1",
    name: "Apex Immigration Law Group",
    slug: "apex-immigration",
    tier: "ENTERPRISE",
    membersCount: 8,
    activeOrdersCount: 2,
    totalSpent: 4890.50,
    customDiscountPercent: 15,
    billingEmail: "accounting@lawdesk.org",
  },
  {
    id: "org-2",
    name: "Nova BioMed Labs",
    slug: "nova-biomed",
    tier: "PROFESSIONAL",
    membersCount: 4,
    activeOrdersCount: 1,
    totalSpent: 3120.00,
    customDiscountPercent: 10,
    billingEmail: "finance@novabiomed.com",
  },
  {
    id: "org-3",
    name: "Global Mobility Corp",
    slug: "global-mobility",
    tier: "STARTER",
    membersCount: 3,
    activeOrdersCount: 1,
    totalSpent: 980.20,
    customDiscountPercent: 5,
    billingEmail: "ops@globalmobility.jp",
  },
];

let supportTicketsStore: SupportTicketRecord[] = [
  {
    id: "tkt-101",
    ticketNumber: "TKT-8901",
    clientName: "Alejandro Hernandez",
    clientEmail: "alejandro.hernandez@lawdesk.org",
    orderId: "ord-1",
    subject: "Urgent addition of I-485 cover letter to translation queue",
    status: "OPEN",
    priority: "HIGH",
    slaDueAt: "2026-09-10T22:00:00Z",
    createdAt: "2026-09-10T17:00:00Z",
    messagesCount: 3,
  },
  {
    id: "tkt-102",
    ticketNumber: "TKT-8894",
    clientName: "Dr. Sofia Rostova",
    clientEmail: "sofia.rostova@novabiomed.com",
    orderId: "ord-2",
    subject: "Inquiry regarding EMA compliance certification format",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    slaDueAt: "2026-09-11T14:00:00Z",
    createdAt: "2026-09-10T12:30:00Z",
    messagesCount: 2,
  },
  {
    id: "tkt-103",
    ticketNumber: "TKT-8840",
    clientName: "Kenji Takahashi",
    clientEmail: "kenji.takahashi@globalmobility.jp",
    orderId: "ord-4",
    subject: "Update requested on spelling of executive names",
    status: "OPEN",
    priority: "URGENT",
    slaDueAt: "2026-09-10T20:00:00Z",
    createdAt: "2026-09-10T09:20:00Z",
    messagesCount: 4,
  },
];

let systemSettingsStore: SystemSettingsRecord = {
  supportedLanguages: [
    { code: "es", name: "Spanish", nativeName: "Espa?ol", active: true, rateMultiplier: 1.0 },
    { code: "en", name: "English", nativeName: "English", active: true, rateMultiplier: 1.0 },
    { code: "fr", name: "French", nativeName: "Fran?ais", active: true, rateMultiplier: 1.1 },
    { code: "de", name: "German", nativeName: "Deutsch", active: true, rateMultiplier: 1.15 },
    { code: "ar", name: "Arabic", nativeName: "???????", active: true, rateMultiplier: 1.25 },
    { code: "ja", name: "Japanese", nativeName: "???", active: true, rateMultiplier: 1.35 },
    { code: "zh", name: "Chinese (Simplified)", nativeName: "????", active: true, rateMultiplier: 1.2 },
    { code: "ru", name: "Russian", nativeName: "???????", active: true, rateMultiplier: 1.15 },
    { code: "pt", name: "Portuguese", nativeName: "Portugu?s", active: true, rateMultiplier: 1.05 },
    { code: "it", name: "Italian", nativeName: "Italiano", active: true, rateMultiplier: 1.1 },
    { code: "uk", name: "Ukrainian", nativeName: "??????????", active: true, rateMultiplier: 1.2 },
  ],
  services: [
    {
      id: "STANDARD",
      name: "Standard Translation",
      baseRatePerPage: 19.95,
      turnAroundHours: 48,
      active: true,
      description: "Accurate human translation for general business documents, emails, and publications.",
    },
    {
      id: "CERTIFIED",
      name: "Certified Translation (USCIS 8 CFR 103.2)",
      baseRatePerPage: 24.95,
      turnAroundHours: 24,
      active: true,
      description: "ATA member credentials, signed sworn affidavit of translator competence, and USCIS acceptance guarantee.",
    },
    {
      id: "NOTARIZED",
      name: "Notarized Translation",
      baseRatePerPage: 44.90,
      turnAroundHours: 36,
      active: true,
      description: "Certified translation with formal state notary public jurat and digital cryptographic notary seal.",
    },
    {
      id: "LEGAL",
      name: "Legal & Court Translation",
      baseRatePerPage: 29.95,
      turnAroundHours: 48,
      active: true,
      description: "Specialized legal linguist translation for litigation, court exhibits, contracts, and filings.",
    },
    {
      id: "MEDICAL",
      name: "Medical & Clinical Translation",
      baseRatePerPage: 34.95,
      turnAroundHours: 48,
      active: true,
      description: "MedDRA and HIPAA compliant translation for clinical protocols, patient records, and pharma trials.",
    },
    {
      id: "TECHNICAL",
      name: "Technical & Engineering",
      baseRatePerPage: 29.95,
      turnAroundHours: 72,
      active: true,
      description: "ISO-compliant engineering manuals, patents, specifications, and architecture schematics.",
    },
    {
      id: "LOCALIZATION",
      name: "Software & Web Localization",
      baseRatePerPage: 24.95,
      turnAroundHours: 48,
      active: true,
      description: "Contextual UI, string tables, mobile app and web page internationalization.",
    },
    {
      id: "PROOFREADING",
      name: "Bilingual Proofreading & QA",
      baseRatePerPage: 12.95,
      turnAroundHours: 24,
      active: true,
      description: "Side-by-side linguistic auditing and correction of existing translations.",
    },
  ],
  pricingRules: {
    standardPerWord: 0.10,
    certifiedPerPage: 24.95,
    rushMultiplier: 1.5,
    notarizationFee: 19.95,
    minimumOrderFee: 24.95,
  },
  retentionPolicyDays: 90,
  businessHours: {
    open: "08:00",
    close: "20:00",
    timezone: "America/New_York",
  },
};

// Data Access API
export function getAllOrders(): DashboardOrder[] {
  return ordersStore;
}

export function getOrderById(id: string): DashboardOrder | undefined {
  return ordersStore.find((o) => o.id === id || o.publicCode === id);
}

export function updateOrder(id: string, updates: Partial<DashboardOrder>): DashboardOrder | undefined {
  const index = ordersStore.findIndex((o) => o.id === id || o.publicCode === id);
  if (index === -1) return undefined;
  ordersStore[index] = { ...ordersStore[index], ...updates };
  return ordersStore[index];
}

export function createOrder(data: {
  serviceType: ServiceType;
  sourceLang: string;
  targetLangs: string[];
  clientName: string;
  clientEmail: string;
  receivingParty?: string;
  notes?: string;
  isRush?: boolean;
  needsNotarization?: boolean;
  pageCount?: number;
  wordCount?: number;
  uploadedFiles?: { name: string; size: number; type: string }[];
}): DashboardOrder {
  const publicCode = "VL-" + Math.floor(1000 + Math.random() * 9000) + "-" + Math.random().toString(36).substring(2, 4).toUpperCase();
  const orderId = "ord-" + Date.now();
  const pages = Math.max(1, data.pageCount || 1);
  const words = data.wordCount || pages * 250;

  // Base pricing
  let baseRate = 24.95;
  if (data.serviceType === "STANDARD") baseRate = 19.95;
  if (data.serviceType === "LEGAL") baseRate = 29.95;
  if (data.serviceType === "MEDICAL") baseRate = 34.95;
  if (data.serviceType === "NOTARIZED") baseRate = 44.90;

  let subtotal = pages * baseRate;
  let rushFee = data.isRush ? subtotal * 0.5 : 0;
  let notaryFee = data.needsNotarization ? 19.95 : 0;
  let total = subtotal + rushFee + notaryFee;

  const files: UploadedFile[] = (data.uploadedFiles && data.uploadedFiles.length > 0)
    ? data.uploadedFiles.map((f, i) => ({
        id: "f-" + Date.now() + "-" + i,
        name: f.name,
        sizeBytes: f.size,
        mimeType: f.type || "application/pdf",
        uploadedAt: new Date().toISOString(),
        sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        scanStatus: "CLEAN",
      }))
    : [
        {
          id: "f-" + Date.now() + "-0",
          name: "Document_Submission.pdf",
          sizeBytes: 1540000,
          mimeType: "application/pdf",
          uploadedAt: new Date().toISOString(),
          sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
          scanStatus: "CLEAN",
        },
      ];

  const newOrder: DashboardOrder = {
    id: orderId,
    publicCode,
    clientId: "usr-1",
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    organizationId: "org-1",
    organizationName: "Apex Immigration Law Group",
    matterNumber: "Matter #GENERAL-2026",
    serviceType: data.serviceType,
    sourceLang: data.sourceLang,
    targetLangs: data.targetLangs,
    status: "SUBMITTED",
    priority: data.isRush ? "HIGH" : "NORMAL",
    pageCount: pages,
    wordCount: words,
    subtotal,
    rushFee,
    certificationFee: data.serviceType === "CERTIFIED" ? 0 : 0,
    notarizationFee: notaryFee,
    discount: 0,
    tax: 0,
    total,
    currency: "USD",
    receivingParty: data.receivingParty || "Official Use",
    assignedPM: "Marcus Vance",
    submittedAt: new Date().toISOString(),
    promisedAt: new Date(Date.now() + (data.isRush ? 18 : 36) * 3600000).toISOString(),
    uploadedFiles: files,
    deliveredFiles: [],
    messages: [
      {
        id: "m-" + Date.now(),
        senderId: "sys",
        senderName: "VerifyLingua System",
        senderRole: "SYSTEM",
        body: "Order " + publicCode + " submitted successfully. Assigned to Project Manager Marcus Vance for file review.",
        createdAt: new Date().toISOString(),
        isInternal: false,
        read: true,
      },
    ],
    timeline: [
      {
        id: "t-" + Date.now(),
        type: "ORDER_CREATED",
        title: "Translation Request Submitted",
        description: "Order " + publicCode + " created with " + files.length + " document(s).",
        actor: data.clientName,
        timestamp: new Date().toISOString(),
      },
    ],
    quote: {
      id: "q-" + Date.now(),
      version: 1,
      status: "SENT",
      baseAmount: subtotal,
      rushAmount: rushFee,
      certAmount: 0,
      notaryAmount: notaryFee,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: total,
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    },
    invoices: [
      {
        id: "inv-" + Date.now(),
        invoiceNumber: "INV-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000),
        amount: total,
        status: "PENDING",
        issuedAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      },
    ],
    revisions: [],
    qualityChecklist: {
      terminologyVerified: false,
      formattingMirrored: false,
      completenessChecked: false,
      cfrAffidavitSigned: false,
      stampsTranscribed: false,
      reviewerNotes: "New submission in intake review.",
      reviewerName: "Unassigned",
      completedAt: null,
    },
  };

  ordersStore.unshift(newOrder);
  return newOrder;
}

export function calculateQuote(params: {
  pageCount: number;
  serviceType: ServiceType;
  rush?: boolean;
  notarized?: boolean;
  discountPercent?: number;
}) {
  const pages = Math.max(1, params.pageCount || 1);
  let baseRate = 24.95;
  if (params.serviceType === "STANDARD") baseRate = 19.95;
  if (params.serviceType === "LEGAL") baseRate = 29.95;
  if (params.serviceType === "MEDICAL") baseRate = 34.95;
  if (params.serviceType === "NOTARIZED") baseRate = 44.90;

  const baseAmount = Math.round(pages * baseRate * 100) / 100;
  const certificationFee = 0;
  const notaryFee = params.notarized ? 19.95 : 0;
  const rushFee = params.rush ? Math.round(baseAmount * 0.5 * 100) / 100 : 0;
  const discount = params.discountPercent
    ? Math.round(baseAmount * (params.discountPercent / 100) * 100) / 100
    : 0;
  const total = Math.round((baseAmount + notaryFee + rushFee + certificationFee - discount) * 100) / 100;

  return {
    baseAmount,
    certificationFee,
    notaryFee,
    rushFee,
    discount,
    total,
  };
}

export function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  actor: string = "System"
): DashboardOrder | undefined {
  const order = getOrderById(orderId);
  if (!order) return undefined;

  const oldStatus = order.status;
  order.status = newStatus;

  order.timeline.unshift({
    id: "t-" + Date.now(),
    type: "STATUS_CHANGED",
    title: "Status Changed to " + newStatus.replace(/_/g, " "),
    description: "Order progressed from " + oldStatus + " to " + newStatus + ".",
    actor,
    timestamp: new Date().toISOString(),
  });

  return order;
}

export function addOrderMessage(
  orderId: string,
  message: {
    senderId: string;
    senderName: string;
    senderRole: "CLIENT" | "STAFF" | "SYSTEM";
    body: string;
    isInternal?: boolean;
    attachments?: { name: string; size: string; url: string }[];
  }
): ThreadMessage | undefined {
  const order = getOrderById(orderId);
  if (!order) return undefined;

  const newMsg: ThreadMessage = {
    id: "m-" + Date.now(),
    senderId: message.senderId,
    senderName: message.senderName,
    senderRole: message.senderRole,
    body: message.body,
    isInternal: !!message.isInternal,
    attachments: message.attachments,
    createdAt: new Date().toISOString(),
    read: false,
  };

  order.messages.push(newMsg);
  return newMsg;
}

export const addMessageToOrder = addOrderMessage;

export function requestOrderRevision(
  orderId: string,
  notes: string,
  clientName: string = "Client"
): DashboardOrder | undefined {
  const order = getOrderById(orderId);
  if (!order) return undefined;

  const revId = "rev-" + Date.now();
  order.status = "REVISION_REQUESTED";
  order.revisions.push({
    id: revId,
    requestedAt: new Date().toISOString(),
    clientNotes: notes,
    status: "PENDING",
    assignedTo: order.assignedTranslator,
  });

  order.timeline.unshift({
    id: "t-" + Date.now(),
    type: "REVISION_REQUESTED",
    title: "Client Requested Revision",
    description: notes,
    actor: clientName,
    timestamp: new Date().toISOString(),
  });

  addOrderMessage(orderId, {
    senderId: "client",
    senderName: clientName,
    senderRole: "CLIENT",
    body: "REVISION REQUEST: " + notes,
    isInternal: false,
  });

  return order;
}

export function approveOrderTranslation(
  orderId: string,
  clientName: string = "Client"
): DashboardOrder | undefined {
  const order = getOrderById(orderId);
  if (!order) return undefined;

  order.status = "COMPLETED";
  order.completedAt = new Date().toISOString();

  order.timeline.unshift({
    id: "t-" + Date.now(),
    type: "CLIENT_APPROVED",
    title: "Translation Approved by Client",
    description: "Client verified final delivered translation and downloaded certified affidavit.",
    actor: clientName,
    timestamp: new Date().toISOString(),
  });

  addOrderMessage(orderId, {
    senderId: "sys",
    senderName: "VerifyLingua System",
    senderRole: "SYSTEM",
    body: "Client has approved translation. Order marked as Completed.",
    isInternal: false,
  });

  return order;
}

export function assignStaffToOrder(
  orderId: string,
  assignments: {
    pm?: string;
    translator?: string;
    reviewer?: string;
  },
  actor: string = "Admin"
): DashboardOrder | undefined {
  const order = getOrderById(orderId);
  if (!order) return undefined;

  if (assignments.pm) order.assignedPM = assignments.pm;
  if (assignments.translator) order.assignedTranslator = assignments.translator;
  if (assignments.reviewer) order.assignedReviewer = assignments.reviewer;

  order.timeline.unshift({
    id: "t-" + Date.now(),
    type: "STAFF_ASSIGNED",
    title: "Staff Assignments Updated",
    description: "PM: " + order.assignedPM + ", Translator: " + (order.assignedTranslator || "None") + ", Reviewer: " + (order.assignedReviewer || "None"),
    actor,
    timestamp: new Date().toISOString(),
  });

  return order;
}

export function updateQAChecklist(
  orderId: string,
  checklist: Partial<QAChecklist>,
  reviewerName: string = "David Chen"
): DashboardOrder | undefined {
  const order = getOrderById(orderId);
  if (!order) return undefined;

  order.qualityChecklist = {
    ...order.qualityChecklist,
    ...checklist,
    reviewerName,
  };

  const isAllChecked =
    order.qualityChecklist.terminologyVerified &&
    order.qualityChecklist.formattingMirrored &&
    order.qualityChecklist.completenessChecked &&
    order.qualityChecklist.cfrAffidavitSigned &&
    order.qualityChecklist.stampsTranscribed;

  if (isAllChecked) {
    order.qualityChecklist.completedAt = new Date().toISOString();
    order.status = "CLIENT_REVIEW";

    // Auto-create delivered file record
    if (order.deliveredFiles.length === 0 && order.uploadedFiles.length > 0) {
      const src = order.uploadedFiles[0];
      order.deliveredFiles.push({
        id: "df-" + Date.now(),
        name: src.name.replace(/\.[^/.]+$/, "") + "_EN_Certified.pdf",
        sizeBytes: src.sizeBytes + 120000,
        mimeType: "application/pdf",
        deliveredAt: new Date().toISOString(),
        sha256: "9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a",
        verifyCode: "VL-CERT-" + order.publicCode.split("-")[1],
        certifiedPdfUrl: "/api/certificate/VL-CERT-" + order.publicCode.split("-")[1],
        downloadCount: 0,
        version: 1,
      });
    }

    order.timeline.unshift({
      id: "t-" + Date.now(),
      type: "QA_PASSED",
      title: "Quality Assurance Gate Passed",
      description: "All 5 quality checklist criteria verified. 8 CFR sworn competence seal generated.",
      actor: reviewerName,
      timestamp: new Date().toISOString(),
    });
  }

  return order;
}

export function getTranslators(): TranslatorProfile[] {
  return translatorsStore;
}

export function updateTranslator(
  id: string,
  updates: Partial<TranslatorProfile>
): TranslatorProfile | undefined {
  const index = translatorsStore.findIndex((t) => t.id === id);
  if (index === -1) return undefined;
  translatorsStore[index] = { ...translatorsStore[index], ...updates };
  return translatorsStore[index];
}

export function addTranslator(profile: TranslatorProfile): TranslatorProfile {
  translatorsStore.push(profile);
  return profile;
}

export function getOrganizations(): OrganizationRecord[] {
  return organizationsStore;
}

export function updateOrganization(
  id: string,
  updates: Partial<OrganizationRecord>
): OrganizationRecord | undefined {
  const index = organizationsStore.findIndex((o) => o.id === id);
  if (index === -1) return undefined;
  organizationsStore[index] = { ...organizationsStore[index], ...updates };
  return organizationsStore[index];
}

export function addOrganization(org: OrganizationRecord): OrganizationRecord {
  organizationsStore.push(org);
  return org;
}

export function getSupportTickets(): SupportTicketRecord[] {
  return supportTicketsStore;
}

export function updateSupportTicket(
  id: string,
  updates: Partial<SupportTicketRecord>
): SupportTicketRecord | undefined {
  const index = supportTicketsStore.findIndex((t) => t.id === id);
  if (index === -1) return undefined;
  supportTicketsStore[index] = { ...supportTicketsStore[index], ...updates };
  return supportTicketsStore[index];
}


export function getSystemSettings(): SystemSettingsRecord {
  return systemSettingsStore;
}

export function updateSystemSettings(
  newSettings: Partial<SystemSettingsRecord>
): SystemSettingsRecord {
  systemSettingsStore = {
    ...systemSettingsStore,
    ...newSettings,
  };
  return systemSettingsStore;
}

export function getAdminMetrics() {
  const totalOrders = ordersStore.length;
  const activeOrders = ordersStore.filter(
    (o) => o.status !== "COMPLETED" && o.status !== "CANCELLED" && o.status !== "ARCHIVED"
  ).length;
  const completedOrders = ordersStore.filter((o) => o.status === "COMPLETED").length;
  const totalGrossOrderValue = ordersStore.reduce((acc, o) => acc + o.total, 0);
  const paidInvoices = ordersStore.flatMap((o) => o.invoices).filter((i) => i.status === "PAID");
  const totalRevenue = paidInvoices.reduce((acc, i) => acc + i.amount, 0);
  const outstandingReceivables = ordersStore
    .flatMap((o) => o.invoices)
    .filter((i) => i.status === "PENDING" || i.status === "OVERDUE")
    .reduce((acc, i) => acc + i.amount, 0);

  const quoteCount = ordersStore.map((o) => o.quote).filter(Boolean).length;
  const acceptedQuotes = ordersStore.map((o) => o.quote).filter((q) => q && q.status === "ACCEPTED").length;
  const quoteAcceptanceRate = quoteCount > 0 ? Math.round((acceptedQuotes / quoteCount) * 100) : 88;

  return {
    totalRevenue: totalRevenue.toFixed(2),
    grossOrderValue: totalGrossOrderValue.toFixed(2),
    activeOrders,
    completedOrders,
    averageTurnaroundHours: 18.5,
    averageOrderValue: (totalGrossOrderValue / (totalOrders || 1)).toFixed(2),
    quoteAcceptanceRate: quoteAcceptanceRate + "%",
    onTimeDeliveryRate: "99.4%",
    revisionRate: "2.1%",
    customerSatisfaction: "4.96 / 5.0",
    outstandingReceivables: outstandingReceivables.toFixed(2),
    quoteToPaidConversionRate: "79.2%",
    totalJobsVolume: 1482,
    languageBreakdown: [
      { language: "Spanish", percentage: 44 },
      { language: "Arabic", percentage: 18 },
      { language: "German", percentage: 12 },
      { language: "Japanese", percentage: 10 },
      { language: "French", percentage: 9 },
      { language: "Other", percentage: 7 },
    ],
  };
}

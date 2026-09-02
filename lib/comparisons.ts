export type FeatureStatus = "supported" | "unsupported" | "partial";

export interface ComparisonFeature {
  name: string;
  description: string;
  verifylingua: FeatureStatus | string;
  verifylinguaNote?: string;
  competitor: FeatureStatus | string;
  competitorNote?: string;
}

export interface ComparisonCategory {
  categoryName: string;
  features: ComparisonFeature[];
}

export interface CompetitorProfile {
  slug: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  headline: string;
  subheadline: string;
  tagline: string;
  pricingComparison: {
    verifylinguaRate: string;
    competitorRate: string;
    verifylinguaSpeed: string;
    competitorSpeed: string;
    notarizationCost: string;
    notarizationCompetitorCost: string;
  };
  keyAdvantages: {
    title: string;
    description: string;
    metric: string;
  }[];
  categories: ComparisonCategory[];
}

export const COMPETITORS: Record<string, CompetitorProfile> = {
  immitranslate: {
    slug: "immitranslate",
    name: "ImmiTranslate",
    metaTitle: "VerifyLingua vs. ImmiTranslate | Honest Certified Translation Comparison",
    metaDescription:
      "Compare VerifyLingua and ImmiTranslate side-by-side. See why immigration attorneys and visa applicants choose our instant pre-payment AI triage, $24.95/page flat rate, and cryptographic QR audit trail.",
    headline: "Looking for an ImmiTranslate Alternative?",
    subheadline:
      "Match the $24.95 standard rate while getting pre-payment AI quality triage, guaranteed 24h turnaround, and tamper-proof QR verification.",
    tagline: "The Modern Certified Translation Standard",
    pricingComparison: {
      verifylinguaRate: "$24.95 / page",
      competitorRate: "$25.00 / page",
      verifylinguaSpeed: "Guaranteed 24h (or Rush 6h)",
      competitorSpeed: "24-48h estimated",
      notarizationCost: "$19.00 / document",
      notarizationCompetitorCost: "$25.00 / document",
    },
    keyAdvantages: [
      {
        title: "Pre-Payment Quality Triage",
        description: "Know if your scan is clear, blurred, or missing marginal stamps before you pay a dime.",
        metric: "100% Pre-Check",
      },
      {
        title: "Cryptographic QR Ledger",
        description: "USCIS adjudicators can scan the QR code to verify translator credentials and document authenticity in seconds.",
        metric: "Instant Audit",
      },
      {
        title: "Deterministic Delivery Clock",
        description: "Hard delivery timestamp calculated based on timezone and daily notary batches, guaranteed or refunded.",
        metric: "24h Guaranteed",
      },
    ],
    categories: [
      {
        categoryName: "Certification & Legal Acceptance",
        features: [
          {
            name: "USCIS 8 CFR 103.2(b)(3) Compliance",
            description: "Signed Certificate of Translation Accuracy adhering to federal immigration regulations.",
            verifylingua: "supported",
            verifylinguaNote: "100% Guaranteed acceptance or full refund + free redo",
            competitor: "supported",
            competitorNote: "Standard acceptance claim",
          },
          {
            name: "Public QR Verification Portal",
            description: "Live web verification page for consular officers and court adjudicators.",
            verifylingua: "supported",
            verifylinguaNote: "Unique SHA-256 cryptographic document ledger",
            competitor: "unsupported",
            competitorNote: "Requires manual email inquiry",
          },
          {
            name: "ATA Corporate Member Credentials",
            description: "Member in good standing with the American Translators Association.",
            verifylingua: "supported",
            verifylinguaNote: "Member ID on every certificate header",
            competitor: "supported",
            competitorNote: "ATA Member",
          },
          {
            name: "Wet Notary Embossed Seal Option",
            description: "Optional state notarized jurat with physical raised seal for courts and consulates.",
            verifylingua: "supported",
            verifylinguaNote: "$19.00 flat fee",
            competitor: "partial",
            competitorNote: "$25.00+ fee",
          },
        ],
      },
      {
        categoryName: "Pre-Payment AI Triage & Quality Defense",
        features: [
          {
            name: "Instant Scan Clarity Audit",
            description: "Automated analysis of image DPI, contrast, and fold creases before payment.",
            verifylingua: "supported",
            verifylinguaNote: "Instant client feedback prevents USCIS RFE rejections",
            competitor: "unsupported",
            competitorNote: "Manual review only after order payment",
          },
          {
            name: "Passport Name-Matching Lock",
            description: "Ensures spelling of names and birthplaces matches your government passport exactly.",
            verifylingua: "supported",
            verifylinguaNote: "Enforced at order submission",
            competitor: "partial",
            competitorNote: "Relies on translator manual discretion",
          },
          {
            name: "Deterministic Delivery Timestamp",
            description: "Live calculated delivery deadline before checkout calibrated to notary batches.",
            verifylingua: "supported",
            verifylinguaNote: "Exact time displayed pre-payment",
            competitor: "unsupported",
            competitorNote: "Vague 24-48 hour window",
          },
        ],
      },
      {
        categoryName: "Pricing, Speed & Guarantees",
        features: [
          {
            name: "Standard Certified Page Rate",
            description: "Official price per standard document page (up to 250 words).",
            verifylingua: "$24.95 / page",
            competitor: "$25.00 / page",
          },
          {
            name: "Expedited Rush Turnaround",
            description: "High-priority certified translation for urgent deadlines.",
            verifylingua: "supported",
            verifylinguaNote: "6-hour expedited delivery option",
            competitor: "partial",
            competitorNote: "12-24 hour rush option",
          },
          {
            name: "100% Acceptance Guarantee",
            description: "Protection against institutional rejections.",
            verifylingua: "supported",
            verifylinguaNote: "Full refund + free immediate correction",
            competitor: "supported",
            competitorNote: "Standard guarantee",
          },
          {
            name: "Free Unlimited Revisions",
            description: "Prompt adjustments for spelling preferences or marginal notations.",
            verifylingua: "supported",
            verifylinguaNote: "Direct portal correction tool",
            competitor: "supported",
            competitorNote: "Via support ticket",
          },
        ],
      },
    ],
  },
  rushtranslate: {
    slug: "rushtranslate",
    name: "RushTranslate",
    metaTitle: "VerifyLingua vs. RushTranslate | Honest Certified Translation Comparison",
    metaDescription:
      "See how VerifyLingua compares to RushTranslate on price, turnaround, AI triage, and USCIS acceptance. Both offer $24.95/page flat pricing, but VerifyLingua adds cryptographic QR verification and pre-payment document analysis.",
    headline: "Looking for a RushTranslate Alternative?",
    subheadline:
      "Same $24.95/page industry standard rate. Upgraded with instant pre-payment AI triage, automated notarization routing, and public QR verification.",
    tagline: "Next-Gen Certified Translation",
    pricingComparison: {
      verifylinguaRate: "$24.95 / page",
      competitorRate: "$24.95 / page",
      verifylinguaSpeed: "Guaranteed 24h (or Rush 6h)",
      competitorSpeed: "24h standard",
      notarizationCost: "$19.00 / document",
      notarizationCompetitorCost: "$19.95 / document",
    },
    keyAdvantages: [
      {
        title: "Scan Pre-Check Wizard",
        description: "Catches faded stamps, cut-off borders, and blur before linguists begin translation.",
        metric: "Zero RFEs",
      },
      {
        title: "Consular QR Verification",
        description: "Direct URL resolving to cryptographic verification ledger for consular officers.",
        metric: "Instant Scan",
      },
      {
        title: "Exact Time Promise",
        description: "Real-time delivery countdown based on current linguist capacity and notary queues.",
        metric: "On-Time Lock",
      },
    ],
    categories: [
      {
        categoryName: "Certification & Acceptance",
        features: [
          {
            name: "USCIS 8 CFR 103.2(b)(3) Compliance",
            description: "Signed Certificate of Translation Accuracy adhering to federal immigration regulations.",
            verifylingua: "supported",
            competitor: "supported",
          },
          {
            name: "Public QR Verification Portal",
            description: "Tamper-proof live QR verification for USCIS and federal courts.",
            verifylingua: "supported",
            verifylinguaNote: "Live cryptographic verification URL",
            competitor: "unsupported",
            competitorNote: "Static PDF without live verification link",
          },
          {
            name: "ATA Corporate Member Credentials",
            description: "Member in good standing with the American Translators Association.",
            verifylingua: "supported",
            competitor: "supported",
          },
          {
            name: "Apostille & Embassy Preparation",
            description: "International legalization and Secretary of State apostille services.",
            verifylingua: "supported",
            verifylinguaNote: "Full apostille guidance & notarization",
            competitor: "partial",
            competitorNote: "Standard notary only",
          },
        ],
      },
      {
        categoryName: "Pre-Payment Quality & Triage",
        features: [
          {
            name: "Pre-Payment Document Quality Triage",
            description: "Automated scan check for legibility, glare, and marginal notation risks.",
            verifylingua: "supported",
            verifylinguaNote: "Instant feedback prior to credit card charge",
            competitor: "unsupported",
            competitorNote: "Issues flagged only after checkout",
          },
          {
            name: "Transparent Word Count Audit",
            description: "Instant character & word density evaluation to prevent billing disputes.",
            verifylingua: "supported",
            verifylinguaNote: "Deterministic page calculation",
            competitor: "partial",
            competitorNote: "May adjust page count post-submission",
          },
          {
            name: "Live Translation Progress Tracking",
            description: "Real-time stage updates from translation to certification and QA review.",
            verifylingua: "supported",
            verifylinguaNote: "Granular portal milestone tracker",
            competitor: "partial",
            competitorNote: "Email notification on completion",
          },
        ],
      },
      {
        categoryName: "Turnaround & Rates",
        features: [
          {
            name: "Base Certified Translation Rate",
            description: "Official price per standard document page (up to 250 words).",
            verifylingua: "$24.95 / page",
            competitor: "$24.95 / page",
          },
          {
            name: "Rush Expedited Delivery",
            description: "Guaranteed turnaround for time-sensitive filings.",
            verifylingua: "6 hours",
            competitor: "12 hours",
          },
          {
            name: "Notarized Translation Fee",
            description: "Official state notary public certification jurat.",
            verifylingua: "$19.00 / document",
            competitor: "$19.95 / document",
          },
          {
            name: "Guaranteed Acceptance Rejection Policy",
            description: "100% money-back guarantee plus free immediate expedited correction.",
            verifylingua: "supported",
            competitor: "supported",
          },
        ],
      },
    ],
  },
  translayte: {
    slug: "translayte",
    name: "Translayte",
    metaTitle: "VerifyLingua vs. Translayte | Certified Translation Comparison",
    metaDescription:
      "Compare VerifyLingua and Translayte for certified translations. Transparent flat rates, instant US legal compliance, faster delivery times, and dedicated USCIS acceptance guarantees.",
    headline: "Looking for a Translayte Alternative?",
    subheadline:
      "Translayte operates primarily in European markets with variable currency conversion. VerifyLingua offers a transparent US-standard $24.95 flat rate with guaranteed USCIS acceptance.",
    tagline: "Specialized US Immigration Certification",
    pricingComparison: {
      verifylinguaRate: "$24.95 / page",
      competitorRate: "$27.50+ / page",
      verifylinguaSpeed: "24h guaranteed",
      competitorSpeed: "24-72h variable",
      notarizationCost: "$19.00 / document",
      notarizationCompetitorCost: "$35.00+ / document",
    },
    keyAdvantages: [
      {
        title: "US Immigration Focus",
        description: "Built specifically around USCIS, federal court, and US university formatting mandates.",
        metric: "USCIS 8 CFR",
      },
      {
        title: "Predictable Flat Pricing",
        description: "No currency conversion surprises or VAT surcharges. Exactly $24.95 per page.",
        metric: "$24.95 Flat",
      },
      {
        title: "Live Cryptographic QR",
        description: "Officers can verify the translation with any smartphone camera.",
        metric: "SHA-256",
      },
    ],
    categories: [
      {
        categoryName: "Certification & Standards",
        features: [
          {
            name: "USCIS 8 CFR 103.2(b)(3) Compliance",
            description: "Signed Certificate of Translation Accuracy adhering to federal immigration regulations.",
            verifylingua: "supported",
            competitor: "supported",
          },
          {
            name: "Public QR Verification Portal",
            description: "Live verification portal resolving to cryptographic audit trail.",
            verifylingua: "supported",
            competitor: "unsupported",
          },
          {
            name: "ATA Corporate Member Credentials",
            description: "American Translators Association certified linguists.",
            verifylingua: "supported",
            competitor: "partial",
            competitorNote: "UK / European focus (ITI, CIOL)",
          },
        ],
      },
      {
        categoryName: "Speed & Economics",
        features: [
          {
            name: "Standard Page Rate",
            description: "Official price per standard document page.",
            verifylingua: "$24.95 / page",
            competitor: "$27.50+ / page (plus tax)",
          },
          {
            name: "Notary Certification Rate",
            description: "Official notary public jurat endorsement.",
            verifylingua: "$19.00 / document",
            competitor: "$35.00+ / document",
          },
          {
            name: "Delivery Guarantee",
            description: "Definite delivery time backed by full refund guarantee.",
            verifylingua: "24 hours guaranteed",
            competitor: "24-72 hours estimated",
          },
        ],
      },
    ],
  },
};

export function getCompetitor(slug: string): CompetitorProfile | undefined {
  return COMPETITORS[slug.toLowerCase()];
}

export function getAllCompetitorSlugs(): string[] {
  return Object.keys(COMPETITORS);
}

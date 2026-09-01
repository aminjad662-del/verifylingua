export interface DocumentSpoke {
  slug: string;
  name: string;
  receivingAgency: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  overview: string;
  typicalPages: number;
  complianceRequirements: string[];
  faqs: { question: string; answer: string }[];
  siblingSlugs: string[];
  guideSlug: string;
}

export interface LanguageSpoke {
  slug: string;
  name: string;
  nativeName: string;
  code: string;
  dir: "ltr" | "rtl";
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  commonOrigins: string[];
  turnaroundHours: number;
  formattingNotes: string;
  faqs: { question: string; answer: string }[];
  siblingSlugs: string[];
  guideSlug: string;
}

export interface UseCaseSpoke {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  agency: string;
  requiredDocuments: string[];
  certificationRules: string[];
  faqs: { question: string; answer: string }[];
  siblingSlugs: string[];
  guideSlug: string;
}

export interface GuideSpoke {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  readTime: string;
  lastUpdated: string;
  sections: { title: string; content: string }[];
  faqs: { question: string; answer: string }[];
  relatedDocSlugs: string[];
}

export const SEO_DOCUMENTS: DocumentSpoke[] = [
  {
    slug: "birth-certificate",
    name: "Birth Certificate Translation",
    receivingAgency: "USCIS, Courts, State Department, Universities",
    metaTitle: "Certified Birth Certificate Translation for USCIS ($24.95) | VerifyLingua",
    metaDescription: "Guaranteed USCIS-accepted certified birth certificate translation. 100% acceptance guarantee, ATA member certification, QR verification, delivered in 24 hours.",
    h1: "Certified Birth Certificate Translation for USCIS",
    intro: "Get an official, word-for-word certified translation of your foreign birth certificate accepted by USCIS, the US Department of State, courts, and universities nationwide.",
    overview: "Foreign birth certificates are the most frequently requested civil document in US immigration petitions (Form I-130, I-485, N-400). USCIS requires complete translation of all issuing municipality seals, registrar stamps, signatures, and marginal annotations.",
    typicalPages: 1,
    complianceRequirements: [
      "Complete word-for-word translation including all official rubber stamps and embossed seals",
      "Translator statement of competence under 8 CFR 103.2(b)(3)",
      "Strict transliteration match with applicant passport spelling",
      "Digital Certificate of Accuracy with cryptographic QR verification",
    ],
    faqs: [
      {
        question: "Does USCIS accept certified translations of birth certificates?",
        answer: "Yes. Under 8 CFR 103.2(b)(3), USCIS requires any foreign language document submitted in support of an application to be accompanied by a full English translation certified as complete and accurate by a competent translator.",
      },
      {
        question: "Do I need to notarize my birth certificate translation?",
        answer: "USCIS does not require notarization—a certified translation suffices. However, if submitting to certain state courts, DMVs, or foreign consulates, notarization is required and can be selected with one click.",
      },
    ],
    siblingSlugs: ["marriage-certificate", "academic-diploma", "passport"],
    guideSlug: "uscis-translation-requirements-guide",
  },
  {
    slug: "marriage-certificate",
    name: "Marriage Certificate Translation",
    receivingAgency: "USCIS (I-130 / I-485), Courts, Health Insurance",
    metaTitle: "Certified Marriage Certificate Translation for USCIS ($24.95) | VerifyLingua",
    metaDescription: "Certified marriage certificate translation for USCIS green card filings. 24-hour turnaround, 100% acceptance guarantee, and public verification.",
    h1: "Certified Marriage Certificate Translation for USCIS & Courts",
    intro: "Official certified English translation of civil and religious marriage licenses, certificates, and registry records for immigration spousal petitions.",
    overview: "Marriage certificates are mandatory for spousal green cards, dependent visas, and joint filings. Every registry seal, witness signature, and legal annotation is meticulously translated and mirrored.",
    typicalPages: 1,
    complianceRequirements: [
      "Both spouses' exact passport names locked in translation",
      "Civil registry volume, folio, and entry numbers fully translated",
      "Accredited ATA linguist competence statement attached",
    ],
    faqs: [
      {
        question: "Can I translate my own marriage certificate for immigration?",
        answer: "No. USCIS prohibits applicants or their family members from translating their own documents due to conflict of interest. An independent, certified translation is legally required.",
      },
    ],
    siblingSlugs: ["birth-certificate", "divorce-decree", "court-order"],
    guideSlug: "prevent-uscis-rfe-rejections",
  },
  {
    slug: "academic-diploma",
    name: "Academic Diploma Translation",
    receivingAgency: "Universities, WES, ECFMG, Employers, USCIS (H-1B)",
    metaTitle: "Certified Academic Diploma Translation for Universities & WES | VerifyLingua",
    metaDescription: "Official certified translation of university degrees and high school diplomas. Accepted by WES, ECFMG, US universities, and USCIS for H-1B filings.",
    h1: "Certified Academic Diploma & Degree Translation",
    intro: "Fast, accurate certified translation of international diplomas, graduation certificates, and degree titles for credential evaluation and university admissions.",
    overview: "Academic evaluators such as WES, ECFMG, and university admissions offices require precise word-for-word translations of graduation diplomas to determine US degree equivalence.",
    typicalPages: 1,
    complianceRequirements: [
      "Exact institutional title, degree conferral wording, and honors translated",
      "University rector and dean signature notices translated",
      "Formatted to mirror original parchment diploma layout",
    ],
    faqs: [
      {
        question: "Is this translation accepted by WES (World Education Services)?",
        answer: "Yes. Our certified translations fulfill all World Education Services (WES) credential evaluation criteria and include complete translator certification statements.",
      },
    ],
    siblingSlugs: ["transcript", "birth-certificate", "passport"],
    guideSlug: "certified-vs-notarized-translation",
  },
  {
    slug: "transcript",
    name: "Academic Transcript Translation",
    receivingAgency: "Universities, WES, Credential Evaluators",
    metaTitle: "Certified Academic Transcript Translation (Grade Reports) | VerifyLingua",
    metaDescription: "Certified university transcript translation with exact course titles and grading scale notes. 24-hour turnaround for academic admissions.",
    h1: "Certified Academic Transcript Translation",
    intro: "Comprehensive certified translation of university course transcripts, grade sheets, and semester credit logs.",
    overview: "Transcripts require accurate translation of course terminology, credit hours, semester rankings, and institutional grading scales.",
    typicalPages: 3,
    complianceRequirements: [
      "Course subjects, grades, and credit hours preserved in tabular format",
      "Institutional grading key translated accurately",
    ],
    faqs: [
      {
        question: "Do you convert grades to US GPA?",
        answer: "No. Certified translation provides an exact, faithful translation of the original grading marks and terminology. Credential evaluation services (like WES) perform the formal GPA conversion.",
      },
    ],
    siblingSlugs: ["academic-diploma", "birth-certificate", "passport"],
    guideSlug: "certified-vs-notarized-translation",
  },
  {
    slug: "passport",
    name: "Passport & National ID Translation",
    receivingAgency: "USCIS, Banks, DMV, Courts, State Department",
    metaTitle: "Certified Passport & National ID Translation | VerifyLingua",
    metaDescription: "Official certified translation of foreign passports, national identity cards, and residency cards for immigration and DMV filings.",
    h1: "Certified Passport & National Identification Translation",
    intro: "Accredited translation of biometric passports, foreign national identity cards, and travel documents.",
    overview: "Passports and national ID cards establish identity, nationality, and legal status in immigration and civil proceedings.",
    typicalPages: 1,
    complianceRequirements: [
      "Machine-readable zone (MRZ) transliteration matched 100%",
      "Security authority stamps and validity dates translated",
    ],
    faqs: [
      {
        question: "Which pages of my passport need to be translated?",
        answer: "Typically, only the biographical photo page containing your identity information, passport number, and issuing authority stamps requires certified translation.",
      },
    ],
    siblingSlugs: ["birth-certificate", "drivers-license", "police-clearance"],
    guideSlug: "passport-name-spelling-rules",
  },
];

export const SEO_LANGUAGES: LanguageSpoke[] = [
  {
    slug: "spanish",
    name: "Spanish Translation",
    nativeName: "Español",
    code: "es",
    dir: "ltr",
    metaTitle: "Certified Spanish Translation for USCIS ($24.95/page) | VerifyLingua",
    metaDescription: "Official certified Spanish to English translation for USCIS, courts, and universities. ATA certified linguists, 24-hour turnaround, 100% acceptance guarantee.",
    h1: "Certified Spanish to English Document Translation",
    intro: "Fast, certified translation of Spanish legal and civil records from Mexico, Colombia, Spain, Venezuela, Argentina, and all Latin American nations.",
    commonOrigins: ["Mexico", "Colombia", "Guatemala", "Honduras", "Spain", "Venezuela", "Cuba", "Dominican Republic"],
    turnaroundHours: 24,
    formattingNotes: "Civil registry terminology (Registro Civil, Actas de Nacimiento, Títulos) is translated according to strict US legal standards.",
    faqs: [
      {
        question: "Are your Spanish translations certified for USCIS?",
        answer: "Yes. All Spanish translations are performed by accredited professional linguists and include a signed Certificate of Accuracy meeting 8 CFR 103.2(b)(3).",
      },
    ],
    siblingSlugs: ["portuguese", "french", "italian"],
    guideSlug: "uscis-translation-requirements-guide",
  },
  {
    slug: "arabic",
    name: "Arabic Translation",
    nativeName: "العربية",
    code: "ar",
    dir: "rtl",
    metaTitle: "Certified Arabic Translation for USCIS (RTL Formatted) | VerifyLingua",
    metaDescription: "Certified Arabic to English translation with precise RTL mirror-formatting and passport name consistency. 24h delivery, 100% acceptance guarantee.",
    h1: "Certified Arabic to English Document Translation",
    intro: "Accredited certified translation of Arabic birth certificates, court decrees, and educational records with specialized Right-to-Left (RTL) mirror-formatting.",
    commonOrigins: ["Egypt", "Saudi Arabia", "Jordan", "Iraq", "Syria", "Lebanon", "Morocco", "UAE"],
    turnaroundHours: 24,
    formattingNotes: "Documents are precisely mirror-formatted to preserve visual layout fidelity without reversing critical dates, serial numbers, or passport transliterations.",
    faqs: [
      {
        question: "How do you ensure Arabic names match my US passport?",
        answer: "We use our proprietary Name Consistency Lock (§2.3) to hard-lock your exact passport transliteration into the translation workspace.",
      },
    ],
    siblingSlugs: ["farsi", "urdu", "hebrew"],
    guideSlug: "passport-name-spelling-rules",
  },
  {
    slug: "chinese-simplified",
    name: "Chinese Translation (Simplified)",
    nativeName: "简体中文",
    code: "zh",
    dir: "ltr",
    metaTitle: "Certified Chinese Translation for USCIS (Hukou & Notarial) | VerifyLingua",
    metaDescription: "Certified Chinese (Simplified) translation for USCIS and universities. Full translation of Hukou booklets, notarial birth certificates, and transcripts.",
    h1: "Certified Chinese to English Document Translation",
    intro: "Professional certified translation of Chinese notarial certificates (Gongzhengshu), household registers (Hukou), diplomas, and police clearance records.",
    commonOrigins: ["China", "Singapore", "Malaysia"],
    turnaroundHours: 24,
    formattingNotes: "Specialized handling of Chinese notarial certificate white books (Gongzhengshu), red seal stamp translations, and Pinyin name verification.",
    faqs: [
      {
        question: "Do you translate the complete Chinese Hukou (household register)?",
        answer: "Yes. We translate all pages including household members, relationship designations, changes of address, and local police station seals.",
      },
    ],
    siblingSlugs: ["chinese-traditional", "japanese", "korean"],
    guideSlug: "prevent-uscis-rfe-rejections",
  },
];

export const SEO_USE_CASES: UseCaseSpoke[] = [
  {
    slug: "uscis-immigration",
    title: "USCIS Immigration & Visa Petitions",
    metaTitle: "Certified Translations for USCIS Immigration Petitions | VerifyLingua",
    metaDescription: "100% USCIS-accepted certified translations for Green Cards, I-130, I-485, and Naturalization. 24h delivery, ATA compliance guarantee.",
    h1: "Certified Document Translation for USCIS",
    intro: "Engineered specifically to satisfy 8 CFR 103.2(b)(3) requirements and prevent Request for Evidence (RFE) notices in US immigration applications.",
    agency: "US Citizenship and Immigration Services (USCIS)",
    requiredDocuments: [
      "Foreign Birth Certificates (with all municipality seals)",
      "Marriage Certificates and Divorce Decrees",
      "Police Clearance & Background Records",
      "Passports and Military Discharge Records",
    ],
    certificationRules: [
      "Complete word-for-word translation without summary or omission",
      "Formal translator competence and accuracy certification",
      "100% character matching with applicant passport name",
    ],
    faqs: [
      {
        question: "What happens if USCIS rejects a translation?",
        answer: "VerifyLingua guarantees 100% USCIS acceptance. If any translation is rejected for a translation error, we revise it immediately for free and refund your order completely.",
      },
    ],
    siblingSlugs: ["i-130-petition", "i-485-adjustment-of-status", "f-1-student-visa"],
    guideSlug: "uscis-translation-requirements-guide",
  },
  {
    slug: "university-admission-wes",
    title: "University Admissions & Credential Evaluation (WES)",
    metaTitle: "Certified Translations for University Admissions & WES | VerifyLingua",
    metaDescription: "Certified translation of foreign diplomas, degrees, and academic transcripts for US university admissions, WES, and ECFMG evaluations.",
    h1: "Certified Academic Translation for Universities & WES",
    intro: "Fulfill strict credential evaluation criteria for World Education Services (WES), ECFMG, and international student university admissions.",
    agency: "US Colleges, Universities, WES, ECFMG",
    requiredDocuments: [
      "Graduation Diplomas and Degree Scrolls",
      "Official Academic Grade Transcripts",
      "Course Syllabi and High School Certificates",
    ],
    certificationRules: [
      "Exact institutional title and course subject translation",
      "Institutional stamps and credit calculations preserved",
    ],
    faqs: [
      {
        question: "Can I submit the digital PDF directly to my university?",
        answer: "Yes. Our signed Certificate of Accuracy PDF contains an embedded cryptographic QR verification code that admissions officers can inspect instantly.",
      },
    ],
    siblingSlugs: ["uscis-immigration", "f-1-student-visa"],
    guideSlug: "certified-vs-notarized-translation",
  },
];

export const SEO_GUIDES: GuideSpoke[] = [
  {
    slug: "uscis-translation-requirements-guide",
    title: "The Definitive Guide to USCIS Translation Requirements (8 CFR 103.2)",
    metaTitle: "USCIS Translation Requirements: 8 CFR 103.2 Explained (2026) | VerifyLingua",
    metaDescription: "Learn the exact legal rules for translating foreign documents for USCIS green cards and visa petitions under 8 CFR 103.2(b)(3).",
    h1: "USCIS Translation Requirements (8 CFR 103.2): The Complete 2026 Guide",
    intro: "Everything you need to know about certified translations for US immigration filings, how to avoid common RFE triggers, and mandatory certification wording.",
    readTime: "6 min read",
    lastUpdated: "August 2026",
    sections: [
      {
        title: "1. The Governing Regulation: 8 CFR 103.2(b)(3)",
        content: "Under federal regulation 8 CFR 103.2(b)(3), any foreign language document submitted to USCIS must be accompanied by a full English translation that the translator has certified as complete and accurate, and that the translator is competent to translate from the foreign language into English.",
      },
      {
        title: "2. Why Partial Translations Cause Rejections",
        content: "One of the most frequent causes of USCIS Requests for Evidence (RFEs) is submitting partial translations. USCIS adjudicators require every seal, stamp, watermark, barcode note, and margin annotation to be translated.",
      },
      {
        title: "3. Mandatory Certificate of Accuracy Statement",
        content: "The certificate must explicitly assert the translator's competence and literacy in both languages. A certificate missing the competence declaration is legally invalid under USCIS adjudication policy.",
      },
    ],
    faqs: [
      {
        question: "Does USCIS require a notarized translation?",
        answer: "No. USCIS requires a certified translation, not notarization. Notarization only certifies the identity of the signer, not the accuracy of the translation.",
      },
    ],
    relatedDocSlugs: ["birth-certificate", "marriage-certificate", "passport"],
  },
  {
    slug: "prevent-uscis-rfe-rejections",
    title: "How to Prevent USCIS RFEs Caused by Translation Errors",
    metaTitle: "How to Avoid USCIS Translation RFEs (Top 5 Mistakes) | VerifyLingua",
    metaDescription: "Discover the top 5 translation errors that trigger USCIS Requests for Evidence (RFEs) and how our pre-check process eliminates them.",
    h1: "How to Prevent USCIS RFEs Caused by Translation Mistakes",
    intro: "An in-depth analysis of immigration rejection patterns and the architectural safeguards that guarantee 100% acceptance on the first filing.",
    readTime: "5 min read",
    lastUpdated: "August 2026",
    sections: [
      {
        title: "Mistake 1: Passport Transliteration Mismatch",
        content: "When foreign names are translated without referencing the applicant's US passport or visa, transliteration variations (such as 'Mohamed' vs 'Mohammed') trigger automatic government verification holds.",
      },
      {
        title: "Mistake 2: Cropped Margins and Illegible Stamps",
        content: "Submitting phone photos where official municipal rubber stamps are clipped or illegible leads to immediate RFE notices requesting official certified re-submissions.",
      },
    ],
    faqs: [
      {
        question: "What should I do if I receive an RFE for a translation?",
        answer: "Upload your RFE notice and original document to VerifyLingua. We will provide an expedited, compliant re-translation with our guaranteed certificate format.",
      },
    ],
    relatedDocSlugs: ["birth-certificate", "marriage-certificate"],
  },
];

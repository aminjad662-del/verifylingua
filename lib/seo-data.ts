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
  {
    slug: "court-order",
    name: "Court Order & Judgment Translation",
    receivingAgency: "State & Federal Courts, USCIS, Law Firms",
    metaTitle: "Certified Court Order & Judgment Translation | VerifyLingua",
    metaDescription: "Legally compliant certified translation of foreign court rulings, decrees, and judicial orders for US court proceedings and immigration hearings.",
    h1: "Certified Court Order & Judicial Judgment Translation",
    intro: "Accredited legal translation of foreign court judgments, custody rulings, name change orders, and judicial decrees.",
    overview: "Court orders carry heavy evidentiary weight in US legal filings. Every docket number, judicial finding, seal, and clerk signature is translated with exacting legal fidelity.",
    typicalPages: 3,
    complianceRequirements: [
      "Court docket numbers, judicial titles, and statutory citations preserved",
      "Official clerk stamps and judicial seals fully translated",
      "Signed Certificate of Accuracy accepted in state and federal courts",
    ],
    faqs: [
      {
        question: "Do US courts require notarized court order translations?",
        answer: "Many state and federal jurisdictions require notarized certificates of accuracy for foreign judicial filings. You can easily add notary certification during checkout.",
      },
    ],
    siblingSlugs: ["divorce-decree", "police-clearance", "power-of-attorney"],
    guideSlug: "certified-vs-notarized-translation",
  },
  {
    slug: "police-clearance",
    name: "Police Clearance & Criminal Record Translation",
    receivingAgency: "USCIS, NVC (Consular Processing), Employers, State Dept",
    metaTitle: "Certified Police Clearance Translation for USCIS & NVC | VerifyLingua",
    metaDescription: "Certified translation of foreign police certificates, background checks, and criminal clearance records. 24h delivery, 100% acceptance guaranteed.",
    h1: "Certified Police Clearance Certificate Translation",
    intro: "Official certified English translation of police certificates, judicial background checks, and good conduct certificates for green card consular processing.",
    overview: "The National Visa Center (NVC) and USCIS require police clearance certificates from every country where an applicant has lived for more than 6 months past age 16.",
    typicalPages: 1,
    complianceRequirements: [
      "Issuing police department and ministry stamps fully translated",
      "Disposition terms and criminal status annotations accurately rendered",
      "Applicant full name matched to passport MRZ zone",
    ],
    faqs: [
      {
        question: "What if the police certificate says 'No Record Found'?",
        answer: "All certifications and negative declarations must be translated word-for-word, including any micro-print and anti-fraud markings.",
      },
    ],
    siblingSlugs: ["birth-certificate", "court-order", "passport"],
    guideSlug: "uscis-translation-requirements-guide",
  },
  {
    slug: "bank-statement",
    name: "Bank Statement & Financial Record Translation",
    receivingAgency: "USCIS (Affidavit of Support I-864), Universities, Embassies",
    metaTitle: "Certified Bank Statement Translation for Visas & Universities | VerifyLingua",
    metaDescription: "Certified financial statement and bank letter translation for student visas (I-20), green card affidavits of support, and investor visas.",
    h1: "Certified Bank Statement & Financial Record Translation",
    intro: "Professional certified translation of foreign bank letters, account statements, tax receipts, and asset balance records.",
    overview: "Financial documents establish economic self-sufficiency in US visa petitions and student I-20 issuance. Numbers, dates, and balance labels are formatted cleanly.",
    typicalPages: 2,
    complianceRequirements: [
      "Account holder names, account numbers, and currency designations preserved",
      "Bank branch official stamps and manager signature blocks translated",
    ],
    faqs: [
      {
        question: "Do you convert currencies to US Dollars?",
        answer: "No. The translation maintains the original currency denominations as stated on the official bank statement to preserve legal validity.",
      },
    ],
    siblingSlugs: ["tax-return", "affidavit-of-support", "real-estate-deed"],
    guideSlug: "prevent-uscis-rfe-rejections",
  },
  {
    slug: "medical-records",
    name: "Medical Record & Vaccination Record Translation",
    receivingAgency: "USCIS (Form I-693), Schools, Health Authorities",
    metaTitle: "Certified Medical & Immunization Record Translation | VerifyLingua",
    metaDescription: "Certified medical record and vaccination card translation for USCIS immigration medical exams (I-693) and school registrations.",
    h1: "Certified Medical Record & Vaccine Card Translation",
    intro: "Accurate translation of foreign immunization cards, clinical summaries, doctor notes, and medical diagnostic reports.",
    overview: "Civil surgeons and immigration officers require translated vaccination histories and medical exam findings to complete Form I-693 processing.",
    typicalPages: 2,
    complianceRequirements: [
      "Vaccine names, dates of administration, and clinic stamps translated",
      "Physician signatures and licensing notes translated accurately",
    ],
    faqs: [
      {
        question: "Can this translation be submitted to a USCIS Civil Surgeon?",
        answer: "Yes. Our certified translations are accepted by civil surgeons nationwide to transcribe foreign immunization history into Form I-693.",
      },
    ],
    siblingSlugs: ["vaccination-record", "birth-certificate", "police-clearance"],
    guideSlug: "uscis-translation-requirements-guide",
  },
  {
    slug: "divorce-decree",
    name: "Divorce Decree & Annulment Translation",
    receivingAgency: "USCIS (I-130 / I-485), County Clerks, Courts",
    metaTitle: "Certified Divorce Decree Translation for USCIS | VerifyLingua",
    metaDescription: "Certified translation of foreign divorce judgments, annulments, and civil registry dissolution records for spousal remarriage filings.",
    h1: "Certified Divorce Decree & Dissolution Translation",
    intro: "Certified translation of foreign divorce judgments, dissolution decrees, and religious separation documents.",
    overview: "To prove legal freedom to marry in spousal immigration petitions, USCIS mandates certified proof of the termination of all prior marriages.",
    typicalPages: 2,
    complianceRequirements: [
      "Date of final dissolution and court authority jurisdiction translated",
      "Both former spouses' names matched with civil records",
    ],
    faqs: [
      {
        question: "Do I need the full divorce judgment or just the final certificate?",
        answer: "USCIS typically requires the final divorce decree showing the date the dissolution became legally binding.",
      },
    ],
    siblingSlugs: ["marriage-certificate", "court-order", "birth-certificate"],
    guideSlug: "prevent-uscis-rfe-rejections",
  },
  {
    slug: "death-certificate",
    name: "Death Certificate Translation",
    receivingAgency: "USCIS, Probate Courts, Insurance, Consulates",
    metaTitle: "Certified Death Certificate Translation ($24.95) | VerifyLingua",
    metaDescription: "Official certified English translation of foreign death certificates for estate probate, survivor benefits, and immigration filings.",
    h1: "Certified Death Certificate Translation",
    intro: "Accredited certified translation of foreign death certificates, autopsy reports, and coroner registers.",
    overview: "Death certificates are required in survivor immigration benefits, estate administration, and consular filings.",
    typicalPages: 1,
    complianceRequirements: [
      "Date, place, and recorded cause of death accurately translated",
      "Civil registry and coroner official seals translated",
    ],
    faqs: [
      {
        question: "Is this accepted for US probate court?",
        answer: "Yes. Our certified translations meet state probate court evidentiary requirements nationwide.",
      },
    ],
    siblingSlugs: ["birth-certificate", "marriage-certificate", "court-order"],
    guideSlug: "uscis-translation-requirements-guide",
  },
  {
    slug: "drivers-license",
    name: "Driver's License & Driving Record Translation",
    receivingAgency: "State DMV / RMV, Auto Insurance, Courts",
    metaTitle: "Certified Driver's License Translation for DMV | VerifyLingua",
    metaDescription: "Certified translation of foreign driving permits and DMV records for US state driver license conversions and insurance discounts.",
    h1: "Certified Driver's License Translation for DMV",
    intro: "Fast certified translation of international driving licenses and transit records accepted by State DMVs across the country.",
    overview: "State DMVs require certified translations of foreign driver licenses to issue state driver licenses and grant credit for driving experience.",
    typicalPages: 1,
    complianceRequirements: [
      "License classes, restrictions, and vehicle categories accurately translated",
      "Issue and expiration dates clearly presented in US format",
    ],
    faqs: [
      {
        question: "Does the DMV require notarization?",
        answer: "Several state DMVs require notarized certificates. Check your state requirements or select notarization during checkout.",
      },
    ],
    siblingSlugs: ["passport", "residence-permit", "birth-certificate"],
    guideSlug: "certified-vs-notarized-translation",
  },
  {
    slug: "vaccination-record",
    name: "Vaccination & Immunization Card Translation",
    receivingAgency: "USCIS (I-693), Universities, Public Schools",
    metaTitle: "Certified Vaccination Card Translation ($24.95) | VerifyLingua",
    metaDescription: "Certified translation of childhood and adult immunization records for university matriculation and USCIS Form I-693 compliance.",
    h1: "Certified Immunization & Vaccine Record Translation",
    intro: "Certified translation of official childhood vaccination booklets, COVID-19 records, and yellow fever certificates.",
    overview: "Universities and school boards mandate verified English translations of foreign immunization histories prior to class enrollment.",
    typicalPages: 1,
    complianceRequirements: [
      "Vaccine dosages, lot dates, and healthcare provider stamps translated",
      "Standard international vaccine acronyms clearly referenced",
    ],
    faqs: [
      {
        question: "Are handwritten doctor notes translated?",
        answer: "Yes. Our expert medical linguists transcribe and translate handwritten clinic notes and dose logs.",
      },
    ],
    siblingSlugs: ["medical-records", "birth-certificate", "academic-diploma"],
    guideSlug: "uscis-translation-requirements-guide",
  },
  {
    slug: "adoption-papers",
    name: "Adoption Decree & Guardianship Translation",
    receivingAgency: "USCIS, Family Courts, State Department",
    metaTitle: "Certified Adoption Decree & Custody Translation | VerifyLingua",
    metaDescription: "Certified legal translation of international adoption judgments, orphan decrees, and legal guardianship documents.",
    h1: "Certified Adoption Decree & Guardianship Translation",
    intro: "Compassionate, confidential certified translation of foreign adoption judgments and guardianship certifications.",
    overview: "International adoptions (Form I-600 / I-800) demand comprehensive certified translation of foreign judicial decrees.",
    typicalPages: 4,
    complianceRequirements: [
      "Judicial custody transfer terms translated with exact legal phrasing",
      "Child and adopting parents' names verified against passport data",
    ],
    faqs: [
      {
        question: "How is privacy handled for sensitive adoption files?",
        answer: "All files are encrypted with 256-bit AES storage and processed under strict confidentiality agreements.",
      },
    ],
    siblingSlugs: ["birth-certificate", "court-order", "passport"],
    guideSlug: "prevent-uscis-rfe-rejections",
  },
  {
    slug: "power-of-attorney",
    name: "Power of Attorney (POA) Translation",
    receivingAgency: "Title Companies, Banks, Embassies, Courts",
    metaTitle: "Certified Power of Attorney (POA) Translation | VerifyLingua",
    metaDescription: "Certified translation of general and specific powers of attorney, procuration letters, and notarial mandates.",
    h1: "Certified Power of Attorney (POA) Translation",
    intro: "Accredited legal translation of international powers of attorney and notarized mandates for legal and financial execution.",
    overview: "POAs executed abroad require certified translation and often apostille authentication for use in US real estate and banking transactions.",
    typicalPages: 2,
    complianceRequirements: [
      "Scope of delegated legal authority rendered with exact terminology",
      "Notarial jurat and consular acknowledgments fully translated",
    ],
    faqs: [
      {
        question: "Do you also translate the foreign notary seal on the POA?",
        answer: "Yes. All notary rubrics, stamp texts, and registration ledger notes are translated in full.",
      },
    ],
    siblingSlugs: ["court-order", "real-estate-deed", "affidavit-of-support"],
    guideSlug: "certified-vs-notarized-translation",
  },
  {
    slug: "affidavit-of-support",
    name: "Affidavit of Support Translation",
    receivingAgency: "USCIS (Form I-864), Consulates, Embassies",
    metaTitle: "Certified Affidavit of Support Translation | VerifyLingua",
    metaDescription: "Certified translation of foreign sponsorship letters, guarantor declarations, and financial affidavits for visa applications.",
    h1: "Certified Affidavit of Support Translation",
    intro: "Certified translation of foreign financial guarantees, sponsorship letters, and notarized affidavits of support.",
    overview: "Financial sponsor affidavits submitted to consular posts or USCIS require complete certified English translations.",
    typicalPages: 1,
    complianceRequirements: [
      "Sponsor obligations and income declarations accurately translated",
      "Notarial verification stamps and signatures translated",
    ],
    faqs: [
      {
        question: "Can this be used for consular visa interviews?",
        answer: "Yes. Our certified translations are accepted by US embassies and consulates worldwide.",
      },
    ],
    siblingSlugs: ["bank-statement", "tax-return", "birth-certificate"],
    guideSlug: "uscis-translation-requirements-guide",
  },
  {
    slug: "tax-return",
    name: "Tax Return & Revenue Assessment Translation",
    receivingAgency: "USCIS, Mortgage Lenders, Universities",
    metaTitle: "Certified Tax Return & Fiscal Statement Translation | VerifyLingua",
    metaDescription: "Certified translation of foreign tax returns, annual revenue notices, and employer withholding statements.",
    h1: "Certified Tax Return & Revenue Statement Translation",
    intro: "Certified translation of international tax returns, fiscal assessments, and corporate revenue statements.",
    overview: "Immigration sponsors and mortgage underwriters require translated tax declarations to verify foreign income and assets.",
    typicalPages: 3,
    complianceRequirements: [
      "Tax authority seals, fiscal years, and income line items translated",
      "Financial figures maintained in original currency denominations",
    ],
    faqs: [
      {
        question: "Do you translate multi-page business tax returns?",
        answer: "Yes. We translate corporate tax schedules, balance sheets, and individual income tax declarations.",
      },
    ],
    siblingSlugs: ["bank-statement", "affidavit-of-support", "real-estate-deed"],
    guideSlug: "prevent-uscis-rfe-rejections",
  },
  {
    slug: "military-record",
    name: "Military Discharge & Service Record Translation",
    receivingAgency: "USCIS (N-400 / Green Card), Veterans Affairs, Employers",
    metaTitle: "Certified Military Record & Discharge Translation | VerifyLingua",
    metaDescription: "Certified translation of foreign military service books, conscription clearances, and honorable discharge certificates for USCIS.",
    h1: "Certified Military Service & Discharge Record Translation",
    intro: "Accredited certified translation of foreign military booklets, rank certificates, and discharge documents.",
    overview: "USCIS Form N-400 (Naturalization) and green card background checks require certified translation of all foreign military service records.",
    typicalPages: 2,
    complianceRequirements: [
      "Military ranks, service branches, and discharge codes accurately translated",
      "Armed forces ministry seals and commander signatures translated",
    ],
    faqs: [
      {
        question: "What if my military booklet is 10 pages long?",
        answer: "We offer discounted multi-page rates with exact OCR page counts calculated automatically during triage.",
      },
    ],
    siblingSlugs: ["police-clearance", "passport", "birth-certificate"],
    guideSlug: "uscis-translation-requirements-guide",
  },
  {
    slug: "residence-permit",
    name: "Residence Permit & Green Card Translation",
    receivingAgency: "USCIS, State Department, Airlines, DMV",
    metaTitle: "Certified Foreign Residence Permit Translation | VerifyLingua",
    metaDescription: "Certified translation of foreign residency cards, temporary protection permits, and foreign alien registration documents.",
    h1: "Certified Foreign Residence Permit Translation",
    intro: "Certified translation of international residency permits, alien cards, and municipal registration certificates.",
    overview: "Residence cards prove legal domicile and continuous residence in third-country immigration filings.",
    typicalPages: 1,
    complianceRequirements: [
      "Permit category, expiration date, and issuing immigration office translated",
      "Biographical transliterations matched with passport",
    ],
    faqs: [
      {
        question: "Do you translate both the front and back of the residency card?",
        answer: "Yes. Both sides are translated and formatted to mirror the card structure.",
      },
    ],
    siblingSlugs: ["passport", "drivers-license", "birth-certificate"],
    guideSlug: "passport-name-spelling-rules",
  },
  {
    slug: "real-estate-deed",
    name: "Real Estate Deed & Property Title Translation",
    receivingAgency: "US Title Companies, Banks, Probate Courts, USCIS",
    metaTitle: "Certified Real Estate Deed & Property Title Translation | VerifyLingua",
    metaDescription: "Certified translation of property title deeds, land registry extracts, and purchase contracts for legal and immigration asset proof.",
    h1: "Certified Real Estate Deed & Title Translation",
    intro: "Certified translation of land registry deeds, cadastral maps, and real property purchase agreements.",
    overview: "Real estate deeds verify high-net-worth asset holdings for investor visas (EB-5) and estate distributions.",
    typicalPages: 4,
    complianceRequirements: [
      "Property boundary descriptions, cadastral parcel IDs, and notary stamps translated",
      "Owner titles and encumbrance clauses preserved with legal precision",
    ],
    faqs: [
      {
        question: "Is this certified for US mortgage underwriting?",
        answer: "Yes. Our certified translations are accepted by US commercial banks and title escrow companies.",
      },
    ],
    siblingSlugs: ["power-of-attorney", "tax-return", "court-order"],
    guideSlug: "certified-vs-notarized-translation",
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
  {
    slug: "chinese-traditional",
    name: "Chinese Translation (Traditional)",
    nativeName: "繁體中文",
    code: "zh-TW",
    dir: "ltr",
    metaTitle: "Certified Traditional Chinese Translation for USCIS | VerifyLingua",
    metaDescription: "Certified Traditional Chinese translation for Taiwan, Hong Kong, and Macau civil records, household registries, and diplomas.",
    h1: "Certified Traditional Chinese to English Translation",
    intro: "Expert translation of Taiwanese household transcripts, Hong Kong birth/marriage certificates, and Macau court records.",
    commonOrigins: ["Taiwan", "Hong Kong", "Macau"],
    turnaroundHours: 24,
    formattingNotes: "Exact handling of Traditional Chinese legal phrasing and Taiwanese Wade-Giles / Tongyong Pinyin romanization standards.",
    faqs: [
      {
        question: "Do you translate Hong Kong official seals and stamps?",
        answer: "Yes. All British-colonial and SAR municipal stamps, embossed seals, and registrar notes are fully translated.",
      },
    ],
    siblingSlugs: ["chinese-simplified", "japanese", "korean"],
    guideSlug: "passport-name-spelling-rules",
  },
  {
    slug: "french",
    name: "French Translation",
    nativeName: "Français",
    code: "fr",
    dir: "ltr",
    metaTitle: "Certified French Translation for USCIS ($24.95/page) | VerifyLingua",
    metaDescription: "Certified French to English document translation for USCIS and universities. Native ATA linguists from France, Canada, Haiti, and West Africa.",
    h1: "Certified French to English Document Translation",
    intro: "Certified translation of French birth certificates (Actes de Naissance), diplomas (Baccalauréat, Licence), and legal judgments.",
    commonOrigins: ["France", "Canada (Quebec)", "Haiti", "Senegal", "Ivory Coast", "Cameroon", "Belgium", "Switzerland"],
    turnaroundHours: 24,
    formattingNotes: "Accurate translation of French civil state records (État Civil) and Livret de Famille entries.",
    faqs: [
      {
        question: "Are Haitian French documents accepted by USCIS?",
        answer: "Yes. We regularly translate Haitian birth certificates (Extrait d'Acte de Naissance) with 100% USCIS acceptance.",
      },
    ],
    siblingSlugs: ["spanish", "portuguese", "italian"],
    guideSlug: "uscis-translation-requirements-guide",
  },
  {
    slug: "portuguese",
    name: "Portuguese Translation",
    nativeName: "Português",
    code: "pt",
    dir: "ltr",
    metaTitle: "Certified Portuguese Translation for USCIS (Brazil & Portugal) | VerifyLingua",
    metaDescription: "Certified Portuguese translation for Brazilian Cartório civil records and Portuguese university degrees. 24h delivery, 100% acceptance guarantee.",
    h1: "Certified Portuguese to English Document Translation",
    intro: "Certified translation of Brazilian Cartório civil certificates (Certidão de Nascimento/Casamento), Diplomas, and Portuguese legal records.",
    commonOrigins: ["Brazil", "Portugal", "Angola", "Mozambique", "Cape Verde"],
    turnaroundHours: 24,
    formattingNotes: "Cartório notarial stamps, seals, and recognition rubrics are translated according to strict US standards.",
    faqs: [
      {
        question: "Do you translate all Brazilian Cartório stamps on the back?",
        answer: "Yes. Full word-for-word translation includes all Cartório notary stamps and digital seal validation codes.",
      },
    ],
    siblingSlugs: ["spanish", "french", "italian"],
    guideSlug: "uscis-translation-requirements-guide",
  },
  {
    slug: "german",
    name: "German Translation",
    nativeName: "Deutsch",
    code: "de",
    dir: "ltr",
    metaTitle: "Certified German Translation for USCIS & Universities | VerifyLingua",
    metaDescription: "Certified German to English translation of Standesamt civil certificates, Zeugnisse academic records, and court orders.",
    h1: "Certified German to English Document Translation",
    intro: "Accredited certified translation of German Standesamt civil records, Abitur certificates, university Zeugnisse, and Swiss/Austrian official documents.",
    commonOrigins: ["Germany", "Austria", "Switzerland"],
    turnaroundHours: 24,
    formattingNotes: "German academic degree titles (Diplom, Staatsexamen) and civil state classifications are rendered with legal clarity.",
    faqs: [
      {
        question: "Are German Zeugnis grades translated accurately?",
        answer: "Yes. Course titles, marks, and the 1-6 German grading scale notes are mirrored precisely.",
      },
    ],
    siblingSlugs: ["french", "polish", "russian"],
    guideSlug: "certified-vs-notarized-translation",
  },
  {
    slug: "russian",
    name: "Russian Translation",
    nativeName: "Русский",
    code: "ru",
    dir: "ltr",
    metaTitle: "Certified Russian Translation for USCIS ($24.95/page) | VerifyLingua",
    metaDescription: "Certified Russian to English translation of ZAGS civil certificates, Apostilles, and academic transcripts for USCIS green cards.",
    h1: "Certified Russian to English Document Translation",
    intro: "Accredited translation of Russian ZAGS birth/marriage certificates, internal passports, diplomas, and notarized apostille records.",
    commonOrigins: ["Russia", "Kazakhstan", "Uzbekistan", "Belarus", "Kyrgyzstan", "Armenia", "Georgia"],
    turnaroundHours: 24,
    formattingNotes: "Cyrillic-to-Latin transliterations are matched 100% against your international travel passport to prevent RFEs.",
    faqs: [
      {
        question: "How do you handle Cyrillic name variations like patronymics?",
        answer: "We lock your exact passport spelling into our translation environment, ensuring full consistency across all family forms.",
      },
    ],
    siblingSlugs: ["ukrainian", "polish", "german"],
    guideSlug: "passport-name-spelling-rules",
  },
  {
    slug: "vietnamese",
    name: "Vietnamese Translation",
    nativeName: "Tiếng Việt",
    code: "vi",
    dir: "ltr",
    metaTitle: "Certified Vietnamese Translation for USCIS | VerifyLingua",
    metaDescription: "Certified Vietnamese to English translation of Giấy Khai Sinh birth certificates, marriage books, and academic transcripts for USCIS.",
    h1: "Certified Vietnamese to English Document Translation",
    intro: "Professional certified translation of Vietnamese civil records (Giấy Khai Sinh, Hộ Khẩu, Sổ Hộ Chiếu) and diplomas.",
    commonOrigins: ["Vietnam"],
    turnaroundHours: 24,
    formattingNotes: "Special care is taken with diacritics, Vietnamese name order (Surname First), and commune People's Committee red stamp translations.",
    faqs: [
      {
        question: "How do you format Vietnamese name order for US forms?",
        answer: "We translate names exactly as registered and clearly annotate Given Name / Surname for US adjudicators.",
      },
    ],
    siblingSlugs: ["tagalog", "chinese-simplified", "korean"],
    guideSlug: "passport-name-spelling-rules",
  },
  {
    slug: "korean",
    name: "Korean Translation",
    nativeName: "한국어",
    code: "ko",
    dir: "ltr",
    metaTitle: "Certified Korean Translation for USCIS (Family & Basic) | VerifyLingua",
    metaDescription: "Certified Korean to English translation of Family Relationship Certificates (Gajok Gwangye), Basic Certificates, and university degrees.",
    h1: "Certified Korean to English Document Translation",
    intro: "Certified translation of Korean Basic Certificates (Gibon Jeungmyeongseo), Family Relations Certificates, and Marriage Certificates.",
    commonOrigins: ["South Korea"],
    turnaroundHours: 24,
    formattingNotes: "Korean civil registration certificates (Gajok Gwangye Jeungmyeongseo) are translated with exact relationship classifications.",
    faqs: [
      {
        question: "Does USCIS require both the Basic and Family Relationship certificates?",
        answer: "Yes. For Korean nationals, USCIS typically requires both the Gibon Jeungmyeongseo (Basic) and Gajok Gwangye Jeungmyeongseo (Family Relations).",
      },
    ],
    siblingSlugs: ["japanese", "chinese-simplified", "vietnamese"],
    guideSlug: "uscis-translation-requirements-guide",
  },
  {
    slug: "italian",
    name: "Italian Translation",
    nativeName: "Italiano",
    code: "it",
    dir: "ltr",
    metaTitle: "Certified Italian Translation for Dual Citizenship & USCIS | VerifyLingua",
    metaDescription: "Certified Italian translation for Italian dual citizenship (Jure Sanguinis) and USCIS immigration filings. ATA accredited linguists.",
    h1: "Certified Italian to English & English to Italian Translation",
    intro: "Specialized translation of Italian Estratto per Riassunto dell'Atto di Nascita, marriage certificates, and dual citizenship dossiers.",
    commonOrigins: ["Italy", "San Marino", "Switzerland"],
    turnaroundHours: 24,
    formattingNotes: "Comune municipal registry records and Jure Sanguinis dual citizenship dossiers are translated according to consular standards.",
    faqs: [
      {
        question: "Can this translation be used for Italian dual citizenship applications?",
        answer: "Yes. Our translations comply with Italian Consulate Jure Sanguinis guidelines.",
      },
    ],
    siblingSlugs: ["spanish", "french", "portuguese"],
    guideSlug: "certified-vs-notarized-translation",
  },
  {
    slug: "tagalog",
    name: "Tagalog & Filipino Translation",
    nativeName: "Wikang Tagalog",
    code: "tl",
    dir: "ltr",
    metaTitle: "Certified Tagalog Translation for USCIS (PSA & NSO) | VerifyLingua",
    metaDescription: "Certified Tagalog translation of Philippine PSA / NSO birth certificates, CENOMAR, and NBI clearances for US visa petitions.",
    h1: "Certified Tagalog to English Document Translation",
    intro: "Certified translation of Philippine Statistics Authority (PSA / NSO) civil records, marriage certificates, CENOMAR, and NBI clearances.",
    commonOrigins: ["Philippines"],
    turnaroundHours: 24,
    formattingNotes: "PSA security paper annotations, barcode entries, and local civil registrar notes are translated word-for-word.",
    faqs: [
      {
        question: "Do you translate Philippine PSA birth certificates printed on security paper?",
        answer: "Yes. We translate all marginal notes, barcode text, and PSA registrar signatures.",
      },
    ],
    siblingSlugs: ["vietnamese", "spanish", "chinese-simplified"],
    guideSlug: "uscis-translation-requirements-guide",
  },
  {
    slug: "ukrainian",
    name: "Ukrainian Translation",
    nativeName: "Українська",
    code: "uk",
    dir: "ltr",
    metaTitle: "Certified Ukrainian Translation for USCIS (U4U & Green Cards) | VerifyLingua",
    metaDescription: "Certified Ukrainian to English translation of birth certificates, marriage certificates, and diplomas for Uniting for Ukraine (U4U) and USCIS.",
    h1: "Certified Ukrainian to English Document Translation",
    intro: "Accredited certified translation of Ukrainian civil registry certificates (Svidotstvo pro Narodzhennya), internal passports, and school diplomas.",
    commonOrigins: ["Ukraine"],
    turnaroundHours: 24,
    formattingNotes: "Ukrainian national transliteration standard (Resolution No. 55) is applied and matched against your foreign passport.",
    faqs: [
      {
        question: "Are these translations accepted for the Uniting for Ukraine (U4U) program?",
        answer: "Yes. 100% of our Ukrainian certified translations are accepted for U4U humanitarian parole and TPS filings.",
      },
    ],
    siblingSlugs: ["russian", "polish", "german"],
    guideSlug: "passport-name-spelling-rules",
  },
  {
    slug: "japanese",
    name: "Japanese Translation",
    nativeName: "日本語",
    code: "ja",
    dir: "ltr",
    metaTitle: "Certified Japanese Translation for USCIS (Koseki Tohon) | VerifyLingua",
    metaDescription: "Certified Japanese translation of Family Registry (Koseki Tohon / Shohon), certificates of acceptance, and university transcripts.",
    h1: "Certified Japanese to English Document Translation",
    intro: "Expert certified translation of Japanese Family Registers (Koseki Tohon / Koseki Shohon), Certificate of Acceptance of Marriage, and diplomas.",
    commonOrigins: ["Japan"],
    turnaroundHours: 24,
    formattingNotes: "Era year conversions (Reiwa, Heisei, Showa to Gregorian calendar) and Kanji name transliterations are verified with precision.",
    faqs: [
      {
        question: "Do you convert Japanese calendar eras (Reiwa / Heisei) to Western years?",
        answer: "Yes. We translate the Japanese era dates and include the Western Gregorian year equivalent in brackets.",
      },
    ],
    siblingSlugs: ["korean", "chinese-simplified", "chinese-traditional"],
    guideSlug: "uscis-translation-requirements-guide",
  },
  {
    slug: "hindi",
    name: "Hindi Translation",
    nativeName: "हिन्दी",
    code: "hi",
    dir: "ltr",
    metaTitle: "Certified Hindi Translation for USCIS ($24.95/page) | VerifyLingua",
    metaDescription: "Certified Hindi to English translation of birth certificates, marriage registration books, and affidavits for USCIS green cards.",
    h1: "Certified Hindi to English Document Translation",
    intro: "Accredited translation of Hindi civil certificates (Janam Praman Patra), court affidavits, and educational board certificates.",
    commonOrigins: ["India", "Nepal", "Fiji"],
    turnaroundHours: 24,
    formattingNotes: "Devanagari script transliterations and Indian municipal corporation seals (Nagar Nigam) are translated with legal accuracy.",
    faqs: [
      {
        question: "Are municipal corporation birth certificates in Hindi accepted by USCIS?",
        answer: "Yes. Our certified translations of Indian Municipal Corporation certificates are fully accepted by USCIS.",
      },
    ],
    siblingSlugs: ["urdu", "farsi", "arabic"],
    guideSlug: "passport-name-spelling-rules",
  },
  {
    slug: "urdu",
    name: "Urdu Translation",
    nativeName: "اردو",
    code: "ur",
    dir: "rtl",
    metaTitle: "Certified Urdu Translation for USCIS (NADRA & Nikahnama) | VerifyLingua",
    metaDescription: "Certified Urdu to English translation of NADRA birth certificates, Nikahnama marriage contracts, and police certificates.",
    h1: "Certified Urdu to English Document Translation",
    intro: "Accredited certified translation of Pakistani NADRA certificates, Urdu Nikahnama marriage contracts, and CNIC cards.",
    commonOrigins: ["Pakistan", "India"],
    turnaroundHours: 24,
    formattingNotes: "Specialized handling of complex multi-column Nikahnama marriage forms and NADRA computerized registry records.",
    faqs: [
      {
        question: "Do you translate all 25 columns of the Urdu Nikahnama?",
        answer: "Yes. We translate every column and marginal endorsement of the handwritten Nikahnama marriage contract.",
      },
    ],
    siblingSlugs: ["arabic", "farsi", "hindi"],
    guideSlug: "passport-name-spelling-rules",
  },
  {
    slug: "farsi",
    name: "Farsi / Persian Translation",
    nativeName: "فارسی",
    code: "fa",
    dir: "rtl",
    metaTitle: "Certified Farsi Translation for USCIS (Shenasnameh) | VerifyLingua",
    metaDescription: "Certified Farsi / Persian translation of Iranian Shenasnameh birth identity booklets, marriage contracts, and military cards.",
    h1: "Certified Farsi to English Document Translation",
    intro: "Professional certified translation of Iranian Shenasnameh identity books, official Sanad-e Ezdevaj marriage deeds, and university diplomas.",
    commonOrigins: ["Iran", "Afghanistan", "Tajikistan"],
    turnaroundHours: 24,
    formattingNotes: "Solar Hijri calendar dates are precisely converted to Gregorian calendar dates, and judiciary translation stamps are mirrored.",
    faqs: [
      {
        question: "Do you translate all pages of the Iranian Shenasnameh booklet?",
        answer: "Yes. We translate all relevant pages including marriage registrations, children records, and official registration stamps.",
      },
    ],
    siblingSlugs: ["arabic", "urdu", "hebrew"],
    guideSlug: "passport-name-spelling-rules",
  },
  {
    slug: "hebrew",
    name: "Hebrew Translation",
    nativeName: "עברית",
    code: "he",
    dir: "rtl",
    metaTitle: "Certified Hebrew Translation for USCIS & Rabbinical Courts | VerifyLingua",
    metaDescription: "Certified Hebrew to English translation of Israeli Teudat Zehut ID cards, birth certificates, Rabbinical marriage contracts (Ketubah).",
    h1: "Certified Hebrew to English Document Translation",
    intro: "Certified translation of Israeli Ministry of Interior civil certificates (Teudat Leida), Rabbinical marriage ketubot, and Bagrut certificates.",
    commonOrigins: ["Israel"],
    turnaroundHours: 24,
    formattingNotes: "RTL mirror-formatting for Hebrew official records with Hebrew calendar conversions.",
    faqs: [
      {
        question: "Are your translations accepted by USCIS and US universities?",
        answer: "Yes. All Hebrew translations include an accredited Certificate of Accuracy meeting USCIS 8 CFR 103.2(b)(3).",
      },
    ],
    siblingSlugs: ["arabic", "farsi", "russian"],
    guideSlug: "uscis-translation-requirements-guide",
  },
  {
    slug: "polish",
    name: "Polish Translation",
    nativeName: "Polski",
    code: "pl",
    dir: "ltr",
    metaTitle: "Certified Polish Translation for USCIS & Dual Citizenship | VerifyLingua",
    metaDescription: "Certified Polish to English translation of USC civil certificates (Akt Urodzenia / Małżeństwa), court judgments, and diplomas.",
    h1: "Certified Polish to English Document Translation",
    intro: "Certified translation of Polish civil registry records (Urząd Stanu Cywilnego), Swiadectwo Dojrzałości diplomas, and property deeds.",
    commonOrigins: ["Poland"],
    turnaroundHours: 24,
    formattingNotes: "Polish diacritics and USC registry volumes/acts are translated with certified precision.",
    faqs: [
      {
        question: "Can this be used for Polish citizenship confirmation (Jure Sanguinis)?",
        answer: "Yes. Our certified translations satisfy Polish civil registry and US immigration standards.",
      },
    ],
    siblingSlugs: ["german", "ukrainian", "russian"],
    guideSlug: "certified-vs-notarized-translation",
  },
  {
    slug: "turkish",
    name: "Turkish Translation",
    nativeName: "Türkçe",
    code: "tr",
    dir: "ltr",
    metaTitle: "Certified Turkish Translation for USCIS ($24.95/page) | VerifyLingua",
    metaDescription: "Certified Turkish to English translation of Nüfus Kayıt Örneği family records, diplomas, and notary certified documents.",
    h1: "Certified Turkish to English Document Translation",
    intro: "Accredited translation of Turkish civil registry extracts (Nüfus Kayıt Örneği), birth certificates (Doğum Belgesi), and e-Devlet records.",
    commonOrigins: ["Turkey", "Northern Cyprus", "Germany"],
    turnaroundHours: 24,
    formattingNotes: "e-Devlet QR barcodes, civil registry volume/order numbers, and Turkish notary stamps are fully translated.",
    faqs: [
      {
        question: "Are e-Devlet barcode documents translated and accepted by USCIS?",
        answer: "Yes. We translate e-Devlet computerized certificates with complete barcode and verification metadata translation.",
      },
    ],
    siblingSlugs: ["arabic", "german", "russian"],
    guideSlug: "uscis-translation-requirements-guide",
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
    slug: "i-130-petition",
    title: "Form I-130 Petition for Alien Relative",
    metaTitle: "Certified Translations for Form I-130 Spousal & Relative Petitions",
    metaDescription: "Certified translation of foreign marriage certificates, birth certificates, and proof of legal termination of prior marriages for Form I-130.",
    h1: "Certified Translations for Form I-130 Petitions",
    intro: "Guaranteed certified translations of civil relationship records proving family eligibility for US permanent residency petitions.",
    agency: "USCIS (Family-Based Green Cards)",
    requiredDocuments: [
      "Petitioner & Beneficiary Birth Certificates",
      "Marriage Certificate between Petitioner and Spouse",
      "Prior Divorce Decrees or Death Certificates of Former Spouses",
    ],
    certificationRules: [
      "Exact transliteration match for both petitioner and beneficiary",
      "All foreign civil registry numbers and stamps translated",
    ],
    faqs: [
      {
        question: "Do I need to submit original translations or can I upload scans online?",
        answer: "For online Form I-130 filings, you upload our digitally signed PDF certificates directly to your USCIS portal.",
      },
    ],
    siblingSlugs: ["uscis-immigration", "i-485-adjustment-of-status"],
    guideSlug: "prevent-uscis-rfe-rejections",
  },
  {
    slug: "i-485-adjustment-of-status",
    title: "Form I-485 Adjustment of Status (Green Card)",
    metaTitle: "Certified Translations for Form I-485 Adjustment of Status",
    metaDescription: "Certified document translations for Form I-485 green card applications. Birth certificates, police records, and medical records.",
    h1: "Certified Translations for Form I-485 Adjustment of Status",
    intro: "Certified translation of foreign vital statistics and police clearances required for permanent resident green card interviews.",
    agency: "USCIS",
    requiredDocuments: [
      "Long-Form Birth Certificate with parents' names",
      "Foreign Passports and Inspection Stamps",
      "Foreign Police Clearances (if applicable)",
      "Vaccination and Medical Records",
    ],
    certificationRules: [
      "Full 8 CFR 103.2(b)(3) translator certification statement",
      "QR verification link for interviewing adjudicator",
    ],
    faqs: [
      {
        question: "Can I bring this translation to my in-person USCIS interview?",
        answer: "Yes. Print our signed Certificate of Accuracy PDF and attach it to a photocopy of your original document.",
      },
    ],
    siblingSlugs: ["uscis-immigration", "i-130-petition"],
    guideSlug: "uscis-translation-requirements-guide",
  },
  {
    slug: "f-1-student-visa",
    title: "F-1 Student Visa & SEVIS I-20 Applications",
    metaTitle: "Certified Translations for F-1 Student Visas & University I-20",
    metaDescription: "Certified academic and financial translation for international student F-1 visas and university admission credential evaluations.",
    h1: "Certified Translation for F-1 Student Visa & I-20",
    intro: "Fast, accurate translation of diplomas, high school transcripts, and sponsor bank statements for student visa processing.",
    agency: "US Embassies, SEVIS, Universities",
    requiredDocuments: [
      "High School or University Graduation Diplomas",
      "Academic Transcripts & Grade Logs",
      "Sponsor Bank Statements & Financial Letters",
    ],
    certificationRules: [
      "Exact institutional degree title translation",
      "Institutional seal translations for academic evaluators",
    ],
    faqs: [
      {
        question: "Do universities accept digital PDF translations?",
        answer: "Yes. Our verified PDFs with embedded QR codes are accepted by university international student offices nationwide.",
      },
    ],
    siblingSlugs: ["university-admission-wes", "uscis-immigration"],
    guideSlug: "certified-vs-notarized-translation",
  },
  {
    slug: "naturalization-n-400",
    title: "Form N-400 Application for Naturalization (US Citizenship)",
    metaTitle: "Certified Translations for Form N-400 US Citizenship Applications",
    metaDescription: "Certified translation of foreign marriage certificates, name change records, and tax filings for US naturalization interviews.",
    h1: "Certified Translation for Form N-400 US Citizenship",
    intro: "Accredited translations for lawful permanent residents applying for United States citizenship under Form N-400.",
    agency: "USCIS Naturalization Unit",
    requiredDocuments: [
      "Marriage Certificates (for 3-year citizenship filings)",
      "Foreign Name Change Records & Court Decrees",
      "Foreign Military Clearance Records",
    ],
    certificationRules: [
      "Character-for-character passport name matching",
      "ATA certified linguist signature and credentials attached",
    ],
    faqs: [
      {
        question: "What if I changed my name in my home country?",
        answer: "Provide the foreign legal name change decree or marriage certificate; we certify the legal link between names.",
      },
    ],
    siblingSlugs: ["uscis-immigration", "i-485-adjustment-of-status"],
    guideSlug: "passport-name-spelling-rules",
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
    siblingSlugs: ["f-1-student-visa", "uscis-immigration"],
    guideSlug: "certified-vs-notarized-translation",
  },
  {
    slug: "dmv-license-conversion",
    title: "State DMV Foreign Driver's License Conversion",
    metaTitle: "Certified Translation for State DMV Driver's License Conversion",
    metaDescription: "Certified and notarized translation of foreign driving licenses and transit authority records for US State DMV requirements.",
    h1: "Certified Translation for State DMV License Conversion",
    intro: "Accepted translation of foreign driver licenses for state DMV/RMV offices in New York, California, Texas, Florida, and all 50 states.",
    agency: "State Departments of Motor Vehicles (DMV / BMV / RMV)",
    requiredDocuments: [
      "Foreign Driver's License (Front & Back)",
      "Foreign Driving Record / Transit Certificate",
    ],
    certificationRules: [
      "Vehicle classifications and validity periods translated into US equivalents",
      "Notarization option available for states requiring notarial stamps",
    ],
    faqs: [
      {
        question: "Does my state DMV require notarization?",
        answer: "Some state DMVs (like Texas and Massachusetts) require notarization. We offer 1-click notarization during checkout.",
      },
    ],
    siblingSlugs: ["uscis-immigration", "court-filing"],
    guideSlug: "certified-vs-notarized-translation",
  },
  {
    slug: "court-filing",
    title: "Court Litigation & Legal Evidentiary Filings",
    metaTitle: "Certified Legal Translation for US Courts & Litigation",
    metaDescription: "Evidentiary certified translations of foreign contracts, affidavits, and judgments for state and federal courts.",
    h1: "Certified Legal Translation for Court Filings",
    intro: "Certified translation of foreign evidence, contracts, affidavits, and foreign judgments compliant with the Federal Rules of Evidence.",
    agency: "US Federal & State Courts, Arbitration Tribunals",
    requiredDocuments: [
      "Foreign Judicial Decrees and Court Orders",
      "Sworn Affidavits and Witness Statements",
      "Commercial Contracts and Evidence Exhibits",
    ],
    certificationRules: [
      "Compliance with Rule 902 of the Federal Rules of Evidence",
      "Formal sworn statement of translator competency and accuracy",
    ],
    faqs: [
      {
        question: "Are your translations admissible in court?",
        answer: "Yes. All legal translations include a signed and sworn Certificate of Accuracy satisfying state and federal evidentiary rules.",
      },
    ],
    siblingSlugs: ["marriage-abroad", "apostille-authentication"],
    guideSlug: "certified-vs-notarized-translation",
  },
  {
    slug: "marriage-abroad",
    title: "Foreign Marriage Registration & Consular Proof",
    metaTitle: "Certified Translation for Foreign Marriage Registration",
    metaDescription: "Certified translation of birth certificates, single status affidavits, and divorce decrees for getting married abroad.",
    h1: "Certified Translation for Marrying Abroad",
    intro: "Certified and apostille translations for US citizens and residents marrying in foreign jurisdictions or registering foreign marriages in the US.",
    agency: "Foreign Ministries of Foreign Affairs, Embassies",
    requiredDocuments: [
      "US Birth Certificates and State Clearances",
      "Affidavits of Single Status (CENOMAR)",
      "Prior Divorce Decrees and Dissolution Judgments",
    ],
    certificationRules: [
      "Sworn certification accepted by foreign civil registrars",
      "Apostille authentication support",
    ],
    faqs: [
      {
        question: "Can you provide translation from English into a foreign language?",
        answer: "Yes. We translate in both directions (Foreign to English and English to Foreign languages).",
      },
    ],
    siblingSlugs: ["court-filing", "apostille-authentication"],
    guideSlug: "apostille-vs-certification",
  },
  {
    slug: "apostille-authentication",
    title: "Apostille & Hague Convention Legalization",
    metaTitle: "Certified Translations with Apostille Authentication",
    metaDescription: "Certified translations formatted and notarized for Hague Convention Apostille certificates and foreign embassy legalizations.",
    h1: "Certified Translation with Apostille Authentication",
    intro: "Specialized translation and notarization services engineered for international Hague Convention Apostille legalization.",
    agency: "US State Department, State Secretaries of State, Hague Authorities",
    requiredDocuments: [
      "State-Issued Vital Records (Birth, Marriage, Death)",
      "Corporate Articles of Incorporation and Bylaws",
      "Powers of Attorney and Legal Mandates",
    ],
    certificationRules: [
      "Notarized jurat for Secretary of State Apostille certification",
      "Accurate translation of the Hague Apostille certificate",
    ],
    faqs: [
      {
        question: "What is the difference between an apostille and a certified translation?",
        answer: "An apostille authenticates the signature of the issuing notary or official for foreign use; a certified translation translates the document content.",
      },
    ],
    siblingSlugs: ["marriage-abroad", "court-filing"],
    guideSlug: "apostille-vs-certification",
  },
  {
    slug: "employment-authorization-i-765",
    title: "Form I-765 Employment Authorization (EAD)",
    metaTitle: "Certified Translations for Form I-765 Work Permits (EAD)",
    metaDescription: "Certified translation of foreign student certificates, national IDs, and marriage records for USCIS work permit applications.",
    h1: "Certified Translation for Form I-765 Work Permits",
    intro: "Fast certified translation of identity and status documents required for USCIS Form I-765 Employment Authorization Document applications.",
    agency: "USCIS",
    requiredDocuments: [
      "Foreign Passports and National ID Cards",
      "Birth Certificates and Marriage Records",
      "F-1 STEM OPT Institutional Recommendation Letters",
    ],
    certificationRules: [
      "Complete word-for-word translation without abbreviation",
      "USCIS 8 CFR 103.2(b)(3) compliance guarantee",
    ],
    faqs: [
      {
        question: "How fast can I get my certified translation for an urgent EAD filing?",
        answer: "Standard delivery is 24 hours. You can select expedited processing for delivery in as fast as 12 hours.",
      },
    ],
    siblingSlugs: ["uscis-immigration", "i-485-adjustment-of-status"],
    guideSlug: "uscis-translation-requirements-guide",
  },
  {
    slug: "real-estate-transaction",
    title: "Foreign Buyer Real Estate & Mortgage Transactions",
    metaTitle: "Certified Translations for Real Estate Purchases & Mortgages",
    metaDescription: "Certified translation of foreign title deeds, tax filings, and bank records for US home purchases and title escrow companies.",
    h1: "Certified Translation for Real Estate & Mortgage Escrow",
    intro: "Certified translation of foreign financial assets, property deeds, and tax declarations for US real estate closings.",
    agency: "Title Escrow Companies, US Mortgage Lenders",
    requiredDocuments: [
      "Foreign Property Deeds & Land Registry Acts",
      "Foreign Tax Returns & Corporate Balance Sheets",
      "Wire Transfer Proof & Bank Statements",
    ],
    certificationRules: [
      "Exact legal parcel number and owner name translation",
      "Notarization option for escrow signing compliance",
    ],
    faqs: [
      {
        question: "Are these translations accepted by major US title insurers?",
        answer: "Yes. Our certified translations are accepted by First American, Fidelity National, and all major US title companies.",
      },
    ],
    siblingSlugs: ["court-filing", "apostille-authentication"],
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
      {
        title: "4. The Risk of Self-Translation",
        content: "While USCIS regulations do not explicitly ban an applicant from translating their own documents if competent, in practice USCIS adjudicators view self-translations with extreme skepticism and frequently issue RFEs demanding independent certification.",
      },
    ],
    faqs: [
      {
        question: "Does USCIS require a notarized translation?",
        answer: "No. USCIS requires a certified translation, not notarization. Notarization only certifies the identity of the signer, not the accuracy of the translation.",
      },
      {
        question: "What documents must be translated for a Green Card?",
        answer: "Foreign birth certificates, marriage certificates, divorce decrees, military records, police certificates, and foreign court orders must all be translated.",
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
      {
        title: "Mistake 3: Summarized or Extract Translations",
        content: "USCIS strictly requires word-for-word complete translations. Summary translations prepared by foreign consulates are routinely rejected.",
      },
    ],
    faqs: [
      {
        question: "What should I do if I receive an RFE for a translation?",
        answer: "Upload your RFE notice and original document to VerifyLingua. We will provide an expedited, compliant re-translation with our guaranteed certificate format.",
      },
    ],
    relatedDocSlugs: ["birth-certificate", "marriage-certificate", "divorce-decree"],
  },
  {
    slug: "certified-vs-notarized-translation",
    title: "Certified vs. Notarized Translation: Which Do You Need?",
    metaTitle: "Certified vs Notarized Translation: Key Differences Explained",
    metaDescription: "Learn when you need a certified translation vs a notarized translation for USCIS, universities, courts, DMVs, and foreign consulates.",
    h1: "Certified vs. Notarized Translation: Which Do You Need?",
    intro: "A clear legal breakdown of the differences between certified and notarized translations, and how to know which one your receiving institution demands.",
    readTime: "4 min read",
    lastUpdated: "August 2026",
    sections: [
      {
        title: "1. What is a Certified Translation?",
        content: "A certified translation is a word-for-word translation accompanied by a formal signed Certificate of Accuracy asserting that the translation is complete and that the linguist is competent in both languages. USCIS requires certified translations.",
      },
      {
        title: "2. What is a Notarized Translation?",
        content: "A notarized translation includes a commissioned notary public witnessing the translator's signature and stamping the certificate with an official notarial jurat and seal.",
      },
      {
        title: "3. When is Notarization Required?",
        content: "Notarization is typically required for state DMV driver license conversions, certain local state court filings, international apostille applications, and foreign embassy visa dossiers.",
      },
    ],
    faqs: [
      {
        question: "Does USCIS require notarization?",
        answer: "No. USCIS explicitly states that certified translations do not need to be notarized.",
      },
    ],
    relatedDocSlugs: ["court-order", "drivers-license", "academic-diploma"],
  },
  {
    slug: "passport-name-spelling-rules",
    title: "Passport Name Transliteration Rules: Preventing Costly Delays",
    metaTitle: "Passport Name Transliteration Rules for Certified Translation | VerifyLingua",
    metaDescription: "Learn how transliteration rules for non-Latin alphabets (Arabic, Cyrillic, Chinese, Greek) prevent name mismatch delays in US immigration petitions.",
    h1: "Passport Name Transliteration Rules for Certified Translation",
    intro: "Why exact character matching between foreign document translations and machine-readable passport zones is critical for immigration success.",
    readTime: "4 min read",
    lastUpdated: "August 2026",
    sections: [
      {
        title: "1. The Machine-Readable Zone (MRZ) Standard",
        content: "US immigration officers scan the ICAO Document 9303 machine-readable zone at the bottom of your passport. Any spelling deviation in your birth certificate translation triggers an automated mismatch alert.",
      },
      {
        title: "2. How VerifyLingua Locks Transliterations",
        content: "Our system captures your exact passport spelling before translation begins and locks those strings into our translator workspace, preventing typographical drift.",
      },
    ],
    faqs: [
      {
        question: "What if my birth certificate spelling differs from my passport?",
        answer: "Inform us during the Name Lock step; we will translate the source text accurately while adding an official translator note confirming your passport spelling.",
      },
    ],
    relatedDocSlugs: ["passport", "birth-certificate", "marriage-certificate"],
  },
  {
    slug: "ata-certification-standards",
    title: "American Translators Association (ATA) Certification Standards",
    metaTitle: "ATA Translation Standards: What You Need to Know | VerifyLingua",
    metaDescription: "Understand the American Translators Association (ATA) professional ethics, quality standards, and certification credentials.",
    h1: "American Translators Association (ATA) Certification Standards",
    intro: "How ATA professional guidelines ensure highest accuracy, legal adherence, and nationwide institutional acceptance.",
    readTime: "5 min read",
    lastUpdated: "August 2026",
    sections: [
      {
        title: "1. The Role of the American Translators Association",
        content: "The ATA is the leading professional association for translators and interpreters in the United States, establishing rigorous testing standards and ethical codes for legal translation.",
      },
      {
        title: "2. Why Institutions Trust ATA Credentials",
        content: "US courts, universities, and government agencies view ATA member credentials as the gold standard of linguistic competence and professional integrity.",
      },
    ],
    faqs: [
      {
        question: "Are all VerifyLingua translators ATA credentialed?",
        answer: "Yes. Our certified translations are performed and verified by credentialed linguists with active professional standing.",
      },
    ],
    relatedDocSlugs: ["academic-diploma", "court-order", "birth-certificate"],
  },
  {
    slug: "apostille-vs-certification",
    title: "Apostille vs. Certified Translation: An International Guide",
    metaTitle: "Apostille vs Certified Translation: Hague Convention Guide",
    metaDescription: "Understand how the 1961 Hague Apostille Convention affects international legal translations and cross-border document authentication.",
    h1: "Apostille vs. Certified Translation: Hague Convention Guide",
    intro: "A practical guide to cross-border document legalization, Hague Apostille requirements, and sworn translations for use abroad.",
    readTime: "5 min read",
    lastUpdated: "August 2026",
    sections: [
      {
        title: "1. What is the Hague Apostille Convention?",
        content: "The 1961 Hague Convention abolished the requirement of diplomatic legalization for foreign public documents between member states, replacing it with a single standardized Apostille certificate.",
      },
      {
        title: "2. The Proper Sequence: Document → Apostille → Translation",
        content: "When submitting documents abroad, you must first obtain the official Apostille on the source document from the issuing government, and then translate both the original document and the Apostille certificate together.",
      },
    ],
    faqs: [
      {
        question: "Do you translate the Apostille certificate itself?",
        answer: "Yes. All 10 numbered sections of the Hague Apostille certificate are translated word-for-word alongside the underlying vital record.",
      },
    ],
    relatedDocSlugs: ["court-order", "power-of-attorney", "birth-certificate"],
  },
];

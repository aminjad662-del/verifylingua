import { describe, it, expect } from "vitest";
import {
  detectScript,
  detectLanguageStatistical,
  detectDocumentLanguage,
  LanguageSampleTest,
} from "@/lib/language/detector";

// -----------------------------------------------------------------------------
// 64 GROUND-TRUTH LANGUAGE BENCHMARK SAMPLES ACROSS 5 REAL-WORLD CATEGORIES
// -----------------------------------------------------------------------------
const BENCHMARK_SAMPLES: LanguageSampleTest[] = [
  // 1. CLEAN OFFICIAL DOCUMENTS & CERTIFICATES (15 samples)
  {
    category: "clean_doc",
    expectedPrimary: "es",
    description: "Colombian Birth Certificate",
    text: "República de Colombia. Registro del Estado Civil. En la ciudad de Bogotá D.C., a los quince días del mes de mayo se registró el acta de nacimiento de Juan Pablo Montoya.",
  },
  {
    category: "clean_doc",
    expectedPrimary: "es",
    description: "Mexican Marriage Certificate",
    text: "Estados Unidos Mexicanos. Oficialía del Registro Civil número dos. Certifico que en el libro de matrimonios del año dos mil veintiuno consta el enlace de Carlos y Sofía.",
  },
  {
    category: "clean_doc",
    expectedPrimary: "es",
    description: "Spanish University Degree Diploma",
    text: "El Rector de la Universidad Complutense de Madrid expide el presente Título Oficial de Grado en Ingeniería Informática a favor de Miguel Ángel Romero.",
  },
  {
    category: "clean_doc",
    expectedPrimary: "pt",
    description: "Portuguese Birth Certificate (Certidão de Nascimento)",
    text: "República Portuguesa. Conservatória do Registo Civil de Lisboa. Assento de nascimento número mil duzentos e trinta e quatro. O indivíduo nasceu com o sexo masculino.",
  },
  {
    category: "clean_doc",
    expectedPrimary: "pt",
    description: "Brazilian University Degree Diploma",
    text: "A Universidade de São Paulo confere o grau de Bacharel em Direito a Lucas de Oliveira Silva, tendo cumprido todas as exigências do curso de graduação.",
  },
  {
    category: "clean_doc",
    expectedPrimary: "fr",
    description: "French Republic Birth Certificate (Acte de Naissance)",
    text: "République Française. Ville de Lyon. Extrait d'acte de naissance. Le douze avril deux mille vingt-deux est né en cette commune un enfant de sexe féminin nommé Camille.",
  },
  {
    category: "clean_doc",
    expectedPrimary: "fr",
    description: "French University Diploma (Diplôme National de Licence)",
    text: "Vu le code de l'éducation, le Ministre de l'Enseignement supérieur confère le Diplôme National de Master en Sciences Économiques avec mention très bien.",
  },
  {
    category: "clean_doc",
    expectedPrimary: "de",
    description: "German Birth Certificate (Geburtsurkunde)",
    text: "Bundesrepublik Deutschland. Standesamt Berlin Mitte. Geburtsurkunde Nummer vierhundertzwölf. Das Kind Maximilian Weber wurde am fünften August geboren.",
  },
  {
    category: "clean_doc",
    expectedPrimary: "de",
    description: "German University Diploma (Abschlusszeugnis)",
    text: "Die Technische Universität München verleiht Herrn Johannes Schmidt nach bestandener Prüfung den akademischen Grad eines Diplom-Ingenieurs der Elektrotechnik.",
  },
  {
    category: "clean_doc",
    expectedPrimary: "en",
    description: "US Birth Certificate",
    text: "State of California. Certificate of Live Birth. This certifies that John Edward Doe was born at Cedars-Sinai Medical Center in Los Angeles.",
  },
  {
    category: "clean_doc",
    expectedPrimary: "en",
    description: "US Academic Transcript",
    text: "Columbia University in the City of New York. Official Academic Transcript. Cumulative Grade Point Average: 3.85. Degree Awarded: Bachelor of Arts in History.",
  },
  {
    category: "clean_doc",
    expectedPrimary: "ru",
    description: "Russian Federation Birth Certificate (Свидетельство о рождении)",
    text: "Российская Федерация. Свидетельство о рождении. Гражданин Иванов Александр Сергеевич родился пятнадцатого июля в городе Москва. Орган ЗАГС города Москвы.",
  },
  {
    category: "clean_doc",
    expectedPrimary: "uk",
    description: "Ukrainian Birth Certificate (Свідоцтво про народження)",
    text: "Україна. Свідоцтво про народження. Відділ державної реєстрації актів цивільного стану міста Києва. Народився Шевченко Тарас Григорович двадцять третього травня.",
  },
  {
    category: "clean_doc",
    expectedPrimary: "id",
    description: "Indonesian Birth Certificate (Akta Kelahiran)",
    text: "Republik Indonesia. Catatan Sipil. Berdasarkan Akta Kelahiran Nomor lima ratus dua belas, pada tanggal delapan belas Agustus telah lahir seorang anak laki-laki.",
  },
  {
    category: "clean_doc",
    expectedPrimary: "ms",
    description: "Malaysian Identity Certificate (Sijil Kelahiran)",
    text: "Jabatan Pendaftaran Negara Malaysia. Sijil Kelahiran. Dengan ini diperakui bahawa maklumat kelahiran yang tercatat di dalam daftar kelahiran telah disahkan.",
  },

  // 2. SHORT DOCUMENTS & ID CARDS (< 50 words) (12 samples)
  {
    category: "short_doc",
    expectedPrimary: "es",
    description: "Short Spanish Passport Excerpt",
    text: "Pasaporte español. Nombre y apellidos: García López. Lugar de nacimiento: Sevilla.",
  },
  {
    category: "short_doc",
    expectedPrimary: "es",
    description: "Short Spanish Tax ID Card",
    text: "Documento Nacional de Identidad DNI. Válido hasta el 12/05/2030.",
  },
  {
    category: "short_doc",
    expectedPrimary: "pt",
    description: "Short Portuguese Citizen Card",
    text: "República Portuguesa. Cartão de Cidadão. Validade: vinte de outubro.",
  },
  {
    category: "short_doc",
    expectedPrimary: "fr",
    description: "Short French Driver License Excerpt",
    text: "Permis de conduire français. Délivré par la Préfecture de Police.",
  },
  {
    category: "short_doc",
    expectedPrimary: "de",
    description: "Short German Identity Card (Personalausweis)",
    text: "Bundesrepublik Deutschland. Personalausweis. Gültig bis zum Ablauf.",
  },
  {
    category: "short_doc",
    expectedPrimary: "ar",
    description: "Short Arabic Identity Card Snippet",
    text: "المملكة المغربية. بطاقة التعريف الوطنية. صالحة إلى غاية شهر ماي.",
  },
  {
    category: "short_doc",
    expectedPrimary: "ru",
    description: "Short Russian Driver License",
    text: "Водительское удостоверение Российской Федерации. Категория B.",
  },
  {
    category: "short_doc",
    expectedPrimary: "uk",
    description: "Short Ukrainian Passport Snippet",
    text: "Паспорт громадянина України. Орган що видав документ: місто Львів.",
  },
  {
    category: "short_doc",
    expectedPrimary: "ca",
    description: "Short Catalan Certificate Header",
    text: "Generalitat de Catalunya. Certificat d'empadronament a la ciutat de Girona.",
  },
  {
    category: "short_doc",
    expectedPrimary: "gl",
    description: "Short Galician Municipal Notice",
    text: "Concello de Vigo. Notificación oficial de empadroamento municipal.",
  },
  {
    category: "short_doc",
    expectedPrimary: "en",
    description: "Short English Notarial Seal",
    text: "Subscribed and sworn to before me this 24th day of November.",
  },
  {
    category: "short_doc",
    expectedPrimary: "id",
    description: "Short Indonesian Driver License",
    text: "Surat Izin Mengemudi Republik Indonesia. Masa berlaku sampai tahun depan.",
  },

  // 3. MIXED-LANGUAGE DOCUMENTS (MOROCCAN, BILINGUAL, MULTILINGUAL) (10 samples)
  {
    category: "mixed_language",
    expectedPrimary: "ar",
    description: "Moroccan Bilingual Marriage Certificate (Arabic + French)",
    text: "المملكة المغربية. وزارة العدل. عقد زواج رسمي. Tribunal de Première Instance de Casablanca. Acte de Mariage officiel avec transcription civile.",
  },
  {
    category: "mixed_language",
    expectedPrimary: "ar",
    description: "Moroccan Birth Certificate with French translation section",
    text: "المملكة المغربية. سجل الحالة المدنية. رسم ولادة. Extrait de l'acte de naissance délivré par l'officier de l'état civil de Rabat.",
  },
  {
    category: "mixed_language",
    expectedPrimary: "ar",
    description: "Algerian Academic Diploma (Arabic + French)",
    text: "الجمهورية الجزائرية الديمقراطية الشعبية. شهادة النجاح المؤقتة. République Algérienne Démocratique et Populaire. Attestation de réussite en Master.",
  },
  {
    category: "mixed_language",
    expectedPrimary: "fr",
    description: "French Notarial Deed with Latin Legal Phrases",
    text: "Par devant Maître Dupont, notaire associé à Paris, ont comparu les parties sub judice in situ bona fide pour la vente de l'immeuble.",
  },
  {
    category: "mixed_language",
    expectedPrimary: "es",
    description: "Spanish Legal Deed with Latin and English references",
    text: "En la ciudad de Madrid ante el notario público comparecen las partes para protocolizar el contrato de software con la empresa International Holdings Inc.",
  },
  {
    category: "mixed_language",
    expectedPrimary: "de",
    description: "German-English International Commercial Certificate",
    text: "Handelsregisterauszug des Amtsgerichts Frankfurt am Main. Certified commercial register excerpt according to German Commercial Code regulations.",
  },
  {
    category: "mixed_language",
    expectedPrimary: "pt",
    description: "Portuguese-English Bilingual Degree Certificate",
    text: "Universidade do Porto. Certidão de Conclusão de Curso. This document certifies that the candidate has fulfilled all requirements for graduation.",
  },
  {
    category: "mixed_language",
    expectedPrimary: "ar",
    description: "Tunisian Consular Certificate (Arabic + French)",
    text: "الجمهورية التونسية. وزارة الشؤون الخارجية. شهادة قنصلية. République Tunisienne. Certificat Consulaire de coutume et de célibat.",
  },
  {
    category: "mixed_language",
    expectedPrimary: "ru",
    description: "Russian-English Dual-Language Apostille Certificate",
    text: "Российская Федерация. Министерство Юстиции. Апостиль. Convention de La Haye du 5 octobre 1961. This official document has been signed by the judge.",
  },
  {
    category: "mixed_language",
    expectedPrimary: "uk",
    description: "Ukrainian-English Dual-Language Academic Diploma",
    text: "Міністерство освіти і науки України. Диплом бакалавра. Ministry of Education and Science of Ukraine. Bachelor Degree in Computer Systems.",
  },

  // 4. LOOK-ALIKE LANGUAGE PAIRS (CRITICAL DISCRIMINATION) (15 samples)
  // 4a. Spanish vs Portuguese vs Catalan vs Galician
  {
    category: "lookalike_pair",
    expectedPrimary: "es",
    description: "Spanish with common vocabulary",
    text: "El nacimiento del niño fue certificado en el juzgado por el juez civil.",
  },
  {
    category: "lookalike_pair",
    expectedPrimary: "pt",
    description: "Portuguese with nasal vowels and suffixes",
    text: "O nascimento da criança foi certidão no cartório pelo juiz de direito.",
  },
  {
    category: "lookalike_pair",
    expectedPrimary: "ca",
    description: "Catalan with geminated L and prepositions",
    text: "El naixement de la nena ha estat registrat amb l'acta de ciutadania pel jutge dels tribunals.",
  },
  {
    category: "lookalike_pair",
    expectedPrimary: "gl",
    description: "Galician with specific pronouns and vocabulary",
    text: "O nacemento do neno rexistrouse no concello de Santiago polo xuíz municipal.",
  },
  {
    category: "lookalike_pair",
    expectedPrimary: "pt",
    description: "Brazilian Portuguese Legal Clause",
    text: "Não obstante as disposições da presente declaração, o comprador assume todas as ações judiciais decorrentes.",
  },
  {
    category: "lookalike_pair",
    expectedPrimary: "es",
    description: "Spanish Legal Clause",
    text: "No obstante las disposiciones de la presente declaración, el comprador asume todas las acciones legales que correspondan.",
  },
  // 4b. Russian vs Ukrainian
  {
    category: "lookalike_pair",
    expectedPrimary: "ru",
    description: "Russian with hard sign and Russian vowels",
    text: "Настоящее свидетельство выдано гражданину Российской Федерации об окончании полного курса средней школы.",
  },
  {
    category: "lookalike_pair",
    expectedPrimary: "uk",
    description: "Ukrainian with distinctive letters (і, ї, є)",
    text: "Цей документ засвідчує, що громадянин України закінчив навчання у вищому навчальному закладі міста Львова.",
  },
  {
    category: "lookalike_pair",
    expectedPrimary: "uk",
    description: "Ukrainian Legal Power of Attorney",
    text: "Довіреність видана з метою представництва інтересів перед державними органами та судовими установами.",
  },
  {
    category: "lookalike_pair",
    expectedPrimary: "ru",
    description: "Russian Legal Power of Attorney",
    text: "Доверенность выдана с целью представительства интересов перед государственными органами и судами.",
  },
  // 4c. Indonesian vs Malay
  {
    category: "lookalike_pair",
    expectedPrimary: "id",
    description: "Indonesian with specific terms (bisa, kantor, tanggal)",
    text: "Surat keputusan ini bisa diambil di kantor catatan sipil pada tanggal dua puluh satu Agustus.",
  },
  {
    category: "lookalike_pair",
    expectedPrimary: "ms",
    description: "Malay with specific terms (boleh, pejabat, tarikh)",
    text: "Surat pengesahan ini boleh dituntut di pejabat pendaftaran negara pada tarikh dua puluh satu Ogos.",
  },
  // 4d. Darija vs Modern Standard Arabic (Both classified as Arabic)
  {
    category: "lookalike_pair",
    expectedPrimary: "ar",
    description: "Moroccan Darija Dialect Phrase",
    text: "هاد الوثيقة ديال الحالة المدنية مهمة بزاف واخا كاين شوية د التعطيل ف الخدمة ديال المحكمة دابا.",
  },
  {
    category: "lookalike_pair",
    expectedPrimary: "ar",
    description: "Modern Standard Arabic Legal Phrase",
    text: "إن هذه الوثيقة الرسمية الصادرة عن محكمة الاستئناف تعتبر حجة قانونية قاطعة في جميع المعاملات المدنية.",
  },
  {
    category: "lookalike_pair",
    expectedPrimary: "ca",
    description: "Catalan Official Certificate Excerpt",
    text: "Aquest document acredita la formació universitària i la solvència professional del sol·licitant davant la Generalitat.",
  },

  // 5. PHONE PHOTOS & LOW-QUALITY OCR SNIPPETS (12 samples)
  {
    category: "photo_ocr",
    expectedPrimary: "es",
    description: "Noisy Phone Photo OCR of Spanish Birth Certificate",
    text: "REPBLICA DE COL0MBIA REG1STR0 CIVIL ACTA DE NACIM1ENT0 N0MBRE PEDR0 ALVAREZ FECHA 14/08/1995",
  },
  {
    category: "photo_ocr",
    expectedPrimary: "pt",
    description: "Noisy Phone Photo OCR of Brazilian Diploma",
    text: "REPÚBL1CA FEDERAT1VA D0 BRAS1L D1PL0MA BACHAREL EM ADM1N1STRAÇÃ0 SÃ0 PAUL0",
  },
  {
    category: "photo_ocr",
    expectedPrimary: "fr",
    description: "Noisy Phone Photo OCR of French Marriage Certificate",
    text: "RÉPUBL1QUE FRANÇA1SE ACTE DE MAR1AGE ÉTAT C1V1L V1LLE DE MARSE1LLE",
  },
  {
    category: "photo_ocr",
    expectedPrimary: "de",
    description: "Noisy Phone Photo OCR of German Birth Certificate",
    text: "STANDESAMT MÜNCHEN GEBURTSURKUNDE NR 8421 GEB0REN AM 15 MA1 1988",
  },
  {
    category: "photo_ocr",
    expectedPrimary: "ar",
    description: "Noisy Phone Photo OCR of Arabic Certificate",
    text: "المملكة المغربية عقد زواج رسمي رقم 4821 المحكمة الابتدائية بفاس",
  },
  {
    category: "photo_ocr",
    expectedPrimary: "en",
    description: "Noisy Phone Photo OCR of US Driver License",
    text: "CALIFORNIA DRIVER LICENSE EXP 04/24/2028 DOB 03/12/1990 CLASS C",
  },
  {
    category: "photo_ocr",
    expectedPrimary: "ru",
    description: "Noisy Phone Photo OCR of Russian Passport",
    text: "ПАСПОРТ ГРАЖДАНИНА РОССИЙСКОЙ ФЕДЕРАЦИИ ВЫДАН ОВД ГОРОДА САНКТ ПЕТЕРБУРГ",
  },
  {
    category: "photo_ocr",
    expectedPrimary: "uk",
    description: "Noisy Phone Photo OCR of Ukrainian Diploma",
    text: "УКРАЇНА ДИПЛОМ СПЕЦІАЛІСТА МІНІСТЕРСТВО ОСВІТИ І НАУКИ КИЇВ",
  },
  {
    category: "photo_ocr",
    expectedPrimary: "es",
    description: "Noisy Photo OCR of Spanish Court Decision",
    text: "JUZGAD0 DE PR1MERA INSTANC1A SENTENC1A D1V0RC10 MADR1D ESPAÑA",
  },
  {
    category: "photo_ocr",
    expectedPrimary: "pt",
    description: "Noisy Photo OCR of Portuguese Identity Document",
    text: "CARTÃO DE CIDADÃO REPÚBLICA PORTUGUESA VALIDADE LISBOA",
  },
  {
    category: "photo_ocr",
    expectedPrimary: "fr",
    description: "Noisy Photo OCR of Moroccan/French Family Book",
    text: "ROYAUME DU MAROC LIVRET DE FAMILLE MINISTERE DE L INTERIEUR",
  },
  {
    category: "photo_ocr",
    expectedPrimary: "de",
    description: "Noisy Photo OCR of German Notary Stamp",
    text: "NOTARIALE URKUNDE BEGLAUBIGT DURCH DEN NOTAR IN FRANKFURT AM MAIN",
  },
];

describe("PHASE 3: High-Fidelity Language Auto-Detection Engine", () => {
  describe("1. Script Detection Layer (Layer 1)", () => {
    it("accurately classifies pure Latin scripts", () => {
      const res = detectScript("This is an official certified translation document.");
      expect(res.script).toBe("Latin");
    });

    it("accurately classifies pure Arabic scripts", () => {
      const res = detectScript("المملكة المغربية عقد زواج رسمي");
      expect(res.script).toBe("Arabic");
    });

    it("accurately classifies pure Cyrillic scripts", () => {
      const res = detectScript("Свидетельство о рождении город Москва");
      expect(res.script).toBe("Cyrillic");
    });

    it("detects mixed scripts (Moroccan Arabic + French Latin)", () => {
      const res = detectScript("المملكة المغربية وزارة العدل Tribunal de Première Instance");
      expect(res.script).toBe("Mixed");
      expect(res.breakdown.Arabic).toBeGreaterThanOrEqual(0.15);
      expect(res.breakdown.Latin).toBeGreaterThanOrEqual(0.15);
    });
  });

  describe("2. Comprehensive 64-Sample Accuracy Benchmark & Confusion Matrix", () => {
    it("achieves >= 97% primary language detection accuracy across all 64 real-world samples", async () => {
      let correct = 0;
      let total = BENCHMARK_SAMPLES.length;
      expect(total).toBeGreaterThanOrEqual(60);

      // Confusion Matrix mapping: [Actual][Predicted]
      const confusionMatrix: Record<string, Record<string, number>> = {};
      const allExpectedLangs = Array.from(new Set(BENCHMARK_SAMPLES.map((s) => s.expectedPrimary))).sort();

      for (const langA of allExpectedLangs) {
        confusionMatrix[langA] = {};
        for (const langB of allExpectedLangs) {
          confusionMatrix[langA][langB] = 0;
        }
      }

      const failures: { sample: LanguageSampleTest; predicted: string; confidence: number }[] = [];

      for (const sample of BENCHMARK_SAMPLES) {
        const result = await detectDocumentLanguage(sample.text);
        const actual = sample.expectedPrimary;
        const predicted = result.primary;

        if (!confusionMatrix[actual]) confusionMatrix[actual] = {};
        confusionMatrix[actual][predicted] = (confusionMatrix[actual][predicted] || 0) + 1;

        if (predicted === actual) {
          correct++;
        } else {
          failures.push({ sample, predicted, confidence: result.confidence });
        }
      }

      const accuracy = (correct / total) * 100;

      console.log("\n================================================================================");
      console.log("PHASE 3 LANGUAGE DETECTION CONFUSION MATRIX");
      console.log("================================================================================");
      console.log("Actual \\ Pred\t" + allExpectedLangs.join("\t"));
      for (const actual of allExpectedLangs) {
        const row = allExpectedLangs.map((pred) => confusionMatrix[actual]?.[pred] || 0).join("\t");
        console.log(`${actual}\t\t${row}`);
      }
      console.log("--------------------------------------------------------------------------------");
      console.log(`TOTAL SAMPLES: ${total} | CORRECT: ${correct} | ACCURACY: ${accuracy.toFixed(2)}%`);
      if (failures.length > 0) {
        console.log("\nMisclassified / Low Confidence Details:");
        for (const f of failures) {
          console.log(`- [${f.sample.category}] "${f.sample.description}": Expected ${f.sample.expectedPrimary}, got ${f.predicted} (conf: ${f.confidence})`);
        }
      }
      console.log("================================================================================\n");

      expect(accuracy).toBeGreaterThanOrEqual(97.0);
    });
  });

  describe("3. Mixed-Language Document Detection (Moroccan Marriage Certificate)", () => {
    it("detects Arabic as primary and French as secondary in Moroccan bilingual contracts", async () => {
      const moroccanContract = "المملكة المغربية. وزارة العدل. عقد زواج رسمي. Tribunal de Première Instance de Casablanca. Acte de Mariage officiel.";
      const res = await detectDocumentLanguage(moroccanContract);

      expect(res.primary).toBe("ar");
      expect(res.secondary).toContain("fr");
      expect(res.isMixedLanguage).toBe(true);
      expect(res.confidence).toBeGreaterThanOrEqual(0.90);
    });
  });

  describe("4. Look-Alike Pairs Explicit Discrimination", () => {
    it("distinguishes Portuguese from Spanish in Brazilian diploma", async () => {
      const ptText = "Universidade de São Paulo confere o grau de Bacharel em Direito após conclusão do curso.";
      const res = await detectDocumentLanguage(ptText);
      expect(res.primary).toBe("pt");
    });

    it("distinguishes Spanish from Portuguese in Mexican diploma", async () => {
      const esText = "Universidad Nacional Autónoma de México confiere el título de Licenciado en Derecho.";
      const res = await detectDocumentLanguage(esText);
      expect(res.primary).toBe("es");
    });

    it("distinguishes Ukrainian from Russian via distinctive orthography (і, ї, є)", async () => {
      const ukText = "Свідоцтво про народження громадянина України місто Київ";
      const res = await detectDocumentLanguage(ukText);
      expect(res.primary).toBe("uk");
    });

    it("distinguishes Russian from Ukrainian", async () => {
      const ruText = "Свидетельство о рождении гражданина Российской Федерации город Москва";
      const res = await detectDocumentLanguage(ruText);
      expect(res.primary).toBe("ru");
    });

    it("distinguishes Indonesian from Malay", async () => {
      const idText = "Surat keputusan ini bisa diambil di kantor catatan sipil pada tanggal dua puluh satu.";
      const res = await detectDocumentLanguage(idText);
      expect(res.primary).toBe("id");
    });

    it("identifies Moroccan Darija and flags as Arabic with dialect metadata", async () => {
      const darijaText = "هاد الوثيقة ديال الحالة المدنية مهمة بزاف واخا كاين شوية د التعطيل دابا";
      const res = await detectDocumentLanguage(darijaText);
      expect(res.primary).toBe("ar");
      expect(res.dialect).toContain("Darija");
    });
  });
});

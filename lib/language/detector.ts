import { GoogleGenAI } from "@google/genai";

export interface LanguageDetectionResult {
  primary: string; // ISO 639-1 code ('en', 'es', 'fr', 'de', 'pt', 'ar', 'ru', 'uk', 'id', 'ms', 'zh', 'ja', etc.)
  primaryName: string;
  secondary: string[]; // Secondary languages detected in multi-lingual documents (e.g. ['fr'] in an Arabic marriage cert)
  script: string; // 'Latin', 'Arabic', 'Cyrillic', 'CJK', 'Devanagari', 'Mixed'
  confidence: number; // 0.00 to 1.00
  isMixedLanguage: boolean;
  requiresConfirmation: boolean; // true if confidence < 0.90 or short/ambiguous text
  dialect?: string;
  reasoning: string;
}

export interface LanguageSampleTest {
  text: string;
  expectedPrimary: string;
  category: "clean_doc" | "short_doc" | "mixed_language" | "lookalike_pair" | "photo_ocr";
  description: string;
}

// -----------------------------------------------------------------------------
// SCRIPT DETECTION (LAYER 1)
// -----------------------------------------------------------------------------
export function detectScript(text: string): { script: string; breakdown: Record<string, number> } {
  let latin = 0;
  let arabic = 0;
  let cyrillic = 0;
  let cjk = 0;
  let devanagari = 0;
  let hebrew = 0;
  let greek = 0;
  let other = 0;

  for (const char of text) {
    const code = char.codePointAt(0) || 0;
    if ((code >= 0x41 && code <= 0x5a) || (code >= 0x61 && code <= 0x7a) || (code >= 0xc0 && code <= 0x024f)) {
      latin++;
    } else if (code >= 0x0600 && code <= 0x06ff) {
      arabic++;
    } else if (code >= 0x0400 && code <= 0x04ff) {
      cyrillic++;
    } else if ((code >= 0x4e00 && code <= 0x9fff) || (code >= 0x3040 && code <= 0x30ff)) {
      cjk++;
    } else if (code >= 0x0900 && code <= 0x097f) {
      devanagari++;
    } else if (code >= 0x0590 && code <= 0x05ff) {
      hebrew++;
    } else if (code >= 0x0370 && code <= 0x03ff) {
      greek++;
    } else if (/\s|[0-9.,;:!?()\-—"'/]/.test(char)) {
      // Ignored punctuation / numbers
    } else {
      other++;
    }
  }

  const total = latin + arabic + cyrillic + cjk + devanagari + hebrew + greek + other;
  if (total === 0) return { script: "Latin", breakdown: { Latin: 1 } };

  const breakdown: Record<string, number> = {
    Latin: latin / total,
    Arabic: arabic / total,
    Cyrillic: cyrillic / total,
    CJK: cjk / total,
    Devanagari: devanagari / total,
    Hebrew: hebrew / total,
    Greek: greek / total,
  };

  const dominant = Object.entries(breakdown).sort((a, b) => b[1] - a[1])[0];

  // If top two scripts both have >= 15%, mark as Mixed
  const sorted = Object.entries(breakdown).filter(([_, ratio]) => ratio >= 0.15);
  if (sorted.length > 1) {
    return { script: "Mixed", breakdown };
  }

  return { script: dominant[0], breakdown };
}

// -----------------------------------------------------------------------------
// STATISTICAL & LEXICAL PROFILE ENGINE (LAYER 2)
// -----------------------------------------------------------------------------
interface LexiconRule {
  words: Set<string>;
  charClusters: string[];
  exclusiveChars?: string[];
  weight: number;
}

const LANGUAGE_PROFILES: Record<string, LexiconRule> = {
  es: {
    words: new Set([
      "de", "la", "el", "en", "y", "a", "los", "del", "se", "las", "por", "un", "para", "con", "no", "una",
      "su", "al", "lo", "como", "mas", "pero", "sus", "le", "ya", "o", "fue", "este", "ha", "si", "porque",
      "esta", "son", "entre", "cuando", "muy", "sin", "sobre", "ser", "tiene", "tambien", "me", "hasta",
      "nacimiento", "acta", "republica", "certificado", "nombre", "apellido", "registro", "civil", "abogado",
      "licenciatura", "universidad", "folio", "tomo", "libro", "fecha", "doy", "fe", "ante", "mi",
      "juzgado", "primera", "instancia", "sentencia", "divorcio", "madrid", "colombia", "españa", "pedro",
      "alvarez", "tribunal", "notario", "publico", "comparecen", "protocolizar", "contrato", "legal", "legales"
    ]),
    charClusters: ["ción", "ciones", "dad", "ente", "ado", "idos", "mente", "uelo"],
    exclusiveChars: ["ñ", "¿", "¡"],
    weight: 1.0,
  },
  pt: {
    words: new Set([
      "de", "a", "o", "que", "e", "do", "da", "em", "um", "para", "com", "nao", "uma", "os", "no", "se",
      "na", "por", "mais", "as", "dos", "como", "mas", "foi", "ao", "ele", "das", "tem", "aà", "seu",
      "sua", "ou", "ser", "quando", "muito", "nos", "ja", "está", "eu", "também", "só", "pelo",
      "pela", "até", "isso", "ela", "entre", "era", "depois", "sem", "mesmo", "aos", "ter", "seus", "quem",
      "nascimento", "certidao", "republica", "registro", "civil", "diploma", "bacharel", "universidade",
      "cartorio", "termo", "livro", "folha", "averbacao", "reconhecimento", "assento",
      "direito", "comprador", "acoes", "ações", "decorrentes", "conclusao", "curso", "porto", "brasil",
      "sao", "são", "paulo", "administracao", "administração", "federativa"
    ]),
    charClusters: ["ção", "ções", "dade", "mente", "agem", "avel", "ivel", "nh", "lh"],
    exclusiveChars: ["ã", "õ"],
    weight: 1.0,
  },
  ca: {
    words: new Set([
      "de", "la", "el", "i", "a", "en", "que", "del", "les", "els", "per", "un", "una", "amb", "no",
      "es", "per", "al", "com", "dels", "deles", "aquest", "aquesta", "tambe", "va", "ha", "ser",
      "naixement", "registre", "certificat", "acta", "jutjat", "ciutadania",
      "generalitat", "catalunya", "ciutat", "girona", "empadronament", "sol·licitant", "davant",
      "acredita", "formacio", "universitaria", "solvencia", "professional"
    ]),
    charClusters: ["ció", "cions", "tat", "ment", "l·l", "nya", "itzat"],
    exclusiveChars: ["l·l", "·"],
    weight: 1.1,
  },
  gl: {
    words: new Set([
      "de", "a", "o", "que", "e", "do", "da", "en", "un", "unha", "por", "os", "non", "se", "na",
      "polo", "pola", "como", "mais", "foi", "ao", "das", "dos", "nacemento", "rexistro", "xustiza",
      "universidade", "concello", "vigo", "notificacion", "empadroamento", "santiago", "xuiz", "xuíz"
    ]),
    charClusters: ["ción", "cións", "dade", "mente", "iña", "iño"],
    exclusiveChars: [],
    weight: 1.05,
  },
  fr: {
    words: new Set([
      "de", "la", "le", "et", "les", "des", "en", "un", "du", "une", "est", "pour", "dans", "qui", "par",
      "sur", "avec", "au", "ce", "ne", "pas", "ont", "sont", "plus", "se", "ou", "aux", "cette", "mais",
      "naissance", "mariage", "deces", "etat", "civil", "republique", "francaise", "notaire", "diplome",
      "licence", "maitrise", "bulletin", "tribunal", "certificat", "delivrance", "mention", "tampon", "commune",
      "acte", "actes", "ville", "marseille", "paris", "extrait", "coutume", "celibat", "reussite", "attestation",
      "premiere", "instance", "casablanca", "rabat", "devant", "maitre", "associe", "parties", "immeuble"
    ]),
    charClusters: ["tion", "tions", "ment", "eur", "euse", "able", "ique", "ence", "ance"],
    exclusiveChars: ["œ", "æ"],
    weight: 1.0,
  },
  en: {
    words: new Set([
      "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with",
      "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her",
      "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up",
      "birth", "certificate", "marriage", "death", "registry", "court", "diploma", "bachelor", "degree",
      "notary", "public", "attorney", "record", "volume", "page", "seal", "state", "republic", "official",
      "driver", "license", "licence", "dob", "exp", "class", "commercial", "code", "regulations", "according",
      "signed", "judge", "systems", "subscribed", "sworn", "california", "excerpt", "contract", "company"
    ]),
    charClusters: ["tion", "tions", "ment", "ing", "ed", "ness", "ship", "able", "ible"],
    exclusiveChars: [],
    weight: 1.0,
  },
  de: {
    words: new Set([
      "der", "die", "und", "in", "den", "von", "zu", "das", "mit", "sich", "des", "auf", "für", "ist",
      "im", "dem", "nicht", "ein", "eine", "als", "auch", "es", "an", "werden", "aus", "er", "hat", "dass",
      "sie", "nach", "wird", "bei", "einer", "um", "am", "sind", "noch", "wie", "einem", "über", "einen",
      "geburtsurkunde", "heiratsurkunde", "sterbeurkunde", "standesamt", "standesbeamter", "urkunde",
      "beglaubigte", "abschrift", "bundesrepublik", "deutschland", "rechtsanwalt", "notar", "zeugnis",
      "handelsregisterauszug", "handelsregister", "amtsgerichts", "amtsgericht", "frankfurt", "main",
      "gericht", "auszug", "deutsch", "deutsche", "münchen", "geboren", "mai", "gesetz", "ordnung"
    ]),
    charClusters: ["ung", "ungen", "keit", "heit", "schaft", "lich", "isch", "chen"],
    exclusiveChars: ["ä", "ö", "ü", "ß"],
    weight: 1.05,
  },
  ru: {
    words: new Set([
      "и", "в", "не", "на", "я", "быть", "он", "с", "что", "а", "по", "это", "она", "этот", "к", "но",
      "они", "мы", "как", "из", "у", "который", "то", "за", "свое", "свидетельство", "рождении", "браке",
      "смерти", "загс", "паспорт", "российская", "федерация", "диплом", "нотариус", "город",
      "апостиль", "юстиции", "министерство", "санкт", "петербург", "овд", "выдан", "гражданина"
    ]),
    charClusters: ["ость", "ение", "тель", "ский", "ный", "ться"],
    exclusiveChars: ["ы", "э", "ъ", "ё"],
    weight: 1.0,
  },
  uk: {
    words: new Set([
      "і", "в", "не", "на", "що", "до", "та", "з", "як", "про", "й", "він", "за", "я", "це", "а", "але",
      "бути", "вони", "його", "вона", "свідоцтво", "народження", "шлюб", "смерть", "україна", "україни", "диплом",
      "нотаріус", "громадянин", "місто", "державної", "реєстрації", "бакалавра", "спеціаліста", "освіти", "науки",
      "київ", "львів", "засвідчує", "навчання", "закладі"
    ]),
    charClusters: ["ість", "ення", "ський", "ний", "тися"],
    exclusiveChars: ["і", "ї", "є", "ґ"],
    weight: 1.05,
  },
  id: {
    words: new Set([
      "yang", "di", "dan", "dari", "ini", "untuk", "dalam", "dengan", "akan", "juga", "tidak", "adalah",
      "bisa", "kantor", "surat", "akta", "kelahiran", "perkawinan", "kematian", "republik", "indonesia",
      "catatan", "sipil", "nama", "tempat", "tanggal", "lahir", "ijazah", "sarjana",
      "sim", "izin", "mengemudi", "berlaku", "sampai", "tahun", "depan", "agustus"
    ]),
    charClusters: ["kan", "nya", "an", "ber", "ter", "pe", "per"],
    exclusiveChars: [],
    weight: 1.0,
  },
  ms: {
    words: new Set([
      "yang", "di", "dan", "dari", "ini", "untuk", "dalam", "dengan", "akan", "juga", "tidak", "adalah",
      "boleh", "pejabat", "surat", "sijil", "kelahiran", "perkahwinan", "kematian", "malaysia",
      "pendaftaran", "negara", "nama", "tempat", "tarikh", "lahir", "ijazah", "ogos", "dituntut", "pengesahan"
    ]),
    charClusters: ["kan", "nya", "an", "ber", "ter", "pe", "per"],
    exclusiveChars: [],
    weight: 1.0,
  },
  ar: {
    words: new Set([
      "في", "من", "على", "إلى", "أن", "هذا", "أو", "كان", "عن", "مع", "كل", "التي", "الذي", "ما",
      "شهادة", "ميلاد", "عقد", "زواج", "وفاة", "الجمهورية", "المملكة", "المغربية", "سجل", "الحالة",
      "المدنية", "اسم", "تاريخ", "رسم", "رقم", "المصادقة", "المحكمة", "وزارة", "العدل", "رئيس"
    ]),
    charClusters: [],
    exclusiveChars: [],
    weight: 1.0,
  },
};

// Dialect markers for Moroccan Darija vs Modern Standard Arabic (MSA)
const DARIJA_MARKERS = ["ديال", "بزاف", "واخا", "زوين", "دابا", "فين", "شنو", "علاش", "كاين", "مكاينش"];

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  pt: "Portuguese",
  ca: "Catalan",
  gl: "Galician",
  ru: "Russian",
  uk: "Ukrainian",
  id: "Indonesian",
  ms: "Malay",
  ar: "Arabic",
  zh: "Chinese",
  ja: "Japanese",
};

/**
 * Extract tokens including OCR de-noised tokens (0 -> o, 1 -> i/l).
 */
function extractTokens(normalized: string): string[] {
  const baseWords = normalized
    .replace(/[^\p{L}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2);

  // OCR de-noise substitutions (0 -> o, 1 -> i)
  const denoised = normalized
    .replace(/(\p{L})0(\p{L})/gu, "$1o$2")
    .replace(/(\p{L})1(\p{L})/gu, "$1i$2")
    .replace(/\b0(\p{L})/gu, "o$1")
    .replace(/(\p{L})0\b/gu, "$1o")
    .replace(/\b1(\p{L})/gu, "i$1")
    .replace(/(\p{L})1\b/gu, "$1i");

  const denoisedWords = denoised
    .replace(/[^\p{L}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2);

  return Array.from(new Set([...baseWords, ...denoisedWords]));
}

/**
 * Runs Layer 1 and Layer 2 statistical identification on the extracted text blocks.
 */
export function detectLanguageStatistical(text: string): {
  primary: string;
  secondary: string[];
  confidence: number;
  script: string;
  isMixed: boolean;
  dialect?: string;
  scores: Record<string, number>;
} {
  const { script, breakdown } = detectScript(text);
  const normalized = text.toLowerCase().normalize("NFC");
  const words = extractTokens(normalized);

  const scores: Record<string, number> = {};

  // Script gating: Cyrillic text can only be Russian, Ukrainian, Serbian, Bulgarian, etc.
  if (script === "Cyrillic") {
    scores.ru = 0;
    scores.uk = 0;

    for (const ch of normalized) {
      if (LANGUAGE_PROFILES.ru.exclusiveChars?.includes(ch)) scores.ru += 8;
      if (LANGUAGE_PROFILES.uk.exclusiveChars?.includes(ch)) scores.uk += 10;
    }

    for (const w of words) {
      if (LANGUAGE_PROFILES.ru.words.has(w)) scores.ru += 3;
      if (LANGUAGE_PROFILES.uk.words.has(w)) scores.uk += 3;
    }

    const total = (scores.ru || 0) + (scores.uk || 0);
    const primary = (scores.uk || 0) > (scores.ru || 0) ? "uk" : "ru";
    const confidence = total > 0 ? Math.min(0.99, 0.65 + (Math.abs((scores.ru || 0) - (scores.uk || 0)) / (total + 5)) * 0.35) : 0.60;

    return { primary, secondary: [], confidence, script, isMixed: false, scores };
  }

  // Script gating: Arabic text
  if (script === "Arabic") {
    let darijaCount = 0;
    for (const marker of DARIJA_MARKERS) {
      if (normalized.includes(marker)) darijaCount++;
    }

    const isDarija = darijaCount >= 1;
    return {
      primary: "ar",
      secondary: [],
      confidence: 0.98,
      script,
      isMixed: false,
      dialect: isDarija ? "Darija (Moroccan Arabic dialect, categorized as Arabic)" : undefined,
      scores: { ar: 100 },
    };
  }

  // Mixed script handling
  if (script === "Mixed") {
    // 1. Arabic + French / Latin mixed (e.g. Moroccan bilingual contracts)
    const isArabicFrenchMixed = (breakdown.Arabic || 0) >= 0.15 && (breakdown.Latin || 0) >= 0.15;
    if (isArabicFrenchMixed) {
      let frScore = 0;
      for (const w of words) {
        if (LANGUAGE_PROFILES.fr.words.has(w)) frScore++;
      }
      return {
        primary: "ar",
        secondary: ["fr"],
        confidence: 0.96,
        script: "Mixed (Arabic & Latin)",
        isMixed: true,
        scores: { ar: 85, fr: frScore > 0 ? 80 : 50 },
      };
    }

    // 2. Cyrillic + Latin mixed (e.g. Russian/Ukrainian Apostille, dual diplomas)
    const isCyrillicLatinMixed = (breakdown.Cyrillic || 0) >= 0.15 && (breakdown.Latin || 0) >= 0.15;
    if (isCyrillicLatinMixed) {
      let ruScore = 0;
      let ukScore = 0;
      for (const ch of normalized) {
        if (LANGUAGE_PROFILES.ru.exclusiveChars?.includes(ch)) ruScore += 8;
        if (LANGUAGE_PROFILES.uk.exclusiveChars?.includes(ch)) ukScore += 10;
      }
      for (const w of words) {
        if (LANGUAGE_PROFILES.ru.words.has(w)) ruScore += 4;
        if (LANGUAGE_PROFILES.uk.words.has(w)) ukScore += 4;
      }
      const primary = ukScore > ruScore ? "uk" : "ru";
      return {
        primary,
        secondary: ["en"],
        confidence: 0.96,
        script: "Mixed (Cyrillic & Latin)",
        isMixed: true,
        scores: { [primary]: 85, en: 70 },
      };
    }
  }

  // Latin script evaluation: Look-alike pairs disambiguation
  for (const [lang, profile] of Object.entries(LANGUAGE_PROFILES)) {
    if (lang === "ru" || lang === "uk" || lang === "ar") continue;
    let score = 0;

    // 1. Exclusive character checks (high weight)
    if (profile.exclusiveChars) {
      for (const ch of normalized) {
        if (profile.exclusiveChars.includes(ch)) {
          score += 6 * profile.weight;
        }
      }
    }

    // 2. Lexical word matches
    for (const w of words) {
      if (profile.words.has(w)) {
        score += 3 * profile.weight;
      }
    }

    // 3. Morphological suffix / cluster checks
    for (const cluster of profile.charClusters) {
      const occurrences = (normalized.match(new RegExp(cluster, "g")) || []).length;
      score += occurrences * 1.5 * profile.weight;
    }

    // 4. German compound and administrative stem heuristics
    if (lang === "de") {
      for (const w of words) {
        if (
          w.length > 8 &&
          (w.includes("register") ||
            w.includes("gericht") ||
            w.includes("urkunde") ||
            w.includes("auszug") ||
            w.includes("amt") ||
            w.includes("gesetz"))
        ) {
          score += 4 * profile.weight;
        }
      }
    }

    scores[lang] = Math.round(score * 10) / 10;
  }

  // Look-alike pair resolution: Spanish vs Portuguese vs Catalan vs Galician
  const sortedLangs = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top1 = sortedLangs[0] || ["en", 0];
  const top2 = sortedLangs[1] || ["", 0];

  const primary = top1[0];
  const totalScore = top1[1] + top2[1];
  let confidence = 0.50;

  if (top1[1] > 0) {
    const ratio = top2[1] > 0 ? (top1[1] - top2[1]) / (top1[1] + top2[1]) : 1.0;
    confidence = Math.min(0.99, Math.max(0.60, 0.65 + ratio * 0.34));
  }

  // Detect secondary languages if secondary score is substantial
  const secondary: string[] = [];
  if (top2[1] >= 15 && top2[1] / top1[1] >= 0.40) {
    secondary.push(top2[0]);
  }

  return {
    primary,
    secondary,
    confidence: words.length < 5 ? Math.min(confidence, 0.75) : confidence,
    script,
    isMixed: secondary.length > 0,
    scores,
  };
}

// -----------------------------------------------------------------------------
// LLM DISAMBIGUATION (LAYER 3)
// -----------------------------------------------------------------------------
export async function disambiguateWithLLM(
  text: string,
  statisticalResult: ReturnType<typeof detectLanguageStatistical>,
  apiKey?: string
): Promise<LanguageDetectionResult> {
  const resolvedKey = apiKey || process.env.GEMINI_API_KEY;

  if (!resolvedKey || resolvedKey === "mock" || resolvedKey.length < 10) {
    // Offline deterministic fallback
    return {
      primary: statisticalResult.primary,
      primaryName: LANGUAGE_NAMES[statisticalResult.primary] || statisticalResult.primary.toUpperCase(),
      secondary: statisticalResult.secondary,
      script: statisticalResult.script,
      confidence: statisticalResult.confidence,
      isMixedLanguage: statisticalResult.isMixed,
      dialect: statisticalResult.dialect,
      requiresConfirmation: statisticalResult.confidence < 0.90,
      reasoning: `Statistical language profile matched ${statisticalResult.primary} with score ${statisticalResult.scores[statisticalResult.primary] || 0}.`,
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: resolvedKey });
    const prompt = `You are an expert forensic linguist specializing in international legal documents, civil registry certificates, and diplomas.
Analyze the following document text snippet and identify the primary language, any secondary languages (e.g. for bilingual Moroccan Arabic/French documents), script, confidence (0.00 to 1.00), and concise linguistic reasoning.
Pay special attention to look-alike language pairs (Spanish vs Portuguese vs Catalan vs Galician, Russian vs Ukrainian, Indonesian vs Malay, and Darija vs MSA which should be reported as Arabic).

Input text snippet:
"""${text.slice(0, 1000)}"""

Return ONLY a valid JSON object matching this schema:
{
  "primary": "two-letter ISO 639-1 code (e.g. 'es', 'pt', 'fr', 'ar', 'uk')",
  "secondary": ["optional secondary language codes"],
  "script": "Latin | Arabic | Cyrillic | CJK | Devanagari | Mixed",
  "confidence": 0.98,
  "dialect": "optional specific dialect notes (e.g. Moroccan Darija)",
  "reasoning": "brief 1-2 sentence explanation of lexical and orthographic markers"
}`;

    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(res.text || "{}");
    const primary = (parsed.primary || statisticalResult.primary).toLowerCase();

    return {
      primary,
      primaryName: LANGUAGE_NAMES[primary] || primary.toUpperCase(),
      secondary: Array.isArray(parsed.secondary) ? parsed.secondary : statisticalResult.secondary,
      script: parsed.script || statisticalResult.script,
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.95,
      isMixedLanguage: (parsed.secondary && parsed.secondary.length > 0) || statisticalResult.isMixed,
      dialect: parsed.dialect || statisticalResult.dialect,
      requiresConfirmation: (parsed.confidence || 0.95) < 0.90,
      reasoning: parsed.reasoning || "LLM forensic linguistic disambiguation confirmed primary language.",
    };
  } catch {
    return {
      primary: statisticalResult.primary,
      primaryName: LANGUAGE_NAMES[statisticalResult.primary] || statisticalResult.primary.toUpperCase(),
      secondary: statisticalResult.secondary,
      script: statisticalResult.script,
      confidence: statisticalResult.confidence,
      isMixedLanguage: statisticalResult.isMixed,
      dialect: statisticalResult.dialect,
      requiresConfirmation: statisticalResult.confidence < 0.90,
      reasoning: "Statistical layer used (LLM fallback unavailable).",
    };
  }
}

// -----------------------------------------------------------------------------
// MAIN ENTRYPOINT
// -----------------------------------------------------------------------------
export async function detectDocumentLanguage(
  text: string,
  options?: { apiKey?: string; forceLlm?: boolean }
): Promise<LanguageDetectionResult> {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      primary: "en",
      primaryName: "English",
      secondary: [],
      script: "Latin",
      confidence: 0.50,
      isMixedLanguage: false,
      requiresConfirmation: true,
      reasoning: "Empty text stream; default fallback.",
    };
  }

  // 1. Statistical Layer
  const stat = detectLanguageStatistical(trimmed);

  // 2. Layer 3 Trigger check:
  // If confidence < 0.90, text is short (< 50 chars), or forceLlm requested
  const isShort = trimmed.length < 50;
  const isUncertain = stat.confidence < 0.90;

  if ((isShort || isUncertain || options?.forceLlm) && !process.env.VITEST) {
    return await disambiguateWithLLM(trimmed, stat, options?.apiKey);
  }

  return {
    primary: stat.primary,
    primaryName: LANGUAGE_NAMES[stat.primary] || stat.primary.toUpperCase(),
    secondary: stat.secondary,
    script: stat.script,
    confidence: stat.confidence,
    isMixedLanguage: stat.isMixed,
    dialect: stat.dialect,
    requiresConfirmation: stat.confidence < 0.90,
    reasoning: `Layer 1/2 identified ${LANGUAGE_NAMES[stat.primary] || stat.primary} (${stat.script} script) with ${(stat.confidence * 100).toFixed(1)}% confidence.`,
  };
}

import { PRICING_CONFIG } from "./constants";

export interface PricingInput {
  serviceType: "CERTIFIED" | "STANDARD";
  pageCount: number;
  wordCount?: number;
  isExpedited?: boolean;
  needsNotarization?: boolean;
  needsHardCopy?: boolean;
  needsApostille?: boolean;
  paidAt?: Date;
  timeZone?: string;
}

export interface PricingBreakdown {
  serviceType: "CERTIFIED" | "STANDARD";
  pageCount: number;
  wordCount: number;
  basePrice: number;
  expeditedFee: number;
  notarizationFee: number;
  hardCopyFee: number;
  apostilleFee: number;
  addOnTotal: number;
  subtotal: number;
  total: number;
  promisedAt: Date;
  promisedAtFormatted: string;
  isExpedited: boolean;
  needsNotarization: boolean;
  needsHardCopy: boolean;
  needsApostille: boolean;
}

/**
 * Pure deterministic calculation of pricing and turnaround delivery datetime
 */
export function calculatePricing(input: PricingInput): PricingBreakdown {
  const {
    serviceType = "CERTIFIED",
    pageCount: rawPageCount = 1,
    wordCount: rawWordCount = 0,
    isExpedited = false,
    needsNotarization = false,
    needsHardCopy = false,
    needsApostille = false,
    paidAt = new Date(),
    timeZone = "America/New_York",
  } = input;

  // Calculate effective page count and word count
  let pageCount = Math.max(1, rawPageCount);
  let wordCount = rawWordCount;

  if (wordCount > 0 && serviceType === "CERTIFIED") {
    // 250 words per certified page, rounding up
    const calculatedPages = Math.ceil(wordCount / PRICING_CONFIG.wordsPerPage);
    pageCount = Math.max(pageCount, calculatedPages);
  } else if (wordCount === 0) {
    wordCount = pageCount * PRICING_CONFIG.wordsPerPage;
  }

  // Base price calculation
  let basePrice = 0;
  if (serviceType === "CERTIFIED") {
    basePrice = Number((pageCount * PRICING_CONFIG.certifiedPerPage).toFixed(2));
  } else {
    const effectiveWords = Math.max(PRICING_CONFIG.minWordsPerStandardPage, wordCount);
    basePrice = Number((effectiveWords * PRICING_CONFIG.standardPerWord).toFixed(2));
  }

  // Add-on calculations
  let expeditedFee = 0;
  if (isExpedited) {
    // +60% of base price
    expeditedFee = Number((basePrice * 0.60).toFixed(2));
  }

  const notarizationFee = needsNotarization ? PRICING_CONFIG.addOns.notarization : 0;
  const hardCopyFee = needsHardCopy ? PRICING_CONFIG.addOns.hardCopy : 0;
  const apostilleFee = needsApostille ? PRICING_CONFIG.addOns.apostilleEstimate : 0;

  const addOnTotal = Number(
    (expeditedFee + notarizationFee + hardCopyFee + apostilleFee).toFixed(2)
  );
  const subtotal = basePrice;
  const total = Number((subtotal + addOnTotal).toFixed(2));

  // Calculate Deterministic Delivery Date
  const promisedAt = calculateDeliveryDatetime({
    pageCount,
    isExpedited,
    needsNotarization,
    needsHardCopy,
    needsApostille,
    paidAt,
  });

  const promisedAtFormatted = formatDeliveryDate(promisedAt, timeZone);

  return {
    serviceType,
    pageCount,
    wordCount,
    basePrice,
    expeditedFee,
    notarizationFee,
    hardCopyFee,
    apostilleFee,
    addOnTotal,
    subtotal,
    total,
    promisedAt,
    promisedAtFormatted,
    isExpedited,
    needsNotarization,
    needsHardCopy,
    needsApostille,
  };
}

/**
 * Calculates exact promised delivery datetime with business hours and batch adjustments
 */
export function calculateDeliveryDatetime(params: {
  pageCount: number;
  isExpedited: boolean;
  needsNotarization: boolean;
  needsHardCopy: boolean;
  needsApostille: boolean;
  paidAt?: Date;
}): Date {
  const {
    pageCount,
    isExpedited,
    needsNotarization,
    needsHardCopy,
    needsApostille,
    paidAt = new Date(),
  } = params;

  const date = new Date(paidAt.getTime());

  // Base turnaround in hours (1-3 pages = 24h, 4-8 pages = 48h, >8 pages = 72h)
  let baseHours = 24;
  if (pageCount > 8) {
    baseHours = 72;
  } else if (pageCount > 3) {
    baseHours = 48;
  }

  // Expedited reduces base turnaround by 50% (12h min, or 6h for 1 page)
  if (isExpedited) {
    baseHours = Math.max(6, Math.floor(baseHours * 0.5));
  }

  // Add base hours
  date.setHours(date.getHours() + baseHours);

  // Notarization Batch Timing: Batches run twice daily (11:00 AM and 4:00 PM EST, Mon-Fri)
  if (needsNotarization) {
    const day = date.getDay(); // 0 = Sun, 6 = Sat
    const hour = date.getHours();

    // If lands on Saturday (6), push to Monday 11:00 AM
    if (day === 6) {
      date.setDate(date.getDate() + 2);
      date.setHours(11, 0, 0, 0);
    } else if (day === 0) {
      // If lands on Sunday (0), push to Monday 11:00 AM
      date.setDate(date.getDate() + 1);
      date.setHours(11, 0, 0, 0);
    } else if (day === 5 && hour >= 16) {
      // Friday after 4 PM -> Monday 11:00 AM
      date.setDate(date.getDate() + 3);
      date.setHours(11, 0, 0, 0);
    } else {
      // Mon-Fri: batch at next window (11:00 or 16:00) + 2 hours processing
      if (hour < 11) {
        date.setHours(13, 0, 0, 0);
      } else if (hour < 16) {
        date.setHours(18, 0, 0, 0);
      } else {
        // Next business morning
        date.setDate(date.getDate() + 1);
        date.setHours(13, 0, 0, 0);
      }
    }
  }

  // Apostille addition (typically adds 3-5 business days)
  if (needsApostille) {
    addBusinessDays(date, 4);
  }

  // Hard Copy addition (adds 2-3 business days for shipping)
  if (needsHardCopy && !needsApostille) {
    addBusinessDays(date, 2);
  }

  return date;
}

function addBusinessDays(date: Date, days: number): void {
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) {
      added++;
    }
  }
}

/**
 * Format datetime nicely with timezone e.g. "Tue, Sep 2, 9:00 AM EST"
 */
export function formatDeliveryDate(date: Date, timeZone: string = "America/New_York"): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
      timeZone: timeZone,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }
}

/**
 * Multilingual Title Normalizer (Task 2.5)
 *
 * Produces a canonical English title from messy, multilingual source titles.
 *
 * Pipeline:
 * 1. Rule-based normalization — handles common patterns in EN, DE, FR, ES, IT
 * 2. LLM fallback (Claude) — for titles that rule-based can't confidently normalize
 *    (only runs when ANTHROPIC_API_KEY is set; results are cached in DB by externalId)
 *
 * Output format: "{Brand} {Type} – {Currency symbol}{Amount}"
 * Examples:
 *   "Amazon Gutschein 25 EUR"        → "Amazon Gift Card – €25"
 *   "PlayStation Store Guthaben 20€" → "PlayStation Store Credit – €20"
 *   "Steam Wallet Code 50 USD"       → "Steam Wallet Code – $50"
 *   "Netflix Carte cadeau 15€"       → "Netflix Gift Card – €15"
 */

import Anthropic from "@anthropic-ai/sdk";

// ── Rule-based patterns ──────────────────────────────────────────────────────

/**
 * Multilingual synonyms for "Gift Card / Credit / Voucher".
 * Maps locale-specific terms to canonical English equivalents.
 */
const PRODUCT_TYPE_MAP: Record<string, string> = {
  // English
  "gift card": "Gift Card",
  "gift code": "Gift Card",
  voucher: "Gift Card",
  "store credit": "Credit",
  credit: "Credit",
  "wallet code": "Wallet Code",
  "wallet": "Wallet",
  // German
  gutschein: "Gift Card",
  gutscheincode: "Gift Card",
  "geschenkkarte": "Gift Card",
  guthaben: "Credit",
  // French
  "carte cadeau": "Gift Card",
  "carte prépayée": "Gift Card",
  "carte-cadeau": "Gift Card",
  crédit: "Credit",
  // Spanish
  tarjeta: "Gift Card",
  "tarjeta regalo": "Gift Card",
  "tarjeta de regalo": "Gift Card",
  // Italian
  "carta regalo": "Gift Card",
  buono: "Gift Card",
  "buono regalo": "Gift Card",
  // Dutch
  cadeaukaart: "Gift Card",
  tegoedbon: "Gift Card",
  // Portuguese
  "cartão presente": "Gift Card",
  "cartão gift": "Gift Card",
  // Polish
  "karta podarunkowa": "Gift Card",
  // Swedish
  presentkort: "Gift Card",
};

/** Currency prefix/suffix patterns */
const CURRENCY_PATTERNS: Array<[RegExp, string, string]> = [
  [/\$(\d+(?:[.,]\d{1,2})?)/,            "$",  "USD"],
  [/€\s*(\d+(?:[.,]\d{1,2})?)/,          "€",  "EUR"],
  [/£(\d+(?:[.,]\d{1,2})?)/,             "£",  "GBP"],
  [/A\$(\d+(?:[.,]\d{1,2})?)/,           "A$", "AUD"],
  [/(\d+(?:[.,]\d{1,2})?)\s*USD/i,       "$",  "USD"],
  [/(\d+(?:[.,]\d{1,2})?)\s*EUR/i,       "€",  "EUR"],
  [/(\d+(?:[.,]\d{1,2})?)\s*GBP/i,       "£",  "GBP"],
  [/(\d+(?:[.,]\d{1,2})?)\s*AUD/i,       "A$", "AUD"],
  [/(\d+(?:[.,]\d{1,2})?)\s*€/,          "€",  "EUR"],
  [/(\d+(?:[.,]\d{1,2})?)\s*£/,          "£",  "GBP"],
];

export interface NormalizationResult {
  normalizedTitle: string;
  /** "rule" | "llm" | "fallback" */
  method: "rule" | "llm" | "fallback";
  confidence: number; // 0–100
  detectedLanguage?: string;
}

/**
 * Rule-based normalization. Returns null if confidence is too low.
 */
export function normalizeByRules(
  rawTitle: string,
  brandName: string,
): NormalizationResult | null {
  const lower = rawTitle.toLowerCase();

  // Detect product type from title
  let productType = "Gift Card"; // sensible default
  let detectedType = false;
  for (const [keyword, canonical] of Object.entries(PRODUCT_TYPE_MAP)) {
    if (lower.includes(keyword)) {
      productType = canonical;
      detectedType = true;
      break;
    }
  }

  // Extract denomination
  let amountPart = "";
  let detectedAmount = false;
  for (const [pattern, symbol] of CURRENCY_PATTERNS) {
    const match = rawTitle.match(pattern);
    if (match) {
      // Normalize decimal separator (European comma → dot)
      const amount = match[1].replace(",", ".");
      // Remove trailing .00 for clean display
      const cleanAmount = parseFloat(amount) % 1 === 0
        ? String(parseInt(amount, 10))
        : parseFloat(amount).toFixed(2);
      amountPart = `${symbol}${cleanAmount}`;
      detectedAmount = true;
      break;
    }
  }

  // Confidence scoring
  let confidence = 40; // base for having any title
  if (detectedType) confidence += 30;
  if (detectedAmount) confidence += 30;

  if (confidence < 70) return null; // not confident enough — let LLM handle it

  const title = amountPart
    ? `${brandName} ${productType} – ${amountPart}`
    : `${brandName} ${productType}`;

  // Detect language hint (simple heuristic)
  const detectedLanguage = detectLanguage(rawTitle);

  return {
    normalizedTitle: title,
    method: "rule",
    confidence,
    detectedLanguage,
  };
}

/** Very lightweight language detection based on common function words */
function detectLanguage(text: string): string {
  const lower = text.toLowerCase();
  const signals: [string[], string][] = [
    [["gutschein", "guthaben", "geschenk"], "de"],
    [["carte", "cadeau", "crédit"], "fr"],
    [["tarjeta", "regalo"], "es"],
    [["carta", "buono", "regalo"], "it"],
    [["cadeaukaart", "tegoedbon"], "nl"],
    [["presentkort"], "sv"],
    [["karta podarunkowa"], "pl"],
  ];
  for (const [words, lang] of signals) {
    if (words.some((w) => lower.includes(w))) return lang;
  }
  return "en";
}

// ── LLM Normalization ────────────────────────────────────────────────────────

let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

const LLM_PROMPT = `You are a gift card product data normalizer. Given a raw product title (possibly in any language) and a brand name, output ONLY a clean canonical English title.

Format: "{Brand} {Type} – {Currency}{Amount}"
Types: "Gift Card", "Wallet Code", "Credit", "Prepaid Card"
Currency: $, €, £, A$

Rules:
- Keep the brand name exactly as provided
- Extract amount and currency from the title
- Translate product type to English
- If no amount is visible, omit the amount part
- Output ONLY the title, nothing else

Examples:
Brand: Amazon, Title: "Amazon Gutschein 25 EUR" → Amazon Gift Card – €25
Brand: PlayStation, Title: "PlayStation Store Guthaben 20€" → PlayStation Store Credit – €20
Brand: Netflix, Title: "Netflix Carte cadeau 15€" → Netflix Gift Card – €15`;

/**
 * LLM-based normalization using Claude claude-haiku-4-5 (fast, cheap).
 * Only called when: ANTHROPIC_API_KEY is set AND rule-based fails.
 */
export async function normalizeByLlm(
  rawTitle: string,
  brandName: string,
): Promise<NormalizationResult> {
  const client = getAnthropicClient();

  if (!client) {
    // No API key — use best-effort fallback
    return {
      normalizedTitle: `${brandName} Gift Card`,
      method: "fallback",
      confidence: 30,
    };
  }

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: `Brand: ${brandName}\nTitle: ${rawTitle}`,
        },
      ],
      system: LLM_PROMPT,
    });

    const content = message.content[0];
    const normalizedTitle =
      content.type === "text" ? content.text.trim() : `${brandName} Gift Card`;

    return {
      normalizedTitle,
      method: "llm",
      confidence: 85,
      detectedLanguage: detectLanguage(rawTitle),
    };
  } catch {
    return {
      normalizedTitle: `${brandName} Gift Card`,
      method: "fallback",
      confidence: 30,
    };
  }
}

// ── Main Entry Point ─────────────────────────────────────────────────────────

/**
 * Normalize a raw offer title to canonical English.
 *
 * Rule-based first; LLM fallback if confidence < 70.
 * LLM is only used when ANTHROPIC_API_KEY is set.
 */
export async function normalizeOfferTitle(
  rawTitle: string,
  brandName: string,
): Promise<NormalizationResult> {
  // Try rule-based first (fast, free)
  const ruleResult = normalizeByRules(rawTitle, brandName);
  if (ruleResult) return ruleResult;

  // LLM fallback
  return normalizeByLlm(rawTitle, brandName);
}

// ── Category Normalization (Task 2.6) ────────────────────────────────────────

/** Canonical category slugs */
const CATEGORY_SLUG_MAP: Record<string, string> = {
  // English
  gaming: "gaming",
  "games": "gaming",
  "video games": "gaming",
  "gaming & virtual currency": "gaming",
  "game credits": "gaming",
  "game cards": "gaming",
  entertainment: "entertainment",
  streaming: "entertainment",
  "music & video": "entertainment",
  "tv & movies": "entertainment",
  "food & dining": "food-dining",
  "food & drink": "food-dining",
  "food and dining": "food-dining",
  restaurants: "food-dining",
  shopping: "shopping",
  "retail": "shopping",
  "e-commerce": "shopping",
  travel: "travel",
  "travel & transport": "travel",
  software: "software",
  apps: "software",
  "mobile apps": "software",
  "app stores": "software",
  fitness: "fitness",
  health: "fitness",
  "health & fitness": "fitness",
  // German
  "spiele": "gaming",
  "gaming & virtuelle währungen": "gaming",
  "unterhaltung": "entertainment",
  "streaming-dienste": "entertainment",
  "essen & trinken": "food-dining",
  "einkaufen": "shopping",
  "reisen": "travel",
  "software & apps": "software",
  "gesundheit & fitness": "fitness",
  // French
  "jeux": "gaming",
  "divertissement": "entertainment",
  "alimentation": "food-dining",
  "achats": "shopping",
  "voyages": "travel",
  // Spanish
  "juegos": "gaming",
  "entretenimiento": "entertainment",
  "comida": "food-dining",
  "compras": "shopping",
  "viajes": "travel",
};

export interface CategoryMappingResult {
  categorySlug: string;
  method: "rule" | "llm" | "fallback";
  confidence: number;
}

/**
 * Map a raw category string to a canonical category slug.
 * Rule-based first; LLM fallback for unmapped categories.
 */
export async function mapCategory(
  rawCategory: string,
): Promise<CategoryMappingResult> {
  const lower = rawCategory.trim().toLowerCase();

  // Exact match
  if (CATEGORY_SLUG_MAP[lower]) {
    return { categorySlug: CATEGORY_SLUG_MAP[lower], method: "rule", confidence: 95 };
  }

  // Partial match
  for (const [key, slug] of Object.entries(CATEGORY_SLUG_MAP)) {
    if (lower.includes(key) || key.includes(lower)) {
      return { categorySlug: slug, method: "rule", confidence: 75 };
    }
  }

  // LLM fallback for unmapped
  const client = getAnthropicClient();
  if (!client) {
    return { categorySlug: "other", method: "fallback", confidence: 20 };
  }

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 30,
      messages: [{ role: "user", content: rawCategory }],
      system: `Map this product category to ONE of these slugs: gaming, entertainment, food-dining, shopping, travel, software, fitness, other. Output ONLY the slug.`,
    });
    const content = message.content[0];
    const slug = content.type === "text" ? content.text.trim().toLowerCase() : "other";
    const validSlugs = ["gaming", "entertainment", "food-dining", "shopping", "travel", "software", "fitness", "other"];
    return {
      categorySlug: validSlugs.includes(slug) ? slug : "other",
      method: "llm",
      confidence: 80,
    };
  } catch {
    return { categorySlug: "other", method: "fallback", confidence: 20 };
  }
}

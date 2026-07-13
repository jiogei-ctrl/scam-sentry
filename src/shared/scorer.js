export const BRAND_DOMAINS = {
  paypal: "paypal.com",
  google: "google.com",
  microsoft: "microsoft.com",
  apple: "apple.com",
  amazon: "amazon.com",
  binance: "binance.com",
  coinbase: "coinbase.com"
};

const RISK_SIGNALS = [
  { id: "urgency", pattern: /\b(act now|immediately|urgent|suspend(?:ed)?|verify (?:now|today)|limited time|within \d+ (?:minutes?|hours?))\b/i, points: 10, label: "The page uses urgency language." },
  { id: "guaranteed-return", pattern: /\b(guaranteed (?:profit|return|income)|risk[- ]free (?:profit|investment)|double your money)\b/i, points: 18, label: "The page promises unusually certain financial returns." },
  { id: "gift-card", pattern: /\b(gift card|crypto(?:currency)? payment|wire transfer|usdt)\b/i, points: 12, label: "The page mentions payment methods often abused in scams." }
];

function levenshtein(left, right) {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const saved = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (left[i - 1] === right[j - 1] ? 0 : 1));
      previous = saved;
    }
  }
  return row[right.length];
}

function hostnameParts(hostname) {
  return hostname.toLowerCase().replace(/^www\./, "").split(".");
}

function addSignal(signals, id, points, label) {
  if (!signals.some((signal) => signal.id === id)) signals.push({ id, points, label });
}

export function analyzePage({ url, text = "", hasPasswordField = false, hasPaymentField = false, hasWalletPrompt = false }) {
  const signals = [];
  let parsed;
  try { parsed = new URL(url); } catch { return { score: 0, level: "unknown", signals: [] }; }
  const hostname = parsed.hostname.toLowerCase();
  const parts = hostnameParts(hostname);
  const hostnameTokens = hostname.split(/[.-]/);
  const registrable = parts.slice(-2).join(".");

  if (parsed.protocol !== "https:") addSignal(signals, "no-https", 15, "This page is not protected by HTTPS.");
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) addSignal(signals, "ip-host", 25, "The page uses an IP address instead of a normal domain name.");
  if (hostname.startsWith("xn--") || hostname.includes(".xn--")) addSignal(signals, "punycode", 20, "The domain uses punycode, which can make lookalike names harder to spot.");
  if ((hostname.match(/-/g) || []).length >= 3) addSignal(signals, "many-hyphens", 8, "The domain has an unusually high number of hyphens.");
  if (parts.length >= 5) addSignal(signals, "deep-subdomain", 8, "The URL has a deeply nested subdomain; check the actual registered domain carefully.");

  for (const [brand, domain] of Object.entries(BRAND_DOMAINS)) {
    const root = domain.split(".")[0];
    const resemblesBrand = hostnameTokens.some((part) => part !== root && part.length >= 4 && levenshtein(part, root) <= 1);
    const brandInWrongDomain = hostname.includes(root) && !hostname.endsWith(domain);
    if (resemblesBrand || brandInWrongDomain) {
      addSignal(signals, `lookalike-${brand}`, 28, `This domain resembles ${domain} but is not owned by that domain.`);
    }
  }

  for (const signal of RISK_SIGNALS) {
    if (signal.pattern.test(text)) addSignal(signals, signal.id, signal.points, signal.label);
  }
  if (hasPasswordField) addSignal(signals, "password-form", 10, "This page asks for a password; verify the domain before signing in.");
  if (hasPaymentField) addSignal(signals, "payment-form", 10, "This page includes a payment form; verify the merchant before paying.");
  if (hasWalletPrompt) addSignal(signals, "wallet", 12, "This page appears to request a cryptocurrency-wallet connection.");

  const score = Math.min(100, signals.reduce((total, signal) => total + signal.points, 0));
  const level = score >= 45 ? "high" : score >= 25 ? "caution" : "low";
  return { score, level, signals, hostname, registrable };
}

(() => {
  const BRAND_DOMAINS = { paypal: "paypal.com", google: "google.com", microsoft: "microsoft.com", apple: "apple.com", amazon: "amazon.com", binance: "binance.com", coinbase: "coinbase.com" };
  const RISK_SIGNALS = [
    { id: "urgency", pattern: /\b(act now|immediately|urgent|suspend(?:ed)?|verify (?:now|today)|limited time|within \d+ (?:minutes?|hours?))\b/i, points: 10, label: "The page uses urgency language." },
    { id: "guaranteed-return", pattern: /\b(guaranteed (?:profit|return|income)|risk[- ]free (?:profit|investment)|double your money)\b/i, points: 18, label: "The page promises unusually certain financial returns." },
    { id: "gift-card", pattern: /\b(gift card|crypto(?:currency)? payment|wire transfer|usdt)\b/i, points: 12, label: "The page mentions payment methods often abused in scams." }
  ];
  function distance(a, b) { const row = Array.from({ length: b.length + 1 }, (_, i) => i); for (let i = 1; i <= a.length; i += 1) { let prev = row[0]; row[0] = i; for (let j = 1; j <= b.length; j += 1) { const saved = row[j]; row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = saved; } } return row[b.length]; }
  function add(signals, id, points, label) { if (!signals.some((s) => s.id === id)) signals.push({ id, points, label }); }
  function analyze() {
    const parsed = new URL(location.href); const hostname = parsed.hostname.toLowerCase(); const parts = hostname.replace(/^www\./, "").split("."); const hostnameTokens = hostname.split(/[.-]/); const signals = []; const text = document.body?.innerText?.slice(0, 30000) || "";
    if (parsed.protocol !== "https:") add(signals, "no-https", 15, "This page is not protected by HTTPS.");
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) add(signals, "ip-host", 25, "The page uses an IP address instead of a normal domain name.");
    if (hostname.startsWith("xn--") || hostname.includes(".xn--")) add(signals, "punycode", 20, "The domain uses punycode, which can hide lookalike names.");
    if ((hostname.match(/-/g) || []).length >= 3) add(signals, "many-hyphens", 8, "The domain has an unusually high number of hyphens.");
    if (parts.length >= 5) add(signals, "deep-subdomain", 8, "The URL has a deeply nested subdomain.");
    for (const [brand, domain] of Object.entries(BRAND_DOMAINS)) { const root = domain.split(".")[0]; if ((hostname.includes(root) && !hostname.endsWith(domain)) || hostnameTokens.some((part) => part !== root && part.length >= 4 && distance(part, root) <= 1)) add(signals, `lookalike-${brand}`, 28, `This domain resembles ${domain} but is not owned by that domain.`); }
    for (const signal of RISK_SIGNALS) if (signal.pattern.test(text)) add(signals, signal.id, signal.points, signal.label);
    if (document.querySelector('input[type="password"]')) add(signals, "password-form", 10, "This page asks for a password; verify the domain before signing in.");
    if (document.querySelector('input[autocomplete="cc-number"], input[name*="card" i], input[name*="payment" i]')) add(signals, "payment-form", 10, "This page includes a payment form; verify the merchant before paying.");
    if (/\b(connect wallet|walletconnect|metamask)\b/i.test(text)) add(signals, "wallet", 12, "This page appears to request a cryptocurrency-wallet connection.");
    return { score: Math.min(100, signals.reduce((n, s) => n + s.points, 0)), signals };
  }
  function render(result) {
    if (result.score < 25 || document.getElementById("scam-sentry-banner")) return;
    const banner = document.createElement("aside"); banner.id = "scam-sentry-banner"; banner.setAttribute("role", "alert");
    banner.innerHTML = `<div><strong>ScamSentry: ${result.score >= 45 ? "High caution" : "Caution"}</strong><p>${result.signals[0].label}</p><details><summary>Why am I seeing this?</summary><ul>${result.signals.map((s) => `<li>${s.label}</li>`).join("")}</ul><p>These are warning signs, not proof of a scam. Verify the destination independently before sharing money or credentials.</p></details></div><button type="button" aria-label="Dismiss warning">×</button>`;
    banner.querySelector("button").addEventListener("click", () => banner.remove()); document.documentElement.append(banner);
  }
  render(analyze());
})();

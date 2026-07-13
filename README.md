# ScamSentry

> An explainable, privacy-first browser extension that helps people pause before risky online actions.

ScamSentry detects locally observable warning signals before a person shares credentials, pays, or connects a cryptocurrency wallet. It never claims that a site is safe or definitively fraudulent: it explains the signals found, so the user can make an informed decision.

## Why it exists

Online fraud is widespread, and social media is a particularly costly entry point. The [FTC reported](https://www.ftc.gov/news-events/news/press-releases/2026/04/new-ftc-data-show-people-have-lost-billions-social-media-scams) $2.1 billion in reported social-media scam losses in 2025. The [FBI's 2025 Internet Crime Report](https://www.fbi.gov/news/press-releases/cryptocurrency-and-ai-scams-bilk-americans-of-billions) recorded more than one million complaints.

## What v0.1 checks locally

- non-HTTPS and IP-address destinations
- punycode, excessive hyphens, and deep subdomains
- lookalikes of a small transparent brand list
- urgency, guaranteed-return, and high-risk payment language
- password, payment, and wallet-connection prompts

No page text, form data, screenshots, or browsing history leave the browser. Future reputation checks are deliberately opt-in.

## Try it locally

1. Clone this repository.
2. Visit `chrome://extensions` in Chrome or Edge.
3. Turn on **Developer mode** and choose **Load unpacked**.
4. Select this repository's folder.

## Development

```sh
npm test
npm run check
```

## Safety and limitations

Risk signals are not proof. A legitimate site may trigger a warning, and a scam site may trigger none. ScamSentry is a decision aid, not a replacement for a browser's built-in protections, a bank, or professional security advice.

## Roadmap

- [ ] Per-signal user controls and allowlists
- [ ] Opt-in, privacy-preserving known-threat lookup
- [ ] Internationalization and Firefox support
- [ ] Reproducible rule-pack governance and false-positive tests

## Contributing

Please include a test URL or fixture, a plain-language reason, and a false-positive assessment with every new detection rule.

## License

MIT

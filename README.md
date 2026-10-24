# Little Letters — Learn, Play, Write

A joyful, privacy-friendly alphabet learning app for Class 1 children. No account, ads, AI subscription, database or backend needed.

## What works in V1

- 26 letters, with 3 beginner words first (78 words), followed by 2 extras per letter (130 total entries).
- Picture-word lesson cards with optional text hiding and speech (device text-to-speech).
- Three games: picture matching, picture-to-word identification and tap-to-spell letter tile building.
- Stars and progress stored locally, independently for each letter. Parents can mark words written independently on paper (tracked separately from tile spelling).
- Extra 2 words unlock after completing the spelling game on **two different local calendar days**; a grown-up can override this.
- Printable A4 worksheets: trace-and-copy, missing letter, picture spelling, with optional answers and 3- or 5-word level.
- Responsive phone/tablet/desktop UI and installable Progressive Web App, including offline asset caching after first load.
- No personal data collection. Browser storage deletion resets progress.

**Teaching note:** The letter X has two accessible beginning-X words (x-ray and xylophone); box, fox and six are ending-X sound examples, *not* words beginning with X. Some emojis are conceptual hints rather than precise object illustrations. Adult supervision helps.

## Run locally

This is a static HTML/CSS/JavaScript app with no npm dependencies.

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/`. Do not open `index.html` with a `file://` URL if you want offline service-worker support.

## GitHub setup / live website

1. This project lives in **[aditya130603/learning](https://github.com/aditya130603/learning)**.
2. Go to **Settings → Pages → Build and deployment → Source: GitHub Actions** (one-time setup).
3. On `main`, the **Publish Little Letters** workflow tests and deploys the app. Check **Actions** for the deployment result.
4. When deployment succeeds, the URL is **https://aditya130603.github.io/learning/**.
5. Open the live website in Chrome on Android and choose **Install app** from the browser menu to add it to the home screen. On iPhone use Safari **Share → Add to Home Screen**. Installability depends on browser/device support and HTTPS.

The web PWA can later be packaged into an Android APK using Capacitor or Android WebView if a Play Store-native build is preferred. This repository is the actual web/PWA source, **not** an APK.

## Lessons and parental controls

1. Choose a letter and speak the three words together.
2. Do the picture game, picture-to-word recognition, then the word-builder.
3. Complete word-building again on another calendar day to unlock words 4 and 5.
4. Use **For grown-ups** to unlock 5 words early, mark independent handwriting on paper, view progress or reset device progress.
5. Generate an A4 worksheet under **Worksheets**, then use your browser's Print / Save as PDF option.

## Tech / architecture

- `index.html` – app shell
- `words.js` – editable word bank: all letters and words
- `app.js` – routing, game rules, local progress, worksheet generation, accessibility
- `styles.css` – responsive kid-friendly UI and A4 print CSS
- `assets/` – PWA icon resources
- `service-worker.js` – local offline cache of static assets
- `.github/workflows/pages.yml` – GitHub Pages deployment
- `tests/smoke.test.js` – lightweight data and static-asset smoke tests

## Limits of this version

- No cross-device sync or cloud backups; data stays on one device/browser.
- Device speech synthesis may not support a natural English-India voice, and pronunciation quality varies by operating system.
- Emoji pictures may render differently by device; illustrated SVG picture assets would be a sensible future improvement.
- Tiles help with spelling, but handwriting is practised on paper via printable worksheets.
- No age diagnostics, formal curriculum alignment certification or dyslexia screening.

# Little Learners — My First Word Garden (Ages 4–6)

A new, offline-first, picture-led English learning adventure, redesigned from scratch for young children. The live entrypoint now loads **only the age 4–6 app**. Legacy Word Mayhem code remains in the repository for recovery but is not loaded or packaged.

## Child experience

- Friendly fox guide called Pip, calm warm storybook colors, big easy-to-hit buttons, one learning objective per screen.
- Letter Garden follows A–Z, with **5 pictured and explained words per letter**.
- Each word follows **see → listen → find its picture → tap to spell → celebrate**.
- First **3 words**, then automatically open **2 bonus words**. After all five, a short picture challenge earns a letter sticker and opens the next letter.
- Every five letters, a five-question cumulative garden review makes the next group available.
- Picture Play offers a three-round recall game. Story Corner offers three tiny interactive stories. Sticker Book rewards real progress.
- Local progress saves between sessions; adult-gated settings control voice, gentle animation and reset.
- No timer, penalty, ads, server account, tracking, or heavy AI model. Speech uses Android TextToSpeech or the browser's installed speech synthesis, when available.

The 26 letters contain **130 authored vocabulary words**, with 26 letter challenges and five cumulative reviews. Certain later letters (notably Q, X and Z) are challenging and may need parent help. Words have clear picture cues and teaching facts; the current version does not claim to have 130 custom illustrations or a full phonics assessment. Illustrative emoji are used as semantic word pictures, while UI icons use a uniform vector icon system.

## Architecture

| File | Purpose |
| --- | --- |
| little-46-data.js | Word data, letter progression, review gating and pure rules |
| little-46.js | Home, lessons, games, rewards, parent controls and spoken prompts |
| little-46.css | Responsive storybook design tokens and accessible touch styling |
| index.html | New minimal entry point (no legacy scripts or styles loaded) |
| service-worker.js | Small versioned offline app-shell cache |
| scripts/package-little-46.sh | Ship only the new code and essential images |
| tests/little-46.test.js | Curriculum, quiz-choice and progression tests |
| scripts/check-little-46-ui.cjs | Real headless Chrome journey checks and mobile screenshots |

Android retains the existing lightweight Java WebView shell and minSdk 21. Only the **standard** Android build is packaged; no model downloads or emulators. Github Actions builds a universal debug-signed APK and uploads screenshots and the APK as run artifacts.

## Run locally

From the repository root, start a local server using Python 3:

    python3 -m http.server 8000

Open localhost port 8000 in a browser.

Run progression checks:

    node --test tests/little-46.test.js

Package the small static site:

    bash scripts/package-little-46.sh dist

After merge to main, GitHub Pages publishes only the dist bundle. The Android build workflow also publishes the latest testing APK at the little-learners-46 GitHub Release.

**Important:** APK build success and headless browser checks do not guarantee compatibility with all Android 5/6 WebView engines. Real-phone installation, offline pronunciation and touch testing remain required. Progress is stored locally and disappears when app data is cleared.

Design guide: design-system/little-learners-46/MASTER.md.

## Storybook illustrated design (v2)

The four primary screens now follow an illustrated woodland/garden art direction: original reusable SVG Pip fox, garden meadow, an illustrated alphabet path, a custom ant scene, functional flower-shaped letter stops, and a wooden sticker shelf whose slots accurately reflect earned progress. Styling is applied via `little-46-storybook.css` without replacing lesson logic. The reference concept is visual direction only: no non-interactive picture is substituted for buttons. All added SVGs are bundled offline inside the small Android build; other vocabulary words currently use their illustrated emoji.

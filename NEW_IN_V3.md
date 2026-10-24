# Word Mayhem × Word Atlas — v3

This upgrade keeps the original Class 1 ABC activities and the 14 authored Word Mayhem story missions. It adds a more useful advanced track and age-appropriate remote challenges. No Flutter, no paid AI API, no emulator.

## Adult / advanced teens: Word Atlas

- Ages **14–17 and 18+** enter an adult-quality illustrated, responsive Word Atlas home. The younger age tracks keep the illustrated Word Mayhem mission experience.
- **31 carefully authored advanced words** across life, relationships, culture, nature, science, technology, expression and problem-solving. Every word includes meaning, synonym, antonym, natural collocation, memory hook, realistic usage, related word form and situations where it does or does not apply.
- **12 useful idioms** with figurative meanings and example contexts.
- Each word has **six retrieval steps**: definition, synonym, antonym, collocation, contextual judgement and typed gap-fill. Wrong answers show a concise explanation. Idioms have two assessment stages.
- Local progress, XP, lesson completions and spaced review intervals. A word is counted as mastered only if the learner misses no more than one question. Retakes with mistakes return sooner.
- Large readable type, filterable word collections, original SVG visual worlds, pronunciation via device speech, reduced-motion support and mobile-sized tap targets.
- **Limitations:** authored offline question bank, not AI free-text grading or automatic advanced vocabulary generation. Quizzes use finite multiple-choice distractors.

## Kids: Visual word missions & friend challenges

- Original scalable vector illustrated scenes replace emoji-only environments for existing authored missions; outcomes visually change for success, funny semantic consequences and errors.
- Huge touch targets for the youngest children, a polished age selector, and no forced drag gestures.
- **Friend Challenge** for ages **6–13**: parent-mediated invite link to the same six deterministic questions on another device. Age 6–9 uses picture identification, age 10–13 uses definitions/synonyms/antonyms. After finishing, share a **result link** to compare scores on the original device. No sign-up, child names, chat or public leaderboard. Links are only for people known to the child.
- **Important distinction:** challenge sharing is **asynchronous across devices, not live head-to-head**. Results are included in shareable URLs, with no remote score storage or verification. For the friend to use the link, the GitHub Pages site must be deployed. The APK works offline for lessons and on-device quiz rounds, but a shared challenge opens the website.
- Live online matchmaking would require a separately hosted protected backend, identity/abuse safeguards and parent consent flow before launch. None are implied here.

## Technical compatibility and QA

- HTML/CSS/vanilla JS + Android Java WebView wrapper, minSdk 21 / Android 5.0+, no native or Flutter third-party libraries.
- `v3.css`, `scene-art.js`, `lexicon-data.js`, `word-studio.js`, `friend-challenge.js` are bundled in the PWA offline cache and Android assets.
- `node --test tests/*.test.js` checks all original games, the two-day unlock, worksheets, new vocabulary stages, idioms, challenge determinism, and APK asset inclusion.
- A GitHub Actions job builds a single debug-signed universal APK, no emulator. Build success does **not** establish compatibility with every Android System WebView version. Actual devices need testing.
- GitHub Pages must be enabled for the remote friend links. To make a production release, add signing credentials and a child-appropriate privacy/parent-consent assessment.

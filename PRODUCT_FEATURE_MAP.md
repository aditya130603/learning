# Word Mayhem — implemented feature map (v5)

## Adult (14+; optimized for 18+)

| Capability | State | Notes |
|---|---|---|
| Goal onboarding | Implemented | Discover / authority / sales & negotiation / rare words / everyday / idioms; multiple can be selected |
| Difficulty setting | Implemented | Essential prioritizes common vocabulary, Ambitious prioritizes advanced; Growing uses balanced order |
| Word lessons | Implemented | 54 curated entries with meaning, synonym, antonym, example, collocation, memory cue, pronunciation |
| Idioms | Implemented | 15 expressions with literal-vs-figurative contrast, examples and memory cues |
| Illustrated lessons | Implemented, expanding | 15 generated illustrated assets, plus individual original scalable vector art for other vocabulary/mission scenes; illustrations do not exist as unique generated images for all 54 words |
| Usage practice | Implemented | Meaning / synonym / antonym / scene judgment / guided sentence construction / write-your-own sentence |
| Error feedback | Implemented, rule-based | Identifies wrong meaning, similar/opposite answer, missing word, word order, incomplete sentence and several article patterns; does **not** claim arbitrary English grammar understanding |
| Spaced retrieval | Implemented | Review intervals 1, 3, 7, 14, 30 days; extra errors reset to 1 day |
| Learning retention | Implemented | Saved arsenal, daily word target, XP, streak, progress stored on device |
| Adult accounts / cloud sync | Not implemented | Local-only history; uninstall or app-data removal erases progress |
| AI free-writing assessment | Not implemented | Would need trustworthy contextual scoring, transparency/privacy and likely an online engine |

## Kids

| Capability | State | Notes |
|---|---|---|
| Ages 4–6 | Implemented | One large task per screen, two choices, speak, illustrated outcomes, Next, no account, no forced drag |
| Ages 7–9 | Implemented | Story missions, three age-appropriate action choices, picture/word games, worksheets |
| Ages 10–13 | Implemented | Story and grammar outcomes; synonyms and antonyms in friend challenges |
| First words / Class 1 | Implemented | A-Z cards, 3 words then 5, spell and picture matching, parent-checked handwriting, A4 worksheets |
| Friend challenge | Implemented as asynchronous | Same six deterministic questions by invite URL; safe privately shared links without chat, child accounts or open public matchmaking; result links are not verified |
| Live realtime multiplayer | Not implemented | Needs a hosted backend, room lifecycle, abuse prevention and parental protections |
| Visual story outcomes | Implemented | Scene changes on correct/semantic/grammar outcomes (model-generated images for certain base scenes; original vector for outcomes and other missions) |

## Distribution

- PWA with offline cache and Android Java WebView wrapper; Android minSdk 21 (Android 5.0+), no Flutter.
- Android Actions builds a debug-signed universal APK on push (actual old Android System WebView compatibility needs device testing).
- GitHub Pages must be enabled under Settings > Pages > GitHub Actions for browser share links to work. The APK bundles offline curriculum and offers native sharing of friend URLs.
- `node --test tests/*.test.js` exercises the original features and the v5 goal/scene/writing/child components. Tests cannot replace real-device visual and accessibility QA.

## Learning principle

Make every session answer **What does this word mean? What is it like and unlike? When is it natural? Can I use it? Will I remember it tomorrow?** For younger children, keep screens focused on a single action, reward understanding, and avoid high cognitive-load controls.

### GrammarCore v0.1 (October 2026)
- [x] Custom local grammar checks with learner-facing explanations
- [x] Candidate sentence corrections and source word identification
- [x] Small trained n-gram ranker packaged as JavaScript data; reproducible synthetic training and honest evaluation report
- [x] Offline integration into the adult free-writing coach and tile-based scenario feedback
- [x] Integrated into GitHub Pages and Android asset/caching pipelines
- [ ] Real-world independent English-learner benchmark and error analysis
- [ ] Broad spelling and syntax coverage, detailed semantic fit, nuanced register classification
- [ ] Independent physical-device Android 5–9 performance and compatibility testing

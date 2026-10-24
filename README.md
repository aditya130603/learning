# Little Letters × Word Mayhem

An offline-friendly English learning app for young children **and** older learners. No Flutter, React Native, third-party runtime, analytics, accounts or server costs.

## Choose a stage

The first screen asks who is playing. Stages are **4–6**, **7–9**, **10–13**, **14–17** and **18+**. A child can move stages at any time without losing progress; stage is a learning suggestion, not an ability diagnosis.

- **4–6:** accessible home with three large picture-first actions, large tap targets, spoken prompts, visual word tiles, three-word sentence missions. Parent-supported early reading is expected.
- **7–9:** picture/word games, five-to-seven tile sentences, funny consequences and age-appropriate grammar tips.
- **10–13:** mission-first homepage, sentence-building challenges, semantic consequences, definitions and spelling basics if needed.
- **14–17:** more precise vocabulary, warnings and science communication.
- **18+:** professional vocabulary in short decisions (e.g. mitigate losses, negotiate terms, acknowledge concerns).

## Word Mayhem playable MVP

13 **authored** missions across the five stages. Tap tiles on any device or drag them on supporting browsers; press **Make it happen**. Every mission has one helpful action and one fully grammatical yet unhelpful (often funny) action. A targeted subject–verb grammar mistake blocks execution and highlights the word in red, with a simple explanation. Each scene changes its on-screen consequence; missions offer hints, meanings, text-to-speech and persisted completion. No generic AI grammar checker is claimed: **the checker intentionally covers the authored tile sequences only.**

Scenes currently use bundled emoji-style illustrations as temporary art; custom illustrated states would make the game more production-ready. Other Word Mayhem plans such as multiplayer, coins, avatar store and unrestricted sentence input are **not** included yet.

## Original ABC lessons still work

- 26 letters, five words each: show **3 beginner words** then unlock the next **2** after successful spelling practice on two distinct days (or parent override).
- Picture matching, picture-to-word recognition, tap-to-spell letters, speech, stars and progress.
- A4 **Trace & Copy**, **Missing Letter**, and **Picture Spelling** print-ready worksheets.
- Parent checklist tracks independent handwriting separately from tile-spelling.
- No account; local device storage. The original letter progress storage key is preserved.

## Android / old phone support

`android/` is a very small native-Java WebView shell (not Flutter), minimum Android **5.0 (API 21)**. It bundles all web game files offline, uses Android's text-to-speech and print services, and has no native `.so` libraries or third-party runtime dependencies. It uses one universal APK for 32-bit/64-bit Android phones. Older Android System WebView engines and emoji fonts can still affect rendering: test on real devices. Android 4.x is **not** supported.

On every push affecting the app, `.github/workflows/android-apk.yml` builds a debug-signed sideload APK with GitHub Actions and publishes it to the `android-testing` GitHub Release. **No emulator runs.** Build success does not prove real-device compatibility. See [android/README.md](android/README.md) for detailed testing instructions.

## Use locally

Serve the project folder over HTTP (e.g. `python3 -m http.server 8000`) or open `index.html` (service worker requires HTTPS/localhost). GitHub Pages is a hosting option. The offline asset cache uses `service-worker.js`.

## Tests

```sh
node --test tests/*.test.js
```

The tests check content completeness, valid/invalid mission outcomes, age selection, completion persistence, original ABC lessons, worksheet generation, and Android build wiring.

## V5: goal-based adult studio and simplified kids UX

The latest experience ships a custom adult vocabulary engine: choose personal goals, browse 54 authored words or 15 idioms, see generated scenic artwork and per-word memory cues, practise meaning/synonyms/antonyms/real-world scenarios, assemble natural example sentences, then write an original sentence. Wrong answer feedback identifies specific errors instead of merely demanding a word count. Offline free-text feedback is deliberately limited: it is **not** an AI grammar evaluator. Lessons lead into saved-word arsenal, XP, streak and scheduled review.

Child-friendly missions now use two touch choices for ages 4–6 and three for ages 7–13, with large illustrations, a single clear goal, spoken instructions, an immediate visual result and one prominent Next button. The original alphabet and worksheets remain accessible. Shared friend challenges for ages 6–13 are asynchronous invite links, **not live rooms**.

See [PRODUCT_FEATURE_MAP.md](PRODUCT_FEATURE_MAP.md) for precise feature state, omissions, privacy and compatibility notes. App artwork includes model-generated image cutouts and distinct SVG illustrations. Android/Web offline asset bundles include all new code and image assets; CI should build the universal Android testing APK.

## GrammarCore v0.1 (offline prototype)

The Android APK and website now ship **GrammarCore**, a specialised **on-device hybrid checker**, with no Laya, cloud AI, paid API, or runtime model download. It contains hand-authored explanations for certain grammar mistakes and a separately trained, quantised-style (rounded floating-point) statistical word n-gram ranker. It is trained on synthetically generated correct/incorrect examples; the model helps compare suggested edits but the **explicit rules** determine whether an error is shown. It is not an open-ended LLM and does not yet reliably check every possible English sentence or vocabulary nuance.

Implemented checks: basic subject–verb agreement (pronouns and a curated set of nouns), indefinite articles (including common silent-H and /juː/ exceptions), double comparisons, repeated words, plus target vocabulary presence and suggested improvements. GrammarCore explains which word to change and offers a corrected sentence when a supported error is detected. When no error is found, the app explicitly **does not claim** that an unrestricted sentence is fully correct or contextually appropriate.

- Browser/Android integration: `grammar-model.js` (learned weights) → `grammar-core.js` (inference, rules, explanations) → `adult-v5.js` (feedback UI).
- Training script: `training/train_grammar_ranker.py`, requires scikit-learn on the *developer's machine only* (never on the phone).
- Documented synthetic evaluation (not general-English accuracy): `training/TRAINING_REPORT.json`.
- Regression tests: `node --test tests/*.test.js`, including known-valid examples to guard against false corrections.
- The APK build bundles both scripts with the other offline assets, and the website service worker caches them.

**Limitations:** The statistical ranker is experimental and should not be trusted as a general grammar-quality probability. Spelling, phrasal verbs, arbitrary clauses, open-ended semantic entailment and nuanced idiom usage need separate evaluation and development. No user sentences are sent to a server.

## GrammarCore Context v0.2 (24 MiB model)

GrammarCore now has optional offline **trained phrase-frequency** evidence, used alongside its original grammar rules. The data generator is `training/build_context_model.py`; dataset provenance and limitations are in `grammar-data/SOURCES.md`. The 24 MiB `grammar-context.bin` is a binary count-min sketch built from observed public text; it is not a 24 MiB neural network. Web viewers fetch it on first adult writing lesson; Android apps bundle it locally. Do not treat higher phrase-frequency rank as proof of grammatical correctness.

`node --test tests/*.test.js` executes existing and new tests. GitHub Actions downloads corpus and builds `grammar-context.bin` before building the offline APK; a guard prevents release when the source download fails or too few real sentences are observed. No emulator is involved.


## V6 — illustrated worlds and broader adult vocabulary

- Expanded curriculum: 32 new authored stories across the three kids' stages. Ages 4–6 have one clear Play story action and simple two-choice stories; 7–13 groups available missions into small themed worlds. This is a curated course, not a claim to every possible language level.
- A new 12-panel custom story illustration pack complements the existing original illustrations. Not every word has custom artwork.
- Adults have a separate Dictionary search using **Open English WordNet 2025**, CC BY 4.0. The licensed source is built into an A–Z sharded word-reference set by the CI pipeline. Senses, synonyms, POS and any original examples are provided where available. Not all words have idioms, antonyms, illustrations or authored missions. See [dictionary attribution](LICENSE-DICTIONARY.md).
- Generate the dictionary locally via `python3 scripts/build_wordnet.py --output dictionary`. GitHub Pages must be enabled to publish the web build. Online kid friend challenges are asynchronous invite games, not real-time matchmaking.
- Neural grammar correction remains deliberately deferred; GrammarCore is retained unchanged.


## Word Lab v7 — source-grounded dictionary practice

The build now creates auditable lesson plans for every OEWN dictionary sense: meaning recall, multiple-choice definition when safe alternatives are available, and cloze when an attested example uses the word exactly. Missing context or antonyms are not invented. A curated set of memory hooks and 12 illustrated scenes supplement high-value words. Generated words are not equal to 126,000 individually illustrated lessons. Review stays on-device. Read [WORDLAB_V7.md](WORDLAB_V7.md) and `dictionary-lessons/report.json` in the build output.

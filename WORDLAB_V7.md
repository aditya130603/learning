# Word Mayhem Word Lab v7 — source-backed learning at dictionary scale

This release adds **a reproducible content generation pipeline** for all words and senses in the installed Open English WordNet dictionary, with explicit limits and automated quality gates. This is not a claim that every dictionary entry now has a bespoke illustration, natural sentence, reliable antonym, etymology or personalised mnemonic.

## Content tiers

- **Source-grounded lessons (all usable dictionary senses):** word/meaning recall; source-definition multiple choice only when two plausible alternatives can be selected; source-example cloze only when the literal word is present in a sourced example. Every entry is auditable by word, sense, source and tier.
- **Curated memory lessons (first ~30 highlighted terms):** additional human-written story cues, usage examples and illustrated scenes for initial high-value vocabulary. Do not infer word origins from sound-based mnemonics.
- **Needs editorial review:** uncommon words, ambiguous meanings, missing source examples, genuine opposites, story-specific usage and images. These fields remain explicitly missing rather than fabricated.

## Android and PWA

The Android APK includes `dictionary/` and `dictionary-lessons/` letter shards. Both are generated from Open English WordNet 2025 in GitHub Actions. The website fetches shards per letter on demand; no need to parse all 126,000 words at startup. Adult dictionary Word Lab has one screen/task at a time, no network calls once dictionary shards are available.

## Build

    python3 scripts/build_wordnet.py --output dictionary
    python3 scripts/enrich_wordnet.py --dictionary dictionary --output dictionary-lessons
    python3 tests/test_enrichment.py
    node --test tests/*.test.js

The CI build aborts if word-to-lesson coverage differs or the source contains fewer than 100,000 terms. `dictionary-lessons/report.json` records counts and missing fields. All processing deterministic and source-attributed.

## Cautions

- Multiple-choice distractors from another meaning may sometimes be semantically close, despite overlap heuristics. Wrong choices should not be scored as mastery failures; authentic word recall is the stronger criterion.
- A complete source dictionary is NOT the same as a complete teacher-edited curriculum. The app should not claim 126,146 bespoke stories or illustrations.
- This pipeline does not train a neural grammar model and does not require paid APIs.
- No personal user text is uploaded. Progress is stored locally and depends on device/app storage.

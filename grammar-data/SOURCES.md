# GrammarCore training data and disclosure

**GrammarCore is not a general grammar AI.** It combines written grammar rules, a small synthetic-pair statistical model, and a 24 MiB n-gram count sketch trained on observed text. The count sketch is used only as weak evidence when comparing proposed corrections, never to certify an unrestricted sentence. Its fixed-size counters represent learned unigram, bigram and trigram frequencies; they are not dummy bytes.

## Data

The reproducible trainer (`training/build_context_model.py`) fetches licensed sources when running in GitHub Actions; the Android app does not fetch them. Sources and per-source training counts are recorded in `training/CONTEXT_REPORT.json` by the build.

- **Universal Dependencies English EWT**. © Stanford University contributors, CC BY-SA 4.0. https://github.com/UniversalDependencies/UD_English-EWT . Acknowledgement and license: https://creativecommons.org/licenses/by-sa/4.0/
- **Project Gutenberg** digitizations of public-domain classic works by Jane Austen, Charles Dickens, Arthur Conan Doyle, Mary Shelley, Lewis Carroll, Herman Melville, Mark Twain, H. G. Wells. Their reuse status can differ by jurisdiction. https://www.gutenberg.org/policy/license.html

The trainer does not ship raw book text in the APK. Users should check applicable corpus/license restrictions before redistributing the trained data commercially; this documentation is not a legal clearance.

## Sizes and evaluation

The context binary has a fixed size of 24 MiB (25,165,824 bytes), allocating 3 orders × 2 hashes × 1,048,576 uint32 counters. It can use up to 24 MiB of RAM when loaded, and the APK compresses it. The model is optional and loaded only for adult writing practice; everything continues to work if it fails to load.

Report metrics measure whether correct **unseen** corpus sentences rank above deliberately corrupted alternatives. They do **not** measure grammatical error correction on real learner sentences. Never claim perfect grammar accuracy or 99% accuracy based on these tests. Highly formal, archaic, code-switched and Indian English variants may rank poorly in a corpus dominated by old literature.

# Illustrated launch verification — 30 October 2026

App version: 1.5.0 (version code 7).
Verified implementation commit: 29ff5cd2d0c876051ecf96f381c6af719e2f88bb.
Android build: https://github.com/aditya130603/learning/actions/runs/41034887758

## Completed
- 131 Node tests passed, including existing grammar, alternative-answer and profile tests plus new curriculum, recall, hints and navigation regression tests.
- Headless Chrome journeys passed for all five age groups at 390 px, and adults at 320 and 768 px. Journeys cover catalog search, both carousel panels, recognition, hidden recall, sentence use, persistence after reload, Review, Settings, Speak, picture actions, back navigation, reduced motion and a larger root text setting. No page errors, missing HTTP resources or horizontal overflow were reported.
- Screenshots visually reviewed for adult Home, lesson, Review, Settings and Speak; younger Settings and lessons; and action frames. Corrected an age-selector event collision, search selection exception, atlas edge bleed and mobile lesson button positioning.
- Coverage: 200 distinct targets in each of 4–6, 7–9 and 10–13; 214 in each of 14–17 and 18+. Some vocabulary is intentionally shared between age bands; activities adapt by age.
- 33 offline WebP atlases (~15.1 MB) provide 200 picture entries, 428 adult story panels and 12 action frames. Captions remain accessible live text.
- Both standard and offline-AI debug APKs built successfully. Downloaded the exact run artifacts, verified all 33 atlases are packaged and the three launch JS/CSS/content files match local source byte for byte. SHA-256 values are in LAUNCH_APK_VERIFICATION.json.
- Existing learner stores were not erased or migrated destructively. New illustrated-word review uses a separate profile-scoped store; earlier progress remains accessible from Review.

## Limits / remaining device checks
- No Android emulator or physical-device test was run. Microphone permissions, Android speech/TTS, interruption, real phone rendering, installation/update signing compatibility, memory use and low-end-device responsiveness still need a physical smoke test.
- These are debug-signed installable testing APKs, not Play Store production-signed AABs.
- AI model training and model-quality work were explicitly paused. Speak remains a separate destination; this release does not claim to improve model accuracy or speed.
- Original sentences are saved as ungraded practice. Constrained recall/word ordering is checked; arbitrary English is not falsely labelled correct.
- GitHub Pages deployment failed at configure-pages because Pages is unavailable/not configured for this repository. This did not block either Android build.

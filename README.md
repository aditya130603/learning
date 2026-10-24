# Little Letters × Word Mayhem

**New in v3:** 31 advanced vocabulary lessons, 12 idioms, illustrated missions, six-step meaningful word practice, spaced reviews and link-based friend challenges for ages 6–13. See [NEW_IN_V3.md](NEW_IN_V3.md) for feature boundaries, child safety notes and Android build instructions.

An offline-friendly, age-adaptive English learning experience. No Flutter and no third-party runtime dependencies.

## Choose a learning stage

At first launch choose 4–6, 7–9, 10–13, 14–17, or 18+. Stages are recommendations, not ability tests; change stage at any time.

- 4–6: a picture-first home screen with three enormous tap targets, visual word tiles, sound assistance and three-word stories.
- 7–9: picture games, spelling and funny simple sentence missions.
- 10–13: mission-first UX, stronger vocabulary, authored grammar hints and consequence-driven sentence puzzles.
- 14–17: school-oriented vocabulary, warnings and science scenarios.
- 18+: workplace English challenges around mitigating losses, negotiating terms and responding to concerns.

## Word Mayhem playable integration

Fourteen curated offline missions. Tap tiles to build a sentence (desktop browsers also support drag-and-drop), then choose Make it happen. The scene changes to a successful or funny outcome. An authored subject–verb error stops execution and highlights the incorrect word; the player can repair and retry. Word meanings and pronunciation are available.

Scope: These are authored sentence challenges, not an unrestricted AI grammar engine. The illustrations are emoji-based placeholders pending a custom art pass. Multiplayer, coins/shop, free-form sentence parsing and generated scenes are not included in this first integration.

## Original alphabet learning preserved

All 26 letters and 130 beginner words. Start with 3 short words and unlock 2 more after spelling practice on two separate days (or by parent override). Includes picture recognition, picture-to-word matching, spelling with letters, TTS, stars and A4 writing worksheets, plus a parent handwriting checklist. Existing device progress data is preserved.

## Older phone support

The android/ project is a minimal Java Android WebView shell, minSdk 21 / Android 5.0. The APK bundles the offline game assets, requires no Flutter and no Internet permission. One universal APK covers 32-bit/64-bit phones where the installed Android System WebView can render the app. Older devices may require a WebView update; emoji/font support varies. The GitHub Actions workflow compiles and publishes a sideloadable debug APK; no emulator runs. A successful build is not proof of real-device behavior.

## Test

    node --test tests/*.test.js

For APK download and testing instructions, see android/README.md.

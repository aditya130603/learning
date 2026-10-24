# Android APK

This is a **native Java WebView wrapper, not Flutter**. It packages the existing HTML/CSS/JS vocabulary lessons into the APK as assets. Local HTTPS-style WebView interception keeps web storage working without network permission. Java provides speech through the device TextToSpeech engine and prints through Android PrintManager.

- Universal `minSdk 21` APK: Android 5.0 onwards; works with 32-bit and 64-bit phones (no native binaries).
- No AndroidX, third-party Java libraries, Flutter, Gradle plugin dependencies at runtime, account, or ads.
- All lessons, games and worksheet templates are bundled offline; the phone may need an installed English TTS voice pack for pronunciation.
- Some very old devices may have an outdated Android System WebView and may fail to run modern JS/CSS. Update WebView if possible and note the exact Android/WebView versions when reporting failures.
- Device progress is stored privately in local WebView storage and resets if app data is erased.
- No emulator is used in CI. Automated build success does not certify real hardware compatibility.

## Get APK

On successful `main` builds, GitHub Actions `Android APK - universal Android 5+` creates `little-letters-android5-plus.apk`. Download it from [GitHub Releases](https://github.com/aditya130603/learning/releases/tag/android-testing) or the Actions run's Artifacts. It is **debug-signed for private testing**, not a Play Store release.

## Optional local build

Requires Android SDK 35, JDK 17, Gradle 8.9 and Android Gradle Plugin 8.7.3. CI copies the root web assets into Android assets before building. Use:

```
gradle -p android :app:assembleDebug
```

## Real-device test checklist

Record Android version, model and Android System WebView version. Then test: installation, offline launch, navigation, letter sound, picture-matching, word-building, two-day unlock, progress after force-close, worksheet print/save-as-PDF, and screen display on small phones. A separate older-device build will only be needed if a concrete incompatibility appears.

# Optional offline speaking companion

This is actual native local inference, not a bank of scripted replies. The optional **offline** APK contains LiteRT-LM 0.18.1 and has the Android INTERNET permission removed. The **standard** APK retains the previous optional hosted backend and supports older phones. They have the same application ID and separate build artifacts. Do not install the offline APK on unsupported hardware.

## Target and limits

Offline edition: Android 12/API 31 or newer, ARM64. Designed conservatively for trying a small model on 3–4 GB RAM phones: CPU-only, 2 threads, 2,048-token context allocation, only a few recent turns included, and at most 120 generated tokens per turn. It checks for at least 1.25 GB currently available RAM before loading and unloads when paused/backgrounded. That check is a heuristic, not a guarantee against Android killing a memory-heavy app. Loading can take time, replies may be slow, and a 3 GB phone may not have enough free memory at all.

The local model is **not** trusted to certify arbitrary grammar or award mastery. Supported deterministic corrections are shown separately; general model advice can be wrong. Existing offline learning exercises still work without the model. This is a small conversational model, not cloud-level reasoning or a validated child-safety system; parent enablement and supervision remain necessary for children.

## One-time installation

1. Install `word-mayhem-offline-ai.apk` from the repository's Android testing release. If you already have an installation, check signature compatibility. Do not uninstall it just to bypass a mismatch: uninstalling deletes local progress.
2. Download **gemma3-1b-it-int4.litertlm** (approximately 584 MB) from https://huggingface.co/litert-community/Gemma3-1B-IT/tree/main . Sign in and accept the publisher's Gemma terms yourself. Do not select the .task, int8, NPU-specific, or larger variants.
3. In Home → Learners & settings → Companion setup, tap **Import downloaded model** and choose that file. Have at least 900 MB free internal storage in addition to the downloaded source file; the app copies it into its private storage. It accepts bounded-size local files; successful model initialization, not the filename alone, determines runtime compatibility. Model import can be cancelled, and temporary failed copies are deleted.
4. Enable the companion for the learner and save settings. Begin with a typed turn. No URL, provider key or device token is needed in this edition.
5. For voice, allow microphone access. An installed **on-device** English recognizer is required; Android 12 alone does not guarantee it exists. Install offline English speech support through the phone's speech provider if offered. TTS also needs a local English voice. If either is unavailable, text remains available. The app never substitutes the cloud recognizer.
6. Test a real conversation with airplane mode enabled. This physical-device verification was not performed during implementation.

The app's model-page button opens the system browser only for the one-time model download. Model files are not bundled in the APK and no model weights or publisher terms are silently downloaded/accepted. Text, selected learning memory and model inference stay on the phone in the offline edition. Voice uses the platform's dedicated on-device recognizer and a voice marked as not requiring a network connection. Session history and deletion controls remain per learner.

## Implementation and verification

- `LocalCoach.kt`: single-worker model import/inference, RAM/storage checks, bounded context/output, cancellation and resource release. Native initialization can only be released after the runtime call returns; no claim of instantaneous interruption during model loading.
- `MainActivity.java`: explicit on-device recognizer, runtime microphone permission, installed local TTS selection, model picker and JS callbacks.
- `speaking-companion.js`: offline routing has no fetch, no backend credentials and no silent online fallback. It only displays a generated reply after the native engine responds; late/cancelled responses are discarded.
- Native generation errors remain visible and preserve the learner's draft. Explicit stop and 90/95-second native/client generation deadlines are included. The small model's generated advice is labeled as fallible.
- 111 Node checks passed locally before CI submission. Native compilation is verified by the Android Actions workflow; actual inference, memory/thermal behavior, speech availability and conversation quality require a supported physical phone with the model imported. No emulator or live model execution was performed here.

References consulted:
- https://developers.google.com/edge/litert-lm/android
- https://github.com/google-ai-edge/LiteRT-LM/tree/v0.18.1/kotlin/java/com/google/ai/edge/litertlm
- https://huggingface.co/litert-community/Gemma3-1B-IT
- https://developer.android.com/reference/android/speech/SpeechRecognizer

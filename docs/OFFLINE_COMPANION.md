# Offline AI companion — 1.3.0

Install `word-mayhem-offline-ai.apk` (Android 12+, ARM64). Home → Set up AI companion → choose Mira or Arjun → **Download & enable · 345 MB**. No Hugging Face account, browser redirect, model file picker, backend, provider key or device token is required for the default flow. Children's profiles still require parent enablement. Existing imported Gemma models and all learner progress are retained until the user explicitly replaces/removes them.

## Download architecture

New default: **Qwen3-0.6B dynamic int4**, LiteRT-LM format, Apache-2.0. This replaces gated Gemma as the one-tap default; it is a different, smaller model, not fine-tuned Gemma. The optional advanced import remains for existing models.

Pinned source:
`https://huggingface.co/litert-community/Qwen3-0.6B/resolve/e6bb3e4a1eb3f663153f0c1c12b735d64be657a7/Qwen3-0.6B_dynamic_wi4b32_afp32.litertlm`

Exact size: 344,671,744 bytes (345 decimal MB / 329 MiB).
SHA-256: `03e7da1eb1108b50dffaa9bb52cc7bcbad2eb0c66ca990267f480c1e545d2856`.

Android DownloadManager handles network transfer, notifications, pause/reconnection and background continuation. The app persists the download ID and reconnects after restart. Once complete, a worker checks exact byte count and SHA-256 before atomically installing the model in private storage. Download failure or a corrupt file cannot replace an existing model. Cancel removes the partial download; a later explicit retry starts a fresh download. At least 800 MB free storage is required because verification temporarily holds both copies.

The offline APK now needs INTERNET permission **for this download**. Conversation requests still route exclusively to the local engine; WebView arbitrary remote requests and online coach configuration remain blocked. The CDN receives normal download-request information (such as IP address), not conversation text. Download uses the user's available network, including mobile data, but not roaming; the UI recommends Wi-Fi. This edition is no longer accurately described as having no network capability.

## Inference and voice

LiteRT-LM 0.18.1, CPU two threads, context 2,048 tokens, output capped at 120 tokens, short recent message window. Qwen thinking mode is disabled. A free-RAM check is a heuristic, not a guarantee: 3–4 GB phones may be slow or unable to run it. The model unloads when backgrounded; an active model download continues. Cancellation and inference deadlines are retained.

This model is not a reliable unrestricted grammar judge. Validated offline rules provide definite corrections; uncertain wording is ungraded. No new fine-tuning or claimed model-accuracy score is introduced.

Mira/Arjun character and voice choices are saved per learner. Speech uses the installed Android English voice selected in settings, with a preview. Available voices and their gender characteristics vary by device; changing artwork does not guarantee a particular gendered voice. Voice recognition uses the on-device Android API only, with editable transcripts and text fallback. Speech interruption and reduced-motion support remain.

Full Apache-2.0 licence is bundled at `assets/companions/QWEN-LICENSE.txt`. Model attribution: Qwen Team / Alibaba Cloud; LiteRT conversion distributed by litert-community. Upstream weights are quantized; no app-specific training has been performed. Relevant sources: https://huggingface.co/litert-community/Qwen3-0.6B and https://huggingface.co/Qwen/Qwen3-0.6B .

## Verification performed

The full 344,671,744-byte public model file was downloaded without credentials in this workspace; SHA-256 matched the pinned digest. This verifies the hosted file, not Android inference performance.

## Verification limits

The automated JS tests and browser tests exercise setup, character persistence, download controls, and mobile layouts using a mocked native bridge. Native compilation is checked by the Android build. DownloadManager recovery, Android TTS voice quality, low-memory inference, real microphones and animation/audio timing still require physical-device testing. No Android emulator is used. Do not uninstall an existing app to bypass a signing mismatch: uninstalling deletes local progress.

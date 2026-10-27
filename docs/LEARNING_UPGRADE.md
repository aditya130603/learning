# Word Mayhem learning upgrade

## Audit and design decisions

The repository uses deferred JavaScript modules, localStorage, a service worker and a native Java WebView shell. The latest home routes were LiveKidsV13 (ages 7–9/10–13), AdultPlacementV13 (14–17/18+) and GuidedJourneyV8 (4–6). Existing content and detailed vocabulary routes are retained.

Main weaknesses found: older children performed a word demonstration, meaning multiple-choice and spelling sequence without sentence transfer; hints/tiles could expose an answer before recall; age selection did not create separate learner identities; alphabet progression had a finite five-word bank per letter; unrestricted grammar judgments depended on rules and phrase frequencies; native Android blocked all network traffic and had no recognition interface.

## Implemented learning loops

- **4–6:** curated picture pool → listen and recognize → name/type without the printed word → parent-checked spoken use → scheduled revisit. At most one new item per selection, with at most three weak words per letter. Parents can choose letters and reset that letter's new difficulty history without deleting old curriculum progress. Letter-name/sound differences are explained, especially A/C/X. Pictures use the existing emoji vocabulary convention; the new word bank is expandable in learning-content.js.
- **7–9:** concrete subject/action scenes, robot balloon consequences and daily routines → hide example → sentence recall → reverse actors or change the action → review. Word tiles are optional help and do not count as independent recall.
- **10–13:** the same scene mechanics plus short past stories and requests, with a changed-context writing task. Existing 30 illustrated vocabulary adventures remain accessible.
- **14–17 / 18+:** routines, past events, polite requests, explaining problems and giving opinions, with concise shared controls. Existing vocabulary pathways, placement, dictionary and idioms remain accessible. Open-ended personal answers can request contextual online assessment or remain explicitly ungraded offline.

There are seven authored new concept sequences, each with a transfer prompt, alongside the existing curriculum. These are not an unlimited generated curriculum. Automatic review selection prioritizes due mistakes then unseen sequences; manual starter/stretch settings adjust scope. Hints are optional, and previously recalled concepts skip the initial demonstration. Mastery requires three different days and two contexts of independent retrieval; taps, time and recognition alone do not establish mastery. A mistake schedules an earlier revisit and clears current mastery. No claim of measured educational efficacy is made.

## Evaluation

learning-core.js separates grammar, meaning, task completion and optional style. The offline positive judgments are deliberately bounded to authored alternatives and a small scene grammar, with contraction/punctuation normalization and bought/purchased equivalence. It pinpoints simple third-person agreement and the supported yesterday/market error. Other sentences get **unknown**, not an invented error. This is validated pattern checking, not an offline general-purpose AI.

The older GrammarCore remains available in legacy vocabulary tools; its broad rules and frequency model have not become a general-purpose grammaticality classifier. The adult placement feedback now includes the exact word, replacement and corrected sentence. The new home practice uses the conservative evaluator. Online feedback goes through the coach backend and uses full task context; its accuracy depends on the configured model and must be reviewed with real learner examples.

## UI and assets

Shared, readable single-task panels, optional help, responsive controls, focus outlines, separate sound controls and device/manual reduced-motion support. Original SVG actor/prop composition handles boy/dog/robot roles, chasing, balloon inflation and popping. Practical scenes include a book, school, box, broken bus and plan. Animated AI avatar states reflect actual listening/request/playback state. Animation only moves artwork, not input hit targets. Existing artwork remains packaged.

## Profiles and preservation

profiles.js loads before learning modules. It namespaces the existing learning storage keys for new learner IDs while leaving the original unprefixed data assigned to Learner 1. Switching profiles reloads modules so cached state cannot leak across learners. Existing age bands remain unchanged. No cloud sync; clearing app data/uninstall can erase local progress. New profile names are local nicknames only.

## Companion

A real client, native recognition/TTS bridge and Node backend are included. There is no deployed service or provider credential in this repository. Without endpoint/token/consent the UI explicitly says unavailable. Native recognition uses the installed Android recognizer activity; its availability, network use and permissions are governed by that provider. The transcript is editable before any text is sent to the coach. Listening stops playback; sending stops recognition. Callback generations suppress obsolete results; requests have timeouts; background/navigation pauses resources. The backend receives text, not audio.

Pause/resume, early finish, session time, learner-turn count, correction/phrase recap, selected goals, optional recurring-error memory, memory deletion and transcript deletion are implemented. Conversation context contains recent practiced concepts; supported recurring grammar corrections make corresponding concepts due for practice. Successful conversational mastery is not inferred automatically from unverified model feedback. The model is instructed to identify as AI, avoid personal-data solicitation or dependence, and keep child content suitable. Parent-controlled enablement and external-processing consent are required before voice/online use. These controls are local settings, not a tamper-resistant parental account system.

## Verification

107 Node tests passed at implementation time, including 14 new learning/voice/backend tests. Existing curriculum tests remain passing. No emulator or simulator was launched. Browser layout verification was attempted but Chromium was absent; do not claim screenshots or rendered visual QA. Android physical-device checks still required: recognizer availability/cancellation, actual TTS callbacks, external recognition activity lifecycle, microphone privacy UX, HTTPS/CORS setup, audio interruption, font scaling, touch behavior, balloon animation and low-end performance. Live AI quality, latency, provider cost and child-conversation behavior require a configured service and real integration testing.

APK build uses the existing GitHub Actions workflow, packages all new assets, retains application ID and minSdk 21, and increases versionCode to 2. See the commit's workflow run for actual build status.

Debug APK signing remains the repository’s existing CI behavior. Before updating an installed APK, check signature compatibility; do not uninstall an existing learner installation merely to bypass a signature mismatch, because uninstall removes its local progress. A stable release signing key should be provisioned for subsequent distribution.

# Little Learners — 4–6 Design System (MASTER)

## Product intent

A child's first independent reading experience should feel like exploring a gentle, illustrated garden, not operating a dashboard. One clear objective per screen. No artificial urgency. Immediate, kind, specific feedback. Scaffolding progresses from concrete images to written letters and then cumulative recall.

Derived using the UI UX Pro Max design skill's design-first workflow and mobile quality priorities: accessibility, touch size, visual hierarchy, semantic color, layout rhythm, motion and responsive design. References: nextlevelbuilder/ui-ux-pro-max-skill, skill.md and pro-rules.md (MIT licensed). This is an authored application-specific design system rather than a claim that every skill preset was installed or executed.

## Palette and type

| Token | Hex | Role |
| --- | --- | --- |
| Paper | #FFFAF4 | Warm neutral base |
| Ink | #283550 | Primary text |
| Muted | #59677A | Secondary text |
| White | #FFFFFF | Interactive cards |
| Coral | #E77B5A | Friendly accent |
| Coral deep | #B64E33 | Emphasis, accessible dark coral |
| Peach | #FFE1CA | Warm achievement hero |
| Mint | #D8F1E5 | Learning and correctness |
| Deep mint | #23654B | Positive text |
| Lavender | #EDE4FB | Quiet question controls |
| Butter | #FFF0AD | Discovery moments |
| Pink | #FFE6E4 | Cheer accents |
| Blue | #DFEAFC | Story stage |

Typography: locally available Trebuchet MS / Arial Rounded MT Bold / system-ui / Arial. No font download, network dependency, or hidden text behind images. Body text primarily 14–16px, primary buttons 15px heavy, headlines 30–49px with reduced-width scaling. Text and controls must remain readable and touchable on 320px devices.

Spacing: use an 8px base and 4px increments; primary page gutters 22px (15px on narrow screens). Radii: buttons 16px, cards 21–24px, hero/scene 28–32px. Never exceed three primary options inside a child question.

## Components and state

- Vector icon family: consistent 2.1px strokes; semantic labels for icon-only buttons. Never use emojis as navigation icons.
- Pip fox guide: inline SVG with soft warm contour and calm expression; stage effects never interfere with the next action.
- Hero card: peach surface and one obvious action, no carousels, no background text.
- Learning card: single word image, its spoken form, one concrete fact, simple letter cue. Each phase has its own screen.
- Picture answer choices: three large picture tiles, large touch targets and visible word labels. Wrong selection gives a gentle retry, not a dead end.
- Spelling: letters are individually tap-accessible, selected letters can be undone, a hint is always available. No drag-only interaction.
- Progress: 3 words, 2 bonus words, 5-picture quiz, next letter, every five letters a group review; local progress survives relaunch.
- Rewards: a sticker for demonstrated recall, not for time spent or streak length.
- Parent panel: simple numerical gate, visible storage/speech limitations, deliberate reset confirmation.
- Navigation: three tabs (Home, Letters, Stickers), with a predictable back button.

## Accessibility and motion

- Minimum interactive target 48 CSS px whenever possible; all icon-only controls have accessible names.
- Contrast priority: text on cards and buttons should stay readable on light surfaces, not be conveyed by color alone.
- Respect viewport safe areas, minimize scrolling within an individual word, retain the CTA at the end of the lesson, allow browser back via visible back control.
- Reduced-motion CSS preference and parent-toggle are both respected.
- Voice always has written equivalent; never hide content if speech synthesis is unavailable.
- Feedback is announced with an aria-live status region. Actual screen-reader / hardware testing remains required.

## Constraints and future directions

No accounts, cloud API, ad SDK, font CDN, analytics or LLM. Existing Android Java speech bridge is reused. Keep small phones and weak CPUs in mind. The first visual milestone uses warm vector UI plus semantic illustrated-emoji cues for all 130 words; a coordinated set of 130 authored word illustrations should be a separate artistic production phase after real-child usability review.

**Never** add more animations or background objects merely to make a page look decorated. Each ornament must strengthen focus, guidance, reward or comprehension.


## Implementation guardrails: not a screenshot-based app

The approved concept is a *design specification*, not a collection of image maps.
- Story environments can use **independent illustrated background art**, but never pre-render a clickable button, alphabet letter, sticker count or progress state into that background.
- Every flower level, spelling stone, answer slot, action button, progress indicator and reward is a **real semantic DOM component**, driven by curriculum and the child's saved progress.
- Pip and vocabulary scenes are independent replaceable assets, never cropped screenshots of the complete UI. Future high-fidelity artwork should be created per illustration, without text/UI baked into the artwork.
- All interactions must still operate with images switched off, the browser resized, and the app in an offline Android WebView.

## Spelling acceptance criteria

The spelling engine is separate in \`little-46-spelling.js\` and has exhaustive unit tests.
- A word must never appear already in reading order in the tile bank, including on retries. The first tile must not equal the first target letter.
- Each attempt adds at least one **plausible distractor**; a distractor never replaces a needed letter, and repeated letters receive unique button identities.
- The letter bank changes order over attempts; it is not a predictable deterministic layout.
- For 7+ letter vocabulary, a gentle two- or three-part challenge builds toward the whole word instead of displaying an overwhelming unsorted bank.
- The challenge hides the fully spelled target word, leaving a picture and a spoken prompt, with a first-letter clue only on request or after repeated mistakes.
- An incorrect attempt produces specific supportive feedback, clears the answer and re-shuffles the letter bank. No timer, negative score or failure lockout.
- Tests require that tapping letters from left to right does **not** solve any of the 130 vocabulary words, across repeated generated rounds.

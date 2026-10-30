---
name: little-learners-ui-director
description: Design, implement, critique and test the real illustrated Little Learners ages 4–6 app using a consistent character, scene, and interactive component system. Trigger for mascot, screens, UI/UX, visual quality, illustrations, gameplay, spelling, responsive mobile, and accessibility.
user-invocable: true
---

# Little Learners — UI Director

## Purpose

Make a **real, visually exceptional, accessible learning game for ages 4–6**, using the user's approved four-screen storybook reference as the visual target. The reference has: a charming expressive orange fox Pip; layered painterly woodland scenery; winding flower path; smiling illustrated vocabulary subject; and a wooden collectible sticker cabinet. The user explicitly rejected generic cards, flat SVG placeholder drawings, screens composed of cropped mockups, and oversized/overlapping controls.

**Do not confuse source-asset quality with interface quality.** Copying hundreds of stock illustrations, adding gradients, or getting a green automated test is not enough.

## Skill collaboration

Read and follow the relevant design principles from these maintained upstream skills when available:

- UI/UX Pro Max: `nextlevelbuilder/ui-ux-pro-max-skill` — design system, mobile touch, responsive UX, color, interaction, pre-delivery rules.
- Frontend Design: `anthropics/skills/skills/frontend-design/SKILL.md` — deliberate distinctive visual direction, anti-template critique, intentional typography and composition. Respect license; refer to instructions, don't silently vendor its complete text.
- Web Design Guidelines: `vercel-labs/agent-skills/skills/web-design-guidelines/SKILL.md` — implementation audit. Read its current authoritative guidance before review.
- OpenClaw docs: `https://docs.openclaw.ai/tools/skills` — skill discovery, gating and execution.

If UI/UX Pro Max's `scripts/search.py` is installed and executable, start with `--design-system` for age 4–6 educational game + storybook, and supplement with the `ux` domain and the actual implementation stack. Otherwise apply the reviewed rules from its SKILL.md and pro-rules.md, clearly labeling this a manual application. Never claim a script ran when it did not.

## Mandatory workflow (in order)

1. **Assess current source.** Read `index.html`, `little-46.js`, `little-46-data.js`, `little-46-spelling.js`, all three CSS layers, `design-system/little-learners-46/MASTER.md`, and existing Playwright tests.
2. **Design foundations before code.** Specify the fox face/proportions and emotion states, consistent illustration shading/linework, 4–6 color tokens, type scale, spacing, cards, buttons, touch states, shadows and asset provenance. Preserve the user's approved illustration reference. Critique the proposal against it before changing source.
3. **Create a single golden screen: the spelling activity.** The screen must be fully working, look like the reference's illustrated ant lesson, and remain usable without artwork. Use one short title, artwork, one explicit Listen action, clear answer slots, mixed decoy letter bank, Undo/Mix/Hint. No oversized decorative panel. One task per viewport at common phone sizes.
4. **Verify golden screen before generalization.** Render screenshot(s) at **320×568, 375×667, 390×844, 430×932** and assess: artwork, mascot, typography, spacing, contrast, interactive elements, scroll/overlap, default/incorrect/correct/hint states. Do NOT interpret a passing test as human-level visual approval. Inspect the actual screenshot, identify defects, fix and re-render.
5. **Promote verified components.** Rebuild Home, Letter Garden and Stickers from the same tokens/visual primitives. No extra style sheets stacked merely to patch defects. Consolidate, do not increase `!important` count or CSS specificity chaos. Preserve correct old-phone WebView behavior.
6. **Validate learning behavior.** 26×5 vocabulary items, 3+2 bonus flow, letter challenges, 5-letter cumulative reviews. For spelling, no bank may show the target left-to-right; all characters remain selectable, including duplicates; plausible decoys; retries reshuffle; spoken prompt and helpful hint; long words chunked. Run `node --test tests/little-46.test.js tests/little-46-spelling.test.js`.
7. **Run browser and Android build.** `bash scripts/package-little-46.sh dist`; `scripts/check-little-46-ui.cjs`; build the **standard** Android APK without an emulator or an AI model. APK success does not prove visual quality or real-phone TTS.
8. **Produce review evidence.** Supply four real screenshots (not generated mockups), one golden-screen state comparison, checklist with remaining visual differences, asset licenses, and actual build status. Do not claim pixel-perfect similarity without side-by-side inspection.

## Strict quality gates

- The UI is real DOM and state. Artwork and backgrounds are independent reusable SVG/raster assets; never use crops from a full mockup that already contain buttons, text, alphabet letters, prize counts or progress.
- Pip must remain one recognizable fox across screens and expressions. Never mix a flat vector Pip with a high-detail painted fox and call the style consistent.
- Avoid unrelated asset-pack art styles; license provenance must be recorded. Source artwork is not a replacement for custom illustration direction.
- Interactive objects must use native `button`/input semantics, readable labels, 48px-ish Android touch targets and keyboard support where practical.
- No overlap with status/navigation bars; content may scroll on genuinely small displays, but the first meaningful learning interaction must not be hidden behind unnecessary decoration.
- Feedback must be kind and educational, not just “try again”; wrong answers shouldn't reward random guessing; avoid punishments, timers or paid flows.
- Respect `prefers-reduced-motion` and parent settings.
- Do not declare a redesign complete because assets were added or CI is green. A professional visual review is a separate hard gate.
- If one screen remains below the reference, stop adding features and improve the screen itself.

## Project-specific current findings

- CSS currently spans `little-46.css`, `little-46-storybook.css`, and `little-46-kit.css`; ~60k characters and 47 `!important` declarations. This is a maintainability and style-consistency warning, not a standalone failure proof.
- Spelling logic was repaired; do not regress randomized bank generation.
- The user rejected both flat simplified vector art and “cropped mockup with overlay buttons”. Need independent illustrations with consistent depth.
- Old Android devices matter; do not add a large engine, dependency, online font/CDN or image requests to improve aesthetics.
- The current branch is a **work-in-progress**; never merge into `main` just because automated tests pass.

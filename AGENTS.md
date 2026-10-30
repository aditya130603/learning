# Little Learners Agent Instructions

This repository contains a child-focused **ages 4–6** English-learning experience. The user-approved visual target is a charming, richly illustrated four-screen storybook world: Home with Pip the fox, Letter Garden with flower levels, word/ant lesson, and wooden sticker cabinet. Preserve the existing educational progression.

## Required skill for all UI/art work

**Read `skills/little-learners-ui-director/SKILL.md` before any task involving UI, UX, illustration, mascot, animation, components, game interaction or screenshot review.**

It applies the reviewed UI/UX Pro Max, Frontend Design and Web Design Guidelines principles. If installed as an OpenClaw workspace skill, explicitly invoke `$little-learners-ui-director`. If not installed, read the same file in the repository and follow it directly.

## Work order

First establish a true production-quality **single golden spelling screen**, screenshot-test it at old/modern phone sizes, critique against the approved storybook target, then reuse its tokens/components on Home, Garden and Stickers. Do **not** build the remaining three screens while the first remains visually unconvincing. Never present AI-generated concept artwork as a screenshot of the working app.

## Boundaries

- Preserve `little-46-data.js` and `little-46-spelling.js` behavior. Never return to trivial left-to-right letter selection.
- Keep background/scenery art separate from actual controls and child progress.
- Prefer reusable illustrated assets with one coherent visual language, documented licensing, no mockup crops.
- Maintain Android minSdk 21 and offline runtime. No unnecessary AI model or large dependency.
- For tests: `node --test tests/little-46.test.js tests/little-46-spelling.test.js`, then package and run browser UI checks. No emulator.
- Passing tests **do not certify visual quality**; review actual screenshots and report unresolved gaps.
- Keep changes on the existing rebuild branch unless explicitly asked to merge.

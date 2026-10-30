# Launch upgrade — 30 October 2026

## Findings
The app has accumulated competing routes and CSS generations. Age selection is sometimes presented as a home page, adult placement occupies the main learning tab, reviews use a different visual language, and the companion competes with the primary learning action. The latest sentence loop contains seven missions. There are useful existing dictionaries, curated definitions, profile isolation and spaced review stores; preserve these.

## Product decisions
- One lightweight shared shell: Home, Learn, Review, Speak, Settings. Home leads with learning; AI has no home card. Existing tools remain in a clearly labelled More activities area.
- Warm off-white, ink text, muted violet and sage; restrained borders, generous readable type, no decorative dashboard background or glowing controls.
- Minimum 200 distinct reachable curriculum entries per age band. Not 200 duplicates or inflections counted as separate targets.
- 4–6: hear and see concrete objects, recognise among varied options, hide the name and recall with adult support, use a short phrase. No typing required to progress.
- 7–9: picture-led everyday stories, spelling retrieval, short sentence reconstruction and a changed scene.
- 10–13: short visual situations, predict meaning, retrieve vocabulary and explain a consequence.
- 14–17: comic situations, explain a contrast, retrieve without the label, apply to school/social life.
- 18+: swipeable illustrated situations, concise meaning and usage, independent recall, practical original sentence, later review. Separate automatic recall grading from self-assessed open sentences.
- New words arrive in small sessions mixed with due items. Hints do not count as independent recall. Recognition alone never marks mastery. Store by existing learner profile and age; preserve legacy keys.
- Frame-based action demonstrations: 2–3 illustrated stills, manual next/replay, no simulated body deformation. Respect reduced motion and never move touch targets.
- One illustration per adult target with a two-beat context where assets permit; reusable story atlases are bundled offline. Captions and definitions stay live text for readability and accessibility.
- Existing private-browsing reference will not be used to imply anonymity; incognito means concealing identity, taught through a disguise instead.

## Implementation and validation
1. Curate structured age-band content, image scenes and launch coverage manifest.
2. Produce reference UI, story assets and three action frames; integrate real files.
3. Implement shared shell, catalog/search/category, comic carousel, recall/use loop, review and settings links.
4. Reuse existing speaking/settings and sentence tools behind the new navigation. Fix integration defects rather than delete useful functionality.
5. Test coverage/unique targets, assets, progress isolation, grading, hints and navigation. Headless browser checks at 320/390/768 px, text scaling and reduced motion. No emulator.
6. Build both APK variants in CI and report actual build outcome. Physical Android voice, performance and touch checks remain required. Do not claim perfection or device verification from browser tests.

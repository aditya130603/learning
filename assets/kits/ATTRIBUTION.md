# Little Learners – integrated third-party assets

## Kitbitz illustration system

**Upstream:** https://github.com/CaptExcellent/kits-library-assets

**License:** Creative Commons CC0 1.0 Universal (as stated by the upstream repository).

**Included:** individual editable SVG illustrations copied from the upstream `kits/nature-kit` and `kits/food-kit` directories into `assets/kits/nature/`:

- `tree-puffy.svg` — `BirchPuffy-Organic-V-L-Grass600.svg`
- `bush.svg` — `BushBasic-Organic-H-S-Grass600.svg`
- `bush-flowers.svg` — `BushFlowered-Organic-H-S-Grass600.svg`
- `flower-pink.svg` — `FlowerBasic-Organic-V-S-Pink500.svg`
- `flower-coral.svg` — `FlowerBasic-Organic-V-S-Orange600.svg`
- `mushroom.svg` — `MushroomFace-Organic-V-M-Yellow500.svg`
- `fern.svg` — `Fern-Organic-V-M-Green500.svg`
- `clover.svg` — `Clover-Organic-V-S-Grass600.svg`
- `cloud.svg` — `CloudBasicRight-Water-H-S-SlateWhite.svg`
- `apple.svg` — `Apple 1.svg` from `kits/food-kit`

These are independently addressable illustration objects; no pre-rendered interactive text, navigation, flower letter, score, or answer is included in the artwork. The physical files are part of the APK, and no network fetch is needed during use. Kitbitz license confirmation: https://github.com/CaptExcellent/kits-library-assets#license.

## Consistency rules

Keep new assets within the Kitbitz nature style family and the existing warm-storybook palette. Keep Pip as its own original SVG mascot. Use CC0 Kenney adventure UI only if its softer appearance passes screenshot comparison; importing unrelated sprites is not an improvement. Avoid Glitch Flash-era art in this child-first app because it does not match the current visual language and can require conversion. Document any further third-party artwork and license.

A proper front end means artwork is background/decoration, while **all progress, buttons, letter flowers, answer slots, sticker states and sounds are accessible code-driven components**.

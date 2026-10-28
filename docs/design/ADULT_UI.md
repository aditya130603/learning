# Adult UI and human companions — 1.3.0

Visual reference was generated **before** UI implementation: [reference](adult-reference.webp). Artwork uses built-in image generation, then is compressed for the app; portraits retain transparency. Prompts below document the direction. No live image generation occurs in gameplay.

Implemented design: warm white (#f8f7f3), plain white cards, muted sage (#4d7152), dark readable text, fine borders, restrained 12–18px corners. Compact Home / Learn / Speak / Review / Settings navigation. No gradients or decorative backgrounds on the updated adult screens. Existing learning routes and profile storage remain.

Home shows real due counts, practical learning, and the selected human companion. There are no fabricated streaks or sample conversation messages from the reference. Companion setup presents Mira (female) and Arjun (male), one-tap model download, and optional voice/privacy settings. Both characters provide the same learning capabilities, without gendered assumptions about topics or personality.

Portraits animate lightly during listening/thinking/speaking and display an audio-state indicator. This is state animation, **not phoneme-synchronized facial animation**. Reduced-motion preference stops the animation. Real speech uses Android TTS. Each character has a separately saved voice choice and a preview. Android does not reliably expose voice gender; the UI says so rather than falsely claiming a guaranteed male/female voice. Local English voice packages vary by phone.

## Generated asset prompts (built-in image tool)

Reference: Three flat mobile screens for Word Mayhem — Home, Speak, Choose companion. Sober, sweet, subtle, friendly adult UI; warm off-white solid background; white cards with fine pale-gray borders; muted sage buttons; dark charcoal humanist sans-serif text; compact spacing; no gradients, decorative backgrounds or phone hardware. Home: daily practice, continue learning, speaking card, bottom navigation. Speak: Mira, AI English companion label, human bust, short chat bubble, editable transcript and microphone. Choose companion: female Mira and male Arjun, medium brown skin and dark hair, sage/terracotta clothing, soft 3D clay illustration, adult proportions, not robots or babies. Download once, practise offline.

Mira: Using the female character in the reference, a centered waist-up cute adult South Asian woman with shoulder-length wavy dark brown hair, medium warm brown skin, warm brown eyes, understated gold earrings, plain muted sage crewneck sweater. Friendly calm smile, facing camera, shoulders relaxed, hands out of frame. Sophisticated soft 3D clay illustration with gentle material shading, adult proportions. Genuinely transparent background, comfortable margins, no text/UI/scenery/robot elements.

Arjun: Using the male character in the reference, a centered waist-up cute adult South Asian man, short wavy dark brown hair, medium warm brown skin, warm brown eyes, subtle beard stubble, plain muted terracotta sweater. Friendly calm smile, facing camera, relaxed shoulders, hands out of frame. Match Mira's sophisticated soft 3D clay illustration, adult proportions. Genuinely transparent background, comfortable margins, no text/UI/scenery/robot elements.

Assets: `assets/companions/mira.webp`, `assets/companions/arjun.webp`. Reference is not shipped as a screen; real HTML/CSS implements the design.

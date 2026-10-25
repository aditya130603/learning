# Word Mayhem V8 — Guided Learning and 100-Level Curricula

## Children's app flow (no adult unlock)

The age 4–6 **home screen begins in the guided alphabet path**, with one main activity at a time. For each letter A–Z:

1. A letter card introduces three words with large emoji clues, simple, checked facts and a **60-second reading window** (button to begin earlier if ready). Audio buttons pronounce individual words.
2. Picture recognition requires the child to pick the target picture; wrong choices do not advance.
3. Spelling supplies shuffled letter tiles, including one distractor. All letters must be placed correctly before progressing; mistakes can be retried.
4. Completing three words automatically unlocks the last two words of the **same letter**, with another reading card. No parent gate or manual menu needed.
5. Completing all five moves **automatically to the next letter**. Progress persists on the device.
6. Once Z is done, the primary journey continues into 74 story activities, completing a 100-activity beginner path (26 letter units + 74 follow-on activities).

For ages 7–9 and 10–13 the home screen enters 100 continuous story activities. Each set of four activities revisits a story to practise choosing an appropriate action, understanding it, grammatical agreement and meaning. The ABC path is also available as a separate adaptive flow using shorter reading windows (45 and 35 seconds respectively). Children can retry; no timer applies to the spelling or story exercises.

**Content truth:** 100 activities does NOT mean 100 separate unique story plots or individual bespoke image illustrations per age. Story material intentionally recurs for recall across four challenge types.

## Adult learning paths

Six selectable goals, each with **100 distinct targeted words/idioms**:

- Discover new words
- Sound authoritative
- Sales and negotiation
- Rare and striking vocabulary
- Everyday smart English
- Idioms and expressions

Each level progresses through a definition (from Open English WordNet for single words, or our hand-written idiom glossary with 100 independently written usage examples), meaning recall, an attested example when the dictionary provides one, and original writing using the target term. Invalid/missing entries are never assigned an invented definition. A published coverage report identifies unavailable WordNet targets. Missing terms can fall back to a labeled verified entry from the same dictionary section rather than trap the learner on a blank screen.

**Content truth:** Most levels share thematic artwork; only selected vocabulary has individually generated mnemonic art. Generic themed imagery is identified as such. Synonym and example gaps are shown transparently instead of being filled with unverifiable examples. The offline grammar checker is cautious and cannot certify naturalness or word meaning in arbitrary sentences.

## Delivery quality and compatibility

- Existing dictionary, Word Lab, GrammarCore, idioms, kid missions, asynchronous friend challenge and stored learning history are retained.
- New curriculum saves into separate versioned local storage keys, preserving older saved data.
- No Flutter, login, paid API, or new runtime dependencies.
- Android 5.0+ is a **build target**, not a guarantee for every old WebView; verify on actual devices.
- Test suite checks counts, progression, three-to-five unlocking, next-letter advancement and lack of false progression on errors.
- All generated images are original illustration assets. Attribution/licensing for WordNet data remains as described in LICENSE-DICTIONARY.md.

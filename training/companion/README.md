# Gemma grammar training experiment — blocked before model execution

Requested scope: 10 trials per existing vocabulary level. There are six adult vocabulary tracks with 100 levels, so this suite builds 6,000 trials. These curriculum levels are not CEFR proficiency bands. Children's alphabet/story activities are not included in this vocabulary benchmark.

## Actual status

- Prepared: 6,000 held-out prompts, 30 separately authored pilot training examples, a local LoRA training runner, a base/adapter inference runner, scoring, and harness tests.
- Trained Gemma weights: **none**. Model trials executed: **0**. Model mistake rate: **not measured**.
- Workspace preflight: no CUDA GPU, no torch/transformers/peft/accelerate, no authorized local Gemma training weights.
- The installed APK/model is unchanged. Existing statistical ranker/context training in this repository is not Gemma fine-tuning.

The 30-example dataset is a smoke-test pilot, not enough evidence for a production grammar model. It is assistant-authored and needs independent language review and substantial expansion with varied natural sentences before release. It includes valid conversational and regional forms to discourage false correction. Do not train on evaluation prompts or select checkpoints repeatedly against this held-out suite.

## What the 10 trials measure

Rounds 1–8 test a fixed grammar calibration set with the current vocabulary term mentioned in context: agreement, accepting correct English, paraphrase, subject/object reversal, wrong task tense, question auxiliaries, contractions, and conversational fragments. The target is quoted deliberately: this does not claim knowledge of its meaning or invent a usage for an unknown sense. These templates recur across levels; 4,800 outputs are correlated and cannot establish general grammar accuracy.

Rounds 9–10 ask for meaning/example and transfer into a dialogue. These 1,200 outputs require human review against a reliable dictionary and usage evidence. Existing authored idiom references are included; other senses must be verified by a reviewer. Repeated target words across tracks are retained because they are separate curriculum levels. Ten trials cannot establish a precise per-level error rate.

Scoring reports false rejections, missed errors, task mistakes, abstentions, runtime failures, invalid responses, missing trials and human-review requirements separately, per level and overall. A correction differing from the reference is flagged for review, not automatically marked wrong. Explanation quality also requires review. No missing trial is counted as correct, and no overall accuracy is emitted before review. Structured diagnostic prompts differ from the deployed conversational prompt; this suite alone cannot certify companion quality.

## Run on an authorized GPU machine

1. Obtain authorized **Transformers** weights for `google/gemma-3-1b-it` after accepting its publisher terms. The Android `.litertlm` file is an inference artifact, not the trainable input. Keep credentials out of this repo.
2. Install a compatible CUDA PyTorch build, Transformers with Gemma 3 support, PEFT and Accelerate in an isolated environment. Dependency/GPU execution has not been verified here; record exact package versions (`pip freeze`) and the base model revision with any real run. There is no automatic cloud provisioning or spend.
3. Run from the repository root:

```sh
node training/companion/build.mjs
python training/companion/run.py preflight --model /models/gemma-3-1b-it --output training/companion/preflight.json
python training/companion/run.py evaluate --model /models/gemma-3-1b-it --limit 10 --output training/companion/smoke.jsonl
# Only proceed after inspecting the smoke run and GPU usage.
python training/companion/run.py evaluate --model /models/gemma-3-1b-it --output training/companion/base.jsonl
python training/companion/run.py train --model /models/gemma-3-1b-it --output training/companion/adapter
python training/companion/run.py evaluate --model /models/gemma-3-1b-it --adapter training/companion/adapter --output training/companion/tuned.jsonl
python training/companion/score.py --predictions training/companion/base.jsonl --output training/companion/base-results.json
python training/companion/score.py --predictions training/companion/tuned.jsonl --output training/companion/tuned-results.json
```

The pilot uses one epoch, LoRA rank 8 on q/v projections, assistant-token loss masking, seed 42 and deterministic evaluation. It loads locally only, requires CUDA to avoid a heavy CPU job, preserves raw replies and timing, and refuses to overwrite evaluation files. FP32 is intentionally simple but memory-intensive; determine GPU requirements in the smoke test. Generation failure is recorded, never simulated. Native Android performance is a separate test.

Before release: independent review of data and outputs, compare baseline/tuned results on identical cases, add genuinely unseen natural-language tests and age-appropriate multi-turn safety/conversation tests, and verify no increase in false corrections. Merge/export/quantize to LiteRT-LM only after validating the trained adapter. Re-test the **quantized Android model** because desktop results do not establish its accuracy. No conversion or APK replacement has been performed.

## Harness verification (no model)

```sh
node training/companion/build.mjs
python -m unittest discover -s training/companion -p 'test_*.py'
python training/companion/score.py --output training/companion/results.json
```

References: https://huggingface.co/google/gemma-3-1b-it and https://huggingface.co/docs/peft/quicktour .

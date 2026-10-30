"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../little-46-data.js");

const empty = () => ({ version: 1, letters: {}, reviews: {}, sound: true });
function finishLetter(state, letter) { state.letters[letter] = { word: 5, quiz: true }; }

test("all 26 letters have exactly 5 authored picture words and teaching clues", () => {
  assert.equal(D.letters.join(""), "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  const all = [];
  for (const letter of D.letters) {
    const words = D.words[letter];
    assert.equal(words.length, 5, letter + " should have five words");
    for (const word of words) {
      assert.ok(word.text.length >= 2, word.id);
      assert.ok(word.picture.length > 0, word.id);
      assert.ok(word.clue.length >= 12, word.id);
      assert.match(word.id, /^[A-Z]-[0-4]$/);
      assert.ok(D.clean(word.text).includes(letter), "All words should contain the focus letter: " + word.text);
      all.push(word.id);
    }
  }
  assert.equal(new Set(all).size, 130);
});

test("first three and two bonus words transition to quiz", () => {
  const p = empty();
  assert.equal(D.unlocked(p, "A"), true);
  assert.equal(D.unlocked(p, "B"), false);
  assert.equal(D.wordIndex(p, "A"), 0);
  p.letters.A = { word: 3 };
  assert.equal(D.countWords(p), 3);
  assert.equal(D.wordIndex(p, "A"), 3);
  p.letters.A.word = 5;
  assert.equal(D.countWords(p), 5);
  assert.equal(D.done(p, "A"), false);
  assert.deepEqual(D.nextTask(p), { type: "letter", letter: "A" });
  p.letters.A.quiz = true;
  assert.equal(D.unlocked(p, "B"), true);
  assert.deepEqual(D.nextTask(p), { type: "letter", letter: "B" });
});

test("five-letter group review gates the next group but never blocks completed letters", () => {
  const p = empty();
  "ABCDE".split("").forEach(l => finishLetter(p, l));
  assert.equal(D.readyReview(p, 0), true);
  assert.equal(D.unlocked(p, "E"), true);
  assert.equal(D.unlocked(p, "F"), false);
  assert.deepEqual(D.nextTask(p), { type: "review", group: 0 });
  p.reviews["0"] = true;
  assert.equal(D.unlocked(p, "F"), true);
  assert.deepEqual(D.nextTask(p), { type: "letter", letter: "F" });
  assert.equal(D.letterReviewWords(0).length, 5);
  assert.equal(D.completedLetters(p), 5);
});

test("word spelling normalizes punctuation without dropping alphabet letters", () => {
  assert.equal(D.clean("x-ray"), "XRAY");
  assert.equal(D.clean("yo-yo"), "YOYO");
  assert.equal(D.clean("Ant!"), "ANT");
  assert.equal(D.clean(" "), "");
});

test("each picture question gives one target and distinct distractors", () => {
  for (const letter of D.letters) {
    const word = D.words[letter][0];
    for (let turn = 0; turn < 5; turn++) {
      const choices = D.getChoices(word, D.words[letter], 3, turn);
      assert.equal(choices.length, 3, letter + " turn " + turn);
      assert.equal(new Set(choices.map(x => x.id)).size, 3);
      assert.equal(choices.filter(x => x.id === word.id).length, 1);
      assert.equal(new Set(choices.map(x => x.picture)).size, 3, "Pictures must differ to avoid ambiguous matching");
    }
  }
});

test("completion after Z includes exactly 130 words and 26 stickers", () => {
  const p = empty();
  D.letters.forEach(letter => finishLetter(p, letter));
  for (let n = 0; n < 5; n++) p.reviews[String(n)] = true;
  assert.equal(D.countWords(p), 130);
  assert.equal(D.completedLetters(p), 26);
  assert.deepEqual(D.nextTask(p), { type: "finished" });
});

test("bonus word count is clamped even with corrupt persisted values", () => {
  const p = empty();
  p.letters.A = { word: -4 };
  assert.equal(D.wordIndex(p, "A"), 0);
  p.letters.A.word = 999;
  assert.equal(D.wordIndex(p, "A"), 5);
});

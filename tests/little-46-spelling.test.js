"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const D=require("../little-46-data.js");
const S=require("../little-46-spelling.js");
function rng(seed){let s=seed>>>0;return function(){s=(Math.imul(1664525,s)+1013904223)>>>0;return s/4294967296;};}
test("all 130 vocabulary words create genuinely mixed banks, 10 independent attempts each",()=>{
  let rounds=0;
  for(const letter of D.letters)for(const item of D.words[letter]){
    const segments=S.splitWord(item.text);
    assert.equal(segments.join(""),S.clean(item.text),item.text);
    assert.ok(segments.every(part=>part.length<=6),item.text);
    for(const part of segments)for(let seed=1;seed<=10;seed++){
      const bank=S.makeRound(part,{rng:rng(seed*313+item.id.charCodeAt(0)*7+item.id.charCodeAt(2)),bonus:seed%2===0});
      const joined=bank.tiles.map(t=>t.ch).join("");
      assert.ok(bank.tiles.length>part.length,"Requires at least one extra letter: "+item.text);
      assert.notEqual(bank.tiles[0].ch,part[0],"Tapping first bank button cannot start answer for "+item.text);
      assert.equal(joined.includes(part),false,"Answer must never appear left-to-right among mixed tiles: "+item.text);
      assert.equal(new Set(bank.tiles.map(x=>x.id)).size,bank.tiles.length,"Repeated letters still need unique tile IDs");
      const ids=[];for(const ch of part){
        const choice=bank.tiles.find(t=>t.ch===ch&&!ids.includes(t.id));
        assert.ok(choice,"Correct spelling must remain possible: "+item.text);
        ids.push(choice.id);
      }
      assert.equal(S.evaluate(part,ids,bank.tiles).correct,true,item.text);
      assert.equal(S.evaluate(part,bank.tiles.slice(0,part.length).map(x=>x.id),bank.tiles).correct,false,"Naive left-right tapping must fail: "+item.text);
      rounds++;
    }
  }
  assert.ok(rounds>=1300);
});

test("real letter choice grading distinguishes wrong first character and handles duplicates",()=>{
  const round=S.makeRound("BALL",{rng:rng(19)});
  const wrong=round.tiles.filter(t=>t.ch==="D"||t.ch==="P");
  const ids=round.tiles.slice(0,4).map(t=>t.id);
  const result=S.evaluate("BALL",ids,round.tiles);
  assert.equal(result.correct,false);
  assert.ok(result.firstMismatch>=0);
  assert.ok(result.expectedAtMismatch.length===1);
  assert.notEqual(result.submitted,"BALL");
  const ball=round.tiles.filter(t=>t.ch==="B"||t.ch==="A"||t.ch==="L");
  assert.equal(ball.filter(t=>t.ch==="L").length,2);
});

test("challenging words are divided into teachable groups rather than huge banks",()=>{
  assert.deepEqual(S.splitWord("astronaut"),["AS","TRO","NAUT"]);
  assert.deepEqual(S.splitWord("xylophone"),["XY","LO","PHONE"]);
  assert.deepEqual(S.splitWord("ant"),["ANT"]);
  assert.equal(S.splitWord("jellyfish").join(""),"JELLYFISH");
});

test("wrong-letter hints only disclose the first letter on request or after two attempts",()=>{
  assert.doesNotMatch(S.hint("ANT",0,false),/first letter is/);
  assert.match(S.hint("ANT",2,false),/first letter is A/);
  assert.match(S.hint("ANT",0,true),/first letter is A/);
});

test("shuffling changes the order across successive trials",()=>{
  const stream=rng(2026);
  const orders=Array.from({length:20},()=>S.makeRound("ANT",{rng:stream}).tiles.map(t=>t.ch).join(""));
  assert.ok(new Set(orders).size>=3,"Choices must not have a fixed arrangement");
});

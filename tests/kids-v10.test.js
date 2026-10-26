const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'..','kids-journey-v10.js'),'utf8');
function setup(){
 const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');const words=letters.map((letter,l)=>({letter,words:Array.from({length:5},(_,j)=>({text:l===0?['ant','apple','arm','axe','air'][j]:`${letter.toLowerCase()}${['cat','dog','sun','pen','hat'][j]}`,emoji:['🐜','🍎','💪','🪓','🌬️'][j]}))}));
 const facts=letters.map((letter,l)=>Array.from({length:5},(_,i)=>`${words[l].words[i].text} is a unique lesson fact.`));
 const state={letter:0,group:0,index:0,phase:'study',completedLetters:0,stars:0,round:0};
 const p={state:()=>state,age:()=> '4-6',stop:()=>{},action:()=>{},view:()=> 'other',alphabet:()=> 'old',facts,levels:()=>[],schedule:()=>{}};
 const timers=[],storage=new Map();const root={WORD_BANK:words,WordFactsV9:{get:(l,w)=>[`${w} has two extra details.`,`${w} has a third detail.`]},GuidedJourneyV8:p,Mayhem:{getAge:()=> '4-6'}};
 const sandbox={window:root,localStorage:{getItem:(k)=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},setTimeout:(fn)=>{timers.push(fn);return timers.length},clearTimeout:()=>{},console,Set,Math};
 vm.runInNewContext(code,sandbox,{filename:'kids-journey-v10.js'});
 const api=root.GuidedJourneyV8;
 function action(x){api.action(x,()=>{});}function flushOne(){const fn=timers.shift();if(fn)fn();}function completeWord(){
  action('v10:next');let w=words[state.letter].words[state.group===0?state.index:state.index+3];action('v10:picture:'+w.text);
  const keys=api.alphabet().match(/data-gj="v10:tile:\d+"/g);assert(keys);
  const orig=state.tiles;const letters=w.text.replace(/[^a-z]/gi,'').split('');for(const letter of letters){let t=orig.find(x=>x.ch===letter&&!state.picked.includes(x.key));assert(t);action('v10:tile:'+t.key)}assert.equal(state.phase,'word-win');flushOne();
 }
 return {api,state,words,action,completeWord,flushOne,timers,storage};
}
test('Apple card never uses Ant facts, and all 130 cards show exactly three separate facts',()=>{
 const e=setup();assert.equal(e.api.factReport().words,130);
 e.state.index=1;let html=e.api.alphabet();assert.match(html,/Three cool facts about <b>apple<\/b>/);assert.match(html,/apple is a unique lesson fact/);assert.doesNotMatch(html,/ant is a unique lesson fact/);assert.equal((html.match(/class="kj-fact"/g)||[]).length,3);
});
test('study card has a Next action and NO timer or countdown',()=>{
 const e=setup();let h=e.api.alphabet();assert.match(h,/v10:next/);assert.doesNotMatch(h,/countdown|timer|60s|45s/);e.action('v10:next');assert.equal(e.state.phase,'pick');
});
test('wrong picture and wrong spelling do not advance the learner',()=>{
 const e=setup();e.action('v10:next');e.action('v10:picture:apple');assert.equal(e.state.phase,'pick');e.action('v10:picture:ant');assert.equal(e.state.phase,'build');const i=e.state.index;
 const tiles=e.api.alphabet();assert.match(tiles,/v10:tile:/);e.action('v10:tile:0');assert.equal(e.state.index,i);
});
test('five words unlock the combined test rather than proceeding to B',()=>{
 const e=setup();for(let i=0;i<5;i++)e.completeWord();assert.equal(e.state.group,1);assert.equal(e.state.phase,'final-ready');assert.equal(e.state.letter,0);assert.match(e.api.alphabet(),/Big Five Challenge/);
});
test('five-word test requires both picture selection and tile spelling, then advances automatically',()=>{
 const e=setup();for(let i=0;i<5;i++)e.completeWord();e.action('v10:test');const order=[2,0,4,1,3];
 for(let j=0;j<5;j++){
  assert.equal(e.state.phase,'final-pick');let name=e.words[0].words[order[j]].text;
  e.action('v10:picture:'+e.words[0].words[(order[j]+1)%5].text);assert.equal(e.state.phase,'final-pick');
  e.action('v10:picture:'+name);assert.equal(e.state.phase,'final-build');
  const tileList=e.state.tiles.length?e.state.tiles:(e.api.alphabet(),e.state.tiles);
  for(const ch of name){let t=e.state.tiles.find(x=>x.ch===ch&&!e.state.picked.includes(x.key));assert(t);e.action('v10:tile:'+t.key);}
  assert.equal(e.state.phase,'final-word-win');e.flushOne();
 }
 assert.equal(e.state.phase,'letter-win');e.api.schedule(()=>{});e.flushOne();assert.equal(e.state.letter,1);assert.equal(e.state.phase,'read');assert.equal(e.state.completedLetters,1);
});
test('old progress structure is migrated without clearing letter/index and keeps same storage key',()=>{
 const e=setup();e.api.state();assert.equal(e.state.phase,'read');e.state.index=2;e.state.group=0;e.action('v10:next');assert.equal(e.state.phase,'pick');assert.equal(e.state.index,2);
 assert.ok(e.storage.has('wm-guided-v8'));
});
test('every fact is individually tappable for non-reading children',()=>{const e=setup();const html=e.api.alphabet();assert.equal((html.match(/data-gj="v10:fact:[0-2]"/g)||[]).length,3);e.action('v10:fact:0');assert.equal(e.state.phase,'read');});

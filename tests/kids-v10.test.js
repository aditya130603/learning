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

// Revision milestone tests: after E, J, O, T and Y, review all 25 words.
test('after completing E, child gets A–E milestone instead of opening F early',()=>{
 const e=setup();e.api.state();e.state.letter=4;e.state.completedLetters=4;e.state.phase='letter-win';
 e.action('v10:finish');
 assert.equal(e.state.letter,5);assert.equal(e.state.clusterStart,0);assert.equal(e.state.phase,'cluster-ready');
 assert.match(e.api.alphabet(),/Super Five Challenge/);
 assert.equal(e.api.clusterQuestions().length,25);
 const entries=e.api.clusterQuestions().map(x=>x.letter+':'+x.wordIndex);
 assert.equal(new Set(entries).size,25);
 for(let i=0;i<5;i++)assert.equal(entries.filter(x=>x.startsWith(i+':')).length,5);
});
test('all five-letter boundaries trigger milestones, but A to B remains automatic',()=>{
 for(const letter of [0,1,4,9,14,19,24]){
   const e=setup();e.api.state();e.state.letter=letter;e.state.phase='letter-win';e.state.completedLetters=letter;
   e.action('v10:finish');
   assert.equal(e.state.letter,letter+1);
   if((letter+1)%5===0){assert.equal(e.state.phase,'cluster-ready');assert.equal(e.state.clusterStart,letter-4);}
   else assert.equal(e.state.phase,'read');
 }
});
test('every A–E word must pass a picture challenge and scrambled spelling before F unlocks',()=>{
 const e=setup();e.api.state();e.state.letter=4;e.state.completedLetters=4;e.state.phase='letter-win';e.action('v10:finish');
 e.action('v10:cluster-start');
 assert.equal(e.state.phase,'cluster-pick');
 for(let i=0;i<25;i++){
   const q=e.api.clusterQuestion();const w=e.words[q.letter].words[q.wordIndex];
   assert.match(e.api.alphabet(),/Super Five/i);
   e.action('v10:cluster-picture:wrong');assert.equal(e.state.phase,'cluster-pick');
   e.action('v10:cluster-picture:'+w.text);assert.equal(e.state.phase,'cluster-build');
   e.api.alphabet();
   for(const ch of w.text.replace(/[^a-z]/gi,'')){const t=e.state.tiles.find(t=>t.ch===ch&&!e.state.picked.includes(t.key));assert.ok(t,'Tile '+ch+' for '+w.text);e.action('v10:cluster-tile:'+t.key);}
   assert.equal(e.state.phase,'cluster-word-win');
   e.flushOne();
   assert.equal(e.state.clusterIndex,i+1);
 }
 assert.equal(e.state.phase,'cluster-win');
 e.api.schedule(()=>{});e.flushOne();
 assert.equal(e.state.phase,'read');assert.equal(e.state.letter,5);assert.equal(e.state.completedLetters,5);
 assert.equal(e.state.clusterStart,undefined);
});
test('at Z, completing its five-word test finishes the alphabet without an extra partial milestone',()=>{
 const e=setup();e.api.state();e.state.letter=25;e.state.phase='letter-win';e.state.completedLetters=25;
 e.action('v10:finish');assert.equal(e.state.letter,26);assert.equal(e.state.phase,'complete');
});

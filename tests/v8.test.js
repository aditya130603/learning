const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function load(files,age='4-6'){
 const storage=new Map(),timers=[],app={};
 const real={setTimeout,clearTimeout,setInterval,clearInterval};
 const window={WORD_BANK:[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map((letter,i)=>({letter,words:[0,1,2,3,4].map((j)=>({text:['ant','apple','arm','axe','air'][j]+letter.toLowerCase(),emoji:'🐜'}))})),Mayhem:{getAge:()=>age},WORD_MAYHEM:{forAge:tier=>Array.from({length:25},(_,i)=>({id:tier+i,name:'Story '+i,goal:'Help the fox.',subject:'fox',winVerb:'helps',oopsVerb:'hides',badVerb:'help',scene:'🐾',rule:'One fox helps.',winText:'The fox helped!',oopsText:'The fox hid!'}))}};
 const sandbox={window,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},document:{getElementById:()=>({textContent:''})},Date,console,SpeechSynthesisUtterance:function(){},setInterval:()=>0,clearInterval:()=>{},setTimeout:(fn)=>{timers.push(fn);return timers.length},clearTimeout:()=>{}};
 files.forEach(f=>vm.runInNewContext(fs.readFileSync(path.join(root,f),'utf8'),sandbox,{filename:f}));
 return {window,timers,storage,runTimers(){while(timers.length)timers.shift()();}};
}
test('adult curriculum has exactly 100 distinct levels in every goal',()=>{
 const {window}=load(['adult-100-data.js']);
 const t=window.WordMayhemTracksV8;
 assert.deepEqual(Object.keys(t).sort(),['authority','daily','discover','idioms','persuasion','rare'].sort());
 for(const [name,levels] of Object.entries(t)){
  assert.equal(levels.length,100,name);
  assert.equal(new Set(levels.map(l=>typeof l==='string'?l:l.term)).size,100,name);
  if(name==='idioms')levels.forEach(l=>assert.ok(l.definition.length>=6));
 }
});
test('each child tier has 100 sequential study challenges',()=>{
 const {window}=load(['guided-v8.js']);
 for(const age of ['4-6','7-9','10-13']){
  const result=window.GuidedJourneyV8.levels(age);
  assert.equal(result.length,100);
  assert.equal(new Set(result.map(r=>r.id)).size,100);
  assert.equal(result[0].number,1);assert.equal(result[99].number,100);
 }
});
test('three successful word spellings automatically unlock the final two',()=>{
 const env=load(['guided-v8.js']),J=env.window.GuidedJourneyV8,s=J.state();
 function render(){};
 J.action('ready',render);
 for(let n=0;n<3;n++){
  const word=env.window.WORD_BANK[0].words[n].text;
  J.action('picture:'+word,render);
  const tiles=J.tiles();
  for(const ch of word){const t=tiles.find(x=>x.ch===ch&&!s.picked.includes(x.key));assert.ok(t);J.action('tile:'+t.key,render);}
  env.runTimers();
 }
 assert.equal(s.group,1);
 assert.equal(s.phase,'study');
 assert.equal(s.index,0);
});
test('five correct spells automatically proceed from A to B',()=>{
 const env=load(['guided-v8.js']),J=env.window.GuidedJourneyV8,s=J.state();
 function render(){};
 for(let group=0;group<2;group++){
  J.action('ready',render);
  const ws=group===0?env.window.WORD_BANK[0].words.slice(0,3):env.window.WORD_BANK[0].words.slice(3,5);
  for(const w of ws){J.action('picture:'+w.text,render);
   for(const ch of w.text){const tile=J.tiles().find(t=>t.ch===ch&&!s.picked.includes(t.key));assert.ok(tile);J.action('tile:'+tile.key,render);}env.runTimers();}
 }
 assert.equal(s.letter,1);assert.equal(s.group,0);assert.equal(s.phase,'study');
 assert.equal(s.completedLetters,1);
});
test('a wrong picture or word does not advance progress',()=>{
 const env=load(['guided-v8.js']),J=env.window.GuidedJourneyV8,s=J.state();function render(){};
 J.action('ready',render);J.action('picture:wrong',render);assert.equal(s.phase,'recognize');
 J.action('picture:anta',render);assert.equal(s.phase,'spell');
 J.action('tile:0',render);assert.equal(s.index,0);
});
test('reading durations match developmental stages',()=>{
 const env=load(['guided-v8.js']),j=env.window.GuidedJourneyV8;
 assert.equal(j.readSeconds(),60);j.previewAge('7-9');assert.equal(j.readSeconds(),45);j.previewAge('10-13');assert.equal(j.readSeconds(),35);
});
test('offline idiom lesson and adult roadmap can begin with no dictionary fetch',async()=>{
 const env=load(['adult-100-data.js','adult-roadmap-v8.js']);const r=env.window.AdultRoadmapV8;
 r.choose('idioms');await r.start(()=>{});
 assert.match(r.view(),/break the ice/);
 assert.match(r.view(),/help people feel comfortable/);
});

test('idiom course has one distinct usage example per level',()=>{
 const {window}=load(['adult-100-data.js']);const arr=window.WordMayhemTracksV8.idioms;
 assert.equal(arr.length,100);arr.forEach(x=>assert.ok(x.example.includes(' '),x.term));
 assert.equal(new Set(arr.map(x=>x.example)).size,100);
});
test('adult completion cannot be bypassed after missing target word',async()=>{
 const env=load(['adult-100-data.js','adult-roadmap-v8.js']);const r=env.window.AdultRoadmapV8;
 r.choose('idioms');await r.start(()=>{});r.handle('next');
 let n=-1;const view=r.view();const labels=[...view.matchAll(/data-ar="answer:(\d)"/g)].map(m=>Number(m[1]));
 for(const k of labels){r.handle('answer:'+k);if(r.view().includes('See the word in context.')){n=k;break;}}
 assert.notEqual(n,-1);r.handle('next');r.handle('writing','I said a completely unrelated sentence.');
 assert.doesNotMatch(r.view(),/data-ar="finish"/);
 r.handle('finish');assert.equal(r.position('idioms'),0);
});

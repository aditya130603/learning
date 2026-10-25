const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const test=require('node:test'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function boot(){
 const storage=new Map(),timers=new Map();let sequence=0;
 const bank='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter=>({letter,words:[['ant','🐜'],['apple','🍎'],['arm','💪'],['axe','🪓'],['air','🌬️']].map(([text,emoji])=>({text,emoji}))}));
 const window={WORD_BANK:bank,Mayhem:{getAge:()=> '4-6'},WORD_MAYHEM:{forAge:()=>[]}};
 const context={window,document:{getElementById:()=>({textContent:''})},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},Date,console,
 setInterval:fn=>{const id=++sequence;timers.set(id,fn);return id;},clearInterval:id=>timers.delete(id),
 setTimeout:fn=>{const id=++sequence;timers.set(id,fn);return id;},clearTimeout:id=>timers.delete(id)};
 for(const f of ['word-facts-v9.js','guided-v8.js'])vm.runInNewContext(fs.readFileSync(path.join(root,f),'utf8'),context);
 return {g:window.GuidedJourneyV8,s:window.GuidedJourneyV8.state(),facts:window.WordFactsV9,timers};
}
test('all 130 words have two extra authored facts',()=>{
 const {facts}=boot();assert.equal(facts.count,130);
 assert.deepEqual(Array.from(facts.get('A','ant')),['Ants have six legs.','Ants sometimes build nests called anthills.']);
});
test('one word at a time with exactly three facts',()=>{
 const {g}=boot(),html=g.alphabet();
 assert.match(html,/Ants have six legs/);assert.match(html,/Ants live together in colonies/);
 assert.equal((html.match(/<li>/g)||[]).length,3);
 assert.doesNotMatch(html,/An apple grows on a tree/);
});
test('correct spelling automatically moves to next word, bonus pair, and letter B even after a second render',()=>{
 const {g,s,timers}=boot();
 function render(){g.schedule(render)}
 function click(action){g.action(action,render);render()}
 function solve(word){
   s.phase='spell';s.picked=[];s.tileTarget='';s.note='';
   const ts=g.tiles();
   for(const ch of word){const i=ts.findIndex((t,i)=>t.ch===ch&&!s.picked.includes(i));assert.ok(i>=0);click('tile:'+i)}
   assert.match(s.note,/Great spelling/);
   // Simulate Android's extra render: auto-move must NOT be cancelled.
   render();
   const pending=[...timers];assert.ok(pending.length);
   for(const [id,fn] of pending){timers.delete(id);fn()}
   assert.equal(s.phase,'study');
 }
 for(const w of ['ant','apple','arm'])solve(w);
 assert.equal(s.group,1);assert.match(g.alphabet(),/axe/i);
 for(const w of ['axe','air'])solve(w);
 assert.equal(s.group,0);assert.equal(s.letter,1);assert.match(g.alphabet(),/LETTER B/);
});
test('age picker and adult mobile CSS contain layout fixes',()=>{
 const c=fs.readFileSync(path.join(root,'ux-v9.css'),'utf8');
 assert.match(c,/\.age-onboard \.age-grid/);
 assert.match(c,/\.v5-homehero/);
 assert.match(c,/max-width:600px/);
});

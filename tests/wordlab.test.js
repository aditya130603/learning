const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','dictionary-study-v7.js'),'utf8');
function boot(config={}){
 const stored={};
 const card={term:'renaissance',index:0,sense:{d:'a renewed interest in art and learning',p:'n',s:['revival'],e:'The city experienced a renaissance in painting.'}};
 const win={LexiconExplorer:{current:()=>card},localStorage:{getItem:k=>stored[k],setItem:(k,v)=>stored[k]=v},...config};
 const context={window:win,localStorage:win.localStorage,fetch:(url)=>Promise.resolve({ok:true,json:()=>Promise.resolve({'renaissance':[{i:0,p:'n',q:['a large deep lake','the act of drawing a map'],c:'The city experienced a ____ in painting.'}]})}),Date};
 vm.runInNewContext(source,context);return {win,card,stored};
}
test('lexical lesson has three steps and source-backed exercise',async()=>{
 const {win}=boot();const W=win.WordLabV7;await W.start();
 assert.match(W.lesson(),/What does/);
 const ci=W.choices({term:'renaissance',index:0,sense:{d:'a renewed interest in art and learning'},plan:{q:['a large deep lake','the act of drawing a map']}}).indexOf('a renewed interest in art and learning');
 await W.action('choice:'+ci);
 await W.action('next');assert.match(W.lesson(),/dictionary example/);
 assert.equal(W.check('renaissance'),true);
 await W.action('next');assert.match(W.lesson(),/Recall the word/);
 assert.equal(W.check('renaissance'),true);
 assert.equal(W.status().studied,1);
 await W.action('next');assert.match(W.lesson(),/Saved for spaced review/);
});
test('does not invent synonyms or antonyms when no training shard',async()=>{
 const {win}=boot();const W=win.WordLabV7;await W.start();
 assert.doesNotMatch(W.lesson(),/Antonym:/);
});
test('invalid answer is not marked mastered',async()=>{
 const {win}=boot();const W=win.WordLabV7;await W.start();const opts=W.choices({term:'renaissance',index:0,sense:{d:'a renewed interest in art and learning'},plan:{q:['a large deep lake','the act of drawing a map']}});
 await W.action('choice:'+opts.indexOf('a renewed interest in art and learning'));await W.action('next');W.check('definitely');await W.action('next');W.check('absolutely wrong');assert.equal(W.status().studied,1);
});

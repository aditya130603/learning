const test=require('node:test'), assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const dir=path.resolve(__dirname,'..');
function boot(names,age){
 const map=new Map(),window={Mayhem:{getAge:()=>age||'18+'},WordMayhemTracksV8:{idioms:[]},WordStudioV5:{items:[]},WORD_BANK:[]};
 const sandbox={window,console,localStorage:{getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)},SpeechSynthesisUtterance:function(){},fetch:undefined};
 for(const name of names)vm.runInNewContext(fs.readFileSync(path.join(dir,name),'utf8'),sandbox,{filename:name});
 return {window,map};
}
test('adult placement contains exactly ten progressively challenging words and allows unknown',()=>{
 const e=boot(['adult-placement-v13.js']);const a=e.window.AdultPlacementV13;
 assert.equal(a.quiz.length,10);assert.equal(new Set(a.quiz.map(q=>q[0])).size,10);
 for(let i=0;i<10;i++){assert.match(a.view(),new RegExp(a.quiz[i][0]));a.handle('answer:-1','',()=>{});}
 assert.equal(a.state.page,'result');assert.equal(a.bandResult().correct,0);assert.equal(a.bandResult().band,'B1');
 assert.match(a.view(),/starting estimate/);
});
test('higher placement scores select advanced material and all six tracks contain thirty distinct levels',()=>{
 const e=boot(['adult-placement-v13.js']);const a=e.window.AdultPlacementV13;
 a.quiz.forEach(q=>a.handle('answer:'+q[5],'',()=>{}));
 assert.equal(a.bandResult().correct,10);assert.equal(a.state.band,'C2');
 a.handle('result','',()=>{});
 assert.equal(a.state.page,'goals');assert.equal(a.goals.length,6);
 for(const goal of a.goals.map(x=>x[0]))for(const band of ['B1','B2','C1','C2']){
   let words=a.terms(goal,band);
   assert.equal(words.length,30,goal+' '+band);
   assert.equal(new Set(words).size,30,goal+' '+band);
 }
});
test('renaissance mnemonic honours Dead Rani revival rather than displaying a generic word-world image',()=>{
 const e=boot(['adult-placement-v13.js']);const a=e.window.AdultPlacementV13;
 a.state.page='lesson';a.state.band='B1';a.state.goal='rare';a.state.done.rare=a.terms('rare','B1').indexOf('renaissance');
 a.load(()=>{});
 const h=a.view();
 assert.match(h,/DEAD RANI/);assert.match(h,/BREATH/);assert.match(h,/renaissance.webp/);
});
test('both older-kid ages include thirty unique illustrated action lessons',()=>{
 for(const age of ['7-9','10-13']){
  const e=boot(['live-kids-v13.js'],age),k=e.window.LiveKidsV13,items=k.levels(age);
  assert.equal(items.length,30);assert.equal(new Set(items.map(x=>x[0])).size,30);
  assert.match(k.view(),/k13-svg/);assert.match(k.view(),/data-k13="activate"/);
 }
});
test('balloon inflates visually on tap, then learner must choose meaning and spell it',()=>{
 const e=boot(['live-kids-v13.js'],'7-9'),k=e.window.LiveKidsV13,s=k.state();
 assert.match(k.view(),/rx="31"/);
 k.handle('activate',()=>{});
 assert.equal(s.stage,1);assert.match(k.view(),/rx="75"/);
 k.handle('next',()=>{});assert.equal(s.stage,2);
 k.handle('meaning:1',()=>{});assert.equal(s.stage,2);
 k.handle('meaning:0',()=>{});assert.equal(s.stage,3);
 k.view();
 const name='inflate';
 for(const ch of name){const i=s.tiles.findIndex((x,j)=>x===ch&&!s.picks.includes(j));assert.ok(i>=0);k.handle('tile:'+i,()=>{});}
 assert.equal(s.stage,4);k.handle('complete',()=>{});assert.equal(s.level,1);assert.equal(s.stage,0);
});
test('adult and child new core screens link to the installed offline app shell',()=>{
 const index=fs.readFileSync(path.join(dir,'index.html'),'utf8');
 const src=fs.readFileSync(path.join(dir,'app.js'),'utf8');
 const workflow=fs.readFileSync(path.join(dir,'.github/workflows/android-apk.yml'),'utf8');
 for(const name of ['adult-placement-v13.js','live-kids-v13.js','learning-v13.css']){
  assert.match(index,new RegExp(name.replaceAll('.','[.]')));
  assert.match(workflow,new RegExp(name.replaceAll('.','[.]')));
 }
 assert.match(src,/AdultPlacement.handle/);assert.match(src,/LiveKids.handle/);
});

const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
function boot(files,setup={}){const window={...setup};const sandbox={window,console};for(const f of files)vm.runInNewContext(fs.readFileSync(path.join(root,f),'utf8'),sandbox);return window;}
test('new stories cover all three child bands with distinct IDs',()=>{
 const w=boot(['mission-content.js','mission-expansion-v6.js']);
 assert.equal(w.WordMayhemExtended.added,32);
 const ids=w.WORD_MAYHEM.missions.map(x=>x.id);
 assert.equal(new Set(ids).size,ids.length);
 for(const age of ['4-6','7-9','10-13'])assert.ok(w.WORD_MAYHEM.forAge(age).length>=10);
});
test('mission grammar rejects singular base verb and accepts correct action',()=>{
 const w=boot(['mission-content.js','mission-expansion-v6.js']);
 const m=w.WORD_MAYHEM.missions.find(x=>x.id==='architect-bridge');
 assert.equal(w.WORD_MAYHEM.evaluate(m,['The','architect','reinforce','the','supports']).type,'grammar');
 assert.equal(w.WORD_MAYHEM.evaluate(m,['The','architect','reinforces','the','supports']).type,'win');
});
test('scene pack returns image layout without emoji placeholder',()=>{
 const w=boot(['scene-pack-v6.js']);const s=w.ScenePackV6.html('renaissance','win','Art');
 assert.match(s,/sp-scene/);assert.match(s,/sp-success/);assert.match(s,/background-position/);
});
test('dictionary search rejects invalid tokens rather than displaying fabricated definitions',async()=>{
 const w=boot(['lexicon-v6.js']);const accepted=await w.LexiconExplorer.lookup('1@@@');
 assert.equal(accepted,false);assert.match(w.LexiconExplorer.view(),/English word or phrase/);
});
test('kids age 4–6 gets one primary story CTA without a scrolling level map',()=>{
 const stub={age:()=> '4-6',hub:()=>'',state:{stars:2,completed:{}},count:()=>0};
 const W={KidV5:stub,WORD_MAYHEM:{forAge:()=>[{id:'test',name:'Help the dog',goal:'Feed the dog'}]},ScenePackV6:{html:()=>'<div class="sp-scene"></div>'}};
 const w=boot(['kids-polish-v6.js'],W);
 const html=w.KidV5.hub();assert.match(html,/data-k5="next"/);assert.doesNotMatch(html,/kp-worlds/);
});

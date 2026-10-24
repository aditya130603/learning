const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const w={};
vm.runInNewContext(fs.readFileSync(path.join(root,'mission-content.js'),'utf8'),{window:w});
const data=w.WordMayhemData;
test('all stages have multiple curated missions',()=>{
 assert.equal(data.ages.length,5);
 for(const age of data.ages)assert.ok(data.forAge(age.id).length>=2,age.id);
 assert.ok(data.missions.length>=13);
});
test('grammar errors block, grammatical bad choices execute funny scenes',()=>{
 for(const m of data.missions){
  let start=['The',m.subject],end=m.object;
  assert.equal(data.evaluate(m,start.concat([m.winVerb],end)).type,'win',m.id);
  assert.equal(data.evaluate(m,start.concat([m.oopsVerb],end)).type,'oops',m.id);
  const bad=data.evaluate(m,start.concat([m.badVerb],end));
  assert.equal(bad.type,'grammar',m.id);
  assert.equal(bad.at,2,m.id);
  assert.equal(data.evaluate(m,[]).type,'incomplete',m.id);
 }
});
test('mission progression and selected age persist offline',()=>{
 const db=new Map(),win={WordMayhemData:data};
 const context={window:win,localStorage:{getItem:k=>db.get(k)||null,setItem:(k,v)=>db.set(k,v)},console};
 vm.runInNewContext(fs.readFileSync(path.join(root,'mayhem.js'),'utf8'),context);
 const g=win.Mayhem;
 assert.match(g.welcome(),/Who is playing today/);
 assert.equal(g.setAge('4-6'),true);
 assert.equal(g.choose('kitten'),true);
 for(const i of [0,1,4])g.tile(i);
 g.action('execute');assert.match(g.play(),/wm-error/);
 g.remove(2);g.tile(2);g.action('execute');
 assert.match(g.play(),/Mission saved/);
 assert.equal(g.count(),1);
 g.setAge('18+');assert.equal(g.count(),0);
 assert.match(g.hub(),/project budget/);
 assert.equal(JSON.parse(db.get('little-letters-mayhem-v1')).finished.kitten,true);
});
test('new scripts are included in Android and PWA offline builds',()=>{
 const ci=fs.readFileSync(path.join(root,'.github/workflows/android-apk.yml'),'utf8');
 const sw=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
 assert.match(ci,/mission-content\.js mayhem\.js/);
 assert.match(sw,/mission-content\.js/);
 assert.match(sw,/mayhem\.js/);
});

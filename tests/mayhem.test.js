const fs=require('node:fs');
const assert=require('node:assert/strict');
const test=require('node:test');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const game=require('../mission-content.js');

test('every age level offers authored story missions',()=>{
  for(const age of game.ages){
    const ms=game.forAge(age.id);
    assert.ok(ms.length>=2,age.id);
    assert.ok(ms.every(m=>m.tiles.length===(m.object?7:5)));
    assert.ok(ms.every(m=>m.win && m.oops && m.rule && m.meaning));
  }
});
test('successful grammar, valid funny semantics and localized grammar errors',()=>{
  for(const m of game.missions){
    const start=['The',m.subject];const rest=m.object||[];
    assert.equal(game.evaluate(m,[...start,m.winVerb,...rest]).type,'win',m.id);
    assert.equal(game.evaluate(m,[...start,m.oopsVerb,...rest]).type,'oops',m.id);
    const wrong=game.evaluate(m,[...start,m.badVerb,...rest]);
    assert.equal(wrong.type,'grammar',m.id);
    assert.equal(wrong.at,2,m.id);
    assert.match(wrong.message,/\w/);
    assert.equal(game.evaluate(m,[]).type,'incomplete');
  }
});

test('age selection, sentence building, repair and persisted success',()=>{
 const local=new Map(),window={WORD_MAYHEM:game,scrollTo(){}};
 const context={window,localStorage:{getItem:k=>local.get(k)||null,setItem:(k,v)=>local.set(k,v)},console};
 vm.runInNewContext(fs.readFileSync(path.join(root,'mayhem.js'),'utf8'),context);
 const m=window.Mayhem;
 assert.equal(m.getAge(),null);
 assert.equal(m.chooseAge('4-6'),true);
 assert.equal(m.chooseAge('17-29'),false);
 assert.equal(m.getAge(),'4-6');
 m.select('kitten');
 assert.match(m.play(),/Wake the kitten/);
 for(const i of [0,1,4])m.pickTile(i);
 m.runAction('execute');
 assert.match(m.play(),/Fix the grammar/);
 assert.match(m.play(),/wrong-word/);
 m.removeTile(2);m.pickTile(2);
 m.runAction('execute');
 assert.match(m.play(),/MISSION SAVED/);
 assert.equal(m.count(),1);
 assert.equal(JSON.parse(local.get('little-letters-mayhem-v1')).finished.kitten,true);
 m.chooseAge('18+');
 assert.match(m.hub(),/mitigate|Save the project budget/i);
 assert.equal(m.count(),0);
});

test('offline android workflow packages both new scripts',()=>{
  const workflow=fs.readFileSync(path.join(root,'.github/workflows/android-apk.yml'),'utf8');
  const service=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
  assert.match(workflow,/cp index\.html app\.js words\.js mission-content\.js mayhem\.js/);
  assert.match(workflow,/node --test tests\/\*\.test\.js/);
  assert.match(service,/mission-content\.js/);
  assert.match(service,/mayhem\.js/);
});

const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
test('dictionary recall, saved words and wrong-answer feedback',async()=>{
  const saved={};const window={};
  const localStorage={getItem:k=>saved[k]||null,setItem:(k,v)=>saved[k]=v};
  const data={meticulous:[{d:'Marked by extreme care',p:'a',s:['careful'],e:'She keeps meticulous records.'}]};
  const fetch=()=>Promise.resolve({ok:true,json:()=>Promise.resolve(data)});
  const sandbox={window,fetch,localStorage,Promise};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../lexicon-v6.js'),'utf8'),sandbox);
  const explorer=window.LexiconExplorer;
  assert.equal(await explorer.lookup('meticulous'),true);
  explorer.toggleSave();
  assert.match(saved['word-mayhem-dictionary-saved-v1'],/meticulous/);
  explorer.start();
  assert.match(explorer.view(),/Can you remember/);
  assert.equal(explorer.grade('meticulus'),false);
  assert.equal(explorer.grade('meticulous'),true);
  explorer.stop();
  assert.match(explorer.view(),/extreme care/);
});
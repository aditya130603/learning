const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const env={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'words.js'),'utf8'),env);
const bank=env.window.WORD_BANK;
assert.equal(bank.length,26);
for(let i=0;i<26;i++){
  assert.equal(bank[i].letter,String.fromCharCode(65+i));
  assert.equal(bank[i].words.length,5);
  for(const word of bank[i].words){assert.match(word.text,/^[a-z-]+$/);assert.ok(word.emoji);}
}
for(let i=0;i<26;i++) if(i!==23){assert.ok(bank[i].words.every(w=>w.text.toUpperCase().startsWith(bank[i].letter)),`Unexpected starting letter in ${bank[i].letter}`);}
assert.deepEqual(Array.from(bank[23].words.map(w=>w.text.startsWith('x'))),[true,true,false,false,false]);
for(const asset of ['index.html','styles.css','app.js','words.js','mission-content.js','mayhem.js','manifest.webmanifest','service-worker.js','assets/icon-192.png','assets/icon-512.png','.github/workflows/pages.yml'])assert.ok(fs.existsSync(path.join(root,asset)),asset);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.match(html,/app\.js/);assert.match(html,/words\.js/); assert.match(html,/mayhem\.js/);
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
assert.equal(manifest.display,'standalone');
console.log('✓ Passed: alphabet data, X exception, required files, PWA manifest');

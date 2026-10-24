'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const window={};
const context={window,console,Date,Math,localStorage:{getItem:()=>null,setItem:()=>{}}};
for(const file of ['lexicon-data.js','grammar-model.js','grammar-core.js','adult-v5.js']) vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
const gc=window.GrammarCore;
function corrections(s){return gc.check(s).issues.map(i=>[i.word.toLowerCase(),i.replacement.toLowerCase()]);}
const errors=[
  ['She mitigate the risks carefully.','She mitigates the risks carefully.'],
  ['They mitigates the risks.','They mitigate the risks.'],
  ['He are very careful.','He is very careful.'],
  ['I is ready.','I am ready.'],
  ['You is welcome.','You are welcome.'],
  ['Our students is here.','Our students are here.'],
  ['The child have a book.','The child has a book.'],
  ['He do not know.','He does not know.'],
  ['They doesn\'t know.','They don\'t know.'],
  ['A honest person spoke.','An honest person spoke.'],
  ['It was an university.','It was a university.'],
  ['She gave a eloquent reply.','She gave an eloquent reply.'],
  ['The answer is more better.','The answer is better.'],
  ['The the dog is sleeping.','The dog is sleeping.'],
  ['The dog run.','The dog runs.'],
];
for(const [before,after] of errors)test('grammar correction: '+before,()=>{const r=gc.check(before);assert.equal(r.suggested,after);assert.ok(r.issues.length);for(const i of r.issues)assert.ok(i.explanation.length>20);});
const valid=[
 'This is a useful plan.',
 'She is meticulous in her work.',
 'The city is experiencing a cultural renaissance.',
 'The committee presented a cogent argument.',
 'They are mitigating risks through careful planning.',
 'He can mitigate the risks.',
 'I have an honest suggestion.',
 'She has a unique perspective.',
 'The child walks to school.',
 'They have been waiting for a long time.',
 'We are studying together.',
];
for(const sentence of valid)test('does not rewrite correct sentence: '+sentence,()=>{const r=gc.check(sentence);assert.equal(r.issues.length,0);assert.equal(r.suggested,sentence);assert.equal(r.canCertify,false);});
test('trained statistical weights are loaded and actually used',()=>{
 assert.ok(gc.modelBytes>1000);
 assert.notEqual(gc.score('She is careful.'),gc.score('She are careful.'));
 const r=gc.check('She are careful.');
 assert.equal(typeof r.issues[0].modelDelta,'number');
});
test('word knowledge is passed to writing coach; not mistaken for grammar certainty',()=>{
 const word=window.WordStudioV5.items.find(x=>x.id==='renaissance');
 const missing=gc.check('The town came back to life.',{entry:word});assert.equal(missing.hasTarget,false);
 const valid=gc.check('A cultural renaissance transformed the district.',{entry:word});assert.equal(valid.hasTarget,true);assert.equal(valid.canCertify,false);
 const app=window.WordStudioV5;app.action('open:word:renaissance');app.ui.step=6;
 app.checkWriting('An renaissance transform the town.');
 assert.equal(app.ui.feedback.good,false);
 assert.match(app.ui.feedback.suggested,/A renaissance transforms the town/);
 assert.match(app.lesson(),/Suggested revision/);
});
test('model fits under 50 MB and is in browser+Android offline lists',()=>{
 const files=['grammar-core.js','grammar-model.js'];const total=files.reduce((s,f)=>s+fs.statSync(path.join(root,f)).size,0);assert.ok(total<50*1024*1024);const html=fs.readFileSync(path.join(root,'index.html'),'utf8');const workflow=fs.readFileSync(path.join(root,'.github/workflows/android-apk.yml'),'utf8');const sw=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');for(const file of files){assert.ok(html.includes(file));assert.ok(workflow.includes(file));assert.ok(sw.includes(file));}
});

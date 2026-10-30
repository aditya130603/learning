const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function setup(age='18+'){
 const saved={},el={value:''};let selected=age;
 const window={Mayhem:{getAge:()=>selected,speak(){}},AdultExperience:{icon:()=>'<svg></svg>'},LearningUpgrade:{state:{motion:true}},scrollTo(){}};
 const ctx={window,localStorage:{getItem:k=>saved[k]||null,setItem:(k,v)=>saved[k]=v},document:{getElementById:()=>el,querySelector:()=>null},matchMedia:()=>({matches:true})};
 for(const f of ['launch-content.js','launch-studio.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),ctx);
 const s=window.LaunchStudio;s.sync();return {window,s,el,saved,age:a=>selected=a,handle:a=>s.handle(a,()=>{},()=>{})};
}
test('each existing age band has 200 distinct complete reachable targets',()=>{
 const {window,s}=setup();for(const [age,b]of Object.entries(window.LaunchContent)){
  assert(b.words.length>=200,age);assert.equal(new Set(b.words.map(w=>w.word)).size,b.words.length);
  for(const w of b.words){assert(w.meaning.length>=10);assert.equal(w.panels.length,2);assert(w.example.length>12);assert(w.cells.every(c=>c>=0&&c<20));assert(fs.existsSync(w.art),w.art);}
 }assert(!s.view('home',()=>{}).includes('companion'));assert(s.view('learn',()=>{}).includes('ls-search'));
});
test('recognition alone is never independent recall; hidden-answer recall accepts punctuation',()=>{
 const {s,el,handle}=setup();handle('open:resilient');handle('understand');const correct=s.ui().choices.findIndex(w=>w.id==='resilient');handle('choose:'+correct);
 assert.equal(s.stats().words.resilient.recognition,1);assert.equal(s.stats().words.resilient.days.length,0);
 handle('recall');const html=s.view('story',()=>{});assert(!html.includes('>resilient<'));assert(!html.includes('A storm bends'));
 el.value='Resilient!';handle('check');assert.equal(s.stats().words.resilient.days.length,1);assert(s.stats().words.resilient.due>Date.now());
});
test('hinted recall and repeated same-day recall do not inflate independent days',()=>{
 const {s,el,handle}=setup();handle('review:meticulous');handle('hint');el.value='meticulous';handle('check');assert.equal(s.stats().words.meticulous.days.length,0);
 handle('review:meticulous');el.value='meticulous';handle('check');handle('review:meticulous');el.value='meticulous';handle('check');assert.equal(s.stats().words.meticulous.days.length,1);
});
test('incorrect recall stays retryable and cannot complete the recall stage',()=>{
 const {s,el,handle}=setup();handle('review:incognito');el.value='invisible';handle('check');assert.equal(s.ui().done,false);assert.equal(s.stats().words.incognito.mistakes,1);assert.equal(s.stats().words.incognito.days.length,0);
});
test('new age store preserves previous age progress and leaves all legacy keys alone',()=>{
 const t=setup();t.handle('open:resilient');const before=t.saved['wm-launch-v1:18+'];t.age('4-6');t.s.sync();t.handle('open:apple');assert.equal(t.saved['wm-launch-v1:18+'],before);assert(t.saved['wm-launch-v1:4-6']);assert(Object.keys(t.saved).every(k=>k.startsWith('wm-launch-v1:')));
});
test('child oral review is explicit parent assessment, no typing required',()=>{
 const {s,handle}=setup('4-6');handle('review:apple');handle('reveal');handle('oral-no');assert.equal(s.ui().phase,3);handle('finish');assert.equal(s.ui().phase,4);assert.equal(s.stats().words.apple.days.length,0);
});
test('sentence assembly checks order rather than marking any taps correct',()=>{
 const {s,handle}=setup('7-9');handle('open:apple');handle('use');handle('order');assert.equal(s.ui().done,false);
 const target=s.ui().word.example.split(' '),used=new Set();for(const token of target){const i=s.ui().tokens.findIndex((t,i)=>t===token&&!used.has(i));used.add(i);handle('tile:'+i);}handle('order');assert.equal(s.ui().done,true);
});

test('learning roots do not collide with the delegated age-selection attribute',()=>{const {s}=setup();const html=s.view('home',()=>{});assert(html.includes('data-learning-age="18+"'));assert(!html.includes('data-age='));});

const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const handlers={};
const app={innerHTML:'',addEventListener:(name,fn)=>handlers[name]=fn};
const sheet={innerHTML:''};
const local=new Map();
const realDate=Date;
let day='2026-10-24';
class FakeDate extends realDate { constructor(...args){super(...(args.length?args:[`${day}T12:00:00`]))} }
const window={WORD_BANK:undefined,scrollTo:()=>{},speechSynthesis:{cancel(){},getVoices:()=>[],speak(){}},addEventListener:()=>{},confirm:()=>true,print:()=>{}};
window.setTimeout=fn=>timeouts.push(fn);
const context={window,document:{getElementById:(id)=>id==='app'?app:id==='print-sheet'?sheet:{textContent:''}},localStorage:{getItem:k=>local.get(k)||null,setItem:(k,v)=>local.set(k,v)},Date:FakeDate,navigator:{},location:{protocol:'file:',hostname:''},setTimeout:fn=>timeouts.push(fn),console,Math};
let timeouts=[];
vm.runInNewContext(fs.readFileSync(path.join(root,'words.js'),'utf8'),context);
vm.runInNewContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),context);
assert.match(app.innerHTML,/Hello, little learner/);
function click(dataset){handlers.click({target:{closest:(selector)=>{
  if(selector==='[data-nav]'&&'nav' in dataset)return {dataset};
  if(selector==='[data-letter]'&&'letter' in dataset)return {dataset};
  if(selector==='[data-action]'&&'action' in dataset)return {dataset};
  if(selector==='[data-choice]'&&'choice' in dataset)return {dataset};
  if(selector==='[data-tile]'&&'tile' in dataset)return {dataset};
  if(selector==='[data-count]'&&'count' in dataset)return {dataset};
  if(selector==='[data-unlock]'&&'unlock' in dataset)return {dataset};
  return null;
}}});}
function flush(){while(timeouts.length)timeouts.shift()();}
click({action:'start-recommended'});
assert.match(app.innerHTML,/Letter A/);
click({action:'play-word'});
for(let i=0;i<3;i++){click({choice:String(i)});flush();}
assert.match(app.innerHTML,/You’re a word star/);
click({action:'back-lesson'});
click({action:'play-match'});
for(let i=0;i<3;i++){click({choice:String(i)});flush();}
assert.match(app.innerHTML,/You’re a word star/);
let progress=JSON.parse(local.get('little-letters-progress-v1'));
assert.deepEqual(Array.from(progress.letters.A.matchDays),['2026-10-24']);
click({action:'back-lesson'});
click({action:'play-spell'});
const wordList=['ANT','APPLE','ARM'];
for(const word of wordList){
  for(const letter of word){
    const tileMatches=[...app.innerHTML.matchAll(/<button class="tile(.*?)" data-tile="(\d+)" (.*?)aria-label="Letter (\w)"/g)];
    const target=tileMatches.find(t=>t[4]===letter&&!t[1].includes('used'));
    assert.ok(target,`Missing unused tile ${letter} for ${word}`);
    click({tile:target[2]});
  }
  click({action:'check-spelling'});flush();
}
assert.match(app.innerHTML,/You’re a word star/);
progress=JSON.parse(local.get('little-letters-progress-v1'));
assert.equal(progress.letters.A.spellDays.length,1);
day='2026-10-25';
click({action:'back-lesson'});click({action:'play-spell'});
for(const word of wordList){
  for(const letter of word){
    const matches=[...app.innerHTML.matchAll(/<button class="tile(.*?)" data-tile="(\d+)" (.*?)aria-label="Letter (\w)"/g)];
    const target=matches.find(t=>t[4]===letter&&!t[1].includes('used'));
    assert.ok(target);click({tile:target[2]});
  }
  click({action:'check-spelling'});flush();
}
click({action:'back-lesson'});
assert.match(app.innerHTML,/All 5 words unlocked/);
click({nav:'worksheets'});
assert.match(app.innerHTML,/Make a worksheet/);
assert.match(sheet.innerHTML,/Letter A — Trace & Copy/);
click({count:'5'});
assert.match(sheet.innerHTML,/apple/);
assert.match(sheet.innerHTML,/axe/);
click({nav:'grownups'});
assert.match(app.innerHTML,/1 of 26 letters mastered/);
assert.match(app.innerHTML,/Words written correctly on paper/);
handlers.change({target:{id:'',dataset:{paperIndex:'0'},checked:true,matches:(v)=>v==='[data-paper-index]'}});
assert.deepEqual(JSON.parse(local.get('little-letters-progress-v1')).letters.A.paper,['ant']);
console.log('✓ Passed: runtime navigation, picture game, spelling, two-day unlock, worksheet generation, adult progress');

/* Conservative offline evaluation: validated language, task fit and uncertainty are separate. */
(function(root){'use strict';
const normal=s=>String(s||'').toLowerCase().replace(/[’]/g,"'").replace(/\bi'm\b/g,'i am').replace(/\bcan't\b/g,'cannot').replace(/\bdon't\b/g,'do not').replace(/\bit's\b/g,'it is').replace(/[^a-z0-9' ]/g,' ').replace(/\s+/g,' ').trim();
const canonical=s=>normal(s).replace(/\bpurchased\b/g,'bought').replace(/\bpurchase\b/g,'buy');
const scene=s=>{const m=normal(s).match(/^the (boy|dog|robot|girl) (chases|follows|helps|inflates|pops) the (boy|dog|robot|girl|balloon)$/);return m?{subject:m[1],action:m[2],object:m[3]}:null;};
function evaluate(text,task){text=String(text||'').trim();task=task||{};let issues=[];
// Deliberately bounded patterns. Never infer a tense from a word elsewhere in a long sentence.
let m=text.match(/^(She|He|It) (go|walk|play|work|eat|like|want|need|live|study)(\b.*)$/i);
if(m){const v=m[2].toLowerCase(),replacement=v==='go'?'goes':v==='study'?'studies':v+'s';issues.push({word:m[2],start:m[1].length+1,end:m[1].length+1+m[2].length,replacement,explanation:'With she, he, or it, add -s (sometimes -es) to the verb in this kind of present-tense sentence.'});}
m=text.match(/^(Yesterday I|I) go (to (?:the )?market|market)( yesterday)?[.!]?$/i);
if(m&&(m[1].toLowerCase().startsWith('yesterday')||m[3])){const start=text.toLowerCase().indexOf('go ');issues=[{word:text.slice(start).replace(/[.!]$/,''),start,end:text.replace(/[.!]$/,'').length,replacement:'went to the market'+(m[3]||''),explanation:'Use went for a completed action yesterday, and to the market for the destination.'}];}
let suggested=text;issues.slice().reverse().forEach(i=>{suggested=suggested.slice(0,i.start)+i.replacement+suggested.slice(i.end);});
const meaning=scene(text),accepted=(task.answers||[]).some(a=>canonical(a)===canonical(text));
const valid=accepted||!!meaning||/^(she goes to school every day|i (bought|purchased) a book yesterday|i buy a book every day|yesterday i went to the market|i went to the market yesterday)$/.test(normal(text));
const result={grammar:issues.length?'error':valid?'acceptable':'unknown',issues,suggested,meaning,task:accepted?'complete':'unknown',style:[],message:''};
if(issues.length){result.task='retry';result.message=issues[0].explanation;}
else if(accepted)result.message='That works. Your sentence completes the task.';
else if(meaning&&task.scene){result.task=Object.keys(task.scene).every(k=>meaning[k]===task.scene[k])?'complete':'mismatch';result.message=result.task==='complete'?'That works. Watch your sentence happen.':'Your grammar is correct. Your sentence changes who acts or what happens. Try the mission again.';}
else if(valid&&task.tense==='past'&&!/\b(bought|went|purchased)\b/.test(normal(text))){result.task='mismatch';result.message='Your sentence is valid. This task asks for a completed event in the past.';}
else result.message='The offline checker cannot confidently assess this wording. It has not been marked wrong. Try online feedback or compare with a model.';
return result;}
function record(previous,outcome,now){now=now||Date.now();const s=Object.assign({exposures:0,recognition:0,recall:0,mistakes:0,streak:0,due:0,contexts:[],days:[]},previous||{});s.contexts=s.contexts.slice();s.days=s.days.slice();s.exposures++;
if(outcome.correct===false){s.mistakes++;s.streak=0;s.mastered=false;s.due=now+10*60*1000;return s;}
if(outcome.mode==='recognition')s.recognition++;
if(outcome.correct&&outcome.independent&&['recall','transfer','conversation'].includes(outcome.mode)){
s.recall++;if(outcome.context&&!s.contexts.includes(outcome.context))s.contexts.push(outcome.context);
const day=new Date(now).toISOString().slice(0,10);if(!s.days.includes(day)){s.days.push(day);s.streak++;}
s.due=now+[1,3,7,14,30][Math.min(4,s.streak-1)]*86400000;
}else s.due=now+10*60*1000;
s.mastered=s.days.length>=3&&s.contexts.length>=2&&s.streak>=3;return s;}
function select(pool,stats,now,limit){now=now||Date.now();limit=limit||3;const seen=pool.filter(w=>stats[w.id]);const due=seen.filter(w=>stats[w.id].due<=now).sort((a,b)=>stats[a.id].due-stats[b.id].due);const weak=seen.filter(w=>!stats[w.id].mastered);const fresh=pool.filter(w=>!stats[w.id]);const selected=due.slice(0,limit);const add=w=>{if(w&&selected.length<limit&&!selected.includes(w))selected.push(w);};
// At most one unfamiliar item, and never grow a backlog of more than three weak words.
if(weak.length<3)add(fresh[0]);weak.forEach(add);seen.forEach(add);if(!seen.length&&!selected.length)add(fresh[0]);return selected;}
root.LearningCore={normal,canonical,scene,evaluate,record,select};
if(typeof module!=='undefined')module.exports=root.LearningCore;
})(typeof window==='undefined'?globalThis:window);

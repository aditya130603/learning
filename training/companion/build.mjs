import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const dir=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(dir,'../..');
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'adult-100-data.js'),'utf8'),context);
const rows=[];
for(const [track,levels] of Object.entries(context.window.WordMayhemTracksV8)) levels.forEach((entry,i)=>{
 const term=typeof entry==='string'?entry:entry.term;
 // Quoted mentions avoid inventing a lexical sense or treating every target as a noun.
 // These eight probes test grammar around vocabulary, NOT knowledge of its meaning.
 const q=JSON.stringify(term),base=`We are discussing the expression ${q}. `;
 const probes=[
  ['agreement',`She go to school every day.`,'error','She goes to school every day.','none'],
  ['agreement-valid',`She goes to school every day.`,'acceptable',null,'none'],
  ['paraphrase',`I purchased a book yesterday.`,'acceptable',null,'complete','Say that you bought a book yesterday.'],
  ['roles',`The dog chases the boy.`,'acceptable',null,'mismatch','Describe the boy chasing the dog.'],
  ['tense',`I buy a book every day.`,'acceptable',null,'mismatch','Describe a completed past event.'],
  ['question',`Does she understands the explanation?`,'error','Does she understand the explanation?','none'],
  ['contraction',`I don’t know what it means.`,'acceptable',null,'none'],
  ['conversation',`Not yet.`,'acceptable',null,'none','In casual conversation, answer: Have you finished reading?']
 ];
 probes.forEach(([kind,sentence,grammar,correction,task,mission],round)=>rows.push({id:`${track}-${i+1}-${round+1}`,track,level:i+1,term,round:round+1,kind,scope:'grammar-calibration',sentence,task:mission||'',prompt:base+`Evaluate only this learner utterance: ${JSON.stringify(sentence)}. Context/task: ${mission||'No specific task.'} Separate grammar from task fit. Return JSON with grammar (acceptable/error/unknown), correction (string or null), task (complete/mismatch/none/unknown), and explanation.`,expected:{grammar,correction,task}}));
 for(const [round,kind,instruction] of [[9,'meaning',`Explain one common meaning of ${q} in simple English and give a natural example. Do not invent a meaning if uncertain.`],[10,'transfer',`Create a short everyday dialogue using ${q} naturally, then explain its meaning in that dialogue.`]]) rows.push({id:`${track}-${i+1}-${round}`,track,level:i+1,term,round,kind,scope:'human-review',prompt:instruction,reference:typeof entry==='object'?{definition:entry.definition,example:entry.example}:null,rubric:['Correct meaning for the stated sense','Natural grammatical usage','Explanation matches example','No invented meaning or false correction'],expected:null});
});
fs.writeFileSync(path.join(dir,'evaluation.jsonl'),rows.map(x=>JSON.stringify(x)).join('\n')+'\n');
fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify({trials:rows.length,tracks:6,levelsPerTrack:100,roundsPerLevel:10,automaticGrammarChecks:4800,humanReviewedVocabularyChecks:1200,modelTrialsExecuted:0,note:'Eight grammar templates recur across targets; these are correlated calibration probes, not 4800 independent grammar phenomena. Lexical meaning/transfer needs human review. Never train on this evaluation file.'},null,2)+'\n');
console.log(`Prepared ${rows.length} held-out trials; no model was executed.`);

/* Word Mayhem source-grounded dictionary practice. Works with original OEWN shards.
   Never infer antonyms, etymologies, examples or pronunciations from spelling.
   Structured lessons are not a substitute for editor-reviewed word stories. */
(function(root){'use strict';
var KEY='wm-wordlab-v7';var progress={};try{progress=JSON.parse(localStorage.getItem(KEY))||{}}catch(_e){};
var lex=root.LexiconExplorer, cache={},active=null,stage='idle',answer='',feedback='',busy=false,lastChecked='';
var INTERVALS=[1,3,7,14,30,60];
var ART={'renaissance':'renaissance','meticulous':'meticulous','ephemeral':'ephemeral','cogent':'cogent','mitigate':'mitigate','juxtapose':'juxtapose','tenacious':'tenacious','under the weather':'under-weather','break the ice':'break-ice'};
var curated={
 'renaissance':{hook:'A city that went quiet comes alive again: artists reopen their studios and music returns to the streets.',scene:'revival',context:'The neighbourhood enjoys a cultural renaissance after years of decline.'},
 'meticulous':{hook:'Imagine a watchmaker checking every tiny gear twice, even the ones nobody will see.',scene:'adult-mnemonic',context:'She kept meticulous records of every expense.'},
 'ephemeral':{hook:'See a glowing flower bloom at dawn and dissolve into sparks before sunset.',scene:'ephemeral',context:'The flowers are beautiful but ephemeral.'},
 'resilient':{hook:'A small green shoot rises again through cracked pavement after a storm.',scene:'world',context:'The team remained resilient after several setbacks.'},
 'serendipity':{hook:'You take the wrong turn and unexpectedly find the very book you needed.',scene:'city-light',context:'By serendipity, they met at the same small café.'},
 'cogent':{hook:'A complicated argument clicks together like three well-matched puzzle pieces.',scene:'adult-lounge',context:'She gave a cogent explanation supported by evidence.'},
 'lucid':{hook:'Fog clears from a window and suddenly the whole landscape makes sense.',scene:'world',context:'His lucid explanation helped the class understand.'},
 'mitigate':{hook:'An engineer raises a barrier to reduce the damage caused by a rising river.',scene:'idiom-afloat',context:'The changes should mitigate the risk of delays.'},
 'ambiguous':{hook:'One sign points in two directions, and both seem equally possible.',scene:'adult-mnemonic',context:'The instructions were ambiguous, so we asked for clarification.'},
 'juxtapose':{hook:'An old brick house and a futuristic glass tower stand side by side.',scene:'city-light',context:'The artist juxtaposes tradition and technology.'},
 'ubiquitous':{hook:'One tiny symbol appears on every street, shop window and screen.',scene:'city-light',context:'Smartphones have become ubiquitous.'},
 'quintessential':{hook:'One perfect cup of tea captures every quality people associate with a cosy afternoon.',scene:'adult-lounge',context:'The village is a quintessential example of rural charm.'},
 'tenacious':{hook:'A climber holds the final grip despite the wind trying to push them away.',scene:'world',context:'She remained tenacious in pursuing her goals.'},
 'audacious':{hook:'A young inventor unveils a flying bicycle before a sceptical audience.',scene:'world',context:'They made an audacious attempt to cross the desert.'},
 'magnanimous':{hook:'The winner congratulates the rival warmly, even after a difficult contest.',scene:'adult-mnemonic',context:'She was magnanimous in victory.'},
 'eloquent':{hook:'One carefully spoken sentence lights a room full of listeners.',scene:'adult-lounge',context:'His eloquent speech inspired the audience.'},
 'pragmatic':{hook:'A bridge is broken; instead of arguing, someone builds a safe temporary crossing.',scene:'world',context:'We need a pragmatic solution to the problem.'},
 'nuance':{hook:'Two almost identical paintings differ in subtle shades visible only up close.',scene:'adult-mnemonic',context:'Her answer captured the nuance of the debate.'},
 'profound':{hook:'A small pebble drops into a lake, sending wide ripples into the distance.',scene:'world',context:'The discovery had a profound effect on medicine.'},
 'inevitable':{hook:'A long chain of dominoes is falling; the final tile is about to tip.',scene:'city-light',context:'Some disruption was inevitable.'},
 'conundrum':{hook:'You face two doors, and both seem to lead back to where you started.',scene:'adult-mnemonic',context:'The situation presents a difficult conundrum.'},
 'alleviate':{hook:'A heavy backpack becomes lighter as someone removes several stones.',scene:'world',context:'The medicine helped alleviate her discomfort.'},
 'persevere':{hook:'A gardener waters a seed every day until it finally grows.',scene:'world',context:'They persevered despite repeated failures.'},
 'scrutinize':{hook:'A detective studies the tiniest mark on a page through a magnifying glass.',scene:'adult-mnemonic',context:'Please scrutinize the figures before approving them.'},
 'coherent':{hook:'Scattered notes are organised into a single clear story.',scene:'adult-lounge',context:'The proposal needs a coherent structure.'},
 'diligent':{hook:'A student patiently checks every step instead of rushing to finish.',scene:'adult-mnemonic',context:'She is diligent about following up on details.'},
 'vivid':{hook:'A grey sketch suddenly bursts into rich colours and sharp details.',scene:'world',context:'He gave a vivid account of the journey.'},
 'concise':{hook:'A long tangled ribbon is trimmed into one perfectly clear line.',scene:'adult-lounge',context:'Please keep your summary concise.'},
 'obstinate':{hook:'A mule refuses to move, even when a safe path opens ahead.',scene:'world',context:'He remained obstinate despite clear evidence.'},
 'fleeting':{hook:'A shooting star flashes across the night sky and disappears.',scene:'ephemeral',context:'It was a fleeting moment of happiness.'},
 'rapport':{hook:'Two strangers find a shared interest, and the awkward space between them melts away.',scene:'adult-lounge',context:'She built rapport with the new team.'}
};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function stamp(){return new Date().toISOString().slice(0,10)}
function save(){try{localStorage.setItem(KEY,JSON.stringify(progress))}catch(_e){}}
function get(){return lex&&typeof lex.current==='function'?lex.current():null}
function key(c){return c.term+'|'+c.index}
function card(){var c=get();return c&&c.sense?c:null}
function item(){var c=card(),a=active;return c&&a&&a.term===c.term&&a.index===c.index?a:null}
function fetchLesson(c){var letter=c.term[0];if(cache[letter])return Promise.resolve(cache[letter]);if(typeof fetch!=='function')return Promise.resolve(null);return fetch('./dictionary-lessons/'+letter+'.json').then(function(r){if(!r.ok)throw Error('missing');return r.json()}).then(function(d){cache[letter]=d;return d}).catch(function(){return null})}
function start(){var c=card();if(!c)return Promise.resolve(false);busy=true;stage='loading';feedback='';answer='';return fetchLesson(c).then(function(data){var row=data&&data[c.term]&&data[c.term][c.index];active={term:c.term,index:c.index,sense:c.sense,plan:row||{i:c.index,p:c.sense.p,q:[],c:''}};stage=active.plan.q&&active.plan.q.length===2?'choice':active.plan.c?'cloze':'recall';busy=false;return true})}
function reset(){active=null;stage='idle';feedback='';answer='';busy=false;lastChecked=''}
function select(i){var a=item();if(!a||stage!=='choice')return false;var options=choices(a);var chosen=options[Number(i)];if(chosen===undefined)return false;answer=chosen;feedback=chosen===a.sense.d?'Correct: this is the recorded meaning for the selected sense.':'Not quite. Compare the answer with the dictionary definition.';stage='choice-result';return chosen===a.sense.d}
function choices(a){var array=[a.sense.d].concat(a.plan.q||[]);if(array.length!==3)return [];var shift=(a.term.length+a.index)%3;return array.slice(shift).concat(array.slice(0,shift))}
function check(text){var a=item();if(!a||!['cloze','recall'].includes(stage))return false;lastChecked=stage;var entered=String(text||'').trim().toLowerCase().replace(/\s+/g,' ');var pass=entered===a.term.toLowerCase();answer=entered;feedback=pass?'Correct. You retrieved the word from memory.':'The target word is “'+a.term+'”. Read the meaning again, then try it tomorrow.';stage='checked';if(lastChecked==='recall')record(pass,a);return pass}
function record(pass,a){var k=key(a),old=progress[k]||{wins:0,tries:0};old.tries++;old.wins=pass?old.wins+1:Math.max(0,old.wins-1);var days=pass?INTERVALS[Math.min(old.wins-1,INTERVALS.length-1)]:1;var d=new Date();d.setDate(d.getDate()+days);old.due=d.toISOString().slice(0,10);old.last=stamp();progress[k]=old;save()}
function next(){var a=item();if(!a)return;feedback='';answer='';if(stage==='choice-result')stage=a.plan.c?'cloze':'recall';else if(stage==='checked')stage=lastChecked==='cloze'?'recall':'done';}
function due(){var now=stamp();return Object.keys(progress).filter(function(k){return progress[k].due<=now})}
function status(){var count=Object.keys(progress).length;return {studied:count,due:due().length}}
function review(){var cards=due();if(!cards.length)return Promise.resolve(false);var parts=cards[0].split('|'),sense=Number(parts.pop()),term=parts.join('|');return lex.lookup(term).then(function(found){if(!found)return false;lex.select(sense);return start()})}
function lesson(){var a=item(),c=get();if(!c||!c.sense)return '';var special=curated[c.term];if(!a)return '<section class="wl-card wl-invite"><div class="wl-title"><b>THE WORD LAB</b><span>'+esc(status().studied)+' studied · '+esc(status().due)+' ready for review</span></div><p>Turn this dictionary meaning into a short learning session. Practice is based on this meaning, not a guessed definition.</p><button data-wl="start" class="wl-primary">Learn this meaning →</button>'+(status().due?'<button data-wl="review" class="wl-review">Review '+status().due+' due words</button>':'')+''+(special?'<div class="wl-memory"><b>MEMORY SCENE · EDITOR CURATED</b><p>'+esc(special.hook)+'</p><img loading="lazy" src="'+(ART[c.term]?'assets/mnemonics/'+ART[c.term]+'.webp':'assets/scenes/'+special.scene+'.webp')+'" alt="Illustration to help remember '+esc(c.term)+'"></div>':'')+'</section>';
var p=a.plan;var head='<section class="wl-card"><div class="wl-title"><b>WORD LAB · '+esc(a.term)+'</b><button data-wl="reset">Close ×</button></div><div class="wl-track"><span class="'+(stage==='choice'?'chosen':'')+'">1 · Understand</span><span class="'+(stage==='cloze'?'chosen':'')+'">2 · Context</span><span class="'+(stage==='recall'?'chosen':'')+'">3 · Remember</span></div>';
if(stage==='loading')return head+'<p>Preparing your practice…</p></section>';
if(stage==='choice'){var options=choices(a);return head+'<h3>What does “'+esc(a.term)+'” mean in this sense?</h3><div class="wl-options">'+options.map(function(x,i){return '<button data-wl="choice:'+i+'">'+esc(x)+'</button>'}).join('')+'</div><small>Answers are selected from source definitions; related meanings can overlap. Use the source sense to resolve uncertainty.</small></section>'}
if(stage==='choice-result')return head+'<h3>Meaning check</h3><div class="wl-feedback">'+esc(feedback)+'</div><p><b>Source definition:</b> '+esc(a.sense.d)+'</p><button class="wl-primary" data-wl="next">Continue →</button></section>';
if(stage==='cloze')return head+'<h3>Fill the gap in this dictionary example</h3><p class="wl-example">'+esc(p.c)+'</p><form id="wl-answer-form"><label for="wl-input">Which word belongs in the blank?</label><input id="wl-input" required autocapitalize="off" spellcheck="false" autocomplete="off"><button type="submit">Check</button></form><small>The example comes from the dictionary; it is not machine-invented.</small></section>';
if(stage==='recall')return head+'<h3>Recall the word without looking</h3><p class="wl-example">'+esc(a.sense.d)+'</p><form id="wl-answer-form"><label for="wl-input">Which word fits this meaning?</label><input id="wl-input" required autocapitalize="off" spellcheck="false" autocomplete="off"><button type="submit">Check</button></form></section>';
if(stage==='checked')return head+'<div class="wl-feedback">'+esc(feedback)+'</div><p><b>Reference meaning:</b> '+esc(a.sense.d)+'</p><button class="wl-primary" data-wl="next">Finish →</button></section>';
if(stage==='done')return head+'<h3>Saved for spaced review</h3><p>The word will return after one day, three days and then longer intervals as you remember it.</p>'+(special?'<div class="wl-memory"><b>VISUAL HOOK · EDITOR CURATED</b><p>'+esc(special.hook)+'</p><img src="'+(ART[c.term]?'assets/mnemonics/'+ART[c.term]+'.webp':'assets/scenes/'+special.scene+'.webp')+'" alt="Illustration for '+esc(a.term)+'"></div>':'')+'<button class="wl-primary" data-wl="reset">Explore another word</button></section>';
return '</section>'
}
function action(raw){var s=String(raw||'');if(s==='start')return start();if(s==='review')return review();if(s==='reset'){reset();return Promise.resolve(true)}if(s==='next'){next();return Promise.resolve(true)}if(s.startsWith('choice:')){select(s.slice(7));return Promise.resolve(true)}return Promise.resolve(false)}
root.WordLabV7={lesson:lesson,start:start,action:action,check:check,reset:reset,status:status,due:due,curated:curated,choices:choices};
})(window);

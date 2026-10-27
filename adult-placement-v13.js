/* Word Mayhem: adult placement (ten calibrated questions) and adaptive 30-level courses. */
(function(root){'use strict';
var KEY='wm-adult-placement-v13',st={page:'quiz',answers:[],band:null,goal:null,done:{},saved:[]},cur=null,phase=0,feedback='',draft='',passed=false,busy=false;
try{var old=JSON.parse(localStorage.getItem(KEY));if(old&&typeof old==='object')st=Object.assign(st,old);}catch(_){}
if(!Array.isArray(st.answers))st.answers=[];if(!st.done)st.done={};if(!Array.isArray(st.saved))st.saved=[];
var Q=[
['resilient','Able to recover from difficulty','Never makes mistakes','Refuses to change','Moves very quickly',0],
['subtle','Very loud and obvious','Not immediately obvious','Entirely false','Deeply expensive',1],
['pragmatic','Based on practical results','Opposed to all evidence','Very poetic','Impossible to prove',0],
['ambiguous','Clear beyond doubt','Full of joy','Open to several interpretations','Entirely pointless',2],
['mitigate','Make less harmful','Make certain','Hide the truth','Make more complex',0],
['cogent','Unnecessarily lengthy','Clear and convincing','Hard to explain','Related to law',1],
['equanimity','Excessive caution','Excitement about change','Calmness under pressure','An unexpected discovery',2],
['esoteric','Widely understood','Extremely generous','Temporary and fleeting','Understood by a specialist few',3],
['perspicacious','Quick to perceive and understand','Easily offended','Carelessly optimistic','Resistant to all learning',0],
['quintessential','An unimportant detail','The most typical or perfect example','An accidental coincidence','A confusing comparison',1]
];
var GOALS=[
['discover','Discover new words','Broaden your expressive vocabulary'],
['authority','Sound authoritative','Credible and precise language'],
['persuasion','Sales & negotiation','Make your words persuasive and clear'],
['rare','Rare & striking vocabulary','Learn striking words and use them naturally'],
['daily','Elevated everyday English','Nuance and confidence in daily life'],
['idioms','Idioms & expressions','Understand meanings beyond literal words']
];
/* Thirty distinct, editorially selected targets per goal per starting band. */
var C={
discover:[
'resilient subtle vivid articulate coherent versatile diligent candid prudent deliberate meticulous pragmatic nuanced discerning perceptive spontaneous astute resourceful perspective inference paradox concise eloquent profound skeptical integrity tenacious compelling lucid intuition',
'meticulous pragmatic ambiguous tenacious astute cogent discerning lucid profound eloquent inference nuance paradox analogy perception cognition resilience integrity serendipity poignant prudent plausible elusive versatile rational judicious articulate subtle intricate coherent',
'equanimity erudite perspicacious ineffable serendipity ubiquitous quintessential juxtaposition ephemeral enigmatic mellifluous magnanimous obfuscate elucidate esoteric dichotomy vicissitude sagacious laconic quixotic evanescent arcane incongruous equivocal discerning perspicacity cogent taciturn perspicaciousness audacious',
'perspicacious vicissitude synecdoche ineffable erudite evanescent equanimity mellifluous sagacious abstruse quixotic juxtaposition quintessential laconic loquacious ephemeral esoteric arcane obfuscate dichotomy insouciance ineffability perspicacity incongruous magnanimous poignant ubiquitous cogent nuanced serendipity'
],
authority:[
'coherent credible robust viable decisive strategic meticulous articulate prudent measured compelling substantial pragmatic accountable transparent systematic rigorous pivotal conclusive persuasive judicious objective salient reliable sustainable calibrated rational legitimate cohesive confident',
'unequivocal cogent incisive salient judicious substantiation legitimate strategic compelling accountable stewardship mandate rationale disciplined methodical rigorous astute forthright definitive substantive measured pragmatic scalable oversight governance contingency calibration synthesis discernment impartial',
'perspicacious incontrovertible judicious equanimity substantiation salient cogent forthright unequivocal stewardship incisive legitimate mandate gravitas judiciousness circumspect calibrated incontrovertible rationale deliberative discernment holistic compelling authoritative erudite foresight impartiality fortitude substantive stringent',
'incontrovertible perspicacious sagacious judicious circumspect cogent irrefutable epistemic erudite salient gravitas nuanced substantiation foresight equanimity incisive perspicacity cogency unequivocal assiduous trenchant corollary impassive dispassionate punctilious ramifications judiciousness fortitude legitimacy'
],
persuasion:[
'rapport concession leverage objection compelling incentive credible persuasive articulate reassurance proposal negotiate compromise alignment reciprocity commitment measurable tangible viable strategic retention satisfaction prospect outcome agreement influence credible differentiation transparent consensus confidence',
'reciprocity anchoring counteroffer tradeoff framing substantiation compelling concession benchmark feasibility contingent leverage differentiation proposition stakeholder rapport mitigation consensus positioning credible retention consultative incentive alignment calibration proactive rationale assurance cogent tangible',
'reciprocity asymmetry substantiation presupposition counterfactual contingent reframing nuance framing persuasion cogent equitable concession conciliation consensus calibration credibility leverage substantiation strategic corollary tacit negotiation astute discernment equitable mitigating stakeholder consequential',
'asymmetry reciprocity fungible contingent counterfactual epistemic corollary concomitant presupposition cogent unequivocal subtleties substantiation equitable concession irreconcilable calibration contextualization negotiation persuasion rationale nuanced judiciously interpretive leverage cogency forthright astute discernment'
],
rare:[
'serendipity ephemeral quintessential audacious eloquent meticulous profound tenacious ingenious enigmatic ubiquitous erudite cogent magnanimous whimsical poignant sublime paradoxical elusive ethereal renaissance astute vivacious eccentric eclectic exquisite luminous lucid ethereal articulate',
'juxtapose esoteric ineffable equanimity perspicacious evanescent iridescent liminal juxtaposition vicissitude audacious quixotic enigmatic quintessential ethereal magnanimous serendipity arcane elucidate obfuscate mellifluous ethereal ephemeral laconic erudite ubiquitous poignant incongruous sublime renaissance',
'perspicacious ineffable evanescent mellifluous synecdoche vicissitude sagacious equanimity abstruse arcane liminal quixotic ephemeral quintessential erudite juxtaposition ethereal poignant enigmatic magnanimous indelible incongruous laconic loquacious esoteric ubiquitous renaissance sublime serendipity obfuscate',
'synecdoche vicissitude perspicacious mellifluous quixotic evanescent abstruse liminal laconic loquacious erudite ineffable perspicacity obfuscate arcane sagacious pernicious nefarious quintessential ethereal epiphany equanimity ephemeral juxtaposition sublime enigmatic esoteric incongruous renaissance poignant'
],
daily:[
'subtle considerate articulate coherent deliberate insightful discerning tactful sincere empathetic concise appreciative perceptive astute genuine reluctant spontaneous pragmatic gracious composed reassuring forthright attentive candid nuanced adaptable skeptical prudent eloquent succinct',
'articulate discerning succinct candid forthright nuanced empathetic conciliatory perceptive tactful measured pragmatic diplomatic implicit restraint thoughtful cogent proactive lucid eloquent coherent prudent deliberation perceptive sophisticated astute deliberate composed nuanced succinct',
'eloquent circumspect tacit discerning equanimity nuanced forthright pragmatic elucidate succinct insight conciliatory astute connotation implication paradigm fortitude integrity discourse ambiguity introspective articulate poignant serendipity quintessential judicious incisive impromptu subtle perspicacious',
'perspicacious circumspect equanimity sagacious cogent forthright erudite incisive laconic loquacious succinct contextualize paradigm presupposition extemporaneous articulation epistemic inferential tacit implication connotation discourse nuance poignant persuasion elucidate perspicacity taciturn equivocal'
],
idioms:[
'break the ice|piece of cake|under the weather|spill the beans|call it a day|on the same page|once in a blue moon|miss the boat|cut corners|bite the bullet|break even|burn the midnight oil|in hot water|take a rain check|get cold feet|make ends meet|back to square one|out of the blue|keep an eye on|pull your weight|on thin ice|face the music|at the drop of a hat|hit the sack|take the plunge|read between the lines|a blessing in disguise|the ball is in your court|hit the nail on the head|hit the ground running',
'read between the lines|the ball is in your court|hit the ground running|move the needle|turn the tables|on the back burner|keep your head above water|throw in the towel|the tip of the iceberg|on thin ice|break the ice|miss the boat|hit the nail on the head|a blessing in disguise|under the weather|make ends meet|cut corners|at the eleventh hour|take a rain check|get cold feet|break even|burn the midnight oil|bite the bullet|zero in on|face the music|on the same page|out of the blue|once in a blue moon|call it a day|piece of cake',
'read between the lines|move the needle|hit the ground running|on the back burner|the tip of the iceberg|turn the tables|keep your head above water|throw in the towel|cut corners|zero in on|burn the midnight oil|out of the blue|at the eleventh hour|break even|on thin ice|the ball is in your court|face the music|take a rain check|a blessing in disguise|miss the boat|get cold feet|at the drop of a hat|bite the bullet|on the same page|piece of cake|under the weather|call it a day|make ends meet|hit the nail on the head|break the ice',
'move the needle|read between the lines|on the back burner|the tip of the iceberg|turn the tables|hit the ground running|zero in on|throw in the towel|keep your head above water|at the eleventh hour|out of the blue|make ends meet|face the music|on thin ice|cut corners|burn the midnight oil|get cold feet|break even|the ball is in your court|a blessing in disguise|miss the boat|hit the nail on the head|once in a blue moon|take a rain check|bite the bullet|under the weather|call it a day|spill the beans|on the same page|piece of cake'
]
};
var HOOK={
renaissance:['A DEAD RANI suddenly takes a BREATH. The sleeping palace comes alive with music, painting and discovery. It is a deliberately silly memory cue, not the pronunciation.','revival','decline','After years of neglect, the city experienced a cultural renaissance.','renaissance'],
meticulous:['A watchmaker carefully inspects every tiny gear twice. No detail escapes.','thorough','careless','She kept meticulous records of every expense.','meticulous'],
ephemeral:['A glowing flower blooms and fades before sunset.','fleeting','permanent','The beauty of the moment was ephemeral.','ephemeral'],
mitigate:['A barrier reduces the damage caused by a flood.','lessen','aggravate','We introduced safeguards to mitigate the risk.','mitigate'],
cogent:['Every COG fits, just as every part of a strong argument fits together.','convincing','unconvincing','She gave a cogent explanation.','cogent'],
juxtapose:['Imagine a juice box beside an antique statue; placing opposites side by side highlights contrast.','contrast','separate','The gallery juxtaposed modern art with ancient pottery.','juxtapose'],
serendipity:['You take a wrong turn and unexpectedly discover your favourite bookshop.','happy chance','misfortune','Their meeting was a moment of serendipity.',''],
equanimity:['A perfectly still lake remains calm through a thunderstorm.','composure','agitation','She responded to setbacks with equanimity.',''],
tenacious:['A climber clings to a cliff even as the wind grows stronger.','persistent','yielding','The tenacious athlete refused to give up.','tenacious'],
magnanimous:['A MAGNIFIED giant hand congratulates a defeated opponent.','generous','petty','The winner was magnanimous in victory.',''],
perspicacious:['A sharp-eyed detective instantly spots a tiny clue others missed.','perceptive','obtuse','Her perspicacious analysis revealed the problem.',''],
quintessential:['A shining golden seal marks the one PERFECT example of its kind.','archetypal','untypical','The house was the quintessential English cottage.',''],
esoteric:['A tiny group studies a secret map full of specialist symbols.','obscure','accessible','The explanation was too esoteric for beginners.','']
};
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c];});}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(st));}catch(_){}}
function bandResult(){var n=0;for(var i=0;i<10;i++)if(st.answers[i]===Q[i][5])n++;return {correct:n,band:n<=3?'B1':n<=5?'B2':n<=8?'C1':'C2'};}
function terms(goal,band){var i=['B1','B2','C1','C2'].indexOf(band);if(i<0)i=1;var str=C[goal]&&C[goal][i]||'';var words=goal==='idioms'?str.split('|'):str.split(/\s+/);
var extra=goal==='idioms'?(root.WordMayhemTracksV8&&root.WordMayhemTracksV8.idioms||[]).map(function(x){return x.term;}):
  (C[goal]||[]).join(' ').split(/\s+/).concat(root.WordMayhemTracksV8&&root.WordMayhemTracksV8[goal]||[]);
return words.concat(extra).filter(function(x,n,arr){return x&&arr.indexOf(x)===n;}).slice(0,30);}
function n(){return Math.min(30,Number(st.done[st.goal]||0));}
function fetchWord(callback){var goal=st.goal,t=terms(goal,st.band)[n()];cur=null;phase=0;feedback='';draft='';passed=false;if(!t){if(callback)callback();return;}
var idiom=(root.WordMayhemTracksV8&&root.WordMayhemTracksV8.idioms||[]).filter(function(v){return v.term===t;})[0];
var w=(root.WordStudioV5&&root.WordStudioV5.items||[]).filter(function(v){return v.title===t;})[0];
if(idiom){cur={title:t,meaning:idiom.definition,example:idiom.example||'',synonym:'',antonym:''};if(callback)callback();return;}
var fallback=w?{title:t,meaning:w.meaning,example:w.example||'',synonym:w.synonym||'',antonym:w.antonym||'',hook:w.hook||''}:null;
if(typeof fetch!=='function'){cur=fallback;if(callback)callback();return;}
fetch('./dictionary/'+t[0]+'.json').then(function(r){if(!r.ok)throw Error('offline dictionary');return r.json();}).then(function(data){var v=data[t]&&data[t][0];cur=v?{title:t,meaning:v.d,example:v.e||'',synonym:(v.s||[]).filter(function(x){return x!==t;})[0]||'',antonym:''}:fallback;}).catch(function(){cur=fallback;}).then(function(){if(callback)callback();});
}
function intro(){var i=st.answers.length,q=Q[i];return '<section class="ap-screen"><div class="ap-top">VOCABULARY CHECK-IN <b>'+(i+1)+' / 10</b></div><div class="ap-bar"><i style="width:'+(i*10)+'%"></i></div><div class="ap-centre"><small>WHAT DOES THIS WORD MEAN?</small><h1>'+esc(q[0])+'</h1><p>Choose the closest meaning. It’s okay to say you don’t know.</p><div class="ap-answers">'+q.slice(1,5).map(function(c,j){return '<button data-ap="answer:'+j+'">'+esc(c)+'</button>';}).join('')+'</div></div><button class="ap-link" data-ap="answer:-1">I do not know yet</button></section>';}
function result(){var x=bandResult();return '<section class="ap-screen"><div class="ap-centre"><small>YOUR PERSONAL STARTING POINT</small><h1>'+x.band+' vocabulary</h1><p>You recognised '+x.correct+' / 10 words. This is a rough starting estimate, not an official CEFR result.</p><p>We’ll teach you slightly harder words and keep adjusting as you learn.</p></div><button class="ap-primary" data-ap="result">Choose my goal →</button></section>';}
function goals(){return '<section class="ap-screen"><div class="ap-top">LEARNING PATH <b>'+esc(st.band)+'</b></div><div class="ap-centre"><small>CHOOSE YOUR PURPOSE</small><h1>Make your words work for you.</h1><div class="ap-goals">'+GOALS.map(function(g){return '<button data-ap="goal:'+g[0]+'"><b>'+esc(g[1])+'</b><span>'+esc(g[2])+'</span><em>→</em></button>';}).join('')+'</div></div><button class="ap-link" data-ap="retake">Retake ten-word check</button></section>';}
function illustration(){if(!cur)return '';var mnemonic=root.MnemonicScenesV13&&root.MnemonicScenesV13.render(cur.title);if(mnemonic)return mnemonic;var h=HOOK[cur.title],asset=h&&h[4];if(asset)return '<img alt="Memory scene illustrating '+esc(cur.title)+'" src="assets/v8-scenes/'+asset+'.webp">';
return '<div class="ap-meaning-art"><span>'+esc(cur.title)+'</span><div></div><strong>'+esc(cur.meaning)+'</strong></div>';}
function hook(){var v=root.CuratedMemoryV13&&root.CuratedMemoryV13.get(cur.title);if(v)return {text:v.hook,syn:v.syn,ant:v.ant,example:v.example};var h=HOOK[cur.title],w=(root.WordStudioV5&&root.WordStudioV5.items||[]).filter(function(v){return v.title===cur.title;})[0];return {text:h?h[0]:w&&w.hook||'',syn:h?h[1]:cur.synonym||w&&w.synonym||'',ant:h?h[2]:cur.antonym||w&&w.antonym||'',example:h?h[3]:cur.example||w&&w.example||''};}
function lesson(){var goal=GOALS.filter(function(g){return g[0]===st.goal;})[0]||GOALS[0],at=n();if(at>=30)return '<section class="ap-screen"><div class="ap-centre"><h1>30 words mastered!</h1><p>Your saved vocabulary stays available for review.</p></div><button data-ap="goals" class="ap-primary">Choose another goal →</button></section>';
if(!cur)return '<section class="ap-screen"><div class="ap-centre"><h1>Opening your word…</h1><p>If this stays here, tap reload. Some rare words require the offline dictionary file.</p></div><button data-ap="reload" class="ap-primary">Reload word</button><button data-ap="goals" class="ap-link">Other goals</button></section>';
var h=hook(),head='<section class="ap-screen ap-lesson"><div class="ap-top">'+esc(goal[1])+' · '+esc(st.band)+' <b>'+(at+1)+' / 30</b></div><div class="ap-bar"><i style="width:'+Math.round((at*5+phase)/150*100)+'%"></i></div>';
if(phase===0)return head+'<div class="ap-centre"><small>SEE IT · REMEMBER IT</small><h1>'+esc(cur.title)+'</h1><div class="ap-art">'+illustration()+'</div><div class="ap-hook">'+(h.text?'<b>Picture this:</b> '+esc(h.text):'<b>Memory anchor:</b> '+esc(cur.meaning))+'</div></div><button data-ap="say" class="ap-mini">◖)) Pronounce</button><button data-ap="next" class="ap-primary">Learn the meaning →</button></section>';
if(phase===1)return head+'<div class="ap-centre"><small>MEANING & USAGE</small><h1>'+esc(cur.title)+'</h1><div class="ap-definition">'+esc(cur.meaning)+'</div><div class="ap-pair"><div><small>SIMILAR</small><b>'+esc(h.syn||'Not verified')+'</b></div><div><small>OPPOSITE</small><b>'+esc(h.ant||'Not verified')+'</b></div></div><blockquote>'+esc(h.example||'Consider a realistic situation where the meaning applies.')+'</blockquote></div><button data-ap="next" class="ap-primary">Challenge my memory →</button></section>';
if(phase===2){var opts=[cur.meaning,'A technique for avoiding every decision','An event that has no meaningful consequence'],rot=at%3;opts=opts.slice(rot).concat(opts.slice(0,rot));return head+'<div class="ap-centre"><small>RECALL THE MEANING</small><h1>'+esc(cur.title)+'</h1><div class="ap-answers">'+opts.map(function(v,j){return '<button data-ap="meaning:'+j+'">'+esc(v)+'</button>';}).join('')+'</div><p class="ap-feedback">'+esc(feedback)+'</p></div></section>';}
if(phase===3)return head+'<div class="ap-centre"><small>APPLY IT</small><h1>Use “'+esc(cur.title)+'”</h1><p>Write a sentence from real life using the word naturally.</p><form id="ap-writing"><textarea id="ap-input" maxlength="300" rows="3" placeholder="Your sentence…">'+esc(draft)+'</textarea><button class="ap-primary" type="submit">Check my sentence</button></form><p class="ap-feedback">'+esc(feedback)+'</p></div>'+(passed?'<button data-ap="finish" class="ap-primary">Next word →</button>':'')+'</section>';
return head+'<div class="ap-centre"><h1>Nicely done!</h1><p>Your new vocabulary is saved.</p></div><button data-ap="finish" class="ap-primary">Next word →</button></section>';}
function view(){return st.page==='quiz'?intro():st.page==='result'?result():st.page==='goals'?goals():lesson();}
function say(t){if(root.LittleLettersAndroid&&root.LittleLettersAndroid.speak)return root.LittleLettersAndroid.speak(t);if(root.speechSynthesis&&root.SpeechSynthesisUtterance){var u=new root.SpeechSynthesisUtterance(t);u.lang='en-IN';root.speechSynthesis.speak(u);}}
function handle(raw,value,repaint){var a=String(raw).split(':'),cmd=a[0],k=a[1];if(cmd==='answer'&&st.page==='quiz'){st.answers.push(Number(k));if(st.answers.length===10){st.band=bandResult().band;st.page='result';}persist();repaint();return;}
if(cmd==='result'){st.page='goals';persist();repaint();return;}if(cmd==='retake'){st.page='quiz';st.answers=[];persist();repaint();return;}
if(cmd==='goals'){st.page='goals';persist();repaint();return;}if(cmd==='goal'&&C[k]){st.goal=k;st.page='lesson';persist();fetchWord(repaint);repaint();return;}
if(cmd==='reload'){fetchWord(repaint);repaint();return;}if(cmd==='say'){if(cur)say(cur.title);return;}
if(cmd==='next'&&phase<2){phase++;repaint();return;}
if(cmd==='meaning'&&phase===2){var correct=(3-n()%3)%3;if(Number(k)===correct){phase=3;feedback='';}else feedback='Try again. Think of the memory scene.';repaint();return;}
if(cmd==='writing'&&phase===3){draft=String(value||'').trim();passed=false;if(!draft){feedback='Please write your own sentence.';repaint();return;}
if(draft.toLowerCase().indexOf(cur.title.toLowerCase())<0){feedback='Include '+cur.title+' in your sentence.';repaint();return;}
if(root.GrammarCore&&typeof root.GrammarCore.check==='function'){var check=root.GrammarCore.check(draft,{entry:{title:cur.title,meaning:cur.meaning}});if(check.issues&&check.issues.length){feedback=check.issues.map(function(i){return i.word+' → '+i.replacement+'. '+i.explanation;}).join(' ')+' Try: '+check.suggested;repaint();return;}}
passed=true;feedback='No obvious grammar issue. This offline check cannot guarantee the word fits your intended meaning; compare it with the example.';repaint();return;}
if(cmd==='finish'&&phase===3&&passed){st.done[st.goal]=Math.min(30,n()+1);if(st.saved.indexOf(cur.title)<0)st.saved.push(cur.title);persist();fetchWord(repaint);repaint();}
}
root.AdultPlacementV13={view:view,handle:handle,state:st,quiz:Q,terms:terms,bandResult:bandResult,load:fetchWord,goals:GOALS};
})(window);
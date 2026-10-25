/* Word Mayhem v9: no empty decoration masquerading as a mnemonic.
 * Adult home presents an actual word, its meaning and a natural example. */
(function(root){'use strict';
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
var studio=root.WordStudioV5;if(!studio)return;
var previousHome=studio.home;
function home(){var p=studio.profile;if(!p||!p.goals||!p.goals.length)return previousHome();
var firstGoal=p.goals[0]||'discover',all=studio.items||[],list=all.filter(function(w){return w.goal===firstGoal;});if(!list.length)list=all;
var w=list.find(function(w){return !p.history||!p.history[w.id];})||list[0];
if(!w)return previousHome();
var explored=p.history?Object.keys(p.history).length:0,saved=p.saved?p.saved.length:0;
var goalNames={discover:'Discover new words',authority:'Speak with authority',persuasion:'Sales and persuasion',rare:'Rare & striking words',daily:'Everyday smart English',idioms:'Idioms & expressions'};
return '<section class="v5-root v9-adult-home">'+
 '<div class="v5-top"><span>WORD MAYHEM · YOUR LANGUAGE STUDIO</span><span>'+Math.max(0,p.xp||0)+' XP</span></div>'+
 '<div class="v5-homehero"><div><span class="v5-eyebrow">'+esc(goalNames[firstGoal]||'YOUR ENGLISH GOAL')+'</span><h1>Learn a word.<br><i>Own its meaning.</i></h1><p class="v9-sub">A few useful minutes: meaning, a vivid memory scene, a natural example, and practice you can actually use.</p>'+
 '<div class="v5-actions"><button class="v5-primary" data-v5="next">Continue learning →</button><button class="v5-secondary" data-ar="open">100-level learning paths</button></div></div>'+
 '<aside class="v9-wordpreview"><span class="v9-wordlabel">UP NEXT · A REAL WORD</span><h2>'+esc(w.title)+'</h2><p>'+esc(w.meaning||'Explore its meaning in a guided lesson.')+'</p>'+(w.example?'<blockquote>“'+esc(w.example)+'”</blockquote>':'')+'</aside></div>'+
 '<div class="v5-metrics"><div><strong>'+explored+'</strong><span>Words practised</span></div><div><strong>'+saved+'</strong><span>Saved words</span></div><div><strong>'+p.goals.length+'</strong><span>Active goals</span></div><div><strong>'+Math.max(0,p.xp||0)+'</strong><span>XP earned</span></div></div>'+
 '<div class="v9-adultshortcuts"><button data-v5="goals"><b>Choose your goals</b><span>Personalise your vocabulary</span></button><button data-v5="review"><b>Review remembered words</b><span>Practise what you learnt</span></button><button data-v5="library"><b>Explore vocabulary</b><span>Meaning, synonyms, antonyms</span></button><button data-nav="dictionary"><b>Full dictionary</b><span>Search unfamiliar English words</span></button></div></section>';
}
studio.home=home;
if(root.SceneArt&&typeof root.SceneArt.adult==='function'){
 root.SceneArt.adult=function(w){return '<div class="v9-fallback-art"><strong>'+esc(w.title||'New word')+'</strong><p>'+esc(w.meaning||'Learn the meaning and how to use this word.')+'</p>'+(w.example?'<p>“'+esc(w.example)+'”</p>':'')+'</div>';};
}
})(window);

/* Lexicon Explorer: lazy letter-sharded open English WordNet for adults.
   No fabricated meanings when a word is absent. No user data leaves the phone. */
(function(root){'use strict';
 var cache={},term='',detail=null,status='',loading=false,selectedSense=0,practice=false,recallResult='',savedTerms=[];
 try{savedTerms=JSON.parse(localStorage.getItem('word-mayhem-dictionary-saved-v1'))||[];}catch(_e){}if(!Array.isArray(savedTerms))savedTerms=[];
 function esc(x){return String(x||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
 function lookup(q){term=String(q||'').trim().toLowerCase().replace(/\s+/g,' ');detail=null;selectedSense=0;practice=false;recallResult='';
   if(!/^[a-z][a-z '\-]{1,49}$/.test(term)){status='Enter an English word or phrase.';return Promise.resolve(false);}
   var letter=term[0];
   if(cache[letter]){detail=cache[letter][term]||null;status=detail?'':'This expression is not in the installed dictionary. Try another spelling.';return Promise.resolve(!!detail);}
   if(typeof fetch!=='function'){status='Dictionary loading is not supported by this device.';return Promise.resolve(false);}
   loading=true;status='Opening offline dictionary…';
   return fetch('./dictionary/'+letter+'.json').then(function(r){if(!r.ok)throw new Error('Dictionary not installed');return r.json();}).then(function(data){cache[letter]=data;detail=data[term]||null;status=detail?'':'This word is not listed in this edition.';return !!detail;}).catch(function(){status='Full dictionary not available in this build. The curated lessons still work offline.';return false;}).then(function(ok){loading=false;return ok;});
 }
 function select(i){selectedSense=Math.max(0,Math.min((detail||[]).length-1,Number(i)||0));}
 function start(){if(!detail)return;practice=true;recallResult='';}
 function stop(){practice=false;recallResult='';}
 function grade(value){var good=String(value||'').trim().toLowerCase().replace(/\s+/g,' ')===term;recallResult=good?'Correct! You recalled the word.':'Not quite. The word is “'+term+'”. Say it aloud, and return to it later.';return good;}
 function toggleSave(){if(!detail)return;var i=savedTerms.indexOf(term);if(i>=0)savedTerms.splice(i,1);else savedTerms.unshift(term);savedTerms=savedTerms.slice(0,250);try{localStorage.setItem('word-mayhem-dictionary-saved-v1',JSON.stringify(savedTerms));}catch(_e){}}
 function view(){var actual=detail&&detail[selectedSense];
 if(practice && actual)return '<section class="lx-root"><div class="lx-intro"><small>WORD RECALL</small><h1>Can you remember this word?</h1><p>Think about the meaning, then type the word.</p></div><article class="lx-result"><p class="lx-definition">'+esc(actual.d)+'</p><form class="lx-form" id="lx-recall-form"><label for="lx-recall-input">Which word means this?</label><div><input id="lx-recall-input" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type the word you learned"><button type="submit">Check</button></div></form>'+(recallResult?'<p role="status" class="lx-message">'+esc(recallResult)+'</p>':'')+'<button type="button" data-lx="stop">← Back to definition</button></article></section>';
 return '<section class="lx-root"><header class="lx-intro"><small>YOUR WORD EXPLORER · ADULT MODE</small><h1>Every unfamiliar word is a door.</h1><p>Explore definitions and synonyms beyond the guided course. Real dictionary meanings, not invented examples.</p></header>'+ 
 '<form class="lx-form" id="lx-form"><label for="lx-input">Search a word</label><div><input id="lx-input" maxlength="50" spellcheck="false" autocomplete="off" value="'+esc(term)+'" placeholder="Try: resilience, ephemeral, nuance"><button type="submit">Find meaning</button></div></form>'+
 (savedTerms.length?'<div class="lx-saved"><strong>Saved words</strong>'+savedTerms.slice(0,12).map(function(t){return '<button type="button" data-lx="open:'+encodeURIComponent(t)+'">'+esc(t)+'</button>';}).join('')+'</div>':'')+
 (loading?'<p class="lx-message" role="status">Opening offline word data…</p>':'')+
 (actual?'<article class="lx-result"><span class="lx-term">'+esc(term)+'</span><button type="button" data-lx="speak" aria-label="Listen to pronunciation">◖)) Listen</button><div class="lx-senses">'+detail.map(function(s,i){return '<button type="button" class="'+(i===selectedSense?'active':'')+'" data-lx="sense:'+i+'">Meaning '+(i+1)+'</button>';}).join('')+'</div><p class="lx-definition">'+esc(actual.d)+'</p><div class="lx-meta"><p><strong>Word class</strong> '+esc(({n:'Noun',v:'Verb',a:'Adjective',r:'Adverb'})[actual.p]||actual.p)+'</p><p><strong>Similar words</strong> '+(actual.s.length?actual.s.map(esc).join(' · '):'Not provided for this sense')+'</p>'+(actual.e?'<p><strong>Source example</strong> '+esc(actual.e)+'</p>':'')+'</div><div class="lx-choices"><button type="button" data-lx="start">◈ Recall this word</button><button type="button" data-lx="save">'+(savedTerms.indexOf(term)>=0?'♥ Saved':'♡ Save word')+'</button></div><p class="lx-source">Source: Open English WordNet 2025 (CC BY 4.0). Some words have multiple meanings—choose the one that fits the sentence.</p></article>':status?'<p class="lx-message" role="status">'+esc(status)+'</p>':'<p class="lx-message">Try one new word every day. Save useful words through the guided adult lessons.</p>')+
 '</section>';}
 function speak(){if(!term)return;if(root.LittleLettersAndroid&&root.LittleLettersAndroid.speak){root.LittleLettersAndroid.speak(term);return;}if(root.speechSynthesis){root.speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(term);u.lang='en-IN';root.speechSynthesis.speak(u);}}
 root.LexiconExplorer={lookup:lookup,view:view,select:select,speak:speak,start:start,stop:stop,grade:grade,toggleSave:toggleSave,term:function(){return term;},current:function(){return detail&&detail[selectedSense]?{term:term,index:selectedSense,sense:detail[selectedSense]}:null;}};
})(window);

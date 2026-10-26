/* Word Mayhem Kids v11 — five-word mastery plus every-five-letters combined mastery.
 * Designed for old Android WebViews: ES5-compatible syntax, no frameworks, no network.
 * Builds on the existing v8 progress without erasing it. */
(function (root) {
  'use strict';
  var previous = root.GuidedJourneyV8;
  var bank = root.WORD_BANK || [];
  if (!previous || !bank.length) return;
  var KEY = 'wm-guided-v8';
  var pending = null;
  var REVIEW_ORDER = [2, 0, 4, 1, 3];
  var letters = 'etaoinrsld';
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c];}); }
  function a(){return previous.age();}
  function s(){
    var x=previous.state();
    if (!x.kidsV10) {
      var old=x.phase;
      x.phase=old==='study'?'read':old==='recognize'?'pick':old==='spell'?'build':old==='complete'?'complete':'read';
      x.kidsV10=true; x.group=x.group||0; x.index=x.index||0;
      x.finalIndex=0; x.finalOrder=REVIEW_ORDER.slice();
      x.picked=[]; x.tileTarget=''; x.tiles=[]; x.note='';
      persist();
    }
    return x;
  }
  function persist(){
    try {
      var raw=localStorage.getItem(KEY),p=raw?JSON.parse(raw):{};
      if (!p||typeof p!=='object')p={}; if(!p.age)p.age={};
      p.age[a()]=previous.state();
      localStorage.setItem(KEY,JSON.stringify(p));
    }catch(e){}
  }
  function wordIndex(){var x=s();return x.group===0?x.index:x.index+3;}
  function word(){var x=s(),w=bank[x.letter];return w&&w.words[wordIndex()];}
  function cancel(){if(pending!==null){clearTimeout(pending);pending=null;} }
  function stop(){cancel();previous.stop();}
  function say(txt){
    if(root.LittleLettersAndroid&&root.LittleLettersAndroid.speak){root.LittleLettersAndroid.speak(txt);return;}
    if(root.speechSynthesis&&root.SpeechSynthesisUtterance){root.speechSynthesis.cancel();var u=new root.SpeechSynthesisUtterance(txt);u.lang='en-IN';u.rate=.82;root.speechSynthesis.speak(u);}
  }
  function facts(letterIndex,index){
    var b=bank[letterIndex],w=b.words[index];
    // The first fact and two extra facts are selected by this EXACT WORD, never by the prior card.
    var first=previous.facts[letterIndex]&&previous.facts[letterIndex][index];
    var extra=root.WordFactsV9&&root.WordFactsV9.get?root.WordFactsV9.get(b.letter,w.text):[];
    var f=[first].concat(extra||[]).filter(function(v){return typeof v==='string'&&v.trim().length>0;});
    if (f.length!==3 || new Set(f.map(function(v){return v.trim().toLowerCase();})).size!==3) return ['Look at the picture of '+w.text+'.','Say the word '+w.text+' aloud.','Find the letters in '+w.text+'.'];
    return f;
  }
  function allFacts(){var report={words:0,invalid:[]};for(var i=0;i<bank.length;i++)for(var j=0;j<bank[i].words.length;j++){var arr=facts(i,j);report.words++;if(arr.length!==3)report.invalid.push(bank[i].letter+':'+bank[i].words[j].text);}return report;}
  function hero(w,small){return '<div class="kj-wordhero '+(small?'kj-compact':'')+'"><div class="kj-sparkle" aria-hidden="true">✦</div><div class="kj-pic" aria-hidden="true">'+w.emoji+'</div><div class="kj-hero-name">'+esc(w.text)+'</div><button type="button" class="kj-hear" data-gj="v10:hear" aria-label="Hear '+esc(w.text)+' pronounced">🔊 Listen</button></div>';}
  function progress(){var x=s(),n=Math.min(26,x.letter+1),finished=Math.max(0,x.completedLetters||0),milestone=x.phase.indexOf('cluster')===0;
    var count=x.group===0?x.index:x.index+3,range=milestone?esc(bank[x.clusterStart].letter)+'–'+esc(bank[x.clusterStart+4].letter):'';
    return '<header class="kj-top"><span>'+(milestone?'🏆 LETTERS '+range:'🌈 LETTER '+esc(bank[Math.min(25,x.letter)].letter))+' <small>'+(milestone?'REVIEW':' '+n+' / 26')+'</small></span><strong>⭐ '+(x.stars||0)+'</strong></header><div class="kj-progress" aria-label="'+finished+' letters completed"><span style="width:'+Math.round(finished/26*100)+'%"></span></div><p class="kj-mini">'+(milestone?'Five-letter revision · '+(Math.min(25,(x.clusterIndex||0)+1))+' / 25':x.phase.indexOf('final')===0?'Five-word challenge':x.phase==='letter-win'?'Letter mastered!':'Word '+(count+1)+' of 5')+'</p>';}
  function clusterQuestions(){var x=s(),start=(typeof x.clusterStart==='number'?x.clusterStart:Math.max(0,x.letter-5)),list=[];
    for(var round=0;round<5;round++)for(var l=0;l<5;l++){
      var wi=(round+2*l)%5;
      list.push({letter:start+l,wordIndex:wi});
    }
    return list;
  }
  function clusterQuestion(){var x=s(),list=clusterQuestions();return list[Math.min(24,x.clusterIndex||0)];}
  function clusterWord(){var q=clusterQuestion();return bank[q.letter].words[q.wordIndex];}
  function clusterChoices(w){var q=clusterQuestion(),x=s(),pool=[w],start=(typeof x.clusterStart==='number'?x.clusterStart:x.letter-5);
    for(var i=1;i<5;i++){var other=bank[start+(q.letter-start+i)%5].words[(q.wordIndex+i)%5];
      if(other.text!==w.text&&other.emoji!==w.emoji)pool.push(other);
    }
    var list=pool.slice(0,3),rotation=(q.wordIndex+q.letter)%list.length;
    return list.slice(rotation).concat(list.slice(0,rotation));
  }
  function currentDeckWord(){var x=s();return x.phase.indexOf('cluster')===0?clusterWord():(x.phase.indexOf('final')===0||x.phase==='letter-win')?bank[x.letter].words[x.finalOrder[x.finalIndex]||0]:word();}
  function seedFor(w){var x=s(),hash=17;for(var i=0;i<w.text.length;i++)hash=(hash*31+w.text.charCodeAt(i))>>>0;return (hash+x.letter*193+x.index*31+x.group*11+x.finalIndex*19)>>>0;}
  function tiles(w){
    var x=s(),name=w.text.replace(/[^a-z]/gi,'').toLowerCase();
    if(x.tileTarget!==name||!Array.isArray(x.tiles)||!x.tiles.length){
      var arr=name.split(''),seed=seedFor(w),extra=letters[(seed+3)%letters.length];
      if(name.indexOf(extra)>=0)extra=letters[(seed+6)%letters.length];
      arr.push(extra);if(name.length<7)arr.push(letters[(seed+1)%letters.length]);
      for(var i=arr.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;var j=seed%(i+1);var temp=arr[i];arr[i]=arr[j];arr[j]=temp;}
      if(arr.slice(0,name.length).join('')===name)arr.reverse();
      x.tiles=arr.map(function(ch,i){return {ch:ch,key:i};});x.tileTarget=name;x.picked=[];persist();
    }
    return x.tiles;
  }
  function choosePool(w,review){var x=s(),pool=bank[x.letter].words.filter(function(q){return q.text!==w.text;});if(!review)pool=pool.concat(bank[(x.letter+1)%26].words.slice(0,3));
    // Picture plus written label is never shown simultaneously as the full correct answer in the spelling stage.
    var choices=[w].concat(pool.slice(0,2)),rot=(x.letter+x.index+x.finalIndex)%choices.length;
    return choices.slice(rot).concat(choices.slice(0,rot));
  }
  function readable(){var x=s(),w=word(),num=wordIndex()+1,info=facts(x.letter,num-1);return '<section class="kj-panel kj-read"><div class="kj-chip">LOOK • LISTEN • LEARN</div>'+hero(w,false)+'<div class="kj-factstitle">Three cool facts about <b>'+esc(w.text)+'</b></div><div class="kj-facts">'+info.map(function(f,i){return '<button type="button" class="kj-fact" data-gj="v10:fact:'+i+'" aria-label="Hear fact '+(i+1)+'"><span>'+(i+1)+'</span><p>'+esc(f)+'</p><em aria-hidden="true">🔊</em></button>';}).join('')+'</div><button class="kj-cta" data-gj="v10:next">Next · Let’s play <span>→</span></button></section>';}
  function pickView(review){var x=s(),w=review?currentDeckWord():word();return '<section class="kj-panel"><div class="kj-chip">'+(review?'THE BIG FIVE · '+(x.finalIndex+1)+'/5':'PICTURE CHALLENGE')+'</div><h1>Find the <em>'+esc(w.text)+'</em></h1><p class="kj-prompt">Tap the correct picture</p><div class="kj-choices">'+choosePool(w,review).map(function(c){return '<button type="button" data-gj="v10:picture:'+esc(c.text)+'"><span>'+c.emoji+'</span><b>'+esc(c.text)+'</b></button>';}).join('')+'</div><p class="kj-status" role="status">'+esc(x.note||'You can do this!')+'</p></section>';}
  function buildView(review){var x=s(),w=review?currentDeckWord():word(),opts=tiles(w),name=w.text.replace(/[^a-z]/gi,'').toLowerCase();return '<section class="kj-panel kj-build"><div class="kj-chip">'+(review?'FINAL SPELLING · '+(x.finalIndex+1)+'/5':'SPELLING GAME')+'</div><h1>Make the word!</h1>'+hero(w,true)+'<div class="kj-slots">'+name.split('').map(function(ch,i){return '<span class="'+(x.picked[i]!==undefined?'kj-filled':'')+'">'+(x.picked[i]!==undefined?esc(opts[x.picked[i]].ch):'')+'</span>';}).join('')+'</div><div class="kj-tiles">'+opts.map(function(tile){var used=x.picked.indexOf(tile.key)>=0;return '<button type="button" data-gj="v10:tile:'+tile.key+'" '+(used?'disabled':'')+' aria-label="Letter '+tile.ch+'">'+tile.ch+'</button>';}).join('')+'</div><div class="kj-controls"><button type="button" data-gj="v10:undo">↶ Undo</button><button type="button" data-gj="v10:clear">↻ Start over</button></div><p class="kj-status" role="status">'+esc(x.note||'Tap the letters to spell the picture.')+'</p></section>';}
  function briefWin(){var x=s();return '<section class="kj-panel kj-success"><div class="kj-fireworks">⭐ ✨ ⭐</div><h1>Brilliant!</h1><p>You spelt <b>'+esc(currentDeckWord().text)+'</b>!</p><p>Next word coming up…</p></section>';}
  function finalStart(){return '<section class="kj-panel kj-milestone"><div class="kj-crown">🏆</div><div class="kj-chip">FIRST 5 WORDS LEARNED</div><h1>The Big Five Challenge!</h1><p>You know all five '+esc(bank[s().letter].letter)+' words. Can you remember them without the fact cards?</p><div class="kj-review-gallery">'+bank[s().letter].words.map(function(w){return '<span title="'+esc(w.text)+'">'+w.emoji+'</span>';}).join('')+'</div><p class="kj-challenge-rule">Find each picture and build its word using mixed-up letters.</p><button class="kj-cta" data-gj="v10:test">Start my big test <span>→</span></button></section>';}
  function finalWin(){var x=s();return '<section class="kj-panel kj-milestone"><div class="kj-crown">🎉</div><h1>Letter '+esc(bank[x.letter].letter)+' mastered!</h1><p>You remembered and spelt all 5 words again!</p><div class="kj-five">'+bank[x.letter].words.map(function(w){return '<span>'+w.emoji+'<small>'+esc(w.text)+'</small></span>';}).join('')+'</div><p class="kj-nextmsg">Moving to the next letter…</p><button class="kj-cta" data-gj="v10:finish">Next letter <span>→</span></button></section>';}
  function clusterReady(){var x=s(),start=x.clusterStart;
    return '<section class="kj-panel kj-cluster-intro"><div class="kj-crown">🏆</div><div class="kj-chip">5 LETTERS LEARNED!</div><h1>Your Super Five Challenge!</h1><p>Let’s remember words from letters <b>'+esc(bank[start].letter)+' to '+esc(bank[start+4].letter)+'</b>.</p><div class="kj-cluster-letters">'+bank.slice(start,start+5).map(function(b){return '<span>'+esc(b.letter)+'</span>';}).join('')+'</div><p>Five little rounds with five words each. Find the picture, then build its word. You can take a break and come back anytime.</p><button class="kj-cta" data-gj="v10:cluster-start">Let’s do it! <span>→</span></button></section>';
  }
  function clusterPickView(){var x=s(),q=clusterQuestion(),w=clusterWord();
    return '<section class="kj-panel kj-cluster-test"><div class="kj-chip">SUPER FIVE · ROUND '+(Math.floor(x.clusterIndex/5)+1)+' / 5</div><h1>Find <em>'+esc(w.text)+'</em>!</h1><p class="kj-prompt">Choose the matching picture</p><div class="kj-choices">'+clusterChoices(w).map(function(c){return '<button type="button" data-gj="v10:cluster-picture:'+esc(c.text)+'"><span>'+c.emoji+'</span><b>'+esc(c.text)+'</b></button>';}).join('')+'</div><p class="kj-status" role="status">'+esc(x.note||'You remember this!')+'</p></section>';
  }
  function clusterBuildView(){var x=s(),w=clusterWord(),opts=tiles(w),name=w.text.replace(/[^a-z]/gi,'').toLowerCase();
    return '<section class="kj-panel kj-cluster-test"><div class="kj-chip">SUPER FIVE · ROUND '+(Math.floor(x.clusterIndex/5)+1)+' / 5</div><h1>Spell the picture!</h1>'+hero(w,true)+'<div class="kj-slots">'+name.split('').map(function(_,i){return '<span class="'+(x.picked[i]!==undefined?'kj-filled':'')+'">'+(x.picked[i]!==undefined?esc(opts[x.picked[i]].ch):'')+'</span>';}).join('')+'</div><div class="kj-tiles">'+opts.map(function(t){return '<button type="button" data-gj="v10:cluster-tile:'+t.key+'" '+(x.picked.indexOf(t.key)>=0?'disabled':'')+' aria-label="Letter '+t.ch+'">'+t.ch+'</button>';}).join('')+'</div><div class="kj-controls"><button type="button" data-gj="v10:cluster-undo">↶ Undo</button><button type="button" data-gj="v10:cluster-clear">↻ Start over</button></div><p class="kj-status" role="status">'+esc(x.note||'Tap the letters in order.')+'</p></section>';
  }
  function clusterWin(){var x=s();return '<section class="kj-panel kj-milestone"><div class="kj-crown">🎉</div><h1>Super Five mastered!</h1><p>You remembered all 25 words from letters <b>'+esc(bank[x.clusterStart].letter)+' to '+esc(bank[x.clusterStart+4].letter)+'</b>.</p><div class="kj-cluster-letters">'+bank.slice(x.clusterStart,x.clusterStart+5).map(function(b){return '<span>'+esc(b.letter)+'</span>';}).join('')+'</div><p class="kj-nextmsg">Your next letter is coming up!</p><button class="kj-cta" data-gj="v10:cluster-finish">Continue to '+esc(bank[x.letter].letter)+' <span>→</span></button></section>';}
  function completion(){return '<section class="kj-panel kj-milestone"><div class="kj-crown">🏆</div><h1>You mastered all 26 letters!</h1><p>Five words in every letter, five-word tests, and five-letter review milestones. Brilliant work!</p><button class="kj-cta" data-gj="to-stories">Play story adventures <span>→</span></button></section>';}
  function alphabet(){var x=s();if(x.phase==='letter-win')return '<div class="kj-root">'+progress()+finalWin()+'</div>';if(x.phase==='complete'||x.letter>=26)return '<div class="kj-root">'+completion()+'</div>';
    var section=x.phase==='read'?readable():x.phase==='pick'?pickView(false):x.phase==='build'?buildView(false):x.phase==='word-win'?briefWin():x.phase==='final-ready'?finalStart():x.phase==='final-pick'?pickView(true):x.phase==='final-build'?buildView(true):x.phase==='final-word-win'?briefWin():x.phase==='cluster-ready'?clusterReady():x.phase==='cluster-pick'?clusterPickView():x.phase==='cluster-build'?clusterBuildView():x.phase==='cluster-word-win'?briefWin():x.phase==='cluster-win'?clusterWin():readable();
    return '<div class="kj-root">'+progress()+section+'</div>';
  }
  function afterWord(){var x=s();x.picked=[];x.tiles=[];x.tileTarget='';x.note='';x.index++;
    if(x.group===0&&x.index>=3){x.group=1;x.index=0;} else if(x.group===1&&x.index>=2){x.phase='final-ready';x.finalIndex=0;x.finalOrder=REVIEW_ORDER.slice();persist();return;}
    x.phase='read';persist();}
  function afterFinalWord(){var x=s();x.picked=[];x.tiles=[];x.tileTarget='';x.note='';x.finalIndex++;if(x.finalIndex>=5){x.phase='letter-win';x.stars=(x.stars||0)+5;}else x.phase='final-pick';persist();}
  function afterClusterWord(){var x=s();x.picked=[];x.tiles=[];x.tileTarget='';x.note='';x.clusterIndex=(x.clusterIndex||0)+1;
    if(x.clusterIndex>=25){x.phase='cluster-win';x.stars=(x.stars||0)+10;}else{x.phase='cluster-pick';}persist();}
  function afterCluster(){cancel();var x=s();if(x.phase!=='cluster-win')return;x.phase='read';x.clusterIndex=0;delete x.clusterStart;persist();}
  function nextLetter(){cancel();var x=s();if(x.phase!=='letter-win')return;x.completedLetters=Math.max(x.completedLetters||0,x.letter+1);x.letter++;x.group=0;x.index=0;x.picked=[];x.tiles=[];x.tileTarget='';x.finalIndex=0;x.note='';
    if(x.letter>=26)x.phase='complete';
    else if(x.letter%5===0){x.phase='cluster-ready';x.clusterStart=x.letter-5;x.clusterIndex=0;}
    else x.phase='read';persist();}
  function delay(fn,ms,rerender){cancel();pending=setTimeout(function(){pending=null;fn();rerender();},ms);}
  function chosenTile(key,review,rerender){var x=s(),isCluster=review==='cluster',isFinal=review===true,w=isCluster?clusterWord():isFinal?currentDeckWord():word(),ts=tiles(w),k=Number(key);if(!isFinite(k)||!ts[k]||x.picked.indexOf(k)>=0)return;
    x.picked.push(k);x.note='';var actual=w.text.replace(/[^a-z]/gi,'').toLowerCase();if(x.picked.length===actual.length){var assembled=x.picked.map(function(i){return ts[i].ch;}).join('');if(assembled===actual){x.stars=(x.stars||0)+1;x.phase=isCluster?'cluster-word-win':isFinal?'final-word-win':'word-win';x.note='Great spelling!';persist();rerender();delay(isCluster?afterClusterWord:isFinal?afterFinalWord:afterWord,900,rerender);return;}x.note='Almost! Try the letters again.';x.picked=[];}
    persist();rerender();}
  function act(raw,rerender){if(typeof rerender!=='function')rerender=function(){};if(raw==='to-stories'){previous.action(raw,rerender);return;}
    if(String(raw).indexOf('v10:')!==0){previous.action(raw,rerender);return;}
    var parts=String(raw).split(':'),cmd=parts[1],value=parts.slice(2).join(':'),x=s();
    if(cmd==='hear'){var w=currentDeckWord();if(w)say(w.text);return;}
    if(cmd==='fact'&&x.phase==='read'){var f=facts(x.letter,wordIndex());var k=Number(value);if(k>=0&&k<f.length)say(f[k]);return;}
    if(cmd==='next'&&x.phase==='read'){x.phase='pick';persist();rerender();return;}
    if(cmd==='picture'&&(x.phase==='pick'||x.phase==='final-pick')){
      if(value!==currentDeckWord().text){x.note='Not that one. Try another picture!';persist();rerender();return;}
      x.phase=x.phase==='final-pick'?'final-build':'build';x.note='';x.picked=[];x.tiles=[];x.tileTarget='';persist();rerender();return;
    }
    if(cmd==='tile'&&(x.phase==='build'||x.phase==='final-build')){chosenTile(value,x.phase==='final-build',rerender);return;}
    if(cmd==='undo'&&(x.phase==='build'||x.phase==='final-build')){x.picked.pop();x.note='';persist();rerender();return;}
    if(cmd==='clear'&&(x.phase==='build'||x.phase==='final-build')){x.picked=[];x.note='';persist();rerender();return;}
    if(cmd==='cluster-start'&&x.phase==='cluster-ready'){x.phase='cluster-pick';x.clusterIndex=x.clusterIndex||0;persist();rerender();return;}
    if(cmd==='cluster-picture'&&x.phase==='cluster-pick'){
      if(value!==clusterWord().text){x.note='Not that one. Try another picture!';persist();rerender();return;}
      x.phase='cluster-build';x.note='';x.picked=[];x.tiles=[];x.tileTarget='';persist();rerender();return;}
    if(cmd==='cluster-tile'&&x.phase==='cluster-build'){chosenTile(value,'cluster',rerender);return;}
    if(cmd==='cluster-undo'&&x.phase==='cluster-build'){x.picked.pop();x.note='';persist();rerender();return;}
    if(cmd==='cluster-clear'&&x.phase==='cluster-build'){x.picked=[];x.note='';persist();rerender();return;}
    if(cmd==='cluster-finish'&&x.phase==='cluster-win'){afterCluster();rerender();return;}
    if(cmd==='test'&&x.phase==='final-ready'){x.phase='final-pick';x.finalIndex=0;x.finalOrder=REVIEW_ORDER.slice();persist();rerender();return;}
    if(cmd==='finish'&&x.phase==='letter-win'){nextLetter();rerender();return;}
  }
  var oldView=previous.view,oldAlphabet=previous.alphabet;
  var merged={};Object.keys(previous).forEach(function(k){merged[k]=previous[k];});
  merged.alphabet=alphabet;
  merged.view=function(){return a()==='4-6'&&s().phase!=='complete'?alphabet():a()==='4-6'?previous.view():oldView();};
  merged.action=act;
  merged.schedule=function(rerender){var x=s();if(pending!==null)return;
    if(x.phase==='letter-win')delay(nextLetter,1650,rerender);
    else if(x.phase==='cluster-win')delay(afterCluster,1700,rerender);
    else if(x.phase==='cluster-word-win')delay(afterClusterWord,850,rerender);
    else if(x.phase==='word-win')delay(afterWord,850,rerender);
    else if(x.phase==='final-word-win')delay(afterFinalWord,850,rerender);
  };
  merged.stop=stop; merged.wordFacts=facts;merged.factReport=allFacts;
  merged.state=s;merged.clusterQuestions=clusterQuestions;merged.clusterQuestion=clusterQuestion;merged.clusterWord=clusterWord;merged.readSeconds=function(){return 0;};
  merged.getPhase=function(){return s().phase;};
  root.GuidedJourneyV8=merged;
})(window);
/* Tap-to-build gameplay: authored offline missions, age profiles, specific grammar feedback. */
(function(window){
  'use strict';
  var bank=window.WORD_MAYHEM, STORE='little-letters-mayhem-v1';
  var saved={};try{saved=JSON.parse(localStorage.getItem(STORE))||{}}catch(e){};
  if(!saved || typeof saved!=='object')saved={};
  if(!saved.finished || typeof saved.finished!=='object')saved.finished={};
  var current=null, notice='',activeMeaning=null;
  var pictureWord={The:'👉',cat:'🐱',frog:'🐸',duck:'🦆',jumps:'🐾',sleeps:'💤',jump:'👣',hops:'🐸',naps:'😴',hop:'🦘',swims:'🌊',swim:'💦'};
  function store(){try{localStorage.setItem(STORE,JSON.stringify(saved))}catch(e){}}
  function safe(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function getAge(){return saved.age||null}
  function chooseAge(age){if(!bank.ages.some(function(a){return a.id===age}))return false;saved.age=age;store();current=null;return true}
  function info(){return bank.ages.find(function(a){return a.id===getAge()})||bank.ages[0]}
  function count(){return bank.forAge(getAge()).filter(function(m){return saved.finished[m.id]}).length}
  function select(id){var m=bank.forAge(getAge()).find(function(x){return x.id===id});if(!m)return false;current={mission:m,chosen:[],attempts:0,result:null,hinted:false};notice='';activeMeaning=null;return true}
  function selectNext(){var list=bank.forAge(getAge());if(!list.length)return false;var next=list.find(function(m){return !saved.finished[m.id]})||list[0];return select(next.id)}
  function speak(s){if(window.LittleLettersAndroid&&window.LittleLettersAndroid.speak){window.LittleLettersAndroid.speak(s);return}if(window.speechSynthesis){window.speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(s);u.lang='en-IN';u.rate=.78;window.speechSynthesis.speak(u)}}
  function welcome(){return '<section class="age-onboard"><div class="age-symbol">🌈 📚 🚀</div><span class="eyebrow">LITTLE LETTERS × WORD MAYHEM</span><h1>Who is playing today?</h1><p>Choose a learning stage. You can switch at any time.</p><div class="age-grid">'+bank.ages.map(function(a){return '<button class="age-card" data-age="'+a.id+'"><span class="age-icon">'+a.icon+'</span><strong>Age '+a.label+'</strong><b>'+safe(a.name)+'</b><small>'+safe(a.description)+'</small><span class="age-arrow">Start →</span></button>'}).join('')+'</div><p class="parent-note">No sign-up. Learning progress stays on this device. Age bands are suggestions, not ability limits.</p></section>'}
  function agePicker(){return '<div class="layout-flow"><h1>Change learning stage</h1><p class="subtext">Choose what feels comfortable. Your progress for each mission is kept.</p>'+welcome()+'</div>'}
  function hub(){var age=getAge(),list=bank.forAge(age),a=info();return '<div class="mayhem-hub"><div class="mission-intro"><span class="eyebrow">WORD MAYHEM · '+safe(a.name.toUpperCase())+'</span><h1>'+(age==='4-6'?'Make a silly sentence!':age==='18+'?'Words with impact.':'Your words change the story.')+'</h1><p>'+(age==='4-6'?'Tap the word blocks. See what happens!':'Build a correct sentence, then watch your decision change the scene.')+'</p><div class="intro-progress">🏅 '+count()+' of '+list.length+' stories saved</div><button class="btn btn-primary mission-main" data-mayhem="next">'+(count()?'Continue adventures':'Play first mission')+' →</button></div><div class="mission-list">'+list.map(function(m,i){var done=saved.finished[m.id];return '<button class="mission-card" data-mission="'+safe(m.id)+'"><span class="mission-emoji">'+m.scene+'</span><span><small>MISSION '+(i+1)+(done?' · COMPLETED ✓':'')+'</small><b>'+safe(m.name)+'</b><em>'+safe(m.place)+'</em></span><strong>→</strong></button>'}).join('')+'</div><div class="mission-hint">✨ Correct grammar is needed to act. A correct but unhelpful action still plays out—sometimes hilariously.</div></div>'}
  function shuffleTiles(m){
    // Authored unique words: show them in a fixed, intentionally unsolved order.
    var source=m.tiles.slice(), order=[2,0,4,1,3,6,5];
    return order.filter(function(i){return i<source.length}).map(function(i){return {word:source[i],key:i}})
  }
  function play(){if(!current)return hub();var m=current.mission,c=current.chosen,r=current.result,locked=!!r,tiles=shuffleTiles(m);
    var hint=current.hinted?'<p class="mayhem-tip">💡 '+safe(m.tip)+'</p>':'';
    var feedback='';
    if(r){var isWin=r.type==='win',isOops=r.type==='oops',isGrammar=r.type==='grammar';feedback='<div class="outcome '+(isWin?'outcome-good':isOops?'outcome-funny':'outcome-repair')+'" role="status"><div class="outcome-picture">'+(isWin?m.win:isOops?m.oops:'🔧 ✏️')+'</div><strong>'+(isWin?'MISSION SAVED! 🎉':isOops?'SILLY SURPRISE! 😅':isGrammar?'Fix the grammar':'Try another order')+'</strong><p>'+safe(r.message)+'</p>'+(isGrammar?'<small>See the red word? Change it, then try again.</small>':isOops?'<small>That sentence is grammatical, but its meaning changed the mission.</small>':'')+'</div>'}
    return '<div class="mayhem-play '+(getAge()==='4-6'?'pre-reader':'')+'"><div class="mayhem-top"><button class="btn btn-ghost" data-mayhem="hub">← Adventures</button><span class="challenge-level">'+safe(info().name)+'</span></div><div class="stage-card"><span class="stage-place">📍 '+safe(m.place)+'</span><h1>'+safe(m.name)+'</h1><div class="stage-art" aria-label="'+safe(m.place)+'">'+(r && ['win','oops'].indexOf(r.type)!==-1?(r.type==='win'?m.win:m.oops):m.base)+'</div><p class="stage-goal">🎯 '+safe(m.goal)+'</p><button class="listen-mission" data-mayhem="hear">🔊 Hear the mission</button></div><div class="sentence-board"><div class="board-heading"><div><span class="eyebrow">MAKE YOUR SENTENCE</span><h2>'+(getAge()==='4-6'?'Tap the words 👇':'Choose words in the right order')+'</h2></div><span class="word-count">'+c.length+' / '+(m.object?5:3)+' words</span></div><div class="sentence-line">'+(c.length?c.map(function(tile,i){var err=r && ['grammar','order','incomplete'].indexOf(r.type)!==-1 && r.at===i;return '<button class="selected-word '+(err?'wrong-word':'')+'" data-remove="'+i+'" aria-label="Remove '+safe(tile.word)+'">'+safe(tile.word)+' <small>×</small></button>'}).join(''):'<span class="empty-sentence">'+(getAge()==='4-6'?'👆 Tap a word below':'Your sentence will appear here…')+'</span>')+'</div><div class="word-bank">'+tiles.map(function(t){var used=c.some(function(w){return w.key===t.key});return '<button class="word-tile '+(used?'tile-selected':'')+'" data-word-tile="'+t.key+'" draggable="'+(getAge()==='4-6'?'false':'true')+'" '+(used?'disabled':'')+'>'+(getAge()==='4-6'?'<span class="tile-picture" aria-hidden="true">'+(pictureWord[t.word]||'✨')+'</span>':'')+safe(t.word)+'</button>'}).join('')+'</div><div class="mission-actions"><button class="btn btn-outline" data-mayhem="hint">💡 Hint</button><button class="btn btn-outline" data-mayhem="clear">↺ Clear</button><button class="btn btn-primary mission-execute" data-mayhem="execute" '+(r&&r.type==='win'?'disabled':'')+'>▶ Make it happen</button></div>'+hint+feedback+'</div><div class="mayhem-footer"><button class="text-link" data-mayhem="meaning">📖 What do these words mean?</button>'+(activeMeaning?'<div class="meaning-panel">'+Object.keys(m.meaning).map(function(k){return '<button class="meaning-row" data-meaning-word="'+safe(k)+'"><b>'+safe(k)+'</b> — '+safe(m.meaning[k])+' 🔊</button>'}).join('')+'</div>':'')+'</div>'+(r&&r.type==='win'?'<button class="btn btn-primary mission-next" data-mayhem="next">Next adventure →</button>':'')+'</div>'}
  function runAction(action){
    if(action==='hub'){current=null;return 'hub'}
    if(action==='next'){selectNext();return 'play'}
    if(!current)return 'hub';
    var m=current.mission;
    if(action==='hear'){speak(m.goal);return 'play'}
    if(action==='hint'){current.hinted=!current.hinted;return 'play'}
    if(action==='clear'){current.chosen=[];current.result=null;return 'play'}
    if(action==='meaning'){activeMeaning=!activeMeaning;return 'play'}
    if(action==='execute'){
      if(current.result&&current.result.type==='win')return 'play';
      current.attempts++;
      var result=bank.evaluate(m,current.chosen.map(function(t){return t.word}));
      current.result=result;
      if(result.type==='win'){saved.finished[m.id]=true;store();speak(m.winText)}
      else if(result.type==='oops')speak(m.oopsText);
      else speak(result.message);
      return 'play';
    }
    return 'play';
  }
  function pickTile(id){if(!current || (current.result && current.result.type==='win'))return;var i=Number(id);if(current.chosen.some(function(t){return t.key===i}))return;current.chosen.push({word:current.mission.tiles[i],key:i});current.result=null;if(getAge()==='4-6')speak(current.mission.tiles[i])}
  function removeTile(index){if(current){current.chosen.splice(Number(index),1);current.result=null}}
  window.Mayhem={getAge:getAge,chooseAge:chooseAge,info:info,welcome:welcome,agePicker:agePicker,hub:hub,play:play,select:select,runAction:runAction,pickTile:pickTile,removeTile:removeTile,speak:speak,count:count,missions:function(){return bank.forAge(getAge())},meaningWord:function(w){if(current&&current.mission.meaning[w])speak(w+'. '+current.mission.meaning[w])}};
})(window);

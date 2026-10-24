/* Lightweight Word Mayhem mission player: runs without Internet or libraries. */
(function(w){
"use strict";
var D=w.WordMayhemData,STORE="little-letters-mayhem-v1",saved={};
try{saved=JSON.parse(localStorage.getItem(STORE))||{}}catch(e){}
if(!saved||typeof saved!=="object")saved={};
if(!saved.finished)saved.finished={};
var current=null,explain=false,help=false;
function save(){try{localStorage.setItem(STORE,JSON.stringify(saved))}catch(e){}}
function e(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function age(){return saved.age||null}
function setAge(v){if(!D.ages.some(function(x){return x.id===v}))return false;saved.age=v;save();current=null;return true}
function profile(){return D.ages.find(function(x){return x.id===age()})||D.ages[0]}
function list(){return D.forAge(age())}
function count(){return list().filter(function(m){return !!saved.finished[m.id]}).length}
function speak(t){if(w.LittleLettersAndroid&&w.LittleLettersAndroid.speak){w.LittleLettersAndroid.speak(t);return;}if(!w.speechSynthesis)return;w.speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(t);u.lang="en-IN";u.rate=.78;w.speechSynthesis.speak(u)}
function welcome(){
return '<section class="wm-onboard"><div class="wm-spark">🌈 📚 🚀</div><span class="eyebrow">LITTLE LETTERS × WORD MAYHEM</span><h1>Who is playing today?</h1><p>Choose a learning stage. Change it any time.</p><div class="wm-agegrid">'+D.ages.map(function(a){
return '<button class="wm-age" data-wm-age="'+a.id+'"><span>'+a.icon+'</span><b>Age '+a.label+'</b><strong>'+e(a.name)+'</strong><small>Tap to start →</small></button>'}).join('')+'</div><p class="wm-note">No sign-up. Progress stays on this device. Age stages are suggestions, not limits.</p></section>';
}
function agePage(){return '<div class="wm-agepage"><h1>Choose a learning stage</h1>'+welcome()+'</div>'}
function choose(id){var m=list().find(function(x){return x.id===id});if(!m)return false;current={m:m,chosen:[],result:null};explain=false;help=false;return true}
function next(){var m=list().find(function(x){return !saved.finished[x.id]})||list()[0];return m?choose(m.id):false}
function hub(){
var a=profile();return '<div class="wm-hub"><div class="wm-intro"><span class="eyebrow">WORD MAYHEM · '+e(a.name.toUpperCase())+'</span><h1>'+(age()==="4-6"?"Make a silly sentence!":age()==="18+"?"Words with impact.":"Your words change the story.")+'</h1><p>Build a sentence and watch the world react. Correct grammar can still lead to a funny mistake!</p><strong>🏅 '+count()+' / '+list().length+' missions solved</strong><br><button class="btn btn-primary" data-wm-action="next">▶ '+(count()?"Continue":"Start")+' adventure</button></div><div class="wm-grid">'+list().map(function(m,i){
return '<button class="wm-level" data-wm-mission="'+e(m.id)+'"><span class="wm-level-art">'+w.SceneArt.kid(m.id,null,m.name)+'</span><div><small>MISSION '+(i+1)+(saved.finished[m.id]?" · ✓ SOLVED":"")+'</small><b>'+e(m.name)+'</b><em>'+e(m.goal)+'</em></div><strong>→</strong></button>'}).join('')+'</div></div>';
}
var pics={The:"👉",cat:"🐱",frog:"🐸",duck:"🦆",jumps:"🐾",sleeps:"💤",jump:"👣",hops:"🦘",naps:"😴",hop:"🐾",swims:"🌊",swim:"💧"};
function play(){
if(!current)return hub();
var m=current.m,c=current.chosen,r=current.result,small=age()==="4-6";
var order=[2,0,4,1,3,6,5].filter(function(i){return i<m.tiles.length});
var feedback="";
if(r){
var picture=r.type==="win"?m.win:r.type==="oops"?m.oops:"🔧 ✏️";
feedback='<div class="wm-result wm-'+r.type+'" role="status"><span class="wm-result-art">'+w.SceneArt.kid(m.id,r.type,m.name)+'</span><h2>'+(r.type==="win"?"Mission saved! 🎉":r.type==="oops"?"Silly surprise! 😅":"Try again")+'</h2><p>'+e(r.message)+'</p>'+(r.type==="oops"?"<small>Good grammar. The meaning changed the mission!</small>":r.type==="grammar"?"<small>Tap the red word to replace it.</small>":"")+'</div>';
}
return '<div class="wm-play '+(small?"wm-small":"")+'"><div class="wm-playtop"><button class="btn btn-ghost" data-wm-action="hub">← Missions</button><b>'+e(profile().name)+'</b></div><section class="wm-scene"><span class="eyebrow">MISSION</span><h1>'+e(m.name)+'</h1><div class="wm-illustration" aria-label="Story scene">'+w.SceneArt.kid(m.id,r&&r.type,m.name)+'</div><p>🎯 '+e(m.goal)+'</p><button class="wm-hear" data-wm-action="hear">🔊 Listen</button></section><section class="wm-board"><div class="wm-boardheading"><h2>'+(small?"Tap words to make a sentence 👇":"Make the sentence happen")+'</h2><span>'+c.length+' / '+(3+m.object.length)+'</span></div><div class="wm-sentence" aria-label="Sentence being built">'+(c.length?c.map(function(t,i){return '<button data-wm-remove="'+i+'" class="wm-selected '+(r&&r.at===i&&["grammar","order","incomplete"].indexOf(r.type)!==-1?"wm-error":"")+'">'+e(t.word)+' ×</button>'}).join(""):'<span>Tap a word below to begin</span>')+'</div><div class="wm-tiles">'+order.map(function(i){var used=c.some(function(t){return t.key===i}),word=m.tiles[i];return '<button data-wm-tile="'+i+'" draggable="'+(!small)+'" class="wm-tile" '+(used?"disabled":"")+'>'+(small?'<span class="wm-pic">'+(pics[word]||"✨")+'</span>':"")+e(word)+'</button>'}).join('')+'</div><div class="wm-controls"><button class="btn btn-outline" data-wm-action="hint">💡 Hint</button><button class="btn btn-outline" data-wm-action="clear">↺ Clear</button><button class="btn btn-primary wm-go" data-wm-action="execute" '+(r&&r.type==="win"?"disabled":"")+'>▶ Make it happen</button></div>'+(help?'<p class="wm-hint">💡 '+e(m.meaning[m.winVerb]||"Choose an action that helps the mission.")+'</p>':"")+feedback+'</section><div class="wm-foot"><button class="text-link" data-wm-action="meaning">📖 Word meanings & pronunciation</button>'+(explain?'<div class="wm-meanings">'+Object.keys(m.meaning).map(function(k){return '<button data-wm-mean="'+e(k)+'"><b>'+e(k)+'</b> — '+e(m.meaning[k])+' 🔊</button>'}).join("")+'</div>':"")+'</div>'+(r&&r.type==="win"?'<button class="btn btn-primary wm-next" data-wm-action="next">Next mission →</button>':"")+'</div>';
}
function tile(key){if(!current||current.result&&current.result.type==="win")return;var i=Number(key);if(!Number.isInteger(i)||i<0||i>=current.m.tiles.length||current.chosen.some(function(x){return x.key===i}))return;current.chosen.push({word:current.m.tiles[i],key:i});current.result=null;if(age()==="4-6")speak(current.m.tiles[i])}
function remove(i){if(!current)return;current.chosen.splice(Number(i),1);current.result=null}
function action(a){
if(a==="hub"){current=null;return "missions";}
if(a==="next"){next();return "mission-play";}
if(!current)return "missions";
if(a==="hear"){speak(current.m.goal);return "mission-play";}
if(a==="hint"){help=!help;return "mission-play";}
if(a==="clear"){current.chosen=[];current.result=null;return "mission-play";}
if(a==="meaning"){explain=!explain;return "mission-play";}
if(a==="execute"){
if(current.result&&current.result.type==="win")return "mission-play";
var r=D.evaluate(current.m,current.chosen.map(function(x){return x.word}));current.result=r;
if(r.type==="win"){saved.finished[current.m.id]=true;save();}
speak(r.message);return "mission-play";
}
return "mission-play";
}
w.Mayhem={age:age,setAge:setAge,profile:profile,welcome:welcome,agePage:agePage,choose:choose,next:next,hub:hub,play:play,tile:tile,remove:remove,action:action,count:count,list:list,meaning:function(key){if(current&&current.m.meaning[key])speak(key+". "+current.m.meaning[key])}};
})(window);

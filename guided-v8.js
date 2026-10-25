/* Word Mayhem Guided Journey v8. No adult unlock, no optional steps for early readers.
 * Counts 100 progressive activities per age band: 26 letter units + 74 extension
 * activities for 4–6; 100 adaptive challenge rounds for each older child band.
 * Existing detailed art and vocabulary remain available elsewhere in the app. */
(function(root){'use strict';
var WORDS=root.WORD_BANK||[], MISSIONS=root.WORD_MAYHEM;
var KEY='wm-guided-v8', progress={};
try{progress=JSON.parse(localStorage.getItem(KEY))||{};}catch(_e){}
if(!progress.age)progress.age={};
var activeTimer=0, clock=null, autoMove=null, ageOverride=null;
var FACTS=[
 ['Ants are tiny insects.','Ants live together in colonies.','Ants work as a team.','An apple grows on a tree.','You bend your arm at the elbow.'],
 ['A bat is used to hit a ball.','A bag helps carry things.','A bus carries many people.','A bed is a place to sleep.','A ball can roll and bounce.'],
 ['Cats use whiskers to sense spaces.','A car moves on wheels.','A cup holds a drink.','A cap can shade your eyes.','A cow gives milk.'],
 ['Dogs have a strong sense of smell.','Dad is another word for father.','Some wild animals rest in dens.','Ducks have webbed feet.','A doll is a toy shaped like a person.'],
 ['An egg has a shell.','Your ear helps you hear.','Your eyes help you see.','We eat food to get energy.','An elf is a make-believe creature.'],
 ['A fan moves air.','A fox is a wild animal.','Fish breathe through gills.','Fun means having a good time.','A fig is a kind of fruit.'],
 ['A goat can climb rocky places.','A girl is a young person.','A gift is something you give.','A gate opens and closes.','A game has rules or goals.'],
 ['A hat goes on your head.','A hen is a female chicken.','A hut is a small shelter.','To hop means to make a little jump.','A hand has five fingers, including the thumb.'],
 ['Ink is used for writing.','Ice is frozen water.','In means inside something.','An igloo can be built from snow blocks.','An insect has six legs.'],
 ['Jam can be made from fruit.','A jet is an aeroplane.','A jug holds liquids.','A jar has a wide opening.','A jeep can travel on rough roads.'],
 ['A key can open a lock.','Kid is another word for child.','A kite flies in the wind.','A king rules a kingdom.','A kit is a set of useful things.'],
 ['You stand on your legs.','A log is a piece of a tree trunk.','Your lips help you speak.','A lid covers a container.','A lion is a big cat.'],
 ['A man is an adult person.','A mat lies on the floor.','A map shows places.','A mop is used to clean floors.','The Moon moves around Earth.'],
 ['A net can catch a ball.','Many nuts grow on trees.','Your nose helps you smell.','Birds build nests to hold eggs.','A nail can hold pieces of wood together.'],
 ['An ox is a large farm animal.','On means resting on a surface.','An owl can turn its head far around.','Oil and water do not mix easily.','An orange is a juicy fruit.'],
 ['A pen makes marks with ink.','A pig is a farm animal.','A pan can be used for cooking.','A pot can hold soup or water.','A pin is a small pointed object.'],
 ['A queen may rule a kingdom.','A quiz asks questions.','A quilt can keep you warm.','A duck makes a quacking sound.','A quail is a small bird.'],
 ['A rat is a rodent.','Red is a colour.','Run means moving faster than walking.','A rug covers part of a floor.','A rose is a flowering plant.'],
 ['The Sun is a star.','Sit means rest on a seat.','Six comes after five.','A sock covers your foot.','A star makes its own light.'],
 ['Water comes from a tap.','Top can mean the highest part.','A tub holds water.','Ten comes after nine.','A toy is something you play with.'],
 ['Up means towards a higher place.','Us means you and me together.','An urn is a kind of container.','An uncle is a family member.','Under means below something.'],
 ['A van is a road vehicle.','A vet helps sick animals.','A vest is a kind of clothing.','A vase can hold flowers.','A vine is a climbing plant.'],
 ['A spider makes a web.','Wet means covered with water.','A wig is false hair.','Win means succeed in a game.','A wall separates spaces.'],
 ['An X-ray can show bones.','A xylophone is a musical instrument.','Box ends with the letter X.','Fox ends with the letter X.','Six ends with the letter X.'],
 ['A yak has long, thick hair.','Yam is a kind of food.','Yes is used when you agree.','Yarn is used for knitting.','An egg yolk is yellow or orange.'],
 ['You can see many animals at a zoo.','A zip fastens clothes or bags.','Zero means none.','A zebra has black and white stripes.','A zigzag line changes direction.']
];
var EXTRA_FACTS=[
 ['Many ants live in nests or anthills.','Some ants can bite.'],
 ['A cricket bat is usually made of wood.','A bat helps you play cricket.'],
 ['Cats can purr when they feel relaxed.','Kittens are baby cats.'],
 ['Dogs communicate by barking and body movements.','Puppies are baby dogs.'],
 ['Some eggs hatch into baby birds.','Eggshells help protect what is inside.'],
 ['Some fans use electricity.','A fan can help you feel cooler.'],
 ['Goats eat plants.','Baby goats are called kids.'],
 ['Hats can protect us from the sun.','Hats come in many shapes.'],
 ['Ink can be many colours.','Pens often contain ink.'],
 ['Jam is usually sweet.','Jam can be spread on bread.'],
 ['A key fits a particular lock.','Some keys are used to open doors.'],
 ['Your legs help you walk.','Your knees help your legs bend.'],
 ['A map can show rivers and roads.','A map helps people find places.'],
 ['Nets can have many tiny holes.','Fishermen sometimes use nets.'],
 ['Oxen are strong farm animals.','Some oxen help pull carts.'],
 ['Pens can use different colours of ink.','A pen helps us write letters.'],
 ['A queen sometimes wears a crown.','Some queens are heads of state.'],
 ['Rats are very good at finding food.','Baby rats are called pups.'],
 ['Sunlight helps plants grow.','Never look directly at the Sun.'],
 ['Water taps turn on and off.','We should close taps to save water.'],
 ['Up is the opposite of down.','Birds can fly high up in the sky.'],
 ['Vans can carry people or goods.','Some delivery workers use vans.'],
 ['Spiders spin webs from silk.','A web can catch insects.'],
 ['An X-ray image can help doctors see bones.','X-rays are used in hospitals.'],
 ['Yaks live in cold, high places.','Yaks can have thick coats of hair.'],
 ['A zoo helps visitors learn about animals.','Different animals need different habitats.']
];
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]});}
function age(){return ageOverride||(root.Mayhem&&root.Mayhem.getAge?root.Mayhem.getAge():'4-6');}
function st(tier){tier=tier||age();if(!progress.age[tier])progress.age[tier]={letter:0,group:0,phase:'study',index:0,chosen:[],completedLetters:0,round:0,completedRounds:0,stars:0};return progress.age[tier];}
function save(){try{localStorage.setItem(KEY,JSON.stringify(progress));}catch(_e){}}
function words(){var s=st(),item=WORDS[s.letter];return item?item.words.slice(s.group===0?0:3,s.group===0?3:5):[];}
function current(){return words()[st().index];}
function readSeconds(){return age()==='4-6'?60:age()==='7-9'?45:35;}
function speak(s){if(root.LittleLettersAndroid&&root.LittleLettersAndroid.speak){root.LittleLettersAndroid.speak(s);return;}if(root.speechSynthesis&&typeof SpeechSynthesisUtterance!=='undefined'){root.speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(s);u.lang='en-IN';u.rate=0.78;root.speechSynthesis.speak(u);}}
function stopClock(){if(clock!==null){clearInterval(clock);clock=null;}if(autoMove!==null){clearTimeout(autoMove);autoMove=null;}}
function schedule(render){var s=st();if(s.phase!=='study'){if(clock!==null){clearInterval(clock);clock=null;}return;}if(clock!==null){clearInterval(clock);clock=null;}
if(!s.expires||s.expires<Date.now()-300000)s.expires=Date.now()+readSeconds()*1000;
function tick(){var el=document.getElementById('gj-countdown'),left=Math.max(0,Math.ceil((s.expires-Date.now())/1000));if(el)el.textContent=''+left+'s';if(left<=0){stopClock();s.phase='recognize';delete s.expires;save();render();}}
tick();if(s.phase==='study')clock=setInterval(tick,250);
}
function choices(){var s=st(),target=current(),pool=WORDS[s.letter].words.filter(function(w){return w.text!==target.text;});pool=pool.concat(WORDS[(s.letter+1)%26].words.slice(0,3));var list=[target].concat(pool.slice(0,age()==='4-6'?2:3));var seed=(s.letter*17+s.index*13+s.group*3)%list.length;return list.slice(seed).concat(list.slice(0,seed));}
function letters(){var w=current(),target=w.text.replace(/[^a-z]/gi,'').toLowerCase(),s=st(),arr=target.split('');
var extras='rstlmnpaoe'.split(''),seed=(s.letter*11+s.index*7+s.group*3)%extras.length;arr.push(extras[seed]);
for(var i=arr.length-1;i>0;i--){var j=(i*7+seed*3+5)%(i+1),tmp=arr[i];arr[i]=arr[j];arr[j]=tmp;}
return arr.map(function(ch,i){return {ch:ch,key:i};});}
function shufflePersist(){var s=st(),target=current()&&current().text;if(!target)return [];if(!s.tileTarget||s.tileTarget!==target){s.tileTarget=target;s.tiles=letters();s.picked=[];save();}return s.tiles;}
function clearTiles(){var s=st();s.picked=[];s.note='';save();}
function afterWord(){var s=st();s.note='';s.index++;s.picked=[];s.tileTarget='';if(s.index>=words().length){if(s.group===0){s.group=1;s.phase='study';s.index=0;s.expires=0;}else{s.completedLetters=Math.max(s.completedLetters,s.letter+1);s.letter++;s.group=0;s.phase=s.letter>=26?'complete':'study';s.index=0;s.expires=0;}}else{s.phase='study';s.expires=0;}save();}
function advance(render){stopClock();autoMove=setTimeout(function(){autoMove=null;afterWord();render();},650);}
function handle(raw,render){var a=String(raw).split(':'),cmd=a[0],s=st();
if(cmd==='ready'&&s.phase==='study'){return;}
if(cmd==='listen'){speak(a[1]==='goal'?(current()?current().text:''):a.slice(1).join(':'));return;}
if(cmd==='picture'&&s.phase==='recognize'){var selected=a.slice(1).join(':'),right=current().text===selected;s.note=right?'Correct! Now build the word.':'Try again. Look closely at the picture.';if(right){s.phase='spell';s.note='';}save();render();return;}
if(cmd==='tile'&&s.phase==='spell'){if(s.note==='⭐ Great spelling!')return;var key=Number(a[1]),ts=shufflePersist();if(ts[key]&&!s.picked.includes(key)){s.picked.push(key);s.note='';}var desired=current().text.replace(/[^a-z]/gi,'').toLowerCase();if(s.picked.length===desired.length){var formed=s.picked.map(function(i){return ts[i].ch;}).join('');if(formed===desired){s.note='⭐ Great spelling!';s.stars++;save();render();advance(render);return;}s.note='Not quite. Try the letters again.';s.picked=[];}
save();render();return;}
if(cmd==='undo'&&s.phase==='spell'){s.picked.pop();s.note='';save();render();return;}
if(cmd==='restart'){stopClock();var tier=age();delete progress.age[tier];save();render();return;}
}
function progressBar(){var s=st(),stage=s.group===0?0:3;var score=s.completedLetters*5+stage+s.index;return '<div class="gj-progress"><b>Letter '+Math.min(26,s.letter+1)+' of 26</b><span>⭐ '+s.stars+'</span></div><div class="gj-progressbar"><i style="width:'+Math.round(Math.min(130,score)/130*100)+'%"></i></div>';}
function card(){var s=st(),L=WORDS[s.letter],w=current();if(!L||!w)return '';
var idx=s.group===0?s.index:s.index+3;
var facts=[FACTS[s.letter][idx]],extra=root.WordFactsV9&&root.WordFactsV9.get?root.WordFactsV9.get(L.letter,w.text):[];
if(extra.length<2&&idx===0)extra=EXTRA_FACTS[s.letter].slice();
while(extra.length<2)extra.push('The word '+w.text.toUpperCase()+' has '+w.text.replace(/[^a-z]/gi,'').length+' letters.');
facts=facts.concat(extra.slice(0,2));
return '<div class="gj-card gj-oneword"><span class="gj-label">LETTER '+L.letter+' · WORD '+(idx+1)+' OF 5</span><div class="gj-letter">'+L.letter+' <small>'+L.letter.toLowerCase()+'</small></div><div class="gj-spell-pic" aria-hidden="true">'+w.emoji+'</div><h1>'+esc(w.text)+'</h1><button class="gj-speak" data-gj="listen:'+esc(w.text)+'">🔊 Hear the word</button><h2>Three things to remember</h2><ol class="gj-threefacts">'+facts.map(function(f){return '<li>'+esc(f)+'</li>';}).join('')+'</ol><div class="gj-timer"><span>Look and remember · then the game begins</span><strong id="gj-countdown">'+readSeconds()+'s</strong></div></div>';}
function recognize(){var s=st(),w=current();if(!w)return '';
return '<div class="gj-card"><span class="gj-label">PICTURE CHALLENGE · '+(s.index+1)+'/'+words().length+'</span><h1>Find <em>'+esc(w.text)+'</em></h1><button class="gj-speak" data-gj="listen:'+esc(w.text)+'">🔊 Hear the word</button><div class="gj-choices">'+choices().map(function(c){return '<button class="gj-choice" data-gj="picture:'+esc(c.text)+'" aria-label="'+esc(c.text)+'"><span>'+c.emoji+'</span><b>'+esc(c.text)+'</b></button>';}).join('')+'</div><p class="gj-note" role="status">'+esc(s.note||'Tap the matching picture.')+'</p></div>';}
function spell(){var s=st(),w=current(),tiles=shufflePersist();if(!w)return '';
return '<div class="gj-card"><span class="gj-label">SPELLING GAME · '+(s.index+1)+'/'+words().length+'</span><h1>Make the word!</h1><div class="gj-spell-pic">'+w.emoji+'</div><button class="gj-speak" data-gj="listen:'+esc(w.text)+'">🔊 Hear it again</button><div class="gj-slots">'+Array.from({length:w.text.replace(/[^a-z]/gi,'').length},function(_,i){return '<span>'+esc(s.picked[i]!==undefined?tiles[s.picked[i]].ch:'_')+'</span>';}).join('')+'</div><div class="gj-tiles">'+tiles.map(function(t){return '<button '+(s.picked.indexOf(t.key)>=0?'disabled':'')+' data-gj="tile:'+t.key+'" aria-label="Letter '+t.ch+'">'+esc(t.ch)+'</button>';}).join('')+'</div><button class="gj-undo" data-gj="undo">↶ Undo last letter</button><p class="gj-note" role="status">'+esc(s.note||'Tap letters in the right order.')+'</p></div>';}
function finish(){return '<div class="gj-card gj-finish"><div class="gj-finish-icon">🏆</div><h1>All 26 letters mastered!</h1><p>You learned five words for every letter. Now the story adventures begin!</p><button class="gj-main" data-gj="to-stories">Play story adventures →</button></div>';}
function alphabetView(){var s=st();return '<div class="gj-root">'+(s.phase==='complete'?'':progressBar())+(s.phase==='study'?card():s.phase==='recognize'?recognize():s.phase==='spell'?spell():finish())+'</div>';}
// 100 sequential story activities. Four deliberately different retrieval activities
// are built around each of 25 source missions; this is not 100 hand-illustrated stories.
function sourceMissions(tier){var list=MISSIONS&&MISSIONS.forAge?MISSIONS.forAge(tier):[];if(!list.length)return [];var out=[];for(var i=0;i<25;i++)out.push(list[i%list.length]);return out;}
function childLevels(tier){var base=sourceMissions(tier),arr=[];for(var i=0;i<100;i++){var m=base[Math.floor(i/4)];arr.push({id:tier+'-'+String(i+1).padStart(3,'0'),number:i+1,mission:m,mode:i%4});}return arr;}
function challengeView(){var s=st(),offset=age()==='4-6'?26:0,levels=childLevels(age()),r=levels[Math.min(99,offset+s.round)];if(!r)return '<div class="gj-root">More stories are coming.</div>';var m=r.mission,mode=r.mode;var artName=/frog/i.test(m.name)?'frog':/wedding|cake/i.test(m.name)?'wedding':/robot|balloon/i.test(m.name)?'balloon':/fox|nest/i.test(m.name)?'fox':null;var art=artName?'<img class="gj-mission-img" src="assets/v8-scenes/'+artName+'.webp" alt="Illustrated '+esc(m.name)+'">':root.ScenePackV6&&root.ScenePackV6.html?root.ScenePackV6.html(m.id,null,m.name):'<div class="gj-mission-emoji">'+(m.scene||'🌟')+'</div>';
var prompts=['Which action helps the story?','What does the action mean?','Choose the correct verb.','Make the story happen!'];var good=m.winVerb,bad=m.oopsVerb,wrong=m.badVerb;
var candidates=mode===0?[good,bad]:mode===1?[good,bad]:mode===2?[good,wrong]:[good,bad,wrong];
if((s.round%2)===1)candidates=candidates.slice().reverse();
var label=mode===1?'Choose the action that fits the goal.':mode===2?'Which verb is right for one '+m.subject+'?':m.goal;
return '<div class="gj-root gj-story"><div class="gj-progress"><b>Adventure '+Math.min(offset+s.round+1,100)+' / 100</b><span>⭐ '+s.stars+'</span></div><div class="gj-progressbar"><i style="width:'+Math.floor((s.round/100)*100)+'%"></i></div><div class="gj-card"><div class="gj-story-art">'+art+'</div><span class="gj-label">'+esc(m.name)+'</span><h1>'+esc(prompts[mode])+'</h1><p>'+esc(label)+'</p><button class="gj-speak" data-gj="challenge-hear">🔊 Listen</button>'+(!s.challengeFeedback?'<div class="gj-story-choices">'+candidates.map(function(x){return '<button data-gj="challenge:'+esc(x)+'">'+esc(x)+'</button>';}).join('')+'</div>':'<div class="gj-feedback"><strong>'+(s.challengeRight?'⭐ Well done!':'Try once more')+'</strong><p>'+esc(s.challengeFeedback)+'</p>'+(s.challengeRight?'<button class="gj-main" data-gj="challenge-next">Next story →</button>':'<button class="gj-main" data-gj="challenge-again">Try again →</button>')+'</div>')+'</div></div>';}
function challengeAction(raw,render){var s=st(),offset=age()==='4-6'?26:0,levels=childLevels(age()),l=levels[Math.min(offset+s.round,99)];if(!l)return;var a=String(raw).split(':'),cmd=a[0],v=a.slice(1).join(':');if(cmd==='challenge-hear'){speak(l.mission.goal);return;}
if(cmd==='challenge'){s.challengeRight=v===l.mission.winVerb;s.challengeFeedback=s.challengeRight?l.mission.winText:(v===l.mission.badVerb?l.mission.rule:l.mission.oopsText);if(s.challengeRight)s.stars+=2;save();render();}
if(cmd==='challenge-again'){s.challengeFeedback='';save();render();}
if(cmd==='challenge-next'){if(!s.challengeRight)return;s.round=Math.min(100,s.round+1);s.completedRounds=Math.max(s.completedRounds,s.round);s.challengeFeedback='';s.challengeRight=false;save();render();}}
function missionView(){var s=st();if(s.round>=(age()==='4-6'?74:100))return '<div class="gj-root"><div class="gj-card gj-finish"><h1>🏆 100 adventures completed!</h1><p>You practised 100 story challenges.</p><button class="gj-main" data-gj="challenge-reset">Play the adventures again</button></div></div>';return challengeView();}
function currentView(){return age()==='4-6'&&st().phase!=='complete'?alphabetView():missionView();}
function act(raw,render){if(raw==='to-stories'){render();return;}if(String(raw).indexOf('challenge-')===0||String(raw).indexOf('challenge:')===0){if(raw==='challenge-reset'){var s=st();s.round=0;s.challengeFeedback='';save();render();return;}challengeAction(raw,render);}else handle(raw,render);}
root.GuidedJourneyV8={view:currentView,alphabet:alphabetView,levels:childLevels,action:act,schedule:schedule,stop:stopClock,age:age,state:st,choices:choices,tiles:shufflePersist,facts:FACTS,previewAge:function(a){ageOverride=a;},readSeconds:readSeconds};
})(window);

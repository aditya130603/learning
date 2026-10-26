/* Word Mayhem v13: thirty real cause-effect missions per child band. All offline. */
(function(root){'use strict';
var KEY='wm-live-missions-v13',ages=['7-9','10-13'],progress={};
try{progress=JSON.parse(localStorage.getItem(KEY))||{};}catch(_){}
var BASIC=[
['inflate','Fill something with air','Inflate the balloon','The balloon grows bigger!','balloon'],
['open','Move a lid or door so you can look inside','Open the surprise box','The toy appears inside!','box'],
['sprout','Begin to grow from a seed','Help the seed sprout','A little green plant grows.','seed'],
['illuminate','Make something bright with light','Switch on the lamp','The room becomes bright.','lamp'],
['freeze','Turn liquid water into ice','Freeze the water','The water becomes ice.','ice'],
['float','Stay on the surface of water','Float the boat','The boat stays on the water.','boat'],
['blend','Mix things together','Blend the paint','Two colours make a new shade.','paint'],
['pull','Move something towards you','Pull the rope','The rope moves closer.','rope'],
['ring','Make a bell sound','Ring the bell','The bell swings and rings.','bell'],
['rotate','Turn around a central point','Rotate the wheel','The wheel spins!','wheel'],
['feed','Give food to a living thing','Feed the bird','The bird flies to its food.','bird'],
['groom','Clean or brush an animal','Groom the cat','The cat looks tidy and content.','cat'],
['fill','Put something into a container','Fill the cup','The cup fills with water.','cup'],
['slice','Cut into pieces','Slice the cake','A slice separates from the cake.','cake'],
['soar','Fly very high','Make the kite soar','The kite lifts high into the sky.','kite'],
['attract','Pull an object towards another','Use the magnet to attract metal','The metal objects move to the magnet.','magnet'],
['absorb','Soak up a liquid','Make the sponge absorb water','The sponge takes up the water.','sponge'],
['blow','Move air towards something','Turn on the fan','The fan blows moving air.','fan'],
['beat','Hit an instrument to make a rhythm','Beat the drum','The drum sounds a lively beat.','drum'],
['expand','Become larger','Expand the small balloon','The balloon becomes much bigger.','balloon'],
['connect','Join two places or things','Connect the bridge','The gap is crossed by a bridge.','bridge'],
['climb','Go up something using your feet and hands','Climb the ladder','The climber reaches a higher step.','ladder'],
['unlock','Open something that was locked','Unlock the door','The locked door opens.','key'],
['navigate','Find your way using directions','Navigate with the treasure map','The map reveals the route.','map'],
['shine','Send out bright light','Shine the torch','The dark cave lights up.','torch'],
['collect','Gather several things','Collect the apples','The basket fills with fruit.','basket'],
['build','Put parts together to make something','Build the bird’s nest','A cosy nest appears.','nest'],
['drizzle','Rain lightly','Make the cloud drizzle','Tiny raindrops fall gently.','cloud'],
['adjust','Change something a little','Adjust the clock hands','The hands move to a new time.','clock'],
['programme','Give instructions to a machine','Programme the robot','The robot wakes and follows instructions.','robot']
];
var ADV=[
['investigate','Examine clues to discover what happened','Investigate the hidden clue','A marked clue reveals the route.','map'],
['transform','Change something into a different form','Transform the water','The water becomes ice.','ice'],
['illuminate','Make something easier to see or understand','Illuminate the dark room','The light reveals what was hidden.','lamp'],
['construct','Build something from parts','Construct a bridge','The bridge connects the two sides.','bridge'],
['predict','Say what is likely to happen','Predict the coming rain','The cloud shows signs of rain.','cloud'],
['replenish','Fill something again after it is used','Replenish the water','The nearly empty cup fills again.','cup'],
['conserve','Use resources carefully to prevent waste','Conserve electricity','The lamp turns off when it is not needed.','lamp'],
['deduce','Reach a conclusion using clues','Deduce where the treasure is','The clues point to an X on the map.','map'],
['cooperate','Work together to reach a goal','Cooperate to pull the rope','The team pulls together.','rope'],
['adapt','Change to suit new conditions','Adapt the kite to the wind','The kite steadies itself in the sky.','kite'],
['reconstruct','Build something again after damage','Reconstruct the broken bridge','The bridge is restored.','bridge'],
['analyse','Study the parts to understand the whole','Analyse the clock mechanism','The moving hands make sense.','clock'],
['evaluate','Judge something using evidence','Evaluate the magnet experiment','You observe which objects move.','magnet'],
['innovate','Introduce a useful new idea or method','Improve the robot design','The robot follows a new command.','robot'],
['persevere','Keep trying despite difficulties','Persevere while climbing','The climber reaches the top.','ladder'],
['coordinate','Arrange actions so they work together','Coordinate the robot’s moves','The robot moves in the right order.','robot'],
['cultivate','Help a plant grow through care','Cultivate the seed','The seed becomes a thriving plant.','seed'],
['mitigate','Make a problem less severe','Mitigate the flood risk','The boat remains safer on the water.','boat'],
['classify','Sort things into meaningful groups','Classify the colourful paints','The colours become organised.','paint'],
['synthesise','Combine parts into something new','Synthesise a new colour','The paint forms a new shade.','paint'],
['stabilise','Make something steady or secure','Stabilise the wheel','The wheel settles into balance.','wheel'],
['demonstrate','Show clearly how something works','Demonstrate the bell','The swinging bell shows the idea.','bell'],
['interpret','Explain what a sign or signal means','Interpret the clock','The hands reveal the chosen time.','clock'],
['formulate','Develop a plan or solution','Formulate a way to unlock the door','The right key opens the lock.','key'],
['anticipate','Expect what may happen next','Anticipate the storm','You see dark clouds gather.','cloud'],
['facilitate','Make an action easier','Facilitate the crossing','The bridge makes travel possible.','bridge'],
['rescue','Save someone from danger','Rescue the hungry bird','The bird receives food safely.','bird'],
['prioritise','Decide what is most important first','Prioritise the urgent task','The robot completes the vital job.','robot'],
['differentiate','Identify how two things differ','Differentiate the balloon sizes','The two balloons look clearly different.','balloon'],
['resolve','Find a solution to a problem','Resolve the missing item mystery','The map reveals the object’s location.','map']
];
function esc(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]});}
function age(){return root.Mayhem&&root.Mayhem.getAge?root.Mayhem.getAge():'7-9';}
function data(){var a=age();if(!progress[a])progress[a]={level:0,stage:0,active:false,picks:[],tiles:[],target:'',wrong:'',xp:0};return progress[a];}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(progress));}catch(_){}}
function list(a){return a==='10-13'?ADV:BASIC;}
function current(){return list(age())[Math.min(29,data().level)];}
function svg(o,on){
var back='<defs><linearGradient id="ksky" x2="0" y2="1"><stop stop-color="#a9dafa"/><stop offset="1" stop-color="#fff3d6"/></linearGradient></defs><rect width="360" height="230" rx="24" fill="url(#ksky)"/><circle cx="300" cy="35" r="22" fill="#fff6bd"/><path d="M0 190 Q100 174 180 194 T360 190 V230 H0Z" fill="#8bd5a9"/>';
var bg='<g stroke="#497295" stroke-width="4" stroke-linecap="round">';
var obj='';
switch(o){
case 'balloon':obj='<path d="M185 154 Q173 177 194 205" fill="none" stroke="#5e5b9f" stroke-width="3"/><ellipse cx="184" cy="'+(on?89:118)+'" rx="'+(on?75:31)+'" ry="'+(on?79:37)+'" fill="#f56d94" stroke="#a53f66" stroke-width="3"/><ellipse cx="'+(on?165:177)+'" cy="'+(on?55:98)+'" rx="12" ry="18" fill="#ffc1d1" opacity=".7"/><path d="M178 '+(on?166:153)+' l7 8 7-8Z" fill="#b23f6b"/>';break;
case 'box':obj='<rect x="100" y="118" width="165" height="89" rx="8" fill="#f0b46e" stroke="#9a603f" stroke-width="5"/><rect x="115" y="131" width="135" height="10" fill="#ffda9b"/>'+(on?'<circle cx="184" cy="96" r="31" fill="#8c7bea"/><circle cx="174" cy="91" r="4" fill="#333"/><circle cx="196" cy="91" r="4" fill="#333"/><path d="M174 108 Q184 118 196 108" fill="none" stroke="#333" stroke-width="3"/>':'')+'<rect x="'+(on?75:95)+'" y="'+(on?38:100)+'" width="185" height="21" rx="6" fill="#c57b4d" stroke="#935c3b" stroke-width="4" transform="'+(on?'rotate(-14 75 38)':'')+'"/>';break;
case 'seed':obj='<path d="M85 187 Q180 156 275 187" fill="#8e5f48" stroke="#85503a" stroke-width="4"/>'+(on?'<path d="M178 181 V110" stroke="#348d58" stroke-width="6" fill="none"/><ellipse cx="155" cy="130" rx="28" ry="13" transform="rotate(25 155 130)" fill="#48b97a"/><ellipse cx="197" cy="119" rx="28" ry="13" transform="rotate(-26 197 119)" fill="#58c67c"/>':'<ellipse cx="179" cy="179" rx="16" ry="10" fill="#e8bd6b"/>');break;
case 'lamp':case 'torch':obj=on?'<path d="M170 73 L80 198 H307Z" fill="#ffe991" opacity=".63"/>':'';obj+='<path d="M177 62 v113" stroke="#5c668a" stroke-width="8"/><path d="M139 89 L155 47 H202 L220 89Z" fill="'+(on?'#ffd76a':'#7182a3')+'" stroke="#4b567e" stroke-width="5"/><path d="M141 185 H215" stroke="#5c668a" stroke-width="9" stroke-linecap="round"/>';break;
case 'ice':obj='<rect x="95" y="90" width="180" height="98" rx="18" fill="#fff" stroke="#7397ac" stroke-width="5"/><rect x="109" y="'+(on?113:154)+'" width="152" height="'+(on?62:25)+'" rx="8" fill="'+(on?'#84d9fc':'#4dadd9')+'"/>'+(on?'<path d="M141 113l22 27-17 22 M206 117l-13 21 23 14" fill="none" stroke="#eaffff" stroke-width="4"/>':'');break;
case 'boat':obj='<path d="M0 177Q60 162 120 177T240 177T360 177V230H0Z" fill="#65bbdf"/><path d="M102 '+(on?152:164)+' H268 L244 '+(on?192:203)+' H130Z" fill="#dc824d" stroke="#98502e" stroke-width="5"/><path d="M177 83 v71" stroke="#5c4c59" stroke-width="6"/><path d="M184 86 L184 151 L249 151Z" fill="#fff9dd"/>';break;
case 'paint':obj='<circle cx="180" cy="152" r="70" fill="#f7eddf" stroke="#b89e85" stroke-width="5"/><circle cx="146" cy="129" r="19" fill="#ed6e74"/><circle cx="213" cy="130" r="19" fill="#5384de"/><circle cx="179" cy="181" r="'+(on?30:18)+'" fill="'+(on?'#a36edc':'#f1b96b')+'"/>';break;
case 'rope':obj='<path d="M72 150 Q130 '+(on?130:90)+' 195 '+(on?153:112)+' T305 137" fill="none" stroke="#b98053" stroke-width="16" stroke-linecap="round"/><circle cx="'+(on?79:125)+'" cy="153" r="22" fill="#ffb6a9"/>';break;
case 'bell':obj='<path d="M180 66 Q123 69 130 159 H231 Q239 71 180 66Z" fill="#f4c65b" stroke="#be8b39" stroke-width="5" transform="'+(on?'rotate(-16 180 65)':'')+'"/><circle cx="180" cy="171" r="15" fill="#d79a32"/>';break;
case 'wheel':obj='<circle cx="181" cy="125" r="76" fill="#9da9c8" stroke="#4c5476" stroke-width="13"/><g transform="rotate('+(on?38:0)+' 181 125)" stroke="#4c5476" stroke-width="8"><path d="M181 49V201 M105 125H257 M127 71L235 179 M235 71L127 179"/></g><circle cx="181" cy="125" r="16" fill="#ffca74"/>';break;
case 'bird':case 'nest':obj='<path d="M95 178 Q180 211 260 178" fill="none" stroke="#9d7050" stroke-width="15"/><ellipse cx="175" cy="'+(on?126:97)+'" rx="39" ry="28" fill="#78acdb"/><circle cx="197" cy="'+(on?107:81)+'" r="18" fill="#78acdb"/><circle cx="204" cy="'+(on?104:79)+'" r="4" fill="#292d4c"/><path d="M216 '+(on?109:85)+' l26 10-26 8Z" fill="#f1b357"/>';break;
case 'cat':obj='<ellipse cx="180" cy="164" rx="60" ry="37" fill="#f4b583"/><circle cx="188" cy="110" r="43" fill="#f4b583"/><path d="M151 88l4-41 27 27M194 72l33-26 2 43" fill="#f4b583" stroke="#ce895e" stroke-width="5"/><circle cx="171" cy="111" r="5"/><circle cx="201" cy="111" r="5"/><path d="M182 123 l9 0-5 7Z" fill="#bb7796"/>'+(on?'<path d="M250 72 l-60 43" stroke="#79537a" stroke-width="9"/>':'');break;
case 'cup':case 'sponge':obj='<path d="M113 82H246L231 196H130Z" fill="#ecfaff" stroke="#6099bd" stroke-width="6"/><path d="M132 '+(on?104:167)+'H228L224 182H135Z" fill="#53bfe0"/>';break;
case 'cake':obj='<path d="M85 112H273V188H85Z" fill="#e8ba89" stroke="#b4795f" stroke-width="4"/><path d="M85 118 Q118 95 151 117 T220 117 T273 117" fill="none" stroke="#fff6f1" stroke-width="18"/>'+(on?'<path d="M221 123 l40 0 36 65-36 0Z" fill="#e8ba89" stroke="#b4795f" stroke-width="4"/>':'');break;
case 'kite':obj='<path d="M177 '+(on?38:102)+'l55 47-55 64-55-64Z" fill="#fe8fa1" stroke="#ad5791" stroke-width="5"/><path d="M177 '+(on?149:210)+' Q155 185 185 218" fill="none" stroke="#8160a6" stroke-width="3"/><path d="M122 '+(on?85:149)+' H232" stroke="#fff" stroke-width="4"/>';break;
case 'magnet':obj='<path d="M113 79V158A67 67 0 0 0 247 158V79" fill="none" stroke="#df6d76" stroke-width="36"/><path d="M113 79V114 M247 79V114" fill="none" stroke="#7db7e9" stroke-width="36"/><circle cx="'+(on?180:281)+'" cy="176" r="14" fill="#e7c268"/><circle cx="'+(on?169:306)+'" cy="196" r="12" fill="#e7c268"/>';break;
case 'fan':obj='<circle cx="183" cy="119" r="86" fill="none" stroke="#95b7c7" stroke-width="6"/><g transform="rotate('+(on?65:0)+' 183 119)"><ellipse cx="183" cy="68" rx="19" ry="44" fill="#64a8b0"/><ellipse cx="232" cy="129" rx="19" ry="44" transform="rotate(115 232 129)" fill="#64a8b0"/><ellipse cx="140" cy="145" rx="19" ry="44" transform="rotate(230 140 145)" fill="#64a8b0"/></g><circle cx="183" cy="119" r="15" fill="#45567f"/>';break;
case 'drum':obj='<ellipse cx="180" cy="113" rx="83" ry="31" fill="#f8e0b5" stroke="#a16c4d" stroke-width="6"/><path d="M99 114V185Q182 230 263 184V114" fill="#dc795f" stroke="#ab5447" stroke-width="6"/>'+(on?'<path d="M120 46l63 73 M256 43l-73 73" stroke="#9c643e" stroke-width="8"/>':'');break;
case 'bridge':obj='<path d="M0 178h360V230H0Z" fill="#5db7d8"/><path d="'+(on?'M54 149H307':'M50 149H128 M236 149H310')+'" stroke="#a37c60" stroke-width="23" fill="none"/><path d="M75 150v54 M287 150v54" stroke="#83695b" stroke-width="8"/>';break;
case 'ladder':obj='<path d="M118 '+(on?45:103)+' L132 210 M242 '+(on?45:103)+' L228 210" stroke="#9e7663" stroke-width="13" fill="none"/><path d="M125 126H236 M128 163H231 M131 193H228" stroke="#9e7663" stroke-width="8"/>';break;
case 'key':obj='<rect x="99" y="46" width="169" height="173" rx="10" fill="#ba8357" stroke="#885837" stroke-width="8" transform="'+(on?'rotate(-9 110 212)':'')+'"/><circle cx="221" cy="135" r="9" fill="#e3c37e"/><circle cx="77" cy="159" r="21" fill="none" stroke="#e3c37e" stroke-width="10"/><path d="M97 159h63l14 13" stroke="#e3c37e" stroke-width="10" fill="none"/>';break;
case 'map':obj='<path d="M85 72l62-16 69 16 62-16v138l-62 16-69-16-62 16Z" fill="#f5dfaa" stroke="#b49766" stroke-width="5"/><path d="M147 55v140 M216 71v140" stroke="#d4b887" stroke-width="3"/><path d="M111 160q48-95 110-44" fill="none" stroke="#c49d66" stroke-width="5" stroke-dasharray="7 10"/>'+(on?'<path d="M225 88l35 35m0-35l-35 35" stroke="#e45252" stroke-width="9"/>':'');break;
case 'basket':obj='<path d="M104 130H262L240 207H124Z" fill="#d9a36a" stroke="#965f41" stroke-width="6"/><path d="M136 129Q182 65 229 129" fill="none" stroke="#965f41" stroke-width="7"/>'+(on?'<circle cx="160" cy="129" r="22" fill="#e8695b"/><circle cx="208" cy="126" r="22" fill="#e8695b"/><circle cx="181" cy="107" r="21" fill="#e8695b"/>':'');break;
case 'cloud':obj='<path d="M88 112Q94 72 127 77Q149 34 192 66Q243 45 259 91Q304 89 300 128H90Z" fill="#effaff" stroke="#9dcbe0" stroke-width="5"/>'+(on?'<path d="M116 157l-11 23 M165 155l-10 23 M215 155l-11 23 M262 156l-11 23" stroke="#4eaee1" stroke-width="7"/>':'');break;
case 'clock':obj='<circle cx="181" cy="123" r="88" fill="#fff9ef" stroke="#647fb7" stroke-width="12"/><circle cx="181" cy="123" r="8" fill="#525d8e"/><path d="M181 123L'+(on?'225 147':'181 66')+' M181 123L'+(on?'180 75':'225 123')+'" stroke="#525d8e" stroke-width="8" stroke-linecap="round"/>';break;
case 'robot':obj='<rect x="125" y="73" width="112" height="104" rx="22" fill="#8acbe2" stroke="#4f779c" stroke-width="7"/><rect x="141" y="51" width="81" height="29" rx="11" fill="#a5ddea"/><circle cx="156" cy="114" r="13" fill="'+(on?'#50d59a':'#536987')+'"/><circle cx="207" cy="114" r="13" fill="'+(on?'#50d59a':'#536987')+'"/><path d="M157 148Q183 '+(on?166:143)+' 207 148" stroke="#4d728c" stroke-width="7" fill="none"/><path d="M181 50V24" stroke="#647fa3" stroke-width="5"/><circle cx="181" cy="20" r="10" fill="#ffc864"/>';break;
default:obj='<circle cx="180" cy="125" r="'+(on?83:58)+'" fill="#8ccde6"/>';
}
return '<svg class="k13-svg" viewBox="0 0 360 230" role="img" aria-label="'+esc(o)+' illustration">'+back+obj+'</svg>';
}
function shuffle(w){var arr=w.split(''),letters='aeiotrs';arr.push(letters[(data().level*7)%letters.length]);for(var i=arr.length-1;i>0;i--){var j=(data().level*13+i*5+3)%(i+1),temp=arr[i];arr[i]=arr[j];arr[j]=temp;}return arr;}
function view(){var s=data(),levels=list(age()),item=levels[s.level];if(!item)return '<section class="k13-root"><div class="k13-panel"><h1>30 adventures complete!</h1><p>You made 30 stories come alive.</p><button class="k13-main" data-k13="replay">Play again →</button></div></section>';
var name=item[0],def=item[1],act=item[2],res=item[3],object=item[4];
var first='<section class="k13-root"><div class="k13-top"><span>ADVENTURE '+(s.level+1)+' / 30</span><b>★ '+s.xp+'</b></div><div class="k13-progress"><i style="width:'+(s.level/30*100)+'%"></i></div><div class="k13-panel"><span class="k13-tag">'+(age()==='7-9'?'WORD MAGIC':'WORDS IN ACTION')+'</span><h1>'+esc(name)+'</h1><p class="k13-def">'+esc(def)+'</p><div class="k13-illustration '+(s.active?'k13-active':'')+'">'+svg(object,s.active)+'</div>';
if(s.stage===0)return first+'<button class="k13-main" data-k13="activate">'+esc(act)+' →</button></div></section>';
if(s.stage===1)return first+'<div class="k13-outcome">✓ '+esc(res)+'</div><button class="k13-main" data-k13="next">What does it mean? →</button></div></section>';
if(s.stage===2){var opts=[def,levels[(s.level+9)%30][1],levels[(s.level+17)%30][1]],rot=s.level%3;opts=opts.slice(rot).concat(opts.slice(0,rot));return first+'<div class="k13-choose">'+opts.map(function(v,i){return '<button data-k13="meaning:'+i+'">'+esc(v)+'</button>';}).join('')+'</div><p class="k13-note">'+esc(s.wrong||'Pick the meaning of the word.')+'</p></div></section>';}
if(s.stage===3){var letters=s.tiles.length?s.tiles:(s.tiles=shuffle(name.replace(/[^a-z]/gi,'').toLowerCase()),persist(),s.tiles),used=s.picks||[];
return '<section class="k13-root"><div class="k13-top">SPELL IT <b>ADVENTURE '+(s.level+1)+'/30</b></div><div class="k13-panel"><span class="k13-tag">REMEMBER THE WORD</span><h1>Spell what happened!</h1><div class="k13-illustration">'+svg(object,true)+'</div><div class="k13-slots">'+name.replace(/[^a-z]/gi,'').split('').map(function(_,i){return '<span>'+(used[i]!==undefined?esc(letters[used[i]]):'')+'</span>';}).join('')+'</div><div class="k13-tiles">'+letters.map(function(ch,i){return '<button data-k13="tile:'+i+'" '+(used.indexOf(i)>=0?'disabled':'')+'>'+esc(ch)+'</button>';}).join('')+'</div><button class="k13-mini" data-k13="undo">↶ Undo</button><p class="k13-note">'+esc(s.wrong||'Tap the letters in the right order.')+'</p></div></section>';}
return '<section class="k13-root"><div class="k13-panel"><h1>★ Well done!</h1><p>You learned <strong>'+esc(name)+'</strong>.</p><p>'+esc(def)+'</p><div class="k13-illustration">'+svg(object,true)+'</div><button class="k13-main" data-k13="complete">Next adventure →</button></div></section>';
}
function handle(raw,render){var s=data(),x=String(raw).split(':'),cmd=x[0],v=x[1],item=current();if(!item)return;if(cmd==='activate'&&s.stage===0){s.active=true;s.stage=1;s.wrong='';persist();render();return;}
if(cmd==='next'&&s.stage===1){s.stage=2;persist();render();return;}
if(cmd==='meaning'&&s.stage===2){var right=(3-s.level%3)%3;if(Number(v)===right){s.stage=3;s.wrong='';}else s.wrong='Try again. Remember what the action did!';persist();render();return;}
if(cmd==='tile'&&s.stage===3){var k=Number(v),w=item[0].replace(/[^a-z]/gi,'').toLowerCase(),letters=s.tiles;if(!letters[k]||s.picks.indexOf(k)>=0)return;s.picks.push(k);if(s.picks.length===w.length){var built=s.picks.map(function(i){return letters[i];}).join('');if(built===w){s.stage=4;s.xp+=10;s.wrong='';}else{s.picks=[];s.wrong='Nearly! Try those letters again.';}}persist();render();return;}
if(cmd==='undo'&&s.stage===3){s.picks.pop();s.wrong='';persist();render();return;}
if(cmd==='complete'&&s.stage===4){s.level++;s.stage=0;s.active=false;s.picks=[];s.tiles=[];s.wrong='';persist();render();return;}
if(cmd==='replay'){progress[age()]={level:0,stage:0,active:false,picks:[],tiles:[],target:'',wrong:'',xp:0};persist();render();}
}
root.LiveKidsV13={view:view,handle:handle,levels:list,state:data,svg:svg};
})(window);
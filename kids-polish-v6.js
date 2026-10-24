/* Accessibility-first kid home. 4–6 has a single play action; older kids see small story worlds. */
(function(w){'use strict';var K=w.KidV5,G=w.WORD_MAYHEM;if(!K||!G)return;
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]});}
var existing=K.hub;function hub(){var tier=K.age(),missions=G.forAge(tier),next=missions.find(function(m){return !K.state.completed[m.id]})||missions[0];if(!next)return existing();
var art=w.ScenePackV6?w.ScenePackV6.html(next.id,null,next.name):'<div class="kp-fallback">'+esc(next.name)+'</div>';
var hero='<section class="kp-hero"><div class="kp-cover">'+art+'</div><div class="kp-copy"><span class="kp-tag">'+(tier==='4-6'?'LET’S PLAY':'YOUR NEXT STORY')+'</span><h1>'+ (tier==='4-6'?'Tap. Listen. Choose.': 'A new story is waiting.')+'</h1><p>'+esc(next.goal)+'</p><button class="kp-play" data-k5="next">▶ '+(tier==='4-6'?'Play story':'Continue adventure')+'</button></div></section>';
if(tier==='4-6')return '<div class="kp-root kp-small"><div class="kp-status">⭐ '+K.state.stars+' stars</div>'+hero+'<div class="kp-simple-links"><button data-nav="letters">🔤 Letter Garden</button><button data-action="start-match-home">◉ Picture Game</button></div></div>';
var names=tier==='7-9'?['Animal adventures','Food & festivals','Science magic','Everyday kindness','Mystery maps','Brave helpers']:['Mystery & discovery','Science and evidence','Words with impact','Everyday decisions','The great outdoors','Challenges & solutions'];
var groups=[];for(var i=0;i<missions.length;i+=4){var segment=missions.slice(i,i+4),done=segment.filter(function(m){return K.state.completed[m.id]}).length;groups.push('<section class="kp-world"><div class="kp-world-title"><b>'+esc(names[Math.floor(i/4)%names.length])+'</b><span>'+done+' / '+segment.length+' stories</span></div><div class="kp-story-list">'+segment.map(function(m,j){return '<button data-k5="open:'+esc(m.id)+'" aria-label="Play '+esc(m.name)+'" class="kp-story"><span class="kp-num">'+(i+j+1)+'</span><span><b>'+esc(m.name)+'</b><small>'+esc(m.goal)+'</small></span><strong>'+(K.state.completed[m.id]?'✓':'▶')+'</strong></button>'}).join('')+'</div></section>');}
return '<div class="kp-root"><div class="kp-status">⭐ '+K.state.stars+' stars · '+K.count()+'/'+missions.length+' adventures</div>'+hero+'<div class="kp-worlds">'+groups.join('')+'</div><div class="kp-simple-links"><button data-nav="challenge">Play a friend challenge</button><button data-nav="letters">ABC & spelling</button></div></div>';
}
K.hub=hub;
})(window);

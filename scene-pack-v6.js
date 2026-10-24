/* Image generated specifically for Word Mayhem, cropped visually by CSS into 12 scene cards. */
(function(root){'use strict';
var sets=[['kitten','puppy','dog','rabbit','mouse','panda','bird','bee','turtle','fox','gardener','farmer','kid'],['frog','duck','pond','water'],['wedding','cake','chef','festival'],['balloon','robot','birthday'],['pirate','captain','island','map'],['storm','pilot','ranger','fire'],['bridge','architect','building'],['museum','painting','curator','renaissance'],['watch','meticulous','precision','chemist'],['ephemeral','flower','serendipity'],['idiom','friend','rapport','ice'],['science','inventor','journalist','library','astronaut']];
// Sprite positions in a 4-column by 3-row illustration grid.
var panels=[11,9,8,10,5,4,4,0,1,2,7,3];
function panel(word){var s=String(word||'').toLowerCase();for(var i=0;i<sets.length;i++)if(sets[i].some(function(x){return s.indexOf(x)>=0;}))return panels[i];return s.length%12;}
function html(word,result,alt){var ix=panel(word),x=ix%4,y=Math.floor(ix/4);return '<div role="img" aria-label="'+escapeHtml(alt||'Illustrated story scene')+'" class="sp-scene '+(result==='win'?'sp-success':result==='oops'?'sp-oops':'')+'" style="background-position:'+((x/3)*100)+'% '+((y/2)*100)+'%"></div>';}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]});}
root.ScenePackV6={html:html,panel:panel};
})(window);

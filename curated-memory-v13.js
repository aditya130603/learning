/* Curated semantic memory cues. The cues are mnemonics, not true etymologies. */
(function(root){'use strict';
var rows=[
['resilient','A tiny seedling bends under a rock then springs upright after the storm.','recovering','fragile','The resilient community rebuilt after the flood.','sprout'],
['subtle','A tiny silver thread is almost invisible in a vast tapestry.','delicate','obvious','She noticed a subtle change in his expression.','magnify'],
['vivid','A grey sketch bursts into bright living colours.','striking','dull','He gave a vivid account of the journey.','paint'],
['articulate','A speaker turns tangled speech bubbles into clear, orderly words.','eloquent','inarticulate','She articulated her position clearly.','speech'],
['coherent','Separate puzzle pieces click into a single clear picture.','logical','confused','The explanation was coherent.','puzzle'],
['pragmatic','A builder repairs a bridge using workable parts instead of arguing about a perfect plan.','practical','impractical','We chose a pragmatic solution.','bridge'],
['ambiguous','A road sign points left AND right, neither marked as correct.','unclear','unambiguous','His answer was ambiguous.','sign'],
['equanimity','A level lake stays perfectly calm in the middle of a fierce storm.','composure','agitation','She faced criticism with equanimity.','balance'],
['esoteric','Only a few astronomers understand the symbols on a secret star map.','specialised','widely understood','The debate became esoteric.','stars'],
['perspicacious','Percy the SPY catches a clue that everyone else missed. PERS-PIC-ACIOUS means perceptive.','perceptive','obtuse','Her perspicacious remark exposed the error.','magnify'],
['quintessential','A golden stamp marks the PERFECT example among hundreds of ordinary ones.','archetypal','untypical','That cottage is quintessentially English.','crown'],
['ineffable','A sunset is so beautiful that no words will come out of your mouth.','indescribable','expressible','She felt ineffable joy.','sunset'],
['mellifluous','MELLOW music FLOWS like sweet honey through a golden flute.','sweet-sounding','harsh','Her mellifluous voice filled the hall.','music'],
['vicissitude','A twisting road climbs high, plunges low, and keeps changing direction.','changes of fortune','stability','They weathered life’s vicissitudes.','road'],
['sagacious','A sage at a chessboard sees a clever move everyone else overlooked.','wise','foolish','His sagacious advice prevented mistakes.','chess'],
['laconic','One person makes a sharp point using just three words.','brief','wordy','His laconic reply surprised us.','speech'],
['loquacious','An enormous fountain of speech bubbles comes from one talkative person.','talkative','reserved','Our loquacious host entertained everyone.','speech'],
['quixotic','Don Quixote charges a windmill to fulfil an impossible ideal.','unrealistically idealistic','pragmatic','The plan was quixotic.','windmill'],
['ubiquitous','The same glowing lamp appears in every single window across the city.','everywhere','rare','Smartphones have become ubiquitous.','city'],
['evanescent','A floating soap bubble glimmers and disappears in the sunlight.','vanishing','enduring','The light was evanescent.','sunset'],
['unequivocal','One huge arrow points straight ahead with no other direction possible.','unambiguous','ambiguous','She gave an unequivocal answer.','sign'],
['incisive','A sharpened pencil cuts to the important point of a tangled problem.','penetrating','vague','He asked an incisive question.','magnify'],
['judicious','A careful judge weighs two pieces of evidence on balanced scales.','wise','rash','Make a judicious choice.','balance'],
['salient','One bright red point stands out among hundreds of pale dots.','important','minor','She explained the salient findings.','magnify'],
['forthright','A person walks out from behind a door to speak the truth directly.','direct','evasive','Her response was forthright.','door'],
['substantiation','A claim stands on a tall stack of receipts and documented proof.','verification','','The allegation required substantiation.','books'],
['rapport','Two strangers build a tiny bridge of trust while they talk.','connection','distance','The doctor built rapport with the child.','bridge'],
['concession','Two negotiators each take one step towards the centre of a bridge.','compromise','refusal','They offered a concession.','bridge'],
['reciprocity','Two people exchange the same kindness in opposite directions.','mutual exchange','one-sidedness','The relationship relies on reciprocity.','exchange'],
['counteroffer','A second proposal card slides beside the first offer on a negotiating table.','revised proposal','','We submitted a counteroffer.','books'],
['anchoring','The first price tag falls like an ANCHOR, pulling all later prices towards it.','initial reference point','','The seller used anchoring.','anchor'],
['framing','The same painting appears very different when surrounded by a different frame.','presentation angle','','Framing can influence decisions.','paint'],
['lucid','A lighthouse switches on and a foggy landscape suddenly looks clear.','clear','confusing','She gave a lucid explanation.','lighthouse'],
['elucidate','A bright lamp reveals how a confusing puzzle fits together.','clarify','obscure','The chart helped elucidate the results.','lighthouse'],
['poignant','An old photograph brings a smile and tears at the same moment.','moving','unemotional','The ending was poignant.','portrait'],
['tacit','Two colleagues silently nod because they share an unspoken agreement.','unspoken','explicit','The arrangement had tacit approval.','speech'],
['circumspect','An explorer walks carefully around a deep hole before taking a step.','cautious','rash','Be circumspect when sharing data.','road'],
['discernment','A detective sorts real clues from distracting, shiny objects.','good judgement','confusion','Her discernment saved time.','magnify'],
['serendipity','Sara takes a wrong turn and accidentally discovers the very book she needed.','happy accident','misfortune','The discovery was pure serendipity.','road'],
['renaissance','A DEAD RANI suddenly takes a BREATH. Her sleeping palace awakens with new art, music and learning. This is a memory cue, not the real pronunciation.','revival','decline','The district experienced a cultural renaissance.','crown']
];
var map={};rows.forEach(function(x){map[x[0]]={hook:x[1],syn:x[2],ant:x[3],example:x[4],scene:x[5]};});
function shape(scene){var s='';
if(scene==='sprout')s='<path d="M50 195H430" stroke="#b17a54" stroke-width="15"/><path d="M242 198V87" stroke="#46bc7b" stroke-width="10"/><ellipse cx="207" cy="122" rx="39" ry="21" transform="rotate(24 207 122)" fill="#62e6a3"/><ellipse cx="277" cy="110" rx="39" ry="21" transform="rotate(-24 277 110)" fill="#62e6a3"/>';
else if(scene==='magnify')s='<circle cx="211" cy="103" r="77" stroke="#ead7a4" stroke-width="15" fill="#7dcbd8" fill-opacity=".5"/><path d="M265 159L361 230" stroke="#edbe93" stroke-width="25" stroke-linecap="round"/><circle cx="202" cy="98" r="15" fill="#f9eab6"/>';
else if(scene==='balance')s='<path d="M242 51V219M148 220H337M115 97H370" stroke="#e7ce9c" stroke-width="10" fill="none"/><path d="M133 100L100 170H166Z M349 100L314 170H384Z" fill="#95bfca" stroke="#ead4a7" stroke-width="5"/>';
else if(scene==='sign')s='<path d="M245 50V222" stroke="#d2b78f" stroke-width="15"/><path d="M239 80H80L37 108L80 135H239Z" fill="#86c2d8"/><path d="M252 135H407L452 162L407 188H252Z" fill="#ffd68f"/>';
else if(scene==='bridge')s='<path d="M0 188Q60 152 120 190T260 190T500 190V260H0Z" fill="#5db3d0"/><path d="M55 137H445" stroke="#edc28b" stroke-width="27"/><path d="M100 137V211M395 137V211" stroke="#aa825e" stroke-width="12"/>';
else if(scene==='speech')s='<path d="M97 70H397V173H279L231 214V173H97Z" fill="#d9eff4" stroke="#8ab9cf" stroke-width="8"/><circle cx="160" cy="121" r="14" fill="#537a9f"/><circle cx="240" cy="121" r="14" fill="#537a9f"/><circle cx="319" cy="121" r="14" fill="#537a9f"/>';
else if(scene==='music')s='<path d="M176 54V171Q134 144 117 182Q116 215 169 204V87L325 63V155Q279 133 266 167Q263 202 314 194V46Z" fill="#ffe2a5" stroke="#ae8157" stroke-width="5"/>';
else if(scene==='windmill')s='<path d="M213 222L229 74H265L289 222Z" fill="#ecbd9c"/><circle cx="246" cy="77" r="17" fill="#f5d18e"/><path d="M240 56L204 10 228 0 261 57 M270 79L337 43 351 68 265 99 M255 101L301 169 275 185 234 106 M224 86L166 123 152 103 228 68Z" fill="#f5e2c4"/>';
else if(scene==='lighthouse')s='<path d="M217 213L235 60H277L295 213Z" fill="#f1e8dd" stroke="#c09e97" stroke-width="6"/><path d="M238 133H282M241 164H284" stroke="#e68d7b" stroke-width="15"/><rect x="229" y="35" width="56" height="31" fill="#ffda7d"/><path d="M250 50L45 95M253 50L453 99" stroke="#ffeaba" stroke-width="29" opacity=".45"/>';
else if(scene==='sunset')s='<circle cx="325" cy="88" r="57" fill="#ffd480"/><path d="M0 193Q115 151 256 196T500 194V270H0Z" fill="#ab7fa7"/>';
else if(scene==='books')s='<rect x="128" y="65" width="73" height="157" rx="8" fill="#9876cf"/><rect x="206" y="51" width="72" height="171" rx="8" fill="#e6a16f"/><rect x="283" y="90" width="73" height="132" rx="8" fill="#88d4b9"/><path d="M105 226H380" stroke="#f4dbb0" stroke-width="12"/>';
else if(scene==='stars')s='<g fill="#ffe9ba"><circle cx="127" cy="68" r="9"/><circle cx="326" cy="50" r="12"/><circle cx="269" cy="157" r="15"/><circle cx="392" cy="139" r="10"/><circle cx="98" cy="179" r="11"/></g>';
else if(scene==='crown')s='<path d="M126 100L165 174H337L382 96 311 143 251 69 187 144Z" fill="#f6ca78" stroke="#ffe7aa" stroke-width="7"/><rect x="166" y="180" width="170" height="25" rx="8" fill="#ffeab1"/>';
else if(scene==='paint')s='<circle cx="240" cy="138" r="95" fill="#f9ead3" stroke="#c8ad91" stroke-width="8"/><circle cx="210" cy="102" r="22" fill="#ed8187"/><circle cx="280" cy="102" r="22" fill="#78b1e5"/><circle cx="268" cy="177" r="22" fill="#eaca64"/><circle cx="183" cy="171" r="22" fill="#73cda8"/>';
else if(scene==='exchange')s='<path d="M103 115H397M397 115L360 86M397 115L360 143M397 183H103M103 183L140 151M103 183L140 212" stroke="#f4d5a3" stroke-width="12" stroke-linecap="round" fill="none"/>';
else if(scene==='road')s='<path d="M167 260Q222 190 214 65H277Q261 178 370 260Z" fill="#b0a4bb"/><path d="M244 241L244 186M244 155V110" stroke="#ffe8a8" stroke-width="8" stroke-dasharray="13 11"/>';
else s='<path d="M98 183Q244 39 405 172" stroke="#f5ce93" stroke-width="14" fill="none"/><circle cx="246" cy="129" r="26" fill="#f4d7a3"/>';
return s;
}
function art(word){var x=map[word];if(!x)return '';return '<svg viewBox="0 0 500 270" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Visual memory: '+word+'" style="height:100%;width:100%"><defs><linearGradient id="mbg" x2="0" y2="1"><stop stop-color="#102a4a"/><stop offset="1" stop-color="#533f70"/></linearGradient></defs><rect width="500" height="270" rx="15" fill="url(#mbg)"/>'+shape(x.scene)+'<rect x="18" y="10" width="464" height="33" rx="10" fill="#12283d" opacity=".84"/><text x="250" y="33" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-size="21" fill="#ffe1a3">'+word+'</text></svg>';}
root.CuratedMemoryV13={get:function(w){return map[w]||null;},count:rows.length,terms:rows.map(function(x){return x[0];}),art:art};
if(root.MnemonicScenesV13){var older=root.MnemonicScenesV13.render;root.MnemonicScenesV13.render=function(word){return older(word)||art(word);};}
})(window);
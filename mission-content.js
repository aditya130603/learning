/* Word Mayhem authored offline story missions. No third-party AI service. */
(function(root){
"use strict";
var ages=[
{id:"4-6",label:"4–6",name:"Little explorers",icon:"🧸"},
{id:"7-9",label:"7–9",name:"Word adventurers",icon:"🚀"},
{id:"10-13",label:"10–13",name:"Story makers",icon:"🧩"},
{id:"14-17",label:"14–17",name:"Language lab",icon:"⚡"},
{id:"18+",label:"18+",name:"Everyday mastery",icon:"🎯"}];
var rows=[
["kitten","4-6","Wake the kitten","🐱","Help the kitten reach breakfast.","cat","jumps","sleeps","jump","", "🌤️ 🥣","🐱 🐾 🥣","😴 🐱 🥣","The kitten hops up for breakfast!","The kitten naps through breakfast.","jumps:move up quickly|sleeps:rest"],
["frog","4-6","Cross the puddle","🐸","Help the frog cross the water.","frog","hops","naps","hop","","🌧️ 💧","🐸 💦 🌿","🐸 💤 💧","Boing! The frog hops across!","The frog naps by the puddle.","hops:small jumps|naps:short sleeps"],
["duck","4-6","Duck on the pond","🦆","Help the duck move through the water.","duck","swims","sleeps","swim","","🦆 🏞️","🦆 🌊 🌼","🦆 💤 🏞️","The duck swims across!","The duck falls asleep.","swims:moves through water|sleeps:rests"],
["wedding","7-9","Save the wedding cake","🐧","Get the cake to the wedding safely.","penguin","carries","eats","carry","the cake","🐧 🎂 💒","🐧 🎂 💒 🎉","🐧 😋 🍰","The penguin delivers the cake!","Oops! The penguin eats the cake.","carries:moves something safely|eats:has food"],
["balloon","7-9","Birthday balloon","🤖","Fill the balloon for the party.","robot","inflates","pops","inflate","the balloon","🤖 🎈 🎊","🤖 🎈 🎉","🤖 💥 😲","Balloon inflated! Party time!","Pop! The balloon bursts.","inflates:fills with air|pops:bursts"],
["puppy","7-9","Puppy rescue","🐶","Bring the ball back.","puppy","fetches","buries","fetch","the ball","🐶 🌳 ⚽","🐶 ⚽ 🥳","🐶 🦴 🌳","The puppy fetches the ball!","The puppy buries the ball.","fetches:brings back|buries:hides underground"],
["pirate","10-13","The pirate puzzle","🏴‍☠️","Keep the treasure away from rivals.","pirate","hides","sells","hide","the treasure","🏴‍☠️ 🗺️ 💎","🏴‍☠️ 🏝️ 🔐","🏴‍☠️ 💰 🥷","The pirate hides the treasure.","The pirate sells the treasure!","hides:puts out of sight|sells:trades for money"],
["spaceship","10-13","Space station rescue","👩‍🚀","Make the broken spaceship safe again.","astronaut","repairs","abandons","repair","the spaceship","👩‍🚀 🚀 🛠️","👩‍🚀 🛠️ 🚀 ✨","👩‍🚀 🚀 💨","Spaceship repaired! Mission saved.","The astronaut abandons the ship!","repairs:fixes something broken|abandons:leaves behind"],
["library","10-13","Library chaos","📚","Put all the books in order.","student","organizes","scatters","organize","the books","📚 🧑‍🎓 🌀","📚 📖 ✨","📚 🎉 🤹","The books are organized!","Books scattered everywhere!","organizes:puts in order|scatters:spreads around"],
["storm","14-17","Storm warning","🌩️","Protect the town before a storm.","officer","issues","ignores","issue","the warning","🌩️ 🏙️ 📡","🏙️ 🛡️ 🌤️","🌪️ 🏙️","The town receives the warning.","The officer ignores the warning.","issues:formally sends out|ignores:does not notice"],
["science","14-17","Lab experiment","🧪","Check the results before publishing.","researcher","verifies","invents","verify","the results","🧪 📈 🔬","🧪 ✅ 📊","🧪 🤯 ❌","The results are verified!","The researcher invents results.","verifies:checks accuracy|invents:makes up"],
["budget","18+","Save the project budget","📊","Reduce financial harm to the project.","manager","mitigates","exaggerates","mitigate","the losses","📊 💸 🧑‍💼","📊 🛡️ 💼","📊 📉 😱","The manager mitigates the losses.","The manager exaggerates the losses.","mitigates:makes harm less severe|exaggerates:overstates"],
["terms","18+","Close the partnership","🤝","Reach fair terms with a partner.","team","negotiates","rejects","negotiate","the terms","🤝 📝 💬","🤝 ✅ 📄","😠 💥 📄","Both sides agree on the terms!","The team rejects the terms.","negotiates:discusses to agree|rejects:refuses"],
["crisis","18+","Calm the customer","📞","Handle the concern professionally.","advisor","acknowledges","dismisses","acknowledge","the concern","📞 😟 🧑‍💼","📞 🙂 🌟","📞 😤 🔥","The concern is acknowledged.","The advisor dismisses the concern.","acknowledges:recognizes as important|dismisses:rejects without consideration"]];
var missions=rows.map(function(r){
var obj=r[9]?r[9].split(" "):[];
var meaning={};r[15].split("|").forEach(function(part){var a=part.split(":");meaning[a[0]]=a.slice(1).join(":")});
return {id:r[0],age:r[1],name:r[2],scene:r[3],goal:r[4],subject:r[5],winVerb:r[6],oopsVerb:r[7],badVerb:r[8],object:obj,base:r[10],win:r[11],oops:r[12],winText:r[13],oopsText:r[14],meaning:meaning,tiles:["The",r[5],r[6],r[7],r[8]].concat(obj)};
});
function evaluate(m,list){
var t=list.map(function(w){return String(w).toLowerCase()});
var suffix=m.object.map(function(w){return w.toLowerCase()});
var make=function(verb){return ["the",m.subject,verb].concat(suffix)};
var equals=function(pattern){return t.length===pattern.length&&t.every(function(w,i){return w===pattern[i]})};
if(equals(make(m.badVerb)))return {type:"grammar",at:2,message:"One "+m.subject+" needs “"+m.winVerb+"”, not “"+m.badVerb+"”."};
if(equals(make(m.winVerb)))return {type:"win",message:m.winText};
if(equals(make(m.oopsVerb)))return {type:"oops",message:m.oopsText};
if(t.length!==3+suffix.length)return {type:"incomplete",at:Math.max(0,t.length-1),message:"Build a "+(3+suffix.length)+"-word sentence first."};
var good=make(m.winVerb);return {type:"order",at:t.findIndex(function(w,i){return w!==good[i]})===-1?0:t.findIndex(function(w,i){return w!==good[i]}),message:"Put the words in order: who acts, what they do, then the object."};
}
root.WordMayhemData={ages:ages,missions:missions,evaluate:evaluate,forAge:function(age){return missions.filter(function(m){return m.age===age})}};
})(window);

/* Offline-friendly spelling practice for ages 4-6.
   Each answer is genuinely shuffled, has plausible extra letters, and varies across retries.
   All tiles are independent, accessible controls. No baked-in image/text answers.
*/
(function (root) {
  "use strict";
  var confuse = {
    A:"EO", B:"DP", C:"GK", D:"BT", E:"AI", F:"PV", G:"CJ", H:"NM",
    I:"YE", J:"GI", K:"CX", L:"IT", M:"NW", N:"MH", O:"AU", P:"BQ",
    Q:"PO", R:"BL", S:"CZ", T:"IF", U:"VO", V:"WU", W:"MV", X:"KS",
    Y:"IV", Z:"SX"
  };
  var chunks = {
    ASTRONAUT:["AS","TRO","NAUT"], ELEPHANT:["ELE","PHANT"],
    JELLYFISH:["JEL","LY","FISH"], XYLOPHONE:["XY","LO","PHONE"],
    QUESTION:["QUES","TION"], UMBRELLA:["UM","BREL","LA"],
    RAINBOW:["RAIN","BOW"], VOLCANO:["VOL","CA","NO"],
    UNIFORM:["UNI","FORM"], GUITAR:["GUI","TAR"], OCTOPUS:["OC","TO","PUS"],
    INSECT:["IN","SECT"], BANANA:["BA","NA","NA"], FLOWER:["FLOW","ER"]
  };
  function clean(s) { return String(s || "").toUpperCase().replace(/[^A-Z]/g, ""); }
  function splitWord(s) {
    var word=clean(s);
    if(chunks[word]) return chunks[word].slice();
    if(word.length<=6) return [word];
    var parts=[],at=0;
    while(at<word.length) {
      var remaining=word.length-at;
      var width=remaining<=5 ? remaining : (remaining===6 ? 3 : 4);
      parts.push(word.slice(at,at+width));
      at+=width;
    }
    return parts;
  }
  function nativeRandom() {
    try {
      if(typeof crypto!=="undefined" && crypto.getRandomValues) {
        var raw=new Uint32Array(1); crypto.getRandomValues(raw);
        return raw[0]/4294967296;
      }
    } catch(err){}
    return Math.random();
  }
  function randomIndex(length, rng) { return Math.max(0,Math.min(length-1,Math.floor((rng||nativeRandom)()*length))); }
  function shuffle(items,rng) {
    var arr=items.slice();
    for(var i=arr.length-1;i>0;i--) {
      var k=randomIndex(i+1,rng),tmp=arr[i]; arr[i]=arr[k]; arr[k]=tmp;
    }
    return arr;
  }
  function chooseDistractors(chunk, count, rng) {
    var letters=clean(chunk).split(""), present={};
    letters.forEach(function(letter){present[letter]=true;});
    var primary=[];
    letters.forEach(function(letter) {
      (confuse[letter]||"").split("").forEach(function(other) {
        if(!present[other] && primary.indexOf(other)<0)primary.push(other);
      });
    });
    var remainder="AEIONRTSCLUMBDPGHKFVWYZXQJ".split("").filter(function(ch){return !present[ch]&&primary.indexOf(ch)<0;});
    var choices=shuffle(primary,rng).concat(shuffle(remainder,rng));
    return choices.slice(0,count);
  }
  function makeRound(chunk,opts) {
    opts=opts||{};
    var goal=clean(chunk);
    if(!goal)throw Error("Cannot practice an empty word");
    var rng=opts.rng||nativeRandom;
    var extras=goal.length<=3?1:2;
    if(opts.bonus && goal.length<=5)extras=2;
    extras=Math.min(extras,opts.maxExtras==null?3:Math.max(1,opts.maxExtras));
    var all=goal.split("").concat(chooseDistractors(goal,extras,rng));
    var tiles=all.map(function(ch,id){return {ch:ch,id:id};});
    // Avoid the trivial left-to-right solution and obvious complete-word substring.
    var arranged=null;
    for(var attempt=0;attempt<40;attempt++) {
      var next=shuffle(tiles,rng);
      var letters=next.map(function(tile){return tile.ch;}).join("");
      if(next[0].ch!==goal[0] && letters.indexOf(goal)===-1) {arranged=next;break;}
    }
    if(!arranged) {
      // Constant/random-source fallback: deterministic interleaving, with a
      // different initial symbol than the first answer letter.
      var distractor=tiles.filter(function(t){return goal.indexOf(t.ch)<0;})[0];
      arranged=[distractor].concat(tiles.filter(function(t){return t.id!==distractor.id;}).reverse());
    }
    return {goal:goal,tiles:arranged};
  }
  function evaluate(goal, ids, tiles) {
    var submitted=ids.map(function(id) {
      var tile=tiles.filter(function(t){return t.id===id;})[0];
      return tile?tile.ch:"";
    }).join("");
    var expected=clean(goal);
    var wrong=-1;
    for(var i=0;i<expected.length;i++)if(submitted.charAt(i)!==expected.charAt(i)){wrong=i;break;}
    return {correct:submitted===expected, submitted:submitted, firstMismatch:wrong, expectedAtMismatch:wrong>=0?expected.charAt(wrong):"", actualAtMismatch:wrong>=0?submitted.charAt(wrong):""};
  }
  function hint(goal, attempts, manual) {
    var answer=clean(goal);
    if(manual || attempts>=2) return "Listen carefully. The first letter is "+answer[0]+".";
    return "Listen to the word, then try the letters in a different order.";
  }
  var api={clean:clean,splitWord:splitWord,shuffle:shuffle,chooseDistractors:chooseDistractors,makeRound:makeRound,evaluate:evaluate,hint:hint};
  root.Little46Spelling=api;
  if(typeof module!=="undefined" && module.exports)module.exports=api;
})(typeof window!=="undefined"?window:globalThis);

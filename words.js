/* Small, familiar words first. Special case: English has very few easy X-starting words.
   The last three X words show its ending sound, and are labelled accordingly. */
window.WORD_BANK=[
  ["A",["ant","🐜"],["apple","🍎"],["arm","💪"],["axe","🪓"],["air","🌬️"]],
  ["B",["bat","🏏"],["bag","🎒"],["bus","🚌"],["bed","🛏️"],["ball","⚽"]],
  ["C",["cat","🐱"],["car","🚗"],["cup","🥤"],["cap","🧢"],["cow","🐄"]],
  ["D",["dog","🐶"],["dad","👨"],["den","🛖"],["duck","🦆"],["doll","🪆"]],
  ["E",["egg","🥚"],["ear","👂"],["eye","👁️"],["eat","🍽️"],["elf","🧝"]],
  ["F",["fan","🪭"],["fox","🦊"],["fish","🐟"],["fun","🎉"],["fig","🌳"]],
  ["G",["goat","🐐"],["girl","👧"],["gift","🎁"],["gate","🚪"],["game","🎮"]],
  ["H",["hat","🎩"],["hen","🐔"],["hut","🛖"],["hop","🐰"],["hand","✋"]],
  ["I",["ink","🖋️"],["ice","🧊"],["igloo","🏠"],["in","📥"],["insect","🐞"]],
  ["J",["jam","🍓"],["jet","✈️"],["jug","🫗"],["jar","🫙"],["jeep","🚙"]],
  ["K",["key","🔑"],["kid","🧒"],["kite","🪁"],["king","👑"],["kit","🧰"]],
  ["L",["leg","🦵"],["log","🪵"],["lip","👄"],["lid","🫙"],["lion","🦁"]],
  ["M",["man","👨"],["mat","🧘"],["map","🗺️"],["mop","🧹"],["moon","🌙"]],
  ["N",["net","🥅"],["nut","🥜"],["nose","👃"],["nest","🪺"],["nail","🔨"]],
  ["O",["ox","🐂"],["on","🔛"],["owl","🦉"],["oil","🛢️"],["orange","🍊"]],
  ["P",["pen","🖊️"],["pig","🐷"],["pan","🍳"],["pot","🍲"],["pin","📌"]],
  ["Q",["queen","👑"],["quiz","❓"],["quilt","🛏️"],["quack","🦆"],["quail","🐦"]],
  ["R",["rat","🐀"],["red","🔴"],["run","🏃"],["rug","🧶"],["rose","🌹"]],
  ["S",["sun","☀️"],["sit","🪑"],["six","6️⃣"],["sock","🧦"],["star","⭐"]],
  ["T",["tap","🚰"],["top","🔝"],["tub","🛁"],["ten","🔟"],["toy","🧸"]],
  ["U",["up","⬆️"],["us","👫"],["urn","🏺"],["uncle","👨"],["under","⬇️"]],
  ["V",["van","🚐"],["vet","👩‍⚕️"],["vest","🦺"],["vase","🏺"],["vine","🌿"]],
  ["W",["web","🕸️"],["wet","💦"],["wig","💇"],["win","🏆"],["wall","🧱"]],
  ["X",["x-ray","🩻"],["xylophone","🎼"],["box","📦"],["fox","🦊"],["six","6️⃣"]],
  ["Y",["yak","🐂"],["yam","🍠"],["yes","✅"],["yarn","🧶"],["yolk","🍳"]],
  ["Z",["zoo","🦓"],["zip","🤐"],["zero","0️⃣"],["zebra","🦓"],["zigzag","⚡"]]
].map(function(row){return {letter:row[0],words:row.slice(1).map(function(w,i){
 return {text:w[0],emoji:w[1],endingX:row[0]==="X"&&i>=2};
})};});
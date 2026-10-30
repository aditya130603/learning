/* Little Learners 4–6: curriculum and pure progression rules. No dependencies. */
(function (root) {
  "use strict";

  /* Emoji here illustrate vocabulary words; navigation uses consistent vector icons. */
  var rows = {
    A: "ant|🐜|An ant is tiny and busy;apple|🍎|An apple is a crunchy fruit;arm|💪|Your arm helps you wave;acorn|🌰|An acorn can grow into a tree;astronaut|👩‍🚀|An astronaut explores space",
    B: "ball|⚽|A ball can bounce;bear|🐻|A bear has thick fur;bird|🐦|A bird has wings;boat|⛵|A boat floats on water;banana|🍌|A banana has a peel",
    C: "cat|🐈|A cat says meow;cup|🥤|A cup holds a drink;car|🚗|A car has wheels;cake|🎂|A cake is a sweet treat;cow|🐄|A cow says moo",
    D: "dog|🐕|A dog can wag its tail;duck|🦆|A duck likes water;door|🚪|Open a door to go inside;doll|🪆|A doll is a toy;drum|🥁|Tap a drum to make music",
    E: "egg|🥚|A chick can hatch from an egg;ear|👂|An ear helps you hear;elf|🧝|An elf is a story character;elbow|💪|Your elbow helps your arm bend;elephant|🐘|An elephant has a long trunk",
    F: "fish|🐟|A fish swims;fan|🪭|A fan moves air;fox|🦊|A fox has a fluffy tail;frog|🐸|A frog can hop;flower|🌻|A flower can grow in a garden",
    G: "goat|🐐|A goat loves to climb;gift|🎁|A gift is something you give;grapes|🍇|Grapes grow in bunches;glove|🧤|A glove covers your hand;guitar|🎸|A guitar makes music",
    H: "hat|🎩|A hat sits on your head;hen|🐔|A hen lays eggs;hand|✋|We wave with a hand;horse|🐴|A horse can gallop;house|🏠|A house is a home",
    I: "ink|🖋️|Ink makes marks on paper;ice|🧊|Ice is frozen water;ivy|🌿|Ivy is a leafy climbing plant;insect|🐞|An insect has six legs;island|🏝️|An island has water around it",
    J: "jam|🍓|Jam tastes sweet;jar|🫙|A jar can hold food;jet|✈️|A jet flies high;juice|🧃|Juice is a drink;jellyfish|🪼|A jellyfish floats in the sea",
    K: "key|🔑|A key opens a lock;kite|🪁|A kite flies in the wind;king|👑|A king wears a crown;kitten|🐈|A kitten is a baby cat;koala|🐨|A koala lives in trees",
    L: "lion|🦁|A lion has a loud roar;leaf|🍃|A leaf grows on a plant;lamp|💡|A lamp gives us light;lemon|🍋|A lemon tastes sour;ladder|🪜|A ladder helps us climb",
    M: "moon|🌙|The moon glows at night;map|🗺️|A map helps us find places;milk|🥛|Milk is a drink;mouse|🐭|A mouse is small;monkey|🐒|A monkey can climb",
    N: "net|🥅|A net has little holes;nut|🥜|Some nuts grow on trees;nose|👃|Our nose helps us smell;nest|🪺|A bird builds a nest;nurse|🧑‍⚕️|A nurse helps people",
    O: "ox|🐂|An ox is a strong animal;owl|🦉|An owl is a bird;orange|🍊|An orange is a juicy fruit;onion|🧅|An onion grows in the ground;octopus|🐙|An octopus has eight arms",
    P: "pig|🐖|A pig can oink;pen|🖊️|A pen helps us write;pot|🍲|A pot holds food;pony|🐎|A pony is a small horse;pencil|✏️|A pencil makes marks",
    Q: "queen|👑|A queen wears a crown;quilt|🛏️|A quilt keeps you warm;quail|🐦|A quail is a small bird;quiet|🤫|Quiet means not loud;question|❓|A question asks something",
    R: "rat|🐀|A rat has whiskers;red|🟥|Red is a bright color;ring|💍|A ring goes on a finger;rabbit|🐇|A rabbit has long ears;rainbow|🌈|A rainbow has many colors",
    S: "sun|☀️|The sun gives us light;star|⭐|A star shines in the sky;sock|🧦|A sock goes on your foot;snake|🐍|A snake can slither;spoon|🥄|A spoon helps us eat",
    T: "top|🪀|A spinning top is a toy;toy|🧸|A toy is for play;tree|🌳|A tree has branches;train|🚂|A train runs on tracks;turtle|🐢|A turtle has a shell",
    U: "up|⬆️|Up means higher;urn|🏺|An urn is a large vase;unicorn|🦄|A unicorn is a make-believe animal;umbrella|☂️|An umbrella keeps rain off you;uniform|🥋|A uniform is special clothing",
    V: "van|🚐|A van is a big vehicle;vase|🏺|A vase can hold flowers;vest|🦺|A vest is clothing;violin|🎻|A violin makes music;volcano|🌋|A volcano can erupt",
    W: "web|🕸️|A spider can spin a web;wig|🦱|A wig is pretend hair;wolf|🐺|A wolf is a wild animal;whale|🐋|A whale lives in the sea;window|🪟|Look outside a window",
    X: "box|📦|A box holds things;fox|🦊|A fox has a bushy tail;six|6️⃣|Six means one more than five;x-ray|🩻|An X-ray helps doctors see bones;xylophone|🎼|A xylophone makes music",
    Y: "yak|🐂|A yak has long hair;yam|🍠|A yam is a root vegetable;yarn|🧶|Yarn can make a scarf;yo-yo|🪀|A yo-yo goes up and down;yellow|🟨|Yellow is a bright color",
    Z: "zoo|🦒|A zoo is a place to see animals;zip|🤐|Zip up your coat;zero|0️⃣|Zero means none;zebra|🦓|A zebra has stripes;zigzag|〽️|A zigzag goes left and right"
  };

  var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  var words = {};
  letters.forEach(function (letter) {
    words[letter] = rows[letter].split(";").map(function (entry, index) {
      var bits = entry.split("|");
      return { id: letter + "-" + index, letter: letter, text: bits[0], picture: bits[1], clue: bits[2] };
    });
  });

  function clean(value) { return String(value || "").toUpperCase().replace(/[^A-Z]/g, ""); }
  function done(progress, letter) { return Boolean(progress.letters && progress.letters[letter] && progress.letters[letter].quiz); }
  function wordIndex(progress, letter) {
    var current = progress.letters && progress.letters[letter];
    return Math.max(0, Math.min(5, Number(current && current.word) || 0));
  }
  function unlocked(progress, letter) {
    var index = letters.indexOf(letter);
    if (index < 0) return false;
    if (index === 0) return true;
    if (!done(progress, letters[index - 1])) return false;
    if (index % 5 === 0 && !(progress.reviews && progress.reviews[String(index / 5 - 1)])) return false;
    return true;
  }
  function readyReview(progress, group) {
    var start = Number(group) * 5;
    return start + 5 <= letters.length && letters.slice(start, start + 5).every(function (l) { return done(progress, l); });
  }
  function nextTask(progress) {
    for (var i = 0; i < letters.length; i++) {
      if (i > 0 && i % 5 === 0 && readyReview(progress, i / 5 - 1) && !(progress.reviews && progress.reviews[String(i / 5 - 1)])) return { type: "review", group: i / 5 - 1 };
      var letter = letters[i];
      if (!done(progress, letter)) return unlocked(progress, letter) ? { type: "letter", letter: letter } : { type: "locked", letter: letter };
    }
    return { type: "finished" };
  }
  function countWords(progress) {
    return letters.reduce(function (total, letter) { return total + wordIndex(progress, letter); }, 0);
  }
  function completedLetters(progress) { return letters.filter(function (letter) { return done(progress, letter); }).length; }
  function availableWords(progress) {
    var output = [];
    letters.forEach(function (letter) {
      var count = wordIndex(progress, letter);
      words[letter].slice(0, count).forEach(function (word) { output.push(word); });
    });
    return output.length ? output : words.A.slice(0, 3);
  }
  function letterReviewWords(group) {
    return letters.slice(group * 5, group * 5 + 5).map(function (letter, offset) { return words[letter][offset % 5]; });
  }
  function getChoices(word, pool, count, turn) {
    var others = pool.filter(function (item) { return item.id !== word.id && item.picture !== word.picture; });
    var selected = [];
    for (var i = 0; i < others.length && selected.length < count - 1; i++) {
      var item = others[(i + turn * 3) % others.length];
      if (!selected.some(function (part) { return part.id === item.id; })) selected.push(item);
    }
    var choice = selected.concat([word]);
    var position = turn % choice.length;
    var correct = choice.pop();
    choice.splice(position, 0, correct);
    return choice;
  }

  var api = {
    letters: letters, words: words, clean: clean, done: done,
    unlocked: unlocked, wordIndex: wordIndex, readyReview: readyReview,
    nextTask: nextTask, countWords: countWords, completedLetters: completedLetters,
    availableWords: availableWords, letterReviewWords: letterReviewWords, getChoices: getChoices
  };
  root.Little46Data = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

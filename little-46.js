/* Little Learners 4–6. A deliberately small, offline-first, screen-reader-friendly app. */
(function () {
  "use strict";
  var D = window.Little46Data;
  var KEY = "little-learners-age46-v1";
  var app = document.getElementById("app");
  var paths = {
    back: '<path d="m15 18-6-6 6-6"/>',
    next: '<path d="m9 18 6-6-6-6"/>',
    volume: '<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 9a5 5 0 0 1 0 6M18 6a9 9 0 0 1 0 12"/>',
    mute: '<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="m16 9 5 6m0-6-5 6"/>',
    home: '<path d="m3 10 9-7 9 7v10H3V10Z"/><path d="M9 20v-7h6v7"/>',
    book: '<path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Z"/><path d="M12 6v14"/>',
    spark: '<path d="m12 2 2.3 7.7L22 12l-7.7 2.3L12 22l-2.3-7.7L2 12l7.7-2.3L12 2Z"/>',
    star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2Z"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    check: '<path d="m4 12 5 5L20 6"/>',
    close: '<path d="M5 5 19 19M19 5 5 19"/>',
    replay: '<path d="M3 11a9 9 0 1 1 2 6"/><path d="M3 4v7h7"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'
  };
  function icon(id, size) {
    return '<svg class="ico" width="' + (size || 22) + '" height="' + (size || 22) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[id] || paths.star) + '</svg>';
  }
  function safe(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function blank() { return { version: 1, letters: {}, reviews: {}, sound: true, reduceMotion: false }; }
  function load() {
    try {
      var old = JSON.parse(localStorage.getItem(KEY));
      if (old && old.version === 1 && old.letters && old.reviews) return old;
    } catch (err) { /* local storage may be disabled */ }
    return blank();
  }
  var progress = load();
  var state = { view: "home", letter: "A", step: "look", word: 0, tiles: [], selected: [], mistakes: 0, hint: false, feedback: "", quiz: null, round: 0, story: 0, storyCorrect: false, prize: null, parentAnswer: "", enteredParent: false };
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(progress)); } catch (err) { /* ephemeral progress */ }
  }
  function announce(message) {
    var live = document.getElementById("announcement");
    if (live) live.textContent = message;
  }
  function speak(message, force) {
    if (!progress.sound && !force) return;
    var text = String(message || "").slice(0, 160);
    try {
      if (window.LittleLettersAndroid && window.LittleLettersAndroid.speak) {
        window.LittleLettersAndroid.speak(text); return;
      }
      if (window.speechSynthesis && window.SpeechSynthesisUtterance) {
        window.speechSynthesis.cancel();
        var utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.79; utterance.pitch = 1.05; utterance.lang = "en-IN";
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) { announce("You can read the words on the screen."); }
  }
  function playFeedback(message) {
    state.feedback = message;
    announce(message);
  }
  function navigate(view) {
    state.view = view; state.feedback = "";
    render();
    window.scrollTo(0, 0);
  }
  function brand() {
    return '<span class="brand-mark" aria-hidden="true">' + icon("spark", 21) + '</span><span class="brand-name">little learners<span class="brand-dot">.</span></span>';
  }
  function topbar(title, isHome) {
    return '<header class="topbar"><button class="top-icon" data-action="' + (isHome ? "home" : "back") + '" aria-label="' + (isHome ? "Home" : "Go back") + '">' +
      (isHome ? icon("home") : icon("back")) + '</button><div class="top-title">' + (title ? safe(title) : brand()) +
      '</div><button class="top-icon top-settings" data-action="parent" aria-label="Parent settings">' + icon("settings", 21) + '</button></header>';
  }
  function tabbar(active) {
    var tabs = [["home","Home","home"],["garden","Letters","book"],["rewards","Stickers","star"]];
    return '<nav class="bottom-nav" aria-label="Main navigation">' + tabs.map(function (item) {
      var selected = active === item[0];
      return '<button data-action="' + item[0] + '" class="nav-item ' + (selected ? "active" : "") + '" aria-current="' + (selected ? "page" : "false") + '">' + icon(item[2], 23) + '<span>' + item[1] + '</span></button>';
    }).join("") + '</nav>';
  }
  function fox() {
    return '<svg class="buddy" viewBox="0 0 250 238" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pip, a smiling fox guide">' +
      '<ellipse cx="124" cy="218" rx="90" ry="11" fill="#D2A97D" opacity=".23"/>' +
      '<path d="M61 105 63 18 122 63 183 18 186 108" fill="#EC8D5A" stroke="#AD573B" stroke-width="5" stroke-linejoin="round"/>' +
      '<path d="M75 83 76 41 107 77M172 83 172 41 141 77" fill="#FFC2B4"/>' +
      '<path d="M46 124c0-47 32-80 79-80s79 33 79 80c0 56-34 91-79 91s-79-35-79-91Z" fill="#F29E69" stroke="#AD573B" stroke-width="5"/>' +
      '<path d="M47 136c16 0 25 5 39 25 13 18 27 23 39 23s26-5 39-23c14-20 23-25 39-25-6 47-37 79-78 79s-72-32-78-79Z" fill="#FFF3DD"/>' +
      '<ellipse cx="92" cy="126" rx="7" ry="10" fill="#352F41"/><ellipse cx="158" cy="126" rx="7" ry="10" fill="#352F41"/>' +
      '<ellipse cx="72" cy="151" rx="13" ry="7" fill="#F78E8E" opacity=".65"/><ellipse cx="178" cy="151" rx="13" ry="7" fill="#F78E8E" opacity=".65"/>' +
      '<path d="M111 150q14 10 28 0" fill="none" stroke="#6D4241" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="m115 143 10 9 10-9Z" fill="#5E4345"/><path d="M125 152v4" stroke="#5E4345" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M179 190q48 0 48-36c20 44-3 70-45 54" fill="#EC8D5A" stroke="#AD573B" stroke-width="4"/>' +
      '</svg>';
  }
  function btn(label, action, type, emblem, extra) {
    return '<button class="btn ' + (type || "btn-primary") + '" data-action="' + action + '" ' + (extra || "") + '><span>' + safe(label) + '</span>' + (emblem ? icon(emblem, 21) : "") + '</button>';
  }
  function badge(label, emblem) { return '<span class="pill">' + (emblem ? icon(emblem, 16) : "") + safe(label) + '</span>'; }
  function currentDescription() {
    var task = D.nextTask(progress);
    if (task.type === "review") return { task: task, heading: "Your garden review is ready!", sub: "Show what you remember from five letters.", button: "Start review" };
    if (task.type === "letter") return { task: task, heading: "Letter " + task.letter + " is waiting!", sub: "Meet new words and collect a sticker.", button: "Let's learn" };
    if (task.type === "finished") return { task: task, heading: "You grew the whole garden!", sub: "Keep playing and remembering words.", button: "Explore again" };
    return { task: task, heading: "Your next adventure is almost here!", sub: "Finish the last challenge to unlock it.", button: "See my letters" };
  }
  function renderHome() {
    var guide = currentDescription(), count = D.countWords(progress);
    return topbar("", true) + '<main class="page home-page"><div class="welcome-eyebrow">A little magic, every day ' + icon("spark", 14) +
      '</div><h1>Hello, little<br><em>explorer!</em></h1><section class="hero"><div class="hero-text">' +
      '<span class="hero-tag">YOUR NEXT ADVENTURE</span><h2>' + safe(guide.heading) + '</h2><p>' + safe(guide.sub) +
      '</p>' + btn(guide.button, "resume", "btn-cream", "next") + '</div><div class="hero-art"><span class="art-sun"></span>' + fox() +
      '<span class="art-flower">✿</span><span class="art-doodle">✦</span></div></section>' +
      '<div class="mini-stats"><div class="mini-stat">' + icon("book", 22) + '<div><strong>' + count + '<span>/130</span></strong><small>Words discovered</small></div></div>' +
      '<div class="mini-stat">' + icon("star", 22) + '<div><strong>' + D.completedLetters(progress) + '</strong><small>Letter stickers</small></div></div></div>' +
      '<div class="section-label"><h2>Where shall we go?</h2><span>Choose an adventure</span></div>' +
      '<div class="activity-stack">' +
      '<button class="activity activity-letter" data-action="garden"><span class="activity-symbol abc">Aa</span><span class="activity-copy"><strong>Letter garden</strong><small>Letters, sounds &amp; spelling</small></span>' + icon("next") + '</button>' +
      '<button class="activity activity-picture" data-action="picture"><span class="activity-symbol picture"><img src="assets/scenes/little-garden.svg" alt="" loading="lazy"></span><span class="activity-copy"><strong>Picture play</strong><small>Listen, look &amp; discover</small></span>' + icon("next") + '</button>' +
      '<button class="activity activity-story" data-action="story"><span class="activity-symbol story">' + icon("heart", 35) + '</span><span class="activity-copy"><strong>Story corner</strong><small>Three tiny tales to help</small></span>' + icon("next") + '</button></div>' +
      '<p class="home-note">No rush. No timers. Every try helps your brain grow.</p></main>' + tabbar("home");
  }
  function renderGarden() {
    var task = D.nextTask(progress);
    var sections = [];
    for (var index = 0; index < 26; index += 5) {
      var group = Math.floor(index / 5);
      var set = D.letters.slice(index, index + 5);
      sections.push('<section class="garden-section"><div class="group-heading"><span class="group-mark">' + (group + 1) + '</span><div><h2>' + ["Sunny meadow","Bouncy forest","Rainbow river","Starry hill","Cozy clouds","The final bloom"][group] + '</h2><p>Letters ' + set[0] + '–' + set[set.length - 1] + '</p></div></div><div class="letter-grid">' +
        set.map(function (letter) {
          var open = D.unlocked(progress, letter), done = D.done(progress, letter);
          var selected = task.type === "letter" && task.letter === letter;
          var status = done ? icon("check", 17) : open ? '<span class="letter-progress">' + D.wordIndex(progress, letter) + '/5</span>' : icon("lock", 16);
          return '<button class="letter-tile ' + (done ? "complete " : "") + (selected ? "next-letter " : "") +
            (open ? "" : "locked") + '" data-action="letter" data-letter="' + letter + '" ' + (open ? "" : "disabled") +
            ' aria-label="Letter ' + letter + ', ' + (done ? "complete" : open ? "available" : "locked") + '">' +
            '<strong>' + letter + '<span>' + letter.toLowerCase() + '</span></strong><span class="tile-status">' + status + '</span></button>';
        }).join("") + '</div>' +
        (index + 5 <= 26 ? '<button class="review-strip ' + (D.readyReview(progress, group) ? "ready" : "") +
          '" data-action="review" data-group="' + group + '" ' + (D.readyReview(progress, group) ? "" : "disabled") +
          '><span class="review-badge">' + icon(D.readyReview(progress, group) ? "star" : "lock", 19) + '</span><span><strong>' +
          (progress.reviews[String(group)] ? "Garden review complete!" : "Five-letter garden review") +
          '</strong><small>' + set.join(" · ") + '</small></span>' + icon("next", 20) + '</button>' : "") + '</section>');
    }
    return topbar("The letter garden") + '<main class="page garden-page"><div class="garden-intro"><div><p class="eyebrow">YOUR LEARNING PATH</p><h1>One little<br><em>letter at a time.</em></h1><p>Tap a bright letter to begin. Grow your garden at your own pace.</p></div>' +
      '<img src="assets/scenes/little-garden.svg" alt="An illustrated happy garden" loading="lazy"></div>' + sections.join("") +
      '</main>' + tabbar("garden");
  }
  function word() { return D.words[state.letter][state.word]; }
  function pictureFrame(item, extra) {
    return '<div class="picture-stage ' + (extra || "") + '"><span class="picture-orb picture-orb-one"></span><span class="picture-orb picture-orb-two"></span>' +
      '<span class="picture-emoji" role="img" aria-label="' + safe(item.text) + '">' + item.picture + '</span><span class="picture-grass"></span></div>';
  }
  function lessonShell(heading, description, body, footer, count) {
    var isQuiz = state.step === "quiz", n = isQuiz ? state.round : state.word;
    var total = isQuiz ? (state.quiz ? state.quiz.items.length : 5) : 5;
    return topbar(state.quiz && state.step === "quiz" && state.quiz.type === "review" ? "Garden review" : "Letter " + state.letter) + '<main class="page play-page"><div class="lesson-meta"><div class="lesson-kicker">' +
      badge(isQuiz ? "Little challenge" : "Letter " + state.letter, "spark") + '<span>' + (n + 1) + ' of ' + total + '</span></div>' +
      '<div class="progress-track" role="progressbar" aria-valuenow="' + n + '" aria-valuemin="0" aria-valuemax="' + total + '" aria-label="Lesson progress"><span style="width:' + Math.round((n / total) * 100) + '%"></span></div></div>' +
      '<div class="play-content"><h1>' + heading + '</h1><p class="play-subtitle">' + description + '</p>' + body + '</div>' +
      (state.feedback ? '<p class="inline-feedback" role="status">' + safe(state.feedback) + '</p>' : "") +
      '<footer class="play-footer">' + footer + '</footer></main>';
  }
  function shuffledTiles(target) {
    var list = D.clean(target).split("").map(function (ch, index) { return { ch: ch, id: index }; });
    for (var i = list.length - 1; i > 0; i--) {
      var j = (i * 7 + list[0].ch.charCodeAt(0) + i * i) % (i + 1);
      var hold = list[i]; list[i] = list[j]; list[j] = hold;
    }
    return list;
  }
  function prepareWord() {
    var item = word();
    state.step = "look"; state.tiles = shuffledTiles(item.text); state.selected = [];
    state.feedback = ""; state.mistakes = 0; state.hint = false;
    render();
    speak(item.text + ". " + item.clue);
  }
  function renderLook() {
    var item = word();
    var letter = state.letter, start = D.clean(item.text).charAt(0) === letter;
    return lessonShell('Meet <em>' + safe(item.text) + '!</em>', "Look at the picture. Say the word with Pip.", pictureFrame(item) +
      '<div class="fact-card"><div class="fact-title"><span class="fact-bullet"></span> Let’s discover</div><p>' + safe(item.clue) +
      '.</p><div class="fact-small">The word has <strong>' + D.clean(item.text).length + ' letters.</strong> ' +
      (start ? 'It begins with <strong>' + letter + '</strong>.' : 'Can you spot <strong>' + letter + '</strong> inside it?') +
      '</div></div>', '<button class="listen-button" data-action="say" aria-label="Hear ' + safe(item.text) + '">' + icon("volume", 22) +
      ' Hear the word</button>' + btn("I’m ready!", "look-next", "btn-primary btn-grow", "next"));
  }
  function pictureChoice(item, pos, answerAction) {
    return '<button class="image-choice" data-action="' + answerAction + '" data-choice="' + safe(item.id) +
      '" aria-label="' + safe(item.text) + '"><span role="img" aria-hidden="true">' + item.picture +
      '</span><small>' + safe(item.text) + '</small></button>';
  }
  function renderFind() {
    var item = word();
    var choices = D.getChoices(item, D.words[state.letter].concat(D.availableWords(progress)), 3, state.word + D.letters.indexOf(state.letter));
    return lessonShell('Find the <em>' + safe(item.text) + '.</em>', "Listen carefully. Tap the matching picture.",
      '<div class="question-cue">' + icon("volume", 20) + '<strong>' + safe(item.text) + '</strong></div><div class="image-choices">' +
      choices.map(function (part) { return pictureChoice(part, 0, "find-choice"); }).join("") + '</div>',
      btn("Say it again", "say", "btn-secondary btn-grow", "volume"), state.word);
  }
  function renderSpell() {
    var item = word(), chosen = state.selected.map(function (id) { return state.tiles.filter(function (tile) { return tile.id === id; })[0]; });
    var spelled = D.clean(item.text);
    var slots = spelled.split("").map(function (_, index) {
      return '<span class="letter-slot ' + (chosen[index] ? "filled" : "") + '">' + (chosen[index] ? chosen[index].ch : "") + '</span>';
    }).join("");
    var remaining = state.tiles.map(function (tile) {
      var used = state.selected.indexOf(tile.id) >= 0;
      return '<button class="spell-tile" data-action="tile" data-tile="' + tile.id + '" ' + (used ? 'disabled aria-label="Letter already used"' : 'aria-label="Letter ' + tile.ch + '"') +
        '>' + tile.ch + '</button>';
    }).join("");
    return lessonShell('Build the <em>word!</em>', "Tap the letters in the right order. You can try again.",
      '<div class="spell-preview">' + pictureFrame(item, "compact") + '<div class="spell-hint-line">' +
      (state.hint ? 'Hint: ' + safe(spelled.charAt(0)) + ' is the first letter.' : 'Which letter comes first?') + '</div></div>' +
      '<div class="spell-slots" aria-label="Spelling answer">' + slots + '</div><div class="spell-tiles">' + remaining + '</div>',
      '<button class="text-button" data-action="undo">' + icon("back", 18) + ' Undo</button><button class="text-button" data-action="hint">' + icon("spark", 18) + ' Hint</button>' +
      btn("Hear it", "say", "btn-secondary", "volume"), state.word);
  }
  function renderComplete() {
    var item = word();
    var unlocked = D.wordIndex(progress, state.letter) === 3 && state.word === 2;
    var last = state.word === 4;
    return lessonShell('<em>Wonderful!</em>', "You listened, looked and spelled. That is real learning.",
      '<div class="celebrate-stage"><div class="celebrate-halo"></div><div class="celebrate-picture">' + item.picture +
      '</div><span class="celebrate-star s1">✦</span><span class="celebrate-star s2">✧</span><span class="celebrate-star s3">✦</span></div>' +
      '<div class="result-word">' + safe(item.text) + '</div><p class="reward-line">' +
      (unlocked ? "Surprise! Two more words just opened for you!" : last ? "You know five words! Your letter challenge is next." : "A new word is waiting for you.") +
      '</p>', btn(last ? "Take my letter challenge" : "Next word", "complete-next", "btn-primary btn-grow", "next"), state.word);
  }
  function startLetter(letter) {
    if (!D.unlocked(progress, letter)) return;
    state.view = "lesson"; state.letter = letter; state.word = D.wordIndex(progress, letter);
    if (state.word === 5) {
      startQuiz("letter", D.words[letter], letter);
      return;
    }
    prepareWord();
  }
  function startQuiz(type, items, context) {
    state.view = "lesson"; state.step = "quiz"; state.quiz = { type: type, context: context, items: items };
    state.round = 0; state.feedback = "";
    render(); speak("Let's find the picture!");
  }
  function renderQuiz() {
    var quiz = state.quiz, target = quiz.items[state.round];
    var pool = quiz.type === "review" ? D.letterReviewWords(quiz.context).concat(D.availableWords(progress)) :
      D.words[target.letter].concat(D.availableWords(progress));
    var options = D.getChoices(target, pool, 3, state.round + D.letters.indexOf(target.letter));
    var title = quiz.type === "review" ? "Garden <em>review!</em>" : "Your letter <em>challenge!</em>";
    return lessonShell(title, "Find each picture. Take your time and have fun.",
      '<div class="quiz-target"><span>Where is the</span><strong>' + safe(target.text) + '?</strong><button data-action="quiz-say" class="speaker-round" aria-label="Hear the question">' +
      icon("volume", 23) + '</button></div><div class="image-choices quiz-choices">' + options.map(function (item) { return pictureChoice(item, 0, "quiz-choice"); }).join("") +
      '</div>', btn("Hear it again", "quiz-say", "btn-secondary btn-grow", "volume"), state.round);
  }
  function finishQuiz() {
    var quiz = state.quiz;
    if (quiz.type === "letter") {
      if (!progress.letters[quiz.context]) progress.letters[quiz.context] = { word: 5 };
      progress.letters[quiz.context].quiz = true;
      state.prize = { title: "A new letter sticker!", message: "Your " + quiz.context + " garden is blooming.", symbol: quiz.context };
    } else {
      progress.reviews[String(quiz.context)] = true;
      state.prize = { title: "A golden garden star!", message: "Five letters remembered. Keep growing!", symbol: "★" };
    }
    save(); state.view = "prize"; render(); speak("You did it! Your garden is growing.");
  }
  function renderPrize() {
    return topbar("Your celebration") + '<main class="page prize-page"><div class="prize-glow"></div><div class="prize-tag">A LITTLE VICTORY</div><div class="prize-medal">' +
      safe(state.prize.symbol) + '</div><h1>' + safe(state.prize.title) + '</h1><p>' + safe(state.prize.message) +
      '</p><div class="prize-buddy">' + fox() + '</div>' + btn("Keep exploring", "resume", "btn-primary btn-grow", "next") +
      '<button class="quiet-link" data-action="rewards">See my stickers</button></main>';
  }
  function renderRewards() {
    var earned = D.letters.filter(function (letter) { return D.done(progress, letter); });
    var groups = Object.keys(progress.reviews).filter(function (key) { return progress.reviews[key]; });
    return topbar("My sticker book") + '<main class="page rewards-page"><div class="rewards-header"><div class="reward-sun">' +
      icon("star", 36) + '</div><h1>Look how far<br><em>you’ve come!</em></h1><p>Every sticker shows a little thing you learned.</p></div>' +
      '<div class="sticker-grid">' + earned.map(function (letter) {
        return '<div class="sticker" aria-label="Letter ' + letter + ' sticker"><span>' + letter + '</span><small>Letter ' + letter + '</small></div>';
      }).join("") + groups.map(function (group) {
        return '<div class="sticker golden" aria-label="Garden review star"><span>★</span><small>Garden star</small></div>';
      }).join("") + (!earned.length && !groups.length ? '<div class="empty-stickers"><div class="empty-star">' + icon("star", 54) +
      '</div><h2>Your first sticker is close!</h2><p>Learn five words and complete a letter challenge.</p>' +
      btn("Let’s begin", "resume", "btn-primary", "next") + '</div>' : "") + '</div></main>' + tabbar("rewards");
  }
  function startPicture() {
    state.view = "picture"; state.round = 0; state.feedback = "";
    render(); speak("Picture time! Find the matching picture.");
  }
  function renderPicture() {
    var pool = D.availableWords(progress), item = pool[state.round % pool.length];
    var options = D.getChoices(item, pool.concat(D.words.B, D.words.C), 3, state.round);
    return topbar("Picture play") + '<main class="page minigame-page"><div class="minigame-progress">' + badge("Round " + (state.round + 1) + " of 3", "star") +
      '</div><h1>Can you spot the<br><em>' + safe(item.text) + '?</em></h1><p>Listen to Pip, then tap the picture.</p>' +
      '<button class="big-sound" data-action="picture-say" aria-label="Hear ' + safe(item.text) + '">' + icon("volume", 28) + '<span>Listen again</span></button>' +
      '<div class="image-choices minigame-choices">' + options.map(function (other) { return pictureChoice(other, 0, "picture-choice"); }).join("") +
      '</div>' + (state.feedback ? '<p class="inline-feedback" role="status">' + safe(state.feedback) + '</p>' : "") +
      '</main>';
  }
  var stories = [
    { title: "The bird’s cozy home", prompt: "Little Bird is tired. Where should it rest?", options: [{ name: "nest", picture: "🪺" },{ name: "cake", picture: "🎂" }], answer: "nest", happy: "Hooray! Bird is cozy in its nest.", picture: "🐦" },
    { title: "Pip’s sunny walk", prompt: "The sun is shining. What can Pip wear?", options: [{ name: "hat", picture: "🧢" },{ name: "drum", picture: "🥁" }], answer: "hat", happy: "Lovely! Pip’s hat shades his head.", picture: "🦊" },
    { title: "The windy afternoon", prompt: "The wind is blowing. What can fly?", options: [{ name: "kite", picture: "🪁" },{ name: "spoon", picture: "🥄" }], answer: "kite", happy: "Up, up, up goes the kite!", picture: "🌤️" }
  ];
  function startStory() { state.view = "story"; state.story = 0; state.storyCorrect = false; state.feedback = ""; render(); speak(stories[0].prompt); }
  function renderStory() {
    var story = stories[state.story];
    return topbar("Story corner") + '<main class="page story-page"><div class="story-chapter">LITTLE TALE ' + (state.story + 1) + ' / ' + stories.length +
      '</div><h1>' + safe(story.title) + '</h1><div class="story-scene"><span class="story-cloud"></span><span class="story-art" role="img" aria-label="Story character">' + story.picture +
      '</span><span class="story-hill"></span></div><div class="story-speech">' + safe(state.storyCorrect ? story.happy : story.prompt) +
      '</div><div class="story-options">' + (state.storyCorrect ? btn(state.story === stories.length - 1 ? "Finish the story" : "Next page", "story-next", "btn-primary btn-grow", "next") :
      story.options.map(function (option) {
        return '<button class="story-choice" data-action="story-choice" data-choice="' + safe(option.name) + '"><span>' + option.picture +
          '</span><strong>' + safe(option.name) + '</strong></button>';
      }).join("")) + '</div><button class="quiet-link" data-action="story-say">' + icon("volume", 19) + ' Hear the story</button>' +
      (state.feedback ? '<p class="inline-feedback" role="status">' + safe(state.feedback) + '</p>' : "") + '</main>';
  }
  function renderParent() {
    if (!state.enteredParent) {
      return topbar("Grown-ups only") + '<main class="page parent-page"><div class="parent-icon">' + icon("heart", 32) +
        '</div><h1>A little space<br>for grown-ups.</h1><p>To keep tiny hands in play mode, solve this quick question.</p>' +
        '<label for="parent-answer">What is 7 + 5?</label><input id="parent-answer" inputmode="numeric" type="number" placeholder="Your answer" autocomplete="off" value="' + safe(state.parentAnswer) +
        '"><p class="inline-feedback" id="parent-error" role="status"></p>' + btn("Continue", "parent-unlock", "btn-primary btn-grow", "next") +
        '</main>';
    }
    return topbar("Parent settings") + '<main class="page parent-page"><div class="parent-icon">' + icon("settings", 32) + '</div><h1>Growing together.</h1><p>Learning stays on this device. No accounts, advertisements or child tracking.</p>' +
      '<div class="parent-summary"><strong>' + D.countWords(progress) + ' of 130 words</strong><span>' + D.completedLetters(progress) + ' of 26 letters completed</span></div>' +
      '<button class="setting-row" data-action="toggle-sound"><span>' + icon(progress.sound ? "volume" : "mute") + ' Spoken word prompts</span><strong>' + (progress.sound ? "On" : "Off") + '</strong></button>' +
      '<button class="setting-row" data-action="toggle-motion"><span>' + icon("spark") + ' Gentle animations</span><strong>' + (progress.reduceMotion ? "Off" : "On") + '</strong></button>' +
      '<button class="setting-row dangerous" data-action="reset"><span>' + icon("replay") + ' Reset this child’s progress</span>' + icon("next") + '</button>' +
      '<p class="parent-footnote">Speech uses the phone’s installed voice when available. If unavailable, written prompts still work. Progress is lost if app storage is cleared.</p>' +
      btn("Back to playing", "home", "btn-primary btn-grow", "next") + '</main>';
  }
  function render() {
    document.body.classList.toggle("reduce-motion", Boolean(progress.reduceMotion));
    if (state.view === "home") app.innerHTML = renderHome();
    else if (state.view === "garden") app.innerHTML = renderGarden();
    else if (state.view === "rewards") app.innerHTML = renderRewards();
    else if (state.view === "parent") app.innerHTML = renderParent();
    else if (state.view === "picture") app.innerHTML = renderPicture();
    else if (state.view === "story") app.innerHTML = renderStory();
    else if (state.view === "prize") app.innerHTML = renderPrize();
    else if (state.view === "lesson") {
      if (state.step === "look") app.innerHTML = renderLook();
      else if (state.step === "find") app.innerHTML = renderFind();
      else if (state.step === "spell") app.innerHTML = renderSpell();
      else if (state.step === "complete") app.innerHTML = renderComplete();
      else if (state.step === "quiz") app.innerHTML = renderQuiz();
    }
    var main = app.querySelector("main");
    if (main) main.setAttribute("id", "main-content");
    if (state.view !== "parent") state.parentAnswer = "";
  }
  function resume() {
    var task = D.nextTask(progress);
    if (task.type === "letter") return startLetter(task.letter);
    if (task.type === "review") return startQuiz("review", D.letterReviewWords(task.group), task.group);
    if (task.type === "finished") return navigate("rewards");
    navigate("garden");
  }
  function correctAndNext(target, choice, onCorrect) {
    if (choice === target.id) { state.feedback = ""; speak("Great finding! " + target.text); onCorrect(); }
    else { playFeedback("Nice try! Look carefully, then try again."); render(); }
  }
  app.addEventListener("click", function (event) {
    var node = event.target;
    while (node && node !== app && (!node.getAttribute || !node.getAttribute("data-action"))) node = node.parentNode;
    if (!node || node.disabled) return;
    var action = node.getAttribute("data-action"), choice = node.getAttribute("data-choice");
    if (action === "home") return navigate("home");
    if (action === "back") return navigate(state.view === "lesson" ? "garden" : "home");
    if (action === "garden" || action === "rewards") return navigate(action);
    if (action === "resume") return resume();
    if (action === "parent") { state.enteredParent = false; return navigate("parent"); }
    if (action === "letter") return startLetter(node.getAttribute("data-letter"));
    if (action === "review") {
      var group = Number(node.getAttribute("data-group"));
      if (D.readyReview(progress, group)) startQuiz("review", D.letterReviewWords(group), group);
      return;
    }
    if (action === "say") return speak(word().text + ". " + word().clue, true);
    if (action === "look-next") { state.step = "find"; state.feedback = ""; render(); speak("Find the " + word().text); return; }
    if (action === "find-choice") return correctAndNext(word(), choice, function () { state.step = "spell"; state.feedback = ""; render(); speak("Now build the word."); });
    if (action === "tile") {
      var id = Number(node.getAttribute("data-tile"));
      if (state.selected.indexOf(id) !== -1) return;
      state.selected.push(id);
      if (state.selected.length === D.clean(word().text).length) {
        var built = state.selected.map(function (tileId) {
          return state.tiles.filter(function (tile) { return tile.id === tileId; })[0].ch;
        }).join("");
        if (built === D.clean(word().text)) {
          if (!progress.letters[state.letter]) progress.letters[state.letter] = { word: 0 };
          progress.letters[state.letter].word = Math.max(progress.letters[state.letter].word, state.word + 1);
          save(); state.step = "complete"; state.feedback = ""; speak("Beautiful spelling!");
        } else {
          state.selected = []; state.mistakes++;
          state.hint = state.mistakes >= 2;
          playFeedback("Almost! The letters need a different order. Try again.");
          speak("Try again. You can do it.");
        }
      }
      return render();
    }
    if (action === "undo") { state.selected.pop(); state.feedback = ""; return render(); }
    if (action === "hint") { state.hint = true; return render(); }
    if (action === "complete-next") {
      var nextIndex = D.wordIndex(progress, state.letter);
      if (nextIndex >= 5) return startQuiz("letter", D.words[state.letter], state.letter);
      state.word = nextIndex; return prepareWord();
    }
    if (action === "quiz-say") return speak("Find the " + state.quiz.items[state.round].text, true);
    if (action === "quiz-choice") {
      var target = state.quiz.items[state.round];
      return correctAndNext(target, choice, function () {
        state.round++;
        if (state.round >= state.quiz.items.length) finishQuiz();
        else { render(); speak("Find the " + state.quiz.items[state.round].text); }
      });
    }
    if (action === "picture") return startPicture();
    if (action === "picture-say") return speak("Find the " + D.availableWords(progress)[state.round % D.availableWords(progress).length].text, true);
    if (action === "picture-choice") {
      var pool = D.availableWords(progress), target = pool[state.round % pool.length];
      return correctAndNext(target, choice, function () {
        state.round++;
        if (state.round >= 3) { state.prize = { symbol: "★", title: "Picture detective!", message: "You found three pictures. Wonderful looking!" }; navigate("prize"); }
        else { render(); speak("Find the " + pool[state.round % pool.length].text); }
      });
    }
    if (action === "story") return startStory();
    if (action === "story-say") return speak(state.storyCorrect ? stories[state.story].happy : stories[state.story].prompt, true);
    if (action === "story-choice") {
      var story = stories[state.story];
      if (choice !== story.answer) { playFeedback("That is a fun idea! Which one helps our friend?"); return render(); }
      state.storyCorrect = true; state.feedback = ""; render(); speak(story.happy); return;
    }
    if (action === "story-next") {
      if (state.story === stories.length - 1) { state.prize = { symbol: "♥", title: "A kind little helper!", message: "You helped three friends. Stories make us smart and kind." }; return navigate("prize"); }
      state.story++; state.storyCorrect = false; state.feedback = ""; render(); return speak(stories[state.story].prompt);
    }
    if (action === "parent-unlock") {
      var input = document.getElementById("parent-answer");
      state.parentAnswer = input ? input.value.trim() : "";
      if (state.parentAnswer === "12") { state.enteredParent = true; return render(); }
      var message = document.getElementById("parent-error"); if (message) message.textContent = "Please try the grown-up question again.";
      return;
    }
    if (action === "toggle-sound") { progress.sound = !progress.sound; save(); return render(); }
    if (action === "toggle-motion") { progress.reduceMotion = !progress.reduceMotion; save(); return render(); }
    if (action === "reset") {
      if (window.confirm("Erase this child's learning progress on this device? This cannot be undone.")) {
        progress = blank(); save(); state.enteredParent = false; navigate("home");
      }
      return;
    }
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && state.view !== "home") navigate("home");
    if (event.key === "Enter" && state.view === "parent" && !state.enteredParent) {
      var unlock = app.querySelector('[data-action="parent-unlock"]'); if (unlock) unlock.click();
    }
  });
  window.addEventListener("pageshow", function () { if (state.view === "home") render(); });
  render();
  if ("serviceWorker" in navigator && window.location.protocol === "https:" &&
      window.location.hostname !== "appassets.androidplatform.net") {
    window.addEventListener("load", function () { navigator.serviceWorker.register("./service-worker.js").catch(function () {}); });
  }
})();

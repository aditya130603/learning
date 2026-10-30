/* Little Learners 4–6. A deliberately small, offline-first, screen-reader-friendly app. */
(function () {
  "use strict";
  var D = window.Little46Data;
  var S = window.Little46Spelling;
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
  var state = { view: "home", letter: "A", step: "look", word: 0, tiles: [], selected: [], mistakes: 0, hint: false, spellParts: [], partIndex: 0, completedParts: [], feedback: "", quiz: null, round: 0, story: 0, storyCorrect: false, prize: null, parentAnswer: "", enteredParent: false };
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
    return '<span class="storybook-logo"><span class="logo-word">little</span><span class="logo-learners"><b>l</b><b>e</b><b>a</b><b>r</b><b>n</b><b>e</b><b>r</b><b>s</b></span></span>';
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
    return '<img class="buddy" src="assets/kids46/pip.svg" alt="Pip the cheerful fox learning guide">';
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
    return topbar("", true) + '<main class="page home-page">' +
      '<section class="hero storybook-hero"><div class="hero-world"><div class="hero-heading"><p class="welcome-eyebrow">Welcome to your happy place!</p><h1>Hello, little<br><em>explorer!</em></h1></div>' +
      '<img class="world-sprite hero-tree" src="assets/kits/nature/tree-puffy.svg" alt="" aria-hidden="true">' +
      '<img class="world-sprite hero-bush" src="assets/kits/nature/bush-flowers.svg" alt="" aria-hidden="true">' +
      '<img class="world-sprite hero-flower" src="assets/kits/nature/flower-coral.svg" alt="" aria-hidden="true">' +
      '<div class="hero-fox">' + fox() + '</div><div class="adventure-sign"><span class="sign-eyebrow">YOUR NEXT ADVENTURE</span><h2>' + safe(guide.heading) + '</h2>' +
      btn(guide.button, "resume", "btn-sign", "next") + '</div><span class="scene-spark scene-spark-one" aria-hidden="true">✦</span><span class="scene-spark scene-spark-two" aria-hidden="true">✿</span></div></section>' +
      '<div class="home-cheer">Little steps make <strong>big explorers!</strong> <span aria-hidden="true">✦</span></div>' +
      '<div class="activity-stack">' +
      '<button class="activity activity-letter" data-action="garden"><span class="activity-symbol abc">Aa</span><span class="activity-copy"><strong>Letter Garden</strong><small>Explore the alphabet</small></span>' + icon("next") + '</button>' +
      '<button class="activity activity-picture" data-action="picture"><span class="activity-symbol picture">' + icon("book", 36) + '</span><span class="activity-copy"><strong>Picture Play</strong><small>Listen and discover</small></span>' + icon("next") + '</button>' +
      '<button class="activity activity-story" data-action="story"><span class="activity-symbol story">' + icon("heart", 35) + '</span><span class="activity-copy"><strong>Story Corner</strong><small>Little tales to enjoy</small></span>' + icon("next") + '</button></div>' +
      '<button class="home-footnote" data-action="rewards" aria-label="Open my sticker book">' + icon("star",17) + '<strong>' + D.completedLetters(progress) + ' stickers</strong><span>·</span><strong>' + count + ' words discovered</strong>' +
      '</button></main>';
  }
  function renderGarden() {
    var task=D.nextTask(progress), names=["Sunny Meadow","Butterfly Brook","Mushroom Woods","Rainbow Hills","Clover Valley","The Last Bloom"];
    var coords=[26,68,31,67,47], tops=[138,246,359,480,597], colors=["orange","yellow","purple","pink","blue"];
    var chapters=[];
    for(var group=0;group<6;group++){
      var letters=D.letters.slice(group*5,group*5+5), letterNodes=[];
      letters.forEach(function(letter,i){
        var open=D.unlocked(progress,letter),done=D.done(progress,letter);
        var selected=task.type==="letter" && task.letter===letter;
        var status=done?'<span class="flower-check">'+icon("check",16)+'</span>':
          (!open?'<span class="flower-lock">'+icon("lock",15)+'</span>':'<span class="flower-progress">'+D.wordIndex(progress,letter)+'/5</span>');
        letterNodes.push('<button class="garden-flower '+colors[i]+' '+(done?"complete ":"")+(selected?"current ":"")+(open?"":"locked")+
          '" style="top:'+tops[i]+'px;left:'+coords[i]+'%" data-action="letter" data-letter="'+letter+'" '+(open?"":"disabled")+
          ' aria-label="Letter '+letter+', '+(done?"complete":open?"available":"locked")+'">'+
          '<span class="petal p1"></span><span class="petal p2"></span><span class="petal p3"></span><span class="petal p4"></span><span class="petal p5"></span>'+
          '<span class="flower-face">'+letter+'</span>'+status+'</button>');
      });
      var gate="";
      if(letters.length===5){
        gate='<button class="garden-gate '+(D.readyReview(progress,group)?"ready":"closed")+
          '" style="top:711px" data-action="review" data-group="'+group+'" '+(D.readyReview(progress,group)?"":"disabled")+'>'+
          icon(D.readyReview(progress,group)?"star":"lock",18)+'<span>'+
          (progress.reviews[String(group)]?"Review complete!":"Review "+letters[0]+"–"+letters[4])+'</span></button>';
      }
      var scenery='<img class="garden-deco deco-tree" src="assets/kits/nature/tree-puffy.svg" alt="" aria-hidden="true" loading="lazy">'+
        '<img class="garden-deco deco-bush-left" src="assets/kits/nature/bush.svg" alt="" aria-hidden="true" loading="lazy">'+
        '<img class="garden-deco deco-bush-right" src="assets/kits/nature/bush-flowers.svg" alt="" aria-hidden="true" loading="lazy">'+
        '<img class="garden-deco deco-flower-one" src="assets/kits/nature/flower-pink.svg" alt="" aria-hidden="true" loading="lazy">'+
        '<img class="garden-deco deco-flower-two" src="assets/kits/nature/flower-coral.svg" alt="" aria-hidden="true" loading="lazy">'+
        '<img class="garden-deco deco-mushroom" src="assets/kits/nature/mushroom.svg" alt="" aria-hidden="true" loading="lazy">';
      chapters.push('<section class="garden-chapter chapter-'+group+(letters.length<5?' chapter-short':'')+'" aria-label="'+names[group]+'">'+
        '<div class="chapter-heading"><span class="chapter-number">'+(group+1)+'</span><div><strong>'+names[group]+'</strong><small>Letters '+letters[0]+'–'+letters[letters.length-1]+'</small></div></div>'+
        '<div class="chapter-landscape">'+
        '<img class="garden-world-art" src="assets/kids46/garden-path.svg" alt="" aria-hidden="true" loading="lazy">'+
        '<span class="chapter-path" aria-hidden="true"></span>'+
        scenery+letterNodes.join("")+gate+'</div></section>');
    }
    return topbar("Letter Garden")+'<main class="page garden-page">'+
      '<div class="garden-intro"><div><p class="eyebrow">A WORLD OF LITTLE WORDS</p><h1>Follow the <em>flower path!</em></h1><p>Each blossom is a new adventure.</p></div>'+
      '<img src="assets/kids46/pip.svg" alt="Pip cheering you on"></div>'+
      '<div class="garden-world"><div class="garden-wood-sign"><strong>My Letter Garden</strong><small>Tap a bright flower to begin</small></div>'+
      chapters.join("")+'</div></main>';
  }
  function word() { return D.words[state.letter][state.word]; }
  function pictureFrame(item,extra) {
    var isAnt=item.id==="A-0",isApple=item.id==="A-1";
    var art=isAnt?'<img class="vocab-art" src="assets/kids46/ant.svg" alt="A smiling ant in a garden">':
      isApple?'<img class="vocab-art kit-vocab-apple" src="assets/kits/nature/apple.svg" alt="An illustrated apple">':
      '<span class="picture-emoji" role="img" aria-label="'+safe(item.text)+'">'+item.picture+'</span>';
    return '<div class="picture-stage '+(extra||"")+(isAnt||isApple?" has-custom-art":"")+(isApple?" has-kit-art":"")+'">'+
      '<span class="picture-orb picture-orb-one"></span><span class="picture-orb picture-orb-two"></span>'+
      art+'<span class="picture-grass"></span></div>';
  }
  function lessonShell(heading, description, body, footer, count) {
    var isQuiz = state.step === "quiz", n = isQuiz ? state.round : state.word;
    var total = isQuiz ? (state.quiz ? state.quiz.items.length : 5) : 5;
    return topbar(state.quiz && state.step === "quiz" && state.quiz.type === "review" ? "Garden review" : "Letter " + state.letter) + '<main class="page play-page step-' + (state.step === "spell" ? "spell" : state.step === "look" ? "look" : state.step === "find" ? "find" : state.step === "quiz" ? "quiz" : "result") + '"><div class="lesson-meta"><div class="lesson-kicker">' +
      badge(isQuiz ? "Little challenge" : "Letter " + state.letter, "spark") + '<span>' + (n + 1) + ' of ' + total + '</span></div>' +
      '<div class="progress-track" role="progressbar" aria-valuenow="' + n + '" aria-valuemin="0" aria-valuemax="' + total + '" aria-label="Lesson progress"><span style="width:' + Math.round((n / total) * 100) + '%"></span></div></div>' +
      '<div class="play-content"><h1>' + heading + '</h1><p class="play-subtitle">' + description + '</p>' + body + '</div>' +
      (state.feedback ? '<p class="inline-feedback" role="status">' + safe(state.feedback) + '</p>' : "") +
      '<footer class="play-footer">' + footer + '</footer></main>';
  }
  function resetSpellRound() {
    var part=state.spellParts[state.partIndex];
    var round=S.makeRound(part,{bonus:state.word>=3});
    state.tiles=round.tiles;
    state.selected=[];
  }
  function beginSpelling() {
    state.spellParts=S.splitWord(word().text);
    state.partIndex=0;
    state.completedParts=[];
    state.mistakes=0;
    state.hint=false;
    state.feedback="";
    state.step="spell";
    resetSpellRound();
    render();
    speak("Listen to the word, then build it using the letter stones.");
  }
  function completeSpellingPart() {
    state.completedParts.push(state.spellParts[state.partIndex]);
    if(state.partIndex+1<state.spellParts.length) {
      state.partIndex++;
      state.hint=false; state.mistakes=0; state.feedback="";
      resetSpellRound();
      render();
      speak("Great! You built that part. Now build the next part.");
      return;
    }
    if(!progress.letters[state.letter]) progress.letters[state.letter]={word:0};
    progress.letters[state.letter].word=Math.max(progress.letters[state.letter].word,state.word+1);
    save();state.step="complete";state.feedback="";
    render();speak("Beautiful spelling! You built the word "+word().text+".");
  }
  function prepareWord() {
    var item=word();
    state.step="look"; state.tiles=[];state.selected=[];state.spellParts=[];state.partIndex=0;state.completedParts=[];
    state.feedback="";state.mistakes=0;state.hint=false;
    render();
    speak(item.text+". "+item.clue);
  }
  function renderLook() {
    var item = word();
    var letter = state.letter, start = D.clean(item.text).charAt(0) === letter;
    return lessonShell('Meet <em>' + safe(item.text) + '!</em>', "Look closely. Listen, then say the word with Pip.",
      '<div class="pip-speaks"><img src="assets/kids46/pip.svg" alt="" loading="lazy"><span>Pip says, <strong>' + safe(item.text) + '!</strong></span></div>' +
      pictureFrame(item) +
      '<div class="word-sound-card"><button class="word-sound-button" data-action="say" aria-label="Hear the word ' + safe(item.text) + '">' + icon("volume",22) + '</button><strong>' +
      safe(item.text) + '</strong></div>' +
      '<div class="fact-card"><div class="fact-title"><span class="fact-bullet"></span> Let’s discover</div><p>' + safe(item.clue) +
      '.</p><div class="fact-small">It has <strong>' + D.clean(item.text).length + ' letters</strong>. ' +
      (start ? 'It starts with <strong>' + letter + '</strong>.' : 'Find the letter <strong>' + letter + '</strong> inside it.') +
      '</div></div>', btn("I’m ready!", "look-next", "btn-primary btn-grow", "next"));
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
    var item=word(),part=state.spellParts[state.partIndex];
    var chosen=state.selected.map(function(id){return state.tiles.filter(function(t){return t.id===id;})[0];});
    var slots=part.split('').map(function(_,i){
      return '<span class="letter-slot '+(chosen[i]?'filled':'')+'" aria-label="'+(chosen[i]?'Position '+(i+1)+': '+chosen[i].ch:'Empty letter position '+(i+1))+'">'+(chosen[i]?chosen[i].ch:'')+'</span>';
    }).join('');
    var tiles=state.tiles.map(function(t){
      var used=state.selected.indexOf(t.id)>=0;
      return '<button class="spell-tile" data-action="tile" data-tile="'+t.id+'" '+(used?'disabled aria-label="Used letter '+t.ch+'"':'aria-label="Choose letter '+t.ch+'"')+'>'+t.ch+'</button>';
    }).join('');
    var partLabel=state.spellParts.length>1 ? 'Part '+(state.partIndex+1)+' of '+state.spellParts.length : 'Picture spelling';
    var completed=state.completedParts.length?'<div class="spell-done" role="status">'+state.completedParts.map(function(x){return '<span>'+safe(x)+'</span>';}).join('')+' <span>Great start!</span></div>':'';
    return lessonShell('Can you <em>spell it?</em>', 'Listen carefully. Find the right letters.',
      '<section class="spell-world" aria-label="Picture of '+safe(item.text)+'">'+
        '<img class="spell-leaf leaf-left" src="assets/kits/nature/bush.svg" alt="" aria-hidden="true">'+
        '<img class="spell-leaf leaf-right" src="assets/kits/nature/fern.svg" alt="" aria-hidden="true">'+
        '<div class="spell-hero-art">'+pictureFrame(item,'compact')+'</div>'+
        '<div class="spell-mentor">'+
        '<img src="assets/kids46/pip.svg" alt="Pip the fox" class="spell-mentor-fox"></div>'+
      '</section>'+
      '<button class="spell-listen" data-action="say" aria-label="Hear the word '+safe(item.text)+' again">'+icon('volume',21)+' <span>Hear the word</span></button>'+
      completed+
      '<section class="spell-build" aria-label="Build your answer"><div class="spell-task-head"><strong>Build the word</strong><span class="spell-part-label">'+safe(partLabel)+'</span></div>'+
        '<div class="spell-slots" role="group" aria-label="Word spelling answer">'+slots+'</div>'+
      '</section>'+
      '<section class="spell-picker" aria-label="Letter choices"><div class="spell-bank-title"><strong>Choose your letters</strong><span>Extra letters included</span></div>'+
      '<div class="spell-tiles" role="group" aria-label="Shuffled letter choices">'+tiles+'</div></section>'+
      (state.hint?'<p class="spell-hint-line" role="status">Pip’s hint: start with <strong>'+safe(part[0])+'</strong>.</p>':'') ,
      '<button class="spell-action" data-action="undo" '+(state.selected.length?'':'disabled')+'>'+icon('back',18)+'<span>Undo</span></button>'+
      '<button class="spell-action" data-action="mix">'+icon('replay',18)+'<span>Mix</span></button>'+
      '<button class="spell-action spell-hint-action" data-action="hint">'+icon('spark',18)+'<span>Hint</span></button>',
      state.word);
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
    return topbar("Your celebration") + '<main class="page prize-page"><div class="prize-glow"></div><div class="prize-tag">YOU DID IT!</div><div class="prize-medal">' +
      safe(state.prize.symbol) + '</div><h1>' + safe(state.prize.title) + '</h1><p>' + safe(state.prize.message) +
      '</p><div class="prize-buddy">' + fox() + '</div>' + btn("Keep exploring", "resume", "btn-primary btn-grow", "next") +
      '<button class="quiet-link" data-action="rewards">See my stickers</button></main>';
  }
  function renderRewards() {
    var earned = D.letters.filter(function (letter) { return D.done(progress, letter); });
    var groups = Object.keys(progress.reviews).filter(function (key) { return progress.reviews[key]; });
    return topbar("My Stickers") + '<main class="page rewards-page"><div class="sticker-book"><div class="sticker-book-heading"><span>✿</span><h1>My Learning Stickers</h1><span>✿</span></div>' +
      '<div class="sticker-shelves">' + D.letters.map(function (letter,index) {
        var isEarned = D.done(progress,letter), item = D.words[letter][0];
        return '<div class="shelf-slot ' + (isEarned ? "collected" : "not-yet") + '" aria-label="Letter ' + letter + (isEarned ? ' sticker earned' : ' sticker not yet earned') + '">' +
          '<span class="sticker-illustration" role="img" aria-label="' + safe(item.text) + '">' + (letter==='A'?'<img src="assets/kits/nature/apple.svg" alt="">':item.picture) + '</span>' +
          '<span class="sticker-letter">' + letter + '</span>' + (isEarned ? '' : '<span class="sticker-lock">' + icon('lock',12) + '</span>') + '</div>';
      }).join("") + '</div></div>' +
      '<div class="rewards-celebration"><h2>' + (earned.length ? "You’re amazing!" : "Your adventure begins!") + '</h2><p>' +
      earned.length + ' of 26 letter stickers collected' + (groups.length ? ' · ' + groups.length + ' garden stars!' : '') +
      '</p><div class="celebration-fox">' + fox() + '<span class="celebration-star" aria-hidden="true">★</span></div>' +
      btn(earned.length ? "Keep collecting!" : "Earn my first sticker!", "resume", "btn-primary btn-grow", "next") +
      '</div></main>';
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
    if (action === "find-choice") return correctAndNext(word(), choice, function () { beginSpelling(); });
    if(action==="tile") {
      var id=Number(node.getAttribute("data-tile"));
      if(state.selected.indexOf(id)>=0)return;
      var available=state.tiles.filter(function(tile){return tile.id===id;})[0];
      if(!available)return;
      state.selected.push(id);
      var part=state.spellParts[state.partIndex];
      if(state.selected.length===part.length) {
        var evaluated=S.evaluate(part,state.selected,state.tiles);
        if(evaluated.correct)return completeSpellingPart();
        state.mistakes++;
        state.hint=state.mistakes>=2;
        state.selected=[];
        // A fresh shuffle eliminates memorizing tile positions on a retry.
        resetSpellRound();
        var message=state.hint
          ? "Good try! Look for "+part.charAt(0)+" first, then listen again."
          : "That spells "+evaluated.submitted+". Not quite! Listen and try a new order.";
        playFeedback(message);
        speak("Good try. Listen, and try the letters in a new order.");
        return render();
      }
      state.feedback="";
      return render();
    }
    if(action==="undo") {state.selected.pop();state.feedback="";return render();}
    if(action==="clear") {state.selected=[];state.feedback="";return render();}
    if(action==="mix") {state.selected=[];state.feedback="";resetSpellRound();return render();}
    if(action==="hint") {
      state.hint=true;state.feedback="";
      render();speak(S.hint(state.spellParts[state.partIndex],state.mistakes,true),true);
      return;
    }
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

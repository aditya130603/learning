(() => {
  'use strict';
  const BANK = window.WORD_BANK;
  const Mayhem = window.Mayhem;
  const WordStudio = window.WordStudioV5 || window.WordStudio;
  const KidV5 = window.KidV5;
  const LexiconExplorer = window.LexiconExplorer;
  const FriendChallenge = window.FriendChallenge;
  const KEY = 'little-letters-progress-v1';
  const TODAY = () => {
    const d = new Date();
    return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
  };
  const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const app = document.getElementById('app');
  const printSheet = document.getElementById('print-sheet');
  const initialProgress = () => ({letters:{},created: TODAY()});
  let data;
  try { data = JSON.parse(localStorage.getItem(KEY)) || initialProgress(); } catch { data = initialProgress(); }
  if (!data || typeof data !== 'object' || typeof data.letters !== 'object' || !data.letters) data = initialProgress();
  const ui = {page:'home', letter:0, showWords:true, session:null, worksheetType:'copy', worksheetCount:3, worksheetAnswers:false, selectedTab:'learn'};
  const p = (i) => data.letters[BANK[i].letter] || {matchDays:[],spellDays:[],recognitionDays:[],paper:[],stars:0,unlock:false};
  function modify(i,fn){
    const l=BANK[i].letter;
    const current={matchDays:[],spellDays:[],recognitionDays:[],paper:[],stars:0,unlock:false,...p(i)};
    fn(current);
    data.letters[l]=current;
    try {localStorage.setItem(KEY,JSON.stringify(data));}catch{/* Private browsing may block storage */}
  }
  const learned = i => Array.isArray(p(i).spellDays) && new Set(p(i).spellDays).size>=2;
  const unlocked = i => learned(i)||p(i).unlock===true;
  const words = i => BANK[i].words.slice(0,unlocked(i)?5:3);
  const totalStars = () => Object.keys(data.letters).reduce((sum,k)=>sum+(Number(data.letters[k].stars)||0),0);
  const letterMastered = () => BANK.filter((_,i)=>learned(i)).length;
  const practiced = () => BANK.filter((_,i)=>(p(i).matchDays||[]).length+(p(i).spellDays||[]).length>0).length;
  const nextRecommended = () => Math.max(0,BANK.findIndex((_,i)=>!learned(i)));
  const cleanWord = s=>s.toUpperCase().replace(/[^A-Z]/g,'');
  const esc = s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=(name)=>({home:'⌂',letters:'Aa',worksheets:'▤',grownups:'♧',missions:'🎭',profile:'👤',library:'◈',idioms:'❞',review:'↻',challenge:'⚔'}[name]||'✦');
  const btn=(label,action,cls='btn btn-primary',extra='')=>`<button class="${cls}" data-action="${action}" ${extra}>${label}</button>`;
  const title=(eyebrow,heading,description='')=>`<div class="titlegroup"><span class="eyebrow">${eyebrow}</span><h1>${heading}</h1>${description?`<p>${description}</p>`:''}</div>`;
  function speak(text){
    if (window.LittleLettersAndroid && window.LittleLettersAndroid.speak) { window.LittleLettersAndroid.speak(text); return; }
    if (!('speechSynthesis' in window)) { announce('Audio is not supported in this browser.'); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN'; utterance.rate = .78; utterance.pitch = 1.08;
    const voices=window.speechSynthesis.getVoices();
    const voice=voices.find(v=>v.lang==='en-IN') || voices.find(v=>/^en(-|_)/i.test(v.lang));
    if(voice) utterance.voice=voice;
    window.speechSynthesis.speak(utterance);
  }
  function announce(message){
    const live = document.getElementById('live-msg');
    if(live) live.textContent=message;
  }
  function navigate(page){ui.page=page;ui.session=null;ui.showWords=true;window.scrollTo({top:0});render();}
  function selectLetter(index){ui.letter=Math.min(25,Math.max(0,Number(index)));ui.page='lesson';ui.showWords=true;ui.session=null;window.scrollTo({top:0});render();}
  function header(){
    const age=Mayhem.getAge(),small=age==='4-6',newer=age==='10-13'||age==='14-17'||age==='18+';
    const nav=(name,label)=>`<button class="nav-item ${ui.page===name||(ui.page==='mission-play'&&name==='missions')||((ui.page==='lesson'||ui.page==='game'||ui.page==='result')&&name==='letters')?'active':''}" data-nav="${name}" aria-label="${label}"><span class="nav-icon">${icon(name)}</span><span>${label}</span></button>`;
    return `<header class="topbar"><div class="brand"><div class="brand-mark">Aa<span class="mark-star">✦</span></div><div><b>little<span>letters</span></b><small>WORD MAYHEM · LEARN TO PLAY</small></div></div><div class="topright"><div class="star-pill">${small||age==='7-9'?'⭐':'🏅'} <b>${small||age==='7-9'||age==='10-13'?(KidV5?KidV5.state.stars:totalStars()):Mayhem.count()}</b></div><button class="age-pill" data-nav="profile">${Mayhem.info().icon} ${Mayhem.info().label} <span>⌄</span></button></div></header><aside class="sidebar"><div class="nav-caption">${small?'PLAYROOM':'YOUR ADVENTURES'}</div>${nav('home','Home')}${nav('missions',small?'Silly stories':'Word Mayhem')}${nav('letters',newer?'Word basics':'ABC Garden')}${age==='18+'||age==='14-17'?nav('library','Word Studio')+nav('dictionary','Dictionary')+nav('idioms','Idioms')+nav('review','Review'):age==='4-6'?'':nav('challenge','Friend challenge')}${age==='4-6'?'':nav('worksheets','Worksheets')}${age==='4-6'?'':nav('grownups','For grown-ups')}${nav('profile','Change age')}<div class="side-note"><span>🌈</span><b>Every word<br>opens a door.</b><p>Learn by doing, not by memorising everything at once.</p></div></aside><nav class="mobile-nav" aria-label="Main navigation">${nav('home','Home')}${age==='18+'||age==='14-17'?nav('library','Words')+nav('review','Review'):nav('missions',small?'Stories':'Mayhem')+(small?'':nav('challenge','Friends'))}${nav('letters','ABC')}${nav('profile','Profile')}</nav>`;
  }
  function landing(){
    const age=Mayhem.getAge();
    if(age==='18+'||age==='14-17')return WordStudio.home();
    if(!age) return Mayhem.welcome();
    if(KidV5) return KidV5.hub();
    const beginner=age==='4-6', early=age==='7-9';
    if(beginner){
      const idx=nextRecommended(), L=BANK[idx];
      return `<div class="kid-home layout-flow"><div class="kid-welcome"><div><span class="eyebrow">HELLO, EXPLORER! 🌈</span><h1>Ready to play?</h1><p>Look. Listen. Tap. Learn!</p></div><span class="welcome-mascot" aria-hidden="true">${L.words[0].emoji}</span></div>
      <div class="kid-big-actions"><button class="kid-big-button bright" data-action="start-recommended"><span>👀</span><b>Learn letter ${L.letter}</b><small>Look and listen</small></button><button class="kid-big-button warm" data-action="start-match-home"><span>🧩</span><b>Find the picture</b><small>Listen and tap</small></button><button class="kid-big-button playful" data-nav="missions"><span>🎭</span><b>Silly stories</b><small>Make things happen!</small></button></div>
      <div class="kid-bottom"><span>⭐ ${totalStars()} happy stars</span><button class="btn btn-outline" data-nav="letters">🔤 All letters</button></div></div>`;
    }
    const label=early?'Word adventurer!':age==='10-13'?'Story maker!':age==='14-17'?'Language challenger!':'Welcome back!';
    const list=Mayhem.missions();
    return `<div class="layout-flow mission-landing"><div class="landing-title"><span class="eyebrow">LITTLE LETTERS × WORD MAYHEM</span><h1>Hey, ${label} 👋</h1><p>Words can save the day—or make a hilarious mess.</p></div><section class="mission-feature"><div class="mission-feature-copy"><span>✨ TODAY’S ADVENTURE</span><h2>Make the story happen.</h2><p>Build a sentence, fix the grammar and discover what happens.</p><button class="btn btn-white mission-main" data-mayhem="next">${Mayhem.count()?'Continue missions':'Play a mission'} →</button></div><div class="mission-feature-art" aria-hidden="true">${list.length?list[0].scene:'🎯'}<span>💬</span></div></section>
    <div class="dashboard-cards"><button data-nav="missions" class="dashboard-card"><span>🎭</span><b>Word Mayhem</b><small>${Mayhem.count()} of ${list.length} missions solved</small></button><button data-nav="letters" class="dashboard-card"><span>🔤</span><b>${early?'ABC Garden':'Word basics'}</b><small>Words, sounds & spelling games</small></button>${early?'<button data-action="start-match-home" class="dashboard-card"><span>🧩</span><b>Picture challenge</b><small>Find the right picture</small></button>':'<button data-nav="worksheets" class="dashboard-card"><span>✏️</span><b>Writing practice</b><small>Printable word worksheets</small></button>'}</div></div>`;
  }
  function home(){
    const idx=nextRecommended(), L=BANK[idx], lp=p(idx);
    const all=letterMastered();
    return `<div class="layout-flow">${title('✦ A HAPPY PLACE TO LEARN','Hello, little learner! 👋','Let’s discover letters, listen to words and grow one small step at a time.')}
      <section class="hero"><div class="hero-copy"><span class="hero-kicker">TODAY’S LITTLE MISSION</span><h2>Let’s learn<br>letter <span>${L.letter}!</span></h2><p>3 easy picture words first. We’ll learn two more when you’re ready.</p>${btn(`Start learning ${L.letter} <span aria-hidden="true">→</span>`,'start-recommended','btn btn-white')}</div><div class="hero-art" aria-hidden="true"><span class="orb orb-one"></span><span class="orb orb-two"></span><div class="hero-letter">${L.letter.toLowerCase()}</div><div class="hero-emoji">${L.words[0].emoji}</div><div class="spark one">✧</div><div class="spark two">✦</div></div></section>
      <div class="metrics"><div class="metric"><div class="metric-icon peach">🌟</div><div><b>${totalStars()}</b><span>Stars collected</span></div></div><div class="metric"><div class="metric-icon mint">🔤</div><div><b>${practiced()} / 26</b><span>Letters tried</span></div></div><div class="metric"><div class="metric-icon lavender">🏆</div><div><b>${all} / 26</b><span>Letters mastered</span></div></div></div>
      <section class="two-col"><div class="panel"><div class="panel-heading"><h2>Choose your adventure</h2><p>Pick how you want to learn today.</p></div><div class="activity-list"><button class="activity" data-action="start-recommended"><span class="activity-icon violet">👀</span><span><b>Look & listen</b><small>Meet 3 words with big pictures</small></span><strong>→</strong></button><button class="activity" data-action="start-match-home"><span class="activity-icon pink">🧩</span><span><b>Picture game</b><small>Listen, find and tap the right picture</small></span><strong>→</strong></button><button class="activity" data-action="start-word-home"><span class="activity-icon pink">🔎</span><span><b>Find the word</b><small>See a picture and choose its name</small></span><strong>→</strong></button><button class="activity" data-action="start-spell-home"><span class="activity-icon orange">🔡</span><span><b>Build a word</b><small>Put the letter tiles in order</small></span><strong>→</strong></button></div></div><div class="panel daily-panel"><span class="tiny-tag">GROWN-UP TIP</span><div class="daily-emoji">💜</div><h2>No rushing!</h2><p>Help the child say it, spot it, then spell it. Practising on a second day unlocks the next two words.</p><button data-nav="grownups" class="text-link">See the learning plan →</button></div></section>
      <section class="panel"><div class="panel-heading row-heading"><div><h2>Explore the ABC garden</h2><p>Pick a letter to meet its picture friends.</p></div><button class="text-link" data-nav="letters">See all letters →</button></div><div class="letter-preview">${BANK.slice(0,8).map((x,i)=>`<button class="letter-chip" data-letter="${i}" aria-label="Learn letter ${x.letter}"><b>${x.letter}</b><span>${x.words[0].emoji}</span></button>`).join('')}</div></section>
    </div>`;
  }
  function allLetters(){
    return `<div class="layout-flow">${title('🌼 WELCOME TO THE ABC GARDEN','Every letter is an adventure!','Pick any letter. Start with 3 small words, then grow to 5.')}
    <div class="letter-grid">${BANK.map((x,i)=>{const master=learned(i),seen=(p(i).matchDays||[]).length+(p(i).spellDays||[]).length>0;return `<button class="alphabet-card ${master?'mastered':''}" data-letter="${i}" aria-label="Letter ${x.letter}, ${master?'mastered':seen?'practised':'not yet practised'}"><div class="alphabet-top">${master?'⭐':seen?'✓':'✦'}</div><strong>${x.letter}<small>${x.letter.toLowerCase()}</small></strong><span class="alphabet-emoji">${x.words[0].emoji}</span><small>${master?'Super star!':seen?'Keep going':'Let’s learn'}</small></button>`}).join('')}</div><p class="fineprint">Special note: X has two easy X-starting words and three words with X at the end. That’s normal for beginner vocabulary.</p></div>`;
  }
  function lesson(){
    const item=BANK[ui.letter], unlockedNow=unlocked(ui.letter), list=words(ui.letter);
    return `<div class="layout-flow">${btn('← All letters','go-letters','btn btn-ghost back-btn')}<div class="lesson-banner"><div><span class="eyebrow">YOUR LETTER ADVENTURE</span><h1>Letter ${item.letter} <span>${item.letter.toLowerCase()}</span></h1><p>Look at each picture. Say the word out loud!</p><div class="lesson-stats"><span>🌱 ${list.length} little words</span><span>⭐ ${(p(ui.letter).stars||0)} stars</span></div></div><div class="lesson-big">${item.letter.toLowerCase()}<span>${item.words[0].emoji}</span></div></div>
    <div class="section-row"><div><h2>Look, listen & say</h2><p>Tap the speaker to hear each word.</p></div><button class="btn btn-outline small" data-action="toggle-words">${ui.showWords?'🙈 Hide names':'👀 Show names'}</button></div>
    <div class="word-grid">${list.map((w,i)=>`<div class="word-card"><div class="word-number">WORD ${i+1}</div><div class="word-picture">${w.emoji}</div><h3>${ui.showWords?esc(w.text):'<span class="blank-word">'+'_ '.repeat(Math.min(w.text.length,9))+'</span>'}</h3><button class="sound-btn" data-speak="${esc(w.text)}" aria-label="Hear ${esc(w.text)}">🔊 <span>Listen</span></button></div>`).join('')}</div>
    ${item.letter==='X'?'<div class="hint-box">💡 <b>X is special:</b> X-ray and xylophone begin with X. Box, fox and six have the X sound at the end.</div>':''}
    ${!unlockedNow?`<div class="unlock-notice"><span>🔐</span><div><b>Two more words are waiting!</b><p>Finish the word-building game on two different days to unlock 5-word lessons. A grown-up can also unlock them early.</p></div></div>`:`<div class="unlock-notice available"><span>🎉</span><div><b>All 5 words unlocked!</b><p>Great work! Keep practising and try a worksheet.</p></div></div>`}
    <div class="lesson-actions"><button class="btn btn-soft" data-action="play-match">🧩 Picture game <span>→</span></button><button class="btn btn-soft" data-action="play-word">🔎 Find the word <span>→</span></button><button class="btn btn-primary" data-action="play-spell">🔡 Build words <span>→</span></button></div>
    <div class="mini-prompt">✏️ After the games, try writing each word on paper — without looking!</div></div>`;
  }
  function shuffleTileList(w){
    const clean=cleanWord(w);
    const arr=[...clean].map((ch,i)=>({ch,i}));
    // Avoid displaying the solved word in the tile bank wherever possible.
    for(let j=arr.length-1;j>0;j--){const k=Math.floor(Math.random()*(j+1));[arr[j],arr[k]]=[arr[k],arr[j]];}
    if(arr.map(t=>t.ch).join('')===clean&&arr.length>1) [arr[0],arr[1]]=[arr[1],arr[0]];
    return arr;
  }
  function startGame(kind, index=ui.letter){
    ui.letter=index;
    ui.page='game';
    ui.session={kind,q:0,picks:[],tiles:[],mistakes:0,answered:false,message:'',correct:false,run:Math.random(),count:words(index).length};
    setTiles();render();
  }
  function setTiles(){const s=ui.session;if(s&&s.kind==='spell') s.tiles=shuffleTileList(words(ui.letter)[s.q].text);}
  function game(){
    const s=ui.session;if(!s)return home();
    const list=words(ui.letter),w=list[s.q];
    const dots=list.map((_,i)=>`<span class="step-dot ${i<s.q?'done':i===s.q?'now':''}"></span>`).join('');
    const content=s.kind==='word'?`<div class="game-instruction"><span class="game-target">What is this picture called?</span><span class="spell-emoji">${w.emoji}</span></div><div class="answer-pictures word-answers">${list.map((c,i)=>`<button class="picture-choice" data-choice="${i}" ${s.answered?'disabled':''} aria-label="${esc(c.text)}"><span class="word-choice-label">${esc(c.text)}</span></button>`).join('')}</div>`:s.kind==='match'?`<div class="game-instruction"><span class="game-target">Which picture shows <b>${esc(w.text)}</b>?</span><button class="sound-btn accent" data-speak="${esc(w.text)}">🔊 Hear word</button></div><div class="answer-pictures">${list.map((c,i)=>`<button class="picture-choice ${s.answered&&c.text===w.text?'is-right':''}" data-choice="${i}" ${s.answered?'disabled':''} aria-label="${esc(c.text)}"><span>${c.emoji}</span><small>Picture ${i+1}</small></button>`).join('')}</div>`:
    `<div class="spell-target"><div class="spell-emoji">${w.emoji}</div><span>Can you build this word?</span><button class="sound-btn accent" data-speak="${esc(w.text)}">🔊 Listen</button></div><div class="answer-slots">${[...cleanWord(w.text)].map((ch,i)=>`<span class="letter-slot ${s.answered&&s.correct?'success':''} ${s.message&&!s.correct?'try-again':''}" aria-label="Letter position ${i+1}">${s.picks[i]!==undefined?s.tiles[s.picks[i]].ch:'_'}</span>`).join('')}</div><div class="tile-bank">${s.tiles.map((t,i)=>`<button class="tile ${s.picks.includes(i)?'used':''}" data-tile="${i}" ${s.picks.includes(i)||s.answered?'disabled':''} aria-label="Letter ${t.ch}">${t.ch}</button>`).join('')}</div><div class="spell-controls"><button class="btn btn-outline small" data-action="remove-tile" ${s.picks.length===0||s.answered?'disabled':''}>⌫ Undo</button><button class="btn btn-outline small" data-action="clear-tiles" ${s.picks.length===0||s.answered?'disabled':''}>↺ Clear</button><button class="btn btn-primary small" data-action="check-spelling" ${s.picks.length!==cleanWord(w.text).length||s.answered?'disabled':''}>Check ✓</button></div>`;
    return `<div class="layout-flow"><button class="btn btn-ghost back-btn" data-action="back-lesson">← Back to letter ${BANK[ui.letter].letter}</button><div class="game-shell"><div class="game-header"><div><span class="eyebrow">${s.kind==='match'?'🧩 PICTURE GAME':s.kind==='word'?'🔎 FIND THE WORD':'🔡 WORD BUILDER'}</span><h1>${s.kind==='match'?'Listen & find!':s.kind==='word'?'Name this picture!':'Build the word!'}</h1></div><span class="q-count">${s.q+1} of ${list.length}</span></div><div class="steps">${dots}</div>${content}<div class="game-feedback ${s.message?s.correct?'positive':'gentle':''} ${s.message?'visible':''}" role="status">${s.message||'Take your time. You can do it! 💜'}</div></div></div>`;
  }
  function nextQuestion(run){
    const s=ui.session;if(!s||ui.page!=='game'||s.run!==run)return;
    if(s.q+1>=words(ui.letter).length){finishGame();return;}
    s.q++;s.picks=[];s.answered=false;s.message='';s.correct=false;setTiles();render();
  }
  function correctAnswer(){
    const s=ui.session;if(!s||s.answered)return;
    s.answered=true;s.correct=true;s.message=['Wonderful! ⭐','Great job! 🌈','You did it! 🎉','Super spelling! ✨'][s.q%4];render();
    const run=s.run;window.setTimeout(()=>nextQuestion(run),950);
  }
  function choosePicture(index){
    const s=ui.session;if(!s||s.answered||!['match','word'].includes(s.kind))return;
    const w=words(ui.letter)[s.q];
    if(words(ui.letter)[index].text===w.text){correctAnswer();}
    else {s.mistakes++;s.message='Nice try! Look and listen again. 💜';s.correct=false;render();}
  }
  function checkSpelling(){
    const s=ui.session;if(!s||s.answered||s.kind!=='spell')return;
    const word=cleanWord(words(ui.letter)[s.q].text);
    if(s.picks.length!==word.length)return;
    const guess=s.picks.map(i=>s.tiles[i].ch).join('');
    if(guess===word){correctAnswer();}
    else {s.mistakes++;const pos=[...word].findIndex((c,i)=>c!==guess[i]);s.message=`Try again! Check letter ${pos+1}. You’ve got this! 💜`;s.correct=false;render();}
  }
  function finishGame(){
    const s=ui.session;if(!s)return;
    const count=s.count,kind=s.kind;
    modify(ui.letter,x=>{
      const field=kind==='match'?'matchDays':kind==='word'?'recognitionDays':'spellDays';
      x[field]=[...new Set([...(x[field]||[]),TODAY()])];
      x.stars+=count*(kind==='spell'?2:1);
    });
    ui.page='result';render();
  }
  function results(){
    const s=ui.session;
    if(!s)return home();
    const count=s.count;
    return `<div class="result-view"><div class="confetti">✦ ⭐ ✧</div><div class="result-medal">🏆</div><span class="eyebrow">MISSION COMPLETE</span><h1>You’re a word star!</h1><p>You finished ${count} ${s.kind==='spell'?'spelling words':'picture and word questions'} for letter ${BANK[ui.letter].letter}. Every try helps your brain grow!</p><div class="result-stats"><span>⭐ +${count*(s.kind==='spell'?2:1)} stars</span><span>🌱 ${count} words practised</span></div>${!unlocked(ui.letter)&&s.kind==='spell'?`<p class="fineprint">Come back on another day and build these words again to unlock 2 more words.</p>`:''}<div class="result-buttons">${btn('Explore another letter','next-letter','btn btn-soft')}${btn('Back to my words','back-lesson','btn btn-primary')}</div></div>`;
  }
  function worksheetRows(i,type,count,answers){
    const list=BANK[i].words.slice(0,count);
    if(type==='copy')return `<div class="sheet-directions">Read the word. Trace the pale letters, then write it yourself.</div>${list.map((w,n)=>`<div class="ws-row"><span class="ws-no">${n+1}.</span><span class="ws-emoji">${w.emoji}</span><div class="ws-task"><b>${esc(w.text)}</b><span class="trace">${esc(w.text)} &nbsp; ${esc(w.text)}</span><span class="writing-line"></span></div></div>`).join('')}`;
    if(type==='missing')return `<div class="sheet-directions">Look at the picture. Fill in the missing letter.</div>${list.map((w,n)=>{const t=w.text,idx=t.length<=2?0:Math.floor(t.length/2),masked=[...t].map((c,k)=>k===idx?'___':c).join('');return `<div class="ws-row"><span class="ws-no">${n+1}.</span><span class="ws-emoji">${w.emoji}</span><div class="ws-task"><span class="missing-word">${answers?esc(t):esc(masked)}</span><span class="writing-line"></span></div></div>`;}).join('')}`;
    return `<div class="sheet-directions">Say the picture’s name, then write the whole word yourself.</div>${list.map((w,n)=>`<div class="ws-row"><span class="ws-no">${n+1}.</span><span class="ws-emoji">${w.emoji}</span><div class="ws-task"><span class="writing-line"></span>${answers?`<b class="answer-key">${esc(w.text)}</b>`:''}<span class="writing-line"></span></div></div>`).join('')}`;
  }
  function worksheetHTML(){
    const L=BANK[ui.letter],count=ui.worksheetCount,typ=ui.worksheetType,answers=ui.worksheetAnswers;
    const sub={copy:'Trace & Copy',missing:'Missing Letter',recall:'Picture Spelling'}[typ];
    return `<article class="paper" id="paper"><div class="paper-top"><span class="paper-brand">little<span>letters</span> ✦</span><span class="paper-badge">CLASS 1 · ENGLISH</span></div><h2>Letter ${L.letter} — ${sub}</h2><div class="paper-details"><span>Name: _______________________</span><span>Date: ______________</span></div><div class="paper-body">${worksheetRows(ui.letter,typ,count,answers)}</div><div class="paper-end">🌟 I tried my best! &nbsp; Stars earned: ☆ ☆ ☆ ☆ ☆</div><div class="paper-footer">Little Letters · Learn, Play, Write &nbsp; | &nbsp; Grown-up tip: praise effort, not speed.</div></article>`;
  }
  function worksheets(){
    return `<div class="layout-flow">${title('✏️ PRACTICE ON REAL PAPER','Make a worksheet!','Choose a letter and a small activity. Print it when the child is ready.')}
    <div class="worksheet-layout"><div class="panel controls-panel"><h2>Make it your own</h2><label for="ws-letter">Choose a letter</label><select class="input-control" id="ws-letter">${BANK.map((w,i)=>`<option value="${i}" ${i===ui.letter?'selected':''}>${w.letter} — ${w.words[0].text}</option>`).join('')}</select><label for="ws-type">Worksheet activity</label><select class="input-control" id="ws-type"><option value="copy" ${ui.worksheetType==='copy'?'selected':''}>1. Trace & copy</option><option value="missing" ${ui.worksheetType==='missing'?'selected':''}>2. Missing letters</option><option value="recall" ${ui.worksheetType==='recall'?'selected':''}>3. Picture spelling</option></select><div class="label-like">How many words?</div><div class="segmented"><button data-count="3" class="${ui.worksheetCount===3?'active':''}">3 easy</button><button data-count="5" class="${ui.worksheetCount===5?'active':''}">All 5</button></div><label class="checkrow"><input type="checkbox" id="ws-answers" ${ui.worksheetAnswers?'checked':''}><span>Show answers on the sheet</span></label><div class="separator"></div><button class="btn btn-primary full" data-action="print">🖨️ Print worksheet</button><p class="fineprint">The browser’s Print menu can also save it as a PDF. Worksheets are A4-friendly.</p></div><div class="preview-panel"><div class="preview-heading"><b>Live worksheet preview</b><span>A4 PORTRAIT</span></div>${worksheetHTML()}</div></div></div>`;
  }
  function grownups(){
    const progress=letterMastered();
    return `<div class="layout-flow">${title('☕ THE GROWN-UP CORNER','Small steps really work.','A simple, practical plan for teaching a Class 1 learner without overwhelming them.')}
    <div class="parent-lead"><div class="parent-lead-icon">👩‍🏫</div><div><h2>10–15 minutes is enough.</h2><p>First show 3 picture words. Let them hear, say, recognise and build each word. Once they can do that on two separate days, introduce 2 more. End with a short paper worksheet.</p></div></div>
    <div class="routine-grid"><div class="routine"><span>01 · 3 MINUTES</span><b>👀 Look & say</b><p>Show the picture, read the word and repeat together.</p></div><div class="routine"><span>02 · 3 MINUTES</span><b>🧩 Listen & find</b><p>Say a word. Ask the child to choose its picture.</p></div><div class="routine"><span>03 · 4 MINUTES</span><b>🔡 Build the word</b><p>Let them arrange letters to spell the word.</p></div><div class="routine"><span>04 · 3 MINUTES</span><b>✏️ Write on paper</b><p>Copy once. Later, write without seeing the spelling.</p></div></div>
    <div class="panel"><div class="panel-heading row-heading"><div><h2>Progress & word levels</h2><p>${progress} of 26 letters mastered. Progress is stored only on this device.</p></div><span class="tiny-tag">LOCAL ONLY</span></div><div class="progress-track"><span style="width:${progress/26*100}%"></span></div><div class="parent-letter-list">${BANK.map((b,i)=>{const d=p(i),days=[...new Set(d.spellDays||[])].length;return `<div class="parent-letter"><b class="parent-letter-mark">${b.letter}</b><span><b>${days>=2?'Mastered':days===1?'Practised once':'Just starting'}</b><small>${days}/2 spelling days · ${words(i).length} active words</small></span><button class="mini-switch ${unlocked(i)?'on':''}" data-unlock="${i}" aria-label="${unlocked(i)?'Hide':'Unlock'} extra words for ${b.letter}" ${learned(i)?'disabled':''}>${unlocked(i)?'5 words':'Unlock 5'}</button></div>`;}).join('')}</div></div>
    <div class="panel"><h2>✍️ Words written correctly on paper</h2>
    <p class="fineprint">Building a word from tiles isn't the same as writing it independently. After the child writes a word correctly without seeing the answer, tick it here.</p>
    <label for="paper-letter">Choose a letter</label>
    <select class="input-control paper-letter-select" id="paper-letter">${BANK.map((b,i)=>`<option value="${i}" ${i===ui.letter?'selected':''}>${b.letter} — ${esc(b.words[0].text)}</option>`).join('')}</select>
    <div class="paper-checklist">${BANK[ui.letter].words.map((w,i)=>`<label class="paper-check"><input type="checkbox" data-paper-index="${i}" ${Array.isArray(p(ui.letter).paper)&&p(ui.letter).paper.includes(w.text)?'checked':''}/><span>${w.emoji} ${esc(w.text)}</span></label>`).join('')}</div>
    </div>
    <div class="panel safety-panel"><h2>Helpful things to know</h2><p>✨ Avoid making a child memorise 130 words in one sitting. Praise trying and improvement. If sound-to-letter recognition is difficult, spend more time on sounds before spelling.</p><p>🔊 Speech uses your device’s built-in voice and may depend on available voices. All 130 words, games and progress work without an account. The app can work offline after it has been loaded and installed.</p><p>🔒 This app doesn’t ask for names, accounts or personal information. Removing browser data may erase the child’s progress.</p><button class="btn btn-outline reset-button" data-action="reset-progress">Reset saved progress</button></div></div>`;
  }
  function render(){
    if(!BANK || !BANK.length){app.innerHTML='<p>Could not load alphabet words. Please refresh.</p>';return;}
    app.innerHTML=Mayhem.getAge()?`${header()}<main class="main-content" id="main-content">${({home:landing,letters:allLetters,lesson,game,result:results,worksheets,grownups,library:()=>WordStudio.library('library'),dictionary:()=>LexiconExplorer.view(),idioms:()=>WordStudio.library('idioms'),review:WordStudio.review,'atlas-lesson':WordStudio.lesson,challenge:FriendChallenge.render,missions:()=>KidV5 && ['4-6','7-9','10-13'].includes(Mayhem.getAge())?KidV5.hub():Mayhem.hub(),'mission-play':()=>KidV5 && ['4-6','7-9','10-13'].includes(Mayhem.getAge())?KidV5.play():Mayhem.play(),profile:Mayhem.agePicker,goals:WordStudio.goals,arsenal:WordStudio.arsenal}[ui.page]||landing)()}</main><div id="live-msg" role="status" aria-live="polite" class="sr-only"></div>`:`<main class="welcome-screen">${Mayhem.welcome()}</main><div id="live-msg" class="sr-only" role="status" aria-live="polite"></div>`;
    printSheet.innerHTML=worksheetHTML();
  }
  app.addEventListener('click',ev=>{
    const lex=ev.target.closest('[data-lx]');if(lex){const task=lex.dataset.lx;if(task==='speak')LexiconExplorer.speak();else if(task.indexOf('sense:')===0)LexiconExplorer.select(task.split(':')[1]);render();return;}
    const adult=ev.target.closest('[data-v5]');
    if(adult){
      const action=adult.dataset.v5;
      const text=action==='checkwriting'?(app.querySelector('#v5-sentence')?.value||''):'';
      WordStudio.action(action,text);
      ui.page=WordStudio.ui.view==='lesson'?'atlas-lesson':WordStudio.ui.view==='home'?'home':WordStudio.ui.view;
      render();return;
    }
    const kid=ev.target.closest('[data-k5]');
    if(kid && KidV5){
      const route=KidV5.action(kid.dataset.k5);
      if(route==='hub'){navigate('missions');return;}
      if(route==='builder'){navigate('missions');return;}
      ui.page='mission-play';render();return;
    }
    const pickAtlas=ev.target.closest('[data-atlas-pick]');
    if(pickAtlas){WordStudio.pick(pickAtlas.dataset.atlasPick,pickAtlas.dataset.atlasKind);navigate('atlas-lesson');return;}
    const option=ev.target.closest('[data-atlas-opt]');
    if(option){const q=WordStudio.question();if(q&&!WordStudio.ui.feedback){WordStudio.answer(q.options[Number(option.dataset.atlasOpt)]);render();}return;}
    const actionAtlas=ev.target.closest('[data-atlas]');
    if(actionAtlas){WordStudio.action(actionAtlas.dataset.atlas);ui.page=WordStudio.ui.view==='lesson'?'atlas-lesson':WordStudio.ui.view==='home'?'home':WordStudio.ui.view;render();return;}
    const category=ev.target.closest('[data-atlas-cat]');
    if(category){WordStudio.setCategory(category.dataset.atlasCat);render();return;}
    const tier=ev.target.closest('[data-challenge-tier]');
    if(tier){FriendChallenge.tier(tier.dataset.challengeTier);render();return;}
    const answerChallenge=ev.target.closest('[data-challenge-answer]');
    if(answerChallenge){FriendChallenge.answer(answerChallenge.dataset.challengeAnswer);render();return;}
    const challengeAction=ev.target.closest('[data-challenge]');
    if(challengeAction){FriendChallenge.click(challengeAction.dataset.challenge);render();return;}
    const age=ev.target.closest('[data-age]');if(age){Mayhem.chooseAge(age.dataset.age);navigate('home');return;}
    const mission=ev.target.closest('[data-mission]');if(mission){if(Mayhem.select(mission.dataset.mission)){navigate('mission-play');}return;}
    const wordTile=ev.target.closest('[data-word-tile]');if(wordTile){Mayhem.pickTile(wordTile.dataset.wordTile);render();return;}
    const remove=ev.target.closest('[data-remove]');if(remove){Mayhem.removeTile(remove.dataset.remove);render();return;}
    const meaning=ev.target.closest('[data-meaning-word]');if(meaning){Mayhem.meaningWord(meaning.dataset.meaningWord);return;}
    const mayhemAction=ev.target.closest('[data-mayhem]');if(mayhemAction){const route=Mayhem.runAction(mayhemAction.dataset.mayhem);if(route==='hub')navigate('missions');else{ui.page='mission-play';render();}return;}
    const nav=ev.target.closest('[data-nav]'); if(nav){if(['library','idioms','review','goals','arsenal'].includes(nav.dataset.nav))WordStudio.view(nav.dataset.nav);navigate(nav.dataset.nav);return;}
    const pickLetter=ev.target.closest('[data-letter]');if(pickLetter){selectLetter(pickLetter.dataset.letter);return;}
    const talk=ev.target.closest('[data-speak]');if(talk){speak(talk.dataset.speak);return;}
    const choice=ev.target.closest('[data-choice]');if(choice){choosePicture(Number(choice.dataset.choice));return;}
    const tile=ev.target.closest('[data-tile]');if(tile){const s=ui.session,i=Number(tile.dataset.tile);if(s&&!s.answered&&!s.picks.includes(i)){s.picks.push(i);render();}return;}
    const counter=ev.target.closest('[data-count]');if(counter){ui.worksheetCount=Number(counter.dataset.count);render();return;}
    const toggle=ev.target.closest('[data-unlock]');if(toggle){const i=Number(toggle.dataset.unlock);if(!learned(i))modify(i,d=>{d.unlock=!d.unlock;});render();return;}
    const b=ev.target.closest('[data-action]');if(!b)return;
    switch(b.dataset.action){
      case 'start-recommended':selectLetter(nextRecommended());break;
      case 'start-match-home':startGame('match',nextRecommended());break;
      case 'start-spell-home':startGame('spell',nextRecommended());break;
      case 'start-word-home':startGame('word',nextRecommended());break;
      case 'go-letters':navigate('letters');break;
      case 'back-lesson':selectLetter(ui.letter);break;
      case 'toggle-words':ui.showWords=!ui.showWords;render();break;
      case 'play-match':startGame('match');break;
      case 'play-word':startGame('word');break;
      case 'play-spell':startGame('spell');break;
      case 'check-spelling':checkSpelling();break;
      case 'clear-tiles':if(ui.session&&!ui.session.answered){ui.session.picks=[];ui.session.message='';render();}break;
      case 'remove-tile':if(ui.session&&!ui.session.answered){ui.session.picks.pop();ui.session.message='';render();}break;
      case 'next-letter':selectLetter((ui.letter+1)%26);break;
      case 'print':if(window.LittleLettersAndroid && window.LittleLettersAndroid.printWorksheet){window.LittleLettersAndroid.printWorksheet();}else{window.print();}break;
      case 'reset-progress':if(window.confirm('Erase all saved stars, letter progress and unlocked word levels on this device?')){data=initialProgress();try{localStorage.setItem(KEY,JSON.stringify(data));}catch{}render();}break;
    }
  });
  // Drag on browsers that support it; tapping tiles is always the fallback for phones.
  app.addEventListener('dragstart',ev=>{
    const tile=ev.target.closest('[data-word-tile]');
    if(tile && !tile.disabled && ev.dataTransfer) ev.dataTransfer.setData('text/plain',tile.dataset.wordTile);
  });
  app.addEventListener('dragover',ev=>{if(ev.target.closest('.sentence-line'))ev.preventDefault();});
  app.addEventListener('drop',ev=>{
    if(!ev.target.closest('.sentence-line') || !ev.dataTransfer) return;
    ev.preventDefault();
    const key=ev.dataTransfer.getData('text/plain');
    if(/^\d+$/.test(key)){Mayhem.pickTile(key);render();}
  });
  app.addEventListener('submit',ev=>{if(ev.target.id==='lx-form'){ev.preventDefault();const input=ev.target.querySelector('#lx-input');LexiconExplorer.lookup(input?input.value:'').then(()=>render());return;}if(ev.target.id==='atlas-answer-form'){
    ev.preventDefault();const input=ev.target.querySelector('#atlas-typed');if(input&&!WordStudio.ui.feedback){WordStudio.answer(input.value);render();}
  }});
  app.addEventListener('input',ev=>{
    if(ev.target.id==='v5-search'){WordStudio.search(ev.target.value);const pos=ev.target.selectionStart;render();const input=app.querySelector('#v5-search');if(input){input.focus();input.setSelectionRange(pos,pos);}return;}if(ev.target.id==='atlas-search'){
    WordStudio.setSearch(ev.target.value);const mirror=document.createElement('div');mirror.innerHTML=WordStudio.library(WordStudio.ui.view);
    const fresh=mirror.querySelector('#atlas-gallery'),old=document.querySelector('#atlas-gallery');if(fresh&&old)old.innerHTML=fresh.innerHTML;
  }});
  app.addEventListener('change',ev=>{
    if(ev.target.id==='v5-level'){WordStudio.level(ev.target.value);return;}
    if(ev.target.id==='paper-letter'){ui.letter=Number(ev.target.value);render();}
    if(ev.target.matches('[data-paper-index]')){const w=BANK[ui.letter].words[Number(ev.target.dataset.paperIndex)].text;modify(ui.letter,d=>{const paper=new Set(d.paper||[]);ev.target.checked?paper.add(w):paper.delete(w);d.paper=[...paper];});render();}
    if(ev.target.id==='ws-letter'){ui.letter=Number(ev.target.value);render();}
    if(ev.target.id==='ws-type'){ui.worksheetType=ev.target.value;render();}
    if(ev.target.id==='ws-answers'){ui.worksheetAnswers=ev.target.checked;render();}
  });
  if(!window.LittleLettersAndroid && 'serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
  }
  if(FriendChallenge.initHash()){
    if(!Mayhem.age())Mayhem.setAge(FriendChallenge.state.tier==='10-13'?'10-13':'7-9');
    ui.page='challenge';
  }
  render();
})();

const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const window={};vm.runInNewContext(fs.readFileSync('coach-learning.js','utf8'),{window});const {validate,topics}=window.CoachLearning;
test('rejects screenshot dialogue fabrication and instruction leakage',()=>{
 for(const reply of ['Learner: Mera how r u Mira: How did your day go today? Learner: I had a great day!','Mira: How did your day go today? Learner: I had a great day!','No role labels, only yourself. Help with English when asked.'])assert.equal(validate(reply,'hello','').ok,false);
});
test('rejects repeated assistant response and learner parrot without blocking legitimate answers',()=>{
 assert.equal(validate('How did your day go today? 😊','what are you doing','How did your day go today?').ok,false);
 assert.equal(validate('Your manager rejected your idea.','Your manager rejected your idea.','').ok,false);
 assert.equal(validate('Mira: Could you tell me what happened next?','I missed my bus.','').text,'Could you tell me what happened next?');
});
test('every authored lesson has a transfer prompt, explanation and optional example',()=>{for(const lesson of Object.values(topics)){assert(lesson.prompt.length>20);assert(lesson.tip.length>20);assert(lesson.example.length>20);}});
test('native model receives typed conversation turns and no perpetual check-in command',()=>{const s=fs.readFileSync('android/app/src/offline/java/com/littleletters/learn/LocalCoach.kt','utf8');assert.match(s,/initialMessages=history/);assert.match(s,/Message.model\(text\)/);assert.match(s,/Message.user\(prompt\)/);assert.doesNotMatch(s,/If this is the start|Recent conversation \(quoted data\)/);assert.match(s,/30,TimeUnit.SECONDS/);});

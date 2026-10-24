/* GrammarCore 0.1 - offline, curriculum-aware English correction.
 * A hand-authored high-precision rule detector + small trained statistical
 * candidate ranking model in grammar-model.js. This is not an LLM.
 * All code and models run on-device without requests to external services.
 */
(function(root){
'use strict';
var MODEL=root.GrammarCoreModel||{bias:0,weights:{}};
var CONTEXT=root.GrammarContext||null;
var irregularSubjects={children:'plural',people:'plural',men:'plural',women:'plural',feet:'plural',teeth:'plural',mice:'plural',data:'plural',everyone:'singular',someone:'singular',anyone:'singular',nobody:'singular',person:'singular',child:'singular',man:'singular',woman:'singular',news:'singular',analysis:'singular',business:'singular',success:'singular',class:'singular',glass:'singular',boss:'singular'};
var verbs=['agree','allow','answer','argue','ask','avoid','begin','believe','bring','build','buy','call','carry','change','check','choose','claim','clarify','come','compare','complete','consider','create','decide','deliver','describe','design','develop','discuss','do','drink','eat','explain','feel','find','finish','fix','follow','get','give','go','grow','handle','have','help','hide','improve','include','influence','invest','keep','know','learn','lead','leave','listen','live','look','love','make','manage','mean','meet','mitigate','move','need','offer','open','organise','organize','pay','plan','play','prefer','prepare','present','protect','provide','read','receive','reduce','remember','respond','review','rise','run','say','save','see','sell','send','share','show','sit','solve','speak','start','stay','stop','study','suggest','support','take','talk','teach','tell','think','transform','try','understand','use','visit','wait','walk','want','watch','win','work','write'];
var verbSet=Object.create(null);verbs.forEach(function(x){verbSet[x]=1;});
// For unknown nouns and adjectives, avoid inventing subject-verb corrections.
var nounSubjects='student students teacher teachers child children dog dogs cat cats friend friends manager managers person people man men woman women boy boys girl girls customer customers client clients patient patients doctor doctors worker workers player players company companies project projects renaissance book books city cities artist artists writer writers parent parents robot robots duck ducks frog frogs penguin penguins puppy puppies'.split(' ');
var subjectNouns=Object.create(null);nounSubjects.forEach(function(x){subjectNouns[x]=1;});
var irregularThird={do:'does',go:'goes',have:'has',say:'says'};
var irregularPast={go:'went',run:'ran',eat:'ate',buy:'bought',bring:'brought',think:'thought',write:'wrote',take:'took',make:'made',get:'got',find:'found',see:'saw',give:'gave',do:'did',have:'had',read:'read',come:'came',speak:'spoke',teach:'taught',begin:'began',win:'won',know:'knew',feel:'felt',build:'built',send:'sent',leave:'left',sell:'sold'};
function third(base){if(irregularThird[base])return irregularThird[base];if(/[^aeiou]y$/.test(base))return base.slice(0,-1)+'ies';if(/(ch|sh|ss|x|z|o)$/.test(base))return base+'es';return base+'s';}
var conjugated=Object.create(null);verbs.forEach(function(v){conjugated[third(v)]=v;});
var articles={honest:1,hour:1,honour:1,honor:1,heir:1,university:0,uniform:0,unicorn:0,union:0,unique:0,user:0,useful:0,european:0,euphemism:0,eucalyptus:0,one:0,once:0};
function wantsAn(word){var s=word.toLowerCase();if(articles[s]!==undefined)return !!articles[s];return /^[aeiou]/.test(s);}
function tokens(text){var re=/[A-Za-z]+(?:['’][A-Za-z]+)?|\d+(?:\.\d+)?/g,m,out=[];while((m=re.exec(text))!==null)out.push({word:m[0],lower:m[0].toLowerCase().replace(/’/g,"'"),start:m.index,end:m.index+m[0].length});return out;}
function formatReplacement(original,value){return /^[A-Z]/.test(original)?value.charAt(0).toUpperCase()+value.slice(1):value;}
function score(text){var toks=tokens(text).map(function(t){return t.lower;});var w=MODEL.weights||{},sum=Number(MODEL.bias||0);for(var i=0;i<toks.length;i++){sum+=w['u:'+toks[i]]||0;if(i>0)sum+=w['b:'+toks[i-1]+' '+toks[i]]||0;if(i>1)sum+=w['t:'+toks[i-2]+' '+toks[i-1]+' '+toks[i]]||0;}return Math.round(sum*1000)/1000;}
function replace(text,issue){return text.slice(0,issue.start)+issue.replacement+text.slice(issue.end);}
function nominalKind(word){if(['i','you','we','they'].indexOf(word)>=0)return word==='i'?'first':'plural';if(['he','she','it'].indexOf(word)>=0)return 'singular';if(irregularSubjects[word])return irregularSubjects[word];if(/ies$/.test(word)&&word.length>4)return 'plural';if(/s$/.test(word)&&!/ss$/.test(word))return 'plural';return 'singular';}
function detect(text){var ts=tokens(text),issues=[],occupied=[];
function add(type,index,replacement,explanation,reason){var t=ts[index];if(!t||occupied.indexOf(index)>=0)return;occupied.push(index);var word=formatReplacement(t.word,replacement);issues.push({type:type,word:t.word,start:t.start,end:t.end,replacement:word,explanation:explanation,reason:reason||type});}
for(var i=0;i<ts.length;i++){
 var t=ts[i],prev=ts[i-1],next=ts[i+1],p=prev&&prev.lower,n=next&&next.lower;
 if(prev&&p===t.lower&&/^[a-z]+$/.test(t.lower)&&!['very','had','that'].includes(t.lower)){add('repetition',i,'',"You have written ‘"+t.word+"’ twice. Remove the repeated word.");continue;}
 if((t.lower==='a'||t.lower==='an')&&next&&/^[a-z]+$/.test(n)){
   var needed=wantsAn(n)?'an':'a';if(t.lower!==needed)add('article',i,needed,'Use “'+needed+'” before “'+next.word+'” because of the word’s opening sound (not just its first letter).');
   if(/^\w+s$/.test(n)&&n.length>3&&!['news','bus','class','glass','analysis','success','business','mass','focus','process','status','series','species'].includes(n)){
     // Singular article + plural noun; avoid interpreting a compound noun automatically.
     if(i+2>=ts.length||!verbSet[ts[i+2].lower])add('number',i,'','A singular article usually cannot introduce a plural count noun such as “'+next.word+'”. Try removing the article or using a singular noun.');
   }
 }
 if((t.lower==='more'&&n==='better')||(t.lower==='most'&&n==='best'))add('comparison',i,'','Avoid double comparatives: “better” and “best” already express comparison.');
 if(!next)continue;
 // Restrict subject–verb checks to direct, simple subject + verb pairs.
 var subject=t.lower;
 var kind=nominalKind(subject);
 // Noun phrases with a determiner: "the student is", "my friends are".
 if(['the','a','an','my','your','his','her','our','their','this','that','these','those'].indexOf(subject)>=0)continue;
 var couldSubject=['i','you','he','she','it','we','they','everyone','someone','anyone','nobody','people','children'].includes(subject)
   || (i>0&&subjectNouns[subject]&&['the','a','an','my','your','his','her','our','their','this','that','these','those'].includes(p));
 if(!couldSubject)continue;
 var expectedBe=kind==='first'?'am':kind==='plural'?'are':'is';
 if(['am','is','are'].includes(n)&&n!==expectedBe){
   var wording='With “'+t.word+'”, use “'+expectedBe+'” in the present tense, not “'+next.word+'”.';
   add('agreement',i+1,expectedBe,wording);continue;
 }
 var expectedHave=kind==='singular'?'has':'have';
 if(['have','has'].includes(n)&&n!==expectedHave){add('agreement',i+1,expectedHave,'With “'+t.word+'”, the present-tense form is “'+expectedHave+'”.');continue;}
 if(['do','does',"don't","doesn't"].includes(n)){
   var neg=/n't$/.test(n),need=kind==='singular'?(neg?"doesn't":'does'):(neg?"don't":'do');
   if(n!==need)add('agreement',i+1,need,'Use “'+need+'” with “'+t.word+'” in the present tense.');
   continue;
 }
 // Present-simple lexical verb agreement. Avoid known auxiliaries and progressive forms.
 if(verbSet[n]&&['have','do','be'].indexOf(n)<0){
   if(kind==='singular'){add('agreement',i+1,third(n),'For present-simple actions, “'+t.word+'” takes “'+third(n)+'”, not “'+next.word+'”.');continue;}
 }
 if(conjugated[n]&&kind!=='singular')add('agreement',i+1,conjugated[n],'With “'+t.word+'”, use the base verb “'+conjugated[n]+'” in the present simple.');
}
return issues.sort(function(a,b){return a.start-b.start;});
}
function normaliseSpacing(s){return s.replace(/\s{2,}/g,' ').replace(/\s+([,.!?;:])/g,'$1').trim();}
function check(text,opts){opts=opts||{};var sentence=String(text||'').trim();var issues=detect(sentence),corrected=sentence;
for(var i=issues.length-1;i>=0;i--){var issue=issues[i];var candidate=replace(sentence,issue);issue.modelDelta=Number((score(candidate)-score(sentence)).toFixed(3));corrected=replace(corrected,issue);}
corrected=normaliseSpacing(corrected);
var entry=opts.entry||null,target=(opts.target||opts.word||(entry&&entry.title)||'').trim();var hasTarget=true,lexiconNote='';
if(target){var escaped=target.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');var rx=new RegExp('(?:^|[^a-z])'+escaped+'(?=$|[^a-z])','i');hasTarget=rx.test(sentence);if(!hasTarget)lexiconNote='Use “'+target+'” in your own sentence. '+(entry&&entry.example?'Example: '+entry.example:'');else lexiconNote='The target expression appears. The checker cannot independently establish that its meaning fits this scenario.';}
var beforeContext=CONTEXT?CONTEXT.rank(sentence):null,afterContext=CONTEXT?CONTEXT.rank(corrected):null;
var possible=CONTEXT&&CONTEXT.alternatives?CONTEXT.alternatives(corrected):[];
return {possible:possible,context:{ready:beforeContext!==null,original:beforeContext,correction:afterContext,relative:beforeContext===null||afterContext===null?null:Number((afterContext-beforeContext).toFixed(4)),note:'Phrase frequency is weak evidence and cannot prove a sentence is grammatical.'},text:sentence,issues:issues,suggested:corrected,hasTarget:hasTarget,target:target,lexiconNote:lexiconNote,score:score(sentence),suggestedScore:score(corrected),status:issues.length?'issues':!hasTarget?'missing-target':'review',canCertify:false,model:'GrammarCore hybrid 0.1'};
}
root.GrammarCore={check:check,detect:detect,score:score,tokens:tokens,modelBytes:JSON.stringify(MODEL).length,version:'0.2.0'};
})(typeof window!=='undefined'?window:globalThis);

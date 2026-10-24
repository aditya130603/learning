"""Train a tiny non-generative sentence plausibility ranker on synthetic grammar pairs.

The model is NOT a general grammar checker. Rule-based detectors provide diagnostics.
This statistical model only ranks a correction candidate against the original.
Generated examples are deliberately limited and benchmarks here must not be
represented as external English-language accuracy.
"""
import json, random, pathlib, re
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import GroupShuffleSplit

root=pathlib.Path(__file__).resolve().parents[1]
rng=random.Random(20261025)
subjects=[('I','am','have','do',0),('You','are','have','do',0),('He','is','has','does',1),('She','is','has','does',1),('It','is','has','does',1),('We','are','have','do',0),('They','are','have','do',0),('The student','is','has','does',1),('The students','are','have','do',0),('My friend','is','has','does',1),('Our friends','are','have','do',0),('The teacher','is','has','does',1),('The teachers','are','have','do',0),('The manager','is','has','does',1),('The managers','are','have','do',0),('A writer','is','has','does',1),('The writers','are','have','do',0)]
verbs=['mitigate','improve','create','explain','describe','develop','review','answer','offer','plan','change','learn','walk','help','protect','share','consider','visit','watch','prefer','deliver','support','lead','present','discuss','clarify','manage','reduce','handle','compare','explore','accept','suggest','design','write','read','study']
objects=['the risk','a good plan','a useful method','the idea','an exciting story','an urgent task','a serious problem','the contract','a practical solution','the options','the project','a meaningful example','the issue','the result','the report','the business']
adjectives=['important','useful','unusual','ambitious','honest','clear','meticulous','essential','unequivocal','concise','effective','unexpected','elegant','helpful','eloquent','audacious','interesting','amazing','impressive','exciting']
def third(v):
    if v=='have':return 'has'
    if v=='do':return 'does'
    if v=='go':return 'goes'
    if v.endswith('y') and v[-2] not in 'aeiou':return v[:-1]+'ies'
    if v.endswith(('ch','sh','ss','x','z','o')):return v+'es'
    return v+'s'
def needs_an(w):return w[0] in 'aeiou' and not w.startswith(('uni','use','eu','one')) or w.startswith(('honest','hour','heir'))
examples=[]
for k in range(3000):
    subject,be,have,do,sing=rng.choice(subjects)
    v=rng.choice(verbs);obj=rng.choice(objects);adj=rng.choice(adjectives)
    form=third(v) if sing else v
    mode=k%4
    if mode==0:
        good=f'{subject} {form} {obj}.'
        bad=f'{subject} {v if sing else third(v)} {obj}.'
    elif mode==1:
        good=f'{subject} {be} {adj}.'
        bad=f'{subject} {rng.choice([a for a in ["am","is","are"] if a!=be])} {adj}.'
    elif mode==2:
        good=f'{subject} {have} {obj}.'
        bad=f'{subject} {"have" if have=="has" else "has"} {obj}.'
    else:
        article='an' if needs_an(adj) else 'a'
        good=f'{subject} {be} {article} {adj} person.'
        bad=f'{subject} {be} {"a" if article=="an" else "an"} {adj} person.'
    if good!=bad:
        examples.extend([(good,1,k),(bad,0,k)])

# Keep matching good/bad pairs in the same split to prevent direct leakage.
texts=[s for s,_,_ in examples]
y=[label for _,label,_ in examples]
groups=[idx for _,_,idx in examples]
vectorizer=CountVectorizer(lowercase=True,ngram_range=(1,3), min_df=3,token_pattern=r"(?u)\b[a-zA-Z]+\b",binary=False)
X=vectorizer.fit_transform(texts)
train_idx,test_idx=next(GroupShuffleSplit(n_splits=1,test_size=0.2,random_state=2026).split(X,y,groups))
clf=LogisticRegression(max_iter=250,C=0.3)
clf.fit(X[train_idx],[y[i] for i in train_idx])
weights={}
for name,weight in zip(vectorizer.get_feature_names_out(),clf.coef_[0]):
    val=round(float(weight),4)
    if abs(val)>=0.012:
        typ='u:' if name.count(' ')==0 else 'b:' if name.count(' ')==1 else 't:'
        weights[typ+name]=val
model={'version':'0.1-synthetic','bias':round(float(clf.intercept_[0]),4),'weights':weights,'trained_on':'synthetic agreement, determiner and verb patterns; NOT natural-language benchmark'}
export='window.GrammarCoreModel='+json.dumps(model,separators=(',',':'),ensure_ascii=True)+';\n'
(root/'grammar-model.js').write_text(export,encoding='utf-8')
labels=clf.predict(X[test_idx]);synthetic_accuracy=accuracy_score([y[i] for i in test_idx],labels)
report={'synthetic_pair_holdout_accuracy':round(float(synthetic_accuracy),3),'holdout_samples':len(test_idx),'feature_count':len(weights),'model_bytes':len(export.encode()),'note':'These are generated examples; accuracy is NOT a real-world grammar benchmark.'}
(root/'training'/'TRAINING_REPORT.json').write_text(json.dumps(report,indent=2)+'\n')
print(report)

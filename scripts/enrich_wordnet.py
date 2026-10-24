#!/usr/bin/env python3
"""Build *source-grounded* learning prompts for every OEWN dictionary entry.

No model-generated facts, no guessed etymology, no unsupported opposites.
The output is intentionally compact and letter-sharded for offline Android 5 WebView.
Only build after scripts/build_wordnet.py. Source: Open English WordNet (CC BY 4.0).
"""
from __future__ import annotations
import argparse
import hashlib
import json
import re
from collections import Counter
from pathlib import Path

LETTERS = 'abcdefghijklmnopqrstuvwxyz'
WORDS = re.compile(r"[a-z]+(?:'[a-z]+)?", re.I)
STOP = {'a','the','to','and','with','for','from','that','this','who','which','what','into','of','is','an','at','are','on','as','or','in','be','it','by'}

def safe(text):
    return ' '.join(str(text or '').split())

def tokens(text):
    return set(x.lower() for x in WORDS.findall(text) if len(x)>2 and x.lower() not in STOP)

def hash_num(s):
    return int.from_bytes(hashlib.blake2s(s.encode('utf-8'),digest_size=8).digest(),'little')

def distractors(term, sense, pool):
    meaning = safe(sense.get('d',''))
    own = tokens(meaning)
    excluded = {term.lower(), *(str(w).lower() for w in sense.get('s',[]))}
    size=len(pool)
    if not size:return []
    start=hash_num(term+'|'+meaning)%size
    # Coprime increment avoids repeatedly testing one candidate in uneven shards.
    from math import gcd
    jump=131 if size>131 else 1
    while gcd(jump,size)!=1:jump+=2
    unique=[]
    for n in range(min(size,180)):
        other,definition=pool[(start+n*jump)%size]
        if other.lower() in excluded or not definition or definition==meaning:continue
        if len(definition)<14 or len(definition)>180:continue
        ts=tokens(definition)
        if len(own & ts)>=2:continue
        if any(definition==existing or len(ts & tokens(existing))>=3 for existing in unique):continue
        unique.append(definition)
        if len(unique)==2:break
    return unique

def attested_cloze(term, example):
    text=safe(example)
    if not text or len(text)>200 or len(text)<12:return None
    # Only exact lemma surface is safe; never create a false inflection or fabricated usage.
    pattern=re.compile(r'(?<![a-z])'+re.escape(term)+r'(?![a-z])',re.I)
    if not pattern.search(text):return None
    return pattern.sub('____',text,count=1)

def build(dictionary:Path, out:Path):
    out.mkdir(parents=True,exist_ok=True)
    counters=Counter(); details={}
    for letter in LETTERS:
        source=dictionary/(letter+'.json')
        if not source.exists():raise FileNotFoundError('Dictionary shard missing: '+str(source))
        data=json.loads(source.read_text(encoding='utf-8'))
        pool={p:[] for p in 'nvar'}
        for term,senses in data.items():
            for s in senses:
                if s.get('p') in pool:
                    pool[s['p']].append((term,safe(s.get('d',''))))
        outdata={}
        for term,senses in data.items():
            items=[]
            for idx,sense in enumerate(senses):
                meaning=safe(sense.get('d'))
                if not meaning:continue
                quiz=distractors(term,sense,pool.get(sense.get('p'),[]))
                cloze=attested_cloze(term,sense.get('e'))
                item={'i':idx,'p':sense.get('p',''),'q':quiz,'c':cloze or ''}
                flags=[]
                if len(quiz)<2: flags.append('limited-distractors')
                if not cloze: flags.append('no-attested-cloze')
                if not sense.get('s'): flags.append('no-same-sense-synonyms')
                if flags:item['f']=flags
                items.append(item)
                counters['senses']+=1
                counters['sense_with_source_cloze']+=bool(cloze)
                counters['sense_with_2_distractors']+=len(quiz)==2
                counters['sense_with_synonyms']+=bool(sense.get('s'))
            if items:outdata[term]=items
        (out/(letter+'.json')).write_text(json.dumps(outdata,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
        counters['terms']+=len(outdata)
        details[letter]={'words':len(outdata),'senses':sum(map(len,outdata.values())),'bytes':(out/(letter+'.json')).stat().st_size}
    report={'generator':'WordMayhem source-grounded lessons v1','source':'Open English WordNet 2025','license':'CC BY 4.0','no_generated_etymologies':True,'no_guessed_antonyms':True,'memory_art_for_all_terms':False,'counts':dict(counters),'letters':details,'quality_policy':'Every available sense gets definition-to-word recall and word-to-definition prompts; only exact-match source examples get fill-the-gap. Non-exact examples and ambiguous distractors are never asserted to be correct. Generated cards are NOT equivalent to expert-authored lessons.'}
    (out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    return report

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--dictionary',default='dictionary');parser.add_argument('--output',default='dictionary-lessons')
    args=parser.parse_args();result=build(Path(args.dictionary),Path(args.output));print(json.dumps(result['counts'],indent=2))

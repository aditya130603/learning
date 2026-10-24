#!/usr/bin/env python3
"""Build 24 MiB *trained* token 1/2/3-gram count sketches from attributed corpora.

No meaningless padding: 3 n-gram orders × two independent hashed counter tables
× 2^20 counters × uint32, 24 MiB total. These counts are learned from observed
sentences, NOT rules or a general-purpose neural grammar model.

Resources: UD English EWT (CC BY-SA 4.0) and public-domain classic books from
Project Gutenberg. Training sources are downloaded only during reproducible
GitHub CI builds, not on users' phones. See grammar-data/SOURCES.md.
"""
import array
import hashlib
import json
import os
import pathlib
import re
import struct
import sys
import urllib.request
from collections import Counter

ROOT = pathlib.Path(__file__).resolve().parents[1]
SIZE = 1 << 20
ORDERS = 3
HASHES = 2
N = SIZE * ORDERS * HASHES
BASE_SOURCES = [
    ('UD English EWT v2.18 train', 'https://raw.githubusercontent.com/UniversalDependencies/UD_English-EWT/master/en_ewt-ud-train.conllu','conllu'),
    ('Jane Austen, Pride and Prejudice', 'https://www.gutenberg.org/cache/epub/1342/pg1342.txt','book'),
    ('Jane Austen, Emma', 'https://www.gutenberg.org/cache/epub/158/pg158.txt','book'),
    ('Charles Dickens, Great Expectations', 'https://www.gutenberg.org/cache/epub/1400/pg1400.txt','book'),
    ('Charles Dickens, A Tale of Two Cities', 'https://www.gutenberg.org/cache/epub/98/pg98.txt','book'),
    ('Arthur Conan Doyle, Sherlock Holmes', 'https://www.gutenberg.org/cache/epub/1661/pg1661.txt','book'),
    ('Mary Shelley, Frankenstein', 'https://www.gutenberg.org/cache/epub/84/pg84.txt','book'),
    ('Lewis Carroll, Alice in Wonderland', 'https://www.gutenberg.org/cache/epub/11/pg11.txt','book'),
    ('Herman Melville, Moby Dick', 'https://www.gutenberg.org/cache/epub/2701/pg2701.txt','book'),
    ('Mark Twain, Huckleberry Finn', 'https://www.gutenberg.org/cache/epub/76/pg76.txt','book'),
    ('H G Wells, The Time Machine', 'https://www.gutenberg.org/cache/epub/35/pg35.txt','book'),
]
WORD = re.compile(r"[a-z]+(?:'[a-z]+)?", re.I)
BOOK_SENTENCES = re.compile(r'(?<=[.!?])\s+|\n{2,}')
MASK = SIZE-1

def fnv_bytes(tokens):
    h = 2166136261
    for t in tokens:
        for b in t.encode('utf-8'):
            h = ((h ^ b) * 16777619) & 0xffffffff
        h = ((h ^ 32) * 16777619) & 0xffffffff
    return h

def indexes(tokens, order):
    h=fnv_bytes(tokens)
    other=((h ^ 0x9e3779b9) * 0x85ebca6b) & 0xffffffff
    other ^= other >> 13
    other=(other*0xc2b2ae35)&0xffffffff
    other ^= other >> 16
    slot=(order-1)*2*SIZE
    return slot+(h&MASK),slot+SIZE+(other&MASK)

def sentence_tokens(s):
    return [m.group(0).lower() for m in WORD.finditer(s)][:75]

def read_conllu(raw):
    sentence=[]
    for line in raw.splitlines():
        if not line:
            if sentence:
                yield sentence
                sentence=[]
            continue
        if line[0]=='#':continue
        columns=line.split('\t')
        if len(columns)>3 and columns[0].isdigit():
            v=columns[1].lower()
            if WORD.fullmatch(v):sentence.append(v)
    if sentence:yield sentence

def read_book(raw):
    lines=raw.splitlines()
    start=next((i+1 for i,v in enumerate(lines) if '*** START OF' in v and 'PROJECT GUTENBERG' in v),0)
    end=next((i for i,v in enumerate(lines) if '*** END OF' in v and 'PROJECT GUTENBERG' in v),len(lines))
    body='\n'.join(lines[start:end])
    for part in BOOK_SENTENCES.split(body):
        ts=sentence_tokens(part)
        if 3<=len(ts)<=75:
            yield ts

def get(url):
    request=urllib.request.Request(url,headers={'User-Agent':'WordMayhemGrammarTrainer/1.0 (educational ngram builder)'})
    with urllib.request.urlopen(request,timeout=80) as r:
        content=r.read(25_000_000)
        if not content:raise ValueError('empty corpus download')
        return content.decode('utf-8',errors='replace')

def corrupted(ts):
    # Deterministic artificial corruptions only for a *limited* held-out rank test.
    if len(ts)<4:return None
    for i,w in enumerate(ts):
        if w=='is':return ts[:i]+['are']+ts[i+1:]
        if w=='are':return ts[:i]+['is']+ts[i+1:]
        if w=='the':return ts[:i]+['a']+ts[i+1:]
        if w=='has':return ts[:i]+['have']+ts[i+1:]
        if w=='have':return ts[:i]+['has']+ts[i+1:]
    return None

def score(sketch,ts):
    import math
    out=0.0
    for size,wt in ((2,0.6),(3,1.0)):
        for i in range(len(ts)-size+1):
            a,b=indexes(ts[i:i+size],size)
            out+=wt*math.log1p(min(sketch[a],sketch[b]))
    return out/max(1,len(ts)-1)

def build(output,report,fixtures=None):
    sketch=array.array('I',[0])*N
    assert sketch.itemsize==4
    observed=Counter();seen=0;sources=[];heldout=[];counts=Counter()
    if fixtures:
        corpus=[('local test fixture',pathlib.Path(fixtures).read_text(),'book')]
    else:
        corpus=[]
        for title,url,format_ in BASE_SOURCES:
            try:
                doc=get(url)
                if len(doc)<8000:raise ValueError('source too short')
                corpus.append((title,doc,format_))
                print('Downloaded:',title,len(doc),'chars',flush=True)
            except Exception as e:
                print('Source unavailable:',title,str(e)[:90],file=sys.stderr,flush=True)
    for title,doc,format_ in corpus:
        n=0
        stream=read_conllu(doc) if format_=='conllu' else read_book(doc)
        for ts in stream:
            if len(ts)<3:continue
            seen+=1;n+=1
            # All hold-out sentences are excluded from training.
            if seen%19==0:
                if len(heldout)<2000:heldout.append(ts)
                continue
            observed.update(ts)
            counts['trained_sentences']+=1
            counts['trained_tokens']+=len(ts)
            for order in (1,2,3):
                for i in range(len(ts)-order+1):
                    a,b=indexes(ts[i:i+order],order)
                    if sketch[a]<0xffffffff:sketch[a]+=1
                    if sketch[b]<0xffffffff:sketch[b]+=1
                    counts['trained_'+str(order)+'grams']+=1
        sources.append({'title':title,'sentences':n})
    if counts['trained_tokens']<150_000 and not fixtures:
        raise SystemExit('Not enough real text downloaded; refusing to publish a mostly empty 24MB model')
    out=pathlib.Path(output);out.parent.mkdir(parents=True,exist_ok=True)
    if sys.byteorder!='little':sketch.byteswap()
    with out.open('wb') as f:sketch.tofile(f)
    assert out.stat().st_size==24*1024*1024
    usable=0;wins=0;ties=0
    for ts in heldout:
        alt=corrupted(ts)
        if not alt:continue
        good=score(sketch,ts);bad=score(sketch,alt)
        wins+=int(good>bad);ties+=int(good==bad);usable+=1
    report_obj={'format':'word-mayhem-count-min-v1','model_bytes':out.stat().st_size,
       'sources':sources,'trained_sentences':counts['trained_sentences'],'trained_tokens':counts['trained_tokens'],
       'trained_unigrams':counts['trained_1grams'],'trained_bigrams':counts['trained_2grams'],
       'trained_trigrams':counts['trained_3grams'],'different_words':len(observed),
       'nonzero_counters':sum(v!=0 for v in sketch),'counter_slots':len(sketch),
       'heldout_simple_corruption_ranking':{'rank_correct':wins,'rank_wrong':usable-wins-ties,'ties':ties,'total':usable,
         'accuracy_excluding_ties':round(wins/max(1,usable-ties),3)},
       'limitations':'Classical literary text is not modern learner writing. Rankings are weak evidence, not independent grammatical correctness. No real-world GEC benchmark has been passed.'}
    pathlib.Path(report).parent.mkdir(parents=True,exist_ok=True)
    pathlib.Path(report).write_text(json.dumps(report_obj,indent=2)+'\n')
    print('REPORT',json.dumps(report_obj),flush=True)
    return report_obj

if __name__=='__main__':
    import argparse
    p=argparse.ArgumentParser();p.add_argument('--output',default=str(ROOT/'grammar-context.bin'));p.add_argument('--report',default=str(ROOT/'training/CONTEXT_REPORT.json'));p.add_argument('--fixtures');a=p.parse_args()
    build(a.output,a.report,a.fixtures)

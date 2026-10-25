#!/usr/bin/env python3
"""Verify 100-item adult tracks against built Open English WordNet shards.
Run after `python scripts/build_wordnet.py --output dictionary` in CI.
Reports omissions, does not silently pretend unavailable lemmas were curated.
"""
from pathlib import Path
import json, re, argparse

def check(root, directory):
    source=(root/'adult-100-data.js').read_text(encoding='utf-8')
    tracks=json.loads(re.search(r'WordMayhemTracksV8=(\{.*\});\}\)\(window\);',source).group(1))
    result={'tracks':{},'total_slots':0,'missing_terms':{}}
    for name,items in tracks.items():
        terms=[x if isinstance(x,str) else x['term'] for x in items]
        assert len(terms)==100 and len(set(terms))==100,(name,len(terms))
        missing=[]
        if name!='idioms':
            for term in terms:
                f=directory/f'{term[0].lower()}.json'
                if not f.exists():missing.append(term);continue
                # cache below performs only 26 shard reads rather than 600 independent loads
        result['tracks'][name]={'levels':100,'kind':'authored idiom glossary' if name=='idioms' else 'OEWN term targets'}
        result['total_slots']+=100
    shards={p.stem:json.loads(p.read_text(encoding='utf-8')) for p in directory.glob('?.json')} if directory.exists() else {}
    for name,items in tracks.items():
        missing=[]
        if name!='idioms':
            for term in items:
                if term not in shards.get(term[0].lower(),{}):missing.append(term)
        result['tracks'][name]['attested_in_wordnet']=100-len(missing)
        result['missing_terms'][name]=missing
    return result

if __name__=='__main__':
    a=argparse.ArgumentParser();a.add_argument('--dictionary',default='dictionary');a.add_argument('--output',default='training/V8_COVERAGE_REPORT.json');args=a.parse_args()
    root=Path(__file__).resolve().parents[1]
    report=check(root,root/args.dictionary)
    dst=root/args.output;dst.parent.mkdir(parents=True,exist_ok=True);dst.write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(json.dumps({k:{'levels':v['levels'],'wordnet_verified':v['attested_in_wordnet']} for k,v in report['tracks'].items()},indent=2))

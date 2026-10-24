#!/usr/bin/env python3
"""Build a compact offline searchable dictionary from OEWN 2025 WNDB.

Source: https://en-word.net/static/english-wordnet-2025.zip
OEWN CC BY 4.0. Princeton WordNet attribution required. See LICENSE-DICTIONARY.md.
"""
import argparse
import json
import re
import urllib.request
import zipfile
from collections import defaultdict
from pathlib import Path

DEFAULT_URL = 'https://en-word.net/static/english-wordnet-2025.zip'
DATA_FILES = {'data.noun', 'data.verb', 'data.adj', 'data.adv'}

def build(src: Path, output: Path):
    entries = defaultdict(list)
    with zipfile.ZipFile(src) as archive:
        files = [f for f in archive.namelist() if f.rsplit('/', 1)[-1] in DATA_FILES]
        if len(files) != 4:
            raise ValueError('Expected four WordNet data files, found: ' + repr(files))
        for filename in files:
            pos = filename.rsplit('.', 1)[-1]
            for raw in archive.read(filename).decode('utf-8', errors='replace').splitlines():
                if not raw[:1].isdigit() or '|' not in raw:
                    continue
                left, gloss = raw.split('|', 1)
                parts = left.strip().split()
                if len(parts) < 5 or not parts[0].isdigit():
                    continue
                try:
                    count = int(parts[3], 16)
                    names = [parts[4 + 2*i].replace('_', ' ') for i in range(count)]
                except (IndexError, ValueError):
                    continue
                gloss = gloss.strip()
                definition = re.split(r'\s*;\s*"', gloss, maxsplit=1)[0].strip()
                if not definition or not names:
                    continue
                example = re.search(r'"([^"\n]{8,160})"', gloss)
                for name in names:
                    term = name.casefold()
                    if not (2 <= len(term) <= 50) or not re.match(r"^[a-z][a-z '\-]+$", term):
                        continue
                    similar = [x for x in names if x.casefold() != term][:4]
                    sense = {'d': definition, 'p': pos[0], 's': similar}
                    if example:
                        sense['e'] = example.group(1)
                    if sense not in entries[term] and len(entries[term]) < 5:
                        entries[term].append(sense)
    output.mkdir(parents=True, exist_ok=True)
    totals = {}
    for letter in 'abcdefghijklmnopqrstuvwxyz':
        shard = {term: entries[term] for term in sorted(entries) if term.startswith(letter)}
        (output / (letter + '.json')).write_text(json.dumps(shard, ensure_ascii=False, separators=(',', ':')))
        totals[letter] = len(shard)
    (output / 'meta.json').write_text(json.dumps({
        'source':'Open English Wordnet 2025', 'license':'CC BY 4.0',
        'license_file':'LICENSE-DICTIONARY.md', 'entry_count':sum(totals.values()),
        'counts':totals, 'not_complete_language':True
    }, separators=(',', ':')))
    return totals

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--source', default=DEFAULT_URL)
    p.add_argument('--output', default='dictionary')
    args = p.parse_args()
    src = Path(args.source)
    if not src.exists():
        import tempfile
        with tempfile.NamedTemporaryFile(suffix='.zip') as tmp:
            req = urllib.request.Request(args.source, headers={'User-Agent':'WordMayhemDictionaryBuilder/1.0'})
            with urllib.request.urlopen(req, timeout=90) as r:
                tmp.write(r.read())
            tmp.flush()
            totals = build(Path(tmp.name), Path(args.output))
    else:
        totals = build(src, Path(args.output))
    print('Dictionary entries:', sum(totals.values()))
if __name__ == '__main__': main()

import json
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from enrich_wordnet import build,attested_cloze,distractors

def test_cloze_exact_lemma():
    assert attested_cloze('renaissance','The city experienced a renaissance in art.')=='The city experienced a ____ in art.'
    assert attested_cloze('renaissance','The city experienced a renaissance-style revival.')=='The city experienced a ____-style revival.'
    assert attested_cloze('meticulous','She meticulously checked every detail.') is None
    assert attested_cloze('run','They were running fast.') is None

def test_generator_completeness(tmp_path):
    root=tmp_path/'dictionary';root.mkdir()
    for l in 'abcdefghijklmnopqrstuvwxyz':(root/(l+'.json')).write_text('{}')
    data={'renaissance':[{'d':'a revival of cultural interest and new ideas','p':'n','s':['rebirth'],'e':'The city experienced a renaissance in painting.'}], 'resilient':[{'d':'able to recover quickly after difficulties','p':'a','s':[]}]}
    (root/'r.json').write_text(json.dumps(data))
    report=build(root,tmp_path/'out')
    assert report['counts']['terms']==2
    assert report['counts']['senses']==2
    assert report['counts']['sense_with_source_cloze']==1
    entries=json.loads((tmp_path/'out/r.json').read_text())
    assert entries['renaissance'][0]['c']=='The city experienced a ____ in painting.'
    assert entries['resilient'][0]['c']==''
    assert report['no_guessed_antonyms']

if __name__=='__main__':
    from tempfile import TemporaryDirectory
    with TemporaryDirectory() as temp:
        from pathlib import Path
        test_generator_completeness(Path(temp))
    test_cloze_exact_lemma()
    print('PASS: completeness, attested cloze, no false inflections')

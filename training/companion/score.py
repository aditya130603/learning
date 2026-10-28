"""Score recorded model responses; missing/ungraded outputs are never counted as passes."""
import argparse, collections, json, pathlib
HERE=pathlib.Path(__file__).resolve().parent

def score(cases, predictions):
    expected={c['id']:c for c in cases}
    results={}
    for p in predictions:
        if p['id'] not in expected or p['id'] in results: raise ValueError('Unknown or duplicate prediction ID')
        results[p['id']]=p
    totals=collections.Counter();levels={};details=[]
    for c in cases:
        counts=levels.setdefault(f"{c['track']}/{c['level']}",collections.Counter())
        def add(key):counts[key]+=1;totals[key]+=1
        add('planned')
        p=results.get(c['id'])
        if p is None:add('not_run');continue
        add('attempted')
        if p.get('error'):add('runtime_error');continue
        if c['expected'] is None:add('needs_vocabulary_review');continue
        try:
            raw=p['reply'].strip()
            if raw.startswith('```'):raw=raw.split('\n',1)[1].rsplit('```',1)[0]
            reply=json.loads(raw)
            assert isinstance(reply,dict)
            assert reply.get('grammar') in ['acceptable','error','unknown']
            assert reply.get('task') in ['complete','mismatch','none','unknown']
            assert isinstance(reply.get('explanation'),str)
            assert reply.get('correction') is None or isinstance(reply.get('correction'),str)
        except (ValueError,TypeError,AssertionError,KeyError):add('invalid_response');continue
        gold=c['expected'];errors=[]
        if reply['grammar']=='unknown':add('grammar_abstention')
        elif reply['grammar']!=gold['grammar']:
            errors.append('false_rejection' if gold['grammar']=='acceptable' else 'missed_error')
        if reply['task']=='unknown' and gold['task']!='none':add('task_abstention')
        elif reply['task']!=gold['task']:errors.append('task_error')
        if errors:
            add('definite_label_mistake');details.append({'id':c['id'],'errors':errors})
            for error in errors:add(error)
        elif reply['grammar']!='unknown' and reply['task']!='unknown':add('labels_match')
        # A different correction may be a valid paraphrase. Human review is required.
        add('needs_explanation_review')
        if reply.get('correction')!=gold['correction']:add('needs_correction_review')
    return {'model_trials_executed':totals['attempted'],'totals':dict(totals),
            'per_level':{k:dict(v) for k,v in levels.items()},'mistakes':details,
            'overall_accuracy':None,'note':'No overall accuracy until vocabulary, corrections and explanations are reviewed. Recurring templates are correlated. Labels_match is not a full pass.'}

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--predictions');parser.add_argument('--output',required=True);args=parser.parse_args()
    read=lambda p:[json.loads(x) for x in pathlib.Path(p).read_text().splitlines() if x.strip()]
    report=score(read(HERE/'evaluation.jsonl'),read(args.predictions) if args.predictions else [])
    pathlib.Path(args.output).write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report['totals']))

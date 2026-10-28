import json, pathlib, unittest
from score import score
HERE=pathlib.Path(__file__).resolve().parent
class PipelineTests(unittest.TestCase):
    def setUp(self):self.cases=[json.loads(x) for x in (HERE/'evaluation.jsonl').read_text().splitlines()]
    def test_coverage(self):
        groups={}
        for case in self.cases:groups.setdefault((case['track'],case['level']),[]).append(case['round'])
        self.assertEqual(len(groups),600)
        for rounds in groups.values():self.assertEqual(sorted(rounds),list(range(1,11)))
        self.assertEqual(len({c['id'] for c in self.cases}),6000)
    def test_no_results_not_success(self):
        result=score(self.cases,[])
        self.assertEqual(result['totals'],{'planned':6000,'not_run':6000})
        self.assertIsNone(result['overall_accuracy'])
    def test_mistakes_abstentions_and_manual_review(self):
        cases=self.cases[:10]
        def reply(i,g,t='none'):
            return {'id':cases[i]['id'],'reply':json.dumps({'grammar':g,'task':t,'correction':None,'explanation':'test'})}
        outputs=[reply(0,'acceptable'),reply(1,'error'),reply(2,'unknown','unknown'),{'id':cases[8]['id'],'reply':'Example'}]
        result=score(cases,outputs)['totals']
        self.assertEqual(result['missed_error'],1);self.assertEqual(result['false_rejection'],1)
        self.assertEqual(result['grammar_abstention'],1);self.assertEqual(result['needs_vocabulary_review'],1)
        self.assertEqual(result['not_run'],6)
    def test_duplicates_rejected(self):
        p={'id':self.cases[0]['id'],'error':'failure'}
        with self.assertRaises(ValueError):score(self.cases,[p,p])
    def test_training_not_exact_test_utterances(self):
        heldout={c.get('sentence') for c in self.cases}
        for original,_,_ in json.loads((HERE/'train_examples.json').read_text()):self.assertNotIn(original,heldout)
if __name__=='__main__':unittest.main()

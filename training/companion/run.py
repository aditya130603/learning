"""Local Gemma experiment. Never downloads weights or falls back to simulated replies."""
import argparse, hashlib, importlib.util, json, pathlib, platform, sys, time
HERE = pathlib.Path(__file__).resolve().parent

def rows(path):
    return [json.loads(line) for line in pathlib.Path(path).read_text().splitlines() if line.strip()]

def preflight(model):
    packages = {p: importlib.util.find_spec(p) is not None for p in ('torch', 'transformers', 'peft', 'accelerate')}
    gpu = False
    if packages['torch']:
        import torch
        gpu = torch.cuda.is_available()
    files = list(pathlib.Path(model).glob('*.safetensors')) if model else []
    return {'packages': packages, 'cuda': gpu, 'local_training_weights': bool(files),
            'ready': all(packages.values()) and gpu and bool(files),
            'model_trials_executed': 0, 'training_completed': False}

def load_model(model_path, adapter=None):
    import torch
    from transformers import AutoTokenizer, AutoModelForCausalLM
    tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True)
    model = AutoModelForCausalLM.from_pretrained(model_path, local_files_only=True,
        torch_dtype=torch.float32).to('cuda')
    if adapter:
        from peft import PeftModel
        model = PeftModel.from_pretrained(model, adapter, local_files_only=True)
    return tokenizer, model

def train(args):
    import torch
    from peft import LoraConfig, get_peft_model
    from transformers import Trainer, TrainingArguments, default_data_collator
    tokenizer, model = load_model(args.model)
    model = get_peft_model(model, LoraConfig(task_type='CAUSAL_LM', r=8, lora_alpha=16,
        lora_dropout=0.05, target_modules=['q_proj', 'v_proj']))
    examples = json.loads((HERE/'train_examples.json').read_text())
    samples = []
    for original, correction, explanation in examples:
        prompt = 'Give brief, careful English feedback. Do not treat conversational variants as definite errors. Learner: '+original
        reply = (f'Try: {correction} ' if correction else '')+explanation
        prefix = tokenizer.apply_chat_template([{'role':'user','content':prompt}], tokenize=False, add_generation_prompt=True)
        full = tokenizer.apply_chat_template([{'role':'user','content':prompt},{'role':'assistant','content':reply}], tokenize=False)
        prefix_ids = tokenizer(prefix, add_special_tokens=False)['input_ids']
        encoded = tokenizer(full, add_special_tokens=False, padding='max_length', truncation=True, max_length=384)
        if encoded['input_ids'][:len(prefix_ids)] != prefix_ids:
            raise ValueError('Chat template prefix mismatch; do not train with incorrect loss masking.')
        labels = encoded['input_ids'].copy()
        for i in range(len(labels)):
            if i < len(prefix_ids) or not encoded['attention_mask'][i]: labels[i] = -100
        if all(x == -100 for x in labels): raise ValueError('No reply tokens to train on.')
        samples.append({**encoded,'labels':labels})
    torch.manual_seed(42)
    trainer = Trainer(model=model, train_dataset=samples, data_collator=default_data_collator,
        args=TrainingArguments(output_dir=args.output, num_train_epochs=1,
            per_device_train_batch_size=1, gradient_accumulation_steps=4,
            learning_rate=2e-5, logging_steps=1, save_strategy='no', report_to=[], seed=42))
    trainer.train()
    model.save_pretrained(args.output); tokenizer.save_pretrained(args.output)
    pathlib.Path(args.output,'experiment.json').write_text(json.dumps({'status':'pilot_only',
        'examples':len(samples),'epochs':1,'base_model':args.model,
        'training_data_sha256':hashlib.sha256((HERE/'train_examples.json').read_bytes()).hexdigest(),
        'release_approved':False},indent=2))

def evaluate(args):
    import torch
    tokenizer, model = load_model(args.model, args.adapter)
    model.eval()
    dataset=rows(HERE/'evaluation.jsonl')
    if args.track: dataset=[r for r in dataset if r['track']==args.track]
    if args.limit: dataset=dataset[:args.limit]
    output=pathlib.Path(args.output)
    if output.exists(): raise SystemExit('Output exists. Choose a new filename to keep runs separate.')
    with output.open('w') as f:
        for case in dataset:
            start=time.monotonic()
            try:
                text=tokenizer.apply_chat_template([{'role':'user','content':case['prompt']}],tokenize=False,add_generation_prompt=True)
                inputs=tokenizer(text,return_tensors='pt',add_special_tokens=False).to('cuda')
                with torch.inference_mode():
                    generated=model.generate(**inputs,max_new_tokens=220,do_sample=False)
                reply=tokenizer.decode(generated[0,inputs['input_ids'].shape[1]:],skip_special_tokens=True)
                record={'id':case['id'],'reply':reply}
            except RuntimeError as error:
                # Record failures, never replace with sample responses.
                record={'id':case['id'],'error':str(error)}
            record.update(seconds=round(time.monotonic()-start,3),model=args.model,adapter=args.adapter,seed=42)
            f.write(json.dumps(record)+'\n');f.flush()

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('mode',choices=['preflight','train','evaluate'])
    parser.add_argument('--model',help='Local authorized Transformers Gemma 3 1B IT directory, not a .litertlm file')
    parser.add_argument('--adapter');parser.add_argument('--output',required=True)
    parser.add_argument('--track');parser.add_argument('--limit',type=int)
    args=parser.parse_args()
    status=preflight(args.model)
    if args.mode=='preflight':
        pathlib.Path(args.output).write_text(json.dumps(status,indent=2)+'\n');print(json.dumps(status));return
    if not status['ready']:
        print(json.dumps(status));raise SystemExit('Blocked: supply authorized local weights, dependencies and a CUDA GPU. No training/inference executed.')
    if args.mode=='train':train(args)
    else:evaluate(args)
if __name__=='__main__':main()

import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatorPresetHref } from '../src/lib/preset-links';
import { calculators, defaults, routeFor, runCalculation } from '../src/lib/calculators';
import { sharedInputs } from '../src/lib/sharing';
import { guides } from '../src/lib/guides';
import { searchTasks } from '../src/lib/keyword-targets';
import { glossaryTerms } from '../src/lib/glossary';
import { longTailContent } from '../src/lib/long-tail-content';
import { validationExamples } from '../src/lib/methodology';

test('Published example, search and glossary presets preserve exactly the legacy input interpretation', () => {
  const presets: {id:string;mode:string;values?:Record<string,string|number|undefined>}[] = [
    ...Object.entries(guides).flatMap(([id, guide]) => guide.examples.map(example => ({id,...example}))),
    ...Object.entries(searchTasks).flatMap(([id, tasks]) => tasks.map(task => ({id,...task}))),
    ...Object.values(longTailContent).flatMap(content => content.items.flatMap(item => item.links)),
    ...glossaryTerms.flatMap(term => term.example.calculator ? [term.example.calculator] : []),
    ...validationExamples,
  ];
  assert.ok(presets.length > 300);
  for (const p of presets) {
    const calc=calculators.find(c=>c.id===p.id)!;
    const legacy='?'+new URLSearchParams({mode:p.mode,...Object.fromEntries(Object.entries(p.values??{}).filter(([,v])=>v!==undefined).map(([k,v])=>[k,String(v)]))});
    const url=new URL(calculatorPresetHref(routeFor(p.id),p.mode,p.values),'https://www.calculatorfree.io');
    assert.equal(url.search,'',p.id+'/'+p.mode);
    if (p.id === 'credit-card' && p.mode === 'minimum') {
      const target = calculators.find(c => c.id === 'credit-card-minimum-payment')!;
      const old = sharedInputs(calc, legacy, '')!;
      const next = sharedInputs(target, '', url.hash)!;
      assert.equal(url.pathname, '/credit-card-minimum-payment-calculator');
      assert.deepEqual(next.values, {...old.values, extra: old.values.extra || '0'});
      assert.deepEqual(runCalculation(target.id, next.mode.id, next.values).rows,
        runCalculation(calc.id, old.mode.id, old.values).rows);
    } else {
      assert.equal(url.pathname,routeFor(p.id).slice(0,-5));
      assert.deepEqual(sharedInputs(calc,'',url.hash),sharedInputs(calc,legacy,''),p.id+'/'+p.mode);
    }
  }
});

test('Legacy HTML and query links still reconstruct every mode and all default values', () => {
  for (const calc of calculators.filter(c=>!c.directory)) for (const mode of calc.modes) {
    const values=defaults(mode);
    const legacy=new URL(routeFor(calc.id)+'?'+new URLSearchParams({mode:mode.id,...values}),'https://www.calculatorfree.io');
    const next=new URL(calculatorPresetHref(routeFor(calc.id),mode.id,values),'https://www.calculatorfree.io');
    assert.deepEqual(sharedInputs(calc,legacy.search,''),sharedInputs(calc,'',next.hash),calc.id+'/'+mode.id);
  }
});

test('Preset fragments preserve blanks, zeroes, multiline text and symbols, with fixed metadata and a size bound', () => {
  const values={debts:'A & B, 100, 10, 0\nName # + 漢字, 200, 20, 12',zero:0,blank:'',omitted:undefined,verified_rate:'private',mode:'wrong',share_version:'wrong'};
  const before={...values};
  const url=new URL(calculatorPresetHref('/debt-payoff-calculator.html?old=1#old','snowball',values),'https://www.calculatorfree.io');
  assert.equal(url.pathname,'/debt-payoff-calculator');assert.equal(url.search,'');
  const params=new URLSearchParams(url.hash.slice(6));
  assert.equal(params.get('debts'),values.debts);assert.equal(params.get('zero'),'0');assert.equal(params.get('blank'),'');
  assert.equal(params.has('omitted'),false);assert.equal(params.has('verified_rate'),false);
  assert.equal(params.get('mode'),'snowball');assert.equal(params.get('share_version'),'1');assert.deepEqual(values,before);
  assert.throws(()=>calculatorPresetHref('/debt-payoff-calculator.html','snowball',{debts:'a'.repeat(21000)}),/too long/);
});

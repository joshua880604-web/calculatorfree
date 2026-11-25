import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {readFileSync} from 'node:fs';
import {calculators,defaults,runCalculation,routeFor} from '../src/lib/calculators';
import {runClientCalculation} from '../src/lib/calculate-client';
import {searchTasks} from '../src/lib/keyword-targets';
import {calculatorPresetHref} from '../src/lib/preset-links';
import {sharedInputs} from '../src/lib/sharing';
import {comparisonGuides} from '../src/lib/comparison-guides';
import {longTailHref} from '../src/lib/long-tail-content';
import {editorialGuides,guideContentDate} from '../src/lib/editorial-guides';
import PracticalGuideQuestions from '../src/components/PracticalGuideQuestions';
import tasks from '../src/lib/focused-calculation-tasks.json';
import review from '../src/lib/five-existing-task-links.json';
import reference from '../docs/financial-clone/evidence/five-existing-task-reference-20261125.json';
import before from '../docs/financial-clone/evidence/five-existing-guide-preservation-20261125.json';

const ids=['prorated-rent','basis-point','credit-utilization','operating-cash-flow','business-line-of-credit'] as const;
const inputKey=(id:string,mode:string,values:object)=>JSON.stringify([id,mode,Object.entries(values).sort()]);
const reviewedInputs=new Set(reference.fixtures.map(row=>inputKey(row.id,row.mode,row.values)));
const near=(actual:number,expected:number)=>assert.ok(Math.abs(actual-expected)<=Math.max(1e-8,Math.abs(expected)*1e-11),`${actual} != ${expected}`);

for(const row of reference.fixtures)test('Independent existing-task example: '+row.key,async()=>{
  const values=Object.fromEntries(Object.entries(row.values).map(([key,value])=>[key,String(value)]));
  const result=runCalculation(row.id,row.mode,values);
  for(const [label,expected]of Object.entries(row.expected)){
    if(expected===undefined)continue;
    const metric=result.metrics.find(metric=>metric.label===label);assert.ok(metric,label);
    near(metric.value,Number(expected));
  }
  const tool=calculators.find(calc=>calc.id===row.id)!;
  assert.deepEqual(await runClientCalculation(tool.id,tool.category,row.mode,values),result);
  if(row.key==='credit-zero-limit')assert.equal(result.rows![0][3],'Undefined');
});

test('Fourteen visible task entries restore all inputs and existing supported modes',()=>{
  let count=0;
  for(const id of ids){
    const calc=calculators.find(calc=>calc.id===id)!;
    assert.deepEqual(searchTasks[id],tasks[id]);
    for(const task of searchTasks[id]){
      const mode=calc.modes.find(mode=>mode.id===task.mode)!;
      assert.ok(task.values);assert.deepEqual(Object.keys(task.values).sort(),Object.keys(defaults(mode)).sort());
      assert.ok(reviewedInputs.has(inputKey(id,mode.id,task.values)));
      const url=new URL(calculatorPresetHref(routeFor(id),mode.id,task.values),'https://www.calculatorfree.io');
      assert.equal(url.search,'');
      const restored=sharedInputs(calc,'',url.hash)!;
      assert.equal(restored.mode.id,mode.id);assert.deepEqual(restored.values,task.values);count++;
    }
  }
  assert.equal(count,14);
});

test('Comparison-guide answers expose all 21 reviewed links and stable anchors',()=>{
  let links=0;
  assert.match(readFileSync('src/components/ComparisonGuideArticle.tsx','utf8'),/<PracticalGuideQuestions questions=\{data.questions\}/);
  for(const id of ids){
    const guide=comparisonGuides[id];
    const markup=renderToStaticMarkup(createElement(PracticalGuideQuestions,{questions:guide.questions,linkConcepts:text=>text}));
    const anchors=guide.questions.flatMap(q=>q.anchor?[q.anchor]:[]);assert.equal(new Set(anchors).size,anchors.length);
    for(const q of guide.questions){
      assert.ok(markup.includes(renderToStaticMarkup(createElement('p',null,q.answer))));
      if(q.anchor)assert.ok(markup.includes(`id="${q.anchor}"`));
      for(const link of q.links??[]){
        assert.equal(link.id,id,'Answer belongs to its actual tool');
        assert.ok(link.values);assert.ok(reviewedInputs.has(inputKey(link.id,link.mode,link.values)));
        const calc=calculators.find(calc=>calc.id===id)!;const mode=calc.modes.find(mode=>mode.id===link.mode)!;
        assert.deepEqual(Object.keys(link.values).sort(),Object.keys(defaults(mode)).sort());
        const url=new URL(longTailHref(link),'https://www.calculatorfree.io');
        assert.deepEqual(sharedInputs(calc,'',url.hash)!.values,link.values);
        assert.ok(markup.includes(renderToStaticMarkup(createElement('a',{href:longTailHref(link)},link.label))));links++;
      }
    }
  }
  assert.equal(links,21);assert.equal(review.questionPatches.length,17);
});

test('Original guide answers, tables, sources, examples and numerical dates are preserved',()=>{
  for(const id of ids){
    const clean=structuredClone(comparisonGuides[id]);delete clean.meta.linksUpdatedOn;
    for(const q of clean.questions){delete q.anchor;delete q.links;}
    assert.deepEqual(clean,before[id]);
    const guide=editorialGuides.find(guide=>guide.path===comparisonGuides[id].meta.path)!;
    assert.equal(guide.publishedOn,before[id].meta.publishedOn);
    assert.equal(guide.linksUpdatedOn,'2026-11-25');
    assert.equal(guideContentDate(guide),'2026-11-25');
  }
});

test('Task content separates ratios, day-count methods and daily-credit versus payment assumptions',()=>{
  const weighted=runCalculation('credit-utilization','cards',searchTasks['credit-utilization'][0].values!);
  assert.equal(weighted.metrics.find(m=>m.label==='Payment to reach overall target')!.value,0);
  assert.equal(weighted.metrics.find(m=>m.label==='Payments to bring every card to target')!.value,800);
  assert.equal(searchTasks['prorated-rent'][1].values!.basis,'30-day month');
  assert.equal(searchTasks['business-line-of-credit'][2].mode,'paydown');
  assert.ok(!calculators.find(c=>c.id==='operating-cash-flow')!.modes.some(m=>m.id==='ratio'));
  assert.match(searchTasks['basis-point'][2].description,/not a monthly mortgage-payment change/);
});

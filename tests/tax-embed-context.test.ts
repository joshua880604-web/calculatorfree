import test from 'node:test';import assert from 'node:assert/strict';
import {embedContext,embedFieldVisible} from '../src/lib/embed-context';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {runClientCalculation} from '../src/lib/calculate-client';
import {hasEmbed,shareTabs} from '../src/lib/share-tools';
test('Tax embed labels distinguish selected year, exclusions and before-tax salary',()=>{
 for(const year of ['2025','2026']){const c=embedContext('self-employment-tax',{year})!;assert.match(c.label,new RegExp(year));assert.match(c.scope,/Excludes ordinary federal income tax/);assert.match(c.scope,/not a required estimated-tax payment/);}
 const salary=embedContext('salary',{})!;assert.match(salary.label,/Before tax/);assert.match(salary.scope,/not a take-home pay estimate/);assert.equal(embedContext('income-tax',{}),null);
 for(const id of ['self-employment-tax','salary']){assert.ok(hasEmbed(id));assert.deepEqual(shareTabs(id),['Share','Embed','Cite','Export']);}
});
test('Conditional spouse fields keep nonzero, blank and invalid drafts recoverable',()=>{
 const base={filing:'Single',spouse_profit:'0',spouse_ss_wages:'0',spouse_medicare_wages:'0'};
 assert.equal(embedFieldVisible('self-employment-tax',base,'spouse_profit'),false);
 for(const draft of ['1','','bad'])assert.equal(embedFieldVisible('self-employment-tax',{...base,spouse_profit:draft},'spouse_profit'),true);
 assert.equal(embedFieldVisible('self-employment-tax',{...base,filing:'Married filing jointly'},'spouse_profit'),true);
 assert.equal(embedFieldVisible('self-employment-tax',base,'profit'),true);
});
test('Selected-year SE caps preserve independent arithmetic and existing client models',async()=>{
 const c=calculators.find(c=>c.id==='self-employment-tax')!,m=c.modes[0];
 for(const [year,base]of[['2025',176100],['2026',184500]]as const){const v={...defaults(m),year,profit:'300000'},r=runCalculation(c.id,m.id,v),expected=base*.124+300000*.9235*.029+(300000*.9235-200000)*.009;assert.ok(Math.abs(r.metrics[0].value-expected)<1e-8);assert.deepEqual(await runClientCalculation(c.id,c.category,m.id,v),r);}
});

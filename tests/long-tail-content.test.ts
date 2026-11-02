import test from 'node:test';
import assert from 'node:assert/strict';
import { calculators, defaults, runCalculation, routeFor } from '../src/lib/calculators';
import { guides } from '../src/lib/guides';
import { contentUpdatedOn } from '../src/lib/seo';
import { longTailContent, longTailHref } from '../src/lib/long-tail-content';
import type { Field } from '../src/lib/types';
import {sharedInputs} from '../src/lib/sharing';
import {navigationHref} from '../src/lib/navigation';

test('Contextual guide links open real calculation modes with valid declared presets', () => {
  for (const [id, content] of Object.entries(longTailContent)) {
    assert.ok(calculators.some(calc => calc.id === id && !calc.directory), id);
    assert.ok(contentUpdatedOn[routeFor(id)] >= content.updatedOn, id + ' page lastmod covers the reviewed long-tail content date');
    const anchors = new Set<string>();
    const questions = guides[id].questions.map(item => item.question);
    assert.equal(new Set(questions).size, questions.length, id + ' unique questions');
    for (const item of content.items) {
      if (item.replacesQuestion) assert.ok(!questions.includes(item.replacesQuestion), id + ' overlapping question merged');
      assert.match(item.anchor, /^use-[a-z0-9-]+$/);
      assert.ok(!anchors.has(item.anchor), id + ' unique anchor');
      anchors.add(item.anchor);
      assert.ok(item.links.length > 0 && item.queries.length > 0, id);
      for (const link of item.links) {
        assert.ok(typeof link.label==='string'&&link.label.trim().length>0,id+' contextual link has visible text');
        const calc = calculators.find(calc => calc.id === link.id);
        const mode = calc?.modes.find(mode => mode.id === link.mode);
        assert.ok(mode, id + ' -> ' + link.id + '/' + link.mode);
        for (const [key, value] of Object.entries(link.values ?? {})) {
          const declaredField: Field | undefined = mode.fields.find(candidate => candidate.key === key);
          assert.ok(declaredField, key);
          if (declaredField.options) assert.ok(declaredField.options.includes(value), key + ': ' + value);
        }
        const url = new URL(longTailHref(link), 'https://calculatorfree.io');
        assert.equal(url.pathname, navigationHref(routeFor(link.id)));
        assert.equal(url.search, '');
        assert.equal(sharedInputs(calc!,'',url.hash)!.mode.id, mode.id);
        const result = runCalculation(link.id, mode.id, {...defaults(mode), ...link.values});
        assert.ok(result.metrics.length > 0);
        assert.ok(result.metrics.every(metric => Number.isFinite(metric.value)));
      }
    }
  }
});

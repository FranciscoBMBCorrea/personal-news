import assert from 'node:assert/strict';
import test from 'node:test';
import { articleId, canonicalUrl, classify, dedupe, parseDate, plainText, score, type Article } from '../src/lib/news';
import { sources } from '../src/data/sources';

test('canonical URLs strip tracking and fragments', () => {
  assert.equal(canonicalUrl('https://Example.com/story/?utm_source=x&fbclid=123#section'), 'https://example.com/story');
  assert.equal(canonicalUrl('javascript:alert(1)'), null);
});
test('dates are ISO or null', () => {
  assert.equal(parseDate('2026-10-30T12:00:00Z'), '2026-10-30T12:00:00.000Z');
  assert.equal(parseDate('not a date'), null);
});
test('HTML excerpts become plain text', () => assert.equal(plainText('<p>Hello <b>world</b> &amp; friends</p>'), 'Hello world & friends'));
test('creative coding terms add a category', () => {
  const source = sources.find(s => s.id === 'ars-technica')!;
  assert.ok(classify(source, 'A new WebGPU shader', '').includes('creative-coding'));
});
test('stable IDs and duplicate URLs', () => {
  const sample: Article = { id: articleId('https://example.com/a'), title: 'An unusually long title about procedural drawing', url: 'https://example.com/a', sourceId: 'test', sourceName: 'Test', publishedAt: '2026-10-30T12:00:00.000Z', description: '', categories: ['design'], language: 'en', imageUrl: null, relevanceScore: 30 };
  assert.equal(articleId(sample.url), articleId(sample.url));
  assert.equal(dedupe([sample, { ...sample }]).length, 1);
  assert.ok(score(sample) > 0);
});

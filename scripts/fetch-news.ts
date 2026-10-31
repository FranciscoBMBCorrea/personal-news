import Parser from 'rss-parser';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { sources, type NewsSource } from '../src/data/sources';
import { articleId, canonicalUrl, classify, dedupe, parseDate, plainText, score, type Article, type Catalog, type SourceResult } from '../src/lib/news';

const OUTPUT = 'public/data/articles.json';
const TIMEOUT_MS = 12000;
const MAX_AGE_DAYS = 45;
const MAX_ARTICLES = 1200;
const parser = new Parser({ timeout: TIMEOUT_MS });

async function loadPrevious(): Promise<Catalog | null> {
  try {
    const value: unknown = JSON.parse(await readFile(OUTPUT, 'utf8'));
    if (!value || typeof value !== 'object' || !('schemaVersion' in value) || value.schemaVersion !== 1 || !('articles' in value) || !Array.isArray(value.articles)) return null;
    return value as Catalog;
  } catch { return null; }
}

async function fetchSource(source: NewsSource): Promise<{ articles: Article[]; result: SourceResult }> {
  const result: SourceResult = { sourceId: source.id, status: 'ok', received: 0, accepted: 0 };
  try {
    const response = await fetch(source.feedUrl, { signal: AbortSignal.timeout(TIMEOUT_MS), headers: { 'User-Agent': 'PersonalNews/0.1 (+https://github.com/FranciscoBMBCorrea/personal-news)', Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*' } });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const xml = await response.text();
    if (xml.length > 5_000_000) throw new Error('Feed too large');
    const feed = await parser.parseString(xml);
    if (!Array.isArray(feed.items)) throw new Error('No RSS/Atom items');
    result.received = feed.items.length;
    const articles: Article[] = [];
    for (const item of feed.items) {
      const url = canonicalUrl(item.link ?? item.guid ?? '');
      const title = plainText(item.title);
      if (!url || !title) continue;
      const description = plainText(item.contentSnippet ?? item.summary ?? item.content ?? '').slice(0, 400);
      const categories = classify(source, title, description);
      const article: Article = {
        id: articleId(url), title, url, sourceId: source.id, sourceName: source.name,
        publishedAt: parseDate(item.isoDate ?? item.pubDate), description, categories,
        language: source.language, imageUrl: null, relevanceScore: 0
      };
      article.relevanceScore = score(article);
      articles.push(article);
    }
    result.accepted = articles.length;
    return { articles, result };
  } catch (error) {
    return { articles: [], result: { ...result, status: 'error', error: error instanceof Error ? error.message : String(error) } };
  }
}

async function main() {
  const previous = await loadPrevious();
  const enabled = sources.filter(s => s.enabled);
  const results = await Promise.all(enabled.map(fetchSource));
  const successful = new Set(results.filter(r => r.result.status === 'ok').map(r => r.result.sourceId));
  const fresh = results.flatMap(r => r.articles);
  const preserved = (previous?.articles ?? []).filter(a => !successful.has(a.sourceId));
  const threshold = Date.now() - MAX_AGE_DAYS * 86400000;
  const articles = dedupe([...fresh, ...preserved])
    .filter(a => a.publishedAt !== null && Date.parse(a.publishedAt) >= threshold)
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '') || a.id.localeCompare(b.id))
    .slice(0, MAX_ARTICLES);
  const catalog: Catalog = {
    schemaVersion: 1,
    updatedAt: successful.size > 0 ? new Date().toISOString() : previous?.updatedAt ?? null,
    articles: successful.size > 0 ? articles : previous?.articles ?? [],
    sources: results.map(r => r.result)
  };
  if (successful.size === 0 && !previous?.articles.length) throw new Error('All feeds failed; refusing to replace catalog with empty data');
  await mkdir(dirname(OUTPUT), { recursive: true });
  const temporary = OUTPUT + '.tmp';
  await writeFile(temporary, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
  await rename(temporary, OUTPUT);
  for (const r of catalog.sources) console.log(`${r.sourceId}: ${r.status} (received=${r.received}, accepted=${r.accepted})${r.error ? ' — ' + r.error : ''}`);
  console.log(`Catalog: ${catalog.articles.length} articles -> ${OUTPUT}`);
}

main().catch(e => { console.error(e); process.exitCode = 1; });

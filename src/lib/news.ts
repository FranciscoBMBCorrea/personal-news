import { createHash } from 'node:crypto';
import type { NewsCategory, NewsSource } from '../data/sources';

export interface Article {
  id: string;
  title: string;
  url: string;
  sourceId: string;
  sourceName: string;
  publishedAt: string | null;
  description: string;
  categories: NewsCategory[];
  language: 'pt' | 'en';
  imageUrl: string | null;
  relevanceScore: number;
}

export interface SourceResult {
  sourceId: string;
  status: 'ok' | 'error';
  received: number;
  accepted: number;
  error?: string;
}

export interface Catalog {
  schemaVersion: 1;
  updatedAt: string | null;
  articles: Article[];
  sources: SourceResult[];
}

const creativeTerms = ['p5.js', 'processing', 'creative coding', 'generative art', 'algorithmic art', 'webgl', 'webgpu', 'glsl', 'shader', 'three.js', 'touchdesigner', 'raymarching', 'plotter', 'procedural art', 'computational art', 'particle system'];
const designTerms = ['graphic design', 'typography', 'typeface', 'illustration', 'visual identity', 'branding', 'editorial design', 'design system', 'design gráfico', 'tipografia'];

export function plainText(input: string | undefined | null): string {
  return (input ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/\s+/g, ' ').trim();
}

export function canonicalUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    url.hash = '';
    for (const key of [...url.searchParams.keys()]) {
      if (/^utm_/i.test(key) || ['fbclid', 'gclid', 'mc_cid', 'mc_eid'].includes(key.toLowerCase())) url.searchParams.delete(key);
    }
    url.hostname = url.hostname.toLowerCase();
    if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/+$/, '');
    return url.toString();
  } catch { return null; }
}

export function parseDate(value: string | undefined | null): string | null {
  if (!value) return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
}

export function classify(source: NewsSource, title: string, description: string): NewsCategory[] {
  const categories = new Set<NewsCategory>(source.categories);
  const haystack = (title + ' ' + description).toLowerCase();
  if (creativeTerms.some(term => haystack.includes(term))) categories.add('creative-coding');
  if (designTerms.some(term => haystack.includes(term))) categories.add('design');
  return [...categories];
}

export function score(article: Pick<Article, 'categories' | 'title' | 'description'>): number {
  const weights: Record<NewsCategory, number> = { portugal: 3, technology: 3, design: 3, 'creative-coding': 3, culture: 3, world: 2, brazil: 2, business: 2 };
  const topic = Math.max(...article.categories.map(c => weights[c]), 0);
  const title = article.title.toLowerCase();
  const description = article.description.toLowerCase();
  const creative = creativeTerms.some(t => title.includes(t)) ? 3 : creativeTerms.some(t => description.includes(t)) ? 1 : 0;
  return topic * 10 + creative;
}

export function articleId(url: string): string {
  return createHash('sha256').update(url).digest('hex').slice(0, 24);
}

export function titleKey(title: string): string {
  return title.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

export function dedupe(articles: Article[]): Article[] {
  const urls = new Set<string>();
  const titles = new Set<string>();
  const sorted = [...articles].sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '') || a.id.localeCompare(b.id));
  return sorted.filter(article => {
    const key = titleKey(article.title);
    if (urls.has(article.url) || (key.length >= 28 && titles.has(key))) return false;
    urls.add(article.url);
    if (key.length >= 28) titles.add(key);
    return true;
  });
}

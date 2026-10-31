# Personal News

Personal news discovery for Portugal, technology, design, creative coding, culture, world, Brazil and business.

**Status:** early technical MVP. No hosting or scheduled automation configured.

## Local setup

Requires Node.js 20.11+ (prefer Node.js 22).

```bash
npm install
npm run fetch
npm run dev
```

Open the local URL printed by Astro. The initial committed `public/data/articles.json` is intentionally empty; `npm run fetch` fills it using publicly available RSS/Atom feeds.

Other commands:

```bash
npm test
npm run build
npm run check
```

## Architecture

- `src/data/sources.ts` — editorial feed registry, including conditional and archival sources.
- `src/lib/news.ts` — deterministic normalization, categorization, scoring and deduplication.
- `scripts/fetch-news.ts` — Node.js RSS/Atom ingestion, per-feed errors and JSON catalog.
- `public/data/articles.json` — static article catalog, refreshed by `npm run fetch`.
- `src/pages/index.astro` — temporary discovery interface, not final editorial design.

The ingestion process retains the previous catalog if every feed fails, and keeps prior articles from individually failed feeds within the retention window. It never republishes full article bodies or third-party imagery.

**Known limitations:** the feeds have been reported as valid by prior research but have not yet been tested by this repository's Node fetcher. Images, user preferences, bookmarks, scheduled updates, and Cloudflare Pages deployment are deliberately deferred. The current deduplication uses normalized URL and exact normalized long titles; semantic similarity is not implemented. The catalog does not yet support articles without publication dates. No automated tests or build have been executed by this chat environment.

## Zero-cost goal

The intended stack is Astro + TypeScript + GitHub Actions + Cloudflare Pages free tiers, subject to the providers' current usage limits and terms. No paid APIs or services are required.

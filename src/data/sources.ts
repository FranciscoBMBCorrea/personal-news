export type NewsCategory = 'portugal' | 'technology' | 'design' | 'creative-coding' | 'world' | 'brazil' | 'business' | 'culture';
export type SourceStatus = 'verified' | 'conditional' | 'archival';

export interface NewsSource {
  id: string;
  name: string;
  feedUrl: string;
  siteUrl: string;
  categories: NewsCategory[];
  language: 'pt' | 'en';
  status: SourceStatus;
  enabled: boolean;
  notes?: string;
}

// "verified" means reported as XML in the research, not yet verified by this project's fetcher.
// Conditional feeds stay disabled until a successful end-to-end fetch.
export const sources: NewsSource[] = [
  { id: 'rtp-pais', name: 'RTP — País', feedUrl: 'https://www.rtp.pt/noticias/rss/pais', siteUrl: 'https://www.rtp.pt/noticias/', categories: ['portugal'], language: 'pt', status: 'verified', enabled: true },
  { id: 'rtp-cultura', name: 'RTP — Cultura', feedUrl: 'https://www.rtp.pt/noticias/rss/cultura', siteUrl: 'https://www.rtp.pt/noticias/', categories: ['portugal', 'culture'], language: 'pt', status: 'verified', enabled: true },
  { id: 'rtp-economia', name: 'RTP — Economia', feedUrl: 'https://www.rtp.pt/noticias/rss/economia', siteUrl: 'https://www.rtp.pt/noticias/', categories: ['business', 'portugal'], language: 'pt', status: 'verified', enabled: true },
  { id: 'ars-technica', name: 'Ars Technica', feedUrl: 'https://feeds.arstechnica.com/arstechnica/index', siteUrl: 'https://arstechnica.com/', categories: ['technology'], language: 'en', status: 'verified', enabled: true },
  { id: 'guardian-world', name: 'The Guardian — World', feedUrl: 'https://www.theguardian.com/world/rss', siteUrl: 'https://www.theguardian.com/world', categories: ['world'], language: 'en', status: 'verified', enabled: true },
  { id: 'agencia-brasil', name: 'Agência Brasil', feedUrl: 'https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml', siteUrl: 'https://agenciabrasil.ebc.com.br/', categories: ['brazil'], language: 'pt', status: 'verified', enabled: true },
  { id: 'its-nice-that', name: "It's Nice That", feedUrl: 'https://feeds2.feedburner.com/itsnicethat/SlXC', siteUrl: 'https://www.itsnicethat.com/', categories: ['design', 'culture'], language: 'en', status: 'verified', enabled: true },
  { id: 'processing-foundation', name: 'Processing Foundation', feedUrl: 'https://processingfoundation.org/rss.xml', siteUrl: 'https://processingfoundation.org/', categories: ['creative-coding', 'technology'], language: 'en', status: 'verified', enabled: true },
  { id: 'muzli-medium', name: 'Muzli — Medium', feedUrl: 'https://medium.muz.li/feed', siteUrl: 'https://medium.muz.li/', categories: ['design'], language: 'en', status: 'verified', enabled: true, notes: 'Medium publication, not Muzli inspiration collections' },
  { id: 'generative-artistry', name: 'Generative Artistry', feedUrl: 'https://generativeartistry.com/index.xml', siteUrl: 'https://generativeartistry.com/', categories: ['creative-coding', 'design'], language: 'en', status: 'verified', enabled: true },
  { id: 'maxime-heckel', name: 'Maxime Heckel', feedUrl: 'https://blog.maximeheckel.com/rss.xml', siteUrl: 'https://blog.maximeheckel.com/', categories: ['creative-coding', 'technology'], language: 'en', status: 'verified', enabled: true },
  { id: 'dezeen-design', name: 'Dezeen — Design', feedUrl: 'https://www.dezeen.com/design/feed/', siteUrl: 'https://www.dezeen.com/design/', categories: ['design'], language: 'en', status: 'conditional', enabled: false, notes: 'Must pass Node fetch test before enabling' },
  { id: 'codrops', name: 'Codrops', feedUrl: 'https://tympanus.net/codrops/feed/', siteUrl: 'https://tympanus.net/codrops/', categories: ['creative-coding', 'technology', 'design'], language: 'en', status: 'conditional', enabled: false, notes: '403 observed in research environment' },
  { id: 'generative-hut', name: 'Generative Hut', feedUrl: 'https://www.generativehut.com/blog-feed.xml', siteUrl: 'https://www.generativehut.com/blog', categories: ['creative-coding', 'design'], language: 'en', status: 'archival', enabled: false, notes: 'Archive/reference, not current news' }
];

export const discoverySources = [
  { name: 'Muzli Collections', url: 'https://muz.li/' },
  { name: 'CreativeApplications.Net', url: 'https://www.creativeapplications.net/' },
  { name: 'OpenProcessing', url: 'https://openprocessing.org/' },
  { name: 'Generative Hut', url: 'https://www.generativehut.com/blog' }
] as const;

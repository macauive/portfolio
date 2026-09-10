import type { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/work', '/projects', '/skills', '/contact'].map(path => ({ url: `https://macauive.dev${path}` }));
}

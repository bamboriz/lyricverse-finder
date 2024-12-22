import { generateSitemap } from "../utils/sitemapGenerator";

generateSitemap()
  .then(() => console.log('Sitemap generation completed'))
  .catch(error => console.error('Error generating sitemap:', error));
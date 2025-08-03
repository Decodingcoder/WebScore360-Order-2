/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://webscore360.io', // 🔁 production domain
  generateRobotsTxt: true, // ✅ creates robots.txt
  generateIndexSitemap: true, // for multiple sitemaps
  sitemapSize: 5000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/private', '/admin'], // optional
  robotsTxtOptions: {
    policies: [{ userAgent: '*', allow: '/' }],
  },
};

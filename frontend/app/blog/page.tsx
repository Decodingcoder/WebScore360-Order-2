import Link from 'next/link'

// Placeholder for fetching multiple blog posts later
const posts = [
  {
    slug: 'why-speed-matters',
    title: 'Why Your Website Speed Matters (and How to Fix It!)',
    excerpt:
      'A slow website frustrates visitors and hurts your bottom line. Learn common speed killers and how to fix them.',
  },
  {
    slug: 'page-speed',
    title: 'Why Page Speed Matters More Than Ever in 2023',
    excerpt:
      'In the fast-paced digital world, website speed is a critical factor that can make or break your online success. Learn why speed matters now more than ever.',
    date: '2024-11-15',
  },
  {
    slug: 'seo-basics',
    title: "SEO Basics: How to Improve Your Website's Visibility",
    excerpt:
      'Learn the fundamentals of SEO to help your website rank higher in search engines.',
    date: '2024-11-15',
  },
  {
    slug: 'seo-benefits',
    title: 'How Website Performance Impacts Your SEO',
    excerpt:
      'Discover how your website performance directly affects your search engine rankings and what you can do to improve it.',
    date: '2024-12-05',
  },
  {
    slug: 'turn-visitors-into-customers',
    title: 'Conversion Rate Optimization: Turn Visitors into Customers',
    excerpt:
      "Learn proven strategies to increase your website's conversion rate and generate more leads and sales.",
  },
  {
    slug: 'branding-essentials',
    title: 'Branding Essentials for Small Business Websites',
    excerpt:
      'Build a strong brand identity online with these essential branding elements for your small business website.',
  },
  {
    slug: 'website-accessibility',
    title: 'Making Your Website Accessible: Why It Matters and How to Do It',
    excerpt:
      'Learn why web accessibility is crucial for your business and discover practical steps to make your website more inclusive for all users.',
    date: '2024-12-05',
  },
  {
    slug: 'mobile-optimization',
    title:
      'Mobile Optimization: Creating a Seamless Experience on Every Device',
    excerpt:
      'With most web traffic coming from mobile devices, learn how to optimize your website for the best mobile user experience.',
    date: '2025-02-10',
  },
  {
    slug: 'content-strategy',
    title: 'Content Strategy: Creating Engaging Website Content That Converts',
    excerpt:
      'Discover how to develop a content strategy that transforms your website from a digital brochure into a powerful marketing and conversion tool.',
    date: '2025-01-22',
  },
  {
    slug: 'website-security',
    title: 'Website Security Essentials: Protecting Your Business Online',
    excerpt:
      'Learn the fundamentals of website security and practical steps to protect your business from common online threats.',
    date: '2025-04-05',
  },
  {
    slug: 'analytics-essentials',
    title: 'Web Analytics Essentials: Making Data-Driven Decisions',
    excerpt:
      'Learn how to use web analytics to understand your audience, track performance, and make informed decisions about your website.',
    date: '2025-03-15',
  },
]

export default function BlogIndex() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">WebScore360 Blog</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div
            key={post.slug}
            className="flex flex-col h-full border rounded-lg shadow-sm dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 transition-all hover:shadow-md"
          >
            <div className="p-6 flex-grow">
              <h2 className="text-xl font-semibold mb-3 line-clamp-2">
                <Link
                  href={`/blog/${post.slug}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                {post.excerpt}
              </p>
            </div>
            <div className="px-6 pb-5">
              <Link
                href={`/blog/${post.slug}`}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
              >
                Read more &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

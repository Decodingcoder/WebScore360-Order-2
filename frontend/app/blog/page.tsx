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
    slug: 'seo-basics',
    title: "SEO Basics: How to Improve Your Website's Visibility",
    excerpt:
      'Learn the fundamentals of SEO to help your website rank higher in search engines.',
    date: '2023-11-15',
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
    date: '2023-12-05',
  },
  // Add more post metadata here as they are created
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

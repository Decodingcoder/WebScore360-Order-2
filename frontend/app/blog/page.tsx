import Link from 'next/link'

// Placeholder for fetching multiple blog posts later
const posts = [
  {
    slug: 'why-speed-matters',
    title: 'Why Your Website Speed Matters (and How to Fix It!)',
    excerpt:
      'A slow website frustrates visitors and hurts your bottom line. Learn common speed killers and how to fix them.',
  },
  // Add more post metadata here as they are created
]

export default function BlogIndex() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">WebScore360 Blog</h1>

      <div className="space-y-8">
        {posts.map((post) => (
          <div
            key={post.slug}
            className="p-6 border rounded-lg shadow-sm dark:border-gray-700"
          >
            <h2 className="text-2xl font-semibold mb-2">
              <Link href={`/blog/${post.slug}`} className="hover:underline">
                {post.title}
              </Link>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {post.excerpt}
            </p>
            <Link
              href={`/blog/${post.slug}`}
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              Read more &rarr;
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

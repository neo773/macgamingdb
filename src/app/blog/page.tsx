import Link from 'next/link';
import Image from 'next/image';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

type BlogPost = {
  slug: string;
  title: string;
  date: string;
  image?: string;
  imageGradient?: string;
}

async function getBlogPosts(): Promise<BlogPost[]> {
  const blogDir = path.join(process.cwd(), 'src/app/blog');
  const entries = fs.readdirSync(blogDir, { withFileTypes: true });

  const posts: BlogPost[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const mdxPath = path.join(blogDir, entry.name, 'page.mdx');
    if (!fs.existsSync(mdxPath)) continue;

    const fileContents = fs.readFileSync(mdxPath, 'utf8');
    const { data } = matter(fileContents);

    if (!data.title || !data.date) continue;

    posts.push({
      slug: entry.name,
      title: data.title,
      date: data.date,
      image: data.image,
      imageGradient: data.imageGradient,
    });
  }

  // Sort by date descending
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function BlogIndexPage() {
  const posts = await getBlogPosts();

  return (
    <div className="py-8 md:py-12">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Blog</h1>
      <hr className="border-gray-700/50 mb-10" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block"
          >
            <article>
              {/* Image container */}
              <div
                className={`relative aspect-[16/10] rounded-2xl overflow-hidden mb-4 bg-gradient-to-br ${
                  post.imageGradient || 'from-gray-700 to-gray-800'
                }`}
              >
                {post.image ? (
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-white/30"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Title */}
              <h2 className="text-lg md:text-xl font-semibold text-white group-hover:text-gray-200 transition-colors mb-2 leading-tight">
                {post.title}
              </h2>

              {/* Date */}
              <p className="text-sm text-gray-500">{formatDate(post.date)}</p>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}

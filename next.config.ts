import createMDX from "@next/mdx";

const nextConfig = {
  serverExternalPackages: ['@libsql/client'],
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  output: 'standalone' as const,
  // Pinned because a package.json above the repo makes Turbopack infer the
  // wrong workspace root, breaking module resolution.
  turbopack: {
    root: import.meta.dirname,
  },
  async rewrites() {
    const apiServerUrl = process.env.INTERNAL_API_URL ?? 'http://localhost:4000';
    return [
      { source: '/api/trpc/:path*', destination: `${apiServerUrl}/trpc/:path*` },
      { source: '/api/rest/:path*', destination: `${apiServerUrl}/rest/:path*` },
    ];
  },
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: [['remark-frontmatter'], ['remark-gfm']],
  },
});

export default withMDX(nextConfig);

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
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: [['remark-frontmatter'], ['remark-gfm']],
  },
});

export default withMDX(nextConfig);

import createMDX from "@next/mdx";

const nextConfig = {
  serverExternalPackages: ['@libsql/client'],
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  output: 'standalone' as const,
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: [['remark-frontmatter'], ['remark-gfm']],
  },
});

export default withMDX(nextConfig);

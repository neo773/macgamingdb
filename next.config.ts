import createMDX from '@next/mdx';

import { apiRewrites } from './api-rewrites';

const nextConfig = {
  // Resend renders the email templates with react-dom/server, which the
  // react-server condition bans — keep them out of the bundler's RSC graph
  serverExternalPackages: [
    '@libsql/client',
    'resend',
    '@react-email/render',
    '@react-email/components',
  ],
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  output: 'standalone' as const,
  // Pinned because a package.json above the repo makes Turbopack infer the
  // wrong workspace root, breaking module resolution.
  turbopack: {
    root: import.meta.dirname,
  },
  rewrites: apiRewrites,
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: [['remark-frontmatter'], ['remark-gfm']],
  },
});

export default withMDX(nextConfig);

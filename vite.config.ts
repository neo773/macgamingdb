import mdx from '@mdx-js/rollup';
import { FontaineTransform } from 'fontaine';
import { fileURLToPath } from 'node:url';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import vinext from 'vinext';
import { defineConfig } from 'vite';

const publicDirectory = fileURLToPath(new URL('./public', import.meta.url));

export default defineConfig({
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        include: /\.(md|mdx)$/,
        remarkPlugins: [remarkFrontmatter, remarkGfm],
      }),
    },
    FontaineTransform.vite({
      fallbacks: [
        '-apple-system',
        'BlinkMacSystemFont',
        'Helvetica Neue',
        'Arial',
      ],
      resolvePath: (id) => new URL('.' + id, `file://${publicDirectory}/`),
    }),
    vinext(),
  ],
});

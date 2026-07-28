import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import vinext from "vinext";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        include: /\.(md|mdx)$/,
        remarkPlugins: [remarkFrontmatter, remarkGfm],
      }),
    },
    vinext(),
  ],
});

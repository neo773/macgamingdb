import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import vinext from "vinext";
import { defineConfig } from "vite";

import { apiRewrites } from "./api-rewrites";

export default defineConfig({
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        remarkPlugins: [remarkFrontmatter, remarkGfm],
      }),
    },
    vinext({
      nextConfig: {
        output: "standalone",
        pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
        rewrites: apiRewrites,
        serverExternalPackages: ["@libsql/client"],
      },
    }),
  ],
});

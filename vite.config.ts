import path from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";

const isGitHubPages = process.env.DOC_DEPLOY_TARGET === "github-pages";
const githubPagesBase = "/departmentofconsent/";

// Load all (non-VITE_) env vars into process.env for server routes
const serverEnv = loadEnv(process.env.NODE_ENV || "development", process.cwd(), "");
Object.assign(process.env, serverEnv);

export default defineConfig({
  cloudflare: isGitHubPages ? false : undefined,
  tanstackStart: {
    server: { entry: "server" },
    ...(isGitHubPages
      ? {
          prerender: {
            enabled: true,
            autoStaticPathsDiscovery: false,
            crawlLinks: false,
            failOnError: true,
            concurrency: 1,
          },
          pages: [{ path: "/" }],
          sitemap: { enabled: false },
        }
      : {}),
  },
  vite: {
    base: isGitHubPages ? githubPagesBase : "/",
    resolve: {
      alias: {
        "entities/lib/decode.js": path.resolve(__dirname, "node_modules/entities/lib/decode.js"),
        "entities/lib/encode.js": path.resolve(__dirname, "node_modules/entities/lib/encode.js"),
        entities: path.resolve(__dirname, "node_modules/entities"),
      },
    },
  },
});

import { copyFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const clientDir = path.resolve("dist/client");
const indexPath = path.join(clientDir, "index.html");

if (!existsSync(indexPath)) {
  throw new Error("Expected dist/client/index.html after the Pages prerender build.");
}

await copyFile(indexPath, path.join(clientDir, "404.html"));
await writeFile(path.join(clientDir, ".nojekyll"), "");
await rm(path.join(clientDir, "CNAME"), { force: true });

const siteUrl = (
  process.env.VITE_SITE_URL || "https://julesdarling.github.io/departmentofconsent"
).replace(/\/$/, "");

const paths = [
  "/",
  "/auth",
  "/reset-password",
  "/privacy",
  "/terms",
  "/sessions",
  "/sessions/new",
  "/onboarding",
  "/kinks",
  "/subscribe",
  "/settings",
];

const urls = paths
  .map(
    (route) => `  <url>
    <loc>${siteUrl}${route === "/" ? "/" : route}</loc>
  </url>`,
  )
  .join("\n");

await writeFile(
  path.join(clientDir, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
);

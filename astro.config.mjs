// @ts-check
import { defineConfig } from "astro/config";

// Sitio estático: el build queda en dist/ y scripts/deploy.sh lo sube a S3.
// trailingSlash coincide con la función de CloudFront (infra/index-rewrite.js).
export default defineConfig({
  site: "https://divelearn.cloud",
  trailingSlash: "always",
  build: { format: "directory" },
});

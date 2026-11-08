// @ts-check
import { defineConfig } from "astro/config";

// Sitio estático: el build queda en dist/ y scripts/deploy.sh lo sube a S3.
// trailingSlash coincide con la función de CloudFront (infra/index-rewrite.js).
// Las infografías del blog pesan: cada imagen de Markdown carga solo al acercarse.
function imagenesDiferidas() {
  const visitar = (n) => {
    if (n.tagName === "img") Object.assign(n.properties, { loading: "lazy", decoding: "async" });
    (n.children || []).forEach(visitar);
  };
  return visitar;
}

export default defineConfig({
  markdown: { rehypePlugins: [imagenesDiferidas] },
  site: "https://divelearn.cloud",
  trailingSlash: "always",
  build: { format: "directory" },
});

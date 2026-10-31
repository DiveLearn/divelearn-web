#!/usr/bin/env bash
# Construye el sitio (Astro → dist/), lo sube al bucket y limpia la caché de CloudFront.
# Uso: AWS_PROFILE=divelearn-web scripts/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."

BUCKET=$(terraform -chdir=infra output -raw site_bucket)
DIST=$(terraform -chdir=infra output -raw distribution_id)

npm ci --silent
npm run build

aws s3 sync dist/ "s3://$BUCKET/" --delete --exclude ".DS_Store"
aws cloudfront create-invalidation --distribution-id "$DIST" --paths "/*" --query Invalidation.Id --output text
echo "Publicado: $(terraform -chdir=infra output -raw site_url)/"

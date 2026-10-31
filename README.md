# divelearn-web

Sitio de DiveLearn en **https://divelearn.cloud**, hecho con [Astro](https://astro.build): inicio, blog, recursos y cursos. Primer recurso: [Inmersión ANS-C01](https://divelearn.cloud/inmersion-ans-c01/), una ruta de estudio gratis y gamificada para AWS Certified Advanced Networking – Specialty.

## Cómo está armado

```
Visitante → CloudFront (HTTPS, caché, headers de seguridad)
              └─ OAC → S3 privado (eu-north-1)
```

| Carpeta | Qué tiene |
|---|---|
| `bootstrap/` | Bucket del estado de Terraform. Se aplicó a mano una sola vez; su estado es local y no va a git. |
| `infra/` | Bucket del sitio, CloudFront, función de reescritura de `index.html` y headers de seguridad. DNS de divelearn.cloud en Route 53 (`dns.tf`, incluye el correo de Google Workspace y Kit). Estado en S3 con bloqueo nativo. |
| `src/` | Páginas Astro (`pages/`), plantilla con la marca (`layouts/Base.astro`) y posts del blog en Markdown (`content/blog/`). |
| `public/` | Archivos que se publican tal cual: la Inmersión ANS-C01, imágenes, fuentes. |
| `scripts/deploy.sh` | Construye el sitio, sube `dist/` y limpia la caché de CloudFront. |

## Trabajar

```bash
npm install && npm run dev                 # sitio en http://localhost:4321

aws login --profile divelearn-web          # permisos temporales, sin llaves
export AWS_PROFILE=divelearn-web
terraform -chdir=infra init
terraform -chdir=infra plan
terraform -chdir=infra apply
scripts/deploy.sh
```

Todo cambio entra por Pull Request; CI revisa formato, validación y seguridad (checkov).

## Escribir un post

Crear `src/content/blog/mi-post.md`:

```markdown
---
title: "Título"
description: "Una línea para Google y LinkedIn"
date: 2026-11-05
tags: [aws, redes]
draft: true   # quitarlo para publicar
---
```

## Mover el dominio desde otra distribución (hecho el 2026-10-30)

`divelearn.cloud` seguía asociado a la distribución de CloudFront de la cuenta vieja. Con el certificado ya puesto
en la distribución nueva y los TXT `_.divelearn.cloud` / `_www.divelearn.cloud` apuntando a ella:

```bash
aws cloudfront associate-alias --target-distribution-id E32922Y3WKSJS3 --alias divelearn.cloud
aws cloudfront associate-alias --target-distribution-id E32922Y3WKSJS3 --alias www.divelearn.cloud
```

Después `aliases_moved = true` en `infra/terraform.tfvars`.

## Pendiente

- **Despliegue desde GitHub con OIDC.** La cuenta está en el plan gratis de AWS, que bloquea crear el proveedor OIDC. Al pasar a plan pago (antes del 30-abr-2027): crear el proveedor y los roles de plan/apply en `bootstrap/` y agregar los jobs de `plan`, `apply` y despliegue en `.github/workflows/`.

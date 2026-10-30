# divelearn-web

Sitio de DiveLearn en **https://divelearn.cloud**. Primera sección: [Inmersión ANS-C01](https://divelearn.cloud/inmersion-ans-c01/), una ruta de estudio gratis y gamificada para AWS Certified Advanced Networking – Specialty.

## Cómo está armado

```
Visitante → CloudFront (HTTPS, caché, headers de seguridad)
              └─ OAC → S3 privado (eu-north-1)
```

| Carpeta | Qué tiene |
|---|---|
| `bootstrap/` | Bucket del estado de Terraform. Se aplicó a mano una sola vez; su estado es local y no va a git. |
| `infra/` | Bucket del sitio, CloudFront, función de reescritura de `index.html` y headers de seguridad. DNS de divelearn.cloud en Route 53 (`dns.tf`, incluye el correo de Google Workspace y Kit). Estado en S3 con bloqueo nativo. |
| `site/` | Archivos estáticos publicados tal cual. |
| `scripts/deploy.sh` | Sube `site/` y limpia la caché de CloudFront. |

## Trabajar

```bash
aws login --profile divelearn-web          # permisos temporales, sin llaves
export AWS_PROFILE=divelearn-web
terraform -chdir=infra init
terraform -chdir=infra plan
terraform -chdir=infra apply
scripts/deploy.sh
```

Todo cambio entra por Pull Request; CI revisa formato, validación y seguridad (checkov).

## Pendiente

- **Despliegue desde GitHub con OIDC.** La cuenta está en el plan gratis de AWS, que bloquea crear el proveedor OIDC. Al pasar a plan pago (antes del 30-abr-2027): crear el proveedor y los roles de plan/apply en `bootstrap/` y agregar los jobs de `plan`, `apply` y despliegue en `.github/workflows/`.

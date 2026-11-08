---
title: "IMDS y User Data: el DNI y el manual de setup de tu instancia EC2"
description: "En qué se diferencian, por qué IMDSv1 es vulnerable a SSRF, cómo funciona IMDSv2 y dónde no guardar secretos."
date: 2026-01-27
tags: ["ec2", "seguridad", "certificaciones"]
image: "/img/blog/imds.jpg"
imageAlt: "Infografía: EC2 Instance Secrets y Setup"
---

EC2 Instance Metadata y User Data son esos conceptos que parecen obvios hasta que te preguntan en el examen: "¿Cuál es vulnerable a SSRF?".

[![Infografía de metadatos de instancia y User Data: IMDSv1 contra IMDSv2, bootstrapping, casos de uso y detalles técnicos](/img/blog/imds.jpg)](/img/blog/imds.jpg)

## La confusión clásica

"Metadatos y User Data son lo mismo, ¿no?" No.

- **Metadatos (IMDS):** el DNI de tu instancia. Información sobre ella misma: ID, IP, rol de IAM. Accesible en cualquier momento.
- **User Data:** el manual de setup. Scripts que por defecto corren solo en el primer arranque, para el bootstrapping.

## El error que me costó caro

Tenía IMDSv1 habilitado. Un simple GET y listo:

```bash
curl http://169.254.169.254/latest/meta-data/
```

El drama: es vulnerable a SSRF. Un atacante engaña a tu aplicación para que haga esa petición por él, obtiene las credenciales del rol y escala privilegios. Después de $2.847 en facturas inesperadas, aprendí la lección.

<figure data-arq="imds" data-titulo="Con IMDSv1, una petición falsificada basta para llevarse las credenciales del rol. IMDSv2 exige un token que ese ataque no puede conseguir."></figure>

## La solución: IMDSv2

Proceso en dos pasos. Primero generas un token con tiempo de vida:

```bash
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
```

Y luego lo usas:

```bash
curl -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/instance-id
```

Funciona porque un SSRF típico solo logra hacer un GET simple: no puede hacer el PUT con esa cabecera. Para obligar a usarlo en una instancia existente:

```bash
aws ec2 modify-instance-metadata-options \
  --instance-id i-0123456789abcdef0 \
  --http-tokens required
```

Bonus: el hop limit. Con valor 1, la respuesta no pasa más allá de la instancia, así que un contenedor no alcanza los metadatos por accidente. Si tu contenedor sí los necesita, normalmente hay que subirlo a 2.

## 3 detalles para el examen

1. **La IP 169.254.169.254 es link-local.** Nunca viaja por internet, solo existe entre tu instancia y el hipervisor.
2. **Si User Data falla, el log está en** `/var/log/cloud-init-output.log`. Me ha salvado horas de depuración.
3. **User Data tiene un límite de 16 KB.** Si tu script es más largo, súbelo a S3 y usa User Data solo para descargarlo.

## Nunca guardes secretos en User Data

Cualquiera con el permiso `ec2:DescribeInstanceAttribute` puede leerlo, y cualquier proceso dentro de la instancia también. No está cifrado. Usa [Secrets Manager o Parameter Store](/blog/ssm-parameter-store-vs-secrets-manager/).

## Mi checklist

- Siempre IMDSv2.
- User Data con shebang: `#!/bin/bash`.
- Revisar `/var/log/cloud-init-output.log`.
- Secrets Manager para credenciales.
- Validar el hop limit con contenedores.

Para DVA-C02, la diferencia entre IMDSv1 y v2 es pregunta recurrente. Entiende el flujo del token y la tienes.

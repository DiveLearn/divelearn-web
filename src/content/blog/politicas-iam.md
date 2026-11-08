---
title: "No puedes decir que entiendes IAM si no entiendes las políticas"
description: "La anatomía JSON de una política, los tipos que existen, cómo se evalúan y la SCP que me hizo perder una tarde."
date: 2026-01-22
tags: ["iam", "seguridad", "certificaciones"]
image: "/img/blog/politicas-iam.jpg"
imageAlt: "Infografía: políticas IAM de AWS, anatomía y conceptos clave"
---

Después de entrenar a más de 100 estudiantes, el patrón es siempre el mismo: "Mar, entiendo usuarios y roles, pero las políticas IAM me confunden".

Normal. Porque en las políticas es donde un carácter mal puesto significa acceso denegado, un Deny explícito derrota a mil Allows y un Principal incorrecto deja la política inútil.

Las políticas no son configuración. Son el **lenguaje** de permisos en AWS. Y como todo lenguaje, tienen anatomía.

[![Infografía con la anatomía JSON de una política de IAM, tipos, entidades, condiciones y controles avanzados](/img/blog/politicas-iam.jpg)](/img/blog/politicas-iam.jpg)

## Anatomía de una política

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject"],
    "Resource": "arn:aws:s3:::mi-bucket/*",
    "Condition": {
      "IpAddress": { "aws:SourceIp": "203.0.113.0/24" }
    }
  }]
}
```

- **Version:** ponla siempre como `2012-10-17`. Si la omites, se usa la versión anterior del lenguaje y dejan de funcionar cosas como las variables de política.
- **Statement:** el contenedor de todo lo importante.
- **Effect:** Allow o Deny.
- **Principal:** quién. Solo va en las políticas basadas en recursos, porque en las de identidad el quién es a quien se la adjuntas.
- **Action:** qué puede hacer.
- **Resource:** sobre qué.
- **Condition:** cuándo aplica. Es tu mejor amigo para controles finos.

## Los tipos de políticas

| Tipo | Dónde vive |
|---|---|
| AWS Managed | Prediseñadas por AWS |
| Customer Managed | Las que tú creas y controlas |
| Inline | Incrustadas en un usuario o rol |
| Resource-Based | Adjuntas al recurso, como una bucket policy |

Y además están las que **no dan permisos, solo ponen límites**: los permission boundaries y las Service Control Policies (SCP) de Organizations.

## La regla que lo decide todo

Por defecto, todo está denegado. Un Allow lo abre. Un Deny explícito lo cierra, sin importar cuántos Allows haya.

<figure data-arq="iam-scp" data-titulo="El rol tenía Allow y el bucket también, pero una SCP en la unidad organizacional decía Deny. Basta uno."></figure>

## Mi lección más cara

Un cliente no podía acceder a un bucket S3.

- Revisé permisos: Allow.
- Revisé el rol: correcto.
- Revisé la bucket policy: Allow.

¿El problema? Una SCP a nivel de unidad organizacional tenía un Deny explícito. Un Deny le gana a cien Allows.

[![Ilustración: una barrera sobre una flota de barcos, que bloquea una cuenta por una acción prohibida](/img/blog/iam-scp-barrera.jpg)](/img/blog/iam-scp-barrera.jpg)

Desde ese día, esta infografía es lo primero que enseño en mis bootcamps. Porque no puedes depurar permisos si no entiendes qué tipo de política estás viendo, dónde está aplicada, qué elementos tiene y cómo interactúa con las otras.

## Principio de menor privilegio

Da los permisos mínimos necesarios. Para saber cuáles son, IAM Access Analyzer te ayuda: muestra qué recursos están compartidos hacia afuera y puede generar políticas a partir de la actividad real.

## Para quienes están estudiando

Las políticas de IAM no se memorizan, se entienden. La estructura JSON tiene lógica, no es aleatoria.

¿Quieres ver esto fallando en vivo? Te cuento [mis 7 errores tontos en un laboratorio](/blog/errores-laboratorio-permisos/). Y si recién empiezas, tienes el [bootcamp gratis](/bootcamp/).

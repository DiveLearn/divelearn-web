---
title: "SSM Parameter Store vs Secrets Manager: cuándo usar cada uno"
description: "La diferencia real entre los dos, con niveles, costos, rotación, integración con CloudFormation y las preguntas que caen en el examen."
date: 2026-02-02
tags: ["seguridad", "secretos", "certificaciones"]
image: "/img/blog/ssm-secrets.jpg"
imageAlt: "Infografía: AWS SSM Parameter Store vs Secrets Manager"
---

Estaba en el día 7 de mi preparación para Developer Associate y este tema siempre genera confusión. ¿Cuándo usar Parameter Store? ¿Cuándo Secrets Manager? Aquí va la diferencia real.

[![Infografía comparando SSM Parameter Store y Secrets Manager: jerarquía, niveles, rotación, cifrado e integración con CloudFormation](/img/blog/ssm-secrets.jpg)](/img/blog/ssm-secrets.jpg)

<figure data-arq="ssm-secrets" data-titulo="La app lee configuración de Parameter Store y credenciales de Secrets Manager, que además puede rotarlas solo en la base de datos."></figure>

## SSM Parameter Store

Almacenamiento para configuración y secretos.

- Cifrado **opcional** con KMS, usando el tipo SecureString.
- Serverless y con alta durabilidad.
- Control de versiones.
- Integración con IAM, EventBridge y CloudFormation.
- Jerarquía por rutas, como `/my-app/dev/db-url`, que te permite dar permisos por prefijo.

| | Estándar | Avanzado |
|---|---|---|
| Cantidad | 10.000 parámetros | 100.000 parámetros |
| Tamaño máximo | 4 KB | 8 KB |
| Políticas (TTL, avisos de expiración) | No | Sí |
| Costo | Gratis | $0,05 por parámetro al mes |

## AWS Secrets Manager

Diseñado específicamente para secretos como contraseñas y API keys.

- Rotación **automática** cada cierto tiempo, con una función Lambda.
- Integración nativa con RDS y Aurora.
- Cifrado **obligatorio** con KMS.
- Secretos multi-región con réplicas sincronizadas.
- Cuesta $0,40 por secreto al mes, más $0,05 por cada 10.000 llamadas a la API.

## La comparación que importa

| | Parameter Store | Secrets Manager |
|---|---|---|
| Costo | Económico, estándar gratis | Mayor, por secreto y por llamada |
| Rotación | La construyes tú con Lambda y EventBridge | Automática y nativa |
| Cifrado | KMS opcional | KMS obligatorio |
| Multi-región | No | Réplicas |

## Integración con CloudFormation

Referencias dinámicas con la forma `{{resolve:service-name:reference-key}}`:

- `ssm`: texto plano.
- `ssm-secure`: cadenas seguras.
- `secretsmanager`: valores secretos.

Para RDS tienes dos caminos: con `ManageMasterUserPassword`, RDS crea y administra el secreto por ti; o creas el secreto primero y lo traes con una referencia dinámica.

## Truco para el examen

Parameter Store puede leer secretos de Secrets Manager, usando la ruta `/aws/reference/secretsmanager/nombre-del-secreto`. Interoperabilidad y flexibilidad.

## Cuándo usar qué

**Parameter Store:** configuración de aplicación, feature flags, valores no sensibles o presupuesto limitado.

**Secrets Manager:** contraseñas de bases de datos, API keys que rotan, credenciales multi-región o RDS con rotación automática.

## Las preguntas tipo examen

- "Necesitas rotar credenciales de RDS automáticamente cada 30 días": **Secrets Manager**.
- "Necesitas almacenar configuración de la app con versiones": **Parameter Store**.
- "Necesitas guardar secretos con costo mínimo": **Parameter Store estándar**.

Los dos descansan sobre [KMS](/blog/kms-por-dentro/), así que vale la pena entender qué pasa por debajo. Y nunca los reemplaces con User Data: te explico por qué en [el post de IMDS](/blog/imds-user-data/).

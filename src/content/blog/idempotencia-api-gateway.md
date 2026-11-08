---
title: "Idempotencia en API Gateway: por qué repetir un request te puede duplicar datos"
description: "Qué métodos HTTP son idempotentes, las 4 capas de un método en API Gateway y cómo evitar duplicados en sistemas con reintentos."
date: 2026-04-13
tags: ["apis", "api-gateway", "resiliencia"]
image: "/img/blog/idempotencia.jpg"
imageAlt: "Sketchnote: idempotencia y métodos en API Gateway"
---

¿Cuántas veces has mandado dos veces el mismo request y terminaste con datos duplicados?

Hoy hablamos de uno de los conceptos que más confusión genera cuando empiezas a diseñar APIs en AWS: la idempotencia.

La regla de oro es simple: **ejecutar una operación varias veces debe producir el mismo resultado que ejecutarla una sola vez.**

[![Sketchnote: idempotencia, métodos de API Gateway, tipos y capas](/img/blog/idempotencia.jpg)](/img/blog/idempotencia.jpg)

## No todos los métodos siguen esa regla

| Método | Para qué | ¿Idempotente? |
|---|---|---|
| GET | Consultar | Sí |
| PUT | Reemplazar | Sí |
| DELETE | Eliminar | Sí |
| POST | Crear | No |
| PATCH | Modificar parcialmente | No se garantiza |

Esto importa mucho en sistemas distribuidos, donde los reintentos por fallos de red son la norma y no la excepción. El cliente no recibió respuesta, reintenta, y el servidor ya había procesado la primera vez.

## Cómo se arregla un POST

API Gateway no vuelve idempotente a un método por ti. Eso lo diseñas tú, y el patrón más común es la **clave de idempotencia**:

1. El cliente genera un identificador único por operación y lo manda en una cabecera.
2. El backend revisa si ya procesó esa clave, por ejemplo con una escritura condicional en DynamoDB.
3. Si ya existe, devuelve el resultado guardado en lugar de volver a ejecutar.

En Lambda no tienes que escribirlo desde cero: [Powertools for AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/lambda-managed-instances-best-practices.html) trae una utilidad de idempotencia pensada para pagos y escrituras en base de datos.

## Las 4 capas de un método en API Gateway

<figure data-arq="api-gateway-capas" data-titulo="Cada método pasa por cuatro capas: dos a la ida, hacia tu backend, y dos a la vuelta, hacia el cliente."></figure>

1. **Method Request.** Validación y autorización con IAM, Cognito o un Lambda Authorizer.
2. **Integration Request.** Transformación y enrutamiento al backend.
3. **Integration Response.** Mapeo de las respuestas del backend.
4. **Method Response.** La respuesta final que recibe tu cliente.

Entender estas capas es clave para depurar: un 401 se queda en la primera, un error de mapeo aparece en la segunda o la tercera, y un 500 de tu código viene del backend.

## Dónde te va a doler si no lo piensas

- Pagos que se cobran dos veces.
- Colas de mensajes, que entregan al menos una vez: [SQS Standard](/blog/sqs-a-fondo/) puede repetir.
- Reintentos automáticos con [backoff](/blog/throttling-exponential-backoff/), que solo son seguros si la operación se puede repetir.

Si te sirvió, [únete a la lista](/lista/) y te aviso cuando salga el próximo.

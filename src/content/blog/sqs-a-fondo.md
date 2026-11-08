---
title: "Amazon SQS a fondo: el buzón inteligente que evita que tu arquitectura colapse"
description: "Standard vs FIFO, visibility timeout, DLQ, long polling y fan-out, con la analogía del restaurante y los errores que más cuestan."
date: 2026-01-22
tags: ["sqs", "arquitectura", "desacoplamiento"]
image: "/img/blog/sqs-buzon.jpg"
imageAlt: "Infografía: SQS, el buzón inteligente de la nube"
---

SQS se anunció en 2004 y suele contarse como el primer servicio de AWS. Y todavía hay arquitectos que no lo usan bien.

Cuando empecé en AWS, lo veía como algo complicado que solo usaban los expertos. Error. SQS es el buzón inteligente que evita que tu arquitectura colapse.

[![Infografía de SQS: historia, analogía del restaurante, desacoplamiento, nivelación de carga, conceptos clave y tipos de cola](/img/blog/sqs-buzon.jpg)](/img/blog/sqs-buzon.jpg)

Una nota sobre la infografía: si ves el tamaño máximo de mensaje en 256 KB, ese era el límite anterior. Desde agosto de 2025 [es 1 MiB](https://aws.amazon.com/about-aws/whats-new/2025/08/amazon-sqs-max-payload-size-1mib/).

## La analogía del restaurante

- **El camarero (productor)** recibe la orden y la pone en el riel de comandas.
- **La nota (mensaje)** viaja por el riel.
- **El riel (SQS)** transporta las órdenes de forma asíncrona. El camarero no se queda esperando: se va a atender otra mesa.
- **El cocinero (consumidor)** toma las órdenes cuando puede y las procesa.

Si el chef se cae, la nota no se pierde. Y la cocina no explota con 50 órdenes simultáneas.

## Para qué sirve en tu arquitectura

**Desacoplamiento.** El sistema A manda un mensaje. El sistema B duerme toda la noche. SQS lo guarda, y al día siguiente B lo procesa.

**Nivelación de carga, el efecto Black Friday.** Llegan 10.000 usuarios por segundo, SQS absorbe el golpe y tu base de datos procesa a su ritmo.

<figure data-arq="sqs-dlq" data-titulo="La cola absorbe el pico y el consumidor procesa a su ritmo. Lo que falla varias veces se aparta a una Dead Letter Queue para revisarlo."></figure>

## Los conceptos que confunden a todos

[![Infografía de Amazon SQS: tipos de cola, ciclo de vida del mensaje, características y escalabilidad](/img/blog/sqs-conceptos.jpg)](/img/blog/sqs-conceptos.jpg)

### Standard vs FIFO

| | Standard | FIFO |
|---|---|---|
| Throughput | Casi ilimitado | 300 mensajes/s, 3.000 en lote, y más en modo de alto rendimiento |
| Orden | Mejor esfuerzo | Garantizado por grupo |
| Entrega | Al menos una vez, con duplicados ocasionales | Sin duplicados dentro de la ventana de 5 minutos |
| Para qué | Logs, notificaciones | Pagos, órdenes |

### Visibility Timeout

El mensaje se oculta mientras se procesa, 30 segundos por defecto. Si el trabajador falla, vuelve a aparecer. Y aquí van dos reglas:

- Si no eliminas el mensaje de forma explícita con `DeleteMessage`, se reprocesa.
- Si tu proceso tarda más que el timeout, usa `ChangeMessageVisibility`. Con Lambda, configura el timeout de la cola en al menos 6 veces el de la función.

### Dead Letter Queue

El cementerio de mensajes. Si un mensaje falla el número de veces que configuras (`maxReceiveCount`), se aparta para revisión humana y depuración. Configúrala siempre, o los bugs se vuelven invisibles.

### Long Polling no es Delay Queue

Mi lección más cara: perdí 4 horas buscando mensajes "perdidos" en un cliente, y el problema era que nadie entendía esta diferencia.

- **Long Polling** hace que el consumidor espere hasta 20 segundos por mensajes. Reduce llamadas vacías.
- **Delay Queue** retrasa la visibilidad de cada mensaje hasta 15 minutos.

## Fan-Out: uno entra, varios reciben

<figure data-arq="sqs-fanout" data-titulo="SNS copia cada evento a varias colas, y cada servicio consume la suya a su propio ritmo."></figure>

Si trabajas con microservicios y aún no usas este patrón, estamos hablando.

## Lo que debes llevarte

- SQS no es complicado, es fundamental.
- Separa el recibir del procesar.
- Absorbe picos sin tumbar tu base de datos.
- Configura siempre la DLQ.
- Como puede repetir, tu consumidor debe ser [idempotente](/blog/idempotencia-api-gateway/).

¿Todavía no te queda clara la diferencia con una API? Lee [API vs SQS](/blog/api-vs-sqs/).

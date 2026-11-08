---
title: "API vs SQS: tardé 3 años en entender la diferencia, hasta que una pizzería me la explicó"
description: "Síncrono o asíncrono: cuándo usar cada uno y por qué las mejores arquitecturas los combinan."
date: 2026-01-22
tags: ["sqs", "apis", "arquitectura"]
image: "/img/blog/api-vs-sqs.jpg"
imageAlt: "Infografía: API vs SQS, la diferencia es el tiempo"
---

Cuando empecé en AWS, todos hablaban de "desacoplar servicios con SQS". Yo asentía, pero en mi cabeza pensaba: "¿No es lo mismo que una API REST? Ambos mueven datos del punto A al B".

Spoiler: no es lo mismo. Y la diferencia no es técnica. **Es de tiempo.**

[![Infografía comparando API y SQS: llamada telefónica contra mensaje de WhatsApp, diferencias técnicas, cuándo usar cada uno y patrón combinado](/img/blog/api-vs-sqs.jpg)](/img/blog/api-vs-sqs.jpg)

## API es una llamada telefónica

Síncrona, en tiempo real:

- Tú hablas, ellos escuchan.
- Esperas la respuesta.
- Bloqueante: te quedas pegada al teléfono.
- Acoplada: si la pizzería cierra, la operación falla.

Si el servidor se cae, te toca reintentar.

## SQS es un mensaje de WhatsApp

Asíncrona, diferida:

- Envías y te vas.
- No esperas el doble check azul.
- No bloqueante: sigues con tu vida.
- Desacoplada: si el servidor está ocupado, no importa. El mensaje está seguro en la cola.

La otra analogía que me cambió todo: la API es la **ventanilla de atención al cliente**, con respuesta inmediata, y si está cerrada, fallas. SQS es la **bandeja de entrada de la oficina de atrás**: los mensajes se acumulan y se procesan cuando haya capacidad.

## Las diferencias clave

| | API | SQS |
|---|---|---|
| Modelo | Pides y esperas | Envías y te vas |
| Dependencia | Alta: los dos despiertos | Nula: productor y consumidor no se conocen |
| Respuesta | El dato procesado | Solo "recibido" |
| Picos | El servidor se puede caer | La cola absorbe el golpe |

## Cuándo usar cada uno

**API, cuando necesitas respuesta inmediata:** un login que debe decir ya si la contraseña es correcta, o la consulta de un precio.

**SQS, cuando la tarea es pesada, lenta o no urgente:** procesar un video que acabas de subir, o enviar un correo.

## El plot twist: son mejores amigos

<figure data-arq="api-sqs" data-titulo="El usuario habla con la API y recibe un 'recibido' al instante. El trabajo pesado se hace después, y le avisan cuando está listo."></figure>

El patrón común en producción:

1. El usuario hace la petición por la API: la ventanilla rápida.
2. La API deja un mensaje en SQS: la bandeja de pendientes.
3. Un trabajador procesa en segundo plano.
4. El usuario recibe una notificación cuando está listo.

Un detalle útil: API Gateway puede escribir directamente en SQS sin una Lambda en el medio, y responderle al cliente de inmediato.

## En resumen

No se trata de API vs SQS. Se trata de cuándo usar cada uno. Las mejores arquitecturas los combinan, y sí, pensar en pizzas ayuda más que leer la documentación.

Si quieres entrar en detalle, sigue con [SQS a fondo](/blog/sqs-a-fondo/). Y si estás construyendo la API, revisa [las 10 prácticas de seguridad](/blog/seguridad-en-apis/).

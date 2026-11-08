---
title: "Microservicios: del papel bonito a la realidad que nadie te cuenta"
description: "Lo que la infografía no dice sobre datos separados, servidores sin estado y observabilidad, y cuándo sí vale la pena migrar."
date: 2026-01-29
tags: ["arquitectura", "microservicios"]
image: "/img/blog/microservicios.jpg"
imageAlt: "Infografía: insights y complementación de microservicios"
---

Hace unos días creé esta infografía sobre arquitectura de microservicios. Miles de likes, cientos de guardados. Pero algo me quedó dando vueltas: ¿cuántos de los que la guardaron saben lo que implica implementar esto?

Porque una cosa es el diagrama colorido, y otra muy distinta es el lunes a las 3 AM cuando tu servicio de pagos está caído y no sabes por qué.

[![Infografía de los principios de microservicios: diseño por dominio, responsabilidad única, datos separados, servidores sin estado, orquestación y observabilidad](/img/blog/microservicios.jpg)](/img/blog/microservicios.jpg)

<figure data-arq="microservicios" data-titulo="Un solo punto de entrada, cada servicio con sus propios datos y una traza que une todo. Sin esa traza, estás volando a ciegas."></figure>

## Lo que la infografía no te dice

### "Datos separados" suena bonito hasta que...

...intentas hacer un reporte que necesita datos de 5 servicios. Ya no puedes hacer un simple JOIN. Ahora necesitas:

- Eventos entre servicios o una base analítica aparte.
- Lidiar con la consistencia eventual.
- Explicarle al CEO por qué "los datos tardan unos segundos en sincronizarse".

En mi experiencia en el sector financiero, este ha sido el punto de quiebre número uno. No porque sea difícil técnicamente, sino porque nadie prepara al negocio para este cambio conceptual.

### El verdadero costo de los servidores sin estado

Destruir y recrear instancias sin perder datos suena mágico, hasta que te das cuenta de que ahora necesitas ElastiCache para las sesiones, S3 para archivos temporales y un sistema de caché distribuido. Tu factura de AWS sube. ¿Lo habías presupuestado?

### Observabilidad: el elefante en la sala

Con un monolito: 1 log, 1 base de datos, 1 problema. Con 50 microservicios: 50 logs, ¿cuál revisas primero?

Sin trazas distribuidas, con herramientas como X-Ray o Jaeger, estás volando a ciegas. CloudWatch Logs no es suficiente cuando necesitas seguir una transacción que toca 12 servicios.

### Y las fallas se vuelven parte del diseño

Cuando todo es una llamada de red, cualquier cosa puede fallar a medias. Necesitas timeouts, reintentos con [backoff](/blog/throttling-exponential-backoff/), [idempotencia](/blog/idempotencia-api-gateway/) y, cuando se pueda, [colas](/blog/api-vs-sqs/) entre servicios.

## Mi regla de oro

No migres a microservicios porque "es lo moderno". Hazlo cuando:

- Tienes equipos que se bloquean entre sí constantemente.
- Distintas partes del sistema necesitan escalar de forma independiente.
- El monolito ya es imposible de mantener.

Si tu problema es "el código está feo", refactoriza el monolito. Será mucho más barato.

## La parte que sí funciona

De todos los puntos de la infografía, estos son los que mejor me han resultado en proyectos reales:

1. **CI/CD independiente por servicio.** Un bug en pagos no bloquea el despliegue de inventario.
2. **Kubernetes para orquestar.** Tiene curva de aprendizaje, pero después de dominar EKS nunca volví a Docker Compose.
3. **API Gateway como única entrada.** Seguridad más simple, [limitación de tasa](/blog/seguridad-en-apis/) y un solo punto para depurar.

¿Te interesa este tipo de contenido? [Únete a la lista](/lista/).

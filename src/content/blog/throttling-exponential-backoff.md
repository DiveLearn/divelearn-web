---
title: "Throttling y Exponential Backoff: cómo sobrevivir al \"too many requests\""
description: "Qué es el throttling, cómo aparece en cada servicio y cómo reintentar bien para no empeorar el problema."
date: 2026-01-28
tags: ["resiliencia", "apis", "certificaciones"]
image: "/img/blog/throttling.jpg"
imageAlt: "Infografía: AWS Throttling y Exponential Backoff"
---

Uno de los conceptos más importantes para construir aplicaciones resilientes en AWS, y lo repasé en mi preparación para Developer Associate.

[![Infografía: qué es el throttling, exponential backoff, ejemplos por servicio e implementación](/img/blog/throttling.jpg)](/img/blog/throttling.jpg)

## Qué es el throttling

Es el mecanismo de AWS para limitar solicitudes y evitar sobrecarga. Piénsalo como un agente de tráfico que regula el flujo para garantizar uso justo de los recursos.

Cuando superas los límites recibes un error, y qué hacer depende de su patrón:

- **Errores intermitentes, por picos de tráfico:** usa backoff.
- **Errores constantes, porque superas el límite siempre:** pide aumento de cuota o rediseña.

## Cómo aparece en cada servicio

| Servicio | Qué ves |
|---|---|
| EC2 | Límites por tipo de llamada, cuenta y región: `RequestLimitExceeded` |
| Lambda | Error 429 si es síncrono. Si es asíncrono, reintenta y puede ir a una DLQ |
| DynamoDB | `ProvisionedThroughputExceededException` |
| API Gateway | HTTP 429. Por defecto, 10.000 peticiones por segundo por cuenta y región |

## Exponential Backoff: el juego de esperar

La analogía perfecta: un niño en el carro preguntando "¿ya llegamos?".

- **Sin backoff:** pregunta cada segundo. Papá se estresa.
- **Con backoff:** espera 1 segundo, luego 2, luego 4, luego 8. Papá puede respirar.

<figure data-arq="backoff" data-titulo="Cuando la API responde 429, el cliente espera cada vez más antes de volver a intentar, hasta que la petición entra."></figure>

## El detalle que falta casi siempre: jitter

Si mil clientes fallan al mismo tiempo y todos esperan exactamente 1, 2 y 4 segundos, vuelven todos juntos y te tumban otra vez. Por eso se agrega aleatoriedad:

```python
import random
import time

def llamar_con_backoff(operacion, intentos=5, base=1, tope=30):
    for intento in range(intentos):
        try:
            return operacion()
        except ThrottlingError:
            if intento == intentos - 1:
                raise
            time.sleep(random.uniform(0, min(tope, base * 2 ** intento)))
```

## Cuándo aplicarlo y cuándo no

**Sí:** errores intermitentes de throttling y errores del servidor (5xx).

**No:** errores del cliente (4xx como Bad Request o Not Found). Repetir algo que está mal no lo arregla.

Y antes de reintentar una operación que escribe, asegúrate de que sea [idempotente](/blog/idempotencia-api-gateway/).

## La buena noticia

Si usas un SDK de AWS, como Boto3 o el de Java, los reintentos con backoff ya vienen incluidos. Puedes ajustar el modo (`standard` o `adaptive`) y el número de intentos. Si llamas la API directamente, te toca implementarlo.

## Lo que me llevo

Las aplicaciones en producción deben manejar el throttling de forma inteligente. No es opcional, es arquitectura bien hecha. Y cuando el pico es muy grande, la mejor respuesta es no reintentar sino [poner una cola en el medio](/blog/sqs-a-fondo/).

---
title: "SSL vs TLS: la confusión que todos tenemos, y por qué importa en AWS"
description: "Historia de las versiones, qué mejora TLS 1.3, cómo elegir la política del balanceador y qué certificados de ACM usar."
date: 2026-01-29
tags: ["seguridad", "cifrado", "redes"]
image: "/img/blog/ssl-tls.jpg"
imageAlt: "Infografía: protocolos SSL/TLS, evolución y rendimiento"
---

Spoiler: si dices "certificado SSL", técnicamente estás hablando de una tecnología que se reemplazó en 1999. Pero tranquila, todos lo hacemos. Incluso quienes deberíamos saberlo mejor.

SSL murió hace décadas. Lo que usamos hoy es TLS, y seguimos diciendo SSL por costumbre, como cuando le decimos Kleenex a cualquier pañuelo.

[![Infografía con la historia de las versiones de SSL y TLS, la comparación del handshake y las políticas de seguridad en balanceadores](/img/blog/ssl-tls.jpg)](/img/blog/ssl-tls.jpg)

## Cronología rápida

| Versión | Año | Estado |
|---|---|---|
| SSL 1.0 | | Nunca se publicó |
| SSL 2.0 | 1995 | Inseguro |
| SSL 3.0 | 1996 | Roto por POODLE en 2014 |
| TLS 1.0 | 1999 | Obsoleto |
| TLS 1.1 | 2006 | Obsoleto |
| TLS 1.2 | 2008 | El mínimo en AWS |
| TLS 1.3 | 2018 | El recomendado |

## Por qué TLS 1.3 es mejor

**El saludo inicial es más corto.** TLS 1.2 necesita 2 viajes de ida y vuelta antes de mandar datos. TLS 1.3 necesita 1. Es un viaje menos en cada conexión nueva, y se nota sobre todo cuando el cliente está lejos.

**Perfect Forward Secrecy obligatorio.** Si alguien roba tu llave en el futuro, no puede descifrar el tráfico pasado. TLS 1.2 también lo permite con los cifrados adecuados, pero TLS 1.3 lo exige siempre.

**Se fueron los algoritmos viejos.** Menos opciones inseguras que configurar por error.

## Lo que debes saber en AWS

AWS terminó en febrero de 2024 de [exigir TLS 1.2 como mínimo](https://aws.amazon.com/blogs/security/tls-1-2-required-for-aws-endpoints/) en los endpoints de sus APIs. Si tu código usaba TLS 1.0 o 1.1, dejó de funcionar. Y sí, pasó: hubo gente actualizando a la carrera.

En tus propios balanceadores, la decisión es tuya, y se toma con la política de seguridad:

<figure data-arq="tls-alb" data-titulo="La política del balanceador decide quién entra: un cliente moderno negocia TLS 1.3, y uno que solo sabe TLS 1.0 se queda afuera."></figure>

| Política del ALB | Permite | Consecuencia |
|---|---|---|
| `ELBSecurityPolicy-2016-08` | TLS 1.0 en adelante | Entra un cliente muy viejo, y el riesgo con él |
| `ELBSecurityPolicy-TLS13-1-2-2021-06` | TLS 1.2 y 1.3 | Se rechaza lo viejo: seguridad sobre compatibilidad |

## Los certificados de ACM

| | Público | Privado |
|---|---|---|
| Para qué | HTTPS en sitios públicos | Uso interno, IoT, microservicios |
| Costo | Gratis en servicios integrados | De pago, con AWS Private CA |
| Control | Renovación automática | Control total de tu autoridad |

Ambos usan TLS, aunque todos digan "certificado SSL". La confusión ya es tradición.

## Lo que importa

- Usa TLS 1.3 si puedes.
- Mínimo TLS 1.2.
- Nunca TLS 1.0 ni 1.1.

Y en conversaciones: di "TLS" si quieres ser precisa, o "SSL" si quieres que todos entiendan. Cuando alguien diga "certificado SSL", puedes corregirlo (y ser esa persona), asentir sabiendo la verdad, o pasarle este post. Yo elijo lo último.

Para ver de dónde viene todo esto, mira [la historia completa de HTTP y HTTPS](/blog/historia-http-https/).

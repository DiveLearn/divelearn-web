---
title: "La seguridad en APIs no es opcional"
description: "Las 10 prácticas que revisaría en cualquier API, después de una llamada de pánico un viernes a las 11 de la noche."
date: 2026-01-24
tags: ["seguridad", "apis", "api-gateway"]
image: "/img/blog/seguridad-apis.jpg"
imageAlt: "Infografía de mejores prácticas de seguridad para APIs"
---

Un viernes a las 11 de la noche recibí una llamada de pánico.

Un cliente había expuesto por accidente datos sensibles de sus usuarios porque su API no validaba bien las peticiones. Le faltaban 4 de las 10 prácticas básicas de seguridad.

Esa noche me quedó algo claro: la seguridad de una API no se arregla cuando ya hay un incidente. Se previene desde el diseño.

Por eso hice esta infografía mientras preparaba AWS Developer Associate.

[![Infografía con las 10 mejores prácticas de seguridad para APIs: API Gateway, validación de entrada, manejo de errores, lista de permitidos, versionado, claves por niveles, HTTPS, limitación de tasa, autorización y OAuth2 con WebAuthn](/img/blog/seguridad-apis.jpg)](/img/blog/seguridad-apis.jpg)

## Las 10 prácticas

1. **API Gateway.** Tu primera línea de defensa: centraliza, valida y protege.
2. **Validación de entrada.** Si no validas en el Gateway, estás confiando en que nadie va a intentar hackearte. Lo van a intentar.
3. **Manejo de errores.** Mensajes claros para quien usa bien la API, sin regalarle información a un atacante. Nada de stack traces expuestos.
4. **Lista de permitidos.** Reglas por IP y por usuario. El acceso por defecto debe ser "no".
5. **Versionado.** `GET /v1/users/123` y no `GET /users/123`. La consistencia también te cuida.
6. **Claves API por niveles.** Firmas HMAC entre cliente y servidor. La autenticación no se negocia.
7. **HTTPS siempre.** Sin excepciones.
8. **Limitación de tasa.** Reglas por IP, por grupo de acción y por otros factores, para proteger tus recursos del abuso.
9. **Autorización granular.** "Puede ver" no es lo mismo que "puede modificar". Los permisos se definen, no se asumen.
10. **OAuth2 y WebAuthn.** Estándares probados. No reinventes la rueda en autenticación.

Y de bonus, el [OWASP API Security Top 10](https://owasp.org/API-Security/), que es la lista de riesgos para revisar la tuya.

## Cómo se ve en AWS

Así quedan varias de esas prácticas juntas en una API REST. Cada petición pasa por capas, y la que no cumple se queda en la primera que la detiene.

<figure data-arq="seguridad-api" data-titulo="El camino de una petición: WAF filtra por IP y tasa, API Gateway valida la entrada y Cognito el token, y solo entonces llega a tu código."></figure>

## Con qué servicio resuelves cada una

| Práctica | En AWS |
|---|---|
| Punto único de entrada | API Gateway |
| Validar el cuerpo y los parámetros | Request validators y modelos de API Gateway |
| Bloquear IPs y patrones de ataque | AWS WAF con reglas administradas |
| Limitar tasa | Throttling por etapa o método, planes de uso y reglas rate-based de WAF |
| Autenticar | Cognito o un Lambda authorizer con JWT |
| Permisos del backend | Rol de IAM con lo mínimo por función |
| Cifrado en tránsito | Certificado de ACM y política de seguridad con TLS 1.2 o superior |
| Rastro de auditoría | Access logs de API Gateway y CloudTrail |

## El checklist que usaría antes de salir a producción

- ¿Hay alguna ruta sin autorizador, aunque sea "de prueba"?
- ¿Los errores devuelven mensajes genéricos, sin stack traces ni nombres de tablas?
- ¿Qué pasa si alguien manda 10.000 peticiones en un minuto?
- ¿Cada función puede tocar solo lo que necesita?
- ¿Podrías saber mañana quién llamó qué y cuándo?
- ¿Repetir una petición crea datos duplicados? Eso se resuelve con [idempotencia](/blog/idempotencia-api-gateway/).

La mejor arquitectura del mundo no sirve de nada si tu API es la puerta trasera sin llave.

Si estás empezando en la nube y quieres entender estas piezas desde la base, el [bootcamp gratis](/bootcamp/) es el mejor punto de partida.

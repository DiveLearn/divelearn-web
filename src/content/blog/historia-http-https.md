---
title: "¿Por qué algunas URLs tienen candadito? La historia de HTTP y HTTPS"
description: "Del HTTP sin ninguna seguridad al cifrado por defecto, y qué pasa de verdad cuando escribes una dirección y presionas Enter."
date: 2026-01-20
tags: ["fundamentos", "redes", "seguridad"]
image: "/img/blog/http-https.jpg"
imageAlt: "Mapa visual de la historia completa de HTTP y HTTPS"
---

Todavía recuerdo la primera vez que alguien me preguntó: "¿Por qué algunas URLs tienen ese candadito y otras no?"

Era 2018. Yo, recién salida de bioingeniería, intentando entender por qué rayos me había metido en el mundo tech. Y ahí estaba: mirando fijamente la barra del navegador como si fuera a revelarme los secretos del universo.

Spoiler: lo hizo.

[![Mapa visual con la historia de HTTP y HTTPS desde cero](/img/blog/http-https.jpg)](/img/blog/http-https.jpg)

## Una historia de 30 años

En 1991, HTTP nació sin ninguna seguridad. Era como enviar tus contraseñas en postales que todo el mundo podía leer. Literal, así de vulnerable.

| Año | Qué pasó |
|---|---|
| 1991 | Primera versión de HTTP: solo texto y sin cifrado |
| 1994 | Netscape crea HTTPS, con SSL por debajo |
| 1997 | HTTP/1.1 se vuelve el estándar de la web |
| 1999 | TLS reemplaza a SSL |
| 2015 | HTTP/2: varias peticiones por la misma conexión |
| 2022 | HTTP/3 se estandariza, sobre QUIC |

Aquí te cuento [por qué seguimos diciendo SSL](/blog/ssl-vs-tls/) aunque ya no se use.

## Qué pasa cuando escribes una dirección y presionas Enter

<figure data-arq="https-enter" data-titulo="Antes de ver una página, tu navegador pregunta la dirección al DNS, saluda al servidor, acuerda el cifrado y recién entonces pide el contenido."></figure>

1. **DNS:** tu navegador pregunta qué IP tiene ese nombre.
2. **TCP:** abre una conexión con el servidor.
3. **TLS:** el servidor muestra su certificado, y juntos acuerdan las llaves de cifrado.
4. **HTTP:** por fin, pide la página, y la respuesta viaja cifrada.

## Qué hace el candadito y qué no

**Sí te garantiza** que la conexión está cifrada y que el certificado corresponde a ese dominio.

**No te garantiza** que el sitio sea honesto. Un sitio de phishing también puede tener candado. Te asegura con quién hablas, no si esa persona es de fiar.

Por eso tu banco nunca usaría HTTP: sin cifrado, cualquiera en la misma red podría leer o modificar lo que viaja.

## Y en AWS

- **ACM** te da certificados públicos sin costo para los servicios integrados.
- **CloudFront y los balanceadores** terminan TLS por ti.
- **S3, API Gateway y demás** exponen endpoints con HTTPS.

Lo que te toca a ti es no dejar puertas en HTTP: redirige a HTTPS y elige bien la política de seguridad.

## Por qué hice este mapa

Porque mi cerebro con TDAH necesitaba ver la historia completa, no leer 47 diapositivas de PowerPoint. Entender esto no se trata de memorizar definiciones: se trata de tener contexto y poder visualizar el proceso completo.

En cloud computing, entender los fundamentos no es opcional. Y si aprendes mejor así, te va a gustar el [bootcamp gratis](/bootcamp/).

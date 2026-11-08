---
title: "Encriptación en AWS: las 3 dimensiones, sin tecnicismos innecesarios"
description: "En tránsito, en reposo y del lado del cliente explicados como proteger dinero, con qué servicio resuelves cada una y cuándo combinarlas."
date: 2026-01-30
tags: ["seguridad", "cifrado", "kms"]
image: "/img/blog/encriptacion.jpg"
imageAlt: "Infografía: arquitectura de encriptación en AWS"
---

Pregunta frecuente: "¿Cuál es la diferencia entre encriptar en tránsito, en reposo y del lado del cliente?"

Respuesta: es como proteger dinero de 3 formas diferentes.

[![Infografía de las tres dimensiones de la encriptación en AWS y la gestión de certificados con ACM](/img/blog/encriptacion.jpg)](/img/blog/encriptacion.jpg)

<figure data-arq="encriptacion" data-titulo="Las tres capas en un solo recorrido: tu app puede cifrar antes de enviar, el dato viaja por TLS y S3 lo guarda cifrado con KMS."></figure>

## 1. En tránsito: la tubería blindada

Piensa en una transferencia bancaria por una tubería subterránea blindada.

Tu laptop manda datos a AWS por internet. Sin protección, se pueden interceptar. Con TLS, viajan por un túnel cifrado que evita los ataques de intermediario (Man-in-the-Middle).

**En AWS:** HTTPS en los endpoints, VPN y certificados de ACM. Y si te preguntas si se dice SSL o TLS, [aquí lo explico](/blog/ssl-vs-tls/).

## 2. En reposo: la bóveda del banco

El dinero guardado en una caja fuerte. Los datos llegan, se guardan en disco cifrados, y quien está autorizado los lee sin notar nada.

**En AWS:**

- **S3:** desde enero de 2023 todos los objetos nuevos se cifran por defecto con SSE-S3, y puedes elegir SSE-KMS.
- **EBS:** hay que activarlo por volumen, o por defecto en la cuenta y región.
- **RDS:** se elige al crear la base de datos.

[![Ilustración: un sobre sellado que viaja para el cifrado en tránsito y un cofre con candado para el cifrado en reposo](/img/blog/enc-transito-reposo.jpg)](/img/blog/enc-transito-reposo.jpg)

## 3. Del lado del cliente: el cofre privado

Tu cofre con **tu** llave, y el banco no la tiene. Tú cifras antes de subir, de modo que AWS nunca ve los datos originales y no puede descifrarlos. Para hacerlo sin inventar tu propia criptografía existen el AWS Encryption SDK y el cliente de cifrado de S3.

## Cuándo usar cada una

| Dimensión | Cuándo |
|---|---|
| En tránsito | Siempre. No se negocia. |
| En reposo | Datos sensibles y requisitos de cumplimiento (y como es barato, casi siempre). |
| Del lado del cliente | Cuando ni tu proveedor debe poder leer el dato. |

## Combinaciones reales

- **App web normal:** HTTPS en tránsito y S3 con cifrado en reposo.
- **App financiera:** HTTPS y VPN en tránsito, KMS en reposo y [envelope encryption](/blog/kms-por-dentro/) del lado del cliente para los campos más sensibles.

## El error común

"Encripté en tránsito, ya está." No. Necesitas capas: cuando viaja, cuando duerme y desde el origen. Seguridad es tener varias barreras.

¿Tu arquitectura cubre las 3? Si estás empezando, en el [bootcamp gratis](/bootcamp/) vemos estas bases paso a paso.

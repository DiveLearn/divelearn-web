---
title: "AWS KMS por dentro: lo que pasa cuando le das a \"enable encryption\""
description: "Tipos de claves, envelope encryption, límites, regiones y las cosas que no son obvias hasta que te topas con ellas."
date: 2026-01-26
tags: ["seguridad", "cifrado", "kms", "certificaciones"]
image: "/img/blog/kms.jpg"
imageAlt: "Infografía: AWS KMS"
---

Plot twist: arranqué a preparar Developer Associate sin haber configurado jamás permisos de KMS ni usado una llave en la vida real. Siempre le daba clic a "enable encryption" y listo. El asistente hacía su magia y yo seguía con lo mío.

Pero estudiando me di cuenta de que KMS está literalmente en todos lados: snapshots de RDS, buckets de S3, Parameter Store, Secrets Manager. Y yo sin entender qué pasaba por debajo.

[![Infografía de KMS: tipos de claves, funcionamiento técnico, políticas, copia de snapshots, comparación con CloudHSM y límites](/img/blog/kms.jpg)](/img/blog/kms.jpg)

## Qué es

KMS es el servicio de AWS que gestiona claves de cifrado por ti. Está integrado con IAM para la autorización y con CloudTrail para la auditoría. La regla de oro: nunca guardes secretos en texto plano.

## Los tipos de claves

- **Simétricas (AES-256):** una sola clave para cifrar y descifrar. Es el estándar de AWS y nunca ves la clave en texto plano.
- **Asimétricas (RSA y ECC):** par pública y privada, para firmar y verificar o cuando alguien cifra fuera de AWS.
- **HMAC:** para generar y verificar códigos de autenticación de mensajes.

Y según quién las administra: **propiedad de AWS** (ni las ves), **administradas por AWS** (`aws/s3`, por ejemplo) y **administradas por ti**, donde controlas la política y la rotación.

## Envelope encryption: el truco para archivos grandes

KMS tiene un límite de 4 KB para cifrar directamente. Entonces:

<figure data-arq="kms-envelope" data-titulo="KMS te da una llave de datos en dos versiones. Con la versión en claro cifras el archivo, y guardas al lado la versión cifrada."></figure>

1. Llamas a `GenerateDataKey`.
2. KMS te entrega la llave de datos en texto plano y también cifrada.
3. Cifras tu archivo con la de texto plano y la borras de memoria.
4. Guardas el archivo junto con la llave cifrada.
5. Para leer, le pides a KMS que descifre esa llave, y con ella abres el archivo.

## Las APIs que debes conocer

`Encrypt`, `Decrypt`, `GenerateDataKey` y `ReEncrypt`. Todas pasan por IAM y quedan en CloudTrail.

## Permisos: aquí se cae la gente

Toda clave tiene una **key policy**, y sin ella nadie entra. Si un objeto de S3 está cifrado con KMS, no basta con `s3:GetObject`: también necesitas `kms:Decrypt`. Lo viví en [mi laboratorio de errores](/blog/errores-laboratorio-permisos/).

## Regiones: lo que me hubiera ahorrado un dolor de cabeza

Una clave normal de KMS vive en una sola región. Para copiar snapshots cifrados entre regiones, hay que volver a cifrar con una clave de destino.

Existen también las **claves multi-región**, réplicas que comparten material criptográfico, pero tienes que crearlas así a propósito.

## Otras cosas que no son obvias

- **Rotación automática:** disponible en claves simétricas que tú administras. La versión anterior se conserva para seguir descifrando lo viejo.
- **Borrado:** nunca es inmediato. Programas de 7 a 30 días, porque borrar una clave deja ilegible todo lo que cifró.
- **Costos y límites:** cada llamada cuenta. S3 Bucket Keys reducen mucho las llamadas a KMS cuando tienes millones de objetos.
- **CloudHSM:** cuando necesitas hardware dedicado de un solo cliente y control exclusivo de las llaves.

Esto fue parte del experimento de compartir el proceso real de estudiar, no solo "aprobé, aquí mis tips". ¿Cuántos usamos KMS sin entender qué está pasando? Yo, hasta ese día.

Si vas por ahí, sigue con [las 3 dimensiones de la encriptación](/blog/encriptacion-tres-dimensiones/).

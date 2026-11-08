---
title: "4 horas, 4 experimentos y 7 errores tontos con permisos en AWS"
description: "El diario real de un laboratorio de IAM, S3, Lambda y KMS, y lo que aprendí de cada error que yo misma causé."
date: 2026-01-26
tags: ["iam", "laboratorio", "certificaciones"]
image: "/img/blog/iam-politica.jpg"
imageAlt: "Ilustración de una política de IAM que permite s3:GetObject"
---

Día 1 preparándome para AWS Certified Developer Associate. 4 horas, 4 experimentos, 9 capturas de pantalla, 7 errores tontos. Y la sensación de pasar de "sé la teoría" a "por qué no funciona".

## Cronología de mis errores

### Error 1: NoSuchKey

Lambda me devuelve un statusCode 500 con `NoSuchKey`. 15 minutos depurando: reviso permisos, bucket, región. Finalmente: se me olvidó subir `test.txt` al bucket.

Permisos perfectos y archivo inexistente es NoSuchKey, no AccessDenied.

### Error 2: timeout de 3 segundos

Causa: Lambda dentro de una VPC sin NAT Gateway. Mi solución fue quitar la VPC. Si necesitas quedarte en la VPC y solo vas a S3, un VPC endpoint de tipo gateway te resuelve el camino sin NAT.

### Error 3: el Deny que puse yo

Lambda funciona con 200 OK. Agrego un Deny en la bucket policy. Prueba: AccessDenied, perfecto. 20 minutos después sigo depurando "por qué sigue fallando". Porque no quité el Deny. El Deny que yo puse. Probé "Deny le gana a Allow" contra mí misma.

## Los dilemas que resolví

### Permission Boundaries

PowerUserAccess con un boundary limitado a S3, Lambda y Logs. EC2 me da AccessDenied, S3 funciona. El techo invisible existe: el boundary no da permisos, solo limita los que ya tienes.

### Acceso entre cuentas

"¿Por qué necesito bucket policy si el rol tiene permisos?" Porque el bucket no es tuyo, Mar.

<figure data-arq="cross-account" data-titulo="Entre cuentas tienen que decir que sí los dos lados: el rol que llama, la política del bucket y, si está cifrado, la clave de KMS."></figure>

Identity policy y resource policy: ambas son necesarias. Borré la bucket policy y vino el AccessDenied inmediato.

### S3 con KMS

`s3:GetObject` en verde, objeto cifrado, y AccessDenied. 20 minutos después: "Ah, `kms:Decrypt`". Permisos transitivos que olvidas hasta que fallan.

## Otros errores

- CloudTrail tarda unos minutos en mostrar los eventos, y yo dándole F5.
- Olvidé el concepto de cross-account 10 minutos después de aprenderlo.

## Lo más valioso

No fue confirmar que Deny gana a Allow. Eso ya lo sabía.

Fue sentir la frustración de depurar 20 minutos. Ver cómo funciona un boundary. Entender por qué cross-account necesita ambos lados. Fue el "oh" cuando tú misma causaste el error.

La teoría es clara, lógica y ordenada. La práctica es "por qué no funciona". Esa brecha es el aprendizaje real.

## Cómo depurar un AccessDenied

1. ¿Quién soy? `aws sts get-caller-identity`.
2. ¿Existe lo que estoy pidiendo?
3. ¿Hay un Deny explícito en algún lado, incluso en una SCP?
4. ¿Mi identidad tiene el permiso?
5. ¿El recurso me deja entrar, si es otra cuenta?
6. ¿Hay un boundary o una clave de KMS en el camino?

Para tener el mapa completo, lee [cómo funcionan las políticas de IAM](/blog/politicas-iam/). Y si quieres practicar sin miedo, arranca por el [bootcamp gratis](/bootcamp/).

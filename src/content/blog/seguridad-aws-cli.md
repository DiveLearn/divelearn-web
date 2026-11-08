---
title: "Seguridad en AWS CLI: lo que el curso no te explica"
description: "MFA en la terminal, perfiles, la cadena de credenciales y Signature v4: el porqué detrás de cada comando."
date: 2026-01-29
tags: ["seguridad", "cli", "iam", "certificaciones"]
image: "/img/blog/aws-cli.jpg"
imageAlt: "Infografía: seguridad en AWS CLI"
---

Repasando seguridad en AWS CLI para mi DVA-C02 me di cuenta de algo: los cursos te muestran los comandos, pero no te explican el porqué detrás de cada cosa. Y ese porqué es exactamente lo que te pregunta AWS en el examen.

[![Infografía con los flujos de seguridad de la CLI: MFA, perfiles, cadena de credenciales y firma Signature v4](/img/blog/aws-cli.jpg)](/img/blog/aws-cli.jpg)

## 1. MFA en la CLI: el dolor de cabeza

El escenario típico: configuras `aws configure`, todo funciona. Al día siguiente tu empresa habilita MFA obligatorio y tus comandos fallan con Access Denied. Tus Access Keys de largo plazo ya no son suficientes.

La solución es pedir credenciales temporales:

```bash
aws sts get-session-token \
  --serial-number arn:aws:iam::111122223333:mfa/mi-dispositivo \
  --token-code 123456
```

Te devuelve tres valores: AccessKeyId, SecretAccessKey y SessionToken.

<figure data-arq="cli-mfa" data-titulo="Con tus llaves y el código MFA, STS te entrega credenciales temporales. Sin el SessionToken, las otras dos no sirven."></figure>

El truco: ese SessionToken es el que lleva la prueba de que pasaste el MFA. Mi error del millón fue copiar solo AccessKey y SecretKey. Me tomó 2 horas darme cuenta de que faltaba `AWS_SESSION_TOKEN`.

## 2. Named Profiles: tu salvavidas multi-cuenta

Si trabajas con más de una cuenta, esto te cambia la vida. La opción `--profile` en la línea de comandos tiene la máxima prioridad: incluso si tienes variables de entorno configuradas, las sobrescribe.

Historia de terror real: un compañero ejecutó un script de limpieza pensando que estaba en dev. Estaba en prod. Adiós buckets con datos de 3 años. Antes de cualquier cosa destructiva: `aws sts get-caller-identity`.

## 3. La cadena de credenciales: debes dominarla

Aparece en el examen disfrazada de troubleshooting. La versión simplificada, de mayor a menor prioridad:

1. Opciones de la línea de comandos, como `--profile`.
2. Variables de entorno.
3. Archivo `credentials`.
4. Archivo `config`.
5. Credenciales del contenedor.
6. Rol de IAM de la instancia. Aquí casi siempre está la respuesta.

La regla de oro:

- **En tu laptop:** perfiles o variables de entorno, idealmente con IAM Identity Center para no tener llaves largas.
- **En AWS:** siempre roles de IAM.
- **Nunca** pongas Access Keys en el código. El día que lo subas a GitHub por accidente, le regalaste tu cuenta a internet.

## 4. Signature v4: la magia invisible

Cada comando de la CLI:

1. Se convierte en una petición HTTP.
2. El SDK toma tus credenciales.
3. Crea una firma criptográfica del mensaje.
4. AWS verifica esa firma.

Garantiza dos cosas: **identidad** (eres quien dices ser) e **integridad** (nadie modificó el mensaje).

En el examen: "¿Cómo compartir un objeto S3 privado temporalmente?" Respuesta: una URL prefirmada, que es SigV4 puesta en el query string.

## Mi flujo trabajando con muchas cuentas

- Un perfil por cliente y ambiente.
- MFA o inicio de sesión temporal siempre que se pueda.
- En producción, roles de IAM. Nunca credenciales en el código.

Para entender qué pueden hacer esas credenciales una vez dentro, sigue con [las políticas de IAM](/blog/politicas-iam/).

---
title: "IAM no es sexy, pero es la base de todo"
description: "Usuarios, roles, MFA y la cuenta root: la guía que uso desde 2019 y los 3 errores que sigo viendo en cuentas corporativas."
date: 2026-01-21
tags: ["iam", "seguridad", "fundamentos"]
image: "/img/blog/iam-guia.jpg"
imageAlt: "Infografía: AWS Identity and Access Management"
---

La guía de IAM que guardé como oro durante 7 años se actualizó. Claramente me apoyé en mis amigos de IA: me duele menos la mano y condensan mejor la información.

Cuando empecé en AWS en 2019, IAM era ese servicio que todos entendían pero nadie configuraba bien. Resultado: cuentas comprometidas, miles de dólares facturados, costos inflados y arquitectos desvelados.

[![Infografía de AWS IAM: conceptos fundamentales, gestión de permisos, formas de acceso y mejores prácticas](/img/blog/iam-guia.jpg)](/img/blog/iam-guia.jpg)

Esta versión es la continuación de la que ayudó a más de 100 estudiantes a certificarse, con nuevas opciones de MFA, mejores prácticas actuales y, al fin, una explicación visual de usuarios y roles que no confunde.

## Las piezas

- **Usuario:** una persona o aplicación con credenciales de largo plazo.
- **Grupo:** una forma de darle los mismos permisos a varios usuarios.
- **Rol:** una identidad sin credenciales fijas que alguien asume por un tiempo.
- **Política:** el documento que dice qué se puede hacer. Aquí te explico [su anatomía completa](/blog/politicas-iam/).

## Usuarios o roles

<figure data-arq="iam-rol" data-titulo="Una aplicación asume un rol, STS le entrega credenciales temporales y con ellas llega a S3. No hay ninguna llave guardada que se pueda filtrar."></figure>

[![Ilustración: un usuario o servicio asume un rol temporal para acceder a S3](/img/blog/iam-asumir-rol.jpg)](/img/blog/iam-asumir-rol.jpg)

La diferencia es la duración de las credenciales. Una Access Key vive hasta que alguien la borre, y por eso termina en un repositorio o un chat. Un rol entrega credenciales que expiran solas.

Mi regla: si es un servicio de AWS, rol. Si es una persona, IAM Identity Center. Los usuarios de IAM con llaves quedan para casos que de verdad no tengan otra salida.

## Los 3 errores que sigo viendo en el 90 % de las cuentas corporativas

### 1. Credenciales de root activas "por si acaso"

[![Ilustración: el usuario raíz de AWS marcado como peligroso](/img/blog/iam-root.jpg)](/img/blog/iam-root.jpg)

La cuenta root puede hacer todo y no se le puede limitar con una política de IAM. Protégela con MFA, no le crees Access Keys y úsala solo para las pocas tareas que la exigen.

### 2. Access Keys compartidas en Slack o por Meet

Sí, todavía. Una llave compartida no tiene dueño, no se puede auditar bien y nadie se atreve a rotarla.

### 3. MFA solo en producción

Dev y staging también son puertas de entrada, y muchas veces tienen acceso a más de lo que crees.

[![Ilustración del flujo de MFA: usuario y contraseña, código de 6 dígitos del teléfono y acceso concedido](/img/blog/iam-mfa.jpg)](/img/blog/iam-mfa.jpg)

## Checklist para tu cuenta

- Root con MFA y sin llaves.
- MFA para todas las personas, en todos los ambientes.
- Roles en lugar de llaves dentro de AWS.
- Permisos mínimos y revisados, con ayuda de IAM Access Analyzer.
- CloudTrail activo para saber quién hizo qué.

La diferencia entre un arquitecto junior y uno senior no es cuántos servicios conoces. Es cuántos incidentes de seguridad evitaste antes de que pasaran.

IAM es la base de todo, y en lo personal es mi servicio favorito. Si quieres empezar por ahí, tienes el [bootcamp gratis](/bootcamp/).

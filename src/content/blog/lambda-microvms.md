---
title: "Lambda MicroVMs: aislamiento de máquina virtual con arranque casi instantáneo"
description: "Qué problema resuelven, cómo funciona el flujo con snapshots y cuándo usarlas para correr código que tú no escribiste."
date: 2026-06-23
tags: ["lambda", "serverless", "ia", "seguridad"]
image: "/img/blog/lambda-microvms.jpg"
imageAlt: "Infografía: AWS Lambda MicroVMs"
---

AWS lanzó Lambda MicroVMs y me parece uno de los anuncios más interesantes del año para quienes trabajamos con arquitecturas multi-tenant o estamos construyendo productos con IA.

[![Infografía de Lambda MicroVMs: qué es, flujo de trabajo, comandos, comparativa con Lambda Functions y especificaciones](/img/blog/lambda-microvms.jpg)](/img/blog/lambda-microvms.jpg)

## El problema que resuelve

Cuando necesitas que cada usuario tenga su propio entorno aislado para correr código que tú no escribiste, hasta ahora tenías que elegir entre velocidad o seguridad:

- **Las máquinas virtuales** aíslan bien, pero tardan minutos en arrancar.
- **Los contenedores** son rápidos, pero el kernel compartido es un riesgo con código no confiable.
- **Las funciones Lambda** no están pensadas para sesiones largas con estado.

Lambda MicroVMs cierra esa brecha con tres cosas a la vez: aislamiento real a nivel de máquina virtual con Firecracker, arranque casi instantáneo desde snapshots y estado persistente durante toda la sesión.

## Cómo funciona

<figure data-arq="lambda-microvms" data-titulo="Un Dockerfile se convierte en una imagen con la app ya inicializada. Cada sesión arranca desde ese snapshot, en su propia MicroVM."></figure>

1. Empaquetas tu app con un Dockerfile.
2. Lambda construye la imagen, inicializa tu aplicación y toma un snapshot de memoria y disco.
3. Cada sesión nueva arranca desde ese snapshot, con las dependencias ya cargadas.
4. Durante el tiempo sin actividad, la MicroVM se pausa a un costo bajo y se retoma sin que el usuario lo note.

## Comparación rápida

| | Lambda Functions | Lambda MicroVMs |
|---|---|---|
| Pensada para | Eventos y petición-respuesta | Sesiones interactivas por usuario |
| Estado | Efímero | Memoria y disco durante la sesión |
| Duración | Hasta 15 minutos | Sesiones de hasta 8 horas |
| Conexión | Invocación | Endpoint HTTPS propio, WebSocket o gRPC |

## Las especificaciones que hay que saber

- Cada MicroVM arranca con una base configurable, de hasta 4 vCPU y 8 GB, y escala sola hasta 4 veces ese tamaño: 16 vCPU y 32 GB.
- Corre en ARM64.
- Tiene salida a internet por defecto. Para llegar a tu VPC se usa un Lambda Network Connector.

## Casos de uso

Asistentes de código con IA, entornos de datos interactivos, escáneres de vulnerabilidades y servidores de juegos con scripts de usuarios. Básicamente cualquier producto donde hoy estás invirtiendo ingeniería en resolver el aislamiento en lugar de construir el producto.

## Antes de usarla

Aislar el entorno no lo resuelve todo. Sigue siendo tu responsabilidad qué puede alcanzar ese código: si le das salida a internet o un rol con permisos amplios, el aislamiento protege a tus otros usuarios, pero no lo que esa MicroVM ya puede tocar. Empieza con el mínimo, igual que con [IMDS y las credenciales de una instancia](/blog/imds-user-data/).

El detalle completo está en el [anuncio de AWS](https://aws.amazon.com/blogs/compute/announcing-lambda-microvms-serverless-compute-environments-with-vm-level-isolation-and-near-instant-startup/). Y si Lambda todavía te suena lejano, el [bootcamp gratis](/bootcamp/) te lleva desde la base.

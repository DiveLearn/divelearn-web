---
title: "Ojo: Lambda no \"ahora dura 90 minutos\""
description: "Qué cambió de verdad, a qué invocaciones aplica y por qué poder correr 90 minutos no significa que debas."
date: 2026-09-23
tags: ["lambda", "serverless", "arquitectura"]
image: "/img/blog/lambda-90-minutos.jpg"
imageAlt: "Infografía: AWS Lambda a 90 minutos, desmintiendo el rumor"
---

Esa semana se me llenó el feed de "¡Lambda ya corre 90 minutos!". Y no, no es tan así. La letra pequeña importa, y mucho.

[![Infografía con los límites reales de Lambda y un árbol de decisión de arquitectura según la duración del trabajo](/img/blog/lambda-90-minutos.jpg)](/img/blog/lambda-90-minutos.jpg)

## A qué aplica

Solo a [Lambda Managed Instances](/blog/lambda-managed-instances/) (LMI), la modalidad donde tus funciones corren sobre instancias EC2 que Lambda administra por ti. No a la Lambda de toda la vida.

Y solo a dos tipos de invocación: las asíncronas y las de event source mapping, por ejemplo cuando Lambda consume de una cola o un stream.

<figure data-arq="lambda-90" data-titulo="El mismo Lambda Managed Instances tiene dos límites: lo que llega de forma síncrona sigue en 15 minutos, y lo que llega por cola o de forma asíncrona puede llegar a 90."></figure>

## Qué sigue igual

| Caso | Límite |
|---|---|
| Lambda normal | 15 minutos |
| Invocaciones síncronas en LMI | 15 minutos |
| Fase de inicialización | 15 minutos |
| Event source mapping de Amazon MQ y DocumentDB | 15 minutos |
| Asíncronas y demás event source mappings en LMI | Hasta 90 minutos |

O sea, si tienes una API detrás de API Gateway, para ti no cambió nada.

## Para qué sirve entonces

Para cargas que antes te obligaban a partir el trabajo en pedacitos o a migrar a otro servicio: transcodificación de video, simulaciones financieras, ETL pesados o inferencia de IA. Si ya estás en LMI, puedes correr esos procesos largos sin rediseñar todo.

## Mi consejo de arquitecta

Que puedas no significa que debas. Un proceso de 90 minutos trae retos que en 30 segundos ni se notan:

- **Conexiones que se cierran por inactividad.** Revisa los timeouts de bases de datos y APIs externas. Si sales por NAT Gateway, ten en cuenta que corta las conexiones inactivas a los 350 segundos: necesitas keep-alive.
- **Credenciales temporales que expiran.** Si tu función obtiene tokens, deben durar todo el proceso o renovarse.
- **Reintentos que procesan lo mismo dos veces.** Lambda no garantiza una sola ejecución. Si tu función no es [idempotente](/blog/idempotencia-api-gateway/), te va a doler.
- **Colas mal configuradas.** Con SQS, el visibility timeout debe ser al menos seis veces el timeout de la función.
- **Lotes grandes.** Activa el reporte de fallos parciales, para reintentar solo lo que falló y no todo el lote.

Y si tu proceso pasa la mitad del tiempo esperando respuesta de otros servicios, probablemente estés pagando por esperar. Ahí vale la pena mirar Step Functions, Lambda durable functions, Fargate o AWS Batch.

## En resumen

Lambda sigue siendo para ejecuciones cortas. Los 90 minutos son una herramienta para casos puntuales, no la nueva normalidad.

La documentación está en las [buenas prácticas de Lambda Managed Instances](https://docs.aws.amazon.com/lambda/latest/dg/lambda-managed-instances-best-practices.html). Si quieres recibir el próximo análisis, [únete a la lista](/lista/).

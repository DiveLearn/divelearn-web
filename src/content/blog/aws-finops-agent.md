---
title: "AWS FinOps Agent: investigar anomalías de costos sin hacerlo a mano"
description: "Qué hace, cómo llega a la causa raíz con CloudTrail y qué cambia para los equipos que hoy revisan la factura una vez al mes."
date: 2026-06-10
tags: ["finops", "costos", "ia"]
image: "/img/blog/aws-finops-agent.jpg"
imageAlt: "Infografía: presentando AWS FinOps Agent"
---

AWS anunció el Public Preview de AWS FinOps Agent, y creo que va a cambiar la forma en que los equipos de ingeniería gestionan los costos en la nube.

[![Infografía de AWS FinOps Agent: qué es, cómo investiga anomalías, respuestas para ingeniería y funcionalidades clave de la vista previa](/img/blog/aws-finops-agent.jpg)](/img/blog/aws-finops-agent.jpg)

## Qué hace exactamente

Investiga anomalías de costos de forma autónoma, las correlaciona con eventos de CloudTrail para identificar la causa raíz y entrega los hallazgos directamente en Jira o Slack.

<figure data-arq="finops-agent" data-titulo="Una anomalía dispara la investigación. El agente la cruza con CloudTrail para encontrar el cambio que la causó y le avisa a quien es dueño del recurso."></figure>

## Lo que más me llama la atención

- **Investigación automática de anomalías.** Escucha los eventos de AWS Cost Anomaly Detection, determina si el aumento vino de más uso o de una tarifa mayor y busca la actividad relacionada.
- **Preguntas en lenguaje natural.** Cualquier ingeniero puede preguntar "¿por qué subió mi costo el mes pasado?" y obtener una respuesta real.
- **Reportes recurrentes** en PDF, PPT o HTML, sin armar dashboards a mano.
- **Contexto organizacional.** Subes tu mapeo de cuentas por equipo y el agente responde en los términos de tu empresa.

## El cambio de fondo

Pasar de revisiones mensuales reactivas a operaciones continuas y orientadas a eventos. Y puedes filtrar para que solo investigue anomalías por encima de un monto, de modo que la atención del equipo quede en lo que más pesa.

## Lo que el agente no hace por ti

- **No reemplaza el etiquetado.** Si no sabes de quién es cada cuenta o recurso, tampoco va a saber a quién avisarle.
- **Necesita permisos para mirar CloudTrail.** Sin ellos, pierde justo la parte de encontrar la causa.
- **Investiga, no decide.** La persona dueña del recurso sigue siendo quien decide qué hacer.

Si quieres ver un ejemplo de por qué la factura es tan buen punto de partida, mira el [método DIVE](/blog/inventario-aws-metodo-dive/).

Cuando lo anunciaron estaba disponible en us-east-1 y era gratis durante el preview. Revisa el estado actual en la [página del servicio](https://aws.amazon.com/finops-agent/).

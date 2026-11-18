---
title: "Well-Architected se renueva: los mismos 6 pilares, ahora en 2 áreas"
description: "Qué cambió en la actualización de noviembre de 2026: Cloud Foundations, Cloud Workloads, las prácticas nuevas, las que se fueron y qué significa si haces revisiones o estudias para una certificación."
date: 2026-11-18
tags: ["arquitectura", "well-architected", "novedades"]
image: "/img/blog/well-architected-2026.jpg"
imageAlt: "Sketchnote: Well-Architected se renueva, Cloud Foundations y Cloud Workloads, y lo nuevo"
---

El 16 de noviembre de 2026 AWS publicó una actualización grande del Well-Architected Framework. Lo primero que uno busca es el pilar nuevo, pero no hay ninguno: siguen los mismos seis. Lo que cambió es cómo se organiza todo, y eso cambia la forma de hacer una revisión.

[![Sketchnote con las dos áreas nuevas de Well-Architected y lo nuevo de esta versión](/img/blog/well-architected-2026.jpg)](/img/blog/well-architected-2026.jpg)

## El cambio en una frase

Lo que aplica a toda tu organización se revisa una vez. Cada workload se revisa solo con lo que le aplica a él.

Para lograrlo, el Framework ahora tiene dos áreas:

| Área | Qué cubre | Cuándo se revisa | Prácticas |
|---|---|---|---|
| **Cloud Foundations** | Tu entorno completo: cuentas, identidad, costos, redes | Una vez, y se va madurando | 45 en 7 capacidades |
| **Cloud Workloads** | Cómo diseñas, construyes y operas cada aplicación | En cada workload | 216 (antes eran 307) |

Además, los seis whitepapers de los pilares quedaron unidos en un solo documento, y casi todas las prácticas pasaron a una plantilla estándar.

## Por qué hacía falta

Si alguna vez hiciste una revisión Well-Architected, ya conoces el problema. Llegas a revisar una aplicación y te toca responder otra vez cómo están organizadas las cuentas, cómo se protege la cuenta root, quién paga qué y cómo se reparte la red. Esas respuestas son iguales para todas las aplicaciones de la empresa, y casi siempre las maneja otro equipo.

AWS lo explica así: las prácticas de cuentas y organización estaban regadas por todo el Framework y se revisaban en cada workload. Ahora se juntaron en un solo lugar.

## Cloud Foundations: las bases de todo el entorno

Cloud Foundations reúne lo que normalmente maneja un equipo de plataforma o de nube, no el equipo de cada aplicación. AWS lo describe como el plano para construir una buena **landing zone**: los controles de seguridad, operación y costos que deberías tener antes de llevar cargas a producción.

Tiene siete capacidades:

| Capacidad | De qué se trata |
|---|---|
| Entorno multicuenta | Cuentas y unidades organizativas como fronteras de aislamiento, con políticas aplicadas igual en todos los equipos |
| Identidad y accesos | Identidades centralizadas, cuentas privilegiadas protegidas y mínimo privilegio |
| Observabilidad central | Estándares de logs, métricas y trazas para toda la organización, recogidos en un solo lugar |
| Recursos e inventario | Etiquetas consistentes, inventario actualizado, patrones compartidos y parches automáticos |
| Seguridad y cumplimiento | Acceso de emergencia, auditoría, detección de amenazas, vulnerabilidades y preparación forense |
| Gestión financiera | Visibilidad de costos, atribución, presupuestos, licencias y estrategia de compromisos |
| Redes y conectividad | Topología, controles de protección y DNS manejados de forma central |

De las 45 prácticas, 33 vienen de mover o fusionar prácticas que ya existían en los pilares. Las demás son nuevas, entre ellas el monitoreo central de eventos, un inventario de la nube que se pueda auditar y la gestión centralizada de DNS.

## Cloud Workloads: menos prácticas, la misma cobertura

Cloud Workloads quedó con 216 prácticas, 91 menos que antes. AWS aclara que no se perdió cobertura técnica, y la reducción sale de tres cosas:

1. Lo que aplicaba a todo el entorno se fue para Cloud Foundations.
2. Las prácticas que decían casi lo mismo se unieron en una.
3. Las prácticas que no eran técnicas se retiraron (más abajo te cuento cuáles).

En las dos áreas las prácticas ahora se agrupan en **capacidades**: grupos de prácticas relacionadas que persiguen el mismo objetivo.

## Qué cambió en cada pilar

| Pilar | Qué se fue a Foundations | Qué hay de nuevo en Workloads |
|---|---|---|
| Excelencia operativa | Nada | Capacidades que siguen el ciclo de operación (observar, sacar conclusiones, cambios, despliegue, soporte, respuesta). Práctica nueva para controlar los cambios en dependencias externas. Más guía para usar asistentes y agentes de IA en telemetría, tableros e incidentes, siempre con una persona responsable |
| Seguridad | Protección de la cuenta root, mecanismos de inicio de sesión, barreras de permisos, acceso de emergencia, logs centrales y preparación forense | Gestión central de permisos del workload, métricas y tableros de detección, y guías de **código seguro** |
| Fiabilidad | Asignación de subredes, topologías hub-and-spoke y rangos que no se traslapan, unidos en una sola práctica de estrategia de red | **Ciberresiliencia de los backups**: protegerlos contra ransomware y otras amenazas |
| Eficiencia del rendimiento | Políticas y arquitecturas de referencia | La selección de arquitectura se centra en validar requisitos y seguirlos con KPIs. Se unieron prácticas como configuración y selección de cómputo |
| Optimización de costos | Estructura de cuentas, atribución de costos, herramientas de facturación y controles de costo | Una sola práctica de ciclo de vida de recursos y una nueva sobre **IA generativa para operar más eficiente** |
| Sostenibilidad | Nada | Capacidades nuevas para medir, aprovisionar y optimizar. Práctica nueva para usar el método de cómputo más eficiente, por ejemplo un modelo de ML más pequeño si cumple. Métricas de eficiencia combinadas con datos de emisiones de carbono |

Si trabajas en redes, fíjate en Fiabilidad: el direccionamiento IP y la topología hub-and-spoke dejaron de ser preguntas de cada workload y ahora son una decisión de toda la organización. Tiene sentido, porque nadie diseña el plan de direcciones por aplicación.

## Lo que se fue: estrategia, personas y procesos

Esta versión se enfoca en la arquitectura técnica. AWS retiró las prácticas que dependen del criterio humano y del contexto del negocio, como la estrategia, la gente y los procesos de la organización, porque no se pueden comprobar mirando la configuración o la telemetría. Esos temas siguen cubiertos en otros recursos de AWS.

La razón es interesante. Cada vez más equipos usan agentes de IA para hacer revisiones, y un agente puede comprobar una práctica técnica contra cómo está construido tu entorno. Lo que no puede es juzgar si tu cultura de equipo es buena. Por eso ahora **cada práctica es una decisión técnica** que tú, o un agente que trabaje por ti, puede revisar y corregir.

## Qué significa para ti

**Si haces revisiones Well-Architected:** empieza por separar quién responde qué. Las preguntas de Cloud Foundations las responde el equipo de plataforma una vez, y las revisiones de cada aplicación se vuelven más cortas.

**Si tienes una landing zone (con Control Tower o hecha a mano):** Cloud Foundations es tu nueva lista de chequeo. Compara tus siete capacidades contra la guía y anota los huecos.

**Si estás estudiando para una certificación:** los seis pilares siguen siendo los mismos, así que lo que aprendiste sigue sirviendo. Los exámenes y los cursos no se actualizan de un día para otro: por un tiempo vas a ver preguntas y material con la organización anterior. Aprende los pilares como siempre y ten presente que ahora existe esta división.

**Si lees en español:** AWS anunció que el Framework actualizado va a estar pronto en 11 idiomas, incluido el español.

## Fuentes

- [Announcing updates to the AWS Well-Architected Framework](https://aws.amazon.com/blogs/architecture/announcing-updates-to-the-aws-well-architected-framework-3/) (AWS Architecture Blog)
- [Release notes del Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/release-notes.html)
- [Cloud Foundations](https://docs.aws.amazon.com/wellarchitected/latest/framework/cloud-foundations.html)

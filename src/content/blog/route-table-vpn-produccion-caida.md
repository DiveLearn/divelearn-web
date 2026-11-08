---
title: "Me fui al gym y volví con producción caída: la tabla de enrutamiento que no asocié"
description: "Una historia real de VPN, route tables y lo silencioso que puede ser un error de red en AWS."
date: 2026-01-22
tags: ["redes", "vpc", "incidentes"]
draft: true
---

La tarea: montar una VPN site-to-site hacia un proveedor externo. Mi plan: cambio rápido a las 4 de la mañana, prueba, y al gym.

Modifiqué las route tables, verifiqué conectividad y todo funcionaba. Me fui a entrenar.

30 minutos después: llamadas, mensajes, WhatsApps, correo explotado. "Producción caída."

Volví corriendo, literal, sudada y todo.

## Lo que revisé

- Túneles de la VPN: arriba.
- Security Groups: bien.
- NACLs: bien.
- Logs: sin errores.

Nada tenía sentido. Hasta que entré a la reunión de emergencia con los directivos. Todos hombres, todos preguntando qué pasó, y yo en pantalla compartida revisando todo otra vez. Y ahí, frente a 8 personas esperando explicaciones, lo vi: una subred sin la tabla de enrutamiento asociada.

Clic. Asocié la route table. "Revisen ahora." Un minuto después, todo arriba. El silencio en esa reunión fue incómodo.

<figure data-arq="vpn-route" data-titulo="La VPN estaba arriba y todo se veía bien, pero sin la tabla asociada, el tráfico no tenía por dónde salir."></figure>

## La lección

El networking en AWS es como armar un rompecabezas. Puedes tener todas las piezas correctas, la conectividad funcionando y pasar todas las pruebas. Pero si no asocias la tabla a la subred correcta, nada funciona.

Lo peor: los logs no te dicen "oye, olvidaste asociar la tabla". Simplemente hay silencio.

Una subred que no tiene una tabla asociada de forma explícita usa la tabla principal de la VPC. Si la tuya tenía rutas distintas, el tráfico deja de ir a donde creías, y nada marca error.

## Desde ese día

- Checklist antes de irme, incluso al gym.
- Verifico asociaciones, no solo configuraciones.
- Los cambios críticos van en modo avión hasta confirmar.
- Monitoreo activo los primeros 15 minutos después del cambio.

## Para quienes trabajan con redes en AWS

- Route table existente no es lo mismo que route table asociada.
- "Todo funciona" en las pruebas no es lo mismo que "todo está bien configurado".
- El error más silencioso es el que no aparece en los logs.
- Y sí, ahora hago los cambios críticos después del gym.

Para practicar estos temas, entra a la [Inmersión ANS-C01](/inmersion-ans-c01/).

---
title: "Serverless vs EC2: qué cambia con Lambda Managed Instances"
description: "Lambda ya puede correr en instancias EC2 que tú eliges. Qué ganas, qué sigue costando y cuándo vale la pena."
date: 2025-12-04
tags: ["lambda", "ec2", "serverless", "costos"]
image: "/img/blog/lambda-managed-instances.jpg"
imageAlt: "Infografía: Lambda Managed Instances como puente entre EC2 y Serverless"
---

Durante años los arquitectos cloud vivimos con un compromiso difícil: elegir la agilidad de Lambda o la rentabilidad de EC2.

Si querías hardware específico, te tocaba gestionar servidores. Si querías serverless, renunciabas a optimizar costos a gran escala.

Lambda Managed Instances achica mucho esa distancia. Tus funciones corren en instancias EC2 de tu cuenta, y AWS se encarga de la operación.

[![Infografía de Lambda Managed Instances: un puente entre EC2 y Serverless con libertad de hardware, ahorro, arranque inmediato y operaciones a cargo de AWS](/img/blog/lambda-managed-instances.jpg)](/img/blog/lambda-managed-instances.jpg)

Una aclaración sobre la infografía: dice "latencia cero" y "ya no hay límites". Lo preciso es lo que explico abajo: sin cold starts, y con las condiciones de costo y de tipo de carga que siguen aplicando.

## Los 4 puntos que cambian tu arquitectura

**1. Eliges el hardware.** Puedes ejecutar funciones en familias de instancias específicas, incluidas las Graviton4 y las optimizadas para memoria.

**2. Descuentos de EC2 para Lambda.** Por fin puedes aplicar Compute Savings Plans y Reserved Instances a tus funciones.

**3. Sin cold starts.** Las peticiones llegan a entornos que ya están levantados. Eso no significa latencia cero: significa que desaparece la espera de inicialización.

**4. Tú eliges la potencia, pero no operas la máquina.** AWS sigue encargándose del aprovisionamiento, el escalado, los parches y el ciclo de vida.

Y el dato clave: **soporta multi-concurrencia**. Un solo entorno de ejecución procesa varias peticiones al tiempo, y ahí es donde se aprovechan de verdad los recursos.

<figure data-arq="lambda-managed-instances" data-titulo="Sigues desplegando una función Lambda, pero corre en instancias EC2 de tu VPC. El capacity provider le dice a AWS cuáles usar."></figure>

## Antes de migrar, haz las cuentas

No todo es ganancia, y esto es lo que yo miraría primero:

- **Hay un cargo de gestión del 15 %** sobre el precio on-demand de la instancia, más $0,20 por millón de peticiones.
- **Los descuentos solo aplican a la parte de EC2**, no a ese cargo de gestión.
- **Pagas por las instancias aprovisionadas**, no por la duración de cada petición. Por eso AWS lo recomienda para cargas estables y de alto volumen. Si tu tráfico es esporádico, Lambda normal te sigue saliendo mejor.
- **La multi-concurrencia te cambia el código.** Si tu función guarda estado compartido entre peticiones, revísala antes de moverla.

## Qué cambia en la forma de programar

Con Lambda normal, cada entorno atiende una petición a la vez. Con Managed Instances, un mismo entorno atiende varias al mismo tiempo, y eso tiene consecuencias:

- **Variables globales:** lo que guardes ahí lo comparten las peticiones que corren a la vez.
- **Archivos en `/tmp`:** usa nombres únicos por petición para que no se pisen.
- **Conexiones a bases de datos:** dimensiona el pool pensando en la concurrencia real.
- **Memoria y CPU:** eliges la instancia y la relación entre memoria y CPU, en familias como C, M y R.

## Cuándo elegir cada opción

| Tu carga | Mi primera opción |
|---|---|
| Tráfico esporádico o con picos impredecibles | Lambda normal |
| Volumen alto y estable, con funciones que esperan mucho I/O | Lambda Managed Instances |
| Necesitas memoria grande o una familia de instancia concreta | Lambda Managed Instances |
| Control total del sistema operativo | EC2 o contenedores |

Y si te llegó el rumor de que ahora Lambda dura 90 minutos, aquí expliqué [la letra pequeña](/blog/lambda-90-minutos/).

Para comparar tu caso, AWS tiene una [calculadora en la documentación](https://docs.aws.amazon.com/lambda/latest/dg/lambda-managed-instances.html).

¿Quieres que te avise cuando salga el próximo? [Únete a la lista](/lista/).

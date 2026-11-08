---
title: "EBS Multi-Attach vs EFS: cuándo compartir disco y cuándo compartir archivos"
description: "La regla que AWS rompió en 2020, la letra pequeña que te puede corromper los datos y cómo elegir entre los dos."
date: 2026-01-24
tags: ["almacenamiento", "ebs", "efs"]
image: "/img/blog/ebs-multi-attach.jpg"
imageAlt: "Infografía: EBS Multi-Attach, rompiendo la regla de oro"
---

Durante años, AWS nos hizo creer en una regla de oro inquebrantable: 1 volumen EBS, 1 instancia EC2. Punto.

Pero en febrero de 2020 rompieron sus propias reglas, y casi nadie se enteró. Me topé con esto estudiando para mi certificación de Security Specialty: puedes conectar el mismo volumen EBS a varias instancias, al mismo tiempo.

[![Infografía de EBS Multi-Attach: antes y después de 2020, la letra pequeña, el peligro del sistema de archivos y el resumen visual](/img/blog/ebs-multi-attach.jpg)](/img/blog/ebs-multi-attach.jpg)

## La letra pequeña (y es crítica)

- Solo en volúmenes Provisioned IOPS: io1 e io2.
- Solo instancias construidas sobre el sistema Nitro.
- Todas en la misma zona de disponibilidad.
- Máximo 16 instancias por volumen.
- No sirve como volumen de arranque.
- En Linux funciona con io1 e io2. En Windows, solo con io2.

## El peligro que nadie te cuenta

Si usas un sistema de archivos estándar, como ext4 o XFS, con Multi-Attach, te expones a corrupción o pérdida de datos. Esos sistemas no saben compartir: no coordinan bloqueos, cachés ni escrituras entre máquinas.

La solución es un sistema de archivos con soporte de clúster, como GFS2, o aplicaciones de clúster que controlen el orden de escritura.

<figure data-arq="ebs-efs" data-titulo="EBS Multi-Attach comparte bloques dentro de una sola zona, y necesita quien coordine. EFS comparte archivos entre zonas, y lo resuelve por ti."></figure>

## Entonces, ¿cuál es la diferencia con EFS?

Después de contar esto, varios me preguntaron justo eso. Y la respuesta cambió mi forma de entender el almacenamiento en AWS.

**EBS Multi-Attach es el pizarrón compartido de la escuela.** Varios profesores pueden usarlo, pero necesitan un moderador para no chocar. Si dos escriben al mismo tiempo sin coordinarse: caos total.

**EFS es la carpeta compartida.** Todos trabajan sobre los mismos archivos y el servicio se encarga del acceso concurrente con NFS.

[![Infografía: batalla de almacenamiento compartido entre EBS Multi-Attach y EFS](/img/blog/ebs-vs-efs.jpg)](/img/blog/ebs-vs-efs.jpg)

| | EBS Multi-Attach | EFS |
|---|---|---|
| Tipo de dato | Bloques, de bajo nivel | Archivos, gestionado y elástico |
| Protocolo | NVMe | NFS |
| Zonas | Una sola: si cae la AZ, pierdes acceso | Varias, resiliente por diseño |
| Sistema operativo | Linux y Windows, según el volumen | Solo Linux (para Windows, FSx) |
| Complejidad | Alta: sistema de archivos de clúster | Baja: montar y usar |
| Costo | Pagas por el volumen y sus IOPS | Pagas por lo que usas |

## El factor decisivo

**Usa EBS Multi-Attach si:**

- Necesitas latencia extremadamente baja a nivel de bloque.
- Tienes una base de datos o aplicación en clúster diseñada para esto.
- Todas las instancias están en la misma zona.

**Usa EFS si:**

- Necesitas disco compartido para web, como WordPress o Drupal.
- Los archivos deben sobrevivir a la caída de una zona.
- Son cientos o miles de instancias o funciones Lambda a la vez.
- No te quieres complicar.

## En una frase

EBS Multi-Attach es para aplicaciones en clúster que necesitan velocidad bruta en una zona. EFS es para compartir archivos de forma sencilla y resiliente entre muchas máquinas.

La documentación con todas las condiciones está [aquí](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volumes-multi.html). ¿Cuántas otras funciones están escondidas a plena vista? Si quieres que te las siga contando, [únete a la lista](/lista/).

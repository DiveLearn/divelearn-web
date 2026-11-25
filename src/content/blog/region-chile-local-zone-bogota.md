---
title: "AWS llega a Chile y a Colombia: una región y una Local Zone no son lo mismo"
description: "En noviembre de 2026 AWS abrió su región de Chile para los primeros clientes y una Local Zone en Bogotá. Qué trae cada una, en qué se diferencian y qué significa si estudias o trabajas en la nube."
date: 2026-11-25
tags: ["fundamentos", "infraestructura-global", "novedades"]
image: "/img/blog/region-vs-local-zone.jpg"
imageAlt: "Sketchnote: Región vs Local Zone, Chile como región completa y Bogotá como Local Zone que depende de N. Virginia"
---

Noviembre de 2026 trajo dos noticias de AWS para Latinoamérica, con pocos días de diferencia. La región de Chile empezó a operar para sus primeros clientes y se abrió una Local Zone en Bogotá. Las dos acercan la nube a la región, pero no son lo mismo, y entender la diferencia es justo lo que te preguntan en el examen.

[![Sketchnote que compara la región de Chile con la Local Zone de Bogotá](/img/blog/region-vs-local-zone.jpg)](/img/blog/region-vs-local-zone.jpg)

## El cambio en una frase

Chile tiene ahora una región completa e independiente. Colombia tiene una Local Zone: un pedazo de infraestructura en Bogotá que depende de la región de N. Virginia.

## Región South America (Chile)

AWS confirmó que la región de Chile ya opera en **acceso anticipado**, es decir, solo para un grupo de clientes seleccionados. La disponibilidad para todos se espera en las próximas semanas, antes de que termine 2026. AWS no ha dado una fecha exacta.

| Qué | Detalle |
|---|---|
| Estado | Acceso anticipado; abre para todos antes de fin de 2026 |
| Zonas de disponibilidad | Tres |
| Servicios al inicio | Cómputo, almacenamiento, red y bases de datos |
| IA | Amazon Bedrock y SageMaker AI llegan durante el primer año |
| Inversión | Más de 4.000 millones de dólares en Chile |
| Primeros clientes | BancoEstado, BTG, Cencosud, Consorcio, Itaú y Ripley |

Es la tercera región de AWS en Latinoamérica, después de São Paulo y México.

## Local Zone de Bogotá

El 20 de noviembre de 2026 AWS anunció la disponibilidad general de una Local Zone en Bogotá. Su región padre es US East (N. Virginia), o sea `us-east-1`.

| Qué | Detalle |
|---|---|
| Estado | Disponible para todos (GA) |
| Región padre | US East (N. Virginia) |
| Cómputo | EC2 C7i, M7i y R7i (On-Demand, Spot y Savings Plans), ECS y EKS |
| Almacenamiento | S3 One Zone-Infrequent Access y EBS Local Snapshots |
| Red y gestión | VPC, Elastic Load Balancing, Auto Scaling, Shield, Systems Manager, CloudWatch, CloudTrail y CloudFormation |
| Latencia | De un dígito en milisegundos para usuarios en Colombia |
| Clientes citados | Bancolombia, Datacenter Colombia (Grupo Gelsa) y Casa Toro |

Para usarla tienes que activarla en tu cuenta (desde AWS Global View) y crear una subred de la Local Zone dentro de una VPC de N. Virginia. Las instancias quedan corriendo en Bogotá, pero el plano de control y los servicios que no están en la Local Zone siguen en Virginia.

## Región, zona de disponibilidad y Local Zone

| | Región | Zona de disponibilidad | Local Zone |
|---|---|---|---|
| Qué es | Un área geográfica con varias zonas de disponibilidad aisladas | Uno o más centros de datos dentro de una región | Una extensión de una región, ubicada cerca de los usuarios |
| Servicios | Casi todo el catálogo | Los de su región | Un grupo reducido (cómputo, almacenamiento, red) |
| Funciona sola | Sí | No, es parte de su región | No, depende de su región padre |
| Para qué se elige | Alta disponibilidad, datos en el país, catálogo completo | Tolerancia a fallos dentro de una región | Latencia muy baja en una ciudad específica |
| Ejemplo | Chile | Cada una de las tres de Chile | Bogotá, colgando de `us-east-1` |

Y para no confundirla con otras piezas de la infraestructura global: **CloudFront** acerca contenido con caché en ubicaciones de borde (Bogotá tiene desde 2019), y **Outposts** lleva hardware de AWS a tu propio centro de datos (llegó a Colombia en 2021).

¿Quieres verlo en el mapa? En el [mapa interactivo de AWS](/recursos/mapa-aws/) están todas las regiones, zonas de disponibilidad, Local Zones y edge locations del mundo. Busca Bogotá y vas a ver de qué región cuelga.

## Qué significa para ti

**Si estudias para el Cloud Practitioner o el Solutions Architect:** la infraestructura global entra en los dos exámenes. Ahora tienes ejemplos cercanos: si te preguntan qué usar para darle latencia de milisegundos a usuarios en una ciudad sin región, la respuesta es Local Zone; si te preguntan por alta disponibilidad con varias zonas dentro del país, es una región.

**Si trabajas en Chile:** cuando la región abra para todos, vas a poder tener cargas completas en el país, con tres zonas de disponibilidad. Revisa qué servicios usas, porque al principio el catálogo es más corto que el de las regiones grandes, y la IA llega después.

**Si trabajas en Colombia:** la Local Zone sirve para lo que necesita estar cerca de los usuarios, como aplicaciones que no aguantan esperar o datos que se tienen que procesar en el país. Recuerda que el plano de control y los servicios que no están en la Local Zone siguen en Virginia, así que una caída de la conexión con la región padre te afecta.

## Fuentes

- [AWS to launch first cloud infrastructure region in Chile](https://www.aboutamazon.com/news/aws/aws-south-america-chile-region-launch) (About Amazon)
- [Coming soon: AWS South America (Chile) Region](https://aws.amazon.com/blogs/aws/coming-soon-aws-south-america-chile-region/) (AWS News Blog)
- [Now open: AWS Local Zones in Bogotá, Colombia](https://aws.amazon.com/blogs/infrastructure-sustainability/now-open-aws-local-zones-in-bogota-colombia) (AWS Blog)
- [Ubicaciones de las Local Zones](https://aws.amazon.com/about-aws/global-infrastructure/localzones/locations/)

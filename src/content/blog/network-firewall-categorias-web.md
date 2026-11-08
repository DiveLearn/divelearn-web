---
title: "AWS Network Firewall ahora filtra por categorías: adiós a las listas de dominios"
description: "Cómo controlar la IA generativa no autorizada con categorías administradas por AWS, con y sin inspección TLS."
date: 2026-01-29
tags: ["seguridad", "redes", "ia"]
image: "/img/blog/network-firewall.jpg"
imageAlt: "Infografía: AWS Network Firewall, categorías web"
---

Tu dev pega código sensible en un chat de IA. Propiedad intelectual afuera, sin control y sin visibilidad. Esto es Shadow AI y pasa hoy en tu empresa.

AWS Network Firewall lanzó el filtrado por categorías, y cambia la forma de atacar el problema.

[![Infografía: el riesgo de Shadow AI y cómo Network Firewall filtra por categorías con y sin inspección TLS](/img/blog/network-firewall.jpg)](/img/blog/network-firewall.jpg)

## Antes y ahora

**Antes:** listas interminables de dominios, mantenidas a mano y siempre atrasadas.

**Ahora:** eliges categorías como Artificial Intelligence and Machine Learning, Social Networking o Gambling, y AWS las mantiene actualizadas. No tienes que tocar la política cuando aparece un dominio nuevo.

## Cómo funciona

Hay dos palabras clave en las reglas tipo Suricata, y la diferencia importa:

| | `aws_domain_category` | `aws_url_category` |
|---|---|---|
| Qué evalúa | Solo el dominio | La URL completa |
| Con HTTPS usa | El SNI del handshake | Requiere inspección TLS |
| ¿Descifra? | No | Sí, en HTTPS |

Sin inspección TLS ves el dominio. Con inspección TLS ves la ruta completa y puedes filtrar de forma quirúrgica.

## La arquitectura típica

<figure data-arq="network-firewall" data-titulo="Las VPC salen a internet por una VPC de inspección central. El tráfico a tu IA aprobada pasa, y el de la categoría no autorizada se queda en el firewall."></figure>

Una Inspection VPC detrás de Transit Gateway, con el firewall y las reglas por categoría antes de salir a internet.

Un detalle: la categoría de IA no distingue qué herramientas aprobó tu empresa y cuáles no. Por eso primero defines una regla de permitir para las tuyas, y después bloqueas la categoría.

## Cuándo usarlo

**Sí:** varias VPC con salida a internet, cumplimiento regulatorio como en finanzas o salud, o cuando Shadow AI es un riesgo real.

**Probablemente no:** una startup pequeña o tráfico bajo, porque pagas por endpoint y por volumen procesado. Ahí puede ser más de lo que necesitas.

## Por dónde empezar

1. Audita tus registros de red para ver qué dominios salen hoy.
2. Define la política de IA generativa de tu empresa. Sin esto, el firewall no tiene qué hacer cumplir.
3. Activa las categorías en modo alerta durante una semana.
4. Bloquea según lo que hayas visto.

## La idea de fondo

AWS convirtió la seguridad del firewall de un problema operativo en una decisión de política. Ya no mantienes listas: defines intenciones.

La guía oficial está en el [blog de seguridad de AWS](https://aws.amazon.com/blogs/security/simplifying-policy-management-with-url-and-domain-category-filtering-on-aws-network-firewall/). Si las redes te apasionan, date una vuelta por la [Inmersión ANS-C01](/inmersion-ans-c01/).

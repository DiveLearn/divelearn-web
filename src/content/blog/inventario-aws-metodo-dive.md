---
title: "¿Qué tenemos en AWS? El método DIVE para inventariar una organización con IA"
description: "Cómo hacer el inventario de muchas cuentas y regiones con IA sin darle acceso a producción a algo que puede inventar datos."
date: 2026-10-22
tags: ["gobierno", "finops", "ia", "organizations"]
image: "/img/blog/metodo-dive.jpg"
imageAlt: "Portada: 16 cuentas, 12 regiones, 1 tarde"
---

Hace unas semanas me tocó responder una pregunta que parece simple: "¿Qué tenemos en AWS?"

Era una organización con muchas cuentas, repartidas en muchas regiones. Mucho de eso lo montó gente que ya no estaba, y la documentación tenía dos años.

La tentación era obvia: darle acceso a una IA y pedirle "hazme el inventario". Pero yo no le doy acceso a producción a algo que puede inventar datos.

Así que armé un método con cuatro reglas, le puse nombre, y lo conté en el AWS Community Day Spain 2026 en Santiago de Compostela con la charla "16 cuentas, 12 regiones, 1 tarde".

<figure data-arq="metodo-dive" data-titulo="Las cuatro fases del método: la factura dice dónde mirar, un rol de solo lectura trae los datos, se cruza lo que pagas con lo que existe y sale un reporte."></figure>

## D: Descubrir

Empecé por la factura, no por la consola. Si un servicio no aparece en el billing de los últimos 6 meses, no hay nada que escanear ahí.

[![La factura es el primer mapa: solo se escanea el 2,6 % de las combinaciones posibles](/img/blog/metodo-dive-factura.jpg)](/img/blog/metodo-dive-factura.jpg)

Con eso, de todas las combinaciones de cuenta, región y servicio, solo tuve que revisar el 2,6 %. Menos llamadas, menos throttling y ninguna llamada de más a producción.

## I: Inventariar

Las APIs de AWS, con un rol de solo lectura de metadatos. Puede ver que existe un secreto, nunca leer su valor. Los colectores escriben JSON, y cada fase lee esos JSON, así que todo lo que aparece en el resultado vino de AWS.

## V: Validar

Crucé lo que pago contra lo que existe. Lo que pagas y no aparece, o lo que aparece y no pagas: ahí están las sorpresas. En la demo de la charla salieron 388 hallazgos en 19 segundos.

## E: Esquematizar

Diagramas de draw.io y un reporte HTML que cualquiera del equipo puede abrir sin internet.

## Lo que aprendí en el camino

- **La IA es buenísima escribiendo los colectores y analizando resultados.** Pero los datos tienen que venir de AWS, no de ella.
- **"Soy admin" no significa que el agente deba serlo.** Usa tu identidad, no tus permisos: aunque seas admin, el escaneo corre en solo lectura.
- **Entre cada fase, una persona revisa.** El checkpoint humano no es burocracia, es lo que te deja dormir tranquila.
- **Si vas a mostrar resultados, anonimiza.** El repo trae un anonimizador con verificador para enseñar el trabajo sin exponer a nadie.

Lo que antes eran semanas de consola en consola, ahora es una tarde.

## Pruébalo

El código es abierto: [github.com/mar31tech/metodo-dive](https://github.com/mar31tech/metodo-dive). Trae el permission set, los colectores, los prompts de cada fase, 90 tests que no llaman a AWS y una organización de ejemplo sintética para probarlo sin tocar nada real.

Si heredaste una cuenta de AWS y no sabes por dónde empezar, también te puede servir entender primero [cómo funcionan las políticas de IAM](/blog/politicas-iam/).

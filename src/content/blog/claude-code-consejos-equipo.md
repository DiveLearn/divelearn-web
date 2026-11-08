---
title: "El hilo que me hizo repensar cómo uso Claude Code"
description: "Los consejos que comparte el equipo que construyó la herramienta, y lo que decidí cambiar en mi forma de trabajar."
date: 2026-02-02
tags: ["ia", "herramientas", "productividad"]
image: "/img/blog/claude-code.jpg"
imageAlt: "Infografía: Claude Code, 10 consejos pro"
---

Vi un hilo de Boris Cherny, product lead de Claude Code, compartiendo 10 consejos que el equipo de Anthropic usa internamente. Me di cuenta de que llevaba meses usando la herramienta al 30 % de su capacidad.

Hice una infografía para procesarlo, y esto fue lo que más me voló la cabeza.

[![Infografía con los 10 consejos: flujo paralelo, plan mode, CLAUDE.md, skills, bugs, prompting, terminal, subagentes, datos y aprendizaje](/img/blog/claude-code.jpg)](/img/blog/claude-code.jpg)

## Trabajar en paralelo

El equipo trabaja con 3 a 5 git worktrees simultáneos, cada uno con su propia sesión. Tienen alias de shell para saltar entre ellos con una tecla, y worktrees dedicados solo a análisis de logs y BigQuery.

## Plan mode

"Start every complex task in plan mode." Cuando algo se tuerce, vuelven a plan mode en lugar de seguir empujando. El truco: meter toda la energía en el plan para que la implementación salga de una.

## CLAUDE.md como memoria

Después de cada corrección: "Update your CLAUDE.md so you don't make that mistake again". Un ingeniero hace que Claude mantenga notas por tarea o proyecto, actualizadas después de cada PR.

## Skills personalizadas

"If you do something more than once a day, turn it into a skill." El equipo tiene un comando `/techdebt` al final de cada sesión para matar código duplicado, skills que sincronizan varios días de Slack, Drive, Asana y GitHub, y agentes que escriben modelos de dbt, revisan código y prueban en dev.

## Bugs sin micromanagement

Conectar Slack por MCP, pegar el hilo del bug y decir "fix". O "Go fix the failing CI tests", sin decirle cómo. Apuntarlo a los logs de Docker funciona sorprendentemente bien.

## Prompts que suben el nivel

- "Grill me on these changes and don't make a PR until I pass your test."
- "Prove to me this works", con un diff entre main y la rama.
- "Knowing everything you know now, scrap this and implement the elegant solution."

## El resto de consejos

- **Terminal:** `/statusline` para ver el uso de contexto y la rama, y dictado por voz, porque hablas mucho más rápido de lo que escribes.
- **Subagentes:** para problemas que necesitan más cómputo, manteniendo limpio el contexto principal.
- **Datos:** Boris dice que lleva más de 6 meses sin escribir una línea de SQL, con una skill de BigQuery y la CLI.
- **Aprender:** activar el estilo "Explanatory" en `/config` y pedir presentaciones HTML, diagramas ASCII o repetición espaciada.

## Lo que decidí implementar

1. Configurar 3 git worktrees.
2. Crear una skill para troubleshooting de AWS.
3. Actualizar mi CLAUDE.md.
4. Probar el dictado por voz.

## La reflexión

El equipo que construyó la herramienta la usa diferente, con flujos que la aprovechan de verdad. Y eso me dejó una pregunta incómoda: ¿cuántas otras herramientas estoy usando al 30 %?

Estos consejos son de febrero de 2026, y el producto cambia rápido, así que revisa los comandos en la documentación actual. El [hilo original está aquí](https://lnkd.in/eRp7XaJm).

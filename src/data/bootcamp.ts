// Mapa del Bootcamp: cada zona es una profundidad y cada módulo un nivel.
// El orden de este archivo es el orden del juego.

export interface Modulo {
  n: number;
  icono: string;
  titulo: string;
  tema: string;
  actividades: number;
  xp: number;
}

export interface Zona {
  id: string;
  nombre: string;
  metros: string;
  lema: string;
  modulos: Modulo[];
}

export const zonas: Zona[] = [
  {
    id: "superficie",
    nombre: "Superficie",
    metros: "0 – 10 m",
    lema: "Cómo se conecta el mundo",
    modulos: [
      { n: 0, icono: "🌐", titulo: "Cómo funciona Internet", tema: "Qué pasa entre tu navegador y un servidor", actividades: 2, xp: 100 },
      { n: 1, icono: "🛣️", titulo: "Las carreteras digitales", tema: "Redes: velocidad, latencia y rutas", actividades: 9, xp: 200 },
    ],
  },
  {
    id: "arrecife",
    nombre: "Arrecife",
    metros: "10 – 40 m",
    lema: "Direcciones, nombres y guardianes",
    modulos: [
      { n: 2, icono: "🏘️", titulo: "Las direcciones secretas", tema: "Direccionamiento IP y subredes", actividades: 5, xp: 200 },
      { n: 3, icono: "📖", titulo: "La guía telefónica digital", tema: "DNS: de nombres a direcciones", actividades: 4, xp: 200 },
      { n: 4, icono: "🛡️", titulo: "Los guardianes digitales", tema: "Seguridad: cifrado, certificados, firewalls y VPN", actividades: 5, xp: 250 },
    ],
  },
  {
    id: "profundidad",
    nombre: "Profundidad",
    metros: "40 – 100 m",
    lema: "Dentro del servidor",
    modulos: [
      { n: 5, icono: "🐧", titulo: "El sistema operativo del servidor", tema: "Linux: terminal, permisos, SSH y scripts", actividades: 5, xp: 250 },
      { n: 6, icono: "📦", titulo: "Cajas dentro de cajas", tema: "Virtualización y contenedores", actividades: 4, xp: 250 },
    ],
  },
  {
    id: "abismo",
    nombre: "Abismo",
    metros: "100 m +",
    lema: "Datos que no se pierden",
    modulos: [
      { n: 7, icono: "🗄️", titulo: "Dónde guardar las cosas", tema: "Almacenamiento y bases de datos", actividades: 4, xp: 300 },
      { n: 8, icono: "🛟", titulo: "Proteger lo importante", tema: "Backup, RTO/RPO y recuperación de desastres", actividades: 4, xp: 350 },
    ],
  },
];

// Rangos de buzo según la XP acumulada (total del bootcamp: 2.100 XP).
export const rangos = [
  { xp: 0, nombre: "Snorkel" },
  { xp: 300, nombre: "Buzo en aguas abiertas" },
  { xp: 900, nombre: "Buzo de arrecife" },
  { xp: 1400, nombre: "Buzo de profundidad" },
  { xp: 2100, nombre: "Explorador del abismo" },
];

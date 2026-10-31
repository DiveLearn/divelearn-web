// Bootcamp = la escuela de buceo: lo que aprendes en tierra y en la piscina antes de meterte al océano.
// La profundidad (Superficie → Abismo) queda para las certificaciones de AWS.
// El orden de este archivo es el orden del juego. `icono` es un ícono duotono de Phosphor.

export interface Modulo {
  n: number;
  icono: string;
  titulo: string;
  tema: string;
  actividades: number;
  xp: number;
}

export interface Etapa {
  id: string;
  icono: string;
  nombre: string;
  lema: string;
  modulos: Modulo[];
}

export const etapas: Etapa[] = [
  {
    id: "playa",
    icono: "compass",
    nombre: "En la playa",
    lema: "Teoría en tierra: cómo se conecta el mundo",
    modulos: [
      { n: 0, icono: "globe-hemisphere-west", titulo: "Cómo funciona Internet", tema: "Qué pasa entre tu navegador y un servidor", actividades: 2, xp: 100 },
      { n: 1, icono: "path", titulo: "Las carreteras digitales", tema: "Redes: velocidad, latencia y rutas", actividades: 9, xp: 200 },
    ],
  },
  {
    id: "equipo",
    icono: "anchor",
    nombre: "Revisión del equipo",
    lema: "Direcciones, nombres y seguridad antes de entrar al agua",
    modulos: [
      { n: 2, icono: "map-pin-area", titulo: "Las direcciones secretas", tema: "Direccionamiento IP y subredes", actividades: 5, xp: 200 },
      { n: 3, icono: "address-book", titulo: "La guía telefónica digital", tema: "DNS: de nombres a direcciones", actividades: 4, xp: 200 },
      { n: 4, icono: "shield-check", titulo: "Los guardianes digitales", tema: "Seguridad: cifrado, certificados, firewalls y VPN", actividades: 5, xp: 250 },
    ],
  },
  {
    id: "piscina",
    icono: "terminal-window",
    nombre: "La piscina",
    lema: "Práctica en aguas tranquilas: dentro del servidor",
    modulos: [
      { n: 5, icono: "terminal-window", titulo: "El sistema operativo del servidor", tema: "Linux: terminal, permisos, SSH y scripts", actividades: 5, xp: 250 },
      { n: 6, icono: "cube", titulo: "Cajas dentro de cajas", tema: "Virtualización y contenedores", actividades: 4, xp: 250 },
    ],
  },
  {
    id: "practica",
    icono: "lifebuoy",
    nombre: "Inmersión de práctica",
    lema: "Los datos que no se pueden perder",
    modulos: [
      { n: 7, icono: "database", titulo: "Dónde guardar las cosas", tema: "Almacenamiento y bases de datos", actividades: 4, xp: 300 },
      { n: 8, icono: "lifebuoy", titulo: "Proteger lo importante", tema: "Backup, RTO/RPO y recuperación de desastres", actividades: 4, xp: 350 },
    ],
  },
];

// Rangos según la XP acumulada (total del bootcamp: 2.100 XP).
export const rangos = [
  { xp: 0, nombre: "Aprendiz en tierra" },
  { xp: 300, nombre: "Teoría aprobada" },
  { xp: 950, nombre: "Equipo revisado" },
  { xp: 1450, nombre: "Nadador de piscina" },
  { xp: 2100, nombre: "Buzo con licencia" },
];

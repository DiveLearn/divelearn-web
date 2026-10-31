// Bootcamp = la escuela de buceo: lo que aprendes en tierra y en la piscina antes de meterte al océano.
// La profundidad (Superficie → Abismo) queda para las certificaciones de AWS.
// El orden de este archivo es el orden del juego. `icono` es un ícono duotono de Phosphor.

export interface Modulo {
  n: number;
  icono: string;
  titulo: string;
  tema: string;
  comando: string;
}

export interface Etapa {
  id: string;
  icono: string;
  color: string;
  nombre: string;
  lema: string;
  modulos: Modulo[];
}

export const etapas: Etapa[] = [
  {
    id: "playa",
    icono: "island",
    color: "#ffd36e",
    nombre: "En la playa",
    lema: "Teoría en tierra: cómo se conecta el mundo",
    modulos: [
      { n: 0, icono: "globe-hemisphere-west", titulo: "Cómo funciona Internet", tema: "Qué pasa entre tu navegador y un servidor", comando: "curl -I https://divelearn.cloud" },
      { n: 1, icono: "path", titulo: "Las carreteras digitales", tema: "Redes: velocidad, latencia y rutas", comando: "ping -c 3 divelearn.cloud" },
    ],
  },
  {
    id: "equipo",
    icono: "goggles",
    color: "#ff7a8a",
    nombre: "Revisión del equipo",
    lema: "Direcciones, nombres y seguridad antes de entrar al agua",
    modulos: [
      { n: 2, icono: "map-pin-area", titulo: "Las direcciones secretas", tema: "Direccionamiento IP y subredes", comando: "ipcalc 10.0.0.0/24" },
      { n: 3, icono: "address-book", titulo: "La guía telefónica digital", tema: "DNS: de nombres a direcciones", comando: "dig divelearn.cloud +short" },
      { n: 4, icono: "shield-check", titulo: "Los guardianes digitales", tema: "Seguridad: cifrado, certificados, firewalls y VPN", comando: "openssl s_client -connect divelearn.cloud:443" },
    ],
  },
  {
    id: "piscina",
    icono: "swimming-pool",
    color: "#7cc6fe",
    nombre: "La piscina",
    lema: "Práctica en aguas tranquilas: dentro del servidor",
    modulos: [
      { n: 5, icono: "terminal-window", titulo: "El sistema operativo del servidor", tema: "Linux: terminal, permisos, SSH y scripts", comando: "chmod 600 llave.pem && ssh buzo@servidor" },
      { n: 6, icono: "cube", titulo: "Cajas dentro de cajas", tema: "Virtualización y contenedores", comando: "docker run hello-world" },
    ],
  },
  {
    id: "practica",
    icono: "waves",
    color: "#04a8bb",
    nombre: "Inmersión de práctica",
    lema: "Los datos que no se pueden perder",
    modulos: [
      { n: 7, icono: "database", titulo: "Dónde guardar las cosas", tema: "Almacenamiento y bases de datos", comando: "SELECT * FROM buzos WHERE licencia = true;" },
      { n: 8, icono: "lifebuoy", titulo: "Proteger lo importante", tema: "Backup, RTO/RPO y recuperación de desastres", comando: "aws s3 sync ./datos s3://mi-backup" },
    ],
  },
];

// XP por página abierta. Los mismos valores usa public/js/bootcamp-progreso.js.
// Las páginas de cada módulo salen de bootcamp-paginas.json (lo genera scripts/importar-bootcamp.py).
export const XP = { actividad: 25, quiz: 50 };

// Rangos como fracción de la XP total del bootcamp: el último = todo completado.
export const rangos = [
  { parte: 0, nombre: "Aprendiz en tierra" },
  { parte: 0.15, nombre: "Teoría aprobada" },
  { parte: 0.4, nombre: "Equipo revisado" },
  { parte: 0.65, nombre: "Nadador de piscina" },
  { parte: 1, nombre: "Buzo con licencia" },
];

// Bootcamp = la escuela de buceo: lo que aprendes en tierra y en la piscina antes de meterte al océano.
// La profundidad (Superficie → Abismo) queda para las certificaciones de AWS.
// El orden de este archivo es el orden del juego. `sprite` e `insignia` son PNG pixel de public/img/sprites.

export interface Modulo {
  n: number;
  color: string;
  sprite: string;
  titulo: string;
  tema: string;
  comando: string;
}

export interface Etapa {
  id: string;
  insignia: string;
  color: string;
  nombre: string;
  lema: string;
  modulos: Modulo[];
}

export const etapas: Etapa[] = [
  {
    id: "playa",
    insignia: "insignia-playa",
    color: "#ffd36e",
    nombre: "En la playa",
    lema: "Teoría en tierra: cómo se conecta el mundo",
    modulos: [
      { n: 0, color: "#ffd36e", sprite: "mod-internet", titulo: "Cómo funciona Internet", tema: "Qué pasa entre tu navegador y un servidor", comando: "curl -I https://divelearn.cloud" },
      { n: 1, color: "#ff9f43", sprite: "mod-redes", titulo: "Las carreteras digitales", tema: "Redes: velocidad, latencia y rutas", comando: "ping -c 3 divelearn.cloud" },
    ],
  },
  {
    id: "equipo",
    insignia: "insignia-equipo",
    color: "#ff7a8a",
    nombre: "Revisión del equipo",
    lema: "Direcciones, nombres y seguridad antes de entrar al agua",
    modulos: [
      { n: 2, color: "#ff7a8a", sprite: "mod-ip", titulo: "Las direcciones secretas", tema: "Direccionamiento IP y subredes", comando: "ipcalc 10.0.0.0/24" },
      { n: 3, color: "#f49ac2", sprite: "mod-dns", titulo: "La guía telefónica digital", tema: "DNS: de nombres a direcciones", comando: "dig divelearn.cloud +short" },
      { n: 4, color: "#b39dfa", sprite: "mod-seguridad", titulo: "Los guardianes digitales", tema: "Seguridad: cifrado, certificados, firewalls y VPN", comando: "openssl s_client -connect divelearn.cloud:443" },
    ],
  },
  {
    id: "piscina",
    insignia: "insignia-piscina",
    color: "#7cc6fe",
    nombre: "La piscina",
    lema: "Práctica en aguas tranquilas: dentro del servidor",
    modulos: [
      { n: 5, color: "#7cc6fe", sprite: "mod-linux", titulo: "El sistema operativo del servidor", tema: "Linux: terminal, permisos, SSH y scripts", comando: "chmod 600 llave.pem && ssh buzo@servidor" },
      { n: 6, color: "#5fd3c6", sprite: "mod-virtualizacion", titulo: "Cajas dentro de cajas", tema: "Virtualización y contenedores", comando: "docker run hello-world" },
    ],
  },
  {
    id: "practica",
    insignia: "insignia-inmersion",
    color: "#04a8bb",
    nombre: "Inmersión de práctica",
    lema: "Los datos que no se pueden perder",
    modulos: [
      { n: 7, color: "#04a8bb", sprite: "mod-datos", titulo: "Dónde guardar las cosas", tema: "Almacenamiento y bases de datos", comando: "SELECT * FROM buzos WHERE licencia = true;" },
      { n: 8, color: "#6fd08c", sprite: "mod-backup", titulo: "Proteger lo importante", tema: "Backup, RTO/RPO y recuperación de desastres", comando: "aws s3 sync ./datos s3://mi-backup" },
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

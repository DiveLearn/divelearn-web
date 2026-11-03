// Genera src/data/infra-global.json para el mapa de infraestructura global de AWS (/recursos/mapa-aws/).
//
//   node scripts/infra-global.mjs
//
// Fuentes:
// - Regiones comerciales: catálogo de regiones del AWS CLI instalado (botocore partitions.json).
// - Local Zones, Wavelength y regiones que vienen en camino: https://ip-ranges.amazonaws.com/ip-ranges.json
//   (network_border_group), que AWS actualiza varias veces al día.
// - Coordenadas, número de zonas de disponibilidad y ciudades con edge locations: tablas de este archivo
//   (AWS no los publica en un formato que se pueda leer sin credenciales). Revisar al regenerar.
// - Puntos de tierra del globo: world-atlas (Natural Earth, dominio público).
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { geoContains } from "d3-geo";
import { feature } from "topojson-client";

// Región → [ciudad, país, lat, lon, zonas de disponibilidad]
const REGIONES = {
  "us-east-1": ["Norte de Virginia", "EE. UU.", 38.9, -77.4, 6],
  "us-east-2": ["Ohio", "EE. UU.", 40.0, -83.0, 3],
  "us-west-1": ["Norte de California", "EE. UU.", 37.4, -121.9, 3],
  "us-west-2": ["Oregón", "EE. UU.", 45.6, -121.2, 4],
  "ca-central-1": ["Montreal", "Canadá", 45.5, -73.6, 3],
  "ca-west-1": ["Calgary", "Canadá", 51.0, -114.1, 3],
  "mx-central-1": ["Querétaro", "México", 20.6, -100.4, 3],
  "sa-east-1": ["São Paulo", "Brasil", -23.5, -46.6, 3],
  "eu-west-1": ["Irlanda", "Irlanda", 53.3, -6.3, 3],
  "eu-west-2": ["Londres", "Reino Unido", 51.5, -0.1, 3],
  "eu-west-3": ["París", "Francia", 48.9, 2.4, 3],
  "eu-central-1": ["Fráncfort", "Alemania", 50.1, 8.7, 3],
  "eu-central-2": ["Zúrich", "Suiza", 47.4, 8.5, 3],
  "eu-north-1": ["Estocolmo", "Suecia", 59.3, 18.1, 3],
  "eu-south-1": ["Milán", "Italia", 45.5, 9.2, 3],
  "eu-south-2": ["Aragón", "España", 41.6, -0.9, 3],
  "il-central-1": ["Tel Aviv", "Israel", 32.1, 34.8, 3],
  "me-south-1": ["Baréin", "Baréin", 26.1, 50.6, 3],
  "me-central-1": ["Emiratos", "EAU", 25.2, 55.3, 3],
  "af-south-1": ["Ciudad del Cabo", "Sudáfrica", -33.9, 18.4, 3],
  "ap-south-1": ["Bombay", "India", 19.1, 72.9, 3],
  "ap-south-2": ["Hyderabad", "India", 17.4, 78.5, 3],
  "ap-southeast-1": ["Singapur", "Singapur", 1.35, 103.8, 3],
  "ap-southeast-2": ["Sídney", "Australia", -33.9, 151.2, 3],
  "ap-southeast-3": ["Yakarta", "Indonesia", -6.2, 106.8, 3],
  "ap-southeast-4": ["Melbourne", "Australia", -37.8, 145.0, 3],
  "ap-southeast-5": ["Malasia", "Malasia", 3.1, 101.7, 3],
  "ap-southeast-6": ["Nueva Zelanda", "Nueva Zelanda", -36.8, 174.8, 3],
  "ap-southeast-7": ["Tailandia", "Tailandia", 13.8, 100.5, 3],
  "ap-east-1": ["Hong Kong", "China", 22.3, 114.2, 3],
  "ap-east-2": ["Taipéi", "Taiwán", 25.0, 121.5, 3],
  "ap-northeast-1": ["Tokio", "Japón", 35.7, 139.7, 4],
  "ap-northeast-2": ["Seúl", "Corea del Sur", 37.6, 127.0, 4],
  "ap-northeast-3": ["Osaka", "Japón", 34.7, 135.5, 3],
  // Particiones aparte: GovCloud, China y la Nube Soberana Europea.
  "us-gov-west-1": ["GovCloud Oeste", "EE. UU.", 45.8, -119.7, 3, "gov"],
  "us-gov-east-1": ["GovCloud Este", "EE. UU.", 40.4, -82.9, 3, "gov"],
  "cn-north-1": ["Pekín", "China", 39.9, 116.4, 3, "china"],
  "cn-northwest-1": ["Ningxia", "China", 37.2, 106.2, 3, "china"],
  "eusc-de-east-1": ["Brandeburgo", "Alemania", 52.4, 13.1, 3, "soberana"],
};

// Código de aeropuerto/ciudad → [ciudad, lat, lon]. Sirve para Local Zones, Wavelength y edge locations.
const CIUDADES = {
  ams: ["Ámsterdam", 52.4, 4.9], akl: ["Auckland", -36.8, 174.8], ath: ["Atenas", 37.98, 23.7],
  atl: ["Atlanta", 33.7, -84.4], bcn: ["Barcelona", 41.4, 2.2], ber: ["Berlín", 52.5, 13.4],
  bkk: ["Bangkok", 13.8, 100.5], bna: ["Nashville", 36.2, -86.8], bog: ["Bogotá", 4.7, -74.1],
  bom: ["Bombay", 19.1, 72.9], bos: ["Boston", 42.4, -71.1], bru: ["Bruselas", 50.8, 4.4],
  bue: ["Buenos Aires", -34.6, -58.4], eze: ["Buenos Aires", -34.6, -58.4], ccu: ["Calcuta", 22.6, 88.4],
  cdg: ["París", 48.9, 2.4], chi: ["Chicago", 41.9, -87.6], ord: ["Chicago", 41.9, -87.6],
  clt: ["Charlotte", 35.2, -80.8], cph: ["Copenhague", 55.7, 12.6], cpt: ["Ciudad del Cabo", -33.9, 18.4],
  del: ["Delhi", 28.6, 77.2], den: ["Denver", 39.7, -105.0], dfw: ["Dallas", 32.8, -96.8],
  dtm: ["Dortmund", 51.5, 7.5], dtw: ["Detroit", 42.3, -83.0], dub: ["Dublín", 53.3, -6.3],
  dus: ["Düsseldorf", 51.2, 6.8], dxb: ["Dubái", 25.2, 55.3], fco: ["Roma", 41.9, 12.5],
  fra: ["Fráncfort", 50.1, 8.7], gru: ["São Paulo", -23.5, -46.6], gig: ["Río de Janeiro", -22.9, -43.2],
  ham: ["Hamburgo", 53.6, 10.0], han: ["Hanói", 21.0, 105.8], hel: ["Helsinki", 60.2, 24.9],
  hkg: ["Hong Kong", 22.3, 114.2], hnl: ["Honolulu", 21.3, -157.9], hyd: ["Hyderabad", 17.4, 78.5],
  iad: ["Washington", 38.9, -77.4], iah: ["Houston", 29.8, -95.4], icn: ["Seúl", 37.6, 127.0],
  ist: ["Estambul", 41.0, 29.0], jfk: ["Nueva York", 40.7, -74.0], jnb: ["Johannesburgo", -26.2, 28.0],
  kix: ["Osaka", 34.7, 135.5], kul: ["Kuala Lumpur", 3.1, 101.7], las: ["Las Vegas", 36.2, -115.1],
  lax: ["Los Ángeles", 34.1, -118.2], lhr: ["Londres", 51.5, -0.1], lim: ["Lima", -12.0, -77.0],
  lis: ["Lisboa", 38.7, -9.1], los: ["Lagos", 6.5, 3.4], mad: ["Madrid", 40.4, -3.7],
  man: ["Mánchester", 53.5, -2.2], maa: ["Chennai", 13.1, 80.3], mci: ["Kansas City", 39.1, -94.6],
  mct: ["Mascate", 23.6, 58.4], mel: ["Melbourne", -37.8, 145.0], mex: ["Ciudad de México", 19.4, -99.1],
  mia: ["Miami", 25.8, -80.2], mnl: ["Manila", 14.6, 121.0], msp: ["Minneapolis", 45.0, -93.3],
  muc: ["Múnich", 48.1, 11.6], mxp: ["Milán", 45.5, 9.2], nbo: ["Nairobi", -1.3, 36.8],
  nrt: ["Tokio", 35.7, 139.7], nyc: ["Nueva York", 40.7, -74.0], osl: ["Oslo", 59.9, 10.8],
  pdx: ["Portland", 45.5, -122.7], per: ["Perth", -31.95, 115.9], phl: ["Filadelfia", 40.0, -75.2],
  phx: ["Phoenix", 33.4, -112.1], prg: ["Praga", 50.1, 14.4], qro: ["Querétaro", 20.6, -100.4],
  scl: ["Santiago", -33.4, -70.6], sea: ["Seattle", 47.6, -122.3], sfo: ["San Francisco", 37.8, -122.4],
  sin: ["Singapur", 1.35, 103.8], syd: ["Sídney", -33.9, 151.2], tlv: ["Tel Aviv", 32.1, 34.8],
  tpa: ["Tampa", 27.9, -82.5], tpe: ["Taipéi", 25.0, 121.5], txl: ["Berlín", 52.5, 13.4],
  vie: ["Viena", 48.2, 16.4], was: ["Washington", 38.9, -77.0], waw: ["Varsovia", 52.2, 21.0],
  yul: ["Montreal", 45.5, -73.6], yvr: ["Vancouver", 49.3, -123.1], yyz: ["Toronto", 43.7, -79.4],
  zrh: ["Zúrich", 47.4, 8.5], arn: ["Estocolmo", 59.3, 18.1], bah: ["Baréin", 26.1, 50.6],
  blr: ["Bangalore", 13.0, 77.6], cgk: ["Yakarta", -6.2, 106.8], ccs: ["Caracas", 10.5, -66.9],
  mrs: ["Marsella", 43.3, 5.4], pmo: ["Palermo", 38.1, 13.4], sof: ["Sofía", 42.7, 23.3],
  bud: ["Budapest", 47.5, 19.0], fjr: ["Fuyaira", 25.1, 56.3],
  ruh: ["Riad", 24.7, 46.7], jed: ["Yeda", 21.5, 39.2], doh: ["Doha", 25.3, 51.5],
  sgn: ["Ciudad Ho Chi Minh", 10.8, 106.7], pek: ["Pekín", 39.9, 116.4],
  pvg: ["Shanghái", 31.2, 121.5], szx: ["Shenzhen", 22.5, 114.1], bne: ["Brisbane", -27.5, 153.0],
  hio: ["Hillsboro", 45.5, -122.9],
  uio: ["Quito", -0.2, -78.5], pty: ["Ciudad de Panamá", 9.0, -79.5],
  sju: ["San Juan", 18.4, -66.1], gva: ["Ginebra", 46.2, 6.1],
};

// Ciudades con edge locations de CloudFront (una selección de metrópolis: AWS tiene cientos de puntos).
const EDGE = [
  "atl", "bos", "chi", "dfw", "den", "iad", "iah", "jfk", "lax", "las", "mia", "msp", "phl", "phx", "pdx", "sea",
  "sfo", "hnl", "yul", "yvr", "yyz", "mex", "qro", "bog", "lim", "scl", "eze", "gru", "gig", "pty", "sju", "uio",
  "lhr", "man", "dub", "cdg", "mrs", "ams", "bru", "fra", "dus", "ham", "muc", "ber", "zrh", "gva", "vie", "prg",
  "waw", "bud", "sof", "ath", "fco", "mxp", "pmo", "mad", "bcn", "lis", "cph", "osl", "arn", "hel", "ist", "tlv",
  "dxb", "fjr", "bah", "doh", "ruh", "jed", "mct", "cpt", "jnb", "los", "nbo", "bom", "del", "maa", "blr", "hyd",
  "ccu", "sin", "kul", "cgk", "bkk", "mnl", "sgn", "han", "hkg", "tpe", "icn", "nrt", "kix", "pek", "pvg", "szx",
  "syd", "mel", "bne", "per", "akl",
];

const ciudad = (c) => {
  const x = CIUDADES[c];
  return x ? { codigo: c.toUpperCase(), ciudad: x[0], lat: x[1], lon: x[2] } : null;
};

// ── Regiones del catálogo del AWS CLI ──
const partitions = execSync(
  "find /opt/homebrew/Cellar/awscli /usr/local/aws-cli -name partitions.json -path '*botocore/data/*' 2>/dev/null | head -1",
)
  .toString()
  .trim();
const catalogo = new Set();
if (partitions) {
  for (const p of JSON.parse(readFileSync(partitions, "utf8")).partitions)
    if (["aws", "aws-us-gov", "aws-cn", "aws-eusc"].includes(p.id))
      for (const r of Object.keys(p.regions || {})) if (!r.endsWith("-global")) catalogo.add(r);
}

// ── ip-ranges.json ──
const ip = await (await fetch("https://ip-ranges.amazonaws.com/ip-ranges.json")).json();
const regionesIp = new Set(ip.prefixes.map((p) => p.region).filter((r) => r !== "GLOBAL"));
const grupos = new Set(ip.prefixes.map((p) => p.network_border_group));

const regiones = Object.entries(REGIONES).map(([id, [nombre, pais, lat, lon, azs, particion = "comercial"]]) => ({
  id,
  nombre,
  pais,
  lat,
  lon,
  azs,
  particion,
}));
const conocidas = new Set(regiones.map((r) => r.id));
const faltan = [...catalogo].filter((r) => !conocidas.has(r));
if (faltan.length) console.warn("Regiones del catálogo sin coordenadas en REGIONES:", faltan.join(", "));
// Regiones que ya tienen rangos IP pero aún no están en el catálogo: vienen en camino.
const enCamino = [...regionesIp].filter((r) => !conocidas.has(r) && !catalogo.has(r)).sort();

const zonas = (filtro) =>
  [...grupos]
    .filter((g) => g !== "GLOBAL" && !regionesIp.has(g) && filtro(g))
    .sort()
    .map((g) => {
      const region = regiones.find((r) => g.startsWith(r.id + "-"));
      const cod = g
        .replace(region ? region.id + "-" : "", "")
        .replace(/^wl\d-/, "")
        .replace(/^sggov-/, "")
        .match(/^[a-z]+/)[0];
      const c = ciudad(cod);
      if (!c) console.warn("Sin coordenadas para", g);
      return c && { id: g, region: region?.id, ...c };
    })
    .filter(Boolean);
const localZones = zonas((g) => !g.includes("-wl") && !g.includes("-wlz-"));
const wavelength = zonas((g) => g.includes("-wlz-") && g.includes("-wl"));

const edge = EDGE.map(ciudad).filter(Boolean);

// ── Puntos de tierra para el globo pixel (rejilla de 2°) ──
const land = JSON.parse(readFileSync(new URL("../node_modules/world-atlas/land-110m.json", import.meta.url)));
const tierra = feature(land, land.objects.land);
const puntos = [];
for (let lat = -58; lat <= 82; lat += 2)
  for (let lon = -180; lon < 180; lon += 2) if (geoContains(tierra, [lon, lat])) puntos.push([lon, lat]);

const salida = {
  generado: new Date().toISOString().slice(0, 10),
  fuente: { ipRanges: ip.createDate, catalogo: partitions ? partitions.match(/awscli\/([\d.]+)/)?.[1] : null },
  regiones,
  enCamino,
  localZones,
  wavelength,
  edge,
  puntos,
};
writeFileSync(new URL("../src/data/infra-global.json", import.meta.url), JSON.stringify(salida));
console.log(
  `regiones ${regiones.length} (+${enCamino.length} en camino: ${enCamino.join(", ")}), AZs ${regiones.reduce((a, r) => a + r.azs, 0)}, local zones ${localZones.length}, wavelength ${wavelength.length}, edge ${edge.length}, puntos ${puntos.length}`,
);

/* Arquitecturas de la guía ANS-C01: un mini diagrama animado + 4 tarjetas por servicio.
   Íconos oficiales de AWS (Architecture Icons) en ./aws/. La guía llama a arqHTML(id) al pintar cada tema.

   Diagrama (viewBox 680x280):
   g: grupos  [x, y, ancho, alto, tipo, etiqueta]   tipo = region | vpc | pub | priv | onprem | edge | sg | az
   n: nodos   { id: [x, y, ícono, etiqueta] }       (x, y = centro; "\n" parte la etiqueta)
   e: flechas [desde, hasta, etiqueta?, opciones?]  opciones: bi (ida y vuelta), x (no funciona), c (curva, px), d (punteada)
   c: tarjetas { para, si, no, trampa } */
(function () {
  const ARQ = {
    "amazon-vpc-fundamentos": {
      i: "vpc",
      g: [[205, 20, 460, 240, "vpc", "VPC 10.0.0.0/16"], [225, 48, 190, 196, "pub", "Subred pública"], [455, 48, 190, 196, "priv", "Subred privada"]],
      n: { net: [60, 140, "internet", "Internet"], igw: [175, 140, "igw", "Internet\nGateway"], web: [320, 95, "ec2", "Web"], nat: [320, 185, "nat", "NAT\nGateway"], app: [550, 140, "ec2", "App"] },
      e: [["net", "igw", "", { bi: 1 }], ["igw", "web", "", { bi: 1 }], ["app", "nat", "solo salida"], ["nat", "igw"]],
      c: {
        para: "Tu red privada y aislada en AWS: tú defines los rangos IP, las subredes, las rutas y las puertas hacia afuera.",
        si: "Siempre: todo recurso con IP privada vive en una VPC. Lo público sale por el Internet Gateway y lo privado por un NAT Gateway.",
        no: "No diseñes una subred que cruce zonas: cada subred vive en una sola AZ.",
        trampa: "AWS reserva 5 IPs por subred (.0, .1, .2, .3 y la última): una /24 deja 251 usables, no 256.",
      },
    },
    "security-groups-vs-network-acls": {
      i: "firewall",
      g: [[190, 22, 470, 236, "vpc", "VPC"], [215, 52, 425, 190, "pub", "Subred · NACL (sin estado)"], [380, 85, 230, 130, "sg", "Security Group (con estado)"]],
      n: { net: [70, 140, "internet", "Cliente"], ec2: [495, 150, "ec2", "Instancia"] },
      e: [["net", "ec2", "entrada :443", { c: -50 }], ["ec2", "net", "respuesta 1024-65535", { c: -50, d: 1 }]],
      c: {
        para: "Dos filtros en capas: la NACL protege la subred completa y el Security Group protege cada instancia (su ENI).",
        si: "Security Group para permitir lo justo en cada instancia (puede referenciar a otros SG). NACL para bloquear IPs o rangos de forma explícita.",
        no: "No intentes denegar con un Security Group: solo tiene reglas de permitir.",
        trampa: "La NACL no guarda estado: abre los puertos efímeros (1024-65535) para la respuesta. El SG sí guarda estado: la respuesta sale sola.",
      },
    },
    "vpc-peering": {
      i: "peering",
      n: { a: [80, 170, "vpc", "VPC A"], p1: [215, 170, "peering", "Peering"], b: [350, 170, "vpc", "VPC B"], p2: [485, 170, "peering", "Peering"], cc: [610, 170, "vpc", "VPC C"] },
      e: [["a", "p1", "", { bi: 1 }], ["p1", "b", "", { bi: 1 }], ["b", "p2", "", { bi: 1 }], ["p2", "cc", "", { bi: 1 }], ["a", "cc", "A no llega a C", { x: 1, c: -120 }]],
      c: {
        para: "Une dos VPC con IPs privadas por el backbone de AWS, como si fueran una sola red. Sirve entre cuentas y entre regiones.",
        si: "Pocas VPC (2 a 5) que hablan mucho entre sí: no cobra procesamiento, solo transferencia.",
        no: "Muchas VPC o necesitas transitividad: usa Transit Gateway. Tampoco funciona si los CIDR se solapan.",
        trampa: "No es transitivo: si A↔B y B↔C, A no llega a C. Tampoco puede usar el IGW, NAT o VPN de la otra VPC.",
      },
    },
    "amazon-cloudfront": {
      i: "cloudfront",
      g: [[175, 98, 160, 140, "edge", "Borde"]],
      n: { u: [70, 145, "users", "Usuarios"], waf: [255, 35, "waf", "WAF"], cf: [255, 160, "cloudfront", "CloudFront\n(caché)"], s3: [480, 80, "s3", "S3 · OAC"], alb: [480, 210, "alb", "ALB"], ec2: [615, 210, "ec2", "App"] },
      e: [["u", "cf", "HTTPS", { bi: 1 }], ["waf", "cf", "", { d: 1 }], ["cf", "s3", "estático"], ["cf", "alb", "dinámico"], ["alb", "ec2"]],
      c: {
        para: "Red de entrega (CDN): guarda copias del contenido en ubicaciones de borde cerca de cada usuario.",
        si: "Sitios y APIs HTTP/HTTPS, estáticos o dinámicos, con protección de WAF y Shield y orígenes en S3 o ALB.",
        no: "Tráfico que no es HTTP (juegos UDP, VoIP) o necesitas IPs fijas: eso es Global Accelerator.",
        trampa: "Para que solo CloudFront pueda leer el bucket de S3 se usa OAC (Origin Access Control). OAI es la forma antigua.",
      },
    },
    "aws-global-accelerator": {
      i: "ga",
      g: [[400, 22, 260, 110, "region", "Región A"], [400, 150, 260, 110, "region", "Región B"]],
      n: { u: [70, 140, "users", "Usuarios"], ga: [250, 140, "ga", "2 IPs anycast\nfijas"], nlb: [480, 72, "nlb", "NLB"], ec2a: [600, 72, "ec2", "App"], alb: [480, 200, "alb", "ALB"], ec2b: [600, 200, "ec2", "App"] },
      e: [["u", "ga", "TCP/UDP", { bi: 1 }], ["ga", "nlb", "backbone AWS"], ["ga", "alb", "failover", { d: 1 }], ["nlb", "ec2a"], ["alb", "ec2b"]],
      c: {
        para: "Te da 2 IPs anycast estáticas y mete el tráfico al backbone de AWS en el borde más cercano.",
        si: "TCP o UDP que no es HTTP, necesitas IPs fijas para listas blancas o failover entre regiones en segundos.",
        no: "Quieres cachear contenido: Global Accelerator no cachea, eso es CloudFront.",
        trampa: "IPs fijas + failover multirregión rápido + UDP → Global Accelerator (no CloudFront ni Route 53).",
      },
    },
    "elastic-load-balancing-comparacion": {
      i: "elb",
      n: { u: [70, 95, "users", "Clientes"], alb: [260, 40, "alb", "ALB · capa 7"], nlb: [260, 130, "nlb", "NLB · capa 4"], gwlb: [260, 218, "gwlb", "GWLB · capa 3"], t1: [470, 40, "ec2", "/api  /img"], t2: [470, 130, "ec2", "IP fija · TCP/UDP"], fw: [470, 218, "firewall", "Appliances"] },
      e: [["u", "alb", "HTTP/S"], ["u", "nlb", "TCP/UDP/TLS"], ["alb", "t1", "rutas por path/host"], ["nlb", "t2"], ["gwlb", "fw", "GENEVE 6081", { bi: 1 }]],
      c: {
        para: "Reparte el tráfico entre destinos sanos. ALB entiende HTTP, NLB trabaja con TCP/UDP y GWLB inserta appliances de seguridad.",
        si: "ALB: rutas por path o host, WebSockets, gRPC y login con Cognito/OIDC. NLB: Elastic IP por AZ, latencia ultrabaja, PrivateLink. GWLB: firewalls de terceros.",
        no: "No elijas ALB si necesitas IP fija o publicar tu servicio por PrivateLink: eso pide NLB.",
        trampa: "Solo el NLB (o el GWLB) puede estar detrás de un servicio de PrivateLink, y solo el NLB tiene Elastic IP por AZ.",
      },
    },
    "aws-site-to-site-vpn": {
      i: "s2s",
      g: [[20, 60, 175, 160, "onprem", "Tu datacenter"], [450, 50, 215, 180, "vpc", "VPC"]],
      n: { cgw: [107, 145, "cgw", "Customer\nGateway"], vpn: [320, 145, "s2s", "2 túneles IPsec"], vgw: [520, 145, "vgw", "Virtual private\ngateway / TGW"], ec2: [615, 145, "ec2", "App"] },
      e: [["cgw", "vpn", "Internet", { bi: 1 }], ["vpn", "vgw", "", { bi: 1 }], ["vgw", "ec2", "", { bi: 1 }]],
      c: {
        para: "Conecta tu red on-premises con AWS mediante 2 túneles IPsec cifrados sobre Internet.",
        si: "Necesitas conexión cifrada en horas (no semanas) o un respaldo barato de Direct Connect.",
        no: "Necesitas mucho ancho de banda con latencia estable: Direct Connect.",
        trampa: "Cada túnel da ~1,25 Gbps. Para sumar ancho de banda usa varias VPN con ECMP en Transit Gateway (con un VGW no funciona).",
      },
    },
    "aws-client-vpn": {
      i: "cvpn",
      g: [[340, 30, 320, 220, "vpc", "VPC"], [360, 60, 140, 170, "priv", "Subred asociada"]],
      n: { u: [80, 140, "client", "Laptops\n(OpenVPN)"], cv: [250, 140, "cvpn", "Client VPN\nendpoint"], eni: [430, 140, "endpoint", "ENI"], ec2: [590, 140, "ec2", "Recurso\nprivado"] },
      e: [["u", "cv", "TLS", { bi: 1 }], ["cv", "eni", "", { bi: 1 }], ["eni", "ec2", "", { bi: 1 }]],
      c: {
        para: "VPN para personas: cada usuario se conecta desde su laptop a la VPC con un cliente OpenVPN.",
        si: "Acceso remoto de empleados a recursos privados, autenticando con Active Directory, SAML o certificados mutuos.",
        no: "Unir dos redes (oficina ↔ VPC): eso es Site-to-Site VPN.",
        trampa: "El rango de clientes no puede solaparse con la VPC y va de /22 a /12. Activa split-tunnel para no mandar todo Internet por AWS.",
      },
    },
    "aws-direct-connect-dx": {
      i: "dx",
      g: [[20, 60, 150, 160, "onprem", "Tu datacenter"], [430, 18, 230, 120, "vpc", "VPC"], [480, 158, 180, 112, "region", "Servicios públicos"]],
      n: { r: [95, 140, "router", "Router"], dx: [270, 140, "dx", "DX location\n(fibra dedicada)"], dxgw: [490, 80, "dxgw", "DX Gateway"], vgw: [610, 80, "vgw", "VGW / TGW"], s3: [570, 210, "s3", "S3"] },
      e: [["r", "dx", "", { bi: 1 }], ["dx", "dxgw", "Private / Transit VIF", { bi: 1 }], ["dxgw", "vgw", "", { bi: 1 }], ["dx", "s3", "Public VIF", { bi: 1 }]],
      c: {
        para: "Conexión física dedicada (fibra) entre tu datacenter y AWS: ancho de banda estable y latencia predecible.",
        si: "Mucho tráfico, latencia constante o requisitos de no pasar por Internet.",
        no: "Lo necesitas para mañana: aprovisionar DX tarda semanas. Mientras tanto, Site-to-Site VPN.",
        trampa: "DX no va cifrado: cifra con MACsec (conexiones de 10/100 Gbps) o con una VPN sobre la Public o Transit VIF.",
      },
    },
    "aws-transit-gateway-tgw": {
      i: "tgw",
      n: { tgw: [340, 134, "tgw", ""], v1: [110, 60, "vpc", "VPC Prod"], v2: [110, 220, "vpc", "VPC Dev"], v3: [570, 60, "vpc", "VPC Compartida"], v4: [570, 220, "vpc", "VPC Inspección"], vpn: [340, 38, "s2s", ""], dx: [340, 228, "dxgw", ""] },
      e: [["v1", "tgw", "", { bi: 1 }], ["v2", "tgw", "", { bi: 1 }], ["tgw", "v3", "", { bi: 1 }], ["tgw", "v4", "", { bi: 1 }], ["vpn", "tgw", "VPN", { bi: 1 }], ["dx", "tgw", "Direct Connect", { bi: 1 }]],
      c: {
        para: "Router central de la región: conecta cientos de VPC, VPN y Direct Connect en estrella, con tablas de rutas para separar entornos.",
        si: "Muchas VPC o cuentas, necesitas transitividad, segmentar (prod ≠ dev) o inspeccionar todo en una VPC central.",
        no: "Solo 2 VPC con mucho tráfico: el peering es más barato porque TGW cobra por GB procesado.",
        trampa: "Con firewalls en una VPC de inspección activa Appliance Mode en ese attachment para que ida y vuelta pasen por la misma AZ.",
      },
    },
    "vpc-endpoints": {
      i: "endpoint",
      g: [[20, 30, 360, 220, "vpc", "VPC"], [40, 60, 140, 170, "priv", "Subred privada"]],
      n: { ec2: [110, 145, "ec2", "Instancia"], gw: [290, 75, "endpoint", "Gateway\nendpoint"], ie: [290, 210, "pl", "Interface\nendpoint (ENI)"], s3: [520, 75, "s3", "S3 · DynamoDB"], kms: [520, 210, "kms", "KMS, SQS y\ncasi todo lo demás"] },
      e: [["ec2", "gw", "tabla de rutas"], ["gw", "s3"], ["ec2", "ie", "DNS privado"], ["ie", "kms"]],
      c: {
        para: "Llegar a servicios de AWS desde subredes privadas sin pasar por Internet ni por un NAT.",
        si: "Gateway endpoint para S3 y DynamoDB (gratis, va en la tabla de rutas). Interface endpoint (PrivateLink) para casi todo lo demás.",
        no: "No esperes usar un gateway endpoint desde on-premises u otra VPC: solo sirve dentro de su propia VPC.",
        trampa: "Para llegar a S3 en privado desde on-premises (VPN/DX) se usa un interface endpoint de S3, no el gateway endpoint.",
      },
    },
    "route-53-resolver-dns-hibrido": {
      i: "resolver",
      g: [[20, 60, 160, 160, "onprem", "On-premises"], [250, 20, 410, 240, "vpc", "VPC"]],
      n: { dns: [100, 140, "server", "DNS\ncorporativo"], inb: [340, 75, "resolver", "Inbound\nendpoint"], out: [340, 210, "resolver", "Outbound\nendpoint + reglas"], hz: [560, 140, "hz", "Zona privada\naws.interno"] },
      e: [["dns", "inb", "¿app.aws.interno?"], ["inb", "hz"], ["out", "dns", "¿srv.corp.local?"]],
      c: {
        para: "Une el DNS de tu red con el de AWS en las dos direcciones.",
        si: "On-premises necesita resolver zonas privadas de AWS (inbound) o la VPC necesita nombres corporativos (outbound + reglas de reenvío).",
        no: "No apuntes on-premises a la IP .2 de la VPC: no se alcanza desde afuera. Para eso existe el inbound endpoint.",
        trampa: "Inbound = de afuera hacia AWS. Outbound = de AWS hacia afuera. Las reglas se comparten entre cuentas con AWS RAM.",
      },
    },
    "amazon-route-53-dns-completo": {
      i: "r53",
      g: [[410, 22, 250, 110, "region", "Región principal"], [410, 150, 250, 110, "region", "Región de respaldo"]],
      n: { u: [70, 140, "users", "Usuarios"], r53: [250, 140, "r53", "Route 53\n+ health checks"], a: [490, 72, "alb", "ALB"], ea: [605, 72, "ec2", "App"], b: [490, 200, "alb", "ALB"], eb: [605, 200, "ec2", "App"] },
      e: [["u", "r53", "¿ejemplo.com?", { bi: 1 }], ["r53", "a", "primario"], ["r53", "b", "failover", { d: 1 }], ["a", "ea"], ["b", "eb"]],
      c: {
        para: "DNS administrado: registra dominios, aloja zonas públicas y privadas y decide a dónde mandar a cada usuario.",
        si: "Políticas de failover, latencia, geolocalización, ponderado (canary) o multivalor, combinadas con health checks.",
        no: "Necesitas failover en segundos sin depender del TTL del DNS: Global Accelerator.",
        trampa: "En el apex (ejemplo.com) no se puede usar CNAME: usa un registro Alias hacia CloudFront, ALB o S3, que además es gratis.",
      },
    },
    "vpc-flow-logs": {
      i: "flow",
      g: [[20, 50, 190, 180, "vpc", "VPC · subred · ENI"]],
      n: { ec2: [115, 140, "ec2", "Instancia"], fl: [320, 140, "flow", "Flow Logs"], cw: [520, 70, "cw", "CloudWatch Logs"], s3: [520, 210, "s3", "S3 → Athena"] },
      e: [["ec2", "fl", "metadatos"], ["fl", "cw"], ["fl", "s3"]],
      c: {
        para: "Registra los metadatos de cada conexión (origen, destino, puerto, bytes, ACCEPT/REJECT) de una VPC, subred o ENI.",
        si: "Entender por qué algo no conecta, auditar o detectar tráfico raro.",
        no: "Necesitas ver el contenido de los paquetes: eso es Traffic Mirroring.",
        trampa: "No captura el tráfico al DNS de Amazon (.2), a 169.254.169.254, DHCP ni la activación de Windows. Y no es en tiempo real.",
      },
    },
    "vpc-traffic-mirroring": {
      i: "mirror",
      n: { ec2: [80, 140, "ec2", "ENI de origen"], m: [250, 140, "mirror", "Mirror\nsession"], nlb: [430, 140, "nlb", "NLB / GWLB"], ids: [600, 140, "firewall", "IDS / análisis"] },
      e: [["ec2", "m", "copia del paquete"], ["m", "nlb", "VXLAN UDP 4789"], ["nlb", "ids"]],
      c: {
        para: "Copia los paquetes completos de una ENI y los manda a tus herramientas de seguridad o monitoreo.",
        si: "IDS/IPS, análisis forense o depurar una aplicación a nivel de paquete.",
        no: "Solo necesitas saber quién habló con quién: Flow Logs es más simple y barato.",
        trampa: "La copia viaja encapsulada en VXLAN (UDP 4789): el destino debe permitir ese puerto en su Security Group.",
      },
    },
    "herramientas-de-monitoreo-de-red": {
      i: "reach",
      g: [[20, 60, 180, 160, "vpc", "VPC"]],
      n: { ec2: [110, 140, "ec2", "Instancia A"], igw: [340, 140, "igw", "Internet\nGateway"], net: [570, 140, "internet", "Destino B"], ra: [390, 40, "reach", "Reachability\nAnalyzer"], cw: [500, 225, "cw", "CloudWatch"] },
      e: [["ec2", "igw"], ["igw", "net"], ["ra", "ec2", "sin enviar paquetes", { d: 1 }], ["cw", "igw", "métricas", { d: 1 }]],
      c: {
        para: "Las herramientas para ver, medir y diagnosticar tu red sin adivinar.",
        si: "Reachability Analyzer: ¿qué bloquea de A a B? CloudWatch: métricas y alarmas. Flow Logs: tráfico real. Network Access Analyzer: accesos no deseados.",
        no: "Reachability Analyzer revisa la configuración, no manda paquetes: si dice que hay camino y aun así falla, mira el sistema operativo o la app.",
        trampa: "“Sin enviar tráfico, encuentra qué componente bloquea la conexión” = Reachability Analyzer.",
      },
    },
    "optimizacion-de-performance-de-red": {
      i: "ec2",
      g: [[60, 40, 560, 200, "az", "Una sola AZ"], [90, 75, 500, 145, "sg", "Placement group · cluster"]],
      n: { a: [180, 150, "ec2", "Nodo 1"], b: [340, 150, "ec2", "Nodo 2"], cc: [500, 150, "ec2", "Nodo 3"] },
      e: [["a", "b", "MTU 9001 · ENA", { bi: 1 }], ["b", "cc", "10 Gbps por flujo", { bi: 1 }]],
      c: {
        para: "Sacar el máximo ancho de banda y la menor latencia entre tus instancias.",
        si: "Cluster placement group + Enhanced Networking (ENA) + jumbo frames para HPC o mucho tráfico entre instancias.",
        no: "Los jumbo frames no sirven hacia Internet, por VPN ni por peering entre regiones: ahí el MTU es 1500.",
        trampa: "Un solo flujo TCP llega a 5 Gbps fuera del placement group y a 10 Gbps dentro. El MTU de la VPC es 9001.",
      },
    },
    "aws-waf-web-application-firewall": {
      i: "waf",
      n: { u: [70, 140, "users", "Usuarios\ny bots"], waf: [250, 140, "waf", "Web ACL\n(reglas)"], alb: [440, 140, "alb", "CloudFront /\nALB / API GW"], ec2: [610, 140, "ec2", "App"] },
      e: [["u", "waf", "HTTP/S"], ["waf", "alb", "solo lo limpio"], ["alb", "ec2"], ["u", "ec2", "SQLi · XSS · bots", { x: 1, c: -120 }]],
      c: {
        para: "Firewall de capa 7: revisa cada petición HTTP y bloquea los ataques web comunes.",
        si: "Proteger CloudFront, ALB, API Gateway, AppSync o Cognito de SQL injection, XSS, bots o exceso de peticiones.",
        no: "No protege un NLB ni tráfico que no sea HTTP: ahí van Network Firewall o Shield.",
        trampa: "Limitar peticiones por IP = regla basada en tasa (rate-based). Bloquear por país = regla de geo match.",
      },
    },
    "aws-shield-proteccion-ddos": {
      i: "shield",
      n: { net: [70, 140, "internet", "Ataque DDoS"], sh: [250, 140, "shield", "Shield\n(en el borde)"], cf: [440, 140, "cloudfront", "CloudFront /\nRoute 53 / GA"], app: [610, 140, "alb", "Tu app"] },
      e: [["net", "sh", "inundación"], ["sh", "cf", "tráfico legítimo"], ["cf", "app"]],
      c: {
        para: "Protección contra DDoS. Standard viene gratis para todos; Advanced suma el equipo de respuesta y protección de costos.",
        si: "Advanced: apps críticas expuestas, necesitas el Shield Response Team 24/7 y que AWS te devuelva el escalado causado por un ataque.",
        no: "Shield no filtra ataques de aplicación como SQL injection: eso es WAF.",
        trampa: "“Proteger la factura de un pico por DDoS” o “acceso al equipo de respuesta a DDoS” → Shield Advanced.",
      },
    },
    "aws-network-firewall": {
      i: "nfw",
      g: [[140, 25, 520, 230, "vpc", "VPC"], [250, 55, 170, 180, "pub", "Subred del firewall"], [450, 55, 190, 180, "priv", "Subred de la app"]],
      n: { net: [55, 140, "internet", "Internet"], igw: [180, 140, "igw", "IGW +\ningress routing"], nfw: [335, 140, "nfw", "Endpoint de\nNetwork Firewall"], ec2: [545, 140, "ec2", "App"] },
      e: [["net", "igw", "", { bi: 1 }], ["igw", "nfw", "", { bi: 1 }], ["nfw", "ec2", "inspeccionado", { bi: 1 }]],
      c: {
        para: "Firewall administrado y con estado para la VPC: filtra por IP, puerto o dominio y hace IPS con reglas Suricata.",
        si: "Inspeccionar tráfico hacia Internet, entre VPC o desde on-premises, filtrar por dominio (FQDN) o detectar intrusiones.",
        no: "Solo quieres proteger una web de ataques HTTP: WAF es más simple.",
        trampa: "Hay que cambiar las tablas de rutas para forzar el paso por el endpoint, incluida la tabla del IGW (ingress routing).",
      },
    },
    "aws-firewall-manager": {
      i: "fms",
      g: [[420, 8, 240, 264, "region", "Tu AWS Organization"]],
      n: { fm: [150, 140, "fms", "Firewall Manager\n(cuenta admin)"], waf: [540, 52, "waf", "Cuenta A · WAF"], nfw: [540, 138, "nfw", "Cuenta B · Network FW"], sg: [540, 222, "firewall", "Cuenta nueva · SG"] },
      e: [["fm", "waf", "política"], ["fm", "nfw", "política"], ["fm", "sg", "se aplica sola"]],
      c: {
        para: "Aplica y vigila reglas de seguridad en todas las cuentas de tu AWS Organization desde un solo lugar.",
        si: "Muchas cuentas que deben tener las mismas reglas de WAF, Shield Advanced, Security Groups o Network Firewall, incluidas las nuevas.",
        no: "Tienes una sola cuenta: configura WAF o Network Firewall directamente.",
        trampa: "Requiere AWS Organizations y AWS Config activado. Las cuentas nuevas reciben las políticas automáticamente.",
      },
    },
    "gateway-load-balancer-patron-de-seguridad-inline": {
      i: "gwlb",
      g: [[400, 25, 260, 230, "vpc", "VPC de seguridad"]],
      n: { net: [60, 140, "internet", "Internet"], igw: [170, 140, "igw", "IGW"], ep: [295, 140, "endpoint", "GWLB\nendpoint"], gw: [470, 140, "gwlb", "GWLB"], f1: [600, 75, "firewall", "Firewall 1"], f2: [600, 205, "firewall", "Firewall 2"] },
      e: [["net", "igw", "", { bi: 1 }], ["igw", "ep", "", { bi: 1 }], ["ep", "gw", "PrivateLink", { bi: 1 }], ["gw", "f1", "GENEVE 6081", { bi: 1 }], ["gw", "f2", "", { bi: 1 }]],
      c: {
        para: "Inserta firewalls o IDS de terceros en el camino del tráfico, de forma transparente y con alta disponibilidad.",
        si: "Usar appliances de Palo Alto, Fortinet, Check Point, etc. centralizados para varias VPC.",
        no: "Te basta un firewall administrado de AWS: Network Firewall.",
        trampa: "GWLB habla GENEVE por UDP 6081 y mantiene cada flujo en el mismo appliance (simetría).",
      },
    },
    "cifrado-en-transito-y-gestion-de-certificados": {
      i: "acm",
      n: { u: [70, 175, "users", "Usuarios"], acm: [300, 36, "acm", "ACM"], alb: [300, 175, "alb", "ALB / CloudFront"], ec2: [530, 175, "ec2", "App"], kms: [530, 36, "kms", "KMS (datos en reposo)"] },
      e: [["acm", "alb", "emite y renueva el certificado", { d: 1 }], ["u", "alb", "HTTPS", { bi: 1 }], ["alb", "ec2", "TLS interno (opcional)", { bi: 1 }]],
      c: {
        para: "Cifrar el tráfico con TLS sin pelearte con certificados: ACM los emite gratis y los renueva solo.",
        si: "Certificados públicos para ALB, CloudFront y API Gateway; AWS Private CA para certificados internos entre servicios.",
        no: "Quieres instalar tú el certificado en un servidor: ACM está pensado para integrarse con ALB, CloudFront y API Gateway, que lo renuevan solos.",
        trampa: "Para CloudFront, el certificado de ACM tiene que estar en us-east-1 (Virginia), sin importar dónde esté el origen.",
      },
    },
  };

  const GRUPO = {
    region: ["#b2cafd", "6 5", "rgba(178,202,253,.05)"],
    vpc: ["#a78bfa", "", "rgba(140,79,255,.08)"],
    pub: ["#6fd08c", "", "rgba(111,208,140,.07)"],
    priv: ["#7cc6fe", "", "rgba(124,198,254,.07)"],
    onprem: ["#ff7a8a", "6 5", "rgba(255,122,138,.06)"],
    edge: ["#e0f24a", "4 4", "rgba(224,242,74,.06)"],
    sg: ["#ff9f43", "3 4", "rgba(255,159,67,.05)"],
    az: ["#7cc6fe", "6 5", "rgba(124,198,254,.04)"],
  };
  const R = 34; // radio del nodo (para que las flechas no se metan en el ícono)
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  let uid = 0;

  function texto(x, y, t, cls) {
    const lineas = String(t).split("\n");
    return `<text class="${cls}" x="${x}" y="${y}" text-anchor="middle">${lineas.map((l, i) => `<tspan x="${x}" dy="${i ? 13 : 0}">${esc(l)}</tspan>`).join("")}</text>`;
  }

  function flecha(a, b, etq, o, id) {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    const ux = dx / L, uy = dy / L;
    const x1 = a[0] + ux * R, y1 = a[1] + uy * R, x2 = b[0] - ux * R, y2 = b[1] - uy * R;
    let d, mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    if (o.c) {
      const cx = mx - uy * o.c, cy = my + ux * o.c;
      d = `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
      mx = (mx + cx) / 2;
      my = (my + cy) / 2;
    } else d = `M${x1},${y1} L${x2},${y2}`;
    const cls = o.x ? "arq-e no" : o.d ? "arq-e punteada" : "arq-e";
    let s = `<path id="${id}" class="${cls}" d="${d}" marker-end="url(#${o.x ? "pnx" : "pn"}${uid})"${o.bi ? ` marker-start="url(#pi${uid})"` : ""}/>`;
    if (!o.x) {
      s += `<circle class="paquete" r="4"><animateMotion dur="2.6s" repeatCount="indefinite"><mpath href="#${id}"/></animateMotion></circle>`;
      if (o.bi) s += `<circle class="paquete vuelta" r="3.5"><animateMotion dur="2.6s" begin="1.3s" repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear"><mpath href="#${id}"/></animateMotion></circle>`;
    }
    if (etq) {
      const w = etq.length * 6.1 + 12;
      s += `<g class="arq-etq${o.x ? " no" : ""}"><rect x="${mx - w / 2}" y="${my - 10}" width="${w}" height="18" rx="9"/>${texto(mx, my + 3.5, (o.x ? "✗ " : "") + etq, "")}</g>`;
    }
    return s;
  }

  function diagrama(a, titulo) {
    uid++;
    let s = `<svg class="arq-svg" viewBox="0 0 680 280" role="img" aria-label="${esc(titulo)}: diagrama de arquitectura"><defs>
      <marker id="pn${uid}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#b2cafd"/></marker>
      <marker id="pi${uid}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#b2cafd"/></marker>
      <marker id="pnx${uid}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#ff7a8a"/></marker></defs>`;
    (a.g || []).forEach(([x, y, w, h, k, l]) => {
      const [c, dash, f] = GRUPO[k] || GRUPO.region;
      s += `<rect class="arq-g" x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${f}" stroke="${c}" ${dash ? `stroke-dasharray="${dash}"` : ""}/><text class="arq-gl" x="${x + 12}" y="${y + 17}" fill="${c}">${esc(l)}</text>`;
    });
    (a.e || []).forEach(([de, a2, etq, o], i) => (s += flecha(a.n[de], a.n[a2], etq, o || {}, `arq${uid}-${i}`)));
    Object.values(a.n).forEach(([x, y, ico, l]) => {
      s += `<g class="arq-n"><rect x="${x - 26}" y="${y - 26}" width="52" height="52" rx="12"/><image href="aws/${ico}.svg" x="${x - 19}" y="${y - 19}" width="38" height="38"/>${l ? texto(x, y + 42, l, "arq-nl") : ""}</g>`;
    });
    return s + "</svg>";
  }

  window.ARQ_IDS = Object.keys(ARQ);
  window.arqHTML = function (id, titulo) {
    const a = ARQ[id];
    if (!a) return "";
    const t = titulo || id;
    const card = (k, etq, txt) => `<div class="arq-c ${k}"><span class="arq-ck">${etq}</span><p>${esc(txt)}</p></div>`;
    return `<section class="arq" aria-label="Arquitectura de ${esc(t)}">
      <div class="arq-h"><img src="aws/${a.i}.svg" alt="" width="40" height="40"><div><span class="arq-k">Arquitectura</span><strong>Cómo se ve en AWS</strong></div></div>
      <div class="arq-d">${diagrama(a, t)}</div>
      <div class="arq-cs">${card("para", "Para qué", a.c.para)}${card("si", "Cuándo sí", a.c.si)}${card("no", "Cuándo no", a.c.no)}${card("trampa", "Trampa del examen", a.c.trampa)}</div>
    </section>`;
  };
})();

/* Arquitecturas animadas del blog. En el .md: <figure data-arq="id" data-titulo="..."></figure>
   Reutiliza el motor de la guía ANS-C01 (arquitecturas.js). Formato de cada diagrama: ver ese archivo. */
(function () {
  window.ARQ_ICONOS = "/inmersion-ans-c01/guia/aws/";
  const ARQ = {
    "seguridad-api": {
      g: [[135, 72, 270, 152, "edge", "Primera línea de defensa"]],
      n: {
        u: [60, 95, "users", "Clientes"],
        mal: [60, 225, "client", "Atacante"],
        waf: [195, 140, "waf", "WAF\nIP y tasa"],
        api: [335, 140, "apigw", "API Gateway\nvalida la entrada"],
        cog: [480, 42, "cognito", "Cognito"],
        fn: [480, 165, "lambda", "Lambda"],
        db: [615, 165, "dynamodb", "DynamoDB"],
      },
      e: [["u", "waf", "HTTPS"], ["mal", "waf", "bloqueado", { x: 1 }], ["waf", "api"], ["api", "cog", "valida token", { bi: 1, d: 1 }], ["api", "fn", "/v1/"], ["fn", "db"]],
    },
    "lambda-managed-instances": {
      g: [[425, 20, 240, 240, "edge", "Tu VPC · tu cuenta"]],
      n: {
        req: [55, 130, "users", "Peticiones"],
        fn: [185, 130, "lambda", "Tu función\nLambda"],
        cp: [335, 130, "server", "Capacity provider\nAWS escala y parcha"],
        a: [545, 80, "ec2", "Graviton4\nvarias peticiones a la vez"],
        b: [545, 190, "ec2", "La instancia\nque tú eliges"],
      },
      e: [["req", "fn"], ["fn", "cp"], ["cp", "a"], ["cp", "b"]],
    },
    "metodo-dive": { n: { a: [70, 130, "cost", "Descubrir\nla factura"], b: [240, 130, "iam", "Inventariar\nrol de solo lectura"], c: [410, 130, "server", "Validar\nJSON de AWS"], d: [590, 130, "users", "Esquematizar\nreporte y diagramas"] },
      e: [["a", "b", "dónde mirar"], ["b", "c", "metadatos"], ["c", "d", "hallazgos"]] },
    "lambda-90": { g: [[385, 40, 260, 200, "edge", "Lambda Managed Instances"]],
      n: { api: [60, 70, "apigw", "API Gateway"], sqs: [60, 205, "sqs", "Cola SQS"], fn: [515, 140, "lambda", "Tu función"] },
      e: [["api", "fn", "síncrona: 15 min"], ["sqs", "fn", "por cola: hasta 90 min"]] },
    "lambda-microvms": { g: [[455, 12, 205, 256, "edge", "Cada sesión, aislada"]],
      n: { d: [60, 130, "server", "Dockerfile"], l: [205, 130, "lambda", "Lambda inicializa\nla app"], i: [355, 130, "ebs", "Imagen\ncon snapshot"], a: [555, 70, "ec2", "MicroVM usuario A"], b: [555, 195, "ec2", "MicroVM usuario B"] },
      e: [["d", "l"], ["l", "i"], ["i", "a"], ["i", "b"]] },
    "finops-agent": { n: { an: [70, 150, "cw", "Cost Anomaly\nDetection"], ag: [260, 150, "cost", "FinOps Agent"], ct: [430, 40, "cloudtrail", "CloudTrail"], u: [590, 150, "users", "Dueño del recurso"] },
      e: [["an", "ag", "anomalía"], ["ct", "ag", "qué cambió", { d: 1 }], ["ag", "u", "Jira o Slack"]] },
    "api-gateway-capas": { n: { c: [50, 140, "client", "Cliente"], a: [195, 62, "apigw", "1. Method\nRequest"], b: [365, 62, "apigw", "2. Integration\nRequest"], f: [560, 140, "lambda", "Tu backend"], d: [365, 205, "apigw", "3. Integration\nResponse"], e: [195, 205, "apigw", "4. Method\nResponse"] },
      e: [["c", "a"], ["a", "b"], ["b", "f"], ["f", "d"], ["d", "e"], ["e", "c"]] },
    "ssm-secrets": { n: { app: [70, 130, "ec2", "Tu aplicación"], ssm: [270, 55, "ssm", "Parameter Store\nconfiguración"], sec: [270, 205, "secrets", "Secrets Manager\ncredenciales"], kms: [460, 55, "kms", "KMS"], fn: [445, 205, "lambda", "Rotación"], rds: [600, 205, "rds", "RDS"] },
      e: [["app", "ssm", "lee"], ["app", "sec", "lee"], ["ssm", "kms", "cifra", { d: 1 }], ["sec", "kms", "", { d: 1 }], ["sec", "fn", "cada X días"], ["fn", "rds"]] },
    encriptacion: { n: { a: [70, 140, "client", "Tu app\ncifrado de cliente"], b: [300, 140, "alb", "Balanceador\ncon certificado ACM"], s: [510, 140, "s3", "S3\nen reposo"], k: [625, 45, "kms", "KMS"] },
      e: [["a", "b", "en tránsito: TLS"], ["b", "s"], ["k", "s", "llaves", { d: 1 }]] },
    "cli-mfa": { n: { t: [60, 140, "client", "Tu terminal"], s: [240, 140, "iam", "STS\nget-session-token"], c: [425, 140, "secrets", "3 credenciales\ntemporales"], a: [600, 140, "s3", "APIs de AWS"] },
      e: [["t", "s", "llaves + MFA"], ["s", "c"], ["c", "a", "SessionToken"]] },
    "network-firewall": { g: [[275, 30, 190, 210, "edge", "Inspection VPC"]],
      n: { a: [55, 70, "vpc", "VPC A"], b: [55, 205, "vpc", "VPC B"], t: [190, 140, "tgw", "Transit\nGateway"], f: [370, 135, "nfw", "Network\nFirewall"], ok: [590, 60, "internet", "IA aprobada"], no: [590, 205, "internet", "IA no autorizada"] },
      e: [["a", "t"], ["b", "t"], ["t", "f"], ["f", "ok", "permitido"], ["f", "no", "bloqueado", { x: 1 }]] },
    microservicios: { n: { u: [50, 130, "users", "Clientes"], g: [185, 130, "apigw", "API Gateway"], a: [340, 60, "eks", "Pagos"], b: [340, 205, "eks", "Inventario"], x: [490, 130, "xray", "Trazas\nX-Ray"], da: [625, 60, "rds", "Sus datos"], db: [625, 205, "dynamodb", "Sus datos"] },
      e: [["u", "g"], ["g", "a"], ["g", "b"], ["a", "da"], ["b", "db"], ["a", "x", "", { d: 1 }], ["b", "x", "", { d: 1 }]] },
    "tls-alb": { n: { m: [70, 65, "client", "Cliente moderno"], o: [70, 210, "client", "Cliente viejo\nsolo TLS 1.0"], a: [320, 140, "alb", "ALB\npolítica TLS 1.2 y 1.3"], e: [575, 140, "ec2", "Tu aplicación"], c: [470, 40, "acm", "ACM"] },
      e: [["m", "a", "TLS 1.3"], ["o", "a", "rechazado", { x: 1 }], ["a", "e"], ["c", "a", "certificado", { d: 1 }]] },
    backoff: { n: { c: [70, 120, "client", "Tu aplicación"], a: [600, 120, "apigw", "API"] },
      e: [["c", "a", "intento", { c: -70 }], ["a", "c", "429: espera 1 s, 2 s, 4 s...", { c: -75, d: 1 }], ["c", "a", "reintento con jitter"]] },
    imds: { n: { x: [60, 140, "client", "Atacante"], a: [220, 140, "ec2", "Tu app en EC2"], v1: [440, 60, "server", "IMDSv1\nbasta un GET"], v2: [440, 215, "server", "IMDSv2\npide token con PUT"], c: [620, 60, "iam", "Credenciales\ndel rol"] },
      e: [["x", "a", "SSRF"], ["a", "v1", "GET"], ["v1", "c", "las entrega"], ["a", "v2", "sin token", { x: 1 }]] },
    "kms-envelope": { n: { a: [70, 140, "ec2", "Tu aplicación"], k: [300, 45, "kms", "KMS"], s: [575, 140, "s3", "S3\narchivo cifrado\ny llave cifrada"] },
      e: [["a", "k", "GenerateDataKey", { bi: 1 }], ["a", "s", "cifra con la llave de datos"]] },
    "cross-account": { g: [[20, 30, 190, 220, "region", "Cuenta A"], [255, 20, 405, 240, "edge", "Cuenta B"]],
      n: { r: [115, 150, "iam", "Rol"], b: [400, 150, "s3", "Bucket\nbucket policy"], k: [580, 150, "kms", "Clave KMS\nkey policy"] },
      e: [["r", "b", "s3:GetObject"], ["r", "k", "kms:Decrypt", { c: -170 }]] },
    "ebs-efs": { g: [[15, 20, 310, 240, "edge", "Una sola zona"], [345, 20, 320, 240, "region", "Varias zonas"]],
      n: { a: [75, 75, "ec2", "EC2"], b: [265, 75, "ec2", "EC2"], v: [170, 195, "ebs", "EBS io2 y sistema\nde archivos de clúster"], c: [415, 75, "ec2", "EC2"], d: [595, 75, "ec2", "EC2"], f: [505, 195, "efs", "EFS por NFS"] },
      e: [["a", "v"], ["b", "v"], ["c", "f"], ["d", "f"]] },
    "sqs-dlq": { n: { p: [60, 130, "users", "Productores"], q: [235, 130, "sqs", "Cola SQS"], f: [420, 130, "lambda", "Consumidor\na su ritmo"], d: [600, 130, "dynamodb", "Base de datos"], l: [420, 232, "sqs", "Dead Letter Queue"] },
      e: [["p", "q", "pico"], ["q", "f"], ["f", "d"], ["q", "l", "falla N veces", { d: 1 }]] },
    "sqs-fanout": { n: { e: [70, 140, "server", "Servicio\nde pedidos"], s: [230, 140, "sns", "SNS"], a: [400, 60, "sqs", "Cola de pagos"], b: [400, 215, "sqs", "Cola de envíos"], x: [590, 60, "lambda", "Pagos"], y: [590, 215, "lambda", "Envíos"] },
      e: [["e", "s", "evento"], ["s", "a"], ["s", "b"], ["a", "x"], ["b", "y"]] },
    "api-sqs": { n: { u: [60, 120, "users", "Usuario"], a: [205, 120, "apigw", "API"], q: [350, 120, "sqs", "Cola SQS"], w: [495, 120, "lambda", "Trabajador"], n: [625, 120, "sns", "Aviso"] },
      e: [["u", "a", "recibido", { bi: 1 }], ["a", "q"], ["q", "w"], ["w", "n"], ["n", "u", "cuando está listo", { c: -190, d: 1 }]] },
    "iam-scp": { n: { r: [75, 150, "iam", "Rol\ncon Allow"], o: [320, 45, "org", "SCP en la OU\ncon Deny"], s: [565, 150, "s3", "Bucket\ncon Allow"] },
      e: [["r", "s", "denegado", { x: 1 }], ["o", "r", "Deny explícito", { d: 1 }]] },
    "iam-rol": { n: { a: [70, 150, "ec2", "Tu aplicación"], s: [320, 45, "iam", "STS\nasume el rol"], b: [575, 150, "s3", "S3"] },
      e: [["a", "s", "AssumeRole", { bi: 1 }], ["a", "b", "credenciales temporales"]] },
    "video-streaming": { n: { o: [55, 130, "client", "Video\noriginal"], s: [185, 130, "s3", "S3"], m: [325, 130, "mediaconvert", "MediaConvert"], c: [465, 130, "cloudfront", "CloudFront"], a: [610, 60, "client", "Celular\n720p"], b: [610, 205, "users", "TV en 4K"] },
      e: [["o", "s"], ["s", "m"], ["m", "c", "HLS"], ["c", "a"], ["c", "b"]] },
    "https-enter": { n: { b: [70, 110, "client", "Navegador"], d: [330, 38, "r53", "1. DNS\n¿qué IP es?"], s: [600, 110, "server", "Servidor"] },
      e: [["b", "d", "", { bi: 1 }], ["b", "s", "2. TCP", { bi: 1 }], ["b", "s", "3. TLS: certificado y llaves", { c: 90, bi: 1 }], ["b", "s", "4. HTTP cifrado", { c: 215, bi: 1 }]] },
    "vpn-route": { g: [[20, 30, 305, 225, "edge", "Tu VPC"]],
      n: { e: [100, 140, "ec2", "App en\nla subred"], r: [250, 140, "router", "Route table\nsin asociar"], v: [440, 140, "vgw", "Túneles VPN\narriba"], x: [600, 140, "server", "Proveedor\nexterno"] },
      e: [["e", "r", "sin ruta", { x: 1 }], ["r", "v", "", { d: 1 }], ["v", "x", "", { bi: 1 }]] },
  };
  window.BLOG_ARQ = ARQ;
  document.querySelectorAll("[data-arq]").forEach((f) => {
    const a = ARQ[f.dataset.arq];
    if (!a) return;
    const t = f.dataset.titulo || "Arquitectura";
    f.classList.add("blog-arq");
    f.innerHTML = `<div class="arq-d">${window.arqDiagrama(a, t)}</div><figcaption>${t}</figcaption>`;
  });
})();

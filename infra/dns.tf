# divelearn.cloud: el dominio sigue registrado en Namecheap; el DNS vive en Route 53.
#
# Se activa en dos pasos porque el certificado solo se valida cuando Namecheap ya apunta
# a los nameservers de Route 53:
#   1. custom_domain_ready = false → zona, registros de correo y certificado pendiente.
#   2. Cambiar los nameservers en Namecheap (output name_servers) y esperar la propagación.
#   3. custom_domain_ready = true  → validación del certificado y dominio en CloudFront.

variable "custom_domain_ready" {
  type    = bool
  default = false
}

locals {
  domain = "divelearn.cloud"
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1" # CloudFront solo acepta certificados de ACM en us-east-1
  default_tags {
    tags = {
      Project   = "divelearn-web"
      ManagedBy = "terraform"
      Repo      = "DiveLearn/divelearn-web"
    }
  }
}

resource "aws_route53_zone" "main" {
  name = local.domain
}

# ── Correo y verificaciones (copiados de Namecheap el 2026-10-30) ──

resource "aws_route53_record" "mx" {
  zone_id = aws_route53_zone.main.zone_id
  name    = local.domain
  type    = "MX"
  ttl     = 3600
  records = [
    "1 ASPMX.L.GOOGLE.COM.",
    "5 ALT1.ASPMX.L.GOOGLE.COM.",
    "5 ALT2.ASPMX.L.GOOGLE.COM.",
    "10 ALT3.ASPMX.L.GOOGLE.COM.",
    "10 ALT4.ASPMX.L.GOOGLE.COM.",
  ]
}

resource "aws_route53_record" "apex_txt" {
  zone_id = aws_route53_zone.main.zone_id
  name    = local.domain
  type    = "TXT"
  ttl     = 3600
  records = [
    "google-site-verification=nIAAFFYBRtE892YU3x8-L3uFR1Ou1oHGN_2eONu9e5A",
    # SPF nuevo: en Namecheap no había, y sin él el correo de Google Workspace cae más en spam.
    "v=spf1 include:_spf.google.com ~all",
  ]
}

resource "aws_route53_record" "dmarc" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "_dmarc.${local.domain}"
  type    = "TXT"
  ttl     = 3600
  records = ["v=DMARC1; p=none;"]
}

resource "aws_route53_record" "cname" {
  for_each = {
    "fxgddwcyd4qj"    = "gv-mqhzk3246annzy.dv.googlehosted.com." # verificación de Google
    "cka._domainkey"  = "dkim.dm-04fed81e.sg9.convertkit.com."   # DKIM de Kit
    "cka2._domainkey" = "dkim2.dm-7eee74a9.sg9.convertkit.com."  # DKIM de Kit
    "ckespa"          = "spf.dm-519d05a3.sg9.convertkit.com."    # return-path de Kit
  }
  zone_id = aws_route53_zone.main.zone_id
  name    = "${each.key}.${local.domain}"
  type    = "CNAME"
  ttl     = 3600
  records = [each.value]
}

# ── Certificado HTTPS ──

resource "aws_acm_certificate" "site" {
  provider                  = aws.us_east_1
  domain_name               = local.domain
  subject_alternative_names = ["www.${local.domain}"]
  validation_method         = "DNS"
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for o in aws_acm_certificate.site.domain_validation_options : o.domain_name => o
  }
  zone_id         = aws_route53_zone.main.zone_id
  name            = each.value.resource_record_name
  type            = each.value.resource_record_type
  ttl             = 300
  records         = [each.value.resource_record_value]
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "site" {
  count                   = var.custom_domain_ready ? 1 : 0
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.site.arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}

# ── El sitio en el dominio (paso 3) ──

resource "aws_route53_record" "site" {
  for_each = var.custom_domain_ready ? toset(["A", "AAAA"]) : toset([])
  zone_id  = aws_route53_zone.main.zone_id
  name     = local.domain
  type     = each.value
  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www" {
  for_each = var.custom_domain_ready ? toset(["A", "AAAA"]) : toset([])
  zone_id  = aws_route53_zone.main.zone_id
  name     = "www.${local.domain}"
  type     = each.value
  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}

output "name_servers" {
  description = "Nameservers para poner en Namecheap (Custom DNS)"
  value       = aws_route53_zone.main.name_servers
}

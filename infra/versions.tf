terraform {
  required_version = ">= 1.10"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  # Bloqueo nativo de S3 (use_lockfile): no hace falta tabla de DynamoDB.
  backend "s3" {
    bucket       = "divelearn-web-tfstate-207283262800"
    key          = "infra/terraform.tfstate"
    region       = "eu-north-1"
    encrypt      = true
    use_lockfile = true
  }
}

provider "aws" {
  region = var.region
  default_tags {
    tags = {
      Project   = "divelearn-web"
      ManagedBy = "terraform"
      Repo      = "DiveLearn/divelearn-web"
    }
  }
}

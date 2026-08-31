terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.30.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# ── 1. Cloud SQL PostgreSQL (pgvector enabled) ──────────────────────────────
resource "google_sql_database_instance" "postgres" {
  name             = "omniweb-contact-center-db"
  database_version = "POSTGRES_16"
  region           = var.region

  settings {
    tier = "db-custom-4-16384"
    database_flags {
      name  = "cloudsql.enable_pgvector"
      value = "on"
    }
    backup_configuration {
      enabled    = true
      start_time = "02:00"
    }
    ip_configuration {
      ipv4_enabled    = true
      private_network = google_compute_network.vpc.id
    }
  }
}

# ── 2. Cloud Memorystore Redis Cache ────────────────────────────────────────
resource "google_redis_instance" "cache" {
  name           = "omniweb-session-cache"
  tier           = "STANDARD_HA"
  memory_size_gb = 5
  region         = var.region
  redis_version  = "REDIS_7_0"

  authorized_network = google_compute_network.vpc.id
}

# ── 3. Google Cloud Run (FastAPI Engine) ─────────────────────────────────────
resource "google_cloud_run_v2_service" "backend_api" {
  name     = "omniweb-backend-api"
  location = var.region

  template {
    containers {
      image = "gcr.io/${var.project_id}/omniweb-backend:latest"
      env {
        name  = "ENVIRONMENT"
        value = "production"
      }
      env {
        name  = "ENABLE_LANGGRAPH"
        value = "true"
      }
      env {
        name  = "ENABLE_LIVEKIT"
        value = "true"
      }
      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = "omniweb-database-url"
            version = "latest"
          }
        }
      }
      resources {
        limits = {
          cpu    = "2000m"
          memory = "2Gi"
        }
      }
    }
    scaling {
      min_instance_count = 2
      max_instance_count = 50
    }
  }
}

# ── 4. VPC Network ──────────────────────────────────────────────────────────
resource "google_compute_network" "vpc" {
  name                    = "omniweb-production-vpc"
  auto_create_subnetworks = true
}

# ── Variables ───────────────────────────────────────────────────────────────
variable "project_id" {
  type        = string
  description = "GCP Project ID"
  default     = "omniweb-production"
}

variable "region" {
  type        = string
  description = "GCP Region for deployment"
  default     = "us-central1"
}

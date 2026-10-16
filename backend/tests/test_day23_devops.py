"""Comprehensive Automated Test Suite for Day 23 - DevOps / AWS Focus.

Validates all 8 core syllabus requirements:
1. Docker Fundamentals (Multi-stage Dockerfile for FastAPI with non-root security)
2. Docker Fundamentals (Multi-stage Dockerfile for Next.js & React/Vite with Nginx)
3. Docker Compose (Services: FastAPI, PostgreSQL, Redis, Celery Worker, Celery Beat, Frontend)
4. Docker Networking & Named Volumes (Custom bridge network & 5 persistent volumes)
5. Celery Beat Periodic Scheduling (Heartbeat, cache sweep, catalog sync)
6. Environment & Secret Management (.env.docker, .env.example, no secret leaks)
7. GitHub Actions CI/CD Pipeline (.github/workflows/day23-devops-ci.yml)
8. Branch Protection & Quality Gates (.github/branch-protection-rules.json)
"""

import json
from pathlib import Path
import pytest

from app.services.celery_app import (
    celery_app,
    periodic_health_heartbeat_task,
    periodic_cache_cleanup_task,
    periodic_catalog_sync_task,
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ROOT_DIR = BASE_DIR.parent


# ==============================================================================
# 1. Docker Fundamentals - FastAPI Multi-Stage Dockerfile Tests
# ==============================================================================
def test_fastapi_multistage_dockerfile():
    """Validates FastAPI Dockerfile has multi-stage build, non-root user, and healthcheck."""
    dockerfile_path = BASE_DIR / "backend" / "Dockerfile"
    assert dockerfile_path.exists(), "backend/Dockerfile must exist"
    
    content = dockerfile_path.read_text(encoding="utf-8")
    
    # Must contain multi-stage definitions
    assert "FROM python:3.11-slim AS builder" in content, "Dockerfile must have builder stage"
    assert "FROM python:3.11-slim AS runtime" in content, "Dockerfile must have runtime stage"
    
    # Must adhere to least-privilege non-root security
    assert "useradd" in content or "adduser" in content, "Dockerfile must create non-root user"
    assert "USER appuser" in content or "USER " in content, "Dockerfile must switch to non-root user"
    
    # Must have healthcheck and expose port
    assert "EXPOSE 8000" in content, "Must expose port 8000"
    assert "HEALTHCHECK" in content, "Must include container HEALTHCHECK"
    assert "CMD [" in content, "Must use exec-form CMD"


def test_backend_dockerignore():
    """Validates backend .dockerignore excludes virtualenvs, test caches, and secrets."""
    ignore_path = BASE_DIR / "backend" / ".dockerignore"
    assert ignore_path.exists(), "backend/.dockerignore must exist"
    
    content = ignore_path.read_text(encoding="utf-8")
    assert ".venv" in content
    assert "__pycache__" in content
    assert ".pytest_cache" in content
    assert ".env" in content


# ==============================================================================
# 2. Docker Fundamentals - Next.js & Frontend Multi-Stage Dockerfile Tests
# ==============================================================================
def test_frontend_multistage_dockerfile():
    """Validates React/Vite Dockerfile has builder stage, Nginx runner, and SPA config."""
    dockerfile_path = BASE_DIR / "frontend" / "Dockerfile"
    assert dockerfile_path.exists(), "frontend/Dockerfile must exist"
    
    content = dockerfile_path.read_text(encoding="utf-8")
    assert "AS builder" in content
    assert "AS runner" in content
    assert "nginx" in content.lower()
    assert "EXPOSE 80" in content
    assert "HEALTHCHECK" in content


def test_frontend_nginx_configuration():
    """Validates frontend/nginx.conf has SPA routing fallback, gzip, and security headers."""
    nginx_path = BASE_DIR / "frontend" / "nginx.conf"
    assert nginx_path.exists(), "frontend/nginx.conf must exist"
    
    content = nginx_path.read_text(encoding="utf-8")
    assert "try_files $uri $uri/ /index.html;" in content, "Nginx must handle SPA client-side routes"
    assert "gzip on;" in content, "Nginx must enable gzip compression"
    assert "X-Frame-Options" in content, "Nginx must declare security headers"


def test_nextjs_multistage_dockerfile():
    """Validates Dockerfile.nextjs implements the 3-stage standalone runner pattern."""
    dockerfile_path = BASE_DIR / "frontend" / "Dockerfile.nextjs"
    assert dockerfile_path.exists(), "frontend/Dockerfile.nextjs must exist"
    
    content = dockerfile_path.read_text(encoding="utf-8")
    assert "AS deps" in content
    assert "AS builder" in content
    assert "AS runner" in content
    assert "nextjs" in content
    assert "EXPOSE 3000" in content
    assert "node server.js" in content or '["node", "server.js"]' in content


# ==============================================================================
# 3. Docker Compose Orchestration Tests
# ==============================================================================
def test_docker_compose_services():
    """Validates docker-compose.yml defines all 6 required services."""
    compose_path = BASE_DIR / "docker-compose.yml"
    assert compose_path.exists(), "docker-compose.yml must exist"
    
    content = compose_path.read_text(encoding="utf-8")
    
    # Must declare all 6 required services
    services = ["postgres:", "redis:", "backend:", "celery_worker:", "celery_beat:", "frontend:"]
    for s in services:
        assert s in content, f"docker-compose.yml must define service {s}"

    # Must specify Celery Beat command
    assert "beat" in content, "Celery Beat service must run beat command"


def test_docker_compose_networking_and_volumes():
    """Validates custom bridge network and named volumes in docker-compose.yml."""
    compose_path = BASE_DIR / "docker-compose.yml"
    content = compose_path.read_text(encoding="utf-8")
    
    # Custom bridge network
    assert "sivora_network" in content, "Must define custom bridge network sivora_network"
    assert "networks:" in content
    
    # 5 persistent named volumes
    required_volumes = ["postgres_data:", "redis_data:", "backend_uploads:", "chroma_data:", "celery_data:"]
    for v in required_volumes:
        assert v in content, f"docker-compose.yml must define named volume {v}"


def test_docker_compose_healthchecks_and_dependencies():
    """Validates healthchecks and service dependency conditions in docker-compose.yml."""
    compose_path = BASE_DIR / "docker-compose.yml"
    content = compose_path.read_text(encoding="utf-8")
    
    assert "condition: service_healthy" in content, "backend must depend on healthy postgres and redis"
    assert "pg_isready" in content, "Postgres service must have pg_isready healthcheck"
    assert "redis-cli" in content, "Redis service must have redis-cli ping healthcheck"


# ==============================================================================
# 4. Celery Beat Periodic Scheduling Tests
# ==============================================================================
def test_celery_beat_schedule_configuration():
    """Validates Celery application conf includes periodic beat schedule entries."""
    beat_schedule = getattr(celery_app.conf, "beat_schedule", {})
    assert isinstance(beat_schedule, dict), "beat_schedule must be a dictionary"
    
    # Must contain our 3 periodic tasks
    assert "periodic-health-heartbeat" in beat_schedule
    assert "periodic-cache-cleanup" in beat_schedule
    assert "periodic-catalog-sync" in beat_schedule
    
    assert beat_schedule["periodic-health-heartbeat"]["schedule"] == 60.0
    assert beat_schedule["periodic-cache-cleanup"]["schedule"] == 900.0


def test_celery_beat_tasks_execution():
    """Validates periodic tasks execute cleanly and return compliant status dicts."""
    # 1. Heartbeat task
    hb_res = periodic_health_heartbeat_task()
    assert hb_res["status"] == "HEALTHY"
    assert "timestamp" in hb_res
    
    # 2. Cache sweep task
    sweep_res = periodic_cache_cleanup_task()
    assert sweep_res["status"] == "SUCCESS"
    assert "cleaned_keys_count" in sweep_res
    
    # 3. Catalog sync task
    sync_res = periodic_catalog_sync_task()
    assert sync_res["status"] == "SYNCED"
    assert "active_products" in sync_res


# ==============================================================================
# 5. Environment & Secret Management Tests
# ==============================================================================
def test_environment_variable_templates():
    """Validates .env.example and .env.docker templates contain all required keys."""
    env_example = BASE_DIR / ".env.example"
    env_docker = BASE_DIR / ".env.docker"
    
    assert env_example.exists(), ".env.example must exist"
    assert env_docker.exists(), ".env.docker must exist"
    
    example_content = env_example.read_text(encoding="utf-8")
    docker_content = env_docker.read_text(encoding="utf-8")
    
    required_keys = ["POSTGRES_USER", "POSTGRES_PASSWORD", "DB_NAME", "REDIS_URL", "CELERY_BROKER_URL", "SECRET_KEY"]
    for k in required_keys:
        assert k in example_content, f".env.example must declare {k}"
        assert k in docker_content, f".env.docker must declare {k}"


# ==============================================================================
# 6. GitHub Actions CI/CD Pipeline Tests
# ==============================================================================
def test_github_actions_ci_workflow():
    """Validates .github/workflows/day23-devops-ci.yml defines pytest, vitest, compose & push."""
    ci_path = ROOT_DIR / ".github" / "workflows" / "day23-devops-ci.yml"
    assert ci_path.exists(), "day23-devops-ci.yml must exist"
    
    content = ci_path.read_text(encoding="utf-8")
    
    # Verify core jobs
    assert "backend-ci:" in content, "CI must define backend-ci job"
    assert "frontend-ci:" in content, "CI must define frontend-ci job"
    assert "docker-validation:" in content, "CI must define docker-validation job"
    assert "docker-build-push:" in content, "CI must define docker-build-push job"
    
    # Verify test tools
    assert "pytest" in content, "CI must invoke pytest"
    assert "vitest" in content.lower(), "CI must invoke vitest"
    assert "npm run typecheck" in content, "CI must invoke TypeScript validation"
    assert "ghcr.io" in content, "CI must target GitHub Container Registry"


# ==============================================================================
# 7. Branch Protection Rules Specification Tests
# ==============================================================================
def test_branch_protection_rules_configuration():
    """Validates .github/branch-protection-rules.json has strict status checks & PR reviews."""
    rules_path = ROOT_DIR / ".github" / "branch-protection-rules.json"
    assert rules_path.exists(), ".github/branch-protection-rules.json must exist"
    
    with open(rules_path, "r", encoding="utf-8") as f:
        rules = json.load(f)
        
    assert rules["enforce_admins"] is True
    assert rules["required_status_checks"]["strict"] is True
    
    contexts = rules["required_status_checks"]["contexts"]
    assert "Backend Pytest & Code Quality" in contexts
    assert "Frontend TypeScript, Vitest & Vite Build" in contexts
    assert "Dockerfile & Compose Syntax Validation" in contexts
    assert "Docker Multi-Stage Build & Image Push" in contexts
    
    assert rules["required_pull_request_reviews"]["required_approving_review_count"] >= 1
    assert rules["allow_force_pushes"] is False
    assert rules["allow_deletions"] is False

# ==============================================================================
# SIVORA AI E-Commerce - Production Multi-Stage Backend Dockerfile (Day 23)
# Target: FastAPI + PostgreSQL + Redis + Celery + ChromaDB
# Features: Multi-stage, Non-Root User (Least Privilege), Layer Caching, Healthcheck
# ==============================================================================

# -------------------------------------------------------------
# Stage 1: Build Dependencies & Python Wheels
# -------------------------------------------------------------
FROM python:3.11-slim AS builder

WORKDIR /build

# Install compilation headers for C-extensions (psycopg2, cryptography, reportlab)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Optimize Docker layer cache: copy requirements first
COPY requirements.txt .

# Install dependencies into user local directory to easily copy to final image
RUN pip install --no-cache-dir --user -r requirements.txt

# -------------------------------------------------------------
# Stage 2: Minimal Runtime Environment
# -------------------------------------------------------------
FROM python:3.11-slim AS runtime

WORKDIR /app

# Install minimal shared C libraries needed at runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Security: Create non-root system user and group (UID 1001)
RUN groupadd -g 1001 appgroup && \
    useradd -u 1001 -g appgroup -m -s /bin/bash appuser

# Copy installed Python packages from builder stage
COPY --from=builder /root/.local /home/appuser/.local

# Configure environment variables
ENV PATH=/home/appuser/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    ENVIRONMENT=production

# Copy application source code
COPY --chown=appuser:appgroup . /app

# Ensure directories for runtime volumes exist with proper user ownership
RUN mkdir -p /app/uploads/invoices /app/uploads/imports /app/chroma_db /app/celery && \
    chown -R appuser:appgroup /app/uploads /app/chroma_db /app/celery

# Switch to non-root user
USER appuser

# Expose standard FastAPI application port
EXPOSE 8000

# Docker native container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Launch production ASGI server (dynamically respects Render's $PORT)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

"""FastAPI main application setup, lifespan management, middleware, and router inclusion."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.gzip import GZipMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.config import settings
from app.database import Base, engine
from app.models import Category, Order, OrderItem, Product, User, ChatMessage
from app.routers import (
    auth_router,
    cart_router,
    orders_router,
    products_router,
    tasks_router,
    websocket_router,
    ai_chat_router,
    ai_features_router,
)

from app.services.redis_service import get_redis
from app.utils.rate_limit import limiter


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifespan events."""
    # Create tables automatically (for SQLite/Dev)
    try:
        Base.metadata.create_all(bind=engine)
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20)"))
            conn.commit()
    except Exception:
        pass

    # Ensure uploads directory exists
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    # Auto-seed catalog if database is fresh/empty or has incomplete catalog (< 360 products)
    try:
        from app.database import SessionLocal
        from app.models.product import Product
        from app.models.user import User, UserRole
        from app.utils.auth import get_password_hash
        with SessionLocal() as db:
            if db.query(Product).count() < 360:
                from scripts.seed_limeroad_catalog import seed_database
                seed_database()
            else:
                # Ensure permanent admin user venkatanarasimha exists
                vn = db.query(User).filter(User.username == "venkatanarasimha").first()
                if not vn:
                    vn = User(
                        username="venkatanarasimha",
                        email="venkatanarasimha@sivora.com",
                        full_name="Venkata Narasimha",
                        hashed_password=get_password_hash("venkatanarasimha114"),
                        role=UserRole.ADMIN,
                        is_active=True,
                    )
                    db.add(vn)
                else:
                    vn.hashed_password = get_password_hash("venkatanarasimha114")
                    vn.role = UserRole.ADMIN
                    vn.is_active = True

                # Ensure permanent customer user sivasankar exists
                siva = db.query(User).filter(User.username == "sivasankar").first()
                if not siva:
                    siva = User(
                        username="sivasankar",
                        email="sivasankar@sivora.com",
                        full_name="Siva Sankar",
                        hashed_password=get_password_hash("sivasankar114"),
                        role=UserRole.CUSTOMER,
                        is_active=True,
                    )
                    db.add(siva)
                else:
                    siva.hashed_password = get_password_hash("sivasankar114")
                    siva.role = UserRole.CUSTOMER
                    siva.is_active = True

                db.commit()
    except Exception as exc:
        print(f"Auto-seed catalog notice: {exc}")

    yield

    # Teardown logic if any


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# SlowAPI Limiter state & Exception Handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# GZip Response Compression Middleware (Compresses responses >= 1000 bytes)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS Middleware: allow local dev origins + all production/preview *.vercel.app subdomains
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount media uploads directory
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")

# Include API Routers under /api/v1
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(products_router, prefix=settings.API_V1_STR)
app.include_router(cart_router, prefix=settings.API_V1_STR)
app.include_router(orders_router, prefix=settings.API_V1_STR)
app.include_router(tasks_router, prefix=settings.API_V1_STR)
app.include_router(ai_chat_router, prefix=settings.API_V1_STR)
app.include_router(ai_features_router, prefix=settings.API_V1_STR)
app.include_router(websocket_router)  # Mounted directly for /ws/orders/{order_id}


@app.get("/", tags=["Health"])
def root():
    """Root entry endpoint returning service metadata."""
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database_url": settings.DATABASE_URL,
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", tags=["Health"])
def health_check():
    """Healthcheck endpoint verifying DB and Redis responsiveness."""
    redis_ok = False
    try:
        redis_ok = bool(get_redis().ping())
    except Exception:
        redis_ok = False

    return {
        "status": "online",
        "environment": settings.ENVIRONMENT,
        "database": "connected",
        "redis": "connected" if redis_ok else "offline",
    }


@app.api_route("/api/v1/seed", methods=["GET", "POST"], tags=["Admin"])
def seed_catalog_endpoint():
    """Populates the database with full 360 SIVORA luxury apparel products across Women, Men, Girls, and Boys."""
    try:
        from scripts.seed_limeroad_catalog import seed_database
        total = seed_database()
        return {
            "status": "success",
            "message": f"SIVORA luxury catalog successfully populated with {total} products across Women, Men, Girls, and Boys!",
            "total_products": total,
        }
    except Exception as exc:
        return {"status": "error", "message": str(exc)}


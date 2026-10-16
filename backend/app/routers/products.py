"""Product catalog, category management, image processing, and Redis caching endpoints."""

import os
import re
import uuid
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, UploadFile, File, status
from PIL import Image
from sqlalchemy import func, or_, and_
from sqlalchemy.orm import Session, joinedload
from app.config import settings
from app.database import engine, get_db
from app.models.product import Category, Product
from app.models.user import User
from app.schemas.product import (
    CategoryCreate,
    CategoryResponse,
    ProductCreate,
    ProductListResponse,
    ProductResponse,
    ProductUpdate,
)
from app.services.redis_service import CacheService
from app.utils.auth import get_current_admin
from app.utils.rate_limit import limiter

router = APIRouter(prefix="/products", tags=["Products & Categories"])


def slugify(text: str) -> str:
    """Generate a URL-friendly slug from text."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")


FASHION_SYNONYMS = {
    "pant": ["pants", "trouser", "trousers", "slacks"],
    "pants": ["pant", "trouser", "trousers", "slacks"],
    "paint": ["pants", "pant", "trouser", "trousers"],
    "paints": ["pants", "pant", "trouser", "trousers"],
    "trouser": ["trousers", "pant", "pants"],
    "trousers": ["trouser", "pant", "pants"],
    "coat": ["jacket", "blazer", "overcoat"],
    "jacket": ["jackets", "bomber", "trucker", "blazer"],
    "jackets": ["jacket", "bomber", "trucker", "blazer"],
    "shirt": ["shirt", "shirts", "overshirt"],
    "shirts": ["shirt", "shirts", "overshirt"],
    "t-shirt": ["t-shirt", "tshirt", "tee"],
    "t-shirts": ["t-shirt", "tshirt", "tee", "tees"],
    "tshirt": ["t-shirt", "tshirt", "tee"],
    "tshirts": ["t-shirt", "tshirt", "tee", "tees"],
    "tee": ["t-shirt", "tshirt", "tee"],
    "tees": ["t-shirt", "tshirt", "tee", "tees"],
    "hoodie": ["hoodie", "hoodies", "sweatshirt"],
    "hoodies": ["hoodie", "sweatshirt", "sweatshirts"],
    "sweatshirt": ["sweatshirt", "sweatshirts", "hoodie"],
    "sweatshirts": ["sweatshirt", "hoodie", "hoodies"],
    "cargo": ["cargos", "cargo pants"],
    "cargos": ["cargo", "cargo pants"],
    "saree": ["sari", "sarees"],
    "sari": ["saree", "saris"],
    "kurta": ["kurtas", "kurti"],
    "kurtas": ["kurta", "kurtis"],
    "kurti": ["kurtis", "kurta"],
    "lehenga": ["lehengas", "choli"],
    "lehengas": ["lehenga", "choli"],
    "frock": ["frocks", "dress"],
    "frocks": ["frock", "dress"],
    "shoe": ["shoes", "footwear", "sneakers", "sandals", "loafers", "boots"],
    "shoes": ["shoe", "footwear", "sneakers", "sandals", "loafers", "boots"],
    "footwear": ["shoes", "shoe", "sneakers", "sandals", "loafers", "boots"],
    "bag": ["bags", "handbag", "clutch", "tote", "potli"],
    "bags": ["bag", "handbag", "clutches", "totes"],
}


# ---------------------------------------------------------
# Category Endpoints
# ---------------------------------------------------------

@router.get("/categories", response_model=List[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    """List all available product categories."""
    cache_key = "categories:all"
    cached = CacheService.get(cache_key)
    if cached:
        return cached

    categories = db.query(Category).order_by(Category.name.asc()).all()
    # Serialize for cache
    serialized = [CategoryResponse.model_validate(c).model_dump() for c in categories]
    CacheService.set(cache_key, serialized, ttl_seconds=600)
    return categories


@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Create a new category (Admin only)."""
    slug = slugify(category_in.name)
    existing = db.query(Category).filter(or_(Category.name == category_in.name, Category.slug == slug)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name or slug already exists",
        )

    category = Category(
        name=category_in.name,
        slug=slug,
        description=category_in.description,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    CacheService.invalidate_pattern("categories:*")
    return category


# ---------------------------------------------------------
# Product Endpoints
# ---------------------------------------------------------

@router.get("", response_model=ProductListResponse)
@router.get("/", response_model=ProductListResponse)
@limiter.limit("60/minute")
def list_products(
    request: Request,
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=500),
    category_id: Optional[int] = None,
    category: Optional[str] = Query(None, description="Category slug or name, e.g. women, men, girls, boys"),
    subcategory: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = Query(None, description="price_asc, price_desc, newest, name_asc"),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    db: Session = Depends(get_db),
):
    """List products with pagination, category filter, subcategory filter, search, price range filter, sorting, and Redis caching."""
    cache_key = f"products:list:{category_id}:{category}:{subcategory}:{search}:{sort_by}:{min_price}:{max_price}:{page}:{size}"
    cached = CacheService.get(cache_key)
    if cached:
        return cached

    # Optimization: Eager load category using joinedload to eliminate N+1 queries.
    # Safety: Permanently filter out any dummy test / rate-limit products from being served.
    query = (
        db.query(Product)
        .options(joinedload(Product.category))
        .filter(
            Product.is_active == True,
            Product.name.not_ilike("%rate limit%"),
            Product.name.not_ilike("%dummy%"),
            Product.description.not_ilike("%bulk imported%"),
        )
    )

    if category_id:
        query = query.filter(Product.category_id == category_id)
    elif category:
        cat_slug = category.strip().lower()
        if cat_slug in ('ethnic-couture', 'women'):
            cat_slug = 'women'
        elif cat_slug in ('western-luxe', 'men'):
            cat_slug = 'men'
        elif cat_slug in ('boys-kids-wear', 'boys'):
            cat_slug = 'boys'
        cat_obj = db.query(Category).filter(
            or_(
                Category.slug == cat_slug,
                Category.name.ilike(cat_slug),
            )
        ).first()
        if cat_obj:
            query = query.filter(Product.category_id == cat_obj.id)

    if subcategory:
        sub_term = subcategory.strip()
        query = query.filter(
            or_(
                Product.description.ilike(f"%Subcategory: {sub_term}%"),
                Product.name.ilike(f"%{sub_term}%"),
            )
        )

    dialect_name = db.get_bind().dialect.name
    if search:
        search_term = search.strip().lower()
        if search_term in ("paint", "paints"):
            search_terms = ["pants", "pant", "trouser", "trousers"]
        elif search_term in ("t-shirt", "t-shirts", "tshirt", "tshirts", "tee", "tees"):
            search_terms = ["t-shirt", "tshirt", "tee"]
        elif search_term in ("shirt", "shirts"):
            search_terms = ["shirt", "shirts"]
        elif search_term in ("jeans", "jean"):
            search_terms = ["jeans", "denim"]
        elif search_term in ("saree", "sari", "sarees", "saris"):
            search_terms = ["saree", "sari"]
        elif search_term in ("kurta", "kurtas", "kurti", "kurtis"):
            search_terms = ["kurta", "kurti"]
        elif search_term in ("lehenga", "lehengas"):
            search_terms = ["lehenga"]
        else:
            search_terms = [search_term]
            if search_term in FASHION_SYNONYMS:
                search_terms.extend(FASHION_SYNONYMS[search_term])

        words = [w for w in search_term.split() if len(w) > 1]
        conditions = []

        # 1. Multi-word match: all individual words in product name (e.g. "skate blue jeans")
        if len(words) > 1:
            conditions.append(and_(*[Product.name.ilike(f"%{w}%") for w in words]))

        # 2. Match exact keywords and genuine synonyms in product name or subcategory descriptor
        for st in search_terms:
            conditions.append(Product.name.ilike(f"%{st}%"))
            conditions.append(Product.description.ilike(f"%Subcategory: {st}%"))

        query = query.filter(or_(*conditions))

        # Precision refinement: if specifically searching for "shirt", do not return "t-shirt" or "sweatshirt"
        if search_term in ("shirt", "shirts"):
            query = query.filter(
                Product.name.not_ilike("%t-shirt%"),
                Product.name.not_ilike("%tshirt%"),
                Product.name.not_ilike("%sweatshirt%"),
            )

        if not sort_by:
            query = query.order_by(
                Product.name.ilike(f"{search_term}%").desc(),
                Product.created_at.desc(),
            )

    if min_price is not None:
        query = query.filter(Product.price >= min_price)

    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    if sort_by == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort_by == "name_asc":
        query = query.order_by(Product.name.asc())
    elif not search or dialect_name != "postgresql":
        query = query.order_by(Product.created_at.desc())

    total = query.count()
    offset = (page - 1) * size
    products = query.offset(offset).limit(size).all()

    response_data = {
        "items": [ProductResponse.model_validate(p).model_dump() for p in products],
        "total": total,
        "page": page,
        "size": size,
    }

    CacheService.set(cache_key, response_data, ttl_seconds=settings.REDIS_CACHE_TTL_SECONDS)
    return response_data


@router.get("/search/advanced")
def advanced_product_search(
    q: str = Query(..., min_length=1, description="Search query or typo keyword"),
    mode: str = Query("hybrid", description="Search mode: 'fulltext', 'fuzzy', or 'hybrid'"),
    min_similarity: float = Query(0.28, ge=0.0, le=1.0, description="Minimum trigram similarity threshold"),
    db: Session = Depends(get_db),
):
    """
    Day 18 Advanced Search Engine:
    - 'fulltext': Uses PostgreSQL tsvector and plainto_tsquery with GIN index.
    - 'fuzzy': Uses pg_trgm word_similarity with GIN index for typo tolerance.
    - 'hybrid': Combines both Full-Text and Fuzzy similarity, ranked by relevance.
    All queries use joinedload(Product.category) to prevent N+1 query overhead.
    """
    search_term = q.strip()
    query = db.query(Product).options(joinedload(Product.category)).filter(Product.is_active == True)

    dialect_name = db.get_bind().dialect.name
    if dialect_name == "postgresql":
        fts_expr = func.to_tsvector("english", Product.name + " " + func.coalesce(Product.description, "")).op("@@")(
            func.plainto_tsquery("english", search_term)
        )
        fuzzy_sim = func.word_similarity(search_term, Product.name)

        if mode == "fulltext":
            query = query.filter(fts_expr).order_by(Product.created_at.desc())
        elif mode == "fuzzy":
            query = query.filter(fuzzy_sim > min_similarity).order_by(fuzzy_sim.desc())
        else:  # hybrid
            query = query.filter(or_(fts_expr, fuzzy_sim > min_similarity)).order_by(fuzzy_sim.desc(), Product.created_at.desc())
    else:
        search_filter = f"%{search_term}%"
        query = query.filter(or_(Product.name.ilike(search_filter), Product.description.ilike(search_filter)))

    products = query.limit(20).all()

    return {
        "query": search_term,
        "mode": mode,
        "dialect": dialect_name,
        "count": len(products),
        "results": [
            {
                "id": p.id,
                "name": p.name,
                "slug": p.slug,
                "description": p.description,
                "price": float(p.price),
                "stock": p.stock,
                "category": p.category.name if p.category else None,
            }
            for p in products
        ],
    }


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Retrieve detailed product information by ID with Redis caching and joinedload."""
    cache_key = f"product:detail:{product_id}"
    cached = CacheService.get(cache_key)
    if cached:
        return cached

    product = db.query(Product).options(joinedload(Product.category)).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found",
        )

    validated = ProductResponse.model_validate(product).model_dump()
    CacheService.set(cache_key, validated, ttl_seconds=settings.REDIS_CACHE_TTL_SECONDS)
    return product


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Create a new product catalog item (Admin only)."""
    # Verify category exists
    category = db.query(Category).filter(Category.id == product_in.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category does not exist",
        )

    slug_base = slugify(product_in.name)
    slug = f"{slug_base}-{uuid.uuid4().hex[:6]}"

    product = Product(
        name=product_in.name,
        slug=slug,
        description=product_in.description,
        price=product_in.price,
        stock=product_in.stock,
        category_id=product_in.category_id,
        image_url=product_in.image_url,
        thumbnail_url=product_in.thumbnail_url,
        is_active=True,
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    CacheService.invalidate_product_caches()
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Update product information and invalidate cache (Admin only)."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    update_data = product_in.model_dump(exclude_unset=True)
    if "category_id" in update_data and update_data["category_id"] is not None:
        cat = db.query(Category).filter(Category.id == update_data["category_id"]).first()
        if not cat:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category not found",
            )

    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)

    CacheService.invalidate_product_caches(product_id)
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Deactivate or remove a product (Admin only)."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    db.delete(product)
    db.commit()

    CacheService.invalidate_product_caches(product_id)
    return None


@router.post("/{product_id}/upload-image", response_model=ProductResponse)
def upload_product_image(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Upload product image, auto-generate thumbnail, and update product record."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Allowed: JPEG, PNG, WebP",
        )

    upload_folder = settings.UPLOAD_DIR
    upload_folder.mkdir(parents=True, exist_ok=True)

    ext = Path(file.filename or "image.jpg").suffix or ".jpg"
    unique_name = f"prod_{product_id}_{uuid.uuid4().hex[:8]}"
    main_file_path = upload_folder / f"{unique_name}{ext}"
    thumb_file_path = upload_folder / f"{unique_name}_thumb.webp"

    # Save original image
    with open(main_file_path, "wb") as f:
        f.write(file.file.read())

    # Generate thumbnail using Pillow
    try:
        with Image.open(main_file_path) as img:
            img.thumbnail((200, 200))
            img.save(thumb_file_path, "WEBP", quality=85)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image thumbnail generation failed: {str(e)}",
        )

    product.image_url = f"/uploads/{main_file_path.name}"
    product.thumbnail_url = f"/uploads/{thumb_file_path.name}"
    db.commit()
    db.refresh(product)

    CacheService.invalidate_product_caches(product_id)
    return product

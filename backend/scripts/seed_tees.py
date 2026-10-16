from app.database import SessionLocal
from app.models.product import Product
from decimal import Decimal

db = SessionLocal()

fashion_tees = [
    {
        "name": "Oversized Vintage Graphic Streetwear T-Shirt",
        "slug": "oversized-vintage-graphic-streetwear-t-shirt",
        "price": Decimal("1199.00"),
        "stock": 50,
        "category_id": 18,
        "image_url": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=85",
        "description": "Heavyweight 240 GSM French terry oversized streetwear t-shirt with retro back graphic."
    },
    {
        "name": "Heavyweight Boxy Supima Cotton T-Shirt",
        "slug": "heavyweight-boxy-supima-cotton-t-shirt",
        "price": Decimal("1499.00"),
        "stock": 45,
        "category_id": 18,
        "image_url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=85",
        "description": "Premium drop-shoulder boxy fit t-shirt crafted from 100% long-staple Supima cotton."
    },
    {
        "name": "Classic Tailored Linen Overshirt",
        "slug": "classic-tailored-linen-overshirt",
        "price": Decimal("2999.00"),
        "stock": 35,
        "category_id": 18,
        "image_url": "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=85",
        "description": "Relaxed resort-collar button-down overshirt in pure European flax linen."
    },
    {
        "name": "Minimalist French Terry Streetwear Hoodie",
        "slug": "minimalist-french-terry-streetwear-hoodie",
        "price": Decimal("2499.00"),
        "stock": 40,
        "category_id": 18,
        "image_url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=85",
        "description": "Luxury 380 GSM loopback cotton hoodie with double-layer hood and kangaroo pouch."
    },
    {
        "name": "Boyfriend Fit Oversized Graphic T-Shirt",
        "slug": "boyfriend-fit-oversized-graphic-t-shirt",
        "price": Decimal("1199.00"),
        "stock": 50,
        "category_id": 17,
        "image_url": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=85",
        "description": "Ultra-soft combed cotton oversized boyfriend fit tee with vintage typography print."
    },
    {
        "name": "Cropped Ribbed Knit Streetwear Top",
        "slug": "cropped-ribbed-knit-streetwear-top",
        "price": Decimal("999.00"),
        "stock": 60,
        "category_id": 17,
        "image_url": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=85",
        "description": "Form-flattering stretch ribbed cotton cropped tee with high crew neckline."
    }
]

added_count = 0
for item in fashion_tees:
    existing = db.query(Product).filter(Product.slug == item["slug"]).first()
    if not existing:
        prod = Product(
            name=item["name"],
            slug=item["slug"],
            price=item["price"],
            stock=item["stock"],
            category_id=item["category_id"],
            image_url=item["image_url"],
            thumbnail_url=item["image_url"],
            description=item["description"],
            is_active=True
        )
        db.add(prod)
        added_count += 1

db.commit()
print(f"Added {added_count} genuine luxury fashion streetwear products.")
from app.services.redis_service import CacheService
CacheService.invalidate_pattern("products:*")
print("Cache refreshed successfully.")

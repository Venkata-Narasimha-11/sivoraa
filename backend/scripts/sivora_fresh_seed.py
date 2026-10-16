# -*- coding: utf-8 -*-
"""
SIVORA -- Complete Database Reset & Fresh Seed
Run: python backend/scripts/sivora_fresh_seed.py
"""
import sys
import io
from pathlib import Path

# Force UTF-8 output on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from decimal import Decimal
from app.database import SessionLocal
from app.models import Category, Product, User, UserRole, Order, OrderItem, ChatMessage
from app.utils.auth import get_password_hash

try:
    from app.services.rag_service import RAGService
    HAS_RAG = True
except Exception:
    HAS_RAG = False

try:
    from app.services.ai_cache_service import AICacheService
    HAS_CACHE = True
except Exception:
    HAS_CACHE = False


CATEGORIES = [
    {
        "name": "Women",
        "slug": "ethnic-couture",
        "description": "Handcrafted bridal lehengas, banarasi silk sarees, festive anarkalis, and designer kurtis for the modern Indian woman.",
    },
    {
        "name": "Men",
        "slug": "western-luxe",
        "description": "Royal sherwanis, silk kurtas, bandhgala suits, designer blazers, and premium ethnic-western fusion for men.",
    },
    {
        "name": "Kids",
        "slug": "boys-kids-wear",
        "description": "Festive sherwanis and princess lehengas for your little ones - because luxury starts young.",
    },
    {
        "name": "Jewellery",
        "slug": "fine-jewellery",
        "description": "Polki kundan chokers, heritage jhumkas, rose gold diamond solitaires, and temple jewellery.",
    },
    {
        "name": "Handbags",
        "slug": "luxury-handbags",
        "description": "Italian leather totes, quilted sling bags, beaded clutches, and handcrafted evening minaudieres.",
    },
    {
        "name": "Beauty",
        "slug": "beauty-fragrances",
        "description": "SIVORA signature perfumes, velvet lip pigments, saffron glow serums, and luxury beauty rituals.",
    },
]

PRODUCTS = [
    # ---- WOMEN (ethnic-couture) ---------------------------------
    {
        "category": "ethnic-couture",
        "name": "Crimson Bridal Lehenga - Zardozi Edition",
        "description": "Hand-embroidered crimson lehenga with real zari zardozi work, tissue silk blouse, and organza dupatta. Perfect for sangeet and wedding ceremonies.",
        "price": Decimal("48500.00"), "stock": 8,
        "sku": "WOM-LEH-001",
        "image_url": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
    },
    {
        "category": "ethnic-couture",
        "name": "Banarasi Silk Saree - Royal Kadhwa Buta",
        "description": "Pure katan silk Banarasi saree with traditional kadhwa buta motifs in gold zari. A timeless heirloom weave from Varanasi.",
        "price": Decimal("18900.00"), "stock": 15,
        "sku": "WOM-SAR-001",
        "image_url": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80",
    },
    {
        "category": "ethnic-couture",
        "name": "Ivory Organza Anarkali - Resham Embroidered",
        "description": "Floor-length ivory organza anarkali with delicate resham threadwork and sequin scattering. Ideal for engagement ceremonies.",
        "price": Decimal("12400.00"), "stock": 20,
        "sku": "WOM-ANK-001",
        "image_url": "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600&q=80",
    },
    {
        "category": "ethnic-couture",
        "name": "Chanderi Suit Set - Block Print Heritage",
        "description": "Handblock-printed Chanderi silk suit with matching dupatta and palazzo pants. Natural dyes, artisan craftsmanship from Madhya Pradesh.",
        "price": Decimal("7200.00"), "stock": 30,
        "sku": "WOM-SUT-001",
        "image_url": "https://images.unsplash.com/photo-1614886137799-a9c3d4af72ba?w=600&q=80",
    },
    {
        "category": "ethnic-couture",
        "name": "Deep Teal Kanjivaram Silk Saree",
        "description": "Authentic Kanjivaram silk saree in deep teal with gold temple border and pallu. Woven by master weavers in Kanchipuram using pure mulberry silk.",
        "price": Decimal("24600.00"), "stock": 10,
        "sku": "WOM-SAR-002",
        "image_url": "https://images.unsplash.com/photo-1614885157702-0e0b1c463b91?w=600&q=80",
    },
    {
        "category": "ethnic-couture",
        "name": "Pastel Ombre Lehenga - Floral Sequin",
        "description": "Dreamy ombre lehenga in pastel pink to lavender with floral sequin embroidery. Perfect for mehendi and cocktail events.",
        "price": Decimal("22800.00"), "stock": 12,
        "sku": "WOM-LEH-002",
        "image_url": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
    },
    {
        "category": "ethnic-couture",
        "name": "Phulkari Dupatta - Punjab Heritage",
        "description": "Hand-embroidered Phulkari dupatta from Punjab with vibrant floral motifs on cotton khaddar base. Crafted by artisan women cooperatives.",
        "price": Decimal("3800.00"), "stock": 40,
        "sku": "WOM-DUP-001",
        "image_url": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80",
    },
    {
        "category": "ethnic-couture",
        "name": "Mustard Yellow Sharara Set - Mirror Work",
        "description": "Festive mustard sharara suit with intricate mirror work and gota patti embroidery. A Rajasthani folk-inspired luxury ensemble.",
        "price": Decimal("9600.00"), "stock": 18,
        "sku": "WOM-SHA-001",
        "image_url": "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600&q=80",
    },
    {
        "category": "ethnic-couture",
        "name": "Black Velvet Lehenga - Gold Cutdana",
        "description": "Opulent black velvet lehenga with dense gold cutdana and sequin embroidery. The ultimate reception-night statement piece.",
        "price": Decimal("56000.00"), "stock": 5,
        "sku": "WOM-LEH-003",
        "image_url": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
    },
    {
        "category": "ethnic-couture",
        "name": "Linen Kurti - Hand-painted Kalamkari",
        "description": "Breezy linen kurti with authentic Andhra Kalamkari hand painting. Each kurti is unique. Perfect for casual festive outings and pujas.",
        "price": Decimal("2900.00"), "stock": 50,
        "sku": "WOM-KUR-001",
        "image_url": "https://images.unsplash.com/photo-1614885157702-0e0b1c463b91?w=600&q=80",
    },
    {
        "category": "ethnic-couture",
        "name": "Royal Blue Lucknowi Chikankari Kurta Set",
        "description": "Handcrafted Lucknowi Chikankari white-on-blue georgette kurta with matching palazzo and dupatta. The epitome of Awadhi elegance.",
        "price": Decimal("8400.00"), "stock": 22,
        "sku": "WOM-CHI-001",
        "image_url": "https://images.unsplash.com/photo-1614885157702-0e0b1c463b91?w=600&q=80",
    },
    {
        "category": "ethnic-couture",
        "name": "Wine Kanchi Pattu Silk Saree - Temple Border",
        "description": "Rich wine-coloured Kanchi Pattu with traditional temple border and contrast peacock pallu. Pure silk, heavy zari work. An heirloom piece.",
        "price": Decimal("31500.00"), "stock": 8,
        "sku": "WOM-SAR-003",
        "image_url": "https://images.unsplash.com/photo-1614885157702-0e0b1c463b91?w=600&q=80",
    },

    # ---- MEN (western-luxe) ------------------------------------
    {
        "category": "western-luxe",
        "name": "Ivory Silk Sherwani - Royal Groom",
        "description": "Ivory raw silk sherwani with intricate thread embroidery, gota patti detailing, and Nehru collar. Comes with churidar and silk dupatta.",
        "price": Decimal("38500.00"), "stock": 10,
        "sku": "MEN-SHE-001",
        "image_url": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80",
    },
    {
        "category": "western-luxe",
        "name": "Navy Bandhgala Suit - Bespoke Italian Wool",
        "description": "Structured navy bandhgala in premium Italian wool with hand-stitched detailing and mandarin collar. Power dressing for boardrooms and weddings.",
        "price": Decimal("22000.00"), "stock": 15,
        "sku": "MEN-BAN-001",
        "image_url": "https://images.unsplash.com/photo-1594938298603-c8148c4b4396?w=600&q=80",
    },
    {
        "category": "western-luxe",
        "name": "Sangeet Kurta Set - Resham Embroidered",
        "description": "Vibrant resham-embroidered kurta in royal blue with matching silk trousers and bandi jacket. Perfect for sangeet and engagement ceremonies.",
        "price": Decimal("11500.00"), "stock": 20,
        "sku": "MEN-KUR-001",
        "image_url": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80",
    },
    {
        "category": "western-luxe",
        "name": "Charcoal Double-Breasted Blazer - Premium Wool",
        "description": "Sophisticated charcoal double-breasted blazer in Merino wool blend with peak lapels and contrast buttons.",
        "price": Decimal("16800.00"), "stock": 18,
        "sku": "MEN-BLZ-001",
        "image_url": "https://images.unsplash.com/photo-1594938298603-c8148c4b4396?w=600&q=80",
    },
    {
        "category": "western-luxe",
        "name": "Jade Green Indo-Western Jacket Set",
        "description": "Embroidered jade green Nehru jacket with matching kurta and trousers. Subtle geometric threadwork, silk lining.",
        "price": Decimal("14200.00"), "stock": 12,
        "sku": "MEN-IDW-001",
        "image_url": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80",
    },
    {
        "category": "western-luxe",
        "name": "Beige Linen Kurta - Minimalist Summer",
        "description": "Breathable handloom linen kurta with minimalist white-on-beige Chikankari embroidery. Paired with cotton pyjama.",
        "price": Decimal("4200.00"), "stock": 35,
        "sku": "MEN-KUR-002",
        "image_url": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80",
    },
    {
        "category": "western-luxe",
        "name": "Black Velvet Jodhpuri Suit",
        "description": "Regal black velvet Jodhpuri suit with gold buttons and satin lapel. Commands attention at every black-tie event.",
        "price": Decimal("28000.00"), "stock": 8,
        "sku": "MEN-JOD-001",
        "image_url": "https://images.unsplash.com/photo-1594938298603-c8148c4b4396?w=600&q=80",
    },
    {
        "category": "western-luxe",
        "name": "Maroon Brocade Sherwani - Festive",
        "description": "Rich maroon brocade sherwani with intricate golden weave and matching churidar. Complete festive ensemble for Diwali, Eid, and weddings.",
        "price": Decimal("18500.00"), "stock": 14,
        "sku": "MEN-SHE-002",
        "image_url": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80",
    },
    {
        "category": "western-luxe",
        "name": "Stone Grey Wool Overcoat - Runway Edit",
        "description": "Longline stone grey overcoat in 100% Italian wool. Satin-lined. Pairs with sherwanis or western formals for a dramatic winter look.",
        "price": Decimal("34000.00"), "stock": 6,
        "sku": "MEN-OVR-001",
        "image_url": "https://images.unsplash.com/photo-1594938298603-c8148c4b4396?w=600&q=80",
    },
    {
        "category": "western-luxe",
        "name": "White Pathani Suit - Hand Embroidered",
        "description": "Crisp white cotton Pathani suit with hand-embroidered neckline and cuffs. Ideal for Eid celebrations.",
        "price": Decimal("5600.00"), "stock": 28,
        "sku": "MEN-PAT-001",
        "image_url": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80",
    },
    {
        "category": "western-luxe",
        "name": "Royal Purple Velvet Blazer - Embossed",
        "description": "Royal purple velvet blazer with tone-on-tone embossed floral pattern. Slim fit. The showstopper for reception nights.",
        "price": Decimal("19500.00"), "stock": 9,
        "sku": "MEN-BLZ-002",
        "image_url": "https://images.unsplash.com/photo-1594938298603-c8148c4b4396?w=600&q=80",
    },

    # ---- KIDS (boys-kids-wear) ----------------------------------
    {
        "category": "boys-kids-wear",
        "name": "Little Prince Sherwani Set - Gold",
        "description": "Adorable gold silk sherwani with matching churidar and embroidered dupatta for boys. Perfect for weddings and festive occasions. Ages 2-12.",
        "price": Decimal("6800.00"), "stock": 25,
        "sku": "KID-BOY-001",
        "image_url": "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&q=80",
    },
    {
        "category": "boys-kids-wear",
        "name": "Princess Lehenga - Mini Bridal Rose",
        "description": "Fairytale rose pink lehenga with floral embroidery for girls. Comes with matching choli and dupatta. Ages 3-14.",
        "price": Decimal("5400.00"), "stock": 30,
        "sku": "KID-GRL-001",
        "image_url": "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&q=80",
    },
    {
        "category": "boys-kids-wear",
        "name": "Boys Bandhgala Suit - Mini Edition",
        "description": "Miniature navy bandhgala with gold buttons and mandarin collar. Perfect for school functions and Diwali. Ages 4-14.",
        "price": Decimal("4200.00"), "stock": 22,
        "sku": "KID-BOY-002",
        "image_url": "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&q=80",
    },
    {
        "category": "boys-kids-wear",
        "name": "Girls Anarkali Set - Butterfly Pink",
        "description": "Fluffy butterfly-pink anarkali with sequin work for little fashionistas. Great for birthday parties. Ages 3-12.",
        "price": Decimal("3800.00"), "stock": 35,
        "sku": "KID-GRL-002",
        "image_url": "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&q=80",
    },
    {
        "category": "boys-kids-wear",
        "name": "Kids Festive Kurta Set - Lemon Yellow",
        "description": "Bright lemon yellow cotton kurta with matching pants. Lightweight, festive, and machine washable. Ages 2-10.",
        "price": Decimal("2200.00"), "stock": 40,
        "sku": "KID-UNI-001",
        "image_url": "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&q=80",
    },
    {
        "category": "boys-kids-wear",
        "name": "Royal Blue Tuxedo - Boys Wedding",
        "description": "Dapper royal blue tuxedo with satin lapels and bow-tie for little grooms and ring bearers. Ages 5-16.",
        "price": Decimal("7600.00"), "stock": 15,
        "sku": "KID-BOY-003",
        "image_url": "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&q=80",
    },

    # ---- JEWELLERY (fine-jewellery) ----------------------------
    {
        "category": "fine-jewellery",
        "name": "Polki Kundan Bridal Choker Set",
        "description": "Magnificent 22k gold-plated polki kundan choker with matching jhumka earrings, maang tikka, and passa. The centrepiece of every bridal trousseau.",
        "price": Decimal("85000.00"), "stock": 5,
        "sku": "JEW-POL-001",
        "image_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80",
    },
    {
        "category": "fine-jewellery",
        "name": "Heritage Jhumka Earrings - Antique Gold",
        "description": "Handcrafted antique gold jhumkas with pearl drops and filigree work. Traditional Rajasthani craftsmanship.",
        "price": Decimal("8500.00"), "stock": 25,
        "sku": "JEW-JHU-001",
        "image_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80",
    },
    {
        "category": "fine-jewellery",
        "name": "Rose Gold Diamond Tennis Bracelet",
        "description": "Delicate 18k rose gold bracelet with 1.2ct total weight diamonds in prong setting. Hallmarked and certified.",
        "price": Decimal("42000.00"), "stock": 10,
        "sku": "JEW-BRA-001",
        "image_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80",
    },
    {
        "category": "fine-jewellery",
        "name": "Temple Lakshmi Necklace - South Indian",
        "description": "22k gold-plated South Indian temple necklace with Goddess Lakshmi coins, ruby and emerald glass stones, and pearl drops.",
        "price": Decimal("16500.00"), "stock": 12,
        "sku": "JEW-TEM-001",
        "image_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80",
    },
    {
        "category": "fine-jewellery",
        "name": "Emerald Solitaire Ring - 18k White Gold",
        "description": "Natural 1.5ct Colombian emerald in bezel setting with 18k white gold band and diamond side stones. GIA certified.",
        "price": Decimal("128000.00"), "stock": 3,
        "sku": "JEW-RNG-001",
        "image_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80",
    },
    {
        "category": "fine-jewellery",
        "name": "Oxidised Silver Tribal Bangles - Set of 6",
        "description": "Handcrafted oxidised silver bangles with tribal motifs from Rajasthan. Set of 6 in graduated sizes.",
        "price": Decimal("4200.00"), "stock": 30,
        "sku": "JEW-BNG-001",
        "image_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80",
    },

    # ---- HANDBAGS (luxury-handbags) ----------------------------
    {
        "category": "luxury-handbags",
        "name": "SIVORA Signature Tote - Pebbled Leather",
        "description": "Spacious pebbled calf leather tote in cognac brown with gold-tone hardware and suede interior.",
        "price": Decimal("28000.00"), "stock": 12,
        "sku": "BAG-TOT-001",
        "image_url": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80",
    },
    {
        "category": "luxury-handbags",
        "name": "Quilted Sling Bag - Midnight Navy",
        "description": "Diamond-quilted lambskin sling bag in midnight navy with 24k gold-tone chain strap.",
        "price": Decimal("18500.00"), "stock": 15,
        "sku": "BAG-SLG-001",
        "image_url": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80",
    },
    {
        "category": "luxury-handbags",
        "name": "Beaded Minaudiere Clutch - Bridal",
        "description": "Handcrafted bridal clutch with crystal and pearl bead embroidery. Gold frame, push-lock clasp, detachable chain.",
        "price": Decimal("9800.00"), "stock": 20,
        "sku": "BAG-CLT-001",
        "image_url": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80",
    },
    {
        "category": "luxury-handbags",
        "name": "Structured Bucket Bag - Nude Nappa",
        "description": "Italian nappa leather bucket bag in warm nude with contrast drawstring and crossbody strap. Everyday luxury.",
        "price": Decimal("22000.00"), "stock": 10,
        "sku": "BAG-BKT-001",
        "image_url": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80",
    },
    {
        "category": "luxury-handbags",
        "name": "Handloom Potli - Silk Embroidered",
        "description": "Traditional silk potli bag with zari embroidery and golden drawstring cord. Perfect for weddings and festive occasions.",
        "price": Decimal("2800.00"), "stock": 40,
        "sku": "BAG-POT-001",
        "image_url": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80",
    },

    # ---- BEAUTY (beauty-fragrances) ----------------------------
    {
        "category": "beauty-fragrances",
        "name": "SIVORA Oud Noir - Eau de Parfum 100ml",
        "description": "SIVORA's signature fragrance with notes of Cambodian oud, Bulgarian rose, amber, and white musk. 18-hour wear. Handcut crystal flacon.",
        "price": Decimal("12500.00"), "stock": 20,
        "sku": "BEA-FRG-001",
        "image_url": "https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80",
    },
    {
        "category": "beauty-fragrances",
        "name": "Saffron Glow Royal Face Serum - 30ml",
        "description": "24k gold-infused saffron serum with hyaluronic acid, turmeric, and rose hip oil. Brightens and adds a luminous glow.",
        "price": Decimal("6800.00"), "stock": 30,
        "sku": "BEA-SER-001",
        "image_url": "https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80",
    },
    {
        "category": "beauty-fragrances",
        "name": "Velvet Matte Lip Pigment - Set of 5",
        "description": "Rich matte lip pigments in 5 shades: Royal Mauve, Bridal Red, Nude Satin, Berry Noir, Coral Sunrise. 8-hour wear.",
        "price": Decimal("3400.00"), "stock": 45,
        "sku": "BEA-LIP-001",
        "image_url": "https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80",
    },
    {
        "category": "beauty-fragrances",
        "name": "Rose & Jasmine Body Oil - Luxury Ritual",
        "description": "Ayurvedic body oil with Bulgarian rose, Mysore jasmine, vitamin E, and cold-pressed sesame oil. Satin finish.",
        "price": Decimal("4200.00"), "stock": 25,
        "sku": "BEA-OIL-001",
        "image_url": "https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80",
    },
    {
        "category": "beauty-fragrances",
        "name": "Mogra & Sandalwood Candle - 200g",
        "description": "Hand-poured soy wax candle with mogra and Mysore sandalwood essential oils. 40-hour burn. SIVORA signature matte black jar.",
        "price": Decimal("2200.00"), "stock": 50,
        "sku": "BEA-CAN-001",
        "image_url": "https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80",
    },
]


def run():
    db = SessionLocal()
    try:
        print("STEP 1: Wiping all existing data...")
        db.query(ChatMessage).delete()
        db.query(OrderItem).delete()
        db.query(Order).delete()
        db.query(Product).delete()
        db.query(Category).delete()
        db.commit()
        print("  Done - all tables cleared.")

        if HAS_CACHE:
            try:
                cache = AICacheService()
                cache.clear_all()
                print("  Redis AI cache cleared.")
            except Exception as e:
                print(f"  Redis cache skip: {e}")

        if HAS_RAG:
            try:
                rag = RAGService()
                rag.clear_collection()
                print("  ChromaDB cleared.")
            except Exception as e:
                print(f"  ChromaDB clear skip: {e}")

        print("\nSTEP 2: Seeding categories...")
        cat_map = {}
        for c in CATEGORIES:
            cat = Category(name=c["name"], slug=c["slug"], description=c["description"])
            db.add(cat)
            db.flush()
            cat_map[c["slug"]] = cat.id
            print(f"  [{cat.id}] {c['name']}  slug={c['slug']}")
        db.commit()

        print(f"\nSTEP 3: Seeding {len(PRODUCTS)} products...")
        seeded = []
        for idx, p in enumerate(PRODUCTS, 1):
            cat_id = cat_map.get(p["category"])
            if not cat_id:
                print(f"  SKIP {p['name']} - unknown category {p['category']}")
                continue
            prod = Product(
                name=p["name"],
                description=p["description"],
                price=p["price"],
                stock=p["stock"],
                image_url=p.get("image_url", ""),
                sku=p.get("sku", f"SKU-{idx:04d}"),
                category_id=cat_id,
            )
            db.add(prod)
            seeded.append(prod)
        db.commit()
        print(f"  {len(seeded)} products saved.")

        if HAS_RAG and seeded:
            print("\nSTEP 4: Indexing ChromaDB...")
            try:
                db.expire_all()
                all_prods = db.query(Product).all()
                rag = RAGService()
                rag.index_products(all_prods)
                print(f"  {len(all_prods)} products indexed.")
            except Exception as e:
                print(f"  ChromaDB index skip: {e}")

        print("\nSTEP 5: Ensuring admin user...")
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin = User(
                username="admin",
                email="admin@sivora.com",
                full_name="SIVORA Admin",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.admin,
                is_active=True,
            )
            db.add(admin)
            db.commit()
            print("  Admin created: admin / admin123")
        else:
            print("  Admin already exists.")

        print("\n" + "=" * 55)
        print("  SIVORA Fresh Seed COMPLETE!")
        print("=" * 55)
        print(f"  Categories : {len(CATEGORIES)}")
        print(f"  Products   : {len(seeded)}")
        print(f"  Admin      : admin@sivora.com / admin123")
        print("=" * 55)

    finally:
        db.close()


if __name__ == "__main__":
    run()

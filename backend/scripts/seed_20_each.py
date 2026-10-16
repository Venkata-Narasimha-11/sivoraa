# -*- coding: utf-8 -*-
"""
SIVORA -- 20 Authentic Luxury Products per Category (160 total across 8 categories)
"""
import sys
import io
import re
from pathlib import Path
from decimal import Decimal

# Force UTF-8 stream output
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import SessionLocal
from app.models import Category, Product, Order, OrderItem, ChatMessage

def slugify(s: str) -> str:
    s = s.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')

CATEGORIES_DATA = [
    {
        "name": "Women",
        "slug": "ethnic-couture",
        "description": "Handcrafted bridal lehengas, banarasi silk sarees, regal anarkalis, festive shararas, and designer kurtis.",
    },
    {
        "name": "Men",
        "slug": "western-luxe",
        "description": "Royal sherwanis, silk kurtas, bandhgala suits, designer blazers, and sartorial fusion for men.",
    },
    {
        "name": "Kids",
        "slug": "boys-kids-wear",
        "description": "Festive sherwanis, bandhgalas, princess lehengas, and celebration wear for little royals.",
    },
    {
        "name": "Footwear",
        "slug": "footwear",
        "description": "Zardozi embroidered juttis, Italian leather loafers, crystal stilettos, and handcrafted mojaris.",
    },
    {
        "name": "Accessories",
        "slug": "luxury-handbags",
        "description": "Italian leather totes, quilted slings, handcrafted bridal potlis, minaudières, belts, and luxury watches.",
    },
    {
        "name": "Jewelry",
        "slug": "fine-jewellery",
        "description": "Polki kundan chokers, 22k temple necklaces, diamond tennis bracelets, and heirloom jhumkas.",
    },
    {
        "name": "Fragrance & Gifts",
        "slug": "beauty-fragrances",
        "description": "SIVORA signature perfumes, extrait de parfum, 24k saffron elixirs, and bespoke gifting hampers.",
    },
    {
        "name": "Home Luxe",
        "slug": "home-luxe",
        "description": "Hand-poured candles, raw silk cushions, brass centerpieces, marble accents, and cashmere throws.",
    },
]

# 20 products per category
CAT_PRODUCTS = {
    # ── 1. WOMEN (20 products) ──────────────────────────────────────────────────
    "ethnic-couture": [
        (
            "Crimson Bridal Lehenga — Zardozi Edition",
            "Hand-embroidered crimson lehenga with real gold zari zardozi craft, pure tissue silk choli, and dual sheer organza dupattas. Designed for the majestic bride.",
            Decimal("48500.00"), 8, "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Banarasi Katan Silk Saree — Royal Kadhwa Buta",
            "Authentic Varanasi handloom woven in pure katan silk featuring intricate kadhwa buta in certified gold zari. Includes unstitched pure silk blouse fabric.",
            Decimal("18900.00"), 15, "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Ivory Organza Anarkali — Hand Resham Embroidered",
            "Floor-length layered ivory organza anarkali with delicate tone-on-tone resham embroidery, micro-sequin scatter, and butter-soft silk inner lining.",
            Decimal("12400.00"), 20, "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Deep Teal Kanjivaram Silk Saree — Temple Zari",
            "Woven by master artisans of Kanchipuram using pure mulberry silk. Contrasting korvai crimson border with real zari temple motifs.",
            Decimal("24600.00"), 10, "https://images.unsplash.com/photo-1614885157702-0e0b1c463b91?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Pastel Ombre Lehenga — Floral Sequin Symphony",
            "Delicate blush-to-lavender georgette lehenga adorned with French sequin flowers, lightweight cancan structure, and sweetheart-neck designer blouse.",
            Decimal("22800.00"), 12, "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Chanderi Silk Suit Set — Handblock Heritage",
            "Authentic Chanderi silk kurta with delicate zari border, handblock vegetable dye print, matching dupatta, and comfortable cigarette pants.",
            Decimal("7200.00"), 25, "https://images.unsplash.com/photo-1614886137799-a9c3d4af72ba?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Mustard Yellow Sharara Set — Gota Patti Craft",
            "Festive Rajasthani short kurti paired with multi-tiered flared sharara pants and hand-embroidered gota patti dupatta. Ideal for Haldi and Sangeet.",
            Decimal("9600.00"), 18, "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Midnight Velvet Reception Gown — Crystal Encrusted",
            "Dramatic midnight blue plush velvet evening gown with structural corset boning, cascading train, and hand-embroidered Swarovski crystals.",
            Decimal("56000.00"), 5, "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Lucknowi Chikankari Georgette Kurta — Mukaish Details",
            "Handcrafted in Lucknow with 32 intricate shadow stitches, shimmering silver mukaish dots, matching flared palazzos, and modal cotton slip.",
            Decimal("8400.00"), 22, "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Royal Wine Kanchi Pattu Saree — Peacock Zari",
            "Heirloom heavy silk saree in deep wine red with gold zari peacock pallu, woven by national award-winning weavers. Certified Silk Mark product.",
            Decimal("31500.00"), 8, "https://images.unsplash.com/photo-1614885157702-0e0b1c463b91?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Rose Blush Tulle Evening Saree — Scallop Border",
            "Contemporary French tulle pre-draped saree with hand-cut scalloped beadwork border and sculpted sequin bustier blouse.",
            Decimal("16800.00"), 14, "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Emerald Silk Paithani Saree — Handwoven Asavali",
            "Maharashtrian heritage saree in rich emerald silk featuring the classic Asavali vine border and kaleidoscope peacock pallu in pure gold zari.",
            Decimal("27400.00"), 9, "https://images.unsplash.com/photo-1614885157702-0e0b1c463b91?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Marigold Yellow Haldi Lehenga Set — Mirror Work",
            "Vibrant yellow georgette lehenga scattered with original mirror work, scalloped latkans, and breathable cotton lining for day-long comfort.",
            Decimal("14900.00"), 16, "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Raw Silk Cape Anarkali — Contemporary Drape",
            "Modern Indian silhouette: floor-touching bottle green raw silk gown paired with an asymmetric embroidered cape overlay in metallic thread.",
            Decimal("18200.00"), 11, "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Kashmiri Tilla Embroidered Pashmina Kurti",
            "Pure fine Cashmere pashmina kurti hand-embroidered with authentic gold Tilla needlework from the Kashmir valley. Winter luxury redefined.",
            Decimal("11500.00"), 13, "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Indigo Hand-Painted Kalamkari Silk Saree",
            "Handcrafted in Srikalahasti using organic vegetable dyes on handspun tussar silk, depicting mythological florets and temple murals.",
            Decimal("13800.00"), 12, "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Lavender Sequinned Cocktail Saree — Modern Silhouette",
            "Light-catching micro-sequinned saree on fluid georgette fabric with statement designer backless blouse. Effortless glamour for cocktail soirees.",
            Decimal("15200.00"), 15, "https://images.unsplash.com/photo-1614885157702-0e0b1c463b91?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Royal Ruby Velvet Bridal Choli & Dupatta Set",
            "Stand-alone luxury velvet bridal blouse encrusted with dabka, nakshi, and pearls, accompanied by a matching double-bordered organza veil.",
            Decimal("21000.00"), 7, "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Hand-Woven Champa Silk Angrakha Suit",
            "Traditional cross-over angrakha kurti in pristine champa silk with contrast piping, handcrafted fabric tassels, and churidar pants.",
            Decimal("8900.00"), 20, "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Ivory Pearl-Embellished Peplum Lehenga",
            "Fusion festive ensemble featuring an embroidered peplum top with seed pearl fringe and a voluminous multi-kalidar lehenga skirt.",
            Decimal("34000.00"), 6, "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80"
        ),
    ],

    # ── 2. MEN (20 products) ────────────────────────────────────────────────────
    "western-luxe": [
        (
            "Ivory Raw Silk Sherwani — Royal Groom Ensemble",
            "Bespoke ivory raw silk sherwani tailored with intricate tone-on-tone resham embroidery, handcrafted royal crest buttons, churidar, and stole.",
            Decimal("38500.00"), 10, "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Navy Italian Wool Bandhgala Suit — Tailored Fit",
            "Structured mandarin-collar bandhgala crafted in premium Super 120s Italian wool with horn buttons and tapered slim-fit trousers.",
            Decimal("22000.00"), 14, "https://images.unsplash.com/photo-1594938298603-c8148c4b4396?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Royal Sangeet Kurta Set — Resham Embroidered",
            "Vibrant royal blue silk kurta embellished with geometric needlework across the yoke and collar, paired with matching churidars.",
            Decimal("11500.00"), 20, "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Charcoal Double-Breasted Merino Blazer",
            "Sharp double-breasted tailoring in 100% fine Merino wool blend featuring wide peak lapels, cupro lining, and tortoiseshell buttons.",
            Decimal("16800.00"), 15, "https://images.unsplash.com/photo-1594938298603-c8148c4b4396?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Jade Green Silk Nehru Jacket with Churidars",
            "Subtly textured raw silk bandi waistcoat in rich jade green with metallic welt pockets, layered over a crisp ivory handloom kurta.",
            Decimal("14200.00"), 12, "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Minimalist Handloom Linen Kurta — Summer Beige",
            "Breathable 100% European flax linen kurta in natural beige with concealed placket and side pocket detailing. Effortless elegance.",
            Decimal("4200.00"), 35, "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Midnight Black Velvet Jodhpuri Suit",
            "Opulent black plush velvet tailored jacket with structured padded shoulders, gold-rimmed enamelled buttons, and matching dress trousers.",
            Decimal("28000.00"), 8, "https://images.unsplash.com/photo-1594938298603-c8148c4b4396?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Maroon Brocade Sherwani — Antique Zari Weave",
            "Heritage Banarasi brocade sherwani woven with antique gold motifs, mandarin collar, concealed front closure, and tailored churidar.",
            Decimal("18500.00"), 14, "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Stone Grey Longline Italian Wool Overcoat",
            "Classic knee-length tailored overcoat in stone grey wool-cashmere blend with single back vent, notch lapels, and satin inner lining.",
            Decimal("34000.00"), 6, "https://images.unsplash.com/photo-1594938298603-c8148c4b4396?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Pristine White Cotton Pathani Suit Set",
            "Classic Afghan-inspired Pathani suit in long-staple Egyptian cotton featuring epaulette shoulders, patch pockets, and comfort salwar.",
            Decimal("5600.00"), 28, "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Royal Purple Embossed Velvet Tuxedo Jacket",
            "Showstopper evening jacket with subtle damask embossing, midnight black grosgrain silk lapels, and silk-covered button closures.",
            Decimal("19500.00"), 9, "https://images.unsplash.com/photo-1594938298603-c8148c4b4396?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Powder Blue Chikankari Silk Kurta Set",
            "Handcrafted Lucknow Chikankari embroidery in ivory thread over a serene powder blue modal silk kurta with matching pants.",
            Decimal("9800.00"), 22, "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Olive Green Safari Suit — Luxury Cotton Blend",
            "Contemporary tailored safari suit featuring four pleated bellows pockets, belted waist option, and relaxed straight-leg trousers.",
            Decimal("12900.00"), 16, "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Hand-Woven Tussar Silk Bandi Waistcoat",
            "Textured raw tussar silk waistcoat in rich copper bronze with carved wooden buttons. Layers effortlessly over shirts or kurtas.",
            Decimal("6800.00"), 24, "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Bespoke Cashmere Wool Dinner Jacket — Satin Lapel",
            "Ultra-refined black-tie single-breasted dinner jacket woven in Mongolian cashmere-wool with hand-stitched silk peak lapels.",
            Decimal("36000.00"), 7, "https://images.unsplash.com/photo-1594938298603-c8148c4b4396?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Classic Black Silk Achkan with Jewelled Buttons",
            "Calf-length traditional Indian achkan coat in structured black raw silk accented by removable natural emerald crystal buttons.",
            Decimal("26500.00"), 9, "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Mustard Festive Silk Kurta & Dhoti Pants",
            "Pre-pleated ready-to-wear silk dhoti pants paired with a tailored festive mustard kurta accented by gold threadwork at the collar.",
            Decimal("7800.00"), 20, "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Houndstooth Tailored Overcoat — British Cut",
            "Timeless monochrome micro-houndstooth wool overcoat featuring horn button front, flap pockets, and deep crimson interior lining.",
            Decimal("29000.00"), 8, "https://images.unsplash.com/photo-1594938298603-c8148c4b4396?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Textured Linen Casual Blazer — Sand Dune",
            "Unstructured, featherweight sand dune linen blazer with patch pockets and double vent. Perfect for destination weddings and summer soirees.",
            Decimal("13500.00"), 18, "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Regal Angrakha Style Groom Sherwani in Champagne",
            "Asymmetric diagonal closure sherwani in champagne tussar silk with micro-pearl edging and handcrafted zardozi belt accessory.",
            Decimal("42000.00"), 6, "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80"
        ),
    ],

    # ── 3. KIDS (20 products) ───────────────────────────────────────────────────
    "boys-kids-wear": [
        (
            "Little Prince Gold Zari Sherwani Set",
            "Miniature royal sherwani in soft gold dupion silk with delicate zari embroidery, cotton lining for sensitive skin, and matching churidar. Ages 2-12.",
            Decimal("6800.00"), 25, "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Fairytale Rose Pink Mini Bridal Lehenga",
            "Dreamy flared rose pink net lehenga for little girls featuring sequin florals, soft cotton-can underlayers, and lightweight dupatta. Ages 3-14.",
            Decimal("5400.00"), 30, "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Miniature Navy Blue Bandhgala Suit",
            "Sharp bandhgala jacket with metallic buttons and slim trousers for boys. Wrinkle-resistant luxury fabric designed for playful celebrations. Ages 4-14.",
            Decimal("4200.00"), 22, "https://images.unsplash.com/photo-1471286174890-9c112ffca564?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Butterfly Pink Anarkali with Sequin Highlights",
            "Floor-grazing festive anarkali in pastel butterfly pink with glittering sequin border and matching soft churidars. Ages 3-12.",
            Decimal("3800.00"), 35, "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Lemon Yellow Festive Cotton Kurta & Churidar",
            "Breathable organic cotton kurta in sunny lemon yellow featuring mirror-work neckline and elasticated churidar pyjamas. Ages 2-10.",
            Decimal("2200.00"), 40, "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Royal Blue Dapper Wedding Tuxedo with Bow Tie",
            "Tailored 3-piece tuxedo set for young ring-bearers and wedding guests featuring satin lapels, vest, trousers, and pre-tied bow tie. Ages 5-16.",
            Decimal("7600.00"), 15, "https://images.unsplash.com/photo-1471286174890-9c112ffca564?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Mint Green Organza Princess Frock — Hand Beaded",
            "Tiered ruffle party dress in shimmering mint green organza with seed pearl bodice embellishments and satin waist sash. Ages 3-11.",
            Decimal("4900.00"), 20, "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Boys Ruby Red Jacquard Kurta with Nehru Jacket",
            "Two-piece ensemble featuring a patterned brocade Nehru waistcoat over a comfortable ruby red silk-blend kurta and pyjama. Ages 4-13.",
            Decimal("3600.00"), 25, "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Peach Floral Jacquard Girls Pattu Pavada Set",
            "Traditional South Indian festive pavada in pure silk-blend peach jacquard with contrast peacock golden border and puff sleeves. Ages 1-10.",
            Decimal("4500.00"), 28, "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Ivory Dupion Silk Dhoti Kurta Set for Toddlers",
            "Pre-stitched Velcro-assisted dhoti with a gold-bordered matching dupion silk kurta for effortless toddler dressing. Ages 6m-4y.",
            Decimal("2800.00"), 35, "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Lavender Tiered Tulle Birthday Gown",
            "Multiple cascades of soft tulle with trailing floral appliques, cap sleeves, and breathable cotton inner lining for birthday celebrations. Ages 3-12.",
            Decimal("5200.00"), 18, "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Emerald Green Festive Kurta Pyjama with Dupatta",
            "Rich jewel-toned green kurta with antique gold embroidery along the collar, paired with white pyjamas and crushed silk stole. Ages 4-14.",
            Decimal("3200.00"), 26, "https://images.unsplash.com/photo-1471286174890-9c112ffca564?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Sunshine Yellow Mirror Work Sharara Set",
            "Short peplum top adorned with round mirror embroidery paired with tiered bell-bottom sharara pants for girls. Ages 4-12.",
            Decimal("4100.00"), 22, "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Boys Velvet Blazer with Pocket Square",
            "Plush midnight velvet single-breasted blazer with gold crest metal buttons and silk pocket square for young gentlemen. Ages 5-15.",
            Decimal("4800.00"), 20, "https://images.unsplash.com/photo-1471286174890-9c112ffca564?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Hand-Embroidered Chanderi Kurti & Dhoti for Girls",
            "Modern ethnic fusion: Chanderi silk kurti with hand-embroidered bird motifs paired with tulip dhoti pants. Ages 3-10.",
            Decimal("3400.00"), 24, "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Royal Marigold Brocade Angrakha Set for Boys",
            "Overlapping angrakha-cut brocade kurta with contrast silk fabric ties and churidar pants. Heritage festive wear for Diwali & Weddings. Ages 2-10.",
            Decimal("3900.00"), 22, "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Sky Blue Net Princess Ball Gown with Bow",
            "Voluminous multi-layered net gown with shimmering silver stardust sequins, illusion neckline, and oversized back bow. Ages 4-12.",
            Decimal("5800.00"), 16, "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Traditional South Indian Silk Pattu Langa",
            "Pure Kanchi silk pattu langa in magenta pink with emerald green temple border and matching blouse. Heirloom festive kids wear. Ages 1-8.",
            Decimal("4600.00"), 25, "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Coral Silk Blend Nehru Jacket with Contrast Kurta",
            "Vibrant coral pink jacquard bandi vest over a cream cotton-silk kurta and pyjama set. Light, stylish, and festive. Ages 3-12.",
            Decimal("3500.00"), 30, "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Ivory Pearl-Encrusted Mini Sherwani",
            "Masterpiece groom-style mini sherwani for special weddings featuring pearl embroidery on high-grade silk, matching safa turban option. Ages 4-14.",
            Decimal("7200.00"), 12, "https://images.unsplash.com/photo-1471286174890-9c112ffca564?auto=format&fit=crop&w=600&q=80"
        ),
    ],

    # ── 4. FOOTWEAR (20 products) ───────────────────────────────────────────────
    "footwear": [
        (
            "Royal Zardozi Embroidered Velvet Juttis — Gold",
            "Handcrafted in Punjab using genuine leather base and plush velvet upper embellished with real metallic gold zardozi and dabka threadwork.",
            Decimal("4800.00"), 25, "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Milano Crystal Stiletto Pumps — Champagne Silk",
            "Italian-crafted 100mm satin pumps adorned with an asymmetric cluster of brilliant-cut Swarovski crystal baguettes. The bridal runway staple.",
            Decimal("18500.00"), 10, "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Handcrafted Leather Mojaris with Antique Dabka",
            "Traditional pointed-toe slip-on mojaris in soft vegetable-tanned leather lined with foam cushioning for hours of wedding wear comfort.",
            Decimal("3900.00"), 30, "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Italian Burnished Calfskin Penny Loafers",
            "Blake-stitched dress loafers in hand-burnished mahogany calf leather with leather outsoles and ergonomic memory foam insoles.",
            Decimal("14200.00"), 16, "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Metallic Rose Gold Ankle-Strap Block Heels",
            "70mm sturdy block heels in metallic textured leather with delicate ankle buckle strap. The ideal blend of height and wedding dancefloor comfort.",
            Decimal("8900.00"), 22, "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Hand-stitched Double Monkstrap Shoes — Cognac",
            "Goodyear-welted full-grain cognac leather double monkstraps with polished brass buckles and hand-painted fiddleback waist sole.",
            Decimal("16000.00"), 12, "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Pearl-Embellished Mule Sandals — Ivory Satin",
            "Pointed-toe backless mules draped in pure ivory satin featuring a graduated faux-pearl bridge strap and sculpted flared heel.",
            Decimal("6500.00"), 20, "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Velvet Slip-on Smoking Slippers — Lion Crest",
            "Midnight black velvet formal slippers featuring gold wire embroidered royal lion crest and quilted crimson satin lining.",
            Decimal("7800.00"), 18, "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Strappy Bridal Wedge Sandals with Kundan Work",
            "80mm cushioned ethnic wedges with hand-set kundan stone straps and non-slip textured rubber outsoles. Tailored for bridal lehengas.",
            Decimal("7200.00"), 24, "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Oxford Dress Shoes in Full Grain Leather — Espresso",
            "Timeless closed-lacing dress shoes crafted in French espresso calf leather with leather sole and bevelled waist. Black-tie formal perfection.",
            Decimal("15500.00"), 14, "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Floral Dabka Work Kolhapuri Chappals",
            "Artisanal Kolhapuri slip-ons in natural untreated leather embellished with delicate golden dabka flowers and signature braided toe loop.",
            Decimal("3200.00"), 35, "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Satin Slingback Heels with Crystal Buckle",
            "Classic 85mm slingbacks in emerald green silk satin highlighted by an opulent square crystal brooch on the pointed vamp.",
            Decimal("12800.00"), 15, "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Classic Chelsea Boots in Hand-Finished Suede",
            "Snuff suede Chelsea boots with Goodyear welted Dainite rubber soles and durable elastic side gussets. Effortless luxury wardrobe staple.",
            Decimal("13900.00"), 16, "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Embroidered Mirror Work Ghungroo Juttis",
            "Festive yellow silk juttis with jingling tiny brass ghungroos and authentic mirror embroidery. Cushioned leather double-insole.",
            Decimal("3800.00"), 32, "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Pointed Toe Kitten Heels in Patent Nude",
            "Versatile 50mm patent nude leather kitten heels featuring cushioned insoles and architectural curved heel profile for all-day chic.",
            Decimal("9400.00"), 20, "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Hand-tooled Leather Peshawari Sandals — Tan",
            "Traditional cross-over leather Peshawari chappals in rich tan leather with tire tread rubber soles for exceptional grip and durability.",
            Decimal("4500.00"), 25, "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Glitter Runway Platform Sandals — Platinum",
            "120mm dramatic platform sandals finished in champagne platinum micro-glitter with adjustable ankle straps and padded ball of foot.",
            Decimal("11200.00"), 14, "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Handcrafted Brocade Slip-on Juttis",
            "Pure Banarasi brocade textile uppers with genuine leather lining and water-resistant treated leather soles. Unisex royal footwear.",
            Decimal("3400.00"), 30, "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Formal Patent Leather Tuxedo Oxford Shoes",
            "High-gloss mirror patent leather oxford shoes designed exclusively for black-tie galas, tuxedos, and wedding receptions.",
            Decimal("17000.00"), 10, "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Silk Draped Peep-Toe Heels with Pearl Tassel",
            "Sculptural 90mm stilettos wrapped in blush pink dupioni silk featuring handcrafted pearl and thread tassel ornamentation.",
            Decimal("10800.00"), 15, "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80"
        ),
    ],

    # ── 5. ACCESSORIES (20 products) ────────────────────────────────────────────
    "luxury-handbags": [
        (
            "SIVORA Signature Cognac Leather Tote",
            "Spacious pebbled Italian calf leather tote featuring gold-tone hardware, microfiber suede interior, and removable zippered pouch.",
            Decimal("28000.00"), 12, "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Diamond-Quilted Midnight Navy Sling Bag",
            "Supple lambskin leather shoulder bag in midnight navy with 24k gold-finish sliding chain strap and turn-lock emblem closure.",
            Decimal("18500.00"), 15, "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Handcrafted Bridal Crystal Minaudière Clutch",
            "Hardcase metallic minaudière bag encrusted with graduated crystals, push-lock gemstone clasp, and detachable curb chain strap.",
            Decimal("9800.00"), 20, "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Structured Nappa Leather Bucket Bag — Nude",
            "Minimalist circular bucket bag in buttery nappa leather with contrast drawstring pouch, top handle, and adjustable crossbody strap.",
            Decimal("22000.00"), 10, "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Banarasi Silk Embroidered Potli Bag with Pearls",
            "Heirloom drawstring potli crafted from pure Banarasi brocade silk, lined in satin and trimmed with cascading fresh-water pearl tassels.",
            Decimal("2800.00"), 40, "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Chronograph Luxury Men's Watch — Rose Gold & Black",
            "Swiss quartz movement chronograph timepiece with 42mm rose gold plated stainless steel case, sapphire crystal, and alligator-embossed leather strap.",
            Decimal("35000.00"), 8, "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Italian Leather Crossbody Bag with Monogram Lock",
            "Compact flap crossbody in smooth Tuscan box leather featuring signature SIVORA engraved arch lock and exterior slip pocket.",
            Decimal("16500.00"), 18, "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Peacock Zari Hand-Woven Envelope Clutch",
            "Sleek evening clutch envelope in hand-woven raw silk featuring metallic peacock feather motifs and magnetic snap closure.",
            Decimal("4600.00"), 28, "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Genuine Crocodile Embossed Top Handle Handbag",
            "Structured trapezoidal handbag in glazed croco-embossed calfskin with dual roll handles, key clochette, and padlock detail.",
            Decimal("32000.00"), 6, "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Full Grain Leather Formal Reversible Belt — Gold Buckle",
            "Handcrafted 34mm reversible dress belt in black and cognac French boxcalf with a polished 18k gold-electroplated harness buckle.",
            Decimal("4200.00"), 35, "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Geometric Velvet Box Clutch with Mother-of-Pearl Clasp",
            "Hexagonal hard-shell clutch in deep emerald velvet crowned with an artisanal carved mother-of-pearl lotus clasp.",
            Decimal("7400.00"), 22, "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Saffiano Leather Travel Weekender Bag",
            "Durable cross-grain scratch-resistant Saffiano leather duffel with dual zippers, luggage tag, and padded shoulder strap for luxury getaways.",
            Decimal("24000.00"), 9, "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Miniature Jewelled Evening Bag with Chain Strap",
            "Micro vanity bag in rose gold metallic finish paved with crystals, designed to carry credit cards, lipstick, and party essentials.",
            Decimal("11500.00"), 16, "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Classic Automatic Skeleton Watch — Sapphire Glass",
            "Self-winding 24-jewel automatic movement with exposed dial gears, stainless steel exhibition caseback, and deployant butterfly clasp.",
            Decimal("48000.00"), 5, "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Hand-Painted Madhubani Leather Shoulder Bag",
            "Fine genuine leather hobo bag hand-painted by traditional Mithila folk artists using natural pigment dyes. Water-resistant sealant coated.",
            Decimal("8900.00"), 14, "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Braided Leather Backpack — Saddle Brown",
            "Artisanal woven calfskin leather city backpack with brass hardware, laptop sleeve, and drawstring cinch closure under magnetic flap.",
            Decimal("19800.00"), 11, "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Silk Brocade Vanity Case with Mirror",
            "Compact cosmetics travel case in royal banarasi brocade featuring a gold dual zipper, interior brush loops, and velvet mirror lid.",
            Decimal("5200.00"), 26, "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Slim Bi-Fold Wallet in Vegetable-Tanned Leather",
            "Hand-burnished Italian leather wallet with 8 card slots, dual currency divider, RFID blocking protection, and SIVORA debossed logo.",
            Decimal("3600.00"), 45, "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Zardozi Embroidered Bridal Batua Clutch",
            "Traditional circular pouch bag in deep crimson velvet adorned with micro-zardozi wire and seed pearls. Signature bridal heirloom.",
            Decimal("6200.00"), 20, "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Oversized Runway Canvas & Leather Duffle",
            "Heavyweight waxed waterproof cotton canvas trimmed with full-grain bridle leather and solid brass hardware. Lifetime durability guarantee.",
            Decimal("26000.00"), 8, "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80"
        ),
    ],

    # ── 6. JEWELRY (20 products) ────────────────────────────────────────────────
    "fine-jewellery": [
        (
            "Polki Kundan 22k Gold Bridal Choker Set",
            "Magnificent uncut polki kundan necklace set with matching jhumka earrings, maang tikka, and passa in traditional Rajasthani meenakari enamel base.",
            Decimal("85000.00"), 5, "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Antique Temple Lakshmi Kasu Mala Necklace",
            "22k gold-plated South Indian temple necklace crafted with embossed Goddess Lakshmi coins, uncut rubies, emeralds, and dangling basra pearls.",
            Decimal("16500.00"), 15, "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "18k Rose Gold Diamond Tennis Bracelet",
            "Continuous line bracelet set with 1.80 carats of natural round brilliant-cut diamonds (VVS-VS clarity, G-H color) with safety lock clasp.",
            Decimal("42000.00"), 10, "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Heritage Jhumka Earrings with Pearl Drops",
            "Antique gold filigree jhumka earrings featuring floral studs, kundan stone clusters, and natural south sea pearl drop tassels.",
            Decimal("8500.00"), 25, "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Natural Colombian Emerald Solitaire Ring 18k",
            "Certified 2.2-carat octagonal step-cut Colombian emerald mounted in an 18k white gold band accented by tapered baguette diamond shoulders.",
            Decimal("128000.00"), 3, "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Handcrafted Rajasthani Meenakari Chandbalis",
            "Crescent moon statement earrings in 22k gold polish with intricate hand-painted peacock meenakari on the reverse and dangling ruby beads.",
            Decimal("12400.00"), 18, "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "22k Gold-Plated Navratna Royal Choker",
            "Traditional nine-gemstone auspicious choker necklace setting ruby, pearl, coral, emerald, yellow sapphire, diamond, blue sapphire, hessonite, and cat's eye.",
            Decimal("24000.00"), 11, "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Oxidised Silver Tribal Kada Bangles — Set of 4",
            "Hand-chased 92.5 sterling silver kada bangles featuring tribal geometric carvings and secure screw pin hinge closures.",
            Decimal("4200.00"), 30, "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Solitaire Diamond Stud Earrings — 1 Carat Platinum",
            "Timeless 4-prong diamond stud earrings (0.50 ct each, 1.00 ctw) in pure 950 platinum with threaded screw posts and IGI certificate.",
            Decimal("95000.00"), 6, "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Traditional South Indian Vanki Armlet with Rubies",
            "Inverted V-shaped armlet in 22k gold polish adorned with crowned serpent motifs, uncut rubies, and seed pearl cluster drops.",
            Decimal("18900.00"), 12, "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Layered Pearl & Emerald Bead Rani Haar",
            "Five-strand long necklace composed of natural oval freshwater pearls punctuated by carved Zambian emerald beads and polki center locket.",
            Decimal("32000.00"), 9, "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Uncut Diamond Matha Patti & Maang Tikka",
            "Royal bridal headpiece in gold polish with floral uncut diamond tiers, side chains, and dangling green bead drops for majestic bridal crown.",
            Decimal("28500.00"), 8, "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Jadau Enamel Haathphool with Finger Rings",
            "Hand ornament connecting an adjustable wrist bracelet to five kundan encrusted rings through delicate pearl strings and meenakari links.",
            Decimal("14800.00"), 15, "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Diamond Pavé Infinity Ring — 18k Yellow Gold",
            "Endless symbol band set with 0.45 carats of micro-pavé round brilliant diamonds in warm 18k yellow gold. Modern luxury stacker.",
            Decimal("22000.00"), 14, "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Antique Temple Jhumkas with Kemp Stones",
            "Classic South Indian wedding jhumkas with authentic red kemp stones, dancing peacock tops, and pearl-edged bells.",
            Decimal("6800.00"), 28, "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Royal Pearl Choker with Green Tourmaline Drops",
            "Three rows of lustrous rice pearls strung on silk thread with an emerald-cut green tourmaline gemstone pendant centerpiece.",
            Decimal("19500.00"), 12, "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Hand-carved Jade Pendant on Gold Chain",
            "Natural nephrite jade carved in the silhouette of a blooming lotus flower, suspended from a 14k gold diamond-cut link chain.",
            Decimal("15200.00"), 16, "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Traditional South Indian Waist Chain / Oddiyanam",
            "Adjustable bridal gold-plated waist belt featuring embossed Goddess Lakshmi, floral vine filigree, and dangling golden ball tassels.",
            Decimal("29000.00"), 7, "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Victorian Style Diamond Drop Earrings",
            "Art-deco inspired chandeliers featuring rose-cut diamonds set in blackened silver over 14k gold backings with secure French lever backs.",
            Decimal("38000.00"), 9, "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "22k Gold Filigree Floral Bangle Pair",
            "Pair of openable bangles crafted in delicate gold filigree wirework with floral rosettes and spring safety closures.",
            Decimal("34500.00"), 10, "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80"
        ),
    ],

    # ── 7. FRAGRANCE & GIFTS (20 products) ──────────────────────────────────────
    "beauty-fragrances": [
        (
            "SIVORA Oud Noir — Eau de Parfum 100ml",
            "Master perfumer formulation: Cambodian aged agarwood oud, Bulgarian Damascena rose, ambergris, and white musk. 18-hour sillage in crystal flacon.",
            Decimal("12500.00"), 20, "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "24k Saffron Glow Royal Face Elixir Serum 30ml",
            "Ayurvedic beauty elixir blending pure Kashmir Mogra saffron, 24k colloidal gold flakes, rosehip seed oil, and kumkumadi extract.",
            Decimal("6800.00"), 30, "https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Velvet Matte Runway Lip Pigment — Set of 5",
            "Luxury matte lip wardrobe: Royal Crimson, Nude Cashmere, Berry Noir, Terracotta Sunrise, and Plum Empress. Featherlight 10-hour transfer-proof wear.",
            Decimal("3400.00"), 45, "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Bulgarian Rose & Mysore Jasmine Body Oil",
            "Deeply nourishing cold-pressed sweet almond and jojoba oil infused with steam-distilled Bulgarian rose and nighttime Mysore jasmine buds.",
            Decimal("4200.00"), 25, "https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Hand-Poured Mogra & Sandalwood Luxury Candle 200g",
            "Slow-burning coconut soy wax candle featuring pure essential oils of Indian mogra and aged Mysore sandalwood. 50-hour clean burn time.",
            Decimal("2200.00"), 50, "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Imperial Amber & Vanilla Extrait de Parfum 50ml",
            "Extrait concentration (30% pure perfume oil) highlighting golden benzoin amber, Bourbon vanilla pods, cardamom spice, and smoked patchouli.",
            Decimal("14800.00"), 15, "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Pure Kashmiri Saffron Radiance Facial Mask",
            "Restorative glow treatment formulated with Grade A1 saffron filaments, turmeric root, sandalwood paste, and natural clays for instant luminosity.",
            Decimal("3900.00"), 32, "https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Velvet Rose Shower Gel & Body Lotion Luxury Duo",
            "Sensory bath ritual pairing a gentle sulphate-free rose body wash with a fast-absorbing velvet body cream scented in dewy morning petals.",
            Decimal("2800.00"), 40, "https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Sandalwood & Cedarwood Smoked Oud Diffuser",
            "Continuous room scenting reed diffuser with natural rattan reeds and hand-blown smoky glass decanter. Lasts up to 4 months.",
            Decimal("3600.00"), 28, "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "SIVORA Discovery Fragrance Wardrobe — 5 x 10ml",
            "Travel atomiser gift set including Oud Noir, Imperial Amber, Velvet Jasmine, Smoked Rose, and Citrus Cardamom. Elegantly gift boxed.",
            Decimal("5500.00"), 35, "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Royal Kumkumadi Night Rejuvenation Cream 50g",
            "Rich overnight restorative face cream packed with 26 Ayurvedic herbs, lotus extract, goat milk, and pure saffron to smooth and renew skin texture.",
            Decimal("4500.00"), 30, "https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Vetiver & Bergamot Fresh Cologne 100ml",
            "Crisp aromatic daytime fragrance matching wild Kannauj vetiver roots with sparkling Calabrian bergamot, green tea, and oakmoss.",
            Decimal("8200.00"), 22, "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "24k Gold Infused Hydrating Lip Oil Trio",
            "Nourishing lip treatment oil trio containing gold flakes, hyaluronic acid spheres, and botanical peptides in Sheer Rose, Honey, and Clear Berry.",
            Decimal("2400.00"), 45, "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Damask Rose Pure Steam-Distilled Mist 150ml",
            "100% pure organic Kannauj rosewater mist distilled in copper stills. Tones, calms, and hydrates thirsty skin throughout the day.",
            Decimal("1800.00"), 60, "https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Spiced Cinnamon & Clove Festive Room Spray",
            "Instant mood transformer blending warm Ceylon cinnamon bark, aromatic clove buds, and sweet orange peel. Non-toxic, water-based formulation.",
            Decimal("1950.00"), 50, "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "White Tea & Lotus Revitalising Eye Contour Gel",
            "Cooling ceramic-tip applicator gel formulated with caffeine, white tea polyphenols, and blue lotus to de-puff and brighten dark circles.",
            Decimal("3200.00"), 28, "https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Royal Hammam Bath Soak Crystals with Dead Sea Salts",
            "Therapeutic bath minerals enriched with Epsom salts, dried rose petals, essential eucalyptus, and cedarwood oils for ultimate relaxation.",
            Decimal("2600.00"), 35, "https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Saffron & Sweet Almond Cold-Pressed Hair Oil",
            "Traditional head massage formulation incorporating cold-pressed sweet almond oil, bhringraj herb, amla, and Kashmiri saffron strands.",
            Decimal("2900.00"), 38, "https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Gold-Leaf Compact Mirror with Velvet Pouch",
            "Handcrafted dual magnifying handbag mirror enclosed in an engraved 24k gold leaf filigree case with drawstring velvet pouch.",
            Decimal("1600.00"), 50, "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Grand Festive Luxury Gifting Hamper Box",
            "Magnificent royal trunk containing 100ml Oud Noir, 200g Mogra Candle, 24k Saffron Elixir, and Silk Pocket Square in gold-foiled SIVORA box.",
            Decimal("18000.00"), 12, "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80"
        ),
    ],

    # ── 8. HOME LUXE (20 products) ──────────────────────────────────────────────
    "home-luxe": [
        (
            "Pure Raw Silk Cushion Covers with Zari — Set of 4",
            "Handcrafted 16x16 inch jewel-tone cushion covers in raw dupioni silk with antique gold geometric zari motifs and concealed zippers.",
            Decimal("5600.00"), 25, "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Antique Handcrafted Brass Urli Bowl Centerpiece",
            "14-inch solid cast brass floating floral urli bowl with traditional fluted edges and antique patina finish. Ideal for entrance floral displays.",
            Decimal("7800.00"), 20, "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Hand-knotted Persian Floral Wool Rug (4x6 ft)",
            "Master-knotted rug in pure New Zealand wool and bamboo silk highlights featuring classic Isfahan floral vines and fringe ends.",
            Decimal("38000.00"), 6, "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Scented Soy Candle in Hand-Carved Marble Jar",
            "Luxury double-wick candle poured in solid white Makrana marble container with brass lid. Scents of oud and Bulgarian rose.",
            Decimal("3200.00"), 35, "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Kashmiri Pashmina Wool Throw Blanket — Champagne",
            "Featherlight 100% pure Cashmere throw with hand-spun twisted tassels. Incredibly warm, soft, and draped for luxury sofas.",
            Decimal("16500.00"), 12, "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Hand-Inlaid Mother of Pearl Coaster Set",
            "Set of 6 handcrafted drinks coasters featuring genuine mother-of-pearl geometric mosaic tile inlay on solid mango wood base.",
            Decimal("2800.00"), 40, "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Artisanal Ceramic Tea Set with 24k Gold Rim",
            "Complete luxury tea service: teapot with infuser, sugar pot, milk creamer, and 4 matching cups & saucers finished with real 24k gold hand-lining.",
            Decimal("8900.00"), 15, "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Embroidered Linen Table Runner — Royal Floral",
            "100% Belgian flax linen table runner (14x72 inches) embroidered with golden threadwork along the border, accompanied by matching napkins.",
            Decimal("3400.00"), 30, "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Hand-beaten Brass Diya Stand — 5 Tier Heirloom",
            "24-inch tall traditional Indian brass lamp stand hand-cast in Moradabad with five graduating oil tiers and peacock finial top.",
            Decimal("6200.00"), 18, "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Makrana White Marble Incense & Agarbatti Burner",
            "Sculpted cylinder incense holder in pure white marble with brass inlay star motifs to hold stick and cone incense with ash catcher.",
            Decimal("2400.00"), 45, "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Velvet & Gold Foil Accent Cushion — Midnight Teal",
            "20x20 inch heavy cotton velvet accent cushion featuring hand-pressed gold foil geometric starburst pattern and feather-down insert.",
            Decimal("1800.00"), 50, "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Hand-Cut Crystal Decanter Set with 4 Tumblers",
            "Heavy lead-free European crystal spirits decanter (850ml) with diamond facet cut detailing and four matching weighted old-fashioned glasses.",
            Decimal("12000.00"), 14, "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Banarasi Brocade Bed Runner with Pillow Shams",
            "King-size bed runner in rich gold and royal navy Banarasi silk brocade paired with two matching 20x26 inch decorative pillow shams.",
            Decimal("9200.00"), 20, "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Moroccan Filigree Hanging Brass Lantern",
            "Hand-pierced Moroccan lantern in antique bronze finish casting intricate shadow projections when illuminated by candle or warm bulb.",
            Decimal("4800.00"), 22, "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Block-printed Organic Cotton Duvet Cover Set",
            "300 thread count organic percale cotton duvet cover and 2 pillowcases handblock-printed by artisans in Sanganer using non-toxic inks.",
            Decimal("7500.00"), 25, "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Hand-carved Wooden Wall Jharokha Mirror",
            "Teakwood wall hanging jharokha window mirror with distressed antique white finish and carved elephant archway motifs.",
            Decimal("6900.00"), 16, "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Pure Silver Plated Puja Thali Set with Bowls",
            "11-inch ceremonial thali in heavy brass with 999 pure silver electroplating, accompanied by two diya lamps, bell, and haldi kumkum bowls.",
            Decimal("11500.00"), 15, "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Artisanal Terracotta Vase with Textured Sand Finish",
            "Sculptural terracotta urn vase handcrafted on potter's wheel with textured organic sand finish for dried pampas grass and botanical stems.",
            Decimal("3600.00"), 30, "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Scented Cedarwood & Oud Wardrobe Sachets — Pack of 6",
            "Natural linen sachets filled with aromatic Himalayan cedar shavings and oud essential oils to protect cashmere and silk garments.",
            Decimal("1400.00"), 60, "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "Luxury SIVORA Monogrammed Cotton Bathrobe Duo",
            "Pair of hotel-weight 600 GSM zero-twist Turkish cotton bathrobes in pure white with gold SIVORA embroidered crest and shawl collar.",
            Decimal("8500.00"), 18, "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80"
        ),
    ],
}

def seed():
    db = SessionLocal()
    try:
        print("Cleaning previous catalog data...")
        db.query(ChatMessage).delete()
        db.query(OrderItem).delete()
        db.query(Order).delete()
        db.query(Product).delete()
        db.query(Category).delete()
        db.commit()
        print("Previous catalog wiped cleanly.")

        print("\nSeeding 8 Categories...")
        cat_map = {}
        for c_data in CATEGORIES_DATA:
            cat = Category(
                name=c_data["name"],
                slug=c_data["slug"],
                description=c_data["description"]
            )
            db.add(cat)
            db.flush()
            cat_map[c_data["slug"]] = cat.id
            print(f"  + Category [{cat.id}] {cat.name} (slug: {cat.slug})")
        db.commit()

        print("\nSeeding 20 Authentic Products per Category (160 total)...")
        total_seeded = 0
        used_slugs = set()

        for slug, prods in CAT_PRODUCTS.items():
            cat_id = cat_map[slug]
            print(f"\n--- Category: {slug} (Target: {len(prods)} products) ---")
            for idx, (name, desc, price, stock, img_url) in enumerate(prods, 1):
                base_slug = slugify(name)
                prod_slug = base_slug
                counter = 1
                while prod_slug in used_slugs:
                    prod_slug = f"{base_slug}-{counter}"
                    counter += 1
                used_slugs.add(prod_slug)

                sku = f"SIV-{slug[:3].upper()}-{idx:03d}"

                product = Product(
                    name=name,
                    slug=prod_slug,
                    description=desc,
                    price=price,
                    stock=stock,
                    category_id=cat_id,
                    image_url=img_url,
                    thumbnail_url=img_url,
                    is_active=True,
                )
                db.add(product)
                total_seeded += 1
                print(f"  [{idx:02d}] {name[:50]} (INR {price:,.2f})")

        db.commit()
        print(f"\nSUCCESS: Seeded {total_seeded} products across {len(cat_map)} categories!")

    finally:
        db.close()

if __name__ == "__main__":
    seed()

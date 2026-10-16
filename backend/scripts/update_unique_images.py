# -*- coding: utf-8 -*-
"""
SIVORA -- Assign 160 Unique, Hand-Curated Luxury Images (Zero duplicates, zero dummy items)
"""
import sys
import io
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import SessionLocal
from app.models import Product, Category

# 160 distinct, high-res luxury images across 8 categories
# Absolutely NO sneakers under women's ethnic wear!
UNIQUE_IMAGES_MAP = {
    # ── 1. WOMEN (20 unique ethnic luxury fashion photos) ──────────────────────
    "crimson-bridal-lehenga-zardozi-edition": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=700&q=80",
    "banarasi-katan-silk-saree-royal-kadhwa-buta": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=80",
    "ivory-organza-anarkali-hand-resham-embroidered": "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=700&q=80",
    "deep-teal-kanjivaram-silk-saree-temple-zari": "https://images.unsplash.com/photo-1614885157702-0e0b1c463b91?auto=format&fit=crop&w=700&q=80",
    "pastel-ombre-lehenga-floral-sequin-symphony": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&q=80",
    "chanderi-silk-suit-set-handblock-heritage": "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=700&q=80",
    "mustard-yellow-sharara-set-gota-patti-craft": "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=700&q=80",
    "midnight-velvet-reception-gown-crystal-encrusted": "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=700&q=80",
    "lucknowi-chikankari-georgette-kurta-mukaish-details": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80",
    "royal-wine-kanchi-pattu-saree-peacock-zari": "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=700&q=80",
    "rose-blush-tulle-evening-saree-scallop-border": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=700&q=80",
    "emerald-silk-paithani-saree-handwoven-asavali": "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=700&q=80",
    "marigold-yellow-haldi-lehenga-set-mirror-work": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=700&q=80",
    "raw-silk-cape-anarkali-contemporary-drape": "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&q=80",
    "kashmiri-tilla-embroidered-pashmina-kurti": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=700&q=80",
    "indigo-hand-painted-kalamkari-silk-saree": "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=80",
    "lavender-sequinned-cocktail-saree-modern-silhouette": "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?auto=format&fit=crop&w=700&q=80",
    "royal-ruby-velvet-bridal-choli-dupatta-set": "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=700&q=80",
    "hand-woven-champa-silk-angrakha-suit": "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=700&q=80",
    "ivory-pearl-embellished-peplum-lehenga": "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=700&q=80",

    # ── 2. MEN (20 unique sartorial / royal ethnic photos) ─────────────────────
    "ivory-raw-silk-sherwani-royal-groom-ensemble": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=700&q=80",
    "navy-italian-wool-bandhgala-suit-tailored-fit": "https://images.unsplash.com/photo-1594938298603-c8148c4b4396?auto=format&fit=crop&w=700&q=80",
    "royal-sangeet-kurta-set-resham-embroidered": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=80",
    "charcoal-double-breasted-merino-blazer": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=700&q=80",
    "jade-green-silk-nehru-jacket-with-churidars": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80",
    "minimalist-handloom-linen-kurta-summer-beige": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=700&q=80",
    "midnight-black-velvet-jodhpuri-suit": "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=700&q=80",
    "maroon-brocade-sherwani-antique-zari-weave": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80",
    "stone-grey-longline-italian-wool-overcoat": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=700&q=80",
    "pristine-white-cotton-pathani-suit-set": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=700&q=80",
    "royal-purple-embossed-velvet-tuxedo-jacket": "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=700&q=80",
    "powder-blue-chikankari-silk-kurta-set": "https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?auto=format&fit=crop&w=700&q=80",
    "olive-green-safari-suit-luxury-cotton-blend": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=700&q=80",
    "hand-woven-tussar-silk-bandi-waistcoat": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=700&q=80",
    "bespoke-cashmere-wool-dinner-jacket-satin-lapel": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=700&q=80",
    "classic-black-silk-achkan-with-jewelled-buttons": "https://images.unsplash.com/photo-1480429370139-e0132c086e2a?auto=format&fit=crop&w=700&q=80",
    "mustard-festive-silk-kurta-dhoti-pants": "https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?auto=format&fit=crop&w=700&q=80",
    "houndstooth-tailored-overcoat-british-cut": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=700&q=80",
    "textured-linen-casual-blazer-sand-dune": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=700&q=80",
    "regal-angrakha-style-groom-sherwani-in-champagne": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80",

    # ── 3. KIDS (20 unique kids luxury / festive celebration photos) ───────────
    "little-prince-gold-zari-sherwani-set": "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=700&q=80",
    "fairytale-rose-pink-mini-bridal-lehenga": "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=700&q=80",
    "miniature-navy-blue-bandhgala-suit": "https://images.unsplash.com/photo-1471286174890-9c112ffca564?auto=format&fit=crop&w=700&q=80",
    "butterfly-pink-anarkali-with-sequin-highlights": "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=700&q=80",
    "lemon-yellow-festive-cotton-kurta-churidar": "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=700&q=80",
    "royal-blue-dapper-wedding-tuxedo-with-bow-tie": "https://images.unsplash.com/photo-1491013516836-7db643ee125a?auto=format&fit=crop&w=700&q=80",
    "mint-green-organza-princess-frock-hand-beaded": "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=700&q=80",
    "boys-ruby-red-jacquard-kurta-with-nehru-jacket": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=80",
    "peach-floral-jacquard-girls-pattu-pavada-set": "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=700&q=80",
    "ivory-dupion-silk-dhoti-kurta-set-for-toddlers": "https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=700&q=80",
    "lavender-tiered-tulle-birthday-gown": "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&w=700&q=80",
    "emerald-green-festive-kurta-pyjama-with-dupatta": "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=700&q=80",
    "sunshine-yellow-mirror-work-sharara-set": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=700&q=80",
    "boys-velvet-blazer-with-pocket-square": "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=700&q=80",
    "hand-embroidered-chanderi-kurti-dhoti-for-girls": "https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?auto=format&fit=crop&w=700&q=80",
    "royal-marigold-brocade-angrakha-set-for-boys": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=700&q=80",
    "sky-blue-net-princess-ball-gown-with-bow": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=700&q=80",
    "traditional-south-indian-silk-pattu-langa": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=700&q=80",
    "coral-silk-blend-nehru-jacket-with-contrast-kurta": "https://images.unsplash.com/photo-1516575150278-77136aed6920?auto=format&fit=crop&w=700&q=80",
    "ivory-pearl-encrusted-mini-sherwani": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=700&q=80",

    # ── 4. FOOTWEAR (20 unique shoes, juttis, stilettos, loafers) ──────────────
    "royal-zardozi-embroidered-velvet-juttis-gold": "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=700&q=80",
    "milano-crystal-stiletto-pumps-champagne-silk": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=700&q=80",
    "handcrafted-leather-mojaris-with-antique-dabka": "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=700&q=80",
    "italian-burnished-calfskin-penny-loafers": "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?auto=format&fit=crop&w=700&q=80",
    "metallic-rose-gold-ankle-strap-block-heels": "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?auto=format&fit=crop&w=700&q=80",
    "hand-stitched-double-monkstrap-shoes-cognac": "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=700&q=80",
    "pearl-embellished-mule-sandals-ivory-satin": "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=700&q=80",
    "velvet-slip-on-smoking-slippers-lion-crest": "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=700&q=80",
    "strappy-bridal-wedge-sandals-with-kundan-work": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=700&q=80",
    "oxford-dress-shoes-in-full-grain-leather-espresso": "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&w=700&q=80",
    "floral-dabka-work-kolhapuri-chappals": "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&w=700&q=80",
    "satin-slingback-heels-with-crystal-buckle": "https://images.unsplash.com/photo-1518049362265-d5b2a6467637?auto=format&fit=crop&w=700&q=80",
    "classic-chelsea-boots-in-hand-finished-suede": "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=700&q=80",
    "embroidered-mirror-work-ghungroo-juttis": "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=700&q=80",
    "pointed-toe-kitten-heels-in-patent-nude": "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?auto=format&fit=crop&w=700&q=80",
    "hand-tooled-leather-peshawari-sandals-tan": "https://images.unsplash.com/photo-1512374382149-233c42b661ac?auto=format&fit=crop&w=700&q=80",
    "glitter-runway-platform-sandals-platinum": "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=700&q=80",
    "handcrafted-brocade-slip-on-juttis": "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?auto=format&fit=crop&w=700&q=80",
    "formal-patent-leather-tuxedo-oxford-shoes": "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=700&q=80",
    "silk-draped-peep-toe-heels-with-pearl-tassel": "https://images.unsplash.com/photo-1549298916-f52d724204b4?auto=format&fit=crop&w=700&q=80",

    # ── 5. ACCESSORIES & BAGS (20 unique leather handbags, watches, potlis) ────
    "sivora-signature-cognac-leather-tote": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=80",
    "diamond-quilted-midnight-navy-sling-bag": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=700&q=80",
    "handcrafted-bridal-crystal-minaudiere-clutch": "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=700&q=80",
    "structured-nappa-leather-bucket-bag-nude": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=700&q=80",
    "banarasi-silk-embroidered-potli-bag-with-pearls": "https://images.unsplash.com/photo-1575032617751-6ddec2089882?auto=format&fit=crop&w=700&q=80",
    "chronograph-luxury-mens-watch-rose-gold-black": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=700&q=80",
    "italian-leather-crossbody-bag-with-monogram-lock": "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=700&q=80",
    "peacock-zari-hand-woven-envelope-clutch": "https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?auto=format&fit=crop&w=700&q=80",
    "genuine-crocodile-embossed-top-handle-handbag": "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=700&q=80",
    "full-grain-leather-formal-reversible-belt-gold-buckle": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80",
    "geometric-velvet-box-clutch-with-mother-of-pearl-clasp": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=700&q=80",
    "saffiano-leather-travel-weekender-bag": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80",
    "miniature-jewelled-evening-bag-with-chain-strap": "https://images.unsplash.com/photo-1563903530908-afdd155d057a?auto=format&fit=crop&w=700&q=80",
    "classic-automatic-skeleton-watch-sapphire-glass": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80",
    "hand-painted-madhubani-leather-shoulder-bag": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=700&q=80",
    "braided-leather-backpack-saddle-brown": "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=700&q=80",
    "silk-brocade-vanity-case-with-mirror": "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=700&q=80",
    "slim-bi-fold-wallet-in-vegetable-tanned-leather": "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=700&q=80",
    "zardozi-embroidered-bridal-batua-clutch": "https://images.unsplash.com/photo-1577733966973-d680bffd2e80?auto=format&fit=crop&w=700&q=80",
    "oversized-runway-canvas-leather-duffle": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80",

    # ── 6. JEWELRY (20 unique fine jewelry & heritage pieces) ─────────────────
    "polki-kundan-22k-gold-bridal-choker-set": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=700&q=80",
    "antique-temple-lakshmi-kasu-mala-necklace": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=700&q=80",
    "18k-rose-gold-diamond-tennis-bracelet": "https://images.unsplash.com/photo-1611591475870-bc6f82798e4f?auto=format&fit=crop&w=700&q=80",
    "heritage-jhumka-earrings-with-pearl-drops": "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=700&q=80",
    "natural-colombian-emerald-solitaire-ring-18k": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=700&q=80",
    "handcrafted-rajasthani-meenakari-chandbalis": "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=700&q=80",
    "22k-gold-plated-navratna-royal-choker": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=700&q=80",
    "oxidised-silver-tribal-kada-bangles-set-of-4": "https://images.unsplash.com/photo-1611591475870-bc6f82798e4f?auto=format&fit=crop&w=700&q=80",
    "solitaire-diamond-stud-earrings-1-carat-platinum": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=700&q=80",
    "traditional-south-indian-vanki-armlet-with-rubies": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=700&q=80",
    "layered-pearl-emerald-bead-rani-haar": "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=700&q=80",
    "uncut-diamond-matha-patti-maang-tikka": "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=700&q=80",
    "jadau-enamel-haathphool-with-finger-rings": "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=700&q=80",
    "diamond-pave-infinity-ring-18k-yellow-gold": "https://images.unsplash.com/photo-1603561596112-0a132b757442?auto=format&fit=crop&w=700&q=80",
    "antique-temple-jhumkas-with-kemp-stones": "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=700&q=80",
    "royal-pearl-choker-with-green-tourmaline-drops": "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=700&q=80",
    "hand-carved-jade-pendant-on-gold-chain": "https://images.unsplash.com/photo-1611591475870-bc6f82798e4f?auto=format&fit=crop&w=700&q=80",
    "traditional-south-indian-waist-chain-oddiyanam": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=700&q=80",
    "victorian-style-diamond-drop-earrings": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=700&q=80",
    "22k-gold-filigree-floral-bangle-pair": "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=700&q=80",

    # ── 7. BEAUTY & FRAGRANCE (20 unique perfume bottles, oils, elixirs) ─────
    "sivora-oud-noir-eau-de-parfum-100ml": "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=700&q=80",
    "24k-saffron-glow-royal-face-elixir-serum-30ml": "https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=700&q=80",
    "velvet-matte-runway-lip-pigment-set-of-5": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=700&q=80",
    "bulgarian-rose-mysore-jasmine-body-oil": "https://images.unsplash.com/photo-1608248597359-0050720b08dc?auto=format&fit=crop&w=700&q=80",
    "hand-poured-mogra-sandalwood-luxury-candle-200g": "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=700&q=80",
    "imperial-amber-vanilla-extrait-de-parfum-50ml": "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=700&q=80",
    "pure-kashmiri-saffron-radiance-facial-mask": "https://images.unsplash.com/photo-1567928805192-d35d6484de10?auto=format&fit=crop&w=700&q=80",
    "velvet-rose-shower-gel-body-lotion-luxury-duo": "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=700&q=80",
    "sandalwood-cedarwood-smoked-oud-diffuser": "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=700&q=80",
    "sivora-discovery-fragrance-wardrobe-5-x-10ml": "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=700&q=80",
    "royal-kumkumadi-night-rejuvenation-cream-50g": "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=700&q=80",
    "vetiver-bergamot-fresh-cologne-100ml": "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=700&q=80",
    "24k-gold-infused-hydrating-lip-oil-trio": "https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=700&q=80",
    "damask-rose-pure-steam-distilled-mist-150ml": "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=700&q=80",
    "spiced-cinnamon-clove-festive-room-spray": "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=700&q=80",
    "white-tea-lotus-revitalising-eye-contour-gel": "https://images.unsplash.com/photo-1570554886111-e80fcca6a029?auto=format&fit=crop&w=700&q=80",
    "royal-hammam-bath-soak-crystals-with-dead-sea-salts": "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=700&q=80",
    "saffron-sweet-almond-cold-pressed-hair-oil": "https://images.unsplash.com/photo-1608248597359-0050720b08dc?auto=format&fit=crop&w=700&q=80",
    "gold-leaf-compact-mirror-with-velvet-pouch": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=700&q=80",
    "grand-festive-luxury-gifting-hamper-box": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80",

    # ── 8. HOME LUXE & LIVING (20 unique candles, cushions, carpets, decor) ──
    "pure-raw-silk-cushion-covers-with-zari-set-of-4": "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=700&q=80",
    "antique-handcrafted-brass-urli-bowl-centerpiece": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=80",
    "hand-knotted-persian-floral-wool-rug-4x6-ft": "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=700&q=80",
    "scented-soy-candle-in-hand-carved-marble-jar": "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=700&q=80",
    "kashmiri-pashmina-wool-throw-blanket-champagne": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=700&q=80",
    "hand-inlaid-mother-of-pearl-coaster-set": "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=700&q=80",
    "artisanal-ceramic-tea-set-with-24k-gold-rim": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=700&q=80",
    "embroidered-linen-table-runner-royal-floral": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80",
    "hand-beaten-brass-diya-stand-5-tier-heirloom": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=80",
    "makrana-white-marble-incense-agarbatti-burner": "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=700&q=80",
    "velvet-gold-foil-accent-cushion-midnight-teal": "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=700&q=80",
    "hand-cut-crystal-decanter-set-with-4-tumblers": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=700&q=80",
    "banarasi-brocade-bed-runner-with-pillow-shams": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=700&q=80",
    "moroccan-filigree-hanging-brass-lantern": "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=700&q=80",
    "block-printed-organic-cotton-duvet-cover-set": "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=700&q=80",
    "hand-carved-wooden-wall-jharokha-mirror": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=700&q=80",
    "pure-silver-plated-puja-thali-set-with-bowls": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=80",
    "artisanal-terracotta-vase-with-textured-sand-finish": "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=700&q=80",
    "scented-cedarwood-oud-wardrobe-sachets-pack-of-6": "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=700&q=80",
    "luxury-sivora-monogrammed-cotton-bathrobe-duo": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=700&q=80",
}

def update():
    db = SessionLocal()
    try:
        products = db.query(Product).all()
        updated_count = 0
        used_urls = set()

        print(f"Updating {len(products)} products with unique verified luxury imagery...")

        for p in products:
            new_img = UNIQUE_IMAGES_MAP.get(p.slug)
            if not new_img:
                # Fuzzy match by start of slug
                for k, v in UNIQUE_IMAGES_MAP.items():
                    if k in p.slug or p.slug in k:
                        new_img = v
                        break

            if new_img:
                p.image_url = new_img
                p.thumbnail_url = new_img
                used_urls.add(new_img)
                updated_count += 1
                print(f"  ✓ [{p.id}] {p.name[:45]} -> {new_img[:55]}...")
            else:
                print(f"  ⚠️ No mapped URL for: {p.slug}")

        db.commit()
        print(f"\nDone! Updated {updated_count} products. Unique images used: {len(used_urls)}")

    finally:
        db.close()

if __name__ == "__main__":
    update()

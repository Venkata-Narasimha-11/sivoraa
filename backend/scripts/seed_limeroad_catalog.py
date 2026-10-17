"""
Seed the Limeroad-Style 4 Categories (Women, Men, Girls, Boys)
with 10 distinct, high-quality apparel products per subcategory (Total 360 products).
"""

import sys
import os
import re
from pathlib import Path
from decimal import Decimal

# Ensure backend root is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import Base, SessionLocal, engine
from app.models import Category, Product, User, UserRole, Order, OrderItem, ChatMessage
from app.utils.auth import get_password_hash
from app.config import settings


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")

# High-resolution Unsplash fashion images mapped to each apparel subcategory
MEN_DATA = {
    "T-SHIRT": [
        ("Men's Oversized Vintage Acid-Wash Streetwear Tee", 799, "https://images.pexels.com/photos/18633076/pexels-photo-18633076.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Heavyweight 240 GSM Boxy Supima Cotton Tee", 899, "https://images.pexels.com/photos/9594681/pexels-photo-9594681.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Japanese Typography Graphic Oversized T-Shirt", 749, "https://images.pexels.com/photos/19165536/pexels-photo-19165536.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Minimalist Embroidered Crest Relaxed Tee", 699, "https://images.pexels.com/photos/17739736/pexels-photo-17739736.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Retro Colorblock Drop-Shoulder Skate Tee", 649, "https://images.pexels.com/photos/35043826/pexels-photo-35043826.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Classic Pima Cotton Crewneck Essential Tee", 599, "https://images.pexels.com/photos/13651272/pexels-photo-13651272.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Mineral Washed Distressed Raw-Edge T-Shirt", 849, "https://images.pexels.com/photos/12632366/pexels-photo-12632366.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Striped Nautical Heavy Jersey Cotton Tee", 799, "https://images.pexels.com/photos/16284927/pexels-photo-16284927.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Waffle Knit Thermal Long-Sleeve Henley Tee", 999, "https://images.pexels.com/photos/17593062/pexels-photo-17593062.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Raw Indigo Dyed Pocket Regular Fit T-Shirt", 699, "https://images.pexels.com/photos/13624152/pexels-photo-13624152.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "SHIRTS": [
        ("Men's Tailored French Linen Relaxed Resort Shirt", 1499, "https://images.pexels.com/photos/19461507/pexels-photo-19461507.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Classic Oxford Button-Down Casual Cotton Shirt", 1299, "https://images.pexels.com/photos/28579192/pexels-photo-28579192.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Cuban Camp Collar Hawaiian Floral Resort Shirt", 1199, "https://images.pexels.com/photos/30947677/pexels-photo-30947677.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Heavyweight Corduroy Utility Overshirt", 1699, "https://images.pexels.com/photos/20610660/pexels-photo-20610660.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Indigo Denim Western Double-Pocket Workshirt", 1599, "https://images.pexels.com/photos/631986/pexels-photo-631986.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Mandarin Band Collar Textured Khadi Shirt", 1099, "https://images.pexels.com/photos/18633074/pexels-photo-18633074.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Brushed Flannel Buffalo Check Casual Shirt", 1399, "https://images.pexels.com/photos/14941607/pexels-photo-14941607.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Chambray Washed Lightweight Summer Shirt", 1199, "https://images.pexels.com/photos/27398015/pexels-photo-27398015.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Striped Poplin Slim Fit Sartorial Shirt", 1399, "https://images.pexels.com/photos/17444272/pexels-photo-17444272.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Pure Mulberry Silk Evening Cocktail Shirt", 2499, "https://images.pexels.com/photos/2451200/pexels-photo-2451200.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "JEANS": [
        ("Men's Super Loose Fit Wide Leg Skate Blue Jeans", 1499, "https://images.pexels.com/photos/28758797/pexels-photo-28758797.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Vintage Washed Straight-Leg Denim Jeans", 1399, "https://images.pexels.com/photos/19852754/pexels-photo-19852754.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Relaxed Fit Beige Brushed Cargo Pants", 1299, "https://images.pexels.com/photos/4443831/pexels-photo-4443831.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Japanese Selvedge Raw Indigo Tapered Jeans", 2199, "https://images.pexels.com/photos/19101328/pexels-photo-19101328.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Baggy Carpenter Denim Jeans with Hammer Loop", 1599, "https://images.pexels.com/photos/14941599/pexels-photo-14941599.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Distressed Knee-Slit Black Washed Jeans", 1349, "https://images.pexels.com/photos/15561984/pexels-photo-15561984.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Retro Light Acid-Wash Relaxed Fit Jeans", 1449, "https://images.pexels.com/photos/18139574/pexels-photo-18139574.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Charcoal Grey Washed Loose Fit Denim", 1399, "https://images.pexels.com/photos/3923106/pexels-photo-3923106.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Elastic Drawstring Denim Everyday Joggers", 1199, "https://images.pexels.com/photos/8276233/pexels-photo-8276233.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Classic 5-Pocket Indigo Regular Fit Jeans", 1299, "https://images.pexels.com/photos/30005364/pexels-photo-30005364.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "TROUSERS": [
        ("Men's Double-Pleated Korean Relaxed Fit Trousers", 1499, "https://images.pexels.com/photos/37111255/pexels-photo-37111255.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Pure Irish Linen Drawstring Casual Trousers", 1699, "https://images.pexels.com/photos/33048700/pexels-photo-33048700.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Tailored Wool-Blend Formal Sartorial Trousers", 1999, "https://images.pexels.com/photos/17901262/pexels-photo-17901262.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Utility Multi-Pocket Olive Cargo Trousers", 1399, "https://images.pexels.com/photos/9077993/pexels-photo-9077993.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Classic Beige Chino Pants with Stretch", 1299, "https://images.pexels.com/photos/15557047/pexels-photo-15557047.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Gurkha Style High-Waisted Sartorial Trousers", 2299, "https://images.pexels.com/photos/9775670/pexels-photo-9775670.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Houndstooth Patterned Smart Casual Trousers", 1599, "https://images.pexels.com/photos/19272491/pexels-photo-19272491.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Navy Blue Formal Dress Pants", 1399, "https://images.pexels.com/photos/12781928/pexels-photo-12781928.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Cropped Ankle Tapered Fit Twill Trousers", 1199, "https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Heavy Cotton Straight-Leg Workwear Pants", 1449, "https://images.pexels.com/photos/3998093/pexels-photo-3998093.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "ETHNIC SETS": [
        ("Men's Ivory Raw Silk Sherwani with Zari Stole", 4999, "https://images.pexels.com/photos/28387105/pexels-photo-28387105.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Handloom Lucknowi Chikankari Kurta Pyjama", 2499, "https://images.pexels.com/photos/10004179/pexels-photo-10004179.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Brocade Silk Nehru Jacket & Kurta Set", 2999, "https://images.pexels.com/photos/28579191/pexels-photo-28579191.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Royal Jodhpuri Bandhgala Suit Set", 4499, "https://images.pexels.com/photos/30710244/pexels-photo-30710244.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Resham Embroidered Mustard Festive Kurta", 1899, "https://images.pexels.com/photos/18869576/pexels-photo-18869576.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Asymmetric Cowl Draped Designer Kurta Set", 2799, "https://images.pexels.com/photos/25859034/pexels-photo-25859034.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Mirror Work Pure Cotton Pathani Suit Set", 2199, "https://images.pexels.com/photos/31341558/pexels-photo-31341558.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Floral Digital Printed Chanderi Silk Kurta", 1799, "https://images.pexels.com/photos/6616673/pexels-photo-6616673.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Zari Bordered Pure Silk Angrakha Set", 3299, "https://images.pexels.com/photos/5256701/pexels-photo-5256701.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Festive Velvet Waistcoat & Churidar Set", 2899, "https://images.pexels.com/photos/31847730/pexels-photo-31847730.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "SWEATSHIRTS": [
        ("Men's French Terry Heavyweight Crewneck Sweatshirt", 1299, "https://images.pexels.com/photos/12713395/pexels-photo-12713395.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Drop-Shoulder Streetwear Fleece Hoodie", 1499, "https://images.pexels.com/photos/10618446/pexels-photo-10618446.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Minimalist Embroidered Logo Pullover", 1199, "https://images.pexels.com/photos/6103704/pexels-photo-6103704.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Raglan Sleeve Vintage Heather Grey Sweatshirt", 1149, "https://images.pexels.com/photos/30769108/pexels-photo-30769108.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Washed Acid Charcoal Relaxed Sweatshirt", 1349, "https://images.pexels.com/photos/14707868/pexels-photo-14707868.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Retro Colorblock Athletic Zip Sweatshirt", 1399, "https://images.pexels.com/photos/17273952/pexels-photo-17273952.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's SIVORA Atelier Heritage Crest Sweatshirt", 1599, "https://images.pexels.com/photos/31102998/pexels-photo-31102998.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Waffle Textured Rib Hem Casual Pullover", 1249, "https://images.pexels.com/photos/17340233/pexels-photo-17340233.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Thermal Sherpa Lined Winter Warm Hoodie", 1799, "https://images.pexels.com/photos/12643001/pexels-photo-12643001.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Japanese Street Graphic Printed Hoodie", 1499, "https://images.pexels.com/photos/9992898/pexels-photo-9992898.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "JACKETS": [
        ("Men's Suede Leather Biker Motorcycle Jacket", 3999, "https://images.pexels.com/photos/19426470/pexels-photo-19426470.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Quilted Down Winter Puffer Jacket", 2999, "https://images.pexels.com/photos/5264926/pexels-photo-5264926.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Italian Wool Tailored Double-Breasted Blazer", 4499, "https://images.pexels.com/photos/19461513/pexels-photo-19461513.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Vintage Sherpa-Lined Denim Trucker Jacket", 2499, "https://images.pexels.com/photos/15853827/pexels-photo-15853827.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Varsity College Wool & Leather Bomber Jacket", 2799, "https://images.pexels.com/photos/8276229/pexels-photo-8276229.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Classic Harrington Full-Zip Windbreaker", 1999, "https://images.pexels.com/photos/15888763/pexels-photo-15888763.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Corduroy Sherpa Collar Casual Jacket", 2199, "https://images.pexels.com/photos/11268392/pexels-photo-11268392.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Tactical Utility Multi-Pocket Field Jacket", 2399, "https://images.pexels.com/photos/6616649/pexels-photo-6616649.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Tuxedo Velvet Evening Lapel Blazer", 3799, "https://images.pexels.com/photos/28945188/pexels-photo-28945188.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Water-Resistant Packable Travel Jacket", 1899, "https://images.pexels.com/photos/38876519/pexels-photo-38876519.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "FOOTWEAR": [
        ("Men's Handcrafted Italian Calfskin Penny Loafers", 2999, "https://images.pexels.com/photos/14561037/pexels-photo-14561037.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Chunky Retro Streetwear Platform Sneakers", 2499, "https://images.pexels.com/photos/9027058/pexels-photo-9027058.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Pure Leather Hand-Stitched Chelsea Boots", 3499, "https://images.pexels.com/photos/5010342/pexels-photo-5010342.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Traditional Zardozi Embroidered Royal Juttis", 1899, "https://images.pexels.com/photos/15012260/pexels-photo-15012260.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Minimalist White Nappa Leather Sneakers", 2199, "https://images.pexels.com/photos/11749556/pexels-photo-11749556.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Double Monk Strap Goodyear Welted Formal Shoes", 3299, "https://images.pexels.com/photos/6121448/pexels-photo-6121448.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Suede Desert Chukka Ankle Boots", 2699, "https://images.pexels.com/photos/12839554/pexels-photo-12839554.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Handcrafted Braided Kolhapuri Leather Chappals", 1299, "https://images.pexels.com/photos/36349798/pexels-photo-36349798.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's High-Top Canvas Retro Skater Trainers", 1699, "https://images.pexels.com/photos/14941569/pexels-photo-14941569.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Oxford Brogue Wingtip Burnished Dress Shoes", 3199, "https://images.pexels.com/photos/31000057/pexels-photo-31000057.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "ACCESSORIES": [
        ("Men's SIVORA Swiss Chronograph Automatic Watch", 4999, "https://images.pexels.com/photos/16895004/pexels-photo-16895004.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Full-Grain Italian Leather Reversible Belt", 1299, "https://images.pexels.com/photos/38846644/pexels-photo-38846644.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Polarized Gold Frame Aviator Sunglasses", 1599, "https://images.pexels.com/photos/30133696/pexels-photo-30133696.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's RFID Protected Bifold Genuine Leather Wallet", 999, "https://images.pexels.com/photos/8874933/pexels-photo-8874933.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Pure Jacquard Silk Necktie & Pocket Square Set", 899, "https://images.pexels.com/photos/39344096/pexels-photo-39344096.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Solid Sterling Silver Heavy Cuban Link Chain", 2499, "https://images.pexels.com/photos/18533673/pexels-photo-18533673.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's 100% Cashmere Wool Woven Winter Scarf", 1499, "https://images.pexels.com/photos/39731512/pexels-photo-39731512.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Textured Leather Professional Laptop Briefcase", 3499, "https://images.pexels.com/photos/4258605/pexels-photo-4258605.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Engraved Matte Black Signet Ring", 699, "https://images.pexels.com/photos/31896868/pexels-photo-31896868.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Men's Heavy Canvas Streetwear Everyday Tote Bag", 799, "https://images.pexels.com/photos/30510954/pexels-photo-30510954.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
}

WOMEN_DATA = {
    "SAREES": [
        ("Women's Banarasi Pure Katan Zari Silk Saree", 3999, "https://images.pexels.com/photos/34673582/pexels-photo-34673582.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Kanjeevaram Gold Brocade Temple Saree", 4499, "https://images.pexels.com/photos/20591025/pexels-photo-20591025.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Hand-Painted Floral Organza Silk Saree", 2499, "https://images.pexels.com/photos/34658495/pexels-photo-34658495.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Chanderi Tissue Metallic Sheen Saree", 2199, "https://images.pexels.com/photos/36931056/pexels-photo-36931056.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Paithani Peacock Border Pure Silk Saree", 3899, "https://images.pexels.com/photos/18010397/pexels-photo-18010397.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Pastel Georgette Lucknowi Chikankari Saree", 2799, "https://images.pexels.com/photos/14377418/pexels-photo-14377418.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Pure Tussar Silk Hand Block Printed Saree", 2399, "https://images.pexels.com/photos/32500101/pexels-photo-32500101.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Velvet Zardozi Embroidered Cocktail Saree", 4199, "https://images.pexels.com/photos/26887686/pexels-photo-26887686.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Handloom Linen Metallic Border Drape Saree", 1799, "https://images.pexels.com/photos/17661994/pexels-photo-17661994.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Bandhani Hand-Dyed Pure Georgette Saree", 2699, "https://images.pexels.com/photos/30268122/pexels-photo-30268122.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "ETHNIC SETS": [
        ("Women's Crimson Bridal Resham Embroidered Choli Set", 4999, "https://images.pexels.com/photos/39457484/pexels-photo-39457484.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Royal Velvet Peplum Sharara Set with Dupatta", 3499, "https://images.pexels.com/photos/7691089/pexels-photo-7691089.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Lucknowi Mirror Work Anarkali Suit Set", 2999, "https://images.pexels.com/photos/7202821/pexels-photo-7202821.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Chanderi Silk Flared Angrakha Kurti Set", 2499, "https://images.pexels.com/photos/13584944/pexels-photo-13584944.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Festive Brocade Gharara 3-Piece Ensemble", 3699, "https://images.pexels.com/photos/35666033/pexels-photo-35666033.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Silk Straight Kurta & Cigarette Pant Set", 1999, "https://images.pexels.com/photos/19531053/pexels-photo-19531053.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Draped Georgette Dhoti Pant Indo-Western Suit", 2799, "https://images.pexels.com/photos/4048043/pexels-photo-4048043.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Bandhej Print Flared Palazzo Suit Set", 1899, "https://images.pexels.com/photos/36367484/pexels-photo-36367484.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Zari Woven Pure Banarasi Kurti & Pant Set", 2899, "https://images.pexels.com/photos/28775829/pexels-photo-28775829.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Sheer Organza Cape Gown Festive Set", 3999, "https://images.pexels.com/photos/34039341/pexels-photo-34039341.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "DRESSES": [
        ("Women's Pleated Chiffon Tiered Cocktail Midi Dress", 1799, "https://images.pexels.com/photos/16375797/pexels-photo-16375797.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Midnight Velvet Cowl-Neck Gala Evening Gown", 3499, "https://images.pexels.com/photos/8484131/pexels-photo-8484131.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Satin Bias-Cut Slip Dress in Champagne", 1599, "https://images.pexels.com/photos/39655098/pexels-photo-39655098.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Floral Printed Boho Ruffle Maxi Dress", 1499, "https://images.pexels.com/photos/9811241/pexels-photo-9811241.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Pure French Linen Button-Down Shirt Dress", 1699, "https://images.pexels.com/photos/8387150/pexels-photo-8387150.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Corset Waist Structured Evening Midi Dress", 2199, "https://images.pexels.com/photos/36284022/pexels-photo-36284022.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Off-Shoulder Embroidered Reception Gown", 3999, "https://images.pexels.com/photos/19112397/pexels-photo-19112397.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Ribbed Knit Bodycon Cutout Midi Dress", 1299, "https://images.pexels.com/photos/14806252/pexels-photo-14806252.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Sequined Mermaid Silhouette Party Dress", 2999, "https://images.pexels.com/photos/1229178/pexels-photo-1229178.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Broderie Anglaise White Summer Sundress", 1899, "https://images.pexels.com/photos/18860925/pexels-photo-18860925.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "KURTAS": [
        ("Women's Mulmul Cotton Floral Printed A-Line Kurta", 899, "https://images.pexels.com/photos/31450722/pexels-photo-31450722.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Silk Blend Asymmetric Hem Designer Tunic", 1299, "https://images.pexels.com/photos/21263486/pexels-photo-21263486.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Handloom Khadi Cotton Straight Kurta", 999, "https://images.pexels.com/photos/29368877/pexels-photo-29368877.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Pristine White Chikankari Long Royal Kurti", 1599, "https://images.pexels.com/photos/25489124/pexels-photo-25489124.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Kashmiri Aari Needlework Embroidered Kurta", 1899, "https://images.pexels.com/photos/31879661/pexels-photo-31879661.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Front-Slit Indigo Dabu Print Straight Kurta", 1099, "https://images.pexels.com/photos/17578435/pexels-photo-17578435.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Bandhani Silk Festive Straight Cut Kurti", 1399, "https://images.pexels.com/photos/23223849/pexels-photo-23223849.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Pintuck Yoke Pure Cotton Dailywear Kurta", 799, "https://images.pexels.com/photos/11411551/pexels-photo-11411551.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Velvet Zardozi Short Festive Kurti", 2199, "https://images.pexels.com/photos/8777190/pexels-photo-8777190.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Kalamkari Hand-Block Flared Anarkali Kurta", 1499, "https://images.pexels.com/photos/6892694/pexels-photo-6892694.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "TOPS": [
        ("Women's Cropped Ribbed Knit Streetwear Top", 599, "https://images.pexels.com/photos/33616291/pexels-photo-33616291.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Oversized Boyfriend Fit Graphic Tee", 699, "https://images.pexels.com/photos/5704719/pexels-photo-5704719.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Silk Satin Cowl-Neck Luxury Camisole Top", 899, "https://images.pexels.com/photos/29168547/pexels-photo-29168547.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Puff Sleeve Embroidered Vintage Blouse", 999, "https://images.pexels.com/photos/5168531/pexels-photo-5168531.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Broderie Anglaise Peplum Cotton Top", 849, "https://images.pexels.com/photos/12112063/pexels-photo-12112063.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Ruffled Sheer Chiffon Formal Blouse", 1099, "https://images.pexels.com/photos/8335273/pexels-photo-8335273.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's One-Shoulder Asymmetric Knit Party Top", 799, "https://images.pexels.com/photos/27204295/pexels-photo-27204295.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Halter Neck Pure Linen Summer Crop Top", 649, "https://images.pexels.com/photos/8941601/pexels-photo-8941601.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Bohemian Peasant Top with Tassels", 749, "https://images.pexels.com/photos/13192185/pexels-photo-13192185.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Structured Sweetheart Corset Top", 1199, "https://images.pexels.com/photos/21263499/pexels-photo-21263499.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "CO ORD SETS": [
        ("Women's Pure Linen Blazer & Wide-Leg Trouser Co-ord", 2999, "https://images.pexels.com/photos/7043252/pexels-photo-7043252.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Printed Satin Shirt & Palazzo 2-Piece Set", 1999, "https://images.pexels.com/photos/34121563/pexels-photo-34121563.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Cozy Ribbed Knit Lounge Co-ord Set", 1499, "https://images.pexels.com/photos/8619007/pexels-photo-8619007.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Tweed Cropped Jacket & Skirt Twin Set", 2799, "https://images.pexels.com/photos/3682293/pexels-photo-3682293.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Bohemian Printed Kimono & Pant Co-ord", 1799, "https://images.pexels.com/photos/16217395/pexels-photo-16217395.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Monochromatic Cotton Waistcoat & Pant Set", 2299, "https://images.pexels.com/photos/31929486/pexels-photo-31929486.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Flared Crop Top & Tiered Culottes Co-ord", 1699, "https://images.pexels.com/photos/5713294/pexels-photo-5713294.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Velvet Zari Embroidered Evening Co-ord Set", 3299, "https://images.pexels.com/photos/7691227/pexels-photo-7691227.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Striped Resort Collar Shirt & Shorts Set", 1399, "https://images.pexels.com/photos/8751532/pexels-photo-8751532.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Off-Shoulder Top & Draped Wrap Skirt Co-ord", 1899, "https://images.pexels.com/photos/13830158/pexels-photo-13830158.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "BOTTOMS": [
        ("Women's High-Rise Vintage Wide Leg Denim Jeans", 1499, "https://images.pexels.com/photos/39362013/pexels-photo-39362013.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Pleated Tailored Wide Palazzo Trousers", 1399, "https://images.pexels.com/photos/30562018/pexels-photo-30562018.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Retro Bell-Bottom Flare Denim Jeans", 1599, "https://images.pexels.com/photos/12850123/pexels-photo-12850123.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Paperbag Waist Cotton Casual Trousers", 1199, "https://images.pexels.com/photos/22691313/pexels-photo-22691313.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Raw Hem Straight Cut Blue Denim Jeans", 1349, "https://images.pexels.com/photos/31613163/pexels-photo-31613163.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Pure Silk Blend Draped Dhoti Pants", 1299, "https://images.pexels.com/photos/23223830/pexels-photo-23223830.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Tapered Linen Ankle Cigarette Pants", 1249, "https://images.pexels.com/photos/3195980/pexels-photo-3195980.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Multi-Pocket Streetwear Cargo Joggers", 1399, "https://images.pexels.com/photos/7202788/pexels-photo-7202788.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Velvet Wide-Leg Evening Trousers", 1799, "https://images.pexels.com/photos/8881954/pexels-photo-8881954.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Pintuck Flared Culottes with Belt", 1149, "https://images.pexels.com/photos/39538032/pexels-photo-39538032.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "SWEATSHIRTS": [
        ("Women's Drop-Shoulder French Terry Oversized Sweatshirt", 1199, "https://images.pexels.com/photos/11846225/pexels-photo-11846225.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Cropped Pastel Fleece Winter Pullover", 999, "https://images.pexels.com/photos/12173376/pexels-photo-12173376.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Embroidered SIVORA Crest Collegiate Sweatshirt", 1399, "https://images.pexels.com/photos/31884491/pexels-photo-31884491.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Acid-Washed Vintage Streetwear Pullover", 1249, "https://images.pexels.com/photos/12786610/pexels-photo-12786610.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Velour Soft-Touch Relaxed Crewneck", 1299, "https://images.pexels.com/photos/15613165/pexels-photo-15613165.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Half-Zip Plush Fleece Winter Sweater", 1499, "https://images.pexels.com/photos/19922237/pexels-photo-19922237.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Minimalist Graphic Slogan Crew Sweatshirt", 1099, "https://images.pexels.com/photos/25308993/pexels-photo-25308993.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Ribbed Hem Brushed Cotton Daily Sweatshirt", 899, "https://images.pexels.com/photos/39299440/pexels-photo-39299440.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Thermal Waffle Knit Cozy Loungewear Top", 949, "https://images.pexels.com/photos/40273411/pexels-photo-40273411.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Pastel Tie-Dye Oversized Streetwear Hoodie", 1349, "https://images.pexels.com/photos/9476355/pexels-photo-9476355.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "JACKETS": [
        ("Women's Houndstooth Double-Breasted Tailored Blazer", 2999, "https://images.pexels.com/photos/18999070/pexels-photo-18999070.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Cropped Genuine Lambskin Leather Biker Jacket", 3999, "https://images.pexels.com/photos/28517491/pexels-photo-28517491.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Oversized Vintage Denim Trucker Jacket", 2199, "https://images.pexels.com/photos/4376757/pexels-photo-4376757.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Classic Double-Breasted Wool Trench Coat", 3799, "https://images.pexels.com/photos/2227774/pexels-photo-2227774.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Quilted Diamond Pattern Down Puffer Jacket", 2699, "https://images.pexels.com/photos/12498401/pexels-photo-12498401.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Faux Shearling Lined Aviator Jacket", 3299, "https://images.pexels.com/photos/36311379/pexels-photo-36311379.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Bouclé Tweed French Style Cropped Jacket", 2799, "https://images.pexels.com/photos/15259946/pexels-photo-15259946.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Reversible Bomber Streetwear Zip Jacket", 2299, "https://images.pexels.com/photos/25328651/pexels-photo-25328651.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Cape Silhouette Tailored Wool Evening Blazer", 3499, "https://images.pexels.com/photos/17503287/pexels-photo-17503287.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Embroidered Velvet Shrug Open-Front Jacket", 1999, "https://images.pexels.com/photos/13452828/pexels-photo-13452828.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "FOOTWEAR": [
        ("Women's Milano Crystal Embellished Pointed Stilettos", 3499, "https://images.pexels.com/photos/3195978/pexels-photo-3195978.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Handcrafted Bridal Zardozi Silk Juttis", 1899, "https://images.pexels.com/photos/33343614/pexels-photo-33343614.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Strappy Metallic Gold Block Heel Sandals", 2199, "https://images.pexels.com/photos/8367851/pexels-photo-8367851.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Nude Italian Leather Classic Pointed Pumps", 2799, "https://images.pexels.com/photos/19060012/pexels-photo-19060012.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Chunky Platform Retro Lifestyle Sneakers", 2299, "https://images.pexels.com/photos/8201183/pexels-photo-8201183.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Pearl Encrusted Pointed Toe Flat Mules", 1799, "https://images.pexels.com/photos/35069916/pexels-photo-35069916.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Suede Knee-High Elegant Dress Boots", 3899, "https://images.pexels.com/photos/16848917/pexels-photo-16848917.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Kolhapuri Gold Braided Leather Flats", 1199, "https://images.pexels.com/photos/19895958/pexels-photo-19895958.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Woven Leather Soft Slip-On Summer Loafers", 1999, "https://images.pexels.com/photos/9267583/pexels-photo-9267583.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Jute Espadrille Ankle-Strap Wedge Sandals", 1699, "https://images.pexels.com/photos/12111003/pexels-photo-12111003.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "ACCESSORIES": [
        ("Women's Pebbled Italian Leather Top-Handle Tote Bag", 3999, "https://images.pexels.com/photos/19638916/pexels-photo-19638916.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Quilted Leather Gold Chain Evening Sling Bag", 2499, "https://images.pexels.com/photos/18380705/pexels-photo-18380705.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's 22k Gold-Plated Polki Kundan Bridal Choker", 3299, "https://images.pexels.com/photos/34077589/pexels-photo-34077589.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Baroque Freshwater Pearl Drop Earrings", 1299, "https://images.pexels.com/photos/38526721/pexels-photo-38526721.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's 100% Pure Mulberry Silk Printed Hair Scarf", 799, "https://images.pexels.com/photos/11726516/pexels-photo-11726516.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Oversized Tortoiseshell Cat-Eye Sunglasses", 1499, "https://images.pexels.com/photos/38217928/pexels-photo-38217928.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Hand-Embroidered Zari Bridal Potli Purse", 1199, "https://images.pexels.com/photos/5717972/pexels-photo-5717972.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Diamond Accent Rose Gold Luxury Wristwatch", 4499, "https://images.pexels.com/photos/27046143/pexels-photo-27046143.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's Sparkling CZ Crystal Tennis Bracelet", 1699, "https://images.pexels.com/photos/34116991/pexels-photo-34116991.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Women's SIVORA Signature Velvet Oud Parfum Extrait", 2199, "https://images.pexels.com/photos/16848896/pexels-photo-16848896.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
}

GIRLS_DATA = {
    "TWIN SETS": [
        ("Girls' Pastel Fleece Sweatshirt & Joggers Twin Set", 999, "https://images.pexels.com/photos/32990183/pexels-photo-32990183.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Floral Printed Top & Culottes 2-Piece Set", 899, "https://images.pexels.com/photos/11286094/pexels-photo-11286094.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Denim Dungaree & Striped Inner T-Shirt Set", 1199, "https://images.pexels.com/photos/6334399/pexels-photo-6334399.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Ribbed Knit Summer Tee & Shorts Co-ord Set", 749, "https://images.pexels.com/photos/3762802/pexels-photo-3762802.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Peppa Pig Graphic Hooded Sweat-Set", 949, "https://images.pexels.com/photos/27785703/pexels-photo-27785703.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Ruffle Collar Peplum Top & Leggings Set", 849, "https://images.pexels.com/photos/7939870/pexels-photo-7939870.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Plaid Tweed Blazer & Pleated Skort Twin Set", 1499, "https://images.pexels.com/photos/19230262/pexels-photo-19230262.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Tiered Bohemian Crop Top & Flared Pants Set", 999, "https://images.pexels.com/photos/36046008/pexels-photo-36046008.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Sporty Tracksuit Full-Zip Jacket & Pant Set", 1149, "https://images.pexels.com/photos/15125593/pexels-photo-15125593.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Silky Satin Nightwear Button-Up Pyjama Set", 799, "https://images.pexels.com/photos/7329622/pexels-photo-7329622.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "ETHNIC WEAR": [
        ("Girls' Fairytale Lilac Embroidered Lehenga Choli", 2499, "https://images.pexels.com/photos/36046002/pexels-photo-36046002.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Festive Yellow Silk Ghagra Choli with Dupatta", 1999, "https://images.pexels.com/photos/13932980/pexels-photo-13932980.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Traditional Kanjeevaram Pattu Pavadai Set", 2299, "https://images.pexels.com/photos/34318550/pexels-photo-34318550.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Mirror Work Pastel Anarkali Suit Set", 1799, "https://images.pexels.com/photos/3771644/pexels-photo-3771644.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Georgette Tiered Sharara 3-Piece Festive Set", 1899, "https://images.pexels.com/photos/38247111/pexels-photo-38247111.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Brocade Gold Zari Festive Party Lehenga", 2699, "https://images.pexels.com/photos/36046009/pexels-photo-36046009.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Crimson Velvet Embroidered Chaniya Choli", 2899, "https://images.pexels.com/photos/19449073/pexels-photo-19449073.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Organza Draped Cape Gown Festive Dress", 2199, "https://images.pexels.com/photos/36046014/pexels-photo-36046014.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Handloom Chanderi Silk Flared Kurta Set", 1599, "https://images.pexels.com/photos/36893890/pexels-photo-36893890.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Bandhani Printed Peplum Kurti & Dhoti Set", 1499, "https://images.pexels.com/photos/7139042/pexels-photo-7139042.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "FROCKS": [
        ("Girls' Princess Layered Tulle Birthday Party Frock", 1499, "https://images.pexels.com/photos/19230122/pexels-photo-19230122.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Pure Cotton Floral Ruffled Summer Sundress", 899, "https://images.pexels.com/photos/18476125/pexels-photo-18476125.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Royal Velvet Bow-Tie Holiday Party Frock", 1699, "https://images.pexels.com/photos/14351882/pexels-photo-14351882.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Sparkling Sequin Shimmer Gala Birthday Dress", 1799, "https://images.pexels.com/photos/2491110/pexels-photo-2491110.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Peter Pan Collar Vintage Lace A-Line Frock", 1199, "https://images.pexels.com/photos/30394248/pexels-photo-30394248.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Broderie Anglaise Crisp White Summer Frock", 1299, "https://images.pexels.com/photos/36046011/pexels-photo-36046011.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Smocked Bodice Daisy Print Playtime Dress", 799, "https://images.pexels.com/photos/6461325/pexels-photo-6461325.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Satin Princess Ballroom Gown with Belt", 2199, "https://images.pexels.com/photos/7743490/pexels-photo-7743490.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Polka Dot Retro Flared Swing Dress", 949, "https://images.pexels.com/photos/7385454/pexels-photo-7385454.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Butterfly 3D Embroidered Organza Party Frock", 1599, "https://images.pexels.com/photos/33411373/pexels-photo-33411373.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "TOPS": [
        ("Girls' Unicorn Embroidered 100% Cotton Graphic Tee", 499, "https://images.pexels.com/photos/36026404/pexels-photo-36026404.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Ribbed Lettuce-Edge Pastel Cotton Top", 449, "https://images.pexels.com/photos/37638214/pexels-photo-37638214.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Puff Sleeve Ditsy Floral Print Blouse", 599, "https://images.pexels.com/photos/22604244/pexels-photo-22604244.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Organic Cotton Cute Animal Motif T-Shirt", 479, "https://images.pexels.com/photos/16420105/pexels-photo-16420105.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Knitted Button-Up Cardigan Sweater Top", 799, "https://images.pexels.com/photos/6652280/pexels-photo-6652280.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Striped Sailor Collar Summer Cotton Tee", 549, "https://images.pexels.com/photos/36026411/pexels-photo-36026411.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Pastel Shimmer Butterfly Graphic T-Shirt", 499, "https://images.pexels.com/photos/6072347/pexels-photo-6072347.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Off-Shoulder Bohemian Smocked Crop Top", 649, "https://images.pexels.com/photos/9807147/pexels-photo-9807147.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Tie-Front Glitter Birthday Party Top", 599, "https://images.pexels.com/photos/20433615/pexels-photo-20433615.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Loose Fit Cute Slogan Streetwear Tee", 499, "https://images.pexels.com/photos/36046003/pexels-photo-36046003.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "WINTERWEAR": [
        ("Girls' Faux Fur Hooded Warm Winter Parka Coat", 1999, "https://images.pexels.com/photos/5859321/pexels-photo-5859321.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Plush Teddy Bear Sherpa Full-Zip Jacket", 1499, "https://images.pexels.com/photos/38438949/pexels-photo-38438949.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Quilted Down Lightweight Pastel Puffer Coat", 1799, "https://images.pexels.com/photos/36045985/pexels-photo-36045985.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Cable Knit Soft Wool Crewneck Sweater", 1199, "https://images.pexels.com/photos/7788326/pexels-photo-7788326.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Colorblock Fleece Lined Hooded Pullover", 999, "https://images.pexels.com/photos/35626746/pexels-photo-35626746.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Sherpa Collar Warm Denim Winter Jacket", 1699, "https://images.pexels.com/photos/7329637/pexels-photo-7329637.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Fair Isle Patterned Scandinavian Knit Sweater", 1299, "https://images.pexels.com/photos/17839399/pexels-photo-17839399.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Wind-Resistant Floral Winter Snowsuit", 2199, "https://images.pexels.com/photos/10153594/pexels-photo-10153594.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Pearl Button Cardigan Warm Winter Shrug", 899, "https://images.pexels.com/photos/5542482/pexels-photo-5542482.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Pompom Hooded Fleece Warm Winter Cape", 1099, "https://images.pexels.com/photos/5631404/pexels-photo-5631404.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "BOTTOM": [
        ("Girls' Embroidered Butterfly Stretch Denim Jeans", 999, "https://images.pexels.com/photos/4088967/pexels-photo-4088967.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Rainbow Stripe Taped Cotton Everyday Leggings", 499, "https://images.pexels.com/photos/235398/pexels-photo-235398.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Pleated Plaid High-Waist Tennis Skirt", 699, "https://images.pexels.com/photos/34181912/pexels-photo-34181912.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Skinny Fit Washed Blue Denim Jeans", 899, "https://images.pexels.com/photos/7431704/pexels-photo-7431704.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Elastic Waist Twill Multi-Pocket Cargo Pants", 849, "https://images.pexels.com/photos/38399839/pexels-photo-38399839.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Paperbag Waist Tie-Belt Summer Shorts", 549, "https://images.pexels.com/photos/5997673/pexels-photo-5997673.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Polka Dot Frilled Cotton Culottes", 649, "https://images.pexels.com/photos/20433618/pexels-photo-20433618.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Wide Leg Retro Washed Flare Jeans", 1099, "https://images.pexels.com/photos/34181909/pexels-photo-34181909.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Soft Fleece Winter Jogger Trackpants", 699, "https://images.pexels.com/photos/15648207/pexels-photo-15648207.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Distressed Cut-Off Denim Summer Shorts", 599, "https://images.pexels.com/photos/16244475/pexels-photo-16244475.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "FOOTWEAR": [
        ("Girls' Sparkling Silver Glitter Ballet Flats", 999, "https://images.pexels.com/photos/27816523/pexels-photo-27816523.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' LED Light-Up Sporty Velcro Running Sneakers", 1299, "https://images.pexels.com/photos/7202253/pexels-photo-7202253.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Classic Black Patent Leather Mary Jane Shoes", 1199, "https://images.pexels.com/photos/36046001/pexels-photo-36046001.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Bow-Knot Soft Sole Leather Summer Sandals", 799, "https://images.pexels.com/photos/32985958/pexels-photo-32985958.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Faux Fur Warm Winter Snow Booties", 1399, "https://images.pexels.com/photos/36529282/pexels-photo-36529282.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Metallic Gold Strappy Festive Party Shoes", 899, "https://images.pexels.com/photos/7330337/pexels-photo-7330337.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Floral Embroidered Canvas Slip-On Shoes", 699, "https://images.pexels.com/photos/8084056/pexels-photo-8084056.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Pastel Chunky Platform Playtime Sneakers", 1149, "https://images.pexels.com/photos/6652212/pexels-photo-6652212.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Soft Suede Bow Moccasin Slip-On Flats", 849, "https://images.pexels.com/photos/9648682/pexels-photo-9648682.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Handcrafted Pearl Zari Embroidered Juttis", 1099, "https://images.pexels.com/photos/18862066/pexels-photo-18862066.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "ACCESSORIES": [
        ("Girls' Glitter Unicorn Horn Mini School Backpack", 899, "https://images.pexels.com/photos/3747246/pexels-photo-3747246.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Velvet Pearl Knotted Headband 3-Pack Set", 399, "https://images.pexels.com/photos/38775757/pexels-photo-38775757.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Pastel Enamel Charm Bracelet & Necklace Set", 499, "https://images.pexels.com/photos/8084232/pexels-photo-8084232.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Ribbon Bow & Floral Hairpins 10-Piece Box", 349, "https://images.pexels.com/photos/38491388/pexels-photo-38491388.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Heart-Shaped UV400 Protection Sunglasses", 449, "https://images.pexels.com/photos/17541976/pexels-photo-17541976.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Analog Waterproof Cartoon Character Watch", 699, "https://images.pexels.com/photos/8669539/pexels-photo-8669539.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Holographic Glitter Cross-Body Coin Purse", 499, "https://images.pexels.com/photos/20285926/pexels-photo-20285926.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Fuzzy Bear Ears Soft Winter Earmuffs", 399, "https://images.pexels.com/photos/6261891/pexels-photo-6261891.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Embroidered Floral Cotton Summer Bucket Hat", 499, "https://images.pexels.com/photos/3929141/pexels-photo-3929141.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Girls' Beaded Pastel Friendship Ring & Bracelet Set", 299, "https://images.pexels.com/photos/36045982/pexels-photo-36045982.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
}

BOYS_DATA = {
    "SHIRTS": [
        ("Boys' Tropical Leaves Printed Hawaiian Resort Shirt", 799, "https://images.pexels.com/photos/29019431/pexels-photo-29019431.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Classic Navy Gingham Check Casual Cotton Shirt", 849, "https://images.pexels.com/photos/38505602/pexels-photo-38505602.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Pure Linen Mandarin Collar Summer Shirt", 899, "https://images.pexels.com/photos/25849085/pexels-photo-25849085.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' White Crisp Formal Oxford Button-Down Shirt", 749, "https://images.pexels.com/photos/4018840/pexels-photo-4018840.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Indigo Denim Western Dual Pocket Snap Shirt", 999, "https://images.pexels.com/photos/22276464/pexels-photo-22276464.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Red & Black Buffalo Plaid Flannel Warm Shirt", 899, "https://images.pexels.com/photos/12943586/pexels-photo-12943586.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Graffiti Abstract Doodle Casual Half-Sleeve Shirt", 799, "https://images.pexels.com/photos/14586644/pexels-photo-14586644.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Khaki Cotton Safari Double Pocket Camp Shirt", 849, "https://images.pexels.com/photos/15032427/pexels-photo-15032427.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Colorblock Cuban Camp Collar Party Shirt", 799, "https://images.pexels.com/photos/14544401/pexels-photo-14544401.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Chambray Washed Lightweight Everyday Shirt", 749, "https://images.pexels.com/photos/24284775/pexels-photo-24284775.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "T-SHIRTS": [
        ("Boys' T-Rex Dinosaur Embossed Cotton Graphic Tee", 499, "https://images.pexels.com/photos/30710025/pexels-photo-30710025.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Nautical Navy & White Striped Crewneck T-Shirt", 449, "https://images.pexels.com/photos/39280829/pexels-photo-39280829.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Marvel Action Hero Bold Graphic T-Shirt", 599, "https://images.pexels.com/photos/38778561/pexels-photo-38778561.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Pique Cotton Tipped Collar Polo T-Shirt", 549, "https://images.pexels.com/photos/4081301/pexels-photo-4081301.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Oversized Skater Streetwear Graphic Tee", 599, "https://images.pexels.com/photos/38245944/pexels-photo-38245944.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Colorblock Raglan Athletic Sport T-Shirt", 499, "https://images.pexels.com/photos/8996289/pexels-photo-8996289.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Tie-Dye Swirl Vibrant Summer T-Shirt", 549, "https://images.pexels.com/photos/33512705/pexels-photo-33512705.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Outer Space Galaxy Glow-in-the-Dark Tee", 649, "https://images.pexels.com/photos/13189387/pexels-photo-13189387.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Waffle Knit Thermal Long Sleeve Henley Tee", 699, "https://images.pexels.com/photos/1620808/pexels-photo-1620808.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Racing Speedway Turbo Printed Sporty Tee", 499, "https://images.pexels.com/photos/26754972/pexels-photo-26754972.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "TWIN SETS": [
        ("Boys' Resort Printed Shirt & Bermuda Shorts Co-ord", 999, "https://images.pexels.com/photos/31070888/pexels-photo-31070888.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Hooded Sweatshirt & Joggers Tracksuit Set", 1199, "https://images.pexels.com/photos/19731759/pexels-photo-19731759.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Graphic Tee & Denim Dungaree Overalls Set", 1299, "https://images.pexels.com/photos/32143367/pexels-photo-32143367.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Pure Linen Shirt & Drawstring Shorts Twin Set", 1099, "https://images.pexels.com/photos/16296139/pexels-photo-16296139.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Football Sports Jersey & Quick-Dry Shorts Set", 799, "https://images.pexels.com/photos/8387807/pexels-photo-8387807.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Waffle Loungewear Long Sleeve & Pant Co-ord", 899, "https://images.pexels.com/photos/31219096/pexels-photo-31219096.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Safari Wildlife Print Camp Shirt & Shorts Set", 949, "https://images.pexels.com/photos/15961541/pexels-photo-15961541.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Checked Flannel Shirt & Chino Trousers Set", 1249, "https://images.pexels.com/photos/999023/pexels-photo-999023.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Striped Polo Shirt & Cargo Utility Shorts Set", 999, "https://images.pexels.com/photos/17696621/pexels-photo-17696621.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Polar Fleece Winter Zip-Up Jacket & Pant Set", 1399, "https://images.pexels.com/photos/38474727/pexels-photo-38474727.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "ETHNIC WEAR": [
        ("Boys' Royal Navy Brocade Silk Sherwani Set", 2499, "https://images.pexels.com/photos/18493896/pexels-photo-18493896.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Mustard Chikankari Kurta & Churidar Set", 1499, "https://images.pexels.com/photos/7466572/pexels-photo-7466572.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Floral Embroidered Bandi Waistcoat & Kurta", 1799, "https://images.pexels.com/photos/34608857/pexels-photo-34608857.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Traditional Silk Dhoti & Angavastram Kurta Set", 1699, "https://images.pexels.com/photos/33512706/pexels-photo-33512706.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Cotton Mirror Work Festive Pathani Suit", 1399, "https://images.pexels.com/photos/38474740/pexels-photo-38474740.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Festive Digital Printed Chanderi Kurta Set", 1299, "https://images.pexels.com/photos/19754188/pexels-photo-19754188.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Velvet Jodhpuri Royal Bandhgala Suit Set", 2799, "https://images.pexels.com/photos/1619811/pexels-photo-1619811.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Asymmetric Cowl Draped Designer Kurta Pyjama", 1599, "https://images.pexels.com/photos/28120909/pexels-photo-28120909.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Handloom Chanderi Silk Angrakha Set", 1899, "https://images.pexels.com/photos/7470674/pexels-photo-7470674.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Jacquard Waistcoat, Shirt & Breeches Festive Set", 1999, "https://images.pexels.com/photos/6198374/pexels-photo-6198374.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "WINTERWEAR": [
        ("Boys' Colorblock Zip Hooded Down Puffer Jacket", 1899, "https://images.pexels.com/photos/30139940/pexels-photo-30139940.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Sherpa Lined Full-Zip Fleece Winter Jacket", 1499, "https://images.pexels.com/photos/31977204/pexels-photo-31977204.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Varsity Letterman Baseball Snap Bomber Jacket", 1699, "https://images.pexels.com/photos/367191/pexels-photo-367191.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Camouflage Water-Resistant Windbreaker Jacket", 1299, "https://images.pexels.com/photos/4069210/pexels-photo-4069210.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Classic Cable Knit Soft Wool Crewneck Sweater", 1099, "https://images.pexels.com/photos/19364597/pexels-photo-19364597.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Quilted Lightweight Down Sleeveless Winter Vest", 1199, "https://images.pexels.com/photos/38409630/pexels-photo-38409630.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Heavy French Terry Streetwear Graphic Hoodie", 1149, "https://images.pexels.com/photos/30181991/pexels-photo-30181991.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Aviator Faux Leather Sherpa Collar Bomber", 1999, "https://images.pexels.com/photos/14544402/pexels-photo-14544402.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Striped Lambswool Blend Warm Pullover", 999, "https://images.pexels.com/photos/38778554/pexels-photo-38778554.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Thermal Fleece Lined Water-Resistant Parka", 2199, "https://images.pexels.com/photos/5325556/pexels-photo-5325556.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "BOTTOM": [
        ("Boys' Multi-Pocket Utility Cotton Cargo Pants", 899, "https://images.pexels.com/photos/19423092/pexels-photo-19423092.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Straight Fit Durable Dark Wash Denim Jeans", 999, "https://images.pexels.com/photos/32836908/pexels-photo-32836908.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Elastic Waist Cotton Chino Dress Trousers", 799, "https://images.pexels.com/photos/1006102/pexels-photo-1006102.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' French Terry Everyday Casual Jogger Pants", 699, "https://images.pexels.com/photos/14383664/pexels-photo-14383664.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Relaxed Fit Ripped Knee Washed Denim Jeans", 949, "https://images.pexels.com/photos/34952316/pexels-photo-34952316.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Drawstring Twill Utility Bermuda Shorts", 599, "https://images.pexels.com/photos/19017275/pexels-photo-19017275.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Reinforced Knee Outdoor Playtime Trousers", 849, "https://images.pexels.com/photos/969373/pexels-photo-969373.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Washed Black Denim Skater Loose Fit Jeans", 999, "https://images.pexels.com/photos/5799026/pexels-photo-5799026.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Camouflage Printed Fleece Trackpants", 749, "https://images.pexels.com/photos/40044785/pexels-photo-40044785.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Athletic Double Stripe Cotton Sweatpants", 699, "https://images.pexels.com/photos/2533326/pexels-photo-2533326.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "FOOTWEAR": [
        ("Boys' High-Top Retro Basketball Street Sneakers", 1499, "https://images.pexels.com/photos/32638325/pexels-photo-32638325.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Slip-On Checkered Canvas Skate Shoes", 899, "https://images.pexels.com/photos/29562277/pexels-photo-29562277.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Tan Leather Casual Velcro Boat Shoes", 1199, "https://images.pexels.com/photos/35342180/pexels-photo-35342180.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Lightweight Breathable Mesh Running Shoes", 999, "https://images.pexels.com/photos/15024341/pexels-photo-15024341.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Traditional Gold Zari Royal Festive Mojaris", 799, "https://images.pexels.com/photos/5693888/pexels-photo-5693888.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Waterproof Rugged Hiking Ankle Boots", 1699, "https://images.pexels.com/photos/9555946/pexels-photo-9555946.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Minimalist White & Blue Court Sneakers", 1099, "https://images.pexels.com/photos/36730419/pexels-photo-36730419.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Classic Lace-Up Formal Brogue Shoes", 1299, "https://images.pexels.com/photos/7470721/pexels-photo-7470721.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Double Strap Durable Sport Velcro Sandals", 699, "https://images.pexels.com/photos/13869894/pexels-photo-13869894.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Camouflage Waterproof Rubber Rain Boots", 899, "https://images.pexels.com/photos/15395098/pexels-photo-15395098.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
    "ACCESSORIES": [
        ("Boys' Multi-Function Digital LED Sports Watch", 799, "https://images.pexels.com/photos/30690920/pexels-photo-30690920.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Embroidered Streetwear Snapback Flat-Brim Cap", 499, "https://images.pexels.com/photos/15961572/pexels-photo-15961572.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Aviation Style Polarized UV Sunglasses", 599, "https://images.pexels.com/photos/5715033/pexels-photo-5715033.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Tactical Military Nylon Webbing Belt", 399, "https://images.pexels.com/photos/39656406/pexels-photo-39656406.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Dinosaur Adventure Ergonomic School Backpack", 999, "https://images.pexels.com/photos/9266466/pexels-photo-9266466.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Ribbed Knit Warm Pompom Winter Beanie", 399, "https://images.pexels.com/photos/6261882/pexels-photo-6261882.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Reversible Cotton Outdoor Sun Bucket Hat", 449, "https://images.pexels.com/photos/36909814/pexels-photo-36909814.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Comic Superhero Printed Velcro Wallet", 349, "https://images.pexels.com/photos/38655842/pexels-photo-38655842.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Cozy Wool Touchscreen Warm Winter Gloves", 399, "https://images.pexels.com/photos/38000165/pexels-photo-38000165.jpeg?auto=compress&cs=tinysrgb&w=700"),
        ("Boys' Insulated Thermal Stainless Steel Water Pouch", 499, "https://images.pexels.com/photos/1619786/pexels-photo-1619786.jpeg?auto=compress&cs=tinysrgb&w=700"),
    ],
}

def seed_database() -> int:
    """Seed all 360 Limeroad fashion products across Women, Men, Girls, Boys using SQLAlchemy."""
    print("=" * 60)
    print("SEEDING FULL 360 SIVORA APPAREL PRODUCTS (Women, Men, Girls, Boys)")
    print("=" * 60)

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Clear existing orders, order items, chat messages that reference old products
        print("Clearing order items, orders, and chat messages...")
        db.query(OrderItem).delete()
        db.query(Order).delete()
        db.query(ChatMessage).delete()

        # 2. Clear old products & old categories
        print("Deleting old products and categories...")
        db.query(Product).delete()
        db.query(Category).delete()
        db.commit()

        # 3. Create or ensure demo users
        print("Ensuring demo users (Admin & Customer)...")
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin = User(
                username="admin",
                email="admin@sivora.com",
                full_name="SIVORA Admin",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN,
                is_active=True,
            )
            db.add(admin)
        customer = db.query(User).filter(User.username == "customer").first()
        if not customer:
            customer = User(
                username="customer",
                email="customer@sivora.com",
                full_name="SIVORA Customer",
                hashed_password=get_password_hash("customer123"),
                role=UserRole.CUSTOMER,
                is_active=True,
            )
            db.add(customer)

        # Permanent Owner / Admin User (venkatanarasimha)
        vn_user = db.query(User).filter(User.username == "venkatanarasimha").first()
        if not vn_user:
            vn_user = User(
                username="venkatanarasimha",
                email="venkatanarasimha@sivora.com",
                full_name="Venkata Narasimha",
                hashed_password=get_password_hash("venkatanarasimha114"),
                role=UserRole.ADMIN,
                is_active=True,
            )
            db.add(vn_user)
        else:
            vn_user.hashed_password = get_password_hash("venkatanarasimha114")
            vn_user.role = UserRole.ADMIN
            vn_user.is_active = True

        # Permanent Customer User (sivasankar)
        siva_user = db.query(User).filter(User.username == "sivasankar").first()
        if not siva_user:
            siva_user = User(
                username="sivasankar",
                email="sivasankar@sivora.com",
                full_name="Siva Sankar",
                hashed_password=get_password_hash("sivasankar114"),
                role=UserRole.CUSTOMER,
                is_active=True,
            )
            db.add(siva_user)
        else:
            siva_user.hashed_password = get_password_hash("sivasankar114")
            siva_user.role = UserRole.CUSTOMER
            siva_user.is_active = True
        db.commit()

        # 4. Insert 4 Main Categories
        categories_to_create = [
            ("Women", "women", "Handcrafted Banarasi sarees, ethnic sets, evening gowns, chikankari kurtas, designer crop tops, and co-ord sets."),
            ("Men", "men", "Heavyweight oversized tees, French linen shirts, Japanese denim jeans, tailored trousers, and royal sherwanis."),
            ("Girls", "girls", "Chic twin sets, fairytale lehengas, party frocks, ruffle tops, warm winterwear, and glitter footwear."),
            ("Boys", "boys", "Printed resort shirts, graphic tees, twin sets, royal sherwanis, utility cargo pants, and retro sneakers."),
        ]

        cat_map = {}
        for name, slug, desc in categories_to_create:
            cat = Category(name=name, slug=slug, description=desc)
            db.add(cat)
            db.commit()
            db.refresh(cat)
            cat_map[name] = cat.id
            print(f"  + Category: {name} (ID: {cat.id}, Slug: {slug})")

        # 5. Insert all 360 Products (10 per subcategory)
        all_groups = [
            ("Women", WOMEN_DATA),
            ("Men", MEN_DATA),
            ("Girls", GIRLS_DATA),
            ("Boys", BOYS_DATA),
        ]

        total_inserted = 0
        for cat_name, subcat_dict in all_groups:
            cat_id = cat_map[cat_name]
            for subcat, items in subcat_dict.items():
                for idx, (p_name, price, img) in enumerate(items, 1):
                    slug = slugify(f"{cat_name}-{subcat}-{p_name}-{idx}")
                    description = f"Subcategory: {subcat} | {cat_name} premium collection. High quality authentic fabric, tailored craftsmanship, comfortable fit and luxury finish."
                    stock = 50 + (idx * 5)
                    prod = Product(
                        name=p_name,
                        slug=slug,
                        description=description,
                        price=Decimal(str(price)),
                        stock=stock,
                        category_id=cat_id,
                        image_url=img,
                        thumbnail_url=img,
                        is_active=True,
                    )
                    db.add(prod)
                    total_inserted += 1
                db.commit()
                print(f"  Inserted {len(items)} products for {cat_name} -> {subcat}")

        print(f"\nAll {total_inserted} products successfully inserted into database.")

        # 6. Skip heavy ChromaDB vector indexing in production to avoid Render 512MB RAM OOM crash
        try:
            if os.environ.get("SKIP_CHROMA_SEED") == "true" or settings.ENVIRONMENT == "production":
                print("  + Skipped heavy ChromaDB neural indexing in production to respect 512MB RAM quota.")
            else:
                from app.services.rag_service import RAGService
                RAGService.index_all_products(db)
        except Exception as e:
            print(f"  ! ChromaDB indexing notice: {e}")

        # 7. Redis Cache flush
        try:
            from app.services.redis_service import CacheService
            CacheService.invalidate_pattern("categories:*")
            CacheService.invalidate_pattern("products:*")
            CacheService.invalidate_pattern("ai:*")
            print("  + Redis cache cleared.")
        except Exception as e:
            print(f"  ! Redis cache notice: {e}")

        print("=" * 60)
        print(f"SUCCESS: Seeded {total_inserted} Products across 4 Categories!")
        print("=" * 60)
        return total_inserted

    except Exception as exc:
        db.rollback()
        print(f"ERROR seeding catalog: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()


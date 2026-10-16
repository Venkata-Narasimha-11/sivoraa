import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Heart,
  ShoppingBag,
  Truck,
  Sparkles,
  Crown,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Star,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import useCartStore from '../stores/useCartStore';
import useAuthStore from '../stores/useAuthStore';
import { useWishlist } from '../hooks/useWishlist';
import { useProductsQuery } from '../hooks/useProducts';
import ThemeToggle from '../components/common/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

type PrimaryGender = 'WOMEN' | 'MEN' | 'GIRLS' | 'BOYS';

interface SubcategoryPill {
  id: string;
  name: string;
  label: string;
  image?: string;
  isMyFeed?: boolean;
}

const LIMEROAD_SUBCATEGORIES: Record<PrimaryGender, SubcategoryPill[]> = {
  WOMEN: [
    { id: 'my-feed', name: 'ALL', label: 'MY FEED', isMyFeed: true },
    { id: 'sarees', name: 'SAREES', label: 'SAREES', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=140&q=80' },
    { id: 'ethnic-sets', name: 'ETHNIC SETS', label: 'ETHNIC SETS', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=140&q=80' },
    { id: 'dresses', name: 'DRESSES', label: 'DRESSES', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=140&q=80' },
    { id: 'kurtas', name: 'KURTAS', label: 'KURTAS', image: 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=140&q=80' },
    { id: 'tops', name: 'TOPS', label: 'TOPS', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=140&q=80' },
    { id: 'coord-sets', name: 'CO ORD SETS', label: 'CO ORD SETS', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=140&q=80' },
    { id: 'bottoms', name: 'BOTTOMS', label: 'BOTTOMS', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=140&q=80' },
    { id: 'sweatshirts', name: 'SWEATSHIRTS', label: 'SWEATSHIRTS', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=140&q=80' },
    { id: 'jackets', name: 'JACKETS', label: 'JACKETS', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=140&q=80' },
    { id: 'footwear', name: 'FOOTWEAR', label: 'FOOTWEAR', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=140&q=80' },
    { id: 'accessories', name: 'ACCESSORIES', label: 'ACCESSORIES', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=140&q=80' },
  ],
  MEN: [
    { id: 'my-feed', name: 'ALL', label: 'MY FEED', isMyFeed: true },
    { id: 'jeans', name: 'JEANS', label: 'JEANS', image: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=140&q=80' },
    { id: 't-shirt', name: 'T-SHIRT', label: 'T-SHIRT', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=140&q=80' },
    { id: 'shirts', name: 'SHIRTS', label: 'SHIRTS', image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=140&q=80' },
    { id: 'ethnic-sets', name: 'ETHNIC SETS', label: 'ETHNIC SETS', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=140&q=80' },
    { id: 'trousers', name: 'TROUSERS', label: 'TROUSERS', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=140&q=80' },
    { id: 'sweatshirts', name: 'SWEATSHIRTS', label: 'SWEATSHIRTS', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=140&q=80' },
    { id: 'jackets', name: 'JACKETS', label: 'JACKETS', image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=140&q=80' },
    { id: 'footwear', name: 'FOOTWEAR', label: 'FOOTWEAR', image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=140&q=80' },
    { id: 'accessories', name: 'ACCESSORIES', label: 'ACCESSORIES', image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=140&q=80' },
  ],
  GIRLS: [
    { id: 'my-feed', name: 'ALL', label: 'MY FEED', isMyFeed: true },
    { id: 'twin-sets', name: 'TWIN SETS', label: 'TWIN SETS', image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=140&q=80' },
    { id: 'ethnic-wear', name: 'ETHNIC WEAR', label: 'ETHNIC WEAR', image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=140&q=80' },
    { id: 'frocks', name: 'FROCKS', label: 'FROCKS', image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=140&q=80' },
    { id: 'tops', name: 'TOPS', label: 'TOPS', image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=140&q=80' },
    { id: 'winterwear', name: 'WINTERWEAR', label: 'WINTERWEAR', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=140&q=80' },
    { id: 'bottom', name: 'BOTTOM', label: 'BOTTOM', image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=140&q=80' },
    { id: 'footwear', name: 'FOOTWEAR', label: 'FOOTWEAR', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=140&q=80' },
    { id: 'accessories', name: 'ACCESSORIES', label: 'ACCESSORIES', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=140&q=80' },
  ],
  BOYS: [
    { id: 'my-feed', name: 'ALL', label: 'MY FEED', isMyFeed: true },
    { id: 'shirts', name: 'SHIRTS', label: 'SHIRTS', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=140&q=80' },
    { id: 't-shirts', name: 'T-SHIRTS', label: 'T-SHIRTS', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=140&q=80' },
    { id: 'twin-sets', name: 'TWIN SETS', label: 'TWIN SETS', image: 'https://images.unsplash.com/photo-1550995694-3f5f4a7e1ed2?auto=format&fit=crop&w=140&q=80' },
    { id: 'ethnic-wear', name: 'ETHNIC WEAR', label: 'ETHNIC WEAR', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=140&q=80' },
    { id: 'winterwear', name: 'WINTERWEAR', label: 'WINTERWEAR', image: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=140&q=80' },
    { id: 'bottom', name: 'BOTTOM', label: 'BOTTOM', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=140&q=80' },
    { id: 'footwear', name: 'FOOTWEAR', label: 'FOOTWEAR', image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=140&q=80' },
    { id: 'accessories', name: 'ACCESSORIES', label: 'ACCESSORIES', image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=140&q=80' },
  ],
};

interface EditorialStory {
  id: string;
  gender: PrimaryGender;
  author: string;
  avatar: string;
  mainImage: string;
  subImages: [string, string, string];
  moreCount: number;
  title: string;
  link: string;
}

const LIMEROAD_STORIES: EditorialStory[] = [
  // ── WOMEN STORIES ──
  {
    id: 'story-w-1',
    gender: 'WOMEN',
    author: 'Ankita Manot',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    mainImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=85',
    subImages: [
      'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=300&q=80',
    ],
    moreCount: 27,
    title: 'Chevron Knit Vest & Wide Leg Trouser Look',
    link: '/products?category=women&subcategory=TOPS',
  },
  {
    id: 'story-w-2',
    gender: 'WOMEN',
    author: 'Ankita Manot',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    mainImage: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=85',
    subImages: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
    ],
    moreCount: 27,
    title: 'Yellow Ombre Silk Shirt & Pure Linen Pants',
    link: '/products?category=women&subcategory=CO%20ORD%20SETS',
  },
  {
    id: 'story-w-3',
    gender: 'WOMEN',
    author: 'Ankita Manot',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    mainImage: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=85',
    subImages: [
      'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=300&q=80',
    ],
    moreCount: 27,
    title: 'High-Rise Vintage Wide Leg Light Denim',
    link: '/products?category=women&subcategory=BOTTOMS',
  },
  {
    id: 'story-w-4',
    gender: 'WOMEN',
    author: 'Ankita Manot',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    mainImage: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=85',
    subImages: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=300&q=80',
    ],
    moreCount: 24,
    title: 'Crimson Velvet Evening Jumpsuit & Gold Clutch',
    link: '/products?category=women&subcategory=DRESSES',
  },

  // ── MEN STORIES ──
  {
    id: 'story-m-1',
    gender: 'MEN',
    author: 'A User',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    mainImage: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=600&q=85',
    subImages: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=300&q=80',
    ],
    moreCount: 14,
    title: 'Burgundy Utility Cargo Streetwear Edit',
    link: '/products?category=men&subcategory=JEANS',
  },
  {
    id: 'story-m-2',
    gender: 'MEN',
    author: 'A User',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
    mainImage: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=600&q=85',
    subImages: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=300&q=80',
    ],
    moreCount: 21,
    title: 'Straight Leg Japanese Indigo Denim Edit',
    link: '/products?category=men&subcategory=JEANS',
  },
  {
    id: 'story-m-3',
    gender: 'MEN',
    author: 'Trend Experts',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80',
    mainImage: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=85',
    subImages: [
      'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=300&q=80',
    ],
    moreCount: 17,
    title: 'Khaki Loose Cargo Pants & Chunky Streetwear',
    link: '/products?category=men&subcategory=JEANS',
  },
  {
    id: 'story-m-4',
    gender: 'MEN',
    author: 'Trend Experts',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80',
    mainImage: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=85',
    subImages: [
      'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=300&q=80',
    ],
    moreCount: 46,
    title: 'Classic Stonewash Denim Fit & Casual Streetwear',
    link: '/products?category=men&subcategory=JEANS',
  },

  // ── GIRLS STORIES ──
  {
    id: 'story-g-1',
    gender: 'GIRLS',
    author: 'Trend Experts',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    mainImage: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=85',
    subImages: [
      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
    ],
    moreCount: 18,
    title: 'Denim Dungaree Jumpsuit & Striped Tee Set',
    link: '/products?category=girls&subcategory=TWIN%20SETS',
  },
  {
    id: 'story-g-2',
    gender: 'GIRLS',
    author: 'A User',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
    mainImage: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=600&q=85',
    subImages: [
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80',
    ],
    moreCount: 11,
    title: 'Peppa Pig Pink Fleece Sweat-Set & Beanie',
    link: '/products?category=girls&subcategory=TWIN%20SETS',
  },
  {
    id: 'story-g-3',
    gender: 'GIRLS',
    author: 'Trend Experts',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80',
    mainImage: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=600&q=85',
    subImages: [
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=300&q=80',
    ],
    moreCount: 20,
    title: 'Sky Blue Floral Jacket Kurti Set & Trousers',
    link: '/products?category=girls&subcategory=ETHNIC%20WEAR',
  },
  {
    id: 'story-g-4',
    gender: 'GIRLS',
    author: 'Trend Experts',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80',
    mainImage: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=600&q=85',
    subImages: [
      'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=300&q=80',
    ],
    moreCount: 13,
    title: 'Lilac Purple Tracksuit Set & Chunky Sneakers',
    link: '/products?category=girls&subcategory=TWIN%20SETS',
  },

  // ── BOYS STORIES ──
  {
    id: 'story-b-1',
    gender: 'BOYS',
    author: 'Trend Experts',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    mainImage: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=85',
    subImages: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1589310243389-9685613133b5?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1550995694-3f5f4a7e1ed2?auto=format&fit=crop&w=300&q=80',
    ],
    moreCount: 19,
    title: 'Mint Green Checkered Over-Shirt & White Tee',
    link: '/products?category=boys&subcategory=SHIRTS',
  },
  {
    id: 'story-b-2',
    gender: 'BOYS',
    author: 'Trend Experts',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
    mainImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=85',
    subImages: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1598032895397-b9472444bf93?auto=format&fit=crop&w=300&q=80',
    ],
    moreCount: 13,
    title: 'Peach Fruit Printed Camp Collar Summer Shirt',
    link: '/products?category=boys&subcategory=SHIRTS',
  },
  {
    id: 'story-b-3',
    gender: 'BOYS',
    author: 'Trend Experts',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80',
    mainImage: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=85',
    subImages: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1589310243389-9685613133b5?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1550995694-3f5f4a7e1ed2?auto=format&fit=crop&w=300&q=80',
    ],
    moreCount: 16,
    title: 'Red & Black Flannel Checked Winter Plaid Shirt',
    link: '/products?category=boys&subcategory=SHIRTS',
  },
  {
    id: 'story-b-4',
    gender: 'BOYS',
    author: 'A User',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    mainImage: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=85',
    subImages: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=300&q=80',
    ],
    moreCount: 14,
    title: 'Cartoon Doodles Camp Shirt & Chino Shorts Look',
    link: '/products?category=boys&subcategory=SHIRTS',
  },
];

interface TrendingProduct {
  id: string;
  gender: PrimaryGender;
  brand: string;
  name: string;
  fitTag: string;
  rating: string;
  price: number;
  originalPrice: number;
  discount: string;
  image: string;
  link: string;
}

const BEWAKOOF_TRENDING_PRODUCTS: TrendingProduct[] = [
  // ── MEN TRENDING ──
  {
    id: 'tr-men-1',
    gender: 'MEN',
    brand: 'SIVORA®',
    name: "Men's Charcoal Grey Oversized Joggers",
    fitTag: 'OVERSIZED FIT',
    rating: '4.5',
    price: 999,
    originalPrice: 2499,
    discount: '60% OFF',
    image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=700&q=85',
    link: '/products?category=men&subcategory=JEANS',
  },
  {
    id: 'tr-men-2',
    gender: 'MEN',
    brand: 'SIVORA®',
    name: "Men's Jet Black Oversized Parachute Pants",
    fitTag: 'OVERSIZED FIT',
    rating: '4.5',
    price: 1145,
    originalPrice: 2199,
    discount: '47% OFF',
    image: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=700&q=85',
    link: '/products?category=men&subcategory=JEANS',
  },
  {
    id: 'tr-men-3',
    gender: 'MEN',
    brand: 'SIVORA®',
    name: "Men's Brown & Black Checked Overshirt",
    fitTag: 'RELAXED FIT',
    rating: '4.5',
    price: 1248,
    originalPrice: 2789,
    discount: '55% OFF',
    image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=700&q=85',
    link: '/products?category=men&subcategory=SHIRTS',
  },
  {
    id: 'tr-men-4',
    gender: 'MEN',
    brand: 'SIVORA®',
    name: "Men's Brown Oversized Graphic T-Shirt",
    fitTag: 'OVERSIZED FIT',
    rating: '4.4',
    price: 629,
    originalPrice: 999,
    discount: '37% OFF',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=700&q=85',
    link: '/products?category=men&subcategory=T-SHIRT',
  },
  {
    id: 'tr-men-5',
    gender: 'MEN',
    brand: 'SIVORA Heavy Duty® 1.0',
    name: "Men's Beige Super Loose Fit Brushed Cargos",
    fitTag: 'SUPER LOOSE FIT',
    rating: '4.4',
    price: 999,
    originalPrice: 2399,
    discount: '58% OFF',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=700&q=85',
    link: '/products?category=men&subcategory=JEANS',
  },

  // ── WOMEN TRENDING ──
  {
    id: 'tr-women-1',
    gender: 'WOMEN',
    brand: 'SIVORA®',
    name: "Women's Boyfriend Fit Oversized Graphic Tee",
    fitTag: 'OVERSIZED FIT',
    rating: '4.6',
    price: 699,
    originalPrice: 1499,
    discount: '53% OFF',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=700&q=85',
    link: '/products?category=women&subcategory=TOPS',
  },
  {
    id: 'tr-women-2',
    gender: 'WOMEN',
    brand: 'SIVORA®',
    name: "Women's Cropped Ribbed Knit Streetwear Top",
    fitTag: 'SLIM FIT',
    rating: '4.5',
    price: 599,
    originalPrice: 1199,
    discount: '50% OFF',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=85',
    link: '/products?category=women&subcategory=TOPS',
  },
  {
    id: 'tr-women-3',
    gender: 'WOMEN',
    brand: 'SIVORA Heavy Duty®',
    name: "Women's Wide Leg Vintage High-Rise Cargos",
    fitTag: 'RELAXED FIT',
    rating: '4.7',
    price: 1299,
    originalPrice: 2499,
    discount: '48% OFF',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=85',
    link: '/products?category=women&subcategory=BOTTOMS',
  },
  {
    id: 'tr-women-4',
    gender: 'WOMEN',
    brand: 'SIVORA Couture®',
    name: "Women's Crimson Bridal Resham Embroidered Choli",
    fitTag: 'COUTURE FIT',
    rating: '4.9',
    price: 4999,
    originalPrice: 8999,
    discount: '44% OFF',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=700&q=85',
    link: '/products?category=women&subcategory=ETHNIC%20SETS',
  },
  {
    id: 'tr-women-5',
    gender: 'WOMEN',
    brand: 'SIVORA Atelier®',
    name: "Women's Banarasi Kadhwa Zari Silk Saree",
    fitTag: 'HEIRLOOM DRAPE',
    rating: '4.8',
    price: 3499,
    originalPrice: 5999,
    discount: '42% OFF',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=85',
    link: '/products?category=women&subcategory=SAREES',
  },

  // ── GIRLS TRENDING ──
  {
    id: 'tr-girls-1',
    gender: 'GIRLS',
    brand: 'SIVORA Little Royals®',
    name: "Girls' Pastel Fleece Sweatshirt & Joggers Set",
    fitTag: 'COZY FIT',
    rating: '4.7',
    price: 999,
    originalPrice: 1999,
    discount: '50% OFF',
    image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=700&q=85',
    link: '/products?category=girls&subcategory=TWIN%20SETS',
  },
  {
    id: 'tr-girls-2',
    gender: 'GIRLS',
    brand: 'SIVORA Festive®',
    name: "Girls' Fairytale Lilac Silk Lehenga Choli",
    fitTag: 'FESTIVE FIT',
    rating: '4.9',
    price: 2499,
    originalPrice: 4499,
    discount: '44% OFF',
    image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=700&q=85',
    link: '/products?category=girls&subcategory=ETHNIC%20WEAR',
  },
  {
    id: 'tr-girls-3',
    gender: 'GIRLS',
    brand: 'SIVORA Kids®',
    name: "Girls' Layered Tulle Birthday Party Frock",
    fitTag: 'PARTY FIT',
    rating: '4.8',
    price: 1499,
    originalPrice: 2999,
    discount: '50% OFF',
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=700&q=85',
    link: '/products?category=girls&subcategory=FROCKS',
  },
  {
    id: 'tr-girls-4',
    gender: 'GIRLS',
    brand: 'SIVORA Denim®',
    name: "Girls' Embroidered Butterfly Stretch Jeans",
    fitTag: 'RELAXED FIT',
    rating: '4.6',
    price: 999,
    originalPrice: 1799,
    discount: '44% OFF',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=85',
    link: '/products?category=girls&subcategory=BOTTOM',
  },
  {
    id: 'tr-girls-5',
    gender: 'GIRLS',
    brand: 'SIVORA Warmth®',
    name: "Girls' Faux Fur Hooded Warm Winter Parka",
    fitTag: 'WINTER FIT',
    rating: '4.8',
    price: 1999,
    originalPrice: 3499,
    discount: '43% OFF',
    image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=700&q=85',
    link: '/products?category=girls&subcategory=WINTERWEAR',
  },

  // ── BOYS TRENDING ──
  {
    id: 'tr-boys-1',
    gender: 'BOYS',
    brand: 'SIVORA Junior®',
    name: "Boys' Tropical Hawaiian Camp Collar Shirt",
    fitTag: 'RESORT FIT',
    rating: '4.6',
    price: 799,
    originalPrice: 1499,
    discount: '47% OFF',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=85',
    link: '/products?category=boys&subcategory=SHIRTS',
  },
  {
    id: 'tr-boys-2',
    gender: 'BOYS',
    brand: 'SIVORA Street®',
    name: "Boys' T-Rex Embossed 100% Cotton Graphic Tee",
    fitTag: 'REGULAR FIT',
    rating: '4.7',
    price: 499,
    originalPrice: 999,
    discount: '50% OFF',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=700&q=85',
    link: '/products?category=boys&subcategory=T-SHIRTS',
  },
  {
    id: 'tr-boys-3',
    gender: 'BOYS',
    brand: 'SIVORA Heritage®',
    name: "Boys' Royal Navy Brocade Silk Sherwani Set",
    fitTag: 'ROYAL FIT',
    rating: '4.9',
    price: 2499,
    originalPrice: 4999,
    discount: '50% OFF',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=85',
    link: '/products?category=boys&subcategory=ETHNIC%20WEAR',
  },
  {
    id: 'tr-boys-4',
    gender: 'BOYS',
    brand: 'SIVORA Utility®',
    name: "Boys' Multi-Pocket Heavy Cotton Cargo Pants",
    fitTag: 'CARGO FIT',
    rating: '4.7',
    price: 899,
    originalPrice: 1699,
    discount: '47% OFF',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=700&q=85',
    link: '/products?category=boys&subcategory=BOTTOM',
  },
  {
    id: 'tr-boys-5',
    gender: 'BOYS',
    brand: 'SIVORA Sport®',
    name: "Boys' High-Top Retro Basketball Court Sneakers",
    fitTag: 'STREET FIT',
    rating: '4.8',
    price: 1499,
    originalPrice: 2799,
    discount: '46% OFF',
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=700&q=85',
    link: '/products?category=boys&subcategory=FOOTWEAR',
  },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const { isAuthenticated, user } = useAuthStore();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Limeroad Primary Categories: WOMEN, MEN, GIRLS, BOYS
  const [selectedGender, setSelectedGender] = useState<PrimaryGender>('WOMEN');
  const [activeSubcategory, setActiveSubcategory] = useState<string>('my-feed');
  const [addedAlert, setAddedAlert] = useState<string | null>(null);
  const trendingSliderRef = useRef<HTMLDivElement>(null);
  const subcatScrollRef = useRef<HTMLDivElement>(null);
  const productsSectionRef = useRef<HTMLDivElement>(null);

  // Subcategories for active gender
  const currentSubcategories = useMemo(() => {
    return LIMEROAD_SUBCATEGORIES[selectedGender] || [];
  }, [selectedGender]);

  // Selected subcategory object
  const activeSubcat = useMemo(() => {
    return currentSubcategories.find((s) => s.id === activeSubcategory);
  }, [currentSubcategories, activeSubcategory]);

  const subcategoryParam = useMemo(() => {
    if (!activeSubcat || activeSubcat.isMyFeed || activeSubcat.name === 'ALL') {
      return undefined;
    }
    return activeSubcat.name;
  }, [activeSubcat]);

  // Live Query for the selected subcategory's 10 items
  const { data: subcatData, isLoading: isSubcatLoading } = useProductsQuery({
    category: selectedGender.toLowerCase(),
    subcategory: subcategoryParam,
    size: 50,
  });

  // Reset active subcategory when gender tab switches
  useEffect(() => {
    setActiveSubcategory('my-feed');
    if (subcatScrollRef.current) {
      subcatScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [selectedGender]);

  // Filtered Stories
  const displayedStories = useMemo(() => {
    return LIMEROAD_STORIES.filter((s) => s.gender === selectedGender);
  }, [selectedGender]);

  // Filtered Trending Products for active gender
  const displayedTrending = useMemo(() => {
    return BEWAKOOF_TRENDING_PRODUCTS.filter((p) => p.gender === selectedGender);
  }, [selectedGender]);

  const handlePrevTrending = () => {
    if (trendingSliderRef.current) {
      trendingSliderRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const handleNextTrending = () => {
    if (trendingSliderRef.current) {
      trendingSliderRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const handleSubcategoryClick = (sub: SubcategoryPill) => {
    setActiveSubcategory(sub.id);
    if (!sub.isMyFeed && sub.name !== 'ALL') {
      setTimeout(() => {
        if (productsSectionRef.current) {
          productsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 80);
    }
  };

  const { isDark } = useTheme();

  return (
    <div
      className="min-h-screen flex flex-col text-[#402d08] dark:text-[#fdf5e2] selection:bg-[#dfba55]/30 selection:text-[#382603] relative overflow-x-hidden font-sans transition-colors duration-300"
      style={{
        background: isDark
          ? 'radial-gradient(circle at 50% 15%, #181c26 0%, #10131c 45%, #0a0c12 100%)'
          : 'radial-gradient(circle at 50% 15%, #fcf7ea 0%, #f7eacc 35%, #eed7a1 70%, #e2c583 100%)',
      }}
    >
      {/* ── Background Geometric Diamond Lattice Overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.08] dark:opacity-[0.03]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(45deg, #7c5a08 0px, #7c5a08 1px, transparent 1px, transparent 32px),
            repeating-linear-gradient(-45deg, #7c5a08 0px, #7c5a08 1px, transparent 1px, transparent 32px)
          `,
        }}
      />

      {/* ═══════════════════════════════════════════════════════════
          1. TOP NAVIGATION BAR (Exact Match to Screenshot)
          Left: WOMEN, MEN, GIRLS, BOYS | Center: SIVORA Logo | Right: Icons
         ═══════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 border-b border-[#caa353]/40 dark:border-[#caa353]/30 bg-white/85 dark:bg-[#12141c]/90 backdrop-blur-md shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left Category Links: Strictly WOMEN, MEN, GIRLS, BOYS */}
          <nav className="hidden lg:flex items-center gap-6 text-[12px] font-black tracking-[0.16em] uppercase text-[#473309] dark:text-[#eedba2]">
            <Link
              to="/products"
              className="hover:text-[#91660d] dark:hover:text-[#caa14d] transition-colors py-1"
            >
              ALL
            </Link>
            {(['WOMEN', 'MEN', 'GIRLS', 'BOYS'] as const).map((gender) => (
              <button
                key={gender}
                type="button"
                onClick={() => {
                  setSelectedGender(gender);
                }}
                className={`hover:text-[#91660d] dark:hover:text-[#caa14d] transition-colors uppercase font-bold cursor-pointer ${
                  selectedGender === gender ? 'text-[#91660d] dark:text-[#caa14d] font-black border-b-2 border-[#91660d] dark:border-[#caa14d]' : ''
                }`}
              >
                {gender}
              </button>
            ))}
          </nav>

          {/* Center: SIVORA Luxury Brand Mark */}
          <div className="flex-1 lg:flex-initial flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1.5 text-[#a1781c]">
              <span className="text-[10px]">✦</span>
            </div>
            <Link to="/" className="group inline-block">
              <h1
                className="text-2xl sm:text-3xl md:text-[34px] font-black tracking-[0.28em] uppercase leading-none select-none"
                style={{
                  background:
                    'linear-gradient(135deg, #513702 0%, #875c08 28%, #d8aa32 50%, #875c08 75%, #513702 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 1px 2px rgba(100,70,5,0.25))',
                }}
              >
                SIVORA
              </h1>
            </Link>
            <span className="text-[9px] font-semibold tracking-[0.38em] text-[#6d4f13] dark:text-[#caa14d] uppercase mt-0.5">
              LUXE FASHION &amp; LIFESTYLE
            </span>
          </div>

          {/* Right Action Icons: Search + ThemeToggle + Wishlist + Cart + Login */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <form
              onSubmit={handleSearchSubmit}
              className="relative hidden sm:block w-44 md:w-56"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search t-shirts, sarees, jeans..."
                className="w-full pl-3.5 pr-8 py-1.5 text-xs bg-white/90 dark:bg-[#1a1e2b] border border-[#c49f4f]/60 dark:border-[#caa14d]/40 rounded-full text-[#422e06] dark:text-[#f8edd1] placeholder:text-[#8a6c2c]/70 dark:placeholder:text-[#a88a4e]/70 focus:outline-none focus:ring-1 focus:ring-[#9e7416] transition-all"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a6c2c] dark:text-[#caa14d] hover:text-[#4a3406] dark:hover:text-amber-200 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* ☀️/🌙 Dark & Light Mode Toggle */}
            <ThemeToggle />

            <Link
              to="/wishlist"
              className="p-1.5 text-[#5e430d] dark:text-[#eedba2] hover:text-[#9e7416] dark:hover:text-[#caa14d] transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5 stroke-[1.8]" />
            </Link>

            <Link
              to="/cart"
              className="relative p-1.5 text-[#5e430d] dark:text-[#eedba2] hover:text-[#9e7416] dark:hover:text-[#caa14d] transition-colors"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-[#523908] dark:bg-amber-400 text-[9px] font-bold text-amber-100 dark:text-slate-950 shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <Link
                to={user?.role === 'admin' ? '/admin' : '/profile'}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-[#503706] dark:bg-[#1c202e] text-amber-100 border border-[#3b2803] dark:border-[#caa14d]/50 hover:brightness-105 shadow-sm transition-all"
              >
                {user?.role === 'admin' ? 'ADMIN' : user?.username || 'ACCOUNT'}
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-[#ebd08c] via-[#dfbe6e] to-[#caa44a] text-[#3a2703] border border-[#9d741a]/40 hover:brightness-105 shadow-sm transition-all"
              >
                LOGIN
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Sub-header Benefit Badges ── */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-8 pt-3 flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f8efd8]/90 border border-[#caa559]/50 text-[11px] font-semibold text-[#5a3f0b] shadow-sm">
          <Truck className="w-3.5 h-3.5 text-[#91660d]" />
          <span>Free Express White-Glove Delivery India-Wide</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f8efd8]/90 border border-[#caa559]/50 text-[11px] font-semibold text-[#5a3f0b] shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#c4961f]" />
          <span>360+ Handcrafted Designs (10 Pieces per Subcategory)</span>
        </div>
      </div>

      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-4 flex flex-col items-center">
        {/* ═══════════════════════════════════════════════════════════
            2. LIMEROAD TOP TABS: WOMEN | MEN | GIRLS | BOYS
           ═══════════════════════════════════════════════════════════ */}
        <div className="w-full flex items-center justify-center border-b border-[#caa559]/40 mb-4 pb-1">
          <div className="flex items-center gap-6 sm:gap-10">
            {(['WOMEN', 'MEN', 'GIRLS', 'BOYS'] as const).map((gender) => {
              const isActive = selectedGender === gender;
              return (
                <button
                  key={gender}
                  type="button"
                  onClick={() => setSelectedGender(gender)}
                  className={`pb-2 text-xs sm:text-sm font-black tracking-[0.2em] uppercase transition-all cursor-pointer relative ${
                    isActive
                      ? 'text-[#2e7d32] border-b-[3px] border-[#2e7d32]'
                      : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  {gender}
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            3. LIMEROAD CIRCULAR SUBCATEGORIES STRIP (Exact Match)
            e.g. MY FEED, SAREES, ETHNIC SETS, DRESSES, KURTAS...
           ═══════════════════════════════════════════════════════════ */}
        <div className="w-full mb-6 bg-white/90 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-[#caa559]/50 shadow-sm">
          <div
            ref={subcatScrollRef}
            className="flex items-center gap-5 sm:gap-7 overflow-x-auto py-2 px-2 scrollbar-none scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {currentSubcategories.map((sub) => {
              const isSelected = activeSubcategory === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => handleSubcategoryClick(sub)}
                  className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer focus:outline-none"
                >
                  {/* Circular Avatar / Icon Container */}
                  <div
                    className={`relative w-16 h-16 min-w-16 min-h-16 sm:w-20 sm:h-20 sm:min-w-20 sm:min-h-20 rounded-full shrink-0 aspect-square overflow-hidden flex items-center justify-center p-0.5 transition-all duration-200 ${
                      isSelected
                        ? 'ring-2 sm:ring-[2.5px] ring-[#388e3c] scale-105 shadow-md bg-white'
                        : 'border border-neutral-300 group-hover:border-neutral-500 bg-neutral-100'
                    }`}
                  >
                    {sub.isMyFeed ? (
                      <div className="w-full h-full rounded-full bg-[#f1f8e9] border border-[#aed581] flex items-center justify-center">
                        <span className="text-[#33691e] font-black text-xs sm:text-sm tracking-tight">
                          MY
                        </span>
                      </div>
                    ) : (
                      <img
                        src={sub.image}
                        alt={sub.label}
                        className="w-full h-full rounded-full aspect-square object-cover object-center group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    )}
                  </div>

                  {/* Subcategory Label */}
                  <span
                    className={`text-[10px] sm:text-[11px] font-extrabold uppercase tracking-tight text-center whitespace-nowrap transition-colors ${
                      isSelected
                        ? 'text-[#2e7d32] font-black'
                        : 'text-neutral-700 group-hover:text-black'
                    }`}
                  >
                    {sub.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            DYNAMIC SUBCATEGORY PRODUCTS DISPLAY (Inline on Landing Page)
            Loaded directly underneath the circular subcategories strip!
           ═══════════════════════════════════════════════════════════ */}
        {activeSubcat && !activeSubcat.isMyFeed && (
          <section ref={productsSectionRef} className="w-full mb-8 scroll-mt-24 transition-all duration-300">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-[#caa559]/60 p-4 sm:p-6 shadow-sm">
              {/* Subcategory Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-[#388e3c] shrink-0 aspect-square shadow-xs">
                    <img
                      src={activeSubcat.image}
                      alt={activeSubcat.label}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-[#e8f5e9] text-[#2e7d32]">
                        {selectedGender} › {activeSubcat.label}
                      </span>
                      <span className="text-xs text-neutral-500 font-bold">
                        ({subcatData?.items?.length || 0} Pieces Available)
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mt-0.5 uppercase">
                      {activeSubcat.label} Collection
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSubcategory('my-feed')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    ✕ Back to Feed
                  </button>
                  <Link
                    to={`/products?category=${selectedGender.toLowerCase()}&subcategory=${encodeURIComponent(activeSubcat.name)}`}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#91660d] hover:bg-[#7a5509] text-white transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <span>Full Shop View</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Loading Skeleton */}
              {isSubcatLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 pt-6">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="animate-pulse bg-neutral-100 rounded-xl h-72 border border-neutral-200" />
                  ))}
                </div>
              ) : subcatData?.items && subcatData.items.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 pt-6">
                  {subcatData.items.map((prod) => {
                    const isFavorited = isInWishlist(prod.id);
                    const discountPct = prod.original_price
                      ? Math.round(((prod.original_price - prod.price) / prod.original_price) * 100)
                      : 0;

                    return (
                      <div
                        key={prod.id}
                        className="group/item bg-white rounded-xl border border-neutral-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                      >
                        {/* Product Image & Badges */}
                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
                          <Link to={`/products/${prod.id}`}>
                            <img
                              src={prod.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80'}
                              alt={prod.name}
                              className="w-full h-full object-cover object-top group-hover/item:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          </Link>
                          {discountPct > 0 && (
                            <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-rose-600 text-white font-black text-[10px] tracking-wide shadow-xs">
                              {discountPct}% OFF
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleWishlist(prod);
                            }}
                            className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                              isFavorited
                                ? 'bg-rose-50 text-rose-600 shadow-sm'
                                : 'bg-white/80 hover:bg-white text-neutral-600 hover:text-rose-600'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-rose-600' : ''}`} />
                          </button>
                        </div>

                        {/* Details */}
                        <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#91660d] line-clamp-1">
                              {prod.subcategory || selectedGender}
                            </span>
                            <Link to={`/products/${prod.id}`} className="block">
                              <h4 className="text-xs sm:text-sm font-bold text-neutral-900 line-clamp-1 hover:text-[#91660d] transition-colors mt-0.5">
                                {prod.name}
                              </h4>
                            </Link>
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="flex items-center text-amber-500 text-[11px] font-bold">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span className="ml-0.5">{prod.rating || '4.5'}</span>
                              </div>
                              <span className="text-[10px] text-neutral-400">({prod.reviews_count || 42})</span>
                            </div>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-neutral-100">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-sm sm:text-base font-black text-neutral-900">
                                ₹{Number(prod.price).toLocaleString('en-IN')}
                              </span>
                              {prod.original_price && prod.original_price > prod.price && (
                                <span className="text-[11px] text-neutral-400 line-through">
                                  ₹{Number(prod.original_price).toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>

                            {user?.role === 'admin' ? (
                              <Link
                                to={`/admin?tab=products&search=${encodeURIComponent(prod.name)}`}
                                className="w-full mt-2 py-1.5 rounded-lg bg-[#503706] hover:bg-[#382604] text-amber-200 text-[11px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 border border-[#caa353]/50 shadow-xs cursor-pointer"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                                <span>Manage in Admin</span>
                              </Link>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  addItem(prod, 1);
                                  setAddedAlert(prod.name);
                                  setTimeout(() => setAddedAlert(null), 2500);
                                }}
                                className="w-full mt-2 py-1.5 rounded-lg bg-neutral-900 hover:bg-[#91660d] text-white text-[11px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                              >
                                <ShoppingBag className="w-3 h-3" />
                                <span>Add to Bag</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-neutral-500">
                  <p className="text-sm font-medium">No products found for {activeSubcat.label}.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════
            4. CAMPAIGN FESTIVE BANNER (Matching Screenshot Durga Pujo/Streetwear)
           ═══════════════════════════════════════════════════════════ */}
        <div
          onClick={() => navigate(`/products?category=${selectedGender.toLowerCase()}`)}
          className="w-full relative overflow-hidden rounded-2xl mb-8 border border-[#caa559]/50 shadow-md cursor-pointer group"
          style={{ minHeight: '190px' }}
        >
          <img
            src={
              selectedGender === 'WOMEN'
                ? 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1400&q=85'
                : selectedGender === 'MEN'
                ? 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1400&q=85'
                : selectedGender === 'GIRLS'
                ? 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1400&q=85'
                : 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1400&q=85'
            }
            alt="Festival Banner"
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

          <div className="relative z-10 p-6 sm:p-10 flex flex-col justify-center h-full max-w-xl text-white space-y-2">
            <span className="px-3 py-1 rounded-full bg-[#ffd800] text-black text-[10px] font-black tracking-widest uppercase w-fit">
              FESTIVAL OF DEALS 2026
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white drop-shadow-md">
              {selectedGender === 'WOMEN' && 'DURGA PUJO & DIWALI EDIT'}
              {selectedGender === 'MEN' && 'STREETWEAR & DENIM DROPS'}
              {selectedGender === 'GIRLS' && 'FAIRYTALE PRINCESS CELEBRATION'}
              {selectedGender === 'BOYS' && 'SMART CASUALS & SHIRT EDIT'}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-200 font-medium">
              Explore 10 authentic handpicked designs per subcategory with exclusive deals.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-black text-xs font-black uppercase tracking-wider group-hover:bg-[#ffd800] transition-colors shadow-sm">
                <span>View Collection</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            5. LIMEROAD EXCLUSIVE STORY CARDS GRID (Exact 4 Screenshots Match)
            Header: By Author | Main Left Photo + 3 Side Photos (+27) | Footer
           ═══════════════════════════════════════════════════════════ */}
        <section className="w-full mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-black uppercase tracking-[0.16em] text-[#3e2b04]">
              {selectedGender} EXCLUSIVE STORIES
            </h3>
            <button
              onClick={() => navigate(`/products?category=${selectedGender.toLowerCase()}`)}
              className="text-xs font-extrabold text-[#2e7d32] hover:underline uppercase tracking-wider cursor-pointer"
            >
              See All Stories →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayedStories.map((story) => (
              <div
                key={story.id}
                onClick={() => navigate(story.link)}
                className="bg-white rounded-2xl border border-neutral-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col group/story"
              >
                {/* Author Header */}
                <div className="p-3 flex items-center gap-2 border-b border-neutral-100">
                  <img
                    src={story.avatar}
                    alt={story.author}
                    className="w-7 h-7 rounded-full object-cover border border-neutral-200"
                  />
                  <div className="text-xs font-bold text-neutral-800">
                    <span className="text-neutral-400 font-normal text-[11px]">By </span>
                    <span>{story.author}</span>
                  </div>
                </div>

                {/* Scrapbook Visual: Left Big Photo + Right 3 Thumbnails */}
                <div className="flex p-2 gap-1.5 bg-neutral-50 h-80">
                  {/* Left Big Hero Image (65% width) */}
                  <div className="w-[66%] h-full rounded-xl overflow-hidden relative bg-neutral-200">
                    <img
                      src={story.mainImage}
                      alt={story.title}
                      className="w-full h-full object-cover object-top group-hover/story:scale-104 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  {/* Right 3 Stacked Thumbnails (34% width) */}
                  <div className="w-[34%] h-full flex flex-col gap-1.5">
                    <div className="flex-1 rounded-lg overflow-hidden bg-neutral-200">
                      <img
                        src={story.subImages[0]}
                        alt="Sub Item 1"
                        className="w-full h-full object-cover object-top"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 rounded-lg overflow-hidden bg-neutral-200">
                      <img
                        src={story.subImages[1]}
                        alt="Sub Item 2"
                        className="w-full h-full object-cover object-top"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 rounded-lg overflow-hidden bg-neutral-200 relative">
                      <img
                        src={story.subImages[2]}
                        alt="Sub Item 3"
                        className="w-full h-full object-cover object-top brightness-75"
                        loading="lazy"
                      />
                      {/* Plus Count Badge Overlay (e.g. +27, +14, +18) */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-black text-sm tracking-tight">
                        +{story.moreCount}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer: Exclusive Story Tag + Heart & Share Icons */}
                <div className="p-3 border-t border-neutral-100 flex items-center justify-between mt-auto">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-800">
                    SIVORA EXCLUSIVE STORY
                  </span>
                  <div className="flex items-center gap-2 text-neutral-500">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist({
                          id: story.id,
                          name: story.title,
                          price: 999,
                          image_url: story.mainImage,
                        } as any);
                      }}
                      className="p-1 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Wishlist Story"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(window.location.origin + story.link);
                        alert('Story link copied to clipboard!');
                      }}
                      className="p-1 hover:text-black transition-colors cursor-pointer"
                      title="Share Story"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            6. BEWAKOOF 5-PRODUCT SLIDER ROW (100% Retained from previous turn)
           ═══════════════════════════════════════════════════════════ */}
        <section className="relative w-full mt-4 mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black tracking-[0.16em] text-neutral-900 uppercase">
                TRENDING IN {selectedGender}
              </h3>
              <p className="text-xs font-semibold tracking-wider uppercase text-[#7a5814]">
                Top Picks · 10 Pieces per Subcategory · Exclusive Deals
              </p>
            </div>
            <button
              onClick={() => navigate(`/products?category=${selectedGender.toLowerCase()}`)}
              className="text-xs font-extrabold text-[#2e7d32] hover:underline uppercase tracking-wider cursor-pointer"
            >
              Explore All {selectedGender} →
            </button>
          </div>

          <div className="relative group/trending">
            <button
              type="button"
              onClick={handlePrevTrending}
              aria-label="Previous trending products"
              className="absolute -left-2 sm:-left-4 top-[40%] -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 hover:bg-white text-neutral-800 shadow-[0_4px_18px_rgba(0,0,0,0.22)] hover:shadow-xl border border-neutral-200 flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5 font-bold" />
            </button>

            <button
              type="button"
              onClick={handleNextTrending}
              aria-label="Next trending products"
              className="absolute -right-2 sm:-right-4 top-[40%] -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 hover:bg-white text-neutral-800 shadow-[0_4px_18px_rgba(0,0,0,0.22)] hover:shadow-xl border border-neutral-200 flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95"
            >
              <ChevronRight className="w-5 h-5 font-bold" />
            </button>

            <div
              ref={trendingSliderRef}
              className="flex gap-3.5 sm:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 px-1 scrollbar-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {displayedTrending.map((item) => {
                const isFavorited = isInWishlist(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(item.link)}
                    className="w-[75%] sm:w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] lg:w-[calc(20%-13px)] shrink-0 snap-start bg-white rounded-2xl border border-neutral-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col group/prod"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover object-top group-hover/prod:scale-105 transition-transform duration-500 ease-out"
                        loading="lazy"
                      />

                      {item.fitTag && (
                        <div className="absolute top-2.5 left-2.5 z-10">
                          <span className="px-2 py-0.5 rounded-sm bg-white/95 backdrop-blur-xs text-[10px] font-black uppercase tracking-wider text-neutral-800 shadow-xs">
                            {item.fitTag}
                          </span>
                        </div>
                      )}

                      <div className="absolute bottom-2.5 left-2.5 z-10">
                        <span className="px-2 py-0.5 rounded-sm bg-white/95 backdrop-blur-xs text-[11px] font-bold text-neutral-900 shadow-xs flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{item.rating}</span>
                        </span>
                      </div>
                    </div>

                    <div className="p-3 flex flex-col justify-between flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-[12px] sm:text-[13px] text-neutral-900 tracking-tight truncate">
                          {item.brand}
                        </h4>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist({
                              id: item.id,
                              name: item.name,
                              price: item.price,
                              image_url: item.image,
                            } as any);
                          }}
                          aria-label="Add to wishlist"
                          className="p-1 text-neutral-400 hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          <Heart
                            className={`w-4 h-4 transition-all ${
                              isFavorited
                                ? 'fill-rose-500 text-rose-500 scale-110'
                                : 'hover:scale-110'
                            }`}
                          />
                        </button>
                      </div>

                      <p className="text-[11px] sm:text-xs text-neutral-500 font-medium truncate mt-0.5" title={item.name}>
                        {item.name}
                      </p>

                      <div className="flex items-baseline mt-2 gap-1.5 flex-wrap">
                        <span className="font-black text-sm sm:text-base text-neutral-900">
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-neutral-400 line-through font-normal">
                          ₹{item.originalPrice.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs font-black text-emerald-600">
                          {item.discount}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => navigate(`/products?category=${selectedGender.toLowerCase()}`)}
              className="text-xs sm:text-sm font-extrabold text-neutral-800 hover:text-black underline underline-offset-4 decoration-2 decoration-neutral-400 hover:decoration-black cursor-pointer transition-all tracking-wider"
            >
              Explore All {selectedGender} Drops
            </button>
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════════════════════════
          7. BOTTOM ASSURANCE STRIP
         ═══════════════════════════════════════════════════════════ */}
      <footer className="relative z-10 w-full mt-6 py-3.5 bg-[#f5e9ce]/90 border-t border-[#cda758]/50 text-center">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-around gap-4 text-[11px] sm:text-xs font-bold tracking-[0.18em] uppercase text-[#473307]">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-[#8b630e]" />
            <span>LUXURY QUALITY ASSURED</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#8b630e]" />
            <span>FAST PAN-INDIA DELIVERY</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#8b630e]" />
            <span>EASY 7-DAY RETURNS</span>
          </div>
        </div>
      </footer>

      {/* ── Add to Bag Floating Toast ── */}
      {addedAlert && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-[#caa559]/50 animate-bounce">
          <ShoppingBag className="w-5 h-5 text-[#ffd800]" />
          <div>
            <p className="text-xs font-bold text-white">Added to Cart!</p>
            <p className="text-[11px] text-neutral-300 max-w-[200px] truncate">{addedAlert}</p>
          </div>
          <Link
            to="/cart"
            className="ml-2 px-3 py-1 rounded-lg bg-[#ffd800] text-black text-[11px] font-black uppercase hover:bg-white transition-colors"
          >
            View Bag
          </Link>
        </div>
      )}
    </div>
  );
};

export default LandingPage;

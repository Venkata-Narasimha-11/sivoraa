import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ChevronRight,
  ArrowUpDown,
  ShoppingBag,
  Tag,
} from 'lucide-react';
import { useProductsQuery, useCategoriesQuery } from '../hooks/useProducts';
import { useDebounce } from '../hooks/useDebounce';
import useCartStore from '../stores/useCartStore';
import ProductGrid from '../components/product/ProductGrid';
import ErrorMessage from '../components/common/ErrorMessage';

// Curated Category metadata for high-end presentation
const CATEGORY_META: Record<
  string,
  { title: string; subtitle: string; bannerTag: string }
> = {
  women: {
    title: "WOMEN'S ATELIER & COUTURE",
    subtitle:
      'Handcrafted Banarasi sarees, ethnic sets, evening gowns, chikankari kurtas, designer crop tops, and co-ord sets.',
    bannerTag: 'Women Collection · 110 Designs (10 each)',
  },
  men: {
    title: "MEN'S SARTORIAL & STREETWEAR",
    subtitle:
      'Heavyweight oversized tees, French linen shirts, Japanese denim jeans, tailored trousers, and royal sherwanis.',
    bannerTag: 'Men Collection · 90 Designs (10 each)',
  },
  girls: {
    title: 'GIRLS CHIC & CELEBRATION',
    subtitle:
      'Chic twin sets, fairytale lehengas, party frocks, ruffle tops, warm winterwear, and glitter footwear.',
    bannerTag: 'Girls Collection · 80 Designs (10 each)',
  },
  boys: {
    title: 'BOYS SMART CASUALS & ETHNIC',
    subtitle:
      'Printed resort shirts, graphic tees, twin sets, royal sherwanis, utility cargo pants, and retro sneakers.',
    bannerTag: 'Boys Collection · 80 Designs (10 each)',
  },
  // Backward compatibility aliases
  'ethnic-couture': {
    title: "WOMEN'S ATELIER & COUTURE",
    subtitle: 'Handcrafted Banarasi sarees, ethnic sets, gowns, and designer tops.',
    bannerTag: 'Women Collection · 110 Designs',
  },
  'western-luxe': {
    title: "MEN'S SARTORIAL & STREETWEAR",
    subtitle: 'Heavyweight oversized tees, linen shirts, denim jeans, and sherwanis.',
    bannerTag: 'Men Collection · 90 Designs',
  },
  'boys-kids-wear': {
    title: 'ROYAL KIDS COLLECTION',
    subtitle: 'Celebration wear and smart casuals for boys and girls.',
    bannerTag: 'Kids Collection · 160 Designs',
  },
};

const SUBCATEGORIES_BY_CATEGORY: Record<string, string[]> = {
  men: ['ALL', 'JEANS', 'T-SHIRT', 'SHIRTS', 'ETHNIC SETS', 'TROUSERS', 'SWEATSHIRTS', 'JACKETS', 'FOOTWEAR', 'ACCESSORIES'],
  women: ['ALL', 'SAREES', 'ETHNIC SETS', 'DRESSES', 'KURTAS', 'TOPS', 'CO ORD SETS', 'BOTTOMS', 'SWEATSHIRTS', 'JACKETS', 'FOOTWEAR', 'ACCESSORIES'],
  girls: ['ALL', 'TWIN SETS', 'ETHNIC WEAR', 'FROCKS', 'TOPS', 'WINTERWEAR', 'BOTTOM', 'FOOTWEAR', 'ACCESSORIES'],
  boys: ['ALL', 'SHIRTS', 'T-SHIRTS', 'TWIN SETS', 'ETHNIC WEAR', 'WINTERWEAR', 'BOTTOM', 'FOOTWEAR', 'ACCESSORIES'],
};

export const ProductsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [copiedPrivilege, setCopiedPrivilege] = useState(false);

  const debouncedSearch = useDebounce<string>(searchTerm, 300);
  const addItemToCart = useCartStore((state) => state.addItem);
  const [searchParams, setSearchParams] = useSearchParams();

  // TanStack Query for Categories
  const { data: categories = [] } = useCategoriesQuery();

  // Read ?category=slug, ?subcategory=term, or ?search=term from URL on mount & changes
  useEffect(() => {
    const slug = searchParams.get('category');
    if (slug && categories.length > 0) {
      const match = categories.find(
        (c) =>
          c.slug === slug ||
          c.name.toLowerCase().replace(/\s+/g, '-') === slug ||
          (slug === 'ethnic-couture' && c.slug === 'women') ||
          (slug === 'western-luxe' && c.slug === 'men') ||
          (slug === 'boys-kids-wear' && (c.slug === 'boys' || c.slug === 'girls'))
      );
      if (match) {
        setSelectedCategory(match.id);
      }
    } else if (!slug) {
      setSelectedCategory(null);
    }

    const sub = searchParams.get('subcategory') || searchParams.get('sub');
    if (sub) {
      setSelectedSubcategory(sub.toUpperCase());
    } else {
      setSelectedSubcategory('ALL');
    }

    const search = searchParams.get('search');
    if (search !== null) {
      setSearchTerm(search);
    } else {
      setSearchTerm('');
    }
  }, [searchParams, categories]);

  const categorySlug = searchParams.get('category');

  // Standard Product Query (load up to 360 items for full catalog)
  const {
    data: productsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useProductsQuery({
    size: 360,
    search: debouncedSearch.trim() || undefined,
    category_id: selectedCategory || undefined,
    category: !selectedCategory && categorySlug ? categorySlug : undefined,
    subcategory: selectedSubcategory !== 'ALL' ? selectedSubcategory : undefined,
  });

  const rawProducts = productsData?.items || [];
  // Strict safeguard: permanently filter out any dumb test, rate-limit, or bulk-imported products
  const products = rawProducts.filter((p) => {
    const nameLower = p.name.toLowerCase();
    const descLower = (p.description || '').toLowerCase();
    return (
      !nameLower.includes('rate limit') &&
      !nameLower.includes('dummy') &&
      !nameLower.includes('test product') &&
      !descLower.includes('bulk imported')
    );
  });
  const currentCategoryObj = categories.find((c) => c.id === selectedCategory);
  const activeSlug = currentCategoryObj?.slug || '';
  const meta = activeSlug ? CATEGORY_META[activeSlug] : null;

  // Sorting products client-side for ultra-fast reaction
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-low') {
      return Number(a.price) - Number(b.price);
    }
    if (sortBy === 'price-high') {
      return Number(b.price) - Number(a.price);
    }
    return 0; // featured default
  });

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = searchTerm.trim();
    const newParams: Record<string, string> = {};
    const cat = searchParams.get('category');
    if (cat) newParams.category = cat;
    if (trimmed) newParams.search = trimmed;
    setSearchParams(newParams);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    const newParams: Record<string, string> = {};
    const cat = searchParams.get('category');
    if (cat) newParams.category = cat;
    setSearchParams(newParams);
  };

  const handleSelectCategory = (catId: number | null, slug?: string) => {
    setSelectedCategory(catId);
    setSelectedSubcategory('ALL');
    const newParams: Record<string, string> = {};
    if (slug) newParams.category = slug;
    if (searchTerm.trim()) newParams.search = searchTerm.trim();
    setSearchParams(newParams);
  };

  const handleSelectSubcategory = (subcat: string) => {
    setSelectedSubcategory(subcat);
    const newParams: Record<string, string> = {};
    const cat = searchParams.get('category');
    if (cat) newParams.category = cat;
    if (subcat !== 'ALL') newParams.subcategory = subcat;
    if (searchTerm.trim()) newParams.search = searchTerm.trim();
    setSearchParams(newParams);
  };

  const activeCategoryKey = (currentCategoryObj?.slug || '').toLowerCase();
  const availableSubcategories =
    SUBCATEGORIES_BY_CATEGORY[activeCategoryKey] ||
    (activeCategoryKey === 'ethnic-couture'
      ? SUBCATEGORIES_BY_CATEGORY.women
      : activeCategoryKey === 'western-luxe'
      ? SUBCATEGORIES_BY_CATEGORY.men
      : activeCategoryKey === 'boys-kids-wear'
      ? SUBCATEGORIES_BY_CATEGORY.boys
      : []);

  const copyCode = () => {
    navigator.clipboard.writeText('SAVE10');
    setCopiedPrivilege(true);
    setTimeout(() => setCopiedPrivilege(false), 2500);
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* ── Breadcrumbs ── */}
      <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#7a5814]">
        <Link to="/" className="hover:text-[#3d2b07] transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#a88235]" />
        <Link to="/products" className="hover:text-[#3d2b07] transition-colors">
          Catalog
        </Link>
        {currentCategoryObj && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-[#a88235]" />
            <span className="text-[#3f2a03] font-bold">
              {currentCategoryObj.name}
            </span>
          </>
        )}
        {selectedSubcategory !== 'ALL' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-[#a88235]" />
            <span className="text-[#0d5c2d] font-black">
              {selectedSubcategory} (10)
            </span>
          </>
        )}
      </div>

      {/* ── Luxury Category Hero Banner ── */}
      <div
        className="relative overflow-hidden rounded-[26px] p-6 sm:p-10 border border-[#caa14d]/60 shadow-[0_8px_30px_rgba(150,110,20,0.14)]"
        style={{
          background:
            'linear-gradient(135deg, #fdf7ea 0%, #f7e9c8 45%, #eed69d 85%, #e5c681 100%)',
        }}
      >
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage: `
              repeating-linear-gradient(45deg, #7c5a08 0px, #7c5a08 1px, transparent 1px, transparent 28px),
              repeating-linear-gradient(-45deg, #7c5a08 0px, #7c5a08 1px, transparent 1px, transparent 28px)
            `,
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-[#caa14d]/50 text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[#61450a]">
              <Sparkles className="w-3.5 h-3.5 text-[#a3791e]" />
              <span>
                {meta?.bannerTag || 'Limeroad & Sivora Exclusive Catalog · 360 Pieces'}
              </span>
            </div>

            <h1
              className="text-2xl sm:text-4xl md:text-5xl font-black tracking-[0.14em] uppercase"
              style={{
                color: '#3d2a04',
                textShadow: '0 1px 3px rgba(120, 85, 10, 0.15)',
              }}
            >
              {selectedSubcategory !== 'ALL'
                ? `${selectedSubcategory} COLLECTION`
                : meta?.title || 'CURATED FASHION CATALOG'}
            </h1>

            <p className="text-xs sm:text-sm font-medium leading-relaxed text-[#5a400c]">
              {meta?.subtitle ||
                'Explore SIVORA’s complete apparel catalog: Women, Men, Girls, and Boys with 10 handpicked pieces per subcategory.'}
            </p>
          </div>

          {/* Privilege Code Pill */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 shrink-0">
            <button
              onClick={copyCode}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/80 hover:bg-white border border-[#caa14d]/70 text-[#473307] text-xs font-bold shadow-sm hover:shadow transition-all"
            >
              <Tag className="w-4 h-4 text-[#9b721c]" />
              <span>Code: <strong className="font-mono tracking-widest">SAVE10</strong></span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#5a3f0a] text-amber-100">
                {copiedPrivilege ? 'COPIED!' : '10% OFF'}
              </span>
            </button>
            <span className="text-[10px] text-[#705216] tracking-wider uppercase font-medium">
              Free Express White-Glove Shipping
            </span>
          </div>
        </div>
      </div>

      {/* ── Category Filter Pills Row (WOMEN, MEN, GIRLS, BOYS) ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => handleSelectCategory(null)}
          className={`px-4 py-2 rounded-full text-xs font-black tracking-[0.16em] uppercase whitespace-nowrap transition-all shadow-xs cursor-pointer ${
            selectedCategory === null
              ? 'bg-[#503706] text-amber-100 border border-[#3b2803] shadow-md scale-102'
              : 'bg-white/80 hover:bg-white text-[#523b09] border border-[#caa14d]/50'
          }`}
        >
          ALL (360)
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const countLabel =
            cat.name === 'Women'
              ? '(110)'
              : cat.name === 'Men'
              ? '(90)'
              : cat.name === 'Girls' || cat.name === 'Boys'
              ? '(80)'
              : '';
          return (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat.id, cat.slug)}
              className={`px-4 py-2 rounded-full text-xs font-black tracking-[0.16em] uppercase whitespace-nowrap transition-all shadow-xs cursor-pointer ${
                isSelected
                  ? 'bg-[#503706] text-amber-100 border border-[#3b2803] shadow-md scale-102'
                  : 'bg-white/80 hover:bg-white text-[#523b09] border border-[#caa14d]/50'
              }`}
            >
              {cat.name.toUpperCase()} {countLabel}
            </button>
          );
        })}
      </div>

      {/* ── Subcategories Filter Row (Limeroad Style: 10 Products Each) ── */}
      {availableSubcategories.length > 0 && (
        <div className="p-3 rounded-2xl bg-white/70 border border-[#caa14d]/40 backdrop-blur-sm flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-black uppercase text-[#61450a] tracking-widest pl-1 shrink-0">
            SUBCATEGORIES:
          </span>
          {availableSubcategories.map((subcat) => {
            const isSubSelected = selectedSubcategory === subcat;
            return (
              <button
                key={subcat}
                type="button"
                onClick={() => handleSelectSubcategory(subcat)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase whitespace-nowrap transition-all shadow-2xs cursor-pointer ${
                  isSubSelected
                    ? 'bg-[#0d6e35] text-white ring-2 ring-[#0d6e35]/40 shadow-sm scale-105'
                    : 'bg-white hover:bg-neutral-100 text-[#473309] border border-neutral-300'
                }`}
              >
                {subcat} {subcat !== 'ALL' && '(10)'}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Filter Controls Bar (Search + Sort + Counter) ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/70 border border-[#caa14d]/40 backdrop-blur-sm">
        {/* Left: Product Counter */}
        <div className="text-xs font-bold tracking-wider uppercase text-[#61450a]">
          Showing <span className="text-[#3b2803] font-black">{sortedProducts.length}</span>{' '}
          {sortedProducts.length === 1 ? 'Design' : 'Designs'}
        </div>

        {/* Center: Search within category / store */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex items-center w-full sm:w-84"
          role="search"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search products"
              placeholder="Search pants, shirts, lehengas, shoes..."
              className="w-full pl-9 pr-7 py-2 text-xs bg-white border border-[#caa14d]/60 rounded-full text-[#3d2a04] placeholder:text-[#8c6a28]/70 focus:outline-none focus:ring-2 focus:ring-[#9e7416]/50 shadow-xs"
            />
            <button
              type="submit"
              aria-label="Search"
              title="Click to search"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8c6a28] hover:text-[#3d2a04] p-0.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search"
                title="Clear search filter"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-xs font-bold text-[#8c6a28] hover:text-rose-600 rounded-full hover:bg-black/5 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            className="ml-2 px-4 py-2 bg-gradient-to-r from-[#6e4e0b] to-[#a87a1d] hover:from-[#573d08] hover:to-[#8c6414] active:scale-95 text-amber-50 font-bold text-xs tracking-wider uppercase rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            title="Execute Search"
          >
            <Search className="w-3 h-3" />
            <span>Search</span>
          </button>
        </form>

        {/* Right: Sort Dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#8c6a28]" />
          <span className="text-xs font-bold uppercase text-[#61450a]">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-[#caa14d]/60 rounded-full text-[#3d2a04] focus:outline-none focus:ring-1 focus:ring-[#9e7416] cursor-pointer"
          >
            <option value="featured">Featured Masterpieces</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* ── Product Grid Area ── */}
      <div id="catalog-section">
        {isLoading ? (
          <ProductGrid products={[]} isLoading={true} />
        ) : isError ? (
          <div className="py-6">
            <ErrorMessage
              title="Failed to load products"
              message={
                error?.message ||
                'Unable to load the luxury collection. Please check your network connection.'
              }
              onRetry={() => refetch()}
            />
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="py-16 text-center bg-white/70 rounded-2xl border border-[#caa14d]/40 p-8 space-y-3">
            <ShoppingBag className="w-10 h-10 mx-auto text-[#a3791e] opacity-60" />
            <h3 className="text-lg font-bold text-[#3d2a04] uppercase tracking-wider">
              No creations found
            </h3>
            <p className="text-xs text-[#735211] max-w-sm mx-auto">
              We couldn't find any designs matching your filter. Try clearing the search or category filter.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                handleSelectCategory(null);
              }}
              className="mt-2 px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase bg-[#503706] text-amber-100"
            >
              View All 160 Designs
            </button>
          </div>
        ) : (
          <ProductGrid products={sortedProducts} onAddToCart={addItemToCart} />
        )}
      </div>
    </div>
  );
};

export default ProductsPage;

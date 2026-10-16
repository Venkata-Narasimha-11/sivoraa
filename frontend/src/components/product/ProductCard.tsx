import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Check, Heart, ShieldCheck } from 'lucide-react';
import { Product } from '../../types/api';
import { useWishlist } from '../../hooks/useWishlist';
import useAuthStore from '../../stores/useAuthStore';

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  showStock?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  showStock = true,
}) => {
  const { user } = useAuthStore();
  const [isAdded, setIsAdded] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>(product.image_url || '');

  React.useEffect(() => {
    setImgSrc(product.image_url || '');
  }, [product.image_url]);

  const { isInWishlist, toggleWishlist } = useWishlist();
  const isFavorite = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const priceNum = Number(product.price) || 0;
  const mrpNum = Math.round(priceNum * 1.25);
  const discountPercent = 20;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    if (onAddToCart) {
      onAddToCart(product);
    }

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1400);
  };

  const getGarmentFallback = () => {
    const n = (product.name || '').toLowerCase();
    const c = (product.category?.name || '').toLowerCase();
    if (c.includes('men') || n.includes("men's")) {
      if (n.includes('jean') || n.includes('pant') || n.includes('trouser') || n.includes('cargo')) {
        return 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=85';
      }
      if (n.includes('shirt') || n.includes('tee') || n.includes('henley')) {
        return 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=700&q=85';
      }
      return 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=700&q=85';
    }
    if (c.includes('boy') || n.includes("boys'")) {
      if (n.includes('jean') || n.includes('pant') || n.includes('trouser')) {
        return 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=700&q=85';
      }
      return 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=700&q=85';
    }
    if (c.includes('girl') || n.includes("girls'")) {
      return 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=700&q=85';
    }
    if (n.includes('saree') || n.includes('sari')) {
      return 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=85';
    }
    return 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=85';
  };

  return (
    <div
      data-testid={`product-card-${product.id}`}
      className="group relative flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-[#dfcda2]/70 hover:border-[#b88c32] shadow-[0_4px_16px_rgba(150,110,20,0.08)] hover:shadow-[0_12px_32px_rgba(150,110,20,0.18)] transition-all duration-300 hover:-translate-y-1"
    >
      {/* ── Product Image Container (3:4 Portrait Ratio) ── */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#fbf7ee]">
        {/* Wishlist Button */}
        {user?.role !== 'admin' && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            data-testid={`wishlist-toggle-btn-${product.id}`}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 z-10 shadow-sm cursor-pointer ${
              isFavorite
                ? 'bg-rose-500 text-white scale-105'
                : 'bg-white/90 hover:bg-white text-slate-500 hover:text-rose-600 hover:scale-105'
            }`}
            aria-label={
              isFavorite
                ? `Remove ${product.name} from wishlist`
                : `Save ${product.name} to wishlist`
            }
            title={isFavorite ? 'Remove from Wishlist' : 'Save to Wishlist'}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Clean Luxury Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-[#503706] text-amber-100 shadow-xs">
              {discountPercent}% OFF
            </span>
          </div>
        )}

        {/* Stock Alert Badge */}
        {showStock && (
          <div className="absolute bottom-2.5 left-2.5 z-10">
            {isOutOfStock ? (
              <span
                data-testid="out-of-stock-badge"
                className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-red-600 text-white shadow-xs"
              >
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span
                data-testid="low-stock-badge"
                className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-600 text-white shadow-xs animate-pulse"
              >
                Only {product.stock} left!
              </span>
            ) : (
              <span
                data-testid="in-stock-badge"
                className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-[#4a3507]/80 backdrop-blur-xs text-amber-100"
              >
                In Stock ({product.stock})
              </span>
            )}
          </div>
        )}

        {/* Clickable Image with Gentle Hover Zoom */}
        <Link to={`/products/${product.id}`} className="block h-full w-full">
          <img
            src={imgSrc}
            alt={product.name}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
            onError={() => {
              const fb = getGarmentFallback();
              if (imgSrc !== fb) {
                setImgSrc(fb);
              }
            }}
          />
        </Link>
      </div>

      {/* ── Product Information Body ── */}
      <div className="flex-1 flex flex-col justify-between p-4 bg-white space-y-2.5">
        <div>
          {/* Subtle Category Brand Subtitle */}
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8c671b] mb-1 flex items-center gap-1.5">
            <span>SIVORA</span>
            <span>•</span>
            <span>{product.category?.name || 'LUXE'}</span>
          </div>

          {/* Product Name */}
          <Link
            to={`/products/${product.id}`}
            className="block text-sm sm:text-[15px] font-bold text-slate-900 group-hover:text-[#91660d] transition-colors line-clamp-1 leading-snug"
          >
            {product.name}
          </Link>

          {/* Description Snippet */}
          {product.description && (
            <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* ── Price and Add to Bag Row ── */}
        <div className="pt-2.5 border-t border-[#f0e4c6] space-y-2.5">
          <div className="flex items-center gap-2">
            <span
              data-testid="product-price"
              className="text-base sm:text-lg font-black text-slate-900 tracking-tight"
            >
              ₹{priceNum.toLocaleString('en-IN')}
              <span className="sr-only">${priceNum.toFixed(2)}</span>
            </span>
            <span className="text-xs text-slate-400 line-through">
              ₹{mrpNum.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] font-bold text-emerald-700">
              ({discountPercent}% OFF)
            </span>
          </div>

          {/* Sleek Luxury Add to Bag Button (Customer Only) or Manage in Admin (Admin Only) */}
          {user?.role === 'admin' ? (
            <Link
              to={`/admin?tab=products&search=${encodeURIComponent(product.name)}`}
              data-testid={`admin-manage-btn-${product.id}`}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold tracking-[0.14em] uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs bg-[#503706] hover:bg-[#382604] text-amber-100 border border-[#caa353]"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
              <span>Manage in Admin</span>
            </Link>
          ) : (
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              data-testid={`add-to-cart-btn-${product.id}`}
              aria-label={`Add ${product.name} to cart`}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold tracking-[0.14em] uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                isOutOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
                  : isAdded
                  ? 'bg-emerald-700 text-white shadow-emerald-700/20'
                  : 'bg-[#3d2a04] hover:bg-[#251902] text-[#f7ead0] border border-[#302103] hover:shadow-md'
              }`}
            >
              {isOutOfStock ? (
                <span>Sold Out</span>
              ) : isAdded ? (
                <>
                  <Check className="h-3.5 w-3.5 text-white" />
                  <span>Added to Bag ✓</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5 text-[#e5c986]" />
                  <span>Add to Bag</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

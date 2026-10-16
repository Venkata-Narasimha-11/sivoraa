import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check, ShieldCheck, Truck, Heart } from 'lucide-react';
import { useProductQuery } from '../hooks/useProducts';
import useCartStore from '../stores/useCartStore';
import useAuthStore from '../stores/useAuthStore';
import { useWishlist } from '../hooks/useWishlist';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import ErrorMessage from '../components/common/ErrorMessage';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const { user } = useAuthStore();
  const addItemToCart = useCartStore((state) => state.addItem);
  const { isInWishlist, toggleWishlist } = useWishlist();

  const { data: product, isLoading, isError, error, refetch } = useProductQuery(productId);
  const isFavorite = product ? isInWishlist(product.id) : false;
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-xl mx-auto">
        <ErrorMessage
          title="Product Not Found"
          message={error?.message || 'The requested product does not exist.'}
          onRetry={() => refetch()}
        />
        <div className="mt-4 text-center">
          <Link to="/">
            <Button variant="outline">Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItemToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addItemToCart(product, quantity);
    navigate('/checkout');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Products</span>
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2">
        {/* Product Image */}
        <div className="relative aspect-square bg-slate-100 flex items-center justify-center p-8">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80'}
            alt={product.name}
            className="max-h-full max-w-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80';
            }}
          />

          <div className="absolute top-4 left-4">
            {isOutOfStock ? (
              <Badge variant="danger">Out of Stock</Badge>
            ) : (
              <Badge variant="success">In Stock ({product.stock} available)</Badge>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-8 flex flex-col justify-between">
          <div className="space-y-4">
            {product.category && (
              <Badge variant="info">{product.category.name}</Badge>
            )}

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {product.name}
            </h1>

            <div className="text-3xl font-extrabold text-[#91660d] dark:text-[#caa559]">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </div>

            <p className="text-slate-600 text-sm leading-relaxed">
              {product.description || 'No description provided for this product.'}
            </p>
          </div>

          <div className="space-y-6 pt-6 border-t border-slate-100 mt-6">
            {user?.role === 'admin' ? (
              <div className="p-5 rounded-2xl bg-[#fcf8ee] border border-[#caa353] shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#503706]">
                  <ShieldCheck className="h-4 w-4 text-[#a1781c]" />
                  <span>Administrator Product View</span>
                </div>
                <p className="text-xs text-[#735211] leading-relaxed">
                  You are viewing this product with Administrator privileges. As an administrator, retail shopping cart and checkout actions are disabled. You can manage specifications, pricing, or inventory restock directly in the Admin Portal.
                </p>
                <Link
                  to={`/admin?tab=products&search=${encodeURIComponent(product.name)}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#503706] hover:bg-[#382604] text-amber-100 font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
                >
                  <ShieldCheck className="h-4 w-4 text-amber-300" />
                  <span>Manage / Edit in Admin Portal</span>
                </Link>
              </div>
            ) : (
              <>
                {/* Quantity Selector */}
                {!isOutOfStock && (
                  <div className="flex items-center gap-4">
                    <label htmlFor="quantity-select" className="text-sm font-medium text-slate-700">
                      Quantity:
                    </label>
                    <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="px-4 py-1.5 text-sm font-semibold text-slate-800">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                        disabled={quantity >= product.stock}
                        className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Add to Cart, Buy Now & Wishlist Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Button
                    size="lg"
                    variant={isAdded ? 'secondary' : 'outline'}
                    disabled={isOutOfStock}
                    onClick={handleAddToCart}
                    className="flex-1 border-[#91660d] text-[#91660d] hover:bg-[#91660d]/10"
                    data-testid="detail-add-to-cart-btn"
                    leftIcon={
                      isAdded ? (
                        <Check className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <ShoppingCart className="h-5 w-5" />
                      )
                    }
                  >
                    {isOutOfStock ? 'Out of Stock' : isAdded ? 'Added to Cart!' : 'Add to Cart'}
                  </Button>

                  <Button
                    size="lg"
                    variant="primary"
                    disabled={isOutOfStock}
                    onClick={handleBuyNow}
                    className="flex-1 bg-[#91660d] hover:bg-[#7a5509] text-white font-bold"
                    data-testid="detail-buy-now-btn"
                  >
                    Buy Now
                  </Button>

                  <button
                    type="button"
                    onClick={() => product && toggleWishlist(product)}
                    data-testid="detail-wishlist-toggle-btn"
                    className={`p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-center ${
                      isFavorite
                        ? 'bg-rose-50 border-rose-300 text-rose-500 dark:bg-rose-950/30 dark:border-rose-800'
                        : 'border-slate-300 dark:border-slate-700 text-slate-500 hover:text-rose-500 hover:border-rose-300'
                    }`}
                    title={isFavorite ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    aria-label={isFavorite ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>
              </>
            )}

            {/* Feature Callouts */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-500" />
                <span>Fast express delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>30-day money-back guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

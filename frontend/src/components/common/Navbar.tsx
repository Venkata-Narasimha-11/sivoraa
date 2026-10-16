import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShoppingBag,
  User as UserIcon,
  LogOut,
  Heart,
  Search,
  ShieldCheck,
  ChevronDown,
  Package,
  Wallet,
} from 'lucide-react';
import useAuthStore from '../../stores/useAuthStore';
import useCartStore from '../../stores/useCartStore';
import { useWishlist } from '../../hooks/useWishlist';
import NotificationBell from '../realtime/NotificationBell';
import ThemeToggle from './ThemeToggle';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { totalItems: wishlistCount } = useWishlist();
  const totalCartItems = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
  );

  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(urlSearch);

  // Keep search input in sync whenever URL search changes
  useEffect(() => {
    setSearchQuery(urlSearch);
  }, [urlSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    } else {
      navigate('/products');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigateCategory = (categorySlug: string) => {
    navigate(`/products?category=${encodeURIComponent(categorySlug)}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#caa353]/40 dark:border-[#caa353]/30 bg-[#fbf5e6]/95 dark:bg-[#12141c]/95 backdrop-blur-md shadow-xs font-sans transition-colors">
      {/* ── Top Announcement Strip ── */}
      <div className="bg-[#483307] dark:bg-[#0a0c12] text-[#f8edd1] text-[10px] font-bold tracking-[0.25em] uppercase py-1.5 px-4 text-center flex items-center justify-center gap-3">
        <span className="text-[#e2be67]">✦</span>
        <span>
          ATELIER SIVORA • USE CODE: <strong className="bg-[#e2be67]/20 text-[#edd28c] px-2 py-0.5 rounded border border-[#e2be67]/40">SAVE10</strong> FOR 10% OFF • FREE WHITE-GLOVE DELIVERY INDIA-WIDE
        </span>
        <span className="text-[#e2be67]">✦</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          {/* Left Category Links (Women, Men, Girls, Boys) */}
          <nav className="hidden lg:flex items-center gap-5 text-[11px] font-bold tracking-[0.14em] uppercase text-[#473309] dark:text-[#eedba2]">
            <Link
              to="/products"
              className="hover:text-[#91660d] dark:hover:text-[#caa14d] transition-colors py-1"
            >
              Products
            </Link>
            <button
              onClick={() => navigateCategory('women')}
              className="hover:text-[#91660d] dark:hover:text-[#caa14d] transition-colors uppercase font-bold cursor-pointer"
            >
              WOMEN
            </button>
            <button
              onClick={() => navigateCategory('men')}
              className="hover:text-[#91660d] dark:hover:text-[#caa14d] transition-colors uppercase font-bold cursor-pointer"
            >
              MEN
            </button>
            <button
              onClick={() => navigateCategory('girls')}
              className="hover:text-[#91660d] dark:hover:text-[#caa14d] transition-colors uppercase font-bold cursor-pointer"
            >
              GIRLS
            </button>
            <button
              onClick={() => navigateCategory('boys')}
              className="hover:text-[#91660d] dark:hover:text-[#caa14d] transition-colors uppercase font-bold cursor-pointer"
            >
              BOYS
            </button>
          </nav>

          {/* Center Brand: SIVORA */}
          <div className="flex-1 lg:flex-initial flex flex-col items-center justify-center text-center">
            <Link to="/" data-testid="brand-logo-link" className="group inline-block">
              <span className="sr-only">TypeScript &amp; Vitest E-Shop</span>
              <div className="flex items-center justify-center gap-1.5 text-[#a1781c]">
                <span className="text-[10px]">✦</span>
              </div>
              <h1
                className="text-2xl sm:text-3xl font-black tracking-[0.28em] uppercase leading-none select-none"
                style={{
                  background:
                    'linear-gradient(135deg, #513702 0%, #875c08 28%, #d8aa32 50%, #875c08 75%, #513702 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 1px 2px rgba(100,70,5,0.2))',
                }}
              >
                SIVORA
              </h1>
              <span className="text-[8px] font-semibold tracking-[0.38em] text-[#6d4f13] dark:text-[#caa14d] uppercase block mt-0.5">
                LUXE FASHION &amp; LIFESTYLE
              </span>
            </Link>
          </div>

          {/* Right Action Icons: Search + ThemeToggle + Wishlist + Cart + Profile/Login */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-48 lg:w-60" role="search">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search luxury products..."
                aria-label="Search luxury products"
                className="w-full pl-3.5 pr-9 py-1.5 text-xs bg-white/90 dark:bg-[#1a1e2b] border border-[#c49f4f]/60 dark:border-[#caa14d]/40 rounded-full text-[#422e06] dark:text-[#f8edd1] placeholder:text-[#8a6c2c]/70 dark:placeholder:text-[#a88a4e]/70 focus:outline-none focus:ring-2 focus:ring-[#9e7416]/50 shadow-xs"
              />
              <button
                type="submit"
                aria-label="Submit Search"
                title="Search luxury products"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-[#8a6c2c] dark:text-[#caa14d] hover:text-[#4a3406] dark:hover:text-amber-200 hover:bg-[#c49f4f]/20 dark:hover:bg-[#caa14d]/20 rounded-full transition-all cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Wishlist Link */}
            {user?.role !== 'admin' && (
              <Link
                to="/wishlist"
                data-testid="nav-wishlist-link"
                aria-label="Wishlist"
                className="relative p-2 rounded-full text-[#5e430d] dark:text-[#eedba2] hover:text-[#9e7416] dark:hover:text-[#caa14d] hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
                title="View Wishlist"
              >
                <Heart
                  className={`h-5 w-5 ${
                    wishlistCount > 0 ? 'text-rose-600 fill-rose-600' : 'text-[#5e430d] dark:text-[#eedba2]'
                  }`}
                />
                <span className="sr-only">Wishlist</span>
                {wishlistCount > 0 && (
                  <span
                    data-testid="wishlist-badge-count"
                    className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-xs"
                  >
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* Cart Link */}
            {user?.role !== 'admin' && (
              <Link
                to="/cart"
                data-testid="nav-cart-link"
                aria-label={`Shopping cart with ${totalCartItems} items`}
                className="relative p-2 rounded-full text-[#5e430d] dark:text-[#eedba2] hover:text-[#9e7416] dark:hover:text-[#caa14d] hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
                title="Shopping Bag"
              >
                <ShoppingBag className="h-5 w-5 text-[#5e430d] dark:text-[#eedba2]" />
                {totalCartItems > 0 && (
                  <span
                    data-testid="cart-badge-count"
                    className="absolute -top-1 -right-1 bg-[#523908] text-amber-100 text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-xs"
                  >
                    {totalCartItems}
                  </span>
                )}
              </Link>
            )}

            {/* ☀️/🌙 Dark & Light Mode Toggle */}
            <ThemeToggle />

            {/* Auth / Profile Actions */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[#caa14d]/40">
                {user.role === 'admin' ? (
                  <Link
                    to="/admin"
                    data-testid="nav-admin-link"
                    className="px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-[#503706] text-amber-100 border border-[#3b2803] hover:brightness-110 shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
                    <span data-testid="navbar-username">{user.username}</span>
                    <span className="text-[9px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                      ADMIN
                    </span>
                  </Link>
                ) : (
                  <div className="relative group">
                    <Link
                      to="/profile"
                      data-testid="navbar-profile-pill"
                      className="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-[#473307] border border-[#caa14d]/50 shadow-xs transition-all cursor-pointer"
                    >
                      <UserIcon className="h-3.5 w-3.5 text-[#91660d]" />
                      <span data-testid="navbar-username" className="hidden sm:inline">
                        {user.username}
                      </span>
                      <ChevronDown className="h-3 w-3 text-slate-400 group-hover:rotate-180 transition-transform" />
                    </Link>

                    {/* Bewakoof-Style User Dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white border border-[#eed9a4] shadow-[0_12px_32px_rgba(150,110,20,0.18)] p-2 hidden group-hover:block hover:block z-50 animate-in fade-in-50 duration-200">
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="text-[10px] text-slate-400 font-medium">Welcome,</p>
                        <p className="text-xs font-black text-slate-900 capitalize truncate">
                          Hi, {user.full_name || user.username}
                        </p>
                      </div>

                      <div className="space-y-0.5 text-xs font-bold text-slate-700">
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#fff9e8] hover:text-[#91660d] transition-colors"
                        >
                          <UserIcon className="w-3.5 h-3.5 text-[#b88c32]" />
                          <span>My Account</span>
                        </Link>
                        <Link
                          to="/wishlist"
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#fff9e8] hover:text-[#91660d] transition-colors"
                        >
                          <Heart className="w-3.5 h-3.5 text-[#b88c32]" />
                          <span>My Wishlist</span>
                        </Link>
                        <Link
                          to="/profile?tab=orders"
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#fff9e8] hover:text-[#91660d] transition-colors"
                        >
                          <Package className="w-3.5 h-3.5 text-[#b88c32]" />
                          <span>My Orders</span>
                        </Link>
                        <Link
                          to="/profile?tab=wallet"
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#fff9e8] hover:text-[#91660d] transition-colors"
                        >
                          <Wallet className="w-3.5 h-3.5 text-[#b88c32]" />
                          <span>My Wallet</span>
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 mt-1.5 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  aria-label="Logout"
                  className="p-1.5 text-[#735211] hover:text-red-700 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-[#ebd08c] via-[#dfbe6e] to-[#caa44a] text-[#3a2703] border border-[#9d741a]/40 hover:brightness-105 shadow-sm transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

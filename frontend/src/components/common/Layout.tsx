import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';
import ErrorBoundary from './ErrorBoundary';
import { Crown, Truck, RefreshCw, Heart } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isDark } = useTheme();

  return (
    <div
      className="flex min-h-screen flex-col text-[#3d2a04] dark:text-[#fdf5e2] selection:bg-[#dfbe6e]/40 font-sans transition-colors duration-300"
      style={{
        background: isDark
          ? 'radial-gradient(circle at 50% 10%, #181c26 0%, #10131c 45%, #0a0c12 100%)'
          : 'radial-gradient(circle at 50% 10%, #fcf7ea 0%, #f7eacc 40%, #eed7a1 75%, #e5c986 100%)',
      }}
    >
      {/* ── SIVORA Luxury Top Navbar ── */}
      <Navbar />

      {/* ── Main Content Area ── */}
      <main className="flex-1 py-6 sm:py-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ErrorBoundary>{children || <Outlet />}</ErrorBoundary>
        </div>
      </main>

      {/* ── SIVORA Luxury Footer ── */}
      <footer className="border-t border-[#caa14d]/40 dark:border-[#caa14d]/20 bg-[#f7eed8]/90 dark:bg-[#0c0e14]/95 py-10 text-xs text-[#523b0a] dark:text-[#dfcaa2] transition-colors">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Trust Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-b border-[#caa14d]/30 text-center font-bold tracking-[0.16em] uppercase">
            <div className="flex items-center justify-center gap-2">
              <Crown className="w-4 h-4 text-[#91660d]" />
              <span>100% Certified Luxury Quality</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Truck className="w-4 h-4 text-[#91660d]" />
              <span>Complimentary Pan-India Delivery</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#91660d]" />
              <span>7-Day White-Glove Concierge Returns</span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-bold tracking-widest uppercase">
            <Link to="/products?category=ethnic-couture" className="hover:text-[#91660d] transition-colors">
              Women
            </Link>
            <Link to="/products?category=western-luxe" className="hover:text-[#91660d] transition-colors">
              Men
            </Link>
            <Link to="/products?category=boys-kids-wear" className="hover:text-[#91660d] transition-colors">
              Kids
            </Link>
            <Link to="/products?category=footwear" className="hover:text-[#91660d] transition-colors">
              Footwear
            </Link>
            <Link to="/products?category=luxury-handbags" className="hover:text-[#91660d] transition-colors">
              Accessories
            </Link>
            <Link to="/products?category=fine-jewellery" className="hover:text-[#91660d] transition-colors">
              Jewelry
            </Link>
            <Link to="/products?category=beauty-fragrances" className="hover:text-[#91660d] transition-colors">
              Fragrance
            </Link>
            <Link to="/products?category=home-luxe" className="hover:text-[#91660d] transition-colors">
              Home Luxe
            </Link>
            <Link to="/orders" className="hover:text-[#91660d] transition-colors">
              Orders
            </Link>
          </div>

          {/* Copyright & Stamp */}
          <div className="pt-4 border-t border-[#caa14d]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#6b4e12]">
            <p className="font-semibold tracking-wide">
              © 2026 <strong className="font-black tracking-widest text-[#3d2a04]">ATELIER SIVORA</strong> • Autonomous Haute Couture &amp; Lifestyle Destination.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] tracking-wider uppercase font-medium">
              <span>Crafted with</span>
              <Heart className="w-3 h-3 text-red-600 fill-red-600 inline" />
              <span>for Royal Connoisseurs</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

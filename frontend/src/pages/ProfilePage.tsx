import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Package,
  CreditCard,
  Wallet,
  MapPin,
  User as UserIcon,
  LogOut,
  HelpCircle,
  ChevronRight,
  CheckCircle2,
  Plus,
  Phone,
  Mail,
  Truck,
  Gift,
  Crown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import useAuthStore from '../stores/useAuthStore';

type TabKey =
  | 'overview'
  | 'orders'
  | 'payments'
  | 'wallet'
  | 'addresses'
  | 'profile'
  | 'support';

interface SavedAddress {
  id: string;
  type: 'Home' | 'Office' | 'Atelier';
  name: string;
  phone: string;
  street: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface SavedCard {
  id: string;
  bank: string;
  cardName: string;
  type: 'Visa Infinite' | 'Mastercard World Elite';
  last4: string;
  expiry: string;
  gradient: string;
  isDefault: boolean;
}

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout, setUser } = useAuthStore();

  const currentTab = (searchParams.get('tab') as TabKey) || 'overview';
  const [activeTab, setActiveTab] = useState<TabKey>(currentTab);

  // Sync tab with URL
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as TabKey;
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    setSearchParams(tab === 'overview' ? {} : { tab });
  };

  // Determine user display identity
  const defaultName =
    user?.full_name ||
    (user?.username
      ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
      : 'Sudheer Munduru');
  const defaultEmail = user?.email || 'sudheer.munduru@gmail.com';
  const defaultPhone = user?.phone_number || '+91 83093 11380';

  // Editable Profile Form State
  const [fullName, setFullName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [phoneNumber, setPhoneNumber] = useState(defaultPhone);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dob, setDob] = useState('1996-08-22');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Wallet State
  const [walletBalance, setWalletBalance] = useState(2500);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherMsg, setVoucherMsg] = useState('');

  // Address State
  const [addresses, setAddresses] = useState<SavedAddress[]>([
    {
      id: 'addr-1',
      type: 'Home',
      name: defaultName,
      phone: defaultPhone,
      street: 'Flat 402, Royal Residency, Road No. 36',
      locality: 'Jubilee Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500033',
      isDefault: true,
    },
    {
      id: 'addr-2',
      type: 'Office',
      name: defaultName,
      phone: defaultPhone,
      street: 'Tower B, 7th Floor, Cyber Gateway',
      locality: 'HITEC City, Madhapur',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500081',
      isDefault: false,
    },
  ]);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    type: 'Home' as 'Home' | 'Office' | 'Atelier',
    name: defaultName,
    phone: defaultPhone,
    street: '',
    locality: '',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '',
  });

  // Saved Payment Methods
  const [savedCards] = useState<SavedCard[]>([
    {
      id: 'card-1',
      bank: 'HDFC Bank',
      cardName: 'Infinia Metal',
      type: 'Visa Infinite',
      last4: '4892',
      expiry: '08/29',
      gradient: 'from-[#1c1404] via-[#332305] to-[#0f0b02]',
      isDefault: true,
    },
    {
      id: 'card-2',
      bank: 'ICICI Bank',
      cardName: 'Emeralde Luxe',
      type: 'Mastercard World Elite',
      last4: '1029',
      expiry: '11/28',
      gradient: 'from-[#1b1c22] via-[#292c36] to-[#121317]',
      isDefault: false,
    },
  ]);

  // Handle Profile Save
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      setUser({
        ...user,
        full_name: fullName,
        email: email,
        phone_number: phoneNumber,
      });
    }
    setSaveSuccessMsg('Profile changes saved successfully to your VIP Dossier!');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // Handle Voucher Redeem
  const handleRedeemVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = voucherCode.trim().toUpperCase();
    if (clean === 'SIVORA500' || clean === 'SAVE500') {
      setWalletBalance((prev) => prev + 500);
      setVoucherMsg('✓ ₹500.00 Luxe Credits added to your Imperial Wallet!');
      setVoucherCode('');
    } else if (clean === 'SAVE10' || clean === 'ROYAL250') {
      setWalletBalance((prev) => prev + 250);
      setVoucherMsg('✓ ₹250.00 Gift Voucher applied to your balance!');
      setVoucherCode('');
    } else {
      setVoucherMsg('Invalid voucher code. Try coupon: SAVE10 or SIVORA500');
    }
    setTimeout(() => setVoucherMsg(''), 4500);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.street || !newAddr.pincode) return;
    const added: SavedAddress = {
      id: `addr-${Date.now()}`,
      type: newAddr.type,
      name: newAddr.name,
      phone: newAddr.phone,
      street: newAddr.street,
      locality: newAddr.locality || newAddr.city,
      city: newAddr.city,
      state: newAddr.state,
      pincode: newAddr.pincode,
      isDefault: false,
    };
    setAddresses([...addresses, added]);
    setShowAddressModal(false);
    setNewAddr({
      type: 'Home',
      name: fullName,
      phone: phoneNumber,
      street: '',
      locality: '',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '',
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitial = fullName.charAt(0).toUpperCase() || 'S';

  return (
    <div className="min-h-screen bg-[#fcf9f2] text-slate-800 font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-7">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium border-b border-[#eedba7]/60 pb-3">
          <div className="flex items-center gap-2">
            <span
              onClick={() => navigate('/')}
              className="hover:text-[#91660d] cursor-pointer transition-colors"
            >
              Atelier
            </span>
            <span>/</span>
            <span
              onClick={() => switchTab('overview')}
              className="hover:text-[#91660d] cursor-pointer font-bold text-slate-700"
            >
              VIP Patron Salon
            </span>
            {activeTab !== 'overview' && (
              <>
                <span>/</span>
                <span className="capitalize text-[#91660d] font-black tracking-wider">
                  {activeTab}
                </span>
              </>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] font-bold text-[#8f6412] tracking-wider uppercase">
            <Crown className="w-3.5 h-3.5 text-[#caa14d]" />
            <span>SIVORA PRIVATE CLIENT NO: #{user?.id || 1048}</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            1. ULTRA-LUXURY ROYAL PATRON HERO IDENTITY BANNER
           ══════════════════════════════════════════════════════════ */}
        <div className="relative overflow-hidden rounded-[26px] border-2 border-[#caa559]/80 bg-gradient-to-r from-[#171003] via-[#291c06] to-[#120c02] p-6 sm:p-8 text-white shadow-[0_16px_40px_rgba(140,100,20,0.22)]">
          {/* Subtle Ambient Gold Accents */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#dfbe6e]/10 blur-3xl pointer-events-none" />
          <div className="absolute right-12 bottom-0 text-[180px] font-black text-white/[0.02] select-none pointer-events-none leading-none">
            S
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Avatar + Identity */}
            <div className="flex items-center gap-5 sm:gap-6">
              {/* Gold Ring Avatar */}
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#dfbe6e] via-[#fedb81] to-[#b78b30] p-1 shadow-lg">
                  <div className="w-full h-full rounded-full bg-[#241703] flex items-center justify-center font-black text-3xl sm:text-4xl text-[#fedb81] shadow-inner select-none">
                    {userInitial}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#523806] border border-[#dfbe6e] text-amber-200 shadow-md">
                  <Crown className="w-4 h-4 text-[#fedb81]" />
                </div>
              </div>

              {/* Name & Patron Badge */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white capitalize">
                    {fullName}
                  </h1>
                  <span className="px-3 py-0.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase bg-gradient-to-r from-[#dfbe6e] to-[#caa14d] text-[#342202] shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    IMPERIAL PATRON
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#eed9a4]/90 font-medium flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#caa14d]" />
                  <span>{email}</span>
                </p>
                <p className="text-xs sm:text-sm text-amber-100/90 font-bold flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#caa14d]" />
                  <span>{phoneNumber}</span>
                </p>
              </div>
            </div>

            {/* Middle Stats Bar (Luxe Balance, Orders, Wishlist) */}
            <div className="grid grid-cols-3 gap-3 sm:gap-5 bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
              <div
                onClick={() => switchTab('wallet')}
                className="cursor-pointer text-center px-2 hover:bg-white/5 rounded-xl transition-colors"
              >
                <span className="text-[10px] tracking-wider uppercase font-bold text-[#edd28c] block">
                  Luxe Balance
                </span>
                <span className="text-base sm:text-lg font-black text-white mt-0.5 block">
                  ₹{walletBalance.toLocaleString('en-IN')}
                </span>
                <span className="text-[9px] text-emerald-400 font-bold">
                  + Lifetime Usable
                </span>
              </div>

              <div
                onClick={() => switchTab('orders')}
                className="cursor-pointer text-center px-2 hover:bg-white/5 rounded-xl transition-colors border-x border-white/10"
              >
                <span className="text-[10px] tracking-wider uppercase font-bold text-[#edd28c] block">
                  Active Orders
                </span>
                <span className="text-base sm:text-lg font-black text-white mt-0.5 block">
                  3 Ensembles
                </span>
                <span className="text-[9px] text-blue-400 font-bold flex items-center justify-center gap-1">
                  <Truck className="w-3 h-3" /> 1 In Transit
                </span>
              </div>

              <div
                onClick={() => navigate('/wishlist')}
                className="cursor-pointer text-center px-2 hover:bg-white/5 rounded-xl transition-colors"
              >
                <span className="text-[10px] tracking-wider uppercase font-bold text-[#edd28c] block">
                  Wishlist
                </span>
                <span className="text-base sm:text-lg font-black text-white mt-0.5 block">
                  8 Vault Items
                </span>
                <span className="text-[9px] text-amber-300 font-bold">
                  Saved Pieces
                </span>
              </div>
            </div>

            {/* Right: Quick Action Button */}
            <div className="flex sm:flex-col gap-2.5 justify-end">
              <button
                onClick={() => switchTab('profile')}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-[#dfbe6e] via-[#eed28c] to-[#caa559] hover:from-[#edd697] hover:to-[#dfbe6e] text-[#342202] font-black text-xs tracking-wider uppercase shadow-[0_4px_16px_rgba(200,150,30,0.35)] hover:shadow-[0_6px_22px_rgba(230,180,50,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <UserIcon className="w-4 h-4 text-[#342202]" />
                <span>EDIT PROFILE</span>
              </button>

              <button
                onClick={() => switchTab('support')}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#dfbe6e]" />
                <span>VIP CONCIERGE</span>
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            2-COLUMN MAIN DASHBOARD (SIDEBAR + CONTENT PANELS)
           ══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ══════════════════════════════════════════════════════════
              LEFT SIDEBAR: BEWAKOOF-STYLE VERTICAL LUXURY MENU
             ══════════════════════════════════════════════════════════ */}
          <aside className="lg:col-span-3 bg-white rounded-2xl border border-[#ebd7a5] shadow-[0_4px_16px_rgba(150,110,20,0.06)] overflow-hidden sticky top-24">
            <div className="px-5 py-4 border-b border-slate-100 bg-[#fefdf9]">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#91660d]">
                Private Client Menu
              </p>
            </div>

            <nav className="divide-y divide-slate-100 text-sm font-semibold">
              {/* 1. Overview */}
              <button
                onClick={() => switchTab('overview')}
                className={`w-full flex items-center gap-3.5 px-5 py-4 transition-all text-left cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-[#fff9e8] text-[#91660d] border-l-4 border-[#b88c32] font-black'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-5 h-5 text-[#b88c32]" />
                <span className="flex-1">Overview</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* 2. My Orders */}
              <button
                onClick={() => switchTab('orders')}
                className={`w-full flex items-center gap-3.5 px-5 py-4 transition-all text-left cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-[#fff9e8] text-[#91660d] border-l-4 border-[#b88c32] font-black'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Package className="w-5 h-5 text-[#b88c32]" />
                <span className="flex-1">My Orders</span>
                <span className="text-[10px] bg-amber-100 text-[#7a5509] font-black px-2.5 py-0.5 rounded-full">
                  3 Ensembles
                </span>
              </button>

              {/* 3. My Payments */}
              <button
                onClick={() => switchTab('payments')}
                className={`w-full flex items-center gap-3.5 px-5 py-4 transition-all text-left cursor-pointer ${
                  activeTab === 'payments'
                    ? 'bg-[#fff9e8] text-[#91660d] border-l-4 border-[#b88c32] font-black'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-5 h-5 text-[#b88c32]" />
                <span className="flex-1">My Payments</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* 4. My Wallet */}
              <button
                onClick={() => switchTab('wallet')}
                className={`w-full flex items-center gap-3.5 px-5 py-4 transition-all text-left cursor-pointer ${
                  activeTab === 'wallet'
                    ? 'bg-[#fff9e8] text-[#91660d] border-l-4 border-[#b88c32] font-black'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Wallet className="w-5 h-5 text-[#b88c32]" />
                <span className="flex-1">My Wallet</span>
                <span className="text-xs font-black text-emerald-700">
                  ₹{walletBalance.toLocaleString('en-IN')}
                </span>
              </button>

              {/* 5. My Addresses */}
              <button
                onClick={() => switchTab('addresses')}
                className={`w-full flex items-center gap-3.5 px-5 py-4 transition-all text-left cursor-pointer ${
                  activeTab === 'addresses'
                    ? 'bg-[#fff9e8] text-[#91660d] border-l-4 border-[#b88c32] font-black'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <MapPin className="w-5 h-5 text-[#b88c32]" />
                <span className="flex-1">My Addresses</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* 6. My Profile */}
              <button
                onClick={() => switchTab('profile')}
                className={`w-full flex items-center gap-3.5 px-5 py-4 transition-all text-left cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-[#fff9e8] text-[#91660d] border-l-4 border-[#b88c32] font-black'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <UserIcon className="w-5 h-5 text-[#b88c32]" />
                <span className="flex-1">My Profile &amp; Sizing</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* 7. Help & Support */}
              <button
                onClick={() => switchTab('support')}
                className={`w-full flex items-center gap-3.5 px-5 py-4 transition-all text-left cursor-pointer ${
                  activeTab === 'support'
                    ? 'bg-[#fff9e8] text-[#91660d] border-l-4 border-[#b88c32] font-black'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <HelpCircle className="w-5 h-5 text-[#b88c32]" />
                <span className="flex-1">Help &amp; Support</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* 8. Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3.5 px-5 py-4 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-5 h-5 text-red-500" />
                <span className="font-bold">Logout</span>
              </button>
            </nav>
          </aside>

          {/* ══════════════════════════════════════════════════════════
              RIGHT MAIN CONTENT AREA
             ══════════════════════════════════════════════════════════ */}
          <main className="lg:col-span-9 space-y-6">
            {/* ══════════════════════════════════════════════════════════
                TAB 1: OVERVIEW (THE 6 BEWAKOOF CARDS GRID)
               ══════════════════════════════════════════════════════════ */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* ── Active Order Live Tracker Teaser Card ── */}
                <div className="bg-white rounded-2xl border-2 border-[#ecd497] p-6 shadow-sm relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#91660d] flex items-center justify-center font-bold">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#8f6412] tracking-widest uppercase">
                          Live Shipment Status
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">
                          Order #SV-89214 — Out For White-Glove Delivery Today
                        </h4>
                      </div>
                    </div>

                    <button
                      onClick={() => switchTab('orders')}
                      className="text-xs font-bold text-[#91660d] hover:text-[#5a3e05] flex items-center gap-1 cursor-pointer"
                    >
                      <span>Track Order</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 4-Step Progress Bar */}
                  <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                    <div className="space-y-1.5">
                      <div className="h-1.5 w-full bg-[#caa14d] rounded-full" />
                      <span className="text-[10px] font-bold text-slate-800">
                        Placed
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-1.5 w-full bg-[#caa14d] rounded-full" />
                      <span className="text-[10px] font-bold text-slate-800">
                        Atelier Craft
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-1.5 w-full bg-[#caa14d] rounded-full" />
                      <span className="text-[10px] font-bold text-slate-800">
                        Shipped
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-1.5 w-full bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-bold text-emerald-700">
                        Out for Delivery
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── 6 Bewakoof Interactive Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Card 1: My Orders */}
                  <div
                    onClick={() => switchTab('orders')}
                    className="group bg-white p-6 rounded-2xl border border-slate-200/90 hover:border-[#caa14d] shadow-[0_4px_16px_rgba(150,110,20,0.04)] hover:shadow-[0_12px_28px_rgba(150,110,20,0.14)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                    style={{ minHeight: '170px' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#fcf7ea] to-[#f4e2b8] border border-[#dfbe6e]/40 text-[#8b6514] group-hover:scale-110 transition-transform shadow-xs">
                        <Package className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700">
                        3 Orders
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 group-hover:text-[#91660d] transition-colors flex items-center gap-1">
                        My Orders
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        View, Modify And Track Live Deliveries
                      </p>
                    </div>
                  </div>

                  {/* Card 2: My Payments */}
                  <div
                    onClick={() => switchTab('payments')}
                    className="group bg-white p-6 rounded-2xl border border-slate-200/90 hover:border-[#caa14d] shadow-[0_4px_16px_rgba(150,110,20,0.04)] hover:shadow-[0_12px_28px_rgba(150,110,20,0.14)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                    style={{ minHeight: '170px' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#fcf7ea] to-[#f4e2b8] border border-[#dfbe6e]/40 text-[#8b6514] group-hover:scale-110 transition-transform shadow-xs">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800">
                        2 Cards Saved
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 group-hover:text-[#91660d] transition-colors flex items-center gap-1">
                        My Payments
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Encrypted Cards, UPI IDs &amp; Express Checkout
                      </p>
                    </div>
                  </div>

                  {/* Card 3: My Wallet */}
                  <div
                    onClick={() => switchTab('wallet')}
                    className="group bg-white p-6 rounded-2xl border border-slate-200/90 hover:border-[#caa14d] shadow-[0_4px_16px_rgba(150,110,20,0.04)] hover:shadow-[0_12px_28px_rgba(150,110,20,0.14)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                    style={{ minHeight: '170px' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#fcf7ea] to-[#f4e2b8] border border-[#dfbe6e]/40 text-[#8b6514] group-hover:scale-110 transition-transform shadow-xs">
                        <Wallet className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-black text-emerald-800 bg-emerald-50">
                        ₹{walletBalance.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 group-hover:text-[#91660d] transition-colors flex items-center gap-1">
                        My Wallet
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        SIVORA Luxe Balance &amp; Gift Voucher Redemptions
                      </p>
                    </div>
                  </div>

                  {/* Card 4: My Addresses */}
                  <div
                    onClick={() => switchTab('addresses')}
                    className="group bg-white p-6 rounded-2xl border border-slate-200/90 hover:border-[#caa14d] shadow-[0_4px_16px_rgba(150,110,20,0.04)] hover:shadow-[0_12px_28px_rgba(150,110,20,0.14)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                    style={{ minHeight: '170px' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#fcf7ea] to-[#f4e2b8] border border-[#dfbe6e]/40 text-[#8b6514] group-hover:scale-110 transition-transform shadow-xs">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                        2 Saved
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 group-hover:text-[#91660d] transition-colors flex items-center gap-1">
                        My Addresses
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Edit, Add Or Remove Delivery Addresses
                      </p>
                    </div>
                  </div>

                  {/* Card 5: My Profile */}
                  <div
                    onClick={() => switchTab('profile')}
                    className="group bg-white p-6 rounded-2xl border border-slate-200/90 hover:border-[#caa14d] shadow-[0_4px_16px_rgba(150,110,20,0.04)] hover:shadow-[0_12px_28px_rgba(150,110,20,0.14)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                    style={{ minHeight: '170px' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#fcf7ea] to-[#f4e2b8] border border-[#dfbe6e]/40 text-[#8b6514] group-hover:scale-110 transition-transform shadow-xs">
                        <UserIcon className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 group-hover:text-[#91660d] transition-colors flex items-center gap-1">
                        My Profile
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Edit Personal Info, Contact &amp; Password
                      </p>
                    </div>
                  </div>

                  {/* Card 6: Help & Support */}
                  <div
                    onClick={() => switchTab('support')}
                    className="group bg-white p-6 rounded-2xl border border-slate-200/90 hover:border-[#caa14d] shadow-[0_4px_16px_rgba(150,110,20,0.04)] hover:shadow-[0_12px_28px_rgba(150,110,20,0.14)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                    style={{ minHeight: '170px' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#fcf7ea] to-[#f4e2b8] border border-[#dfbe6e]/40 text-[#8b6514] group-hover:scale-110 transition-transform shadow-xs">
                        <HelpCircle className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Concierge Live
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 group-hover:text-[#91660d] transition-colors flex items-center gap-1">
                        Help &amp; Support
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        24x7 WhatsApp Royal Concierge &amp; FAQs
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                TAB 2: MY ORDERS
               ══════════════════════════════════════════════════════════ */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      My Couture Orders
                    </h3>
                    <p className="text-xs text-slate-500">
                      View past acquisitions, download invoices &amp; track white-glove courier
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/products')}
                    className="text-xs font-bold text-[#91660d] hover:underline"
                  >
                    Browse Collections →
                  </button>
                </div>

                {/* Order 1 (In Transit) */}
                <div className="border-2 border-[#eed9a4] rounded-2xl p-5 sm:p-6 space-y-4 bg-[#fffefc] shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50/60 p-3.5 rounded-xl text-xs">
                    <div>
                      <span className="text-slate-500 font-medium">Order Number: </span>
                      <strong className="text-slate-900 font-mono">#SV-89214</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Placed on: </span>
                      <span className="font-semibold text-slate-800">
                        14 Oct 2026
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Total Amount: </span>
                      <strong className="text-slate-900 font-black">₹48,500.00</strong>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800 flex items-center gap-1.5 shadow-xs">
                      <Truck className="w-3.5 h-3.5" /> OUT FOR DELIVERY TODAY
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <img
                      src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=200&q=80"
                      alt="Lehenga"
                      className="w-20 h-24 object-cover rounded-xl border border-slate-200"
                    />
                    <div className="flex-1 space-y-1">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        Crimson Bridal Lehenga — Zardozi Edition
                      </h4>
                      <p className="text-xs text-slate-500">
                        Hand-embroidered crimson lehenga with real gold zari zardozi craft, pure tissue silk choli
                      </p>
                      <div className="flex items-center gap-3 pt-1">
                        <span className="text-xs text-slate-600 font-semibold">
                          Qty: 1 • Size: Custom Atelier M
                        </span>
                        <span className="text-xs font-black text-[#91660d]">
                          ₹48,500.00
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2">
                      <button
                        onClick={() => navigate('/orders')}
                        className="px-4 py-2 rounded-xl text-xs font-black bg-[#ffcd36] hover:bg-[#f5be22] text-slate-950 transition-all cursor-pointer shadow-xs"
                      >
                        Track Live
                      </button>
                      <button className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
                        Invoice
                      </button>
                    </div>
                  </div>
                </div>

                {/* Order 2 (Delivered) */}
                <div className="border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl text-xs">
                    <div>
                      <span className="text-slate-500 font-medium">Order Number: </span>
                      <strong className="text-slate-900 font-mono">#SV-89102</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Placed on: </span>
                      <span className="font-semibold text-slate-800">
                        10 Oct 2026
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Total Amount: </span>
                      <strong className="text-slate-900 font-black">₹38,500.00</strong>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      DELIVERED
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <img
                      src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=200&q=80"
                      alt="Sherwani"
                      className="w-20 h-24 object-cover rounded-xl border border-slate-200"
                    />
                    <div className="flex-1 space-y-1">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        Ivory Raw Silk Sherwani — Royal Groom Ensemble
                      </h4>
                      <p className="text-xs text-slate-500">
                        Bespoke tailored groom sherwani in pure Banarasi raw silk with resham zardozi buttons
                      </p>
                      <div className="flex items-center gap-3 pt-1">
                        <span className="text-xs text-slate-600 font-semibold">
                          Qty: 1 • Size: 42 Regal
                        </span>
                        <span className="text-xs font-black text-[#91660d]">
                          ₹38,500.00
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2">
                      <button className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
                        Reorder
                      </button>
                      <button className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
                        Invoice
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                TAB 3: MY PAYMENTS (TITANIUM & GOLD VAULT CARDS)
               ══════════════════════════════════════════════════════════ */}
            {activeTab === 'payments' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 space-y-6 shadow-xs">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-xl font-black text-slate-900">
                    Payment Vault
                  </h3>
                  <p className="text-xs text-slate-500">
                    Military-grade 256-bit encrypted cards &amp; instant UPI handles
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {savedCards.map((card) => (
                    <div
                      key={card.id}
                      className={`p-6 rounded-2xl border-2 border-[#d9b867] bg-gradient-to-br ${card.gradient} text-white shadow-xl relative overflow-hidden`}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <span className="text-xs font-black tracking-widest uppercase text-amber-300">
                            {card.bank}
                          </span>
                          <span className="text-[10px] text-white/70 block">
                            {card.cardName}
                          </span>
                        </div>
                        {card.isDefault && (
                          <span className="px-2.5 py-0.5 rounded text-[9px] font-black bg-gradient-to-r from-[#dfbe6e] to-[#caa14d] text-slate-950 uppercase shadow-xs">
                            DEFAULT
                          </span>
                        )}
                      </div>

                      <div className="w-9 h-7 rounded bg-amber-400/40 border border-amber-300/60 mb-5 flex items-center justify-center">
                        <div className="w-5 h-4 border border-amber-200/50 rounded-xs" />
                      </div>

                      <div className="text-xl font-mono tracking-widest mb-4">
                        •••• •••• •••• {card.last4}
                      </div>

                      <div className="flex justify-between text-xs text-slate-300">
                        <span className="font-semibold">{fullName.toUpperCase()}</span>
                        <span>EXP: {card.expiry}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Verified UPI Handles
                  </h4>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                        UPI
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 font-mono">
                          {user?.username || 'sudheer'}@okhdfcbank
                        </div>
                        <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified Express Checkout
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold">
                      Primary
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                TAB 4: MY WALLET
               ══════════════════════════════════════════════════════════ */}
            {activeTab === 'wallet' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 space-y-6 shadow-xs">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-xl font-black text-slate-900">
                    SIVORA Imperial Wallet
                  </h3>
                  <p className="text-xs text-slate-500">
                    Instant cash refunds, store credits &amp; gifted luxury certificates
                  </p>
                </div>

                {/* Balance Display */}
                <div className="p-7 rounded-2xl bg-gradient-to-r from-[#1d1404] via-[#332306] to-[#120d02] border-2 border-[#caa559] text-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-lg">
                  <div>
                    <span className="text-xs font-black tracking-[0.22em] uppercase text-[#dfbe6e]">
                      Available Luxe Credits
                    </span>
                    <div className="text-3xl sm:text-5xl font-black tracking-tight text-white mt-1">
                      ₹{walletBalance.toLocaleString('en-IN')}.00
                    </div>
                    <p className="text-xs text-amber-200/80 mt-1.5 flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      100% redeemable on any couture piece · Never expires
                    </p>
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      onClick={() => setWalletBalance((p) => p + 500)}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all cursor-pointer"
                    >
                      + ₹500
                    </button>
                    <button
                      onClick={() => setWalletBalance((p) => p + 1000)}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all cursor-pointer"
                    >
                      + ₹1,000
                    </button>
                  </div>
                </div>

                {/* Redeem Gift Voucher */}
                <div className="p-5 rounded-xl bg-[#fffcf5] border border-[#ecd497] space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#704f08] flex items-center gap-2">
                    <Gift className="w-4 h-4 text-[#91660d]" />
                    Redeem Luxury Gift Voucher or Promotion Coupon
                  </h4>
                  <form onSubmit={handleRedeemVoucher} className="flex gap-3">
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      placeholder="Enter code (Try: SAVE10 or SIVORA500)"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-[#91660d]"
                    />
                    <button
                      type="submit"
                      className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#dfbe6e] to-[#caa14d] hover:brightness-105 text-slate-950 font-black text-xs tracking-wider uppercase shadow-xs transition-all cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                  {voucherMsg && (
                    <p
                      className={`text-xs font-bold ${
                        voucherMsg.includes('added') || voucherMsg.includes('applied')
                          ? 'text-emerald-700'
                          : 'text-red-600'
                      }`}
                    >
                      {voucherMsg}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                TAB 5: MY ADDRESSES
               ══════════════════════════════════════════════════════════ */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      Saved Delivery Addresses
                    </h3>
                    <p className="text-xs text-slate-500">
                      Manage white-glove doorstep delivery addresses for express shipping
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="px-4 py-2 rounded-xl bg-[#ffcd36] hover:bg-[#fabf1d] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add New Address
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-5 rounded-2xl border-2 transition-all relative ${
                        addr.isDefault
                          ? 'border-[#caa14d] bg-[#fffdf8] shadow-xs'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                          {addr.type}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-black text-[#91660d] uppercase tracking-wider flex items-center gap-1">
                            <Crown className="w-3 h-3 text-[#caa14d]" />
                            DEFAULT ATELIER DESTINATION
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {addr.name}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {addr.street}, {addr.locality}
                      </p>
                      <p className="text-xs text-slate-600">
                        {addr.city}, {addr.state} — <strong>{addr.pincode}</strong>
                      </p>
                      <p className="text-xs text-slate-700 font-bold mt-2">
                        Mobile: {addr.phone}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Add Address Modal */}
                {showAddressModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#ebd7a5]">
                      <div className="flex justify-between items-center border-b pb-3">
                        <h4 className="text-base font-black text-slate-900">
                          Add New Delivery Address
                        </h4>
                        <button
                          onClick={() => setShowAddressModal(false)}
                          className="text-slate-400 hover:text-slate-700 text-lg font-bold"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleAddAddress} className="space-y-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 uppercase">
                            Recipient Full Name
                          </label>
                          <input
                            type="text"
                            required
                            value={newAddr.name}
                            onChange={(e) =>
                              setNewAddr({ ...newAddr, name: e.target.value })
                            }
                            className="w-full px-3 py-2 border rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600 uppercase">
                            Contact Mobile Number
                          </label>
                          <input
                            type="text"
                            required
                            value={newAddr.phone}
                            onChange={(e) =>
                              setNewAddr({ ...newAddr, phone: e.target.value })
                            }
                            className="w-full px-3 py-2 border rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600 uppercase">
                            House / Flat, Landmark &amp; Street
                          </label>
                          <input
                            type="text"
                            required
                            value={newAddr.street}
                            onChange={(e) =>
                              setNewAddr({ ...newAddr, street: e.target.value })
                            }
                            className="w-full px-3 py-2 border rounded-lg text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 uppercase">
                              City
                            </label>
                            <input
                              type="text"
                              required
                              value={newAddr.city}
                              onChange={(e) =>
                                setNewAddr({ ...newAddr, city: e.target.value })
                              }
                              className="w-full px-3 py-2 border rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 uppercase">
                              Pincode
                            </label>
                            <input
                              type="text"
                              required
                              value={newAddr.pincode}
                              onChange={(e) =>
                                setNewAddr({
                                  ...newAddr,
                                  pincode: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-3">
                          <button
                            type="button"
                            onClick={() => setShowAddressModal(false)}
                            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2 rounded-lg text-xs font-black uppercase bg-[#ffcd36] hover:bg-[#f5be22] text-slate-950"
                          >
                            Save Address
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                TAB 6: MY PROFILE (EDIT PERSONAL DETAILS)
               ══════════════════════════════════════════════════════════ */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 space-y-6 shadow-xs">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-xl font-black text-slate-900">
                    VIP Patron Dossier
                  </h3>
                  <p className="text-xs text-slate-500">
                    Personal styling profile, contact credentials &amp; bespoke measurement settings
                  </p>
                </div>

                {saveSuccessMsg && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{saveSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleProfileSave} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#91660d] text-sm font-semibold"
                      />
                    </div>

                    {/* Username */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                        Username (Account Handle)
                      </label>
                      <input
                        type="text"
                        disabled
                        value={user?.username || 'sudheermunduru'}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 text-sm font-semibold cursor-not-allowed"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#91660d] text-sm font-semibold"
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Mobile Number
                      </label>
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#91660d] text-sm font-semibold"
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Preferred Couture Fit
                      </label>
                      <div className="flex gap-4 pt-1">
                        {(['Male', 'Female', 'Other'] as const).map((g) => (
                          <label
                            key={g}
                            className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="gender"
                              checked={gender === g}
                              onChange={() => setGender(g)}
                              className="text-[#91660d] focus:ring-[#91660d]"
                            />
                            <span>{g}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Date of Birth (Birthday Privileges)
                      </label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#91660d] text-sm font-semibold"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#dfbe6e] to-[#caa14d] hover:brightness-105 text-[#281a02] font-black text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                    >
                      Save Profile Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                TAB 7: HELP & SUPPORT
               ══════════════════════════════════════════════════════════ */}
            {activeTab === 'support' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 space-y-6 shadow-xs">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-xl font-black text-slate-900">
                    24/7 SIVORA Royal Concierge
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dedicated private advisor for bespoke styling, sizing advice &amp; order tracking
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl border border-[#ebd7a5] bg-[#fffcf5] space-y-2">
                    <div className="p-2.5 rounded-xl bg-amber-100 text-[#91660d] w-fit">
                      <Phone className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Toll-Free Phone Concierge
                    </h4>
                    <p className="text-xs text-slate-500">
                      Available daily: 9:00 AM – 9:00 PM IST
                    </p>
                    <p className="text-sm font-black text-[#91660d]">
                      1800-SIVORA-LUXE (1800-748-672)
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl border border-[#ebd7a5] bg-[#fffcf5] space-y-2">
                    <div className="p-2.5 rounded-xl bg-amber-100 text-[#91660d] w-fit">
                      <Mail className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Email Concierge
                    </h4>
                    <p className="text-xs text-slate-500">
                      Direct response within 2 hours
                    </p>
                    <p className="text-sm font-black text-[#91660d]">
                      concierge@sivora-couture.com
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-sm font-bold text-slate-900">
                    Frequently Asked Questions
                  </h4>
                  <div className="space-y-2 text-xs">
                    <details className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                      <summary className="font-bold text-slate-800">
                        What is SIVORA's Return &amp; Exchange Policy?
                      </summary>
                      <p className="mt-2 text-slate-600 leading-relaxed">
                        We offer a complimentary 7-day white-glove doorstep exchange &amp; return policy. Custom-tailored bridal attire includes one free alteration session.
                      </p>
                    </details>
                    <details className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                      <summary className="font-bold text-slate-800">
                        How can I track my couture order?
                      </summary>
                      <p className="mt-2 text-slate-600 leading-relaxed">
                        Navigate to "My Orders" tab above or click the live tracking link sent to your registered WhatsApp ({phoneNumber}).
                      </p>
                    </details>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

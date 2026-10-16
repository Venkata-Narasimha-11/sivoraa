import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  Search,
  Filter,
  ShieldCheck,
  Cpu,
  Upload,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Layers,
  X,
} from 'lucide-react';
import { AIDescriptionModal } from '../components/ai/AIDescriptionModal';
import {
  useAdminProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useAdminOrdersQuery,
  useAdminUpdateOrderStatusMutation,
} from '../hooks/useAdmin';
import { useCategoriesQuery } from '../hooks/useProducts';
import { productFormSchema, ProductFormData } from '../schemas/productFormSchema';
import { Product, OrderStatus } from '../types/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { BackgroundTasksPage } from './BackgroundTasksPage';

type AdminTab = 'products' | 'orders' | 'analytics' | 'tasks';

const SIVORA_FALLBACK_IMG =
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80';

export const AdminPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as AdminTab;
  const [activeTab, setActiveTab] = useState<AdminTab>(
    tabParam === 'tasks' || tabParam === 'orders' || tabParam === 'analytics'
      ? tabParam
      : 'products'
  );

  useEffect(() => {
    if (tabParam && ['products', 'orders', 'analytics', 'tasks'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const [productSearch, setProductSearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<'ALL' | 'WOMEN' | 'MEN' | 'GIRLS' | 'BOYS'>('ALL');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const PAGE_SIZE = 25;

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);

  // Queries
  const {
    data: productsData,
    isLoading: isProductsLoading,
  } = useAdminProductsQuery({ size: 500 });

  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    refetch: refetchOrders,
  } = useAdminOrdersQuery();

  const { data: categories = [] } = useCategoriesQuery();

  // Mutations
  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();
  const deleteMutation = useDeleteProductMutation();
  const updateOrderStatusMutation = useAdminUpdateOrderStatusMutation();

  // Create Form
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    setValue: setValueCreate,
    watch: watchCreate,
    formState: { errors: createErrors, isSubmitting: isCreating },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 10,
      category_id: categories[0]?.id || 1,
      image_url: '',
    },
  });

  // Edit Form
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue: setValueEdit,
    watch: watchEdit,
    formState: { errors: editErrors, isSubmitting: isUpdating },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
  });

  // AI Description Generator Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiTargetForm, setAiTargetForm] = useState<'create' | 'edit'>('create');

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    resetEdit({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      category_id: product.category_id,
      image_url: product.image_url || '',
    });
  };

  const onSubmitCreate = async (data: ProductFormData) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        description: data.description || undefined,
        price: data.price,
        stock: data.stock,
        category_id: data.category_id,
        image_url: data.image_url || undefined,
      });
      resetCreate();
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Failed to create product:', err);
    }
  };

  const onSubmitEdit = async (data: ProductFormData) => {
    if (!editingProduct) return;
    try {
      await updateMutation.mutateAsync({
        id: editingProduct.id,
        data: {
          name: data.name,
          description: data.description || undefined,
          price: data.price,
          stock: data.stock,
          category_id: data.category_id,
          image_url: data.image_url || undefined,
        },
      });
      setEditingProduct(null);
    } catch (err) {
      console.error('Failed to update product:', err);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      setDeletingProductId(null);
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const handleStatusChange = async (orderId: number, status: OrderStatus) => {
    try {
      await updateOrderStatusMutation.mutateAsync({ orderId, status });
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  // Products List & Filtering
  const productsList = useMemo(() => productsData?.items || [], [productsData]);

  // Department counts
  const departmentCounts = useMemo(() => {
    return {
      ALL: productsList.length,
      WOMEN: productsList.filter((p) => (p.category?.name || '').toUpperCase().includes('WOMEN')).length,
      MEN: productsList.filter((p) => (p.category?.name || '').toUpperCase().includes('MEN')).length,
      GIRLS: productsList.filter((p) => (p.category?.name || '').toUpperCase().includes('GIRL')).length,
      BOYS: productsList.filter((p) => (p.category?.name || '').toUpperCase().includes('BOY')).length,
    };
  }, [productsList]);

  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      // 1. Text Search Filter (name, category, ID)
      const q = productSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.category?.name && p.category.name.toLowerCase().includes(q)) ||
        String(p.id).includes(q);

      if (!matchesSearch) return false;

      // 2. Department Filter
      if (selectedDeptFilter === 'ALL') return true;
      const catName = (p.category?.name || '').toUpperCase();
      return catName.includes(selectedDeptFilter);
    });
  }, [productsList, productSearch, selectedDeptFilter]);

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [productSearch, selectedDeptFilter]);

  // Pagination slice
  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  // Filtered Orders
  const ordersList = useMemo(() => ordersData || [], [ordersData]);
  const filteredOrders = useMemo(() => {
    return ordersList.filter((o) => {
      if (orderStatusFilter === 'all') return true;
      return o.status === orderStatusFilter;
    });
  }, [ordersList, orderStatusFilter]);

  // Analytics Metrics
  const totalRevenue = useMemo(() => {
    return ordersList.reduce(
      (sum, o) => (o.status !== 'cancelled' ? sum + Number(o.total_amount || 0) : sum),
      0
    );
  }, [ordersList]);

  const totalOrdersCount = ordersList.length;
  const activeProductsCount = productsList.length;
  const lowStockProducts = useMemo(() => productsList.filter((p) => p.stock < 5), [productsList]);

  const getDeptBadgeStyle = (categoryName?: string) => {
    const name = (categoryName || '').toUpperCase();
    if (name.includes('WOMEN')) {
      return 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/40';
    }
    if (name.includes('MEN')) {
      return 'bg-amber-50 dark:bg-amber-950/40 text-[#543b09] dark:text-amber-300 border-amber-200 dark:border-amber-800/40';
    }
    if (name.includes('GIRL')) {
      return 'bg-pink-50 dark:bg-pink-950/40 text-pink-800 dark:text-pink-300 border-pink-200 dark:border-pink-800/40';
    }
    if (name.includes('BOY')) {
      return 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800/40';
    }
    return 'bg-[#fcf7ec] dark:bg-[#1a1e2b] text-[#694c0f] dark:text-amber-200 border-[#caa14d]/40';
  };

  return (
    <div className="min-h-screen bg-[#fbf7ee] dark:bg-[#0c0e14] text-[#402d08] dark:text-[#f8edd1] pb-16 font-sans transition-colors duration-300">
      {/* ── Top Micro Announcement Strip ── */}
      <div className="bg-[#483307] dark:bg-[#06070a] text-[#f8edd1] text-[10px] font-bold tracking-[0.25em] uppercase py-2 px-4 text-center border-b border-[#caa353]/30 flex items-center justify-center gap-2">
        <span className="text-[#e2be67]">✦</span>
        <span>ATELIER SIVORA • EXECUTIVE MANAGEMENT PORTAL • CONFIDENTIAL &amp; PROTECTED</span>
        <span className="text-[#e2be67]">✦</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* ── Page Header & Tabs ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-6 border-b border-[#e2cc94] dark:border-[#caa14d]/30">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#caa353] via-[#a1781c] to-[#503706] text-amber-50 shadow-md flex items-center justify-center shrink-0 border border-[#edd59a]">
              <ShieldCheck className="h-6 w-6 text-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-[0.22em] text-[#91660d] dark:text-[#caa14d] uppercase">
                  ATELIER SIVORA ARCHITECTURE
                </span>
                <span className="text-[9px] bg-[#503706] text-amber-200 font-bold px-2 py-0.5 rounded-full border border-[#caa14d]/40">
                  ADMIN ONLY
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#402d08] dark:text-[#f8eed2] tracking-tight uppercase font-serif mt-0.5">
                Admin Control Hub
              </h1>
              <p className="text-xs text-[#735211] dark:text-[#eedba2] mt-0.5">
                Centralized product catalog CRUD operations, real-time inventory telemetry &amp; order fulfillment.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* ── Tab Controls ── */}
            <div className="flex flex-wrap items-center bg-white/80 dark:bg-[#141722]/90 p-1.5 rounded-2xl gap-1.5 border border-[#e2cc94] dark:border-[#caa14d]/40 shadow-xs">
              <button
                type="button"
                data-testid="admin-tab-products"
                onClick={() => handleTabChange('products')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'products'
                    ? 'bg-[#483307] dark:bg-[#caa14d] text-[#fdf5e2] dark:text-[#1c1204] shadow-sm border border-[#caa353]'
                    : 'text-[#634509] dark:text-[#eedba2] hover:text-[#382604] dark:hover:text-amber-100 hover:bg-[#caa353]/10 dark:hover:bg-[#caa14d]/20'
                }`}
              >
                <Package className="h-4 w-4" />
                <span>Products ({productsList.length})</span>
              </button>

              <button
                type="button"
                data-testid="admin-tab-orders"
                onClick={() => handleTabChange('orders')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-[#483307] dark:bg-[#caa14d] text-[#fdf5e2] dark:text-[#1c1204] shadow-sm border border-[#caa353]'
                    : 'text-[#634509] dark:text-[#eedba2] hover:text-[#382604] dark:hover:text-amber-100 hover:bg-[#caa353]/10 dark:hover:bg-[#caa14d]/20'
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Orders ({ordersList.length})</span>
              </button>

              <button
                type="button"
                data-testid="admin-tab-analytics"
                onClick={() => handleTabChange('analytics')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-[#483307] dark:bg-[#caa14d] text-[#fdf5e2] dark:text-[#1c1204] shadow-sm border border-[#caa353]'
                    : 'text-[#634509] dark:text-[#eedba2] hover:text-[#382604] dark:hover:text-amber-100 hover:bg-[#caa353]/10 dark:hover:bg-[#caa14d]/20'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Analytics &amp; KPIs</span>
              </button>

              <button
                type="button"
                data-testid="admin-tab-tasks"
                onClick={() => handleTabChange('tasks')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'tasks'
                    ? 'bg-[#483307] dark:bg-[#caa14d] text-[#fdf5e2] dark:text-[#1c1204] shadow-sm border border-[#caa353]'
                    : 'text-[#634509] dark:text-[#eedba2] hover:text-[#382604] dark:hover:text-amber-100 hover:bg-[#caa353]/10 dark:hover:bg-[#caa14d]/20'
                }`}
              >
                <Cpu className="h-4 w-4" />
                <span>Tasks &amp; Bulk Import</span>
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            TAB 1: PRODUCT MANAGEMENT & CATALOG
        ══════════════════════════════════════════════════ */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Category Filter Pills (Women, Men, Girls, Boys, All) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/90 dark:bg-[#141722]/90 p-4 rounded-2xl border border-[#e2cc94] dark:border-[#caa14d]/30 shadow-xs">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                <span className="text-[11px] font-bold text-[#735211] dark:text-[#caa14d] uppercase tracking-wider flex items-center gap-1.5 shrink-0 mr-1">
                  <Filter className="w-3.5 h-3.5 text-[#a1781c]" /> Filter Dept:
                </span>
                {(['ALL', 'WOMEN', 'MEN', 'GIRLS', 'BOYS'] as const).map((dept) => {
                  const count = departmentCounts[dept];
                  const isSelected = selectedDeptFilter === dept;
                  return (
                    <button
                      key={dept}
                      onClick={() => setSelectedDeptFilter(dept)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all shrink-0 cursor-pointer border ${
                        isSelected
                          ? 'bg-[#503706] dark:bg-[#caa14d] text-amber-100 dark:text-[#1c1204] border-[#caa353] shadow-xs'
                          : 'bg-[#fcf8ef] dark:bg-[#1a1e2b] text-[#634509] dark:text-[#eedba2] border-[#e2cc94] dark:border-[#caa14d]/30 hover:bg-white dark:hover:bg-[#232838] hover:text-[#382604] dark:hover:text-amber-100'
                      }`}
                    >
                      {dept} {count > 0 && <span className="opacity-80 text-[10px]">({count})</span>}
                    </button>
                  );
                })}
              </div>

              {/* Actions: Bulk Import CSV + Add Product */}
              <div className="flex items-center gap-2.5 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  data-testid="admin-bulk-import-btn"
                  onClick={() => handleTabChange('tasks')}
                  className="border-[#caa353] dark:border-[#caa14d]/40 text-[#634509] dark:text-[#eedba2] bg-white/80 dark:bg-[#1a1e2b] hover:bg-[#caa353]/15 dark:hover:bg-[#caa14d]/20 rounded-xl font-bold uppercase tracking-wider text-xs px-3.5 py-2 cursor-pointer shadow-xs"
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5 text-[#a1781c]" />
                  Bulk Import CSV
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  data-testid="add-product-btn"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-[#503706] dark:bg-[#caa14d] hover:bg-[#382604] dark:hover:bg-[#dfb55c] text-amber-100 dark:text-[#1c1204] border border-[#caa353]/60 rounded-xl font-bold uppercase tracking-wider text-xs px-4 py-2 cursor-pointer shadow-md"
                >
                  <Plus className="h-4 w-4 mr-1.5 text-amber-300 dark:text-[#1c1204]" />
                  Add New Product
                </Button>
              </div>
            </div>

            {/* Search Bar & Result Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-lg">
                <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a1781c]" />
                <input
                  type="text"
                  placeholder="Search products by name or category..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-[#caa353]/60 dark:border-[#caa14d]/40 bg-white dark:bg-[#141722] text-[#402d08] dark:text-[#f8edd1] placeholder:text-[#91712a]/70 dark:placeholder:text-[#a88a4e]/70 focus:outline-none focus:ring-2 focus:ring-[#9e7416]/40 shadow-xs"
                />
                {productSearch && (
                  <button
                    onClick={() => setProductSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="text-xs font-semibold text-[#735211] dark:text-[#caa14d] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#a1781c]" />
                <span>
                  Showing {filteredProducts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, filteredProducts.length)} of {filteredProducts.length} items
                  {selectedDeptFilter !== 'ALL' && ` in ${selectedDeptFilter}`}
                </span>
              </div>
            </div>

            {/* Catalog Table */}
            {isProductsLoading ? (
              <div className="py-24 text-center bg-white/70 dark:bg-[#141722]/70 rounded-2xl border border-[#e2cc94] dark:border-[#caa14d]/30">
                <LoadingSpinner size="lg" text="Loading SIVORA fashion catalog..." />
              </div>
            ) : (
              <div className="bg-white dark:bg-[#141722] rounded-2xl border border-[#e2cc94] dark:border-[#caa14d]/30 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-[#402d08] dark:text-[#f8edd1]">
                    <thead className="bg-[#f9f3e4] dark:bg-[#1a1e2b] text-[11px] uppercase font-bold tracking-widest text-[#705014] dark:text-[#eedba2] border-b border-[#e5cf96] dark:border-[#caa14d]/30">
                      <tr>
                        <th className="py-3.5 px-4">Product Details</th>
                        <th className="py-3.5 px-4">Department / Cat</th>
                        <th className="py-3.5 px-4">Price</th>
                        <th className="py-3.5 px-4">Stock Level</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f2e6cb] dark:divide-[#242938]">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-16 text-center text-[#805e1a] dark:text-[#caa14d]">
                            <Package className="w-10 h-10 mx-auto text-[#caa353] mb-2 opacity-60" />
                            <p className="font-semibold">No products found matching "{productSearch}"</p>
                            <p className="text-xs text-[#9c7526] dark:text-[#a88a4e] mt-1">
                              Try clearing filters or check another category.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        paginatedProducts.map((product) => {
                          const catName = product.category?.name || 'General';
                          return (
                            <tr
                              key={product.id}
                              className="hover:bg-[#fbf7ed] dark:hover:bg-[#1a1e2b] transition-colors group"
                            >
                              {/* Product Thumbnail & Name */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={
                                      product.thumbnail_url ||
                                      product.image_url ||
                                      SIVORA_FALLBACK_IMG
                                    }
                                    alt={product.name}
                                    onError={(e) => {
                                      const target = e.currentTarget;
                                      if (target.src !== SIVORA_FALLBACK_IMG) {
                                        target.src = SIVORA_FALLBACK_IMG;
                                      }
                                    }}
                                    className="h-11 w-11 rounded-xl object-cover border border-[#caa14d]/40 shadow-xs flex-shrink-0 bg-[#fdf8ee] dark:bg-[#1c202e]"
                                  />
                                  <div className="min-w-0 max-w-md">
                                    <p className="font-bold text-[#382604] dark:text-[#f8edd1] line-clamp-1 group-hover:text-[#875c08] dark:group-hover:text-amber-300 transition-colors">
                                      {product.name}
                                    </p>
                                    <p className="text-[11px] text-[#735211] dark:text-[#caa14d] font-mono mt-0.5">
                                      ID: #{product.id}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Department Badge */}
                              <td className="py-3 px-4">
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${getDeptBadgeStyle(
                                    catName
                                  )}`}
                                >
                                  {catName}
                                </span>
                              </td>

                              {/* Price in ₹ */}
                              <td className="py-3 px-4 font-black text-[#402d08] dark:text-amber-200">
                                ₹{Number(product.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>

                              {/* Stock status badge */}
                              <td className="py-3 px-4">
                                {product.stock === 0 ? (
                                  <Badge variant="danger">Out of Stock</Badge>
                                ) : product.stock < 5 ? (
                                  <Badge variant="warning">{product.stock} units left</Badge>
                                ) : (
                                  <Badge variant="success">{product.stock} in stock</Badge>
                                )}
                              </td>

                              {/* Actions: Edit & Delete */}
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    data-testid={`edit-product-${product.id}`}
                                    onClick={() => handleOpenEdit(product)}
                                    className="border-[#caa353] dark:border-[#caa14d]/40 text-[#705014] dark:text-[#eedba2] bg-white dark:bg-[#1a1e2b] hover:bg-[#caa353]/15 dark:hover:bg-[#caa14d]/25 text-xs px-2.5 py-1 rounded-lg gap-1 cursor-pointer font-bold shadow-xs"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                    <span>Edit</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    data-testid={`delete-product-${product.id}`}
                                    onClick={() => setDeletingProductId(product.id)}
                                    className="border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-400 bg-white dark:bg-[#1a1e2b] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs px-2.5 py-1 rounded-lg gap-1 cursor-pointer font-bold shadow-xs"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>Delete</span>
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Strip */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-[#fdfbf6] dark:bg-[#181b26] border-t border-[#e2cc94] dark:border-[#caa14d]/30 text-xs font-bold text-[#634509] dark:text-[#eedba2]">
                    <span>
                      Page {currentPage} of {totalPages} ({filteredProducts.length} items total)
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 rounded-lg border border-[#caa353]/50 dark:border-[#caa14d]/40 bg-white dark:bg-[#141722] text-[#634509] dark:text-[#eedba2] hover:bg-[#caa353]/15 dark:hover:bg-[#caa14d]/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Prev
                      </button>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum = currentPage - 2 + i;
                        if (pageNum < 1) pageNum = i + 1;
                        if (pageNum > totalPages) return null;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                              currentPage === pageNum
                                ? 'bg-[#503706] dark:bg-[#caa14d] text-amber-100 dark:text-[#1c1204] border border-[#caa353]'
                                : 'border border-[#caa353]/40 dark:border-[#caa14d]/30 bg-white dark:bg-[#141722] hover:bg-[#caa353]/10 dark:hover:bg-[#caa14d]/20 text-[#634509] dark:text-[#eedba2]'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 rounded-lg border border-[#caa353]/50 dark:border-[#caa14d]/40 bg-white dark:bg-[#141722] text-[#634509] dark:text-[#eedba2] hover:bg-[#caa353]/15 dark:hover:bg-[#caa14d]/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                      >
                        Next <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 2: ORDER MANAGEMENT
        ══════════════════════════════════════════════════ */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 dark:bg-[#141722]/90 p-4 rounded-2xl border border-[#e2cc94] dark:border-[#caa14d]/30 shadow-xs">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#a1781c]" />
                <span className="text-xs font-bold text-[#735211] dark:text-[#caa14d] uppercase tracking-wider">
                  Filter by Status:
                </span>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl border border-[#caa353]/60 dark:border-[#caa14d]/40 bg-[#fdfbf6] dark:bg-[#1a1e2b] text-[#402d08] dark:text-[#f8edd1] focus:outline-none focus:ring-2 focus:ring-[#a1781c]/50"
                >
                  <option value="all">All Orders ({ordersList.length})</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchOrders()}
                className="border-[#caa353] dark:border-[#caa14d]/40 text-[#634509] dark:text-[#eedba2] bg-white dark:bg-[#1a1e2b] hover:bg-[#caa353]/15 dark:hover:bg-[#caa14d]/20 rounded-xl font-bold uppercase tracking-wider text-xs px-3.5 py-1.5 cursor-pointer shadow-xs"
              >
                <RotateCcw className="h-4 w-4 mr-1.5 text-[#a1781c]" />
                Refresh Orders
              </Button>
            </div>

            {isOrdersLoading ? (
              <div className="py-24 text-center bg-white/70 dark:bg-[#141722]/70 rounded-2xl border border-[#e2cc94] dark:border-[#caa14d]/30">
                <LoadingSpinner size="lg" text="Loading customer orders..." />
              </div>
            ) : (
              <div className="bg-white dark:bg-[#141722] rounded-2xl border border-[#e2cc94] dark:border-[#caa14d]/30 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-[#402d08] dark:text-[#f8edd1]">
                    <thead className="bg-[#f9f3e4] dark:bg-[#1a1e2b] text-[11px] uppercase font-bold tracking-widest text-[#705014] dark:text-[#eedba2] border-b border-[#e5cf96] dark:border-[#caa14d]/30">
                      <tr>
                        <th className="py-3.5 px-4">Order ID</th>
                        <th className="py-3.5 px-4">Customer ID</th>
                        <th className="py-3.5 px-4">Date Placed</th>
                        <th className="py-3.5 px-4">Items</th>
                        <th className="py-3.5 px-4">Total</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Update Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f2e6cb] dark:divide-[#242938]">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-16 text-center text-[#805e1a] dark:text-[#caa14d]">
                            <ShoppingCart className="w-10 h-10 mx-auto text-[#caa353] mb-2 opacity-60" />
                            <p className="font-semibold">No orders found matching the selected filter.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => (
                          <tr
                            key={order.id}
                            className="hover:bg-[#fbf7ed] dark:hover:bg-[#1a1e2b] transition-colors"
                          >
                            <td className="py-3.5 px-4 font-bold text-[#402d08] dark:text-[#f8edd1] font-mono">
                              #ORD-{order.id}
                            </td>
                            <td className="py-3.5 px-4 text-xs font-mono text-[#735211] dark:text-[#caa14d]">
                              User #{order.user_id}
                            </td>
                            <td className="py-3.5 px-4 text-xs text-[#735211] dark:text-[#caa14d]">
                              {new Date(order.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 px-4 text-xs font-medium">
                              {order.items?.length || 0} line item{order.items?.length !== 1 ? 's' : ''}
                            </td>
                            <td className="py-3.5 px-4 font-black text-[#402d08] dark:text-amber-200">
                              ₹{Number(order.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3.5 px-4">
                              <Badge
                                variant={
                                  order.status === 'delivered'
                                    ? 'success'
                                    : order.status === 'cancelled'
                                    ? 'danger'
                                    : order.status === 'pending'
                                    ? 'warning'
                                    : 'info'
                                }
                              >
                                {order.status.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <select
                                value={order.status}
                                data-testid={`status-select-${order.id}`}
                                onChange={(e) =>
                                  handleStatusChange(order.id, e.target.value as OrderStatus)
                                }
                                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-[#caa353]/60 dark:border-[#caa14d]/40 bg-[#fdfbf6] dark:bg-[#1a1e2b] text-[#402d08] dark:text-[#f8edd1] focus:ring-2 focus:ring-[#caa353] cursor-pointer"
                              >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 3: ANALYTICS & KPIS
        ══════════════════════════════════════════════════ */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Revenue */}
              <div className="bg-white dark:bg-[#141722] p-5 rounded-2xl border-l-4 border-l-emerald-600 border border-[#e2cc94] dark:border-[#caa14d]/30 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-[#805e1a] dark:text-[#caa14d] uppercase tracking-wider">
                      Total Revenue
                    </p>
                    <h3 className="text-2xl font-black text-[#402d08] dark:text-[#f8edd1] mt-1">
                      ₹{Number(totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/40">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Total Orders */}
              <div className="bg-white dark:bg-[#141722] p-5 rounded-2xl border-l-4 border-l-[#caa353] border border-[#e2cc94] dark:border-[#caa14d]/30 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-[#805e1a] dark:text-[#caa14d] uppercase tracking-wider">
                      Total Orders
                    </p>
                    <h3 className="text-2xl font-black text-[#402d08] dark:text-[#f8edd1] mt-1">
                      {totalOrdersCount}
                    </h3>
                  </div>
                  <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#875c08] dark:text-amber-300 flex items-center justify-center border border-amber-200 dark:border-amber-800/40">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Active Catalog */}
              <div className="bg-white dark:bg-[#141722] p-5 rounded-2xl border-l-4 border-l-[#503706] dark:border-l-amber-400 border border-[#e2cc94] dark:border-[#caa14d]/30 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-[#805e1a] dark:text-[#caa14d] uppercase tracking-wider">
                      Active Catalog
                    </p>
                    <h3 className="text-2xl font-black text-[#402d08] dark:text-[#f8edd1] mt-1">
                      {activeProductsCount} Items
                    </h3>
                  </div>
                  <div className="h-11 w-11 rounded-xl bg-[#fdf5e2] dark:bg-[#1a1e2b] text-[#503706] dark:text-amber-200 flex items-center justify-center border border-[#caa353]/50 dark:border-[#caa14d]/40">
                    <Package className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Low Stock Alerts */}
              <div className="bg-white dark:bg-[#141722] p-5 rounded-2xl border-l-4 border-l-amber-500 border border-[#e2cc94] dark:border-[#caa14d]/30 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-[#805e1a] dark:text-[#caa14d] uppercase tracking-wider">
                      Low Stock Alerts
                    </p>
                    <h3 className="text-2xl font-black text-[#402d08] dark:text-[#f8edd1] mt-1">
                      {lowStockProducts.length}
                    </h3>
                  </div>
                  <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 flex items-center justify-center border border-amber-200 dark:border-amber-800/40">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory Depletion Radar */}
            <div className="bg-white dark:bg-[#141722] rounded-2xl border border-[#e2cc94] dark:border-[#caa14d]/30 shadow-xs p-6">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <h3 className="text-lg font-black text-[#402d08] dark:text-[#f8edd1] uppercase tracking-wide">
                  Inventory Depletion Radar
                </h3>
              </div>
              <p className="text-xs text-[#735211] dark:text-[#eedba2] mb-5">
                Catalog fashion garments requiring immediate inventory replenishment.
              </p>

              {lowStockProducts.length === 0 ? (
                <div className="py-10 text-center text-[#805e1a] dark:text-[#caa14d] text-sm bg-[#fcf9f2] dark:bg-[#181b26] rounded-xl border border-[#e2cc94]/60 dark:border-[#caa14d]/30">
                  All SIVORA fashion apparel lines are adequately stocked above inventory safety thresholds.
                </div>
              ) : (
                <div className="divide-y divide-[#f2e6cb] dark:divide-[#242938]">
                  {lowStockProducts.slice(0, 10).map((p) => (
                    <div
                      key={p.id}
                      className="py-3.5 flex items-center justify-between gap-4 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={p.thumbnail_url || p.image_url || SIVORA_FALLBACK_IMG}
                          alt={p.name}
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (target.src !== SIVORA_FALLBACK_IMG) {
                              target.src = SIVORA_FALLBACK_IMG;
                            }
                          }}
                          className="h-10 w-10 rounded-lg object-cover border border-[#caa14d]/40 shadow-xs"
                        />
                        <div>
                          <p className="font-bold text-[#402d08] dark:text-[#f8edd1]">{p.name}</p>
                          <p className="text-xs text-[#735211] dark:text-[#caa14d]">
                            Department: {p.category?.name || 'General'} • ID: #{p.id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={p.stock === 0 ? 'danger' : 'warning'}>
                          {p.stock === 0 ? 'Out of Stock' : `${p.stock} units left`}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(p)}
                          className="text-xs border-[#caa353] dark:border-[#caa14d]/40 text-[#705014] dark:text-[#eedba2] bg-white dark:bg-[#1a1e2b] hover:bg-[#caa353]/15 dark:hover:bg-[#caa14d]/20 font-bold rounded-lg cursor-pointer"
                        >
                          Restock
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 4: ASYNC TASKS & BULK OPERATIONS
        ══════════════════════════════════════════════════ */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <BackgroundTasksPage isEmbedded={true} />
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════
          CREATE PRODUCT MODAL
      ══════════════════════════════════════════════════ */}
      {isCreateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
        >
          <div className="bg-[#fdfbf6] dark:bg-[#141722] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#caa353] dark:border-[#caa14d]/40 animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xl font-black text-[#402d08] dark:text-[#f8edd1] tracking-tight uppercase font-serif">
                Add New Product to Catalog
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-[#735211] dark:text-[#eedba2] mb-5">
              Add a luxury fashion item to the Atelier SIVORA catalog. Validated via Zod &amp; persisted directly to PostgreSQL.
            </p>

            <form onSubmit={handleSubmitCreate(onSubmitCreate)} className="space-y-4">
              <Input
                label="Product Title"
                placeholder="e.g. Pure Zari Kanchipuram Silk Saree"
                error={createErrors.name?.message}
                {...registerCreate('name')}
              />

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#543b09] dark:text-[#eedba2] uppercase tracking-wider">
                    Description
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAiTargetForm('create');
                      setAiModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#875c08] dark:text-amber-400 hover:text-[#503706] dark:hover:text-amber-200 transition-colors cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Generate with AI
                  </button>
                </div>
                <textarea
                  rows={3}
                  placeholder="Detailed specifications, weave, fabric composition, and luxury hallmarks..."
                  className="block w-full rounded-xl border border-[#caa353]/60 dark:border-[#caa14d]/40 bg-white dark:bg-[#1a1e2b] p-3 text-xs sm:text-sm text-[#402d08] dark:text-[#f8edd1] placeholder:text-[#91712a]/60 dark:placeholder:text-[#a88a4e]/60 focus:outline-none focus:ring-2 focus:ring-[#a1781c]/50"
                  {...registerCreate('description')}
                />
                {createErrors.description?.message && (
                  <p className="mt-1 text-xs text-rose-600">{createErrors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Price (₹)"
                  type="number"
                  step="0.01"
                  placeholder="2999.00"
                  error={createErrors.price?.message}
                  {...registerCreate('price')}
                />
                <Input
                  label="Initial Stock Units"
                  type="number"
                  placeholder="15"
                  error={createErrors.stock?.message}
                  {...registerCreate('stock')}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#543b09] dark:text-[#eedba2] uppercase tracking-wider mb-1">
                  Department / Category
                </label>
                <select
                  {...registerCreate('category_id')}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-[#caa353]/60 dark:border-[#caa14d]/40 bg-white dark:bg-[#1a1e2b] text-[#402d08] dark:text-[#f8edd1] focus:outline-none focus:ring-2 focus:ring-[#a1781c]/50 font-medium"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {createErrors.category_id && (
                  <p className="text-xs text-red-500 mt-1">{createErrors.category_id.message}</p>
                )}
              </div>

              <Input
                label="Image URL"
                placeholder="https://images.unsplash.com/..."
                error={createErrors.image_url?.message}
                {...registerCreate('image_url')}
              />

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e2cc94] dark:border-[#caa14d]/30">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="border-[#caa353] dark:border-[#caa14d]/40 text-[#634509] dark:text-[#eedba2] bg-white dark:bg-[#1a1e2b] hover:bg-[#caa353]/15 dark:hover:bg-[#caa14d]/20 rounded-xl font-bold uppercase tracking-wider text-xs px-4 py-2 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={isCreating}
                  data-testid="save-new-product-btn"
                  className="bg-[#503706] dark:bg-[#caa14d] hover:bg-[#382604] dark:hover:bg-[#dfb55c] text-amber-100 dark:text-[#1c1204] border border-[#caa353] rounded-xl font-bold uppercase tracking-wider text-xs px-5 py-2 cursor-pointer shadow-md"
                >
                  Save Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          EDIT PRODUCT MODAL
      ══════════════════════════════════════════════════ */}
      {editingProduct && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
        >
          <div className="bg-[#fdfbf6] dark:bg-[#141722] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#caa353] dark:border-[#caa14d]/40 animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xl font-black text-[#402d08] dark:text-[#f8edd1] tracking-tight uppercase font-serif">
                Edit Product #{editingProduct.id}
              </h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-[#735211] dark:text-[#eedba2] mb-5">
              Update pricing, inventory stock availability, garment specs or high-res photo URL.
            </p>

            <form onSubmit={handleSubmitEdit(onSubmitEdit)} className="space-y-4">
              <Input
                label="Product Title"
                placeholder="e.g. Ergonomic Keyboard"
                error={editErrors.name?.message}
                {...registerEdit('name')}
              />

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#543b09] dark:text-[#eedba2] uppercase tracking-wider">
                    Description
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAiTargetForm('edit');
                      setAiModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#875c08] dark:text-amber-400 hover:text-[#503706] dark:hover:text-amber-200 transition-colors cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Generate with AI
                  </button>
                </div>
                <textarea
                  rows={3}
                  placeholder="Detailed specifications and key features..."
                  className="block w-full rounded-xl border border-[#caa353]/60 dark:border-[#caa14d]/40 bg-white dark:bg-[#1a1e2b] p-3 text-xs sm:text-sm text-[#402d08] dark:text-[#f8edd1] placeholder:text-[#91712a]/60 dark:placeholder:text-[#a88a4e]/60 focus:outline-none focus:ring-2 focus:ring-[#a1781c]/50"
                  {...registerEdit('description')}
                />
                {editErrors.description?.message && (
                  <p className="mt-1 text-xs text-rose-600">{editErrors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Price (₹)"
                  type="number"
                  step="0.01"
                  placeholder="99.99"
                  error={editErrors.price?.message}
                  {...registerEdit('price')}
                />
                <Input
                  label="Stock Units"
                  type="number"
                  placeholder="15"
                  error={editErrors.stock?.message}
                  {...registerEdit('stock')}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#543b09] dark:text-[#eedba2] uppercase tracking-wider mb-1">
                  Department / Category
                </label>
                <select
                  {...registerEdit('category_id')}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-[#caa353]/60 dark:border-[#caa14d]/40 bg-white dark:bg-[#1a1e2b] text-[#402d08] dark:text-[#f8edd1] focus:outline-none focus:ring-2 focus:ring-[#a1781c]/50 font-medium"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {editErrors.category_id && (
                  <p className="text-xs text-red-500 mt-1">{editErrors.category_id.message}</p>
                )}
              </div>

              <Input
                label="Image URL"
                placeholder="https://..."
                error={editErrors.image_url?.message}
                {...registerEdit('image_url')}
              />

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e2cc94] dark:border-[#caa14d]/30">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingProduct(null)}
                  className="border-[#caa353] dark:border-[#caa14d]/40 text-[#634509] dark:text-[#eedba2] bg-white dark:bg-[#1a1e2b] hover:bg-[#caa353]/15 dark:hover:bg-[#caa14d]/20 rounded-xl font-bold uppercase tracking-wider text-xs px-4 py-2 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={isUpdating}
                  data-testid="save-edit-product-btn"
                  className="bg-[#503706] dark:bg-[#caa14d] hover:bg-[#382604] dark:hover:bg-[#dfb55c] text-amber-100 dark:text-[#1c1204] border border-[#caa353] rounded-xl font-bold uppercase tracking-wider text-xs px-5 py-2 cursor-pointer shadow-md"
                >
                  Update Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          DELETE CONFIRMATION MODAL
      ══════════════════════════════════════════════════ */}
      {deletingProductId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div className="bg-[#fdfbf6] dark:bg-[#141722] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#caa353] dark:border-[#caa14d]/40 text-center">
            <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-300 dark:border-rose-800/50">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-[#402d08] dark:text-[#f8edd1] uppercase tracking-wide mb-2">
              Confirm Delete Product
            </h3>
            <p className="text-xs text-[#735211] dark:text-[#eedba2] mb-6">
              Are you sure you want to permanently remove product #{deletingProductId} from the catalog? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingProductId(null)}
                className="border-[#caa353] dark:border-[#caa14d]/40 text-[#634509] dark:text-[#eedba2] bg-white dark:bg-[#1a1e2b] hover:bg-[#caa353]/15 dark:hover:bg-[#caa14d]/20 rounded-xl font-bold uppercase tracking-wider text-xs px-4 py-2 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                data-testid="confirm-delete-btn"
                onClick={() => handleDeleteProduct(deletingProductId)}
                className="bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold uppercase tracking-wider text-xs px-4 py-2 cursor-pointer shadow-md"
              >
                Delete Product
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          AI PRODUCT DESCRIPTION GENERATOR MODAL
      ══════════════════════════════════════════════════ */}
      <AIDescriptionModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        productName={aiTargetForm === 'create' ? watchCreate('name') || '' : watchEdit('name') || ''}
        category={
          categories.find(
            (c) =>
              c.id ===
              (aiTargetForm === 'create'
                ? Number(watchCreate('category_id'))
                : Number(watchEdit('category_id')))
          )?.name || 'General'
        }
        price={
          aiTargetForm === 'create'
            ? Number(watchCreate('price'))
            : Number(watchEdit('price'))
        }
        onApplyDescription={(desc) => {
          if (aiTargetForm === 'create') {
            setValueCreate('description', desc);
          } else {
            setValueEdit('description', desc);
          }
        }}
      />
    </div>
  );
};

export default AdminPage;

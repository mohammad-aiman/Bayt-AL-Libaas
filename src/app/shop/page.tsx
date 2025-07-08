'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Product, Category } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'react-hot-toast';
import { 
  Filter, 
  Search, 
  SlidersHorizontal, 
  Grid, 
  List, 
  X, 
  ChevronDown,
  Star,
  Heart,
  Eye,
  ShoppingCart
} from 'lucide-react';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    sort: 'createdAt',
    order: 'desc',
    minPrice: '',
    maxPrice: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 12,
  });

  const searchParams = useSearchParams();
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    // Get initial filters from URL
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    
    if (categoryParam) {
      setFilters(prev => ({ ...prev, category: categoryParam }));
    }
    if (searchParam) {
      setFilters(prev => ({ ...prev, search: searchParam }));
    }
    
    fetchCategories();
    fetchProducts();
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [filters, pagination.page]);

  // Prevent body scroll when mobile filters are open
  useEffect(() => {
    if (showMobileFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileFilters]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sort: filters.sort,
        order: filters.order,
        ...(filters.category && { category: filters.category }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(`/api/products?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data);
        setPagination(prev => ({
          ...prev,
          pages: data.pagination.pages,
          total: data.pagination.total,
        }));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: product.sizes[0],
      color: product.colors[0],
      quantity: 1,
    });
    toast.success('Added to cart!', {
      duration: 2000,
      position: 'top-center',
    });
  };

  const toggleFavorite = (productId: string) => {
    setFavoriteIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
        toast.success('Removed from favorites', { duration: 1500 });
      } else {
        newSet.add(productId);
        toast.success('Added to favorites', { duration: 1500 });
      }
      return newSet;
    });
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      search: '',
      sort: 'createdAt',
      order: 'desc',
      minPrice: '',
      maxPrice: '',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="mobile:block sm:block md:hidden bg-white shadow-mobile border-b border-gray-200">
        <div className="px-4 py-4">
          <h1 className="text-mobile-2xl font-bold text-gray-900">Shop</h1>
          <p className="mt-1 text-mobile-sm text-gray-600">
            Discover our latest collection of women's fashion
          </p>
        </div>

        {/* Mobile Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-mobile-lg focus:ring-2 focus:ring-accent-purple-500 focus:border-transparent text-mobile-base"
              placeholder="Search products..."
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Mobile Action Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-mobile text-mobile-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-touch"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-mobile ${viewMode === 'grid' ? 'bg-accent-purple-100 text-accent-purple-600' : 'bg-white text-gray-600'} border border-gray-300 min-h-touch min-w-touch flex items-center justify-center`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-mobile ${viewMode === 'list' ? 'bg-accent-purple-100 text-accent-purple-600' : 'bg-white text-gray-600'} border border-gray-300 min-h-touch min-w-touch flex items-center justify-center`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="mobile:hidden md:block bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Shop</h1>
          <p className="mt-2 text-gray-600">
            Discover our latest collection of women's fashion
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mobile:px-0 sm:px-4 lg:px-8 mobile:py-0 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="mobile:hidden lg:block w-full lg:w-64 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Filters
              </h3>

              {/* Search */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-purple-500"
                  placeholder="Search products..."
                />
              </div>

              {/* Categories */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-purple-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={`${filters.sort}-${filters.order}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-');
                    handleFilterChange('sort', sort);
                    handleFilterChange('order', order);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-purple-500"
                >
                  <option value="createdAt-desc">Latest</option>
                  <option value="createdAt-asc">Oldest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Mobile Filters Modal */}
          {showMobileFilters && (
            <div className="mobile:block lg:hidden fixed inset-0 z-mobile-modal-backdrop bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)} />
          )}

          <div className={`mobile-filters mobile:block lg:hidden fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-mobile-modal transform transition-transform duration-300 ease-in-out ${
            showMobileFilters ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="flex flex-col h-full">
              {/* Mobile Filters Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 rounded-mobile text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 min-h-touch min-w-touch flex items-center justify-center"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Mobile Filters Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Categories */}
                <div>
                  <label className="block text-mobile-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                    Category
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        handleFilterChange('category', '');
                        setShowMobileFilters(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-mobile transition-colors min-h-touch ${
                        filters.category === '' 
                          ? 'bg-accent-purple-100 text-accent-purple-700 font-medium' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category._id}
                        onClick={() => {
                          handleFilterChange('category', category._id);
                          setShowMobileFilters(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-mobile transition-colors min-h-touch ${
                          filters.category === category._id 
                            ? 'bg-accent-purple-100 text-accent-purple-700 font-medium' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-mobile-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                    Sort By
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'createdAt-desc', label: 'Latest' },
                      { value: 'createdAt-asc', label: 'Oldest' },
                      { value: 'price-asc', label: 'Price: Low to High' },
                      { value: 'price-desc', label: 'Price: High to Low' },
                      { value: 'name-asc', label: 'Name: A to Z' },
                      { value: 'name-desc', label: 'Name: Z to A' },
                    ].map((option) => {
                      const currentSort = `${filters.sort}-${filters.order}`;
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            const [sort, order] = option.value.split('-');
                            handleFilterChange('sort', sort);
                            handleFilterChange('order', order);
                            setShowMobileFilters(false);
                          }}
                          className={`w-full text-left px-4 py-3 rounded-mobile transition-colors min-h-touch ${
                            currentSort === option.value 
                              ? 'bg-accent-purple-100 text-accent-purple-700 font-medium' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Mobile Filters Footer */}
              <div className="border-t border-gray-200 p-4 space-y-3">
                <button
                  onClick={() => {
                    clearFilters();
                    setShowMobileFilters(false);
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-mobile-lg hover:bg-gray-200 transition-colors font-medium min-h-touch"
                >
                  Clear All Filters
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full bg-accent-purple-600 text-white py-3 px-4 rounded-mobile-lg hover:bg-accent-purple-700 transition-colors font-medium min-h-touch"
                >
                  Show Results ({pagination.total})
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className={`grid mobile:p-4 ${
                viewMode === 'grid' 
                  ? 'mobile:grid-cols-2 mobile:gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-3 lg:gap-6' 
                  : 'grid-cols-1 gap-4'
              }`}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-mobile-lg shadow-mobile animate-pulse overflow-hidden">
                    <div className="mobile:h-48 sm:h-64 bg-gray-300" />
                    <div className="p-4">
                      <div className="h-4 bg-gray-300 rounded mb-2" />
                      <div className="h-4 bg-gray-300 rounded w-2/3 mb-2" />
                      <div className="h-4 bg-gray-300 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Results Info */}
                <div className="mobile:hidden lg:flex justify-between items-center mb-6">
                  <p className="text-gray-600">
                    Showing {products.length} of {pagination.total} products
                  </p>
                </div>

                {/* Products Grid */}
                <div className={`grid mobile:p-4 ${
                  viewMode === 'grid' 
                    ? 'mobile:grid-cols-2 mobile:gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-3 lg:gap-6' 
                    : 'grid-cols-1 gap-4'
                }`}>
                  {products.map((product) => (
                    <div 
                      key={product._id} 
                      className={`group bg-white mobile:rounded-mobile-lg mobile:shadow-mobile hover:shadow-mobile-lg sm:rounded-lg sm:shadow-sm sm:hover:shadow-lg transition-all duration-300 overflow-hidden ${
                        viewMode === 'list' ? 'flex items-center p-4 space-x-4' : ''
                      }`}
                    >
                      {viewMode === 'grid' ? (
                        // Grid View
                        <>
                          <div className="mobile:aspect-mobile-product sm:aspect-w-1 sm:aspect-h-1 w-full overflow-hidden mobile:rounded-t-mobile-lg sm:rounded-t-lg bg-gray-200 relative">
                            <Link href={`/products/${product.slug}`}>
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                width={400}
                                height={400}
                                className="mobile:h-48 sm:h-64 w-full object-cover hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 33vw"
                              />
                            </Link>
                            
                            {product.discountPrice && (
                              <div className="absolute mobile:top-2 mobile:left-2 mobile:bg-red-500 mobile:text-white mobile:px-2 mobile:py-1 mobile:rounded-mobile mobile:text-mobile-xs mobile:font-bold sm:top-2 sm:left-2 sm:bg-red-500 sm:text-white sm:px-2 sm:py-1 sm:rounded-md sm:text-sm sm:font-medium">
                                SALE
                              </div>
                            )}

                            {/* Mobile Action Overlay */}
                            <div className="mobile:absolute mobile:inset-0 mobile:bg-black/20 mobile:opacity-0 group-hover:opacity-100 mobile:transition-opacity mobile:duration-300 mobile:flex mobile:items-center mobile:justify-center mobile:space-x-2 lg:opacity-0 lg:group-hover:opacity-100">
                              <Link
                                href={`/products/${product.slug}`}
                                className="mobile:bg-white mobile:text-gray-900 mobile:p-2 mobile:rounded-full mobile:shadow-mobile-lg mobile:hover:bg-gray-100 mobile:transition-colors mobile:transform mobile:scale-0 group-hover:scale-100 mobile:transition-transform mobile:duration-200 sm:p-3"
                                title="Quick View"
                              >
                                <Eye className="mobile:w-4 mobile:h-4 sm:w-5 sm:h-5" />
                              </Link>
                              
                              <button
                                onClick={() => toggleFavorite(product._id)}
                                className={`mobile:p-2 mobile:rounded-full mobile:shadow-mobile-lg mobile:transition-all mobile:duration-200 mobile:transform mobile:scale-0 group-hover:scale-100 sm:p-3 ${
                                  favoriteIds.has(product._id)
                                    ? 'bg-red-500 text-white'
                                    : 'bg-white text-gray-900 hover:bg-gray-100'
                                }`}
                                title="Add to Wishlist"
                              >
                                <Heart className={`mobile:w-4 mobile:h-4 sm:w-5 sm:h-5 ${favoriteIds.has(product._id) ? 'fill-current' : ''}`} />
                              </button>

                              <button
                                onClick={() => handleAddToCart(product)}
                                disabled={product.stock === 0}
                                className="mobile:bg-accent-purple-600 mobile:text-white mobile:p-2 mobile:rounded-full mobile:shadow-mobile-lg mobile:hover:bg-accent-purple-700 mobile:transition-colors mobile:transform mobile:scale-0 group-hover:scale-100 mobile:transition-transform mobile:duration-200 mobile:disabled:bg-gray-400 mobile:disabled:cursor-not-allowed sm:p-3"
                                title="Add to Cart"
                              >
                                <ShoppingCart className="mobile:w-4 mobile:h-4 sm:w-5 sm:h-5" />
                              </button>
                            </div>
                          </div>

                          <div className="mobile:p-3 sm:p-4">
                            <Link href={`/products/${product.slug}`}>
                              <h3 className="mobile:text-mobile-base mobile:font-medium mobile:text-gray-900 mobile:hover:text-accent-purple-600 mobile:transition-colors mobile:line-clamp-2 sm:text-lg sm:font-medium sm:text-gray-900 sm:hover:text-accent-purple-600 sm:transition-colors">
                                {product.name}
                              </h3>
                            </Link>
                            
                            <div className="mobile:mt-2 mobile:flex mobile:items-center sm:mt-2 sm:flex sm:items-center">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`mobile:w-3 mobile:h-3 sm:w-4 sm:h-4 ${
                                      i < Math.floor(product.rating)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="mobile:ml-2 mobile:text-mobile-xs mobile:text-gray-600 sm:ml-2 sm:text-sm sm:text-gray-600">
                                ({product.numReviews})
                              </span>
                            </div>

                            <div className="mobile:mt-2 mobile:flex mobile:items-center mobile:justify-between sm:mt-2 sm:flex sm:items-center sm:justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="mobile:text-mobile-lg mobile:font-bold mobile:text-gray-900 sm:text-xl sm:font-bold sm:text-gray-900">
                                  ৳{product.price}
                                </span>
                                {product.discountPrice && (
                                  <span className="mobile:text-mobile-sm mobile:text-gray-500 mobile:line-through sm:text-sm sm:text-gray-500 sm:line-through">
                                    ৳{product.discountPrice}
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => handleAddToCart(product)}
                              disabled={product.stock === 0}
                              className="mobile:mt-3 mobile:w-full mobile:bg-accent-purple-600 mobile:text-white mobile:py-2 mobile:px-4 mobile:rounded-mobile mobile:hover:bg-accent-purple-700 mobile:transition-colors mobile:disabled:bg-gray-300 mobile:disabled:cursor-not-allowed mobile:text-mobile-sm mobile:font-medium mobile:min-h-touch sm:mt-3 sm:w-full sm:bg-accent-purple-600 sm:text-white sm:py-2 sm:px-4 sm:rounded-md sm:hover:bg-accent-purple-700 sm:transition-colors sm:disabled:bg-gray-300 sm:disabled:cursor-not-allowed"
                            >
                              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                          </div>
                        </>
                      ) : (
                        // List View
                        <>
                          <div className="flex-shrink-0">
                            <Link href={`/products/${product.slug}`}>
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                width={120}
                                height={120}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            </Link>
                          </div>
                          
                          <div className="flex-1">
                            <Link href={`/products/${product.slug}`}>
                              <h3 className="text-lg font-medium text-gray-900 hover:text-accent-purple-600 transition-colors">
                                {product.name}
                              </h3>
                            </Link>
                            
                            <div className="mt-1 flex items-center">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < Math.floor(product.rating)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="ml-2 text-sm text-gray-600">
                                ({product.numReviews})
                              </span>
                            </div>

                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-xl font-bold text-gray-900">
                                  ৳{product.price}
                                </span>
                                {product.discountPrice && (
                                  <span className="text-sm text-gray-500 line-through">
                                    ৳{product.discountPrice}
                                  </span>
                                )}
                              </div>
                              
                              <button
                                onClick={() => handleAddToCart(product)}
                                disabled={product.stock === 0}
                                className="bg-accent-purple-600 text-white px-4 py-2 rounded-md hover:bg-accent-purple-700 transition-colors text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                              >
                                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="mobile:flex mobile:justify-center mobile:mt-8 mobile:px-4 mobile:pb-4 sm:flex sm:justify-center sm:mt-12">
                    <nav className="flex space-x-2">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                        disabled={pagination.page === 1}
                        className="mobile:px-3 mobile:py-2 mobile:bg-white mobile:border mobile:border-gray-300 mobile:rounded-mobile mobile:hover:bg-gray-50 mobile:disabled:opacity-50 mobile:disabled:cursor-not-allowed mobile:text-mobile-sm mobile:min-h-touch sm:px-3 sm:py-2 sm:bg-white sm:border sm:border-gray-300 sm:rounded-md sm:hover:bg-gray-50 sm:disabled:opacity-50 sm:disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {[...Array(pagination.pages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                          className={`mobile:px-3 mobile:py-2 mobile:border mobile:border-gray-300 mobile:rounded-mobile mobile:text-mobile-sm mobile:min-h-touch sm:px-3 sm:py-2 sm:border sm:border-gray-300 sm:rounded-md ${
                            pagination.page === i + 1
                              ? 'bg-accent-purple-600 text-white border-accent-purple-600'
                              : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                        disabled={pagination.page === pagination.pages}
                        className="mobile:px-3 mobile:py-2 mobile:bg-white mobile:border mobile:border-gray-300 mobile:rounded-mobile mobile:hover:bg-gray-50 mobile:disabled:opacity-50 mobile:disabled:cursor-not-allowed mobile:text-mobile-sm mobile:min-h-touch sm:px-3 sm:py-2 sm:bg-white sm:border sm:border-gray-300 sm:rounded-md sm:hover:bg-gray-50 sm:disabled:opacity-50 sm:disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
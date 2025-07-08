'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  TrendingUp, 
  Star, 
  StarOff, 
  Package, 
  ShoppingCart, 
  Eye,
  Edit,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  BarChart3,
  DollarSign,
  Users,
  Activity
} from 'lucide-react';

interface TrendingProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  category: {
    _id: string;
    name: string;
  };
  stock: number;
  sold: number;
  rating: number;
  numReviews: number;
  isFeatured: boolean;
  isActive: boolean;
}

interface TrendingStats {
  totalSales: number;
  averageRating: number;
  totalStock: number;
  totalProducts: number;
}

interface TrendingData {
  products: TrendingProduct[];
  stats: TrendingStats;
  pagination: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
}

export default function TrendingProductsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [data, setData] = useState<TrendingData | null>(null);
  const [allProducts, setAllProducts] = useState<TrendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (session.user?.role !== 'admin') {
      router.push('/');
      toast.error('Access denied. Admin only.');
      return;
    }

    fetchTrendingData();
    fetchAllProducts();
  }, [session, router]);

  const fetchTrendingData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/trending');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        toast.error(result.message || 'Failed to fetch trending data');
      }
    } catch (error) {
      console.error('Error fetching trending data:', error);
      toast.error('Failed to fetch trending data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const response = await fetch('/api/admin/products?limit=100');
      const result = await response.json();

      if (result.success) {
        // Filter out already featured products
        const nonFeaturedProducts = result.data.filter(
          (product: TrendingProduct) => !product.isFeatured
        );
        setAllProducts(nonFeaturedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleToggleFeatured = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'toggleFeatured' }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        fetchTrendingData();
        fetchAllProducts();
      } else {
        toast.error(result.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error toggling featured status:', error);
      toast.error('Failed to update product');
    }
  };

  const handleAddToTrending = async () => {
    if (selectedProducts.length === 0) {
      toast.error('Please select products to add');
      return;
    }

    try {
      const response = await fetch('/api/admin/trending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addMultiple',
          productIds: selectedProducts,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Products added to trending successfully');
        setSelectedProducts([]);
        setShowAddModal(false);
        fetchTrendingData();
        fetchAllProducts();
      } else {
        toast.error(result.message || 'Failed to add products');
      }
    } catch (error) {
      console.error('Error adding products to trending:', error);
      toast.error('Failed to add products');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
    }).format(amount);
  };

  if (!session || session.user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trending Products</h1>
            <p className="text-gray-600">Manage featured products displayed on the homepage</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add to Trending
          </button>
        </div>

        {/* Stats Cards */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Featured Products</p>
                  <p className="text-2xl font-semibold text-gray-900">{data.stats.totalProducts}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Sales</p>
                  <p className="text-2xl font-semibold text-gray-900">{data.stats.totalSales}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <Star className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {data.stats.averageRating.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Stock</p>
                  <p className="text-2xl font-semibold text-gray-900">{data.stats.totalStock}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Featured Products List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Currently Trending Products ({data?.stats.totalProducts || 0})
            </h2>
          </div>

          {!data || data.products.length === 0 ? (
            <div className="p-8 text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No trending products yet</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
              >
                Add Your First Trending Product
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {data.products.map((product, index) => (
                <div key={product._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-yellow-600">#{index + 1}</span>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {product.name}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">{product.category.name}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(product.price)}
                        </span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">
                            {product.rating.toFixed(1)} ({product.numReviews})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{product.sold} sold</p>
                        <p className="text-sm text-gray-500">{product.stock} in stock</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/products/${product.slug}`}
                          target="_blank"
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                          title="View Product"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/products/${product._id}/edit`}
                          className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleToggleFeatured(product._id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          title="Remove from Trending"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Products Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add Products to Trending</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedProducts([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Plus className="h-6 w-6 rotate-45" />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {allProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">All products are already featured</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {allProducts.map((product) => (
                      <div
                        key={product._id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedProducts.includes(product._id)
                            ? 'border-yellow-500 bg-yellow-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                          if (selectedProducts.includes(product._id)) {
                            setSelectedProducts(selectedProducts.filter(id => id !== product._id));
                          } else {
                            setSelectedProducts([...selectedProducts, product._id]);
                          }
                        }}
                      >
                        <div className="flex items-center space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product._id)}
                            onChange={() => {}}
                            className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                          />
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-md object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{product.name}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{product.category.name}</span>
                              <span>{formatCurrency(product.price)}</span>
                              <span>{product.sold} sold</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {allProducts.length > 0 && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600">
                    {selectedProducts.length} product(s) selected
                  </span>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowAddModal(false);
                        setSelectedProducts([]);
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddToTrending}
                      disabled={selectedProducts.length === 0}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Add to Trending
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 
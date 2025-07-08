'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import AuthGuard from '@/components/auth/AuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  TrendingUp, 
  Package, 
  Users, 
  ShoppingBag, 
  AlertCircle, 
  Plus,
  Eye,
  RefreshCw,
  BarChart3,
  DollarSign,
  LogOut
} from 'lucide-react';

interface DashboardStats {
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrders: number;
  lowStockProducts: number;
  recentOrders: any[];
  topSellingProducts: any[];
}

function AdminDashboardContent() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7');
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/stats?period=${period}`);
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      } else {
        toast.error(result.message || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: '/' });
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  useEffect(() => {
    fetchStats();
  }, [period]);

  if (loading) {
    return (
      <div className="mobile:p-4 mobile:flex mobile:items-center mobile:justify-center mobile:min-h-screen sm:p-8 sm:flex sm:items-center sm:justify-center sm:min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full mobile:h-8 mobile:w-8 sm:h-12 sm:w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mobile:mt-3 mobile:text-mobile-sm sm:mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile:p-4 mobile:pb-20 sm:p-6 lg:p-8">
      <div className="mobile:max-w-full sm:max-w-7xl sm:mx-auto">
        {/* Mobile Header */}
        <div className="mobile:mb-6 sm:mb-8">
          <div className="mobile:flex mobile:items-center mobile:justify-between mobile:mb-4 sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="mobile:text-mobile-2xl mobile:font-bold mobile:text-gray-900 sm:text-3xl sm:font-bold sm:text-gray-900">
                Admin Dashboard
              </h1>
              <p className="mobile:mt-1 mobile:text-mobile-sm mobile:text-gray-600 sm:mt-2 sm:text-gray-600">
                Welcome back, {session?.user?.name}!
              </p>
            </div>
            
            {/* Mobile Actions */}
            <div className="mobile:flex mobile:items-center mobile:space-x-2 sm:flex sm:items-center sm:space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="mobile:p-2 mobile:bg-white mobile:border mobile:border-gray-300 mobile:rounded-mobile mobile:shadow-mobile mobile:min-h-touch mobile:min-w-touch mobile:flex mobile:items-center mobile:justify-center sm:inline-flex sm:items-center sm:px-3 sm:py-2 sm:border sm:border-gray-300 sm:rounded-md sm:text-sm sm:font-medium sm:text-gray-700 sm:bg-white sm:hover:bg-gray-50 sm:transition-colors"
              >
                <RefreshCw className={`mobile:h-5 mobile:w-5 mobile:text-gray-600 sm:h-4 sm:w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="mobile:hidden sm:ml-2">Refresh</span>
              </button>
              
              <button
                onClick={handleSignOut}
                className="mobile:p-2 mobile:bg-red-600 mobile:text-white mobile:rounded-mobile mobile:shadow-mobile mobile:min-h-touch mobile:min-w-touch mobile:flex mobile:items-center mobile:justify-center mobile:hover:bg-red-700 mobile:transition-colors sm:inline-flex sm:items-center sm:px-3 sm:py-2 sm:bg-red-600 sm:text-white sm:text-sm sm:font-medium sm:rounded-md sm:hover:bg-red-700 sm:transition-colors"
                title="Sign Out"
              >
                <LogOut className="mobile:h-5 mobile:w-5 sm:h-4 sm:w-4" />
                <span className="mobile:hidden sm:ml-2">Sign Out</span>
              </button>
            </div>
          </div>

          {/* Mobile Period Filter */}
          <div className="mobile:bg-white mobile:p-4 mobile:rounded-mobile-lg mobile:shadow-mobile mobile:border mobile:border-gray-200 sm:bg-transparent sm:p-0 sm:shadow-none sm:border-none">
            <div className="mobile:flex mobile:items-center mobile:justify-between sm:flex sm:items-center sm:space-x-4">
              <label className="mobile:text-mobile-sm mobile:font-medium mobile:text-gray-700 sm:text-sm sm:font-medium sm:text-gray-700">
                Time Period:
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="mobile:px-3 mobile:py-2 mobile:border mobile:border-gray-300 mobile:rounded-mobile mobile:focus:ring-2 mobile:focus:ring-indigo-500 mobile:focus:border-indigo-500 mobile:text-mobile-sm mobile:min-h-touch sm:px-3 sm:py-2 sm:border sm:border-gray-300 sm:rounded-md sm:focus:outline-none sm:focus:ring-2 sm:focus:ring-indigo-500 sm:focus:border-indigo-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>

            </div>
          </div>
        </div>

        {/* Mobile-Optimized Stats Cards */}
        <div className="mobile:grid mobile:grid-cols-2 mobile:gap-3 mobile:mb-6 sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 sm:gap-6 sm:mb-8">
          <div className="mobile:bg-white mobile:p-4 mobile:rounded-mobile-lg mobile:shadow-mobile mobile:border mobile:border-gray-200 sm:bg-white sm:p-6 sm:rounded-lg sm:shadow-sm sm:border sm:border-gray-200">
            <div className="mobile:flex mobile:flex-col mobile:items-center mobile:text-center sm:flex sm:items-center sm:justify-between sm:text-left">
              <div className="mobile:w-full sm:flex-1">
                <div className="mobile:p-2 mobile:bg-blue-100 mobile:rounded-mobile mobile:w-fit mobile:mx-auto mobile:mb-2 sm:p-3 sm:bg-blue-100 sm:rounded-full sm:w-fit sm:mx-0 sm:mb-0">
                  <ShoppingBag className="mobile:h-4 mobile:w-4 mobile:text-blue-600 sm:h-6 sm:w-6 sm:text-blue-600" />
                </div>
                <p className="mobile:text-mobile-xs mobile:text-gray-600 mobile:mb-1 sm:text-sm sm:text-gray-600">Total Orders</p>
                <p className="mobile:text-mobile-lg mobile:font-bold mobile:text-gray-900 sm:text-2xl sm:font-bold sm:text-gray-900">{stats?.totalOrders || 0}</p>
              </div>
            </div>
          </div>

          <div className="mobile:bg-white mobile:p-4 mobile:rounded-mobile-lg mobile:shadow-mobile mobile:border mobile:border-gray-200 sm:bg-white sm:p-6 sm:rounded-lg sm:shadow-sm sm:border sm:border-gray-200">
            <div className="mobile:flex mobile:flex-col mobile:items-center mobile:text-center sm:flex sm:items-center sm:justify-between sm:text-left">
              <div className="mobile:w-full sm:flex-1">
                <div className="mobile:p-2 mobile:bg-purple-100 mobile:rounded-mobile mobile:w-fit mobile:mx-auto mobile:mb-2 sm:p-3 sm:bg-purple-100 sm:rounded-full sm:w-fit sm:mx-0 sm:mb-0">
                  <Package className="mobile:h-4 mobile:w-4 mobile:text-purple-600 sm:h-6 sm:w-6 sm:text-purple-600" />
                </div>
                <p className="mobile:text-mobile-xs mobile:text-gray-600 mobile:mb-1 sm:text-sm sm:text-gray-600">Products</p>
                <p className="mobile:text-mobile-lg mobile:font-bold mobile:text-gray-900 sm:text-2xl sm:font-bold sm:text-gray-900">{stats?.totalProducts || 0}</p>
              </div>
            </div>
          </div>

          <div className="mobile:bg-white mobile:p-4 mobile:rounded-mobile-lg mobile:shadow-mobile mobile:border mobile:border-gray-200 sm:bg-white sm:p-6 sm:rounded-lg sm:shadow-sm sm:border sm:border-gray-200">
            <div className="mobile:flex mobile:flex-col mobile:items-center mobile:text-center sm:flex sm:items-center sm:justify-between sm:text-left">
              <div className="mobile:w-full sm:flex-1">
                <div className="mobile:p-2 mobile:bg-orange-100 mobile:rounded-mobile mobile:w-fit mobile:mx-auto mobile:mb-2 sm:p-3 sm:bg-orange-100 sm:rounded-full sm:w-fit sm:mx-0 sm:mb-0">
                  <Users className="mobile:h-4 mobile:w-4 mobile:text-orange-600 sm:h-6 sm:w-6 sm:text-orange-600" />
                </div>
                <p className="mobile:text-mobile-xs mobile:text-gray-600 mobile:mb-1 sm:text-sm sm:text-gray-600">Users</p>
                <p className="mobile:text-mobile-lg mobile:font-bold mobile:text-gray-900 sm:text-2xl sm:font-bold sm:text-gray-900">{stats?.totalUsers || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Alert Cards */}
        <div className="mobile:grid mobile:grid-cols-1 mobile:gap-3 mobile:mb-6 sm:grid sm:grid-cols-1 sm:gap-6 sm:mb-8">
          {/* Pending Orders Alert */}
          <div className="mobile:bg-white mobile:p-4 mobile:rounded-mobile-lg mobile:shadow-mobile mobile:border mobile:border-gray-200 sm:bg-white sm:p-6 sm:rounded-lg sm:shadow-sm sm:border sm:border-gray-200">
            <div className="mobile:flex mobile:items-start mobile:space-x-3 sm:flex sm:items-center sm:justify-between sm:mb-4">
              <div className="mobile:flex mobile:items-center mobile:space-x-2 mobile:flex-1 sm:flex sm:items-center sm:space-x-3">
                <div className={`mobile:p-1.5 mobile:rounded-mobile sm:p-2 sm:rounded-full ${(stats?.pendingOrders ?? 0) > 0 ? 'mobile:bg-yellow-100 sm:bg-yellow-100' : 'mobile:bg-gray-100 sm:bg-gray-100'}`}>
                  <AlertCircle className={`mobile:h-4 mobile:w-4 sm:h-5 sm:w-5 ${(stats?.pendingOrders ?? 0) > 0 ? 'mobile:text-yellow-600 sm:text-yellow-600' : 'mobile:text-gray-600 sm:text-gray-600'}`} />
                </div>
                <div>
                  <h3 className="mobile:text-mobile-base mobile:font-semibold mobile:text-gray-900 sm:text-lg sm:font-semibold sm:text-gray-900">
                    Pending Orders
                  </h3>
                  <p className="mobile:text-mobile-xs mobile:text-gray-600 mobile:mt-1 sm:text-sm sm:text-gray-600 sm:mt-0">
                    {stats?.pendingOrders !== undefined && stats.pendingOrders > 0
                      ? `${stats.pendingOrders} order${stats.pendingOrders === 1 ? '' : 's'} waiting for confirmation`
                      : 'No pending orders'}
                  </p>
                </div>
              </div>
              <span className={`mobile:text-mobile-xs mobile:font-medium mobile:px-2 mobile:py-1 mobile:rounded-mobile mobile:shrink-0 sm:text-xs sm:font-medium sm:px-2.5 sm:py-0.5 sm:rounded-full ${
                (stats?.pendingOrders ?? 0) > 0 
                  ? 'mobile:bg-yellow-100 mobile:text-yellow-800 sm:bg-yellow-100 sm:text-yellow-800'
                  : 'mobile:bg-gray-100 mobile:text-gray-600 sm:bg-gray-100 sm:text-gray-600'
              }`}>
                {stats?.pendingOrders || 0}
              </span>
            </div>
            <div className="mobile:mt-3 sm:mt-0">
              <Link
                href="/admin/orders?status=pending"
                className={`mobile:w-full mobile:inline-flex mobile:items-center mobile:justify-center mobile:px-4 mobile:py-2 mobile:text-mobile-sm mobile:font-medium mobile:rounded-mobile mobile:transition-colors mobile:min-h-touch sm:inline-flex sm:items-center sm:px-4 sm:py-2 sm:text-sm sm:font-medium sm:rounded-md sm:transition-colors ${
                  (stats?.pendingOrders ?? 0) > 0
                    ? 'mobile:bg-yellow-600 mobile:text-white mobile:hover:bg-yellow-700 sm:bg-yellow-600 sm:text-white sm:hover:bg-yellow-700'
                    : 'mobile:bg-gray-100 mobile:text-gray-600 mobile:hover:bg-gray-200 sm:bg-gray-100 sm:text-gray-600 sm:hover:bg-gray-200'
                }`}
              >
                <Eye className="mobile:h-4 mobile:w-4 mobile:mr-2 sm:h-4 sm:w-4 sm:mr-2" />
                View Orders
              </Link>
            </div>
          </div>

                     {/* Low Stock Alert */}
           {stats?.lowStockProducts && stats.lowStockProducts > 0 && (
            <div className="mobile:bg-white mobile:p-4 mobile:rounded-mobile-lg mobile:shadow-mobile mobile:border mobile:border-gray-200 sm:bg-white sm:p-6 sm:rounded-lg sm:shadow-sm sm:border sm:border-gray-200">
              <div className="mobile:flex mobile:items-start mobile:space-x-3 sm:flex sm:items-center sm:justify-between sm:mb-4">
                <div className="mobile:flex mobile:items-center mobile:space-x-2 mobile:flex-1 sm:flex sm:items-center sm:space-x-3">
                  <div className="mobile:p-1.5 mobile:bg-red-100 mobile:rounded-mobile sm:p-2 sm:bg-red-100 sm:rounded-full">
                    <Package className="mobile:h-4 mobile:w-4 mobile:text-red-600 sm:h-5 sm:w-5 sm:text-red-600" />
                  </div>
                  <div>
                    <h3 className="mobile:text-mobile-base mobile:font-semibold mobile:text-gray-900 sm:text-lg sm:font-semibold sm:text-gray-900">
                      Low Stock Alert
                    </h3>
                    <p className="mobile:text-mobile-xs mobile:text-gray-600 mobile:mt-1 sm:text-sm sm:text-gray-600 sm:mt-0">
                      {stats?.lowStockProducts || 0} products running low
                    </p>
                  </div>
                </div>
                <span className="mobile:bg-red-100 mobile:text-red-800 mobile:text-mobile-xs mobile:font-medium mobile:px-2 mobile:py-1 mobile:rounded-mobile mobile:shrink-0 sm:bg-red-100 sm:text-red-800 sm:text-xs sm:font-medium sm:px-2.5 sm:py-0.5 sm:rounded-full">
                  {stats?.lowStockProducts || 0}
                </span>
              </div>
              <div className="mobile:mt-3 sm:mt-0">
                <Link
                  href="/admin/products?filter=lowStock"
                  className="mobile:w-full mobile:inline-flex mobile:items-center mobile:justify-center mobile:px-4 mobile:py-2 mobile:bg-red-600 mobile:text-white mobile:text-mobile-sm mobile:font-medium mobile:rounded-mobile mobile:hover:bg-red-700 mobile:transition-colors mobile:min-h-touch sm:inline-flex sm:items-center sm:px-4 sm:py-2 sm:bg-red-600 sm:text-white sm:text-sm sm:font-medium sm:rounded-md sm:hover:bg-red-700 sm:transition-colors"
                >
                  <Package className="mobile:h-4 mobile:w-4 mobile:mr-2 sm:h-4 sm:w-4 sm:mr-2" />
                  Manage Stock
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Mobile-Optimized Data Sections */}
        <div className="mobile:grid mobile:grid-cols-1 mobile:gap-6 lg:grid-cols-2 lg:gap-6">
          {/* Recent Orders - Mobile Optimized */}
          <div className="mobile:bg-white mobile:p-4 mobile:rounded-mobile-lg mobile:shadow-mobile mobile:border mobile:border-gray-200 sm:bg-white sm:p-6 sm:rounded-lg sm:shadow-sm sm:border sm:border-gray-200">
            <div className="mobile:flex mobile:items-center mobile:justify-between mobile:mb-4 sm:flex sm:items-center sm:justify-between sm:mb-4">
              <h3 className="mobile:text-mobile-lg mobile:font-semibold mobile:text-gray-900 sm:text-lg sm:font-semibold sm:text-gray-900">
                Recent Orders
              </h3>
              <Link
                href="/admin/orders"
                className="mobile:text-mobile-sm mobile:text-indigo-600 mobile:hover:text-indigo-500 mobile:font-medium sm:text-indigo-600 sm:hover:text-indigo-500 sm:text-sm sm:font-medium"
              >
                View All
              </Link>
            </div>
            <div className="mobile:space-y-3 sm:space-y-3">
              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.slice(0, 4).map((order: any) => (
                  <div key={order._id} className="mobile:flex mobile:items-center mobile:justify-between mobile:p-3 mobile:bg-gray-50 mobile:rounded-mobile-lg sm:flex sm:items-center sm:justify-between sm:p-3 sm:bg-gray-50 sm:rounded-lg">
                    <div className="mobile:flex-1 sm:flex-1">
                      <p className="mobile:text-mobile-sm mobile:font-medium mobile:text-gray-900 mobile:truncate sm:text-sm sm:font-medium sm:text-gray-900">
                        Order #{order._id?.slice(-8)}
                      </p>
                      <p className="mobile:text-mobile-xs mobile:text-gray-500 mobile:truncate sm:text-xs sm:text-gray-500">
                        {order.user?.name || 'Unknown'}
                      </p>
                    </div>
                    <div className="mobile:text-right mobile:ml-2 sm:text-right">
                      <p className="mobile:text-mobile-sm mobile:font-medium mobile:text-gray-900 sm:text-sm sm:font-medium sm:text-gray-900">
                        ৳{order.totalPrice?.toLocaleString()}
                      </p>
                      <p className="mobile:text-mobile-xs mobile:text-gray-500 sm:text-xs sm:text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="mobile:text-center mobile:py-6 sm:text-center sm:py-6">
                  <ShoppingBag className="mobile:h-8 mobile:w-8 mobile:text-gray-400 mobile:mx-auto mobile:mb-2 sm:h-12 sm:w-12 sm:text-gray-400 sm:mx-auto sm:mb-3" />
                  <p className="mobile:text-mobile-sm mobile:text-gray-500 sm:text-sm sm:text-gray-500">No recent orders</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Selling Products - Mobile Optimized */}
          <div className="mobile:bg-white mobile:p-4 mobile:rounded-mobile-lg mobile:shadow-mobile mobile:border mobile:border-gray-200 sm:bg-white sm:p-6 sm:rounded-lg sm:shadow-sm sm:border sm:border-gray-200">
            <div className="mobile:flex mobile:items-center mobile:justify-between mobile:mb-4 sm:flex sm:items-center sm:justify-between sm:mb-4">
              <h3 className="mobile:text-mobile-lg mobile:font-semibold mobile:text-gray-900 sm:text-lg sm:font-semibold sm:text-gray-900">
                Top Products
              </h3>
              <Link
                href="/admin/products"
                className="mobile:text-mobile-sm mobile:text-indigo-600 mobile:hover:text-indigo-500 mobile:font-medium sm:text-indigo-600 sm:hover:text-indigo-500 sm:text-sm sm:font-medium"
              >
                View All
              </Link>
            </div>
            <div className="mobile:space-y-3 sm:space-y-3">
              {stats?.topSellingProducts && stats.topSellingProducts.length > 0 ? (
                stats.topSellingProducts.slice(0, 4).map((product: any) => (
                  <div key={product._id} className="mobile:flex mobile:items-center mobile:justify-between mobile:p-3 mobile:bg-gray-50 mobile:rounded-mobile-lg sm:flex sm:items-center sm:justify-between sm:p-3 sm:bg-gray-50 sm:rounded-lg">
                    <div className="mobile:flex-1 sm:flex-1">
                      <p className="mobile:text-mobile-sm mobile:font-medium mobile:text-gray-900 mobile:truncate sm:text-sm sm:font-medium sm:text-gray-900">
                        {product.name}
                      </p>
                      <p className="mobile:text-mobile-xs mobile:text-gray-500 sm:text-xs sm:text-gray-500">
                        Stock: {product.stock}
                      </p>
                    </div>
                    <div className="mobile:text-right mobile:ml-2 sm:text-right">
                      <p className="mobile:text-mobile-sm mobile:font-medium mobile:text-gray-900 sm:text-sm sm:font-medium sm:text-gray-900">
                        {product.sold || 0} sold
                      </p>
                      <p className="mobile:text-mobile-xs mobile:text-gray-500 sm:text-xs sm:text-gray-500">
                        ৳{product.price?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="mobile:text-center mobile:py-6 sm:text-center sm:py-6">
                  <BarChart3 className="mobile:h-8 mobile:w-8 mobile:text-gray-400 mobile:mx-auto mobile:mb-2 sm:h-12 sm:w-12 sm:text-gray-400 sm:mx-auto sm:mb-3" />
                  <p className="mobile:text-mobile-sm mobile:text-gray-500 sm:text-sm sm:text-gray-500">No sales data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Quick Actions */}
        <div className="mobile:mt-6 mobile:bg-white mobile:p-4 mobile:rounded-mobile-lg mobile:shadow-mobile mobile:border mobile:border-gray-200 sm:mt-8 sm:bg-white sm:p-6 sm:rounded-lg sm:shadow-sm sm:border sm:border-gray-200">
          <h3 className="mobile:text-mobile-lg mobile:font-semibold mobile:text-gray-900 mobile:mb-4 sm:text-lg sm:font-semibold sm:text-gray-900 sm:mb-4">
            Quick Actions
          </h3>
          <div className="mobile:grid mobile:grid-cols-2 mobile:gap-3 sm:grid sm:grid-cols-1 sm:gap-4 lg:grid-cols-4">
            <Link
              href="/admin/products/new"
              className="mobile:inline-flex mobile:flex-col mobile:items-center mobile:justify-center mobile:px-4 mobile:py-4 mobile:bg-indigo-600 mobile:text-white mobile:text-mobile-sm mobile:font-medium mobile:rounded-mobile-lg mobile:hover:bg-indigo-700 mobile:transition-colors mobile:space-y-2 mobile:min-h-touch sm:inline-flex sm:flex-row sm:items-center sm:justify-center sm:px-4 sm:py-2 sm:bg-indigo-600 sm:text-white sm:text-sm sm:font-medium sm:rounded-md sm:hover:bg-indigo-700 sm:transition-colors sm:space-y-0"
            >
              <Plus className="mobile:h-5 mobile:w-5 sm:h-4 sm:w-4 sm:mr-2" />
              <span>Add Product</span>
            </Link>
            
            <Link
              href="/admin/orders"
              className="mobile:inline-flex mobile:flex-col mobile:items-center mobile:justify-center mobile:px-4 mobile:py-4 mobile:bg-blue-600 mobile:text-white mobile:text-mobile-sm mobile:font-medium mobile:rounded-mobile-lg mobile:hover:bg-blue-700 mobile:transition-colors mobile:space-y-2 mobile:min-h-touch sm:inline-flex sm:flex-row sm:items-center sm:justify-center sm:px-4 sm:py-2 sm:bg-blue-600 sm:text-white sm:text-sm sm:font-medium sm:rounded-md sm:hover:bg-blue-700 sm:transition-colors sm:space-y-0"
            >
              <ShoppingBag className="mobile:h-5 mobile:w-5 sm:h-4 sm:w-4 sm:mr-2" />
              <span>Orders</span>
            </Link>
            
            <Link
              href="/admin/users"
              className="mobile:inline-flex mobile:flex-col mobile:items-center mobile:justify-center mobile:px-4 mobile:py-4 mobile:bg-green-600 mobile:text-white mobile:text-mobile-sm mobile:font-medium mobile:rounded-mobile-lg mobile:hover:bg-green-700 mobile:transition-colors mobile:space-y-2 mobile:min-h-touch sm:inline-flex sm:flex-row sm:items-center sm:justify-center sm:px-4 sm:py-2 sm:bg-green-600 sm:text-white sm:text-sm sm:font-medium sm:rounded-md sm:hover:bg-green-700 sm:transition-colors sm:space-y-0"
            >
              <Users className="mobile:h-5 mobile:w-5 sm:h-4 sm:w-4 sm:mr-2" />
              <span>Users</span>
            </Link>
            
            <Link
              href="/admin/categories"
              className="mobile:inline-flex mobile:flex-col mobile:items-center mobile:justify-center mobile:px-4 mobile:py-4 mobile:bg-purple-600 mobile:text-white mobile:text-mobile-sm mobile:font-medium mobile:rounded-mobile-lg mobile:hover:bg-purple-700 mobile:transition-colors mobile:space-y-2 mobile:min-h-touch sm:inline-flex sm:flex-row sm:items-center sm:justify-center sm:px-4 sm:py-2 sm:bg-purple-600 sm:text-white sm:text-sm sm:font-medium sm:rounded-md sm:hover:bg-purple-700 sm:transition-colors sm:space-y-0"
            >
              <Package className="mobile:h-5 mobile:w-5 sm:h-4 sm:w-4 sm:mr-2" />
              <span>Categories</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AuthGuard requireAuth={true} requireRole="admin">
      <AdminLayout>
        <AdminDashboardContent />
      </AdminLayout>
    </AuthGuard>
  );
} 
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import AuthGuard from '@/components/auth/AuthGuard';

interface Order {
  _id: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
    size: string;
    color: string;
    image: string;
  }>;
  totalPrice: number;
  isConfirmed: boolean;
  isShipped: boolean;
  isDelivered: boolean;
  isCancelled: boolean;
  createdAt: string;
  shippingAddress: {
    address: string;
    phone: string;
    state?: string;
  };
  paymentMethod: string;
}

interface OrdersResponse {
  success: boolean;
  data?: Order[];
  pagination?: {
    page: number;
    pages: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
  code?: string;
}

function OrdersContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<OrdersResponse['pagination'] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Redirect admins to admin orders page
  useEffect(() => {
    if (session?.user?.role === 'admin') {
      router.push('/admin/orders');
      return;
    }
  }, [session, router]);

  const fetchOrders = async (page = 1, search = '', status = '') => {
    // Don't fetch if session is not available or user is admin
    if (!session || !session.user || session.user.role === 'admin') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(status && { status }),
      });

      const response = await fetch(`/api/orders?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Ensure cookies are included
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error:', errorData);
        
        if (response.status === 401) {
          toast.error('Please sign in to view your orders');
          router.push('/auth/signin');
          return;
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result: OrdersResponse = await response.json();

      if (result.success && result.data) {
        setOrders(result.data);
        setPagination(result.pagination || null);
      } else {
        console.error('API returned error:', result);
        toast.error(result.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(`Failed to fetch orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch when session is available and user is not admin
    if (session && session.user && session.user.role !== 'admin') {
      fetchOrders(currentPage, searchTerm, statusFilter);
    } else if (session?.user?.role === 'admin') {
      // Don't fetch orders for admin users, let the redirect handle it
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, refreshKey, session]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (session && session.user && session.user.role !== 'admin') {
      setCurrentPage(1);
      fetchOrders(1, searchTerm, statusFilter);
    }
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
    // The useEffect will handle the refetch when statusFilter changes
  };

  const refreshOrders = () => {
    if (session && session.user && session.user.role !== 'admin') {
      setRefreshKey(prev => prev + 1);
    }
  };

  const getStatusDisplay = (order: Order) => {
    if (order.isCancelled) return { text: 'Cancelled', color: 'bg-red-100 text-red-800' };
    if (order.isDelivered) return { text: 'Delivered', color: 'bg-green-100 text-green-800' };
    if (order.isShipped) return { text: 'Shipped', color: 'bg-blue-100 text-blue-800' };
    if (order.isConfirmed) return { text: 'Processing', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Pending', color: 'bg-gray-100 text-gray-800' };
  };

  const getStatusDescription = (order: Order) => {
    if (order.isCancelled) return 'Your order has been cancelled';
    if (order.isDelivered) return 'Your order has been delivered';
    if (order.isShipped) return 'Your order is on the way';
    if (order.isConfirmed) return 'Your order is being processed';
    return 'Your order is being reviewed';
  };

  // Don't render content if user is admin (they should be redirected)
  if (session?.user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to admin panel...</p>
        </div>
      </div>
    );
  }

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Track and manage your orders
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                <button
                  onClick={refreshOrders}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                <Link
                  href="/shop"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search orders by ID or product name..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </form>

              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Orders List */}
          <div className="p-6">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter ? 'Try adjusting your search or filters.' : 'Start shopping to see your orders here.'}
                </p>
                {!searchTerm && !statusFilter && (
                  <div className="mt-6">
                    <Link
                      href="/shop"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Start Shopping
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  const status = getStatusDisplay(order);
                  return (
                    <div key={order._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Order #{order._id}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">৳{order.totalPrice}</p>
                          <p className="text-sm text-gray-500">{order.paymentMethod.toUpperCase()}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">{getStatusDescription(order)}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-900">Shipping Address:</p>
                            <p className="text-gray-600">{order.shippingAddress.address}</p>
                            <p className="text-gray-600">{order.shippingAddress.phone}</p>
                            {order.shippingAddress.state && (
                              <p className="text-gray-600">{order.shippingAddress.state}</p>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Order Items:</p>
                            <p className="text-gray-600">{order.orderItems.length} item(s)</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {order.orderItems.map((item, index) => (
                          <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 rounded-md object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              <p className="text-sm text-gray-500">
                                Size: {item.size} • Color: {item.color}
                              </p>
                              <p className="text-sm text-gray-500">
                                Quantity: {item.quantity} × ৳{item.price} = ৳{item.quantity * item.price}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <Link
                          href={`/orders/${order._id}`}
                          className="text-indigo-600 hover:text-indigo-500 font-medium text-sm"
                        >
                          View Details
                        </Link>
                        <div className="flex items-center space-x-3">
                          {!order.isCancelled && !order.isDelivered && (
                            <button
                              onClick={() => {
                                // Handle cancel order
                                toast.error('Order cancellation is not available yet');
                              }}
                              className="text-red-600 hover:text-red-500 font-medium text-sm"
                            >
                              Cancel Order
                            </button>
                          )}
                          {order.isDelivered && (
                            <button
                              onClick={() => {
                                // Handle reorder
                                toast.success('Reorder functionality coming soon');
                              }}
                              className="text-green-600 hover:text-green-500 font-medium text-sm"
                            >
                              Reorder
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {pagination.page} of {pagination.pages} ({pagination.total} total orders)
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === page
                          ? 'text-white bg-indigo-600'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const [isClearing, setIsClearing] = useState(false);

  const clearOrderHistory = async () => {
    if (!confirm("Are you sure you want to clear your order history? This action cannot be undone.")) {
      return;
    }

    setIsClearing(true);
    try {
      const response = await fetch("/api/orders", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to clear order history");
      }

      toast.success("Order history cleared successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to clear order history");
      console.error(error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <OrdersContent />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Orders</h1>
          <button
            onClick={clearOrderHistory}
            disabled={isClearing}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isClearing ? "Clearing..." : "Clear Order History"}
          </button>
        </div>
      </div>
    </AuthGuard>
  );
} 
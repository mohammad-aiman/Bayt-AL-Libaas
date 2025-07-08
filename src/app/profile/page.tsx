'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Order } from '@/types';
import { toast } from 'react-hot-toast';
import { LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Redirect admin users to admin panel
    if (session.user?.role === 'admin') {
      router.push('/admin');
      return;
    }
    
    fetchOrders();
  }, [session, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: '/' });
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  // Utility function to compute order status from boolean flags
  const getOrderStatus = (order: Order): string => {
    if (order.isCancelled) return 'cancelled';
    if (order.isDelivered) return 'delivered';
    if (order.isShipped) return 'shipped';
    if (order.isConfirmed) return 'processing';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Welcome back,</p>
              <p className="font-medium text-gray-900">{session.user?.name}</p>
            </div>
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {session.user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Order History
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'account'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Account Settings
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Order History
                </h2>
                
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-24 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 118 0v4M5 9h14l1 12h7.5a2 2 0 002-2V9z"
                        />
                      </svg>
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      No orders yet
                    </h3>
                    <p className="mt-2 text-gray-500">
                      Start shopping to see your orders here!
                    </p>
                    <div className="mt-6">
                      <Link
                        href="/shop"
                        className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        Start Shopping
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order._id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              Order #{order._id.slice(-8)}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Placed on {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(getOrderStatus(order))}`}>
                              {getOrderStatus(order).charAt(0).toUpperCase() + getOrderStatus(order).slice(1)}
                            </span>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              ৳{order.totalPrice.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Items</h4>
                            <div className="space-y-2">
                              {order.orderItems.slice(0, 3).map((item, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-12 h-12 object-cover rounded-md"
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">{item.name}</p>
                                    <p className="text-sm text-gray-600">
                                      Qty: {item.quantity} • ৳{item.price}
                                    </p>
                                  </div>
                                </div>
                              ))}
                              {order.orderItems.length > 3 && (
                                <p className="text-sm text-gray-600">
                                  +{order.orderItems.length - 3} more items
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                            <div className="text-sm text-gray-600">
                              <p className="font-medium text-gray-900">Shipping Address:</p>
                              <p>{order.shippingAddress.address}</p>
                              {(order.shippingAddress.city || order.shippingAddress.postalCode) && (
                                <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                              )}
                              {order.shippingAddress.state && <p>{order.shippingAddress.state}</p>}
                              <p>📞 {order.shippingAddress.phone}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                          <div className="flex items-center space-x-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.isPaid ? 'Paid' : 'Pending Payment'}
                            </span>
                            <span className="text-sm text-gray-600">
                              {order.paymentMethod === 'sslcommerz' ? 'Online Payment' : 'Cash on Delivery'}
                            </span>
                          </div>
                          
                          <Link
                            href={`/orders/${order._id}`}
                            className="text-indigo-600 hover:text-indigo-500 font-medium"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'account' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Account Settings
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-medium text-gray-900 mb-4">Profile Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={session.user?.name || ''}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={session.user?.email || ''}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role
                        </label>
                        <input
                          type="text"
                          value={session.user?.role || 'user'}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white disabled:bg-gray-50 disabled:text-gray-500 capitalize"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Account Actions */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-medium text-gray-900 mb-4">Account Actions</h3>
                    <div className="space-y-4">
                      <button
                        onClick={handleSignOut}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                      <p className="text-sm text-gray-500">
                        You will be redirected to the home page after signing out.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
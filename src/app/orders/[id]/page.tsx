'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Order } from '@/types';
import { toast } from 'react-hot-toast';

export default function OrderDetailsPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`);
      const data = await response.json();
      
      if (data.success) {
        setOrder(data.data);
      } else {
        toast.error(data.message || 'Order not found');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to fetch order details');
    } finally {
      setLoading(false);
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

  const getStatusSteps = (status: string) => {
    const steps = [
      { key: 'pending', label: 'Order Placed', completed: true },
      { key: 'processing', label: 'Processing', completed: false },
      { key: 'shipped', label: 'Shipped', completed: false },
      { key: 'delivered', label: 'Delivered', completed: false },
    ];

    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(status.toLowerCase());

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Order not found</h1>
          <p className="mt-2 text-gray-600">The order you're looking for doesn't exist.</p>
          <Link
            href="/profile"
            className="mt-4 inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  const orderStatus = getOrderStatus(order);
  const statusSteps = getStatusSteps(orderStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order #{order._id.slice(-8)}
            </h1>
            <p className="text-gray-600">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Link
            href="/profile"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            ← Back to Profile
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Status */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Order Status
              </h2>
              
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderStatus)}`}>
                  {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  order.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.isPaid ? 'Paid' : 'Pending Payment'}
                </span>
              </div>
              
              {/* Progress Steps */}
              <div className="relative">
                <div className="flex items-center justify-between">
                  {statusSteps.map((step, index) => (
                    <div key={step.key} className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}>
                        {step.completed ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <span className={`mt-2 text-xs font-medium ${
                        step.completed ? 'text-indigo-600' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 -z-10">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${(statusSteps.filter(s => s.completed).length - 1) * 33.33}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Order Items
              </h2>
              
              <div className="space-y-4">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                        <span>Size: {item.size}</span>
                        <span>Color: {item.color}</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">৳{item.price}</p>
                      <p className="text-sm text-gray-600">
                        Total: ৳{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">৳{order.itemsPrice.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">
                    {order.shippingPrice === 0 ? 'Free' : `৳${order.shippingPrice.toFixed(2)}`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">৳{order.taxPrice.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-3">
                  <span>Total</span>
                  <span>৳{order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Shipping Address
              </h2>
              
              <div className="text-sm text-gray-600 space-y-1">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Shipping Address</h3>
                  <p>{order.shippingAddress.address}</p>
                  {(order.shippingAddress.city || order.shippingAddress.postalCode) && (
                    <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                  )}
                  {order.shippingAddress.state && <p>{order.shippingAddress.state}</p>}
                  <p>📞 {order.shippingAddress.phone}</p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Information
              </h2>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="text-gray-900">
                    {order.paymentMethod === 'sslcommerz' ? 'Online Payment' : 'Cash on Delivery'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.isPaid ? 'Paid' : 'Pending'}
                  </span>
                </div>
                
                {order.isPaid && order.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paid on:</span>
                    <span className="text-gray-900">
                      {new Date(order.paidAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Truck,
  Package,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  Clock,
  AlertCircle
} from 'lucide-react';

interface OrderItem {
  _id: string;
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  confirmedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
}

interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  orderItems: OrderItem[];
  shippingAddress: {
    address: string;
    state: string;
    phone: string;
  };
  paymentMethod: string;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt: string | null;
  isConfirmed: boolean;
  confirmedAt: string | null;
  isShipped: boolean;
  shippedAt: string | null;
  isDelivered: boolean;
  deliveredAt: string | null;
  isCancelled: boolean;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function AdminOrderDetailsPage({ params }: PageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (session.user?.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchOrder();
  }, [session, params.id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setOrder(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch order');
        if (response.status === 404) {
          router.push('/admin/orders');
        }
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (status: {
    isConfirmed?: boolean;
    isShipped?: boolean;
    isDelivered?: boolean;
    isCancelled?: boolean;
  }) => {
    if (updating) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(status),
      });

      const data = await response.json();

      if (data.success) {
        setOrder(data.data);
        toast.success('Order status updated successfully');
      } else {
        toast.error(data.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const updateItemStatus = async (itemId: string, status: 'confirmed' | 'cancelled') => {
    if (updating) return;

    try {
      setUpdating(true);
      console.log('Updating item status:', { itemId, status });
      
      const response = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemUpdates: [{
            itemId,
            status
          }]
        }),
      });

      const data = await response.json();
      console.log('Update response:', data);

      if (data.success && data.data) {
        setOrder(data.data);
        toast.success(`Item ${status} successfully`);
        // Refresh the order data to ensure we have the latest state
        await fetchOrder();
      } else {
        console.error('Failed to update item:', data.message);
        toast.error(data.message || `Failed to ${status} item`);
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error(`Failed to ${status} item`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent-purple-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Order not found</h2>
          <p className="mt-2 text-gray-600">The order you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/admin/orders')}
            className="mt-4 inline-flex items-center text-accent-purple-600 hover:text-accent-purple-700"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="mobile:block sm:block md:hidden bg-white shadow-mobile border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-mobile transition-colors min-h-touch min-w-touch flex items-center justify-center"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="ml-3">
              <h1 className="text-mobile-xl font-bold text-gray-900">Order Details</h1>
              <p className="text-mobile-sm text-gray-600">#{order._id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="mobile:hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
              <p className="mt-1 text-gray-600">Order #{order._id}</p>
            </div>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-accent-purple-600 hover:text-accent-purple-700"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Orders
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Status and Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Status</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Status Cards */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-gray-600 mr-2" />
                      <span className="font-medium text-gray-900">Confirmed</span>
                    </div>
                    {order.isConfirmed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <button
                        onClick={() => updateOrderStatus({ isConfirmed: true })}
                        disabled={updating || order.isCancelled}
                        className="text-accent-purple-600 hover:text-accent-purple-700 disabled:opacity-50"
                      >
                        Confirm Order
                      </button>
                    )}
                  </div>
                  {order.confirmedAt && (
                    <p className="text-sm text-gray-600 mt-2">
                      {formatDate(order.confirmedAt)}
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Truck className="h-5 w-5 text-gray-600 mr-2" />
                      <span className="font-medium text-gray-900">Shipped</span>
                    </div>
                    {order.isShipped ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <button
                        onClick={() => updateOrderStatus({ isShipped: true })}
                        disabled={updating || !order.isConfirmed || order.isCancelled}
                        className="text-accent-purple-600 hover:text-accent-purple-700 disabled:opacity-50"
                      >
                        Mark as Shipped
                      </button>
                    )}
                  </div>
                  {order.shippedAt && (
                    <p className="text-sm text-gray-600 mt-2">
                      {formatDate(order.shippedAt)}
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-gray-600 mr-2" />
                      <span className="font-medium text-gray-900">Delivered</span>
                    </div>
                    {order.isDelivered ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <button
                        onClick={() => updateOrderStatus({ isDelivered: true })}
                        disabled={updating || !order.isShipped || order.isCancelled}
                        className="text-accent-purple-600 hover:text-accent-purple-700 disabled:opacity-50"
                      >
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                  {order.deliveredAt && (
                    <p className="text-sm text-gray-600 mt-2">
                      {formatDate(order.deliveredAt)}
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <XCircle className="h-5 w-5 text-gray-600 mr-2" />
                      <span className="font-medium text-gray-900">Cancelled</span>
                    </div>
                    {order.isCancelled ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <button
                        onClick={() => updateOrderStatus({ isCancelled: true })}
                        disabled={updating || order.isDelivered}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                  {order.cancelledAt && (
                    <p className="text-sm text-gray-600 mt-2">
                      {formatDate(order.cancelledAt)}
                    </p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Items</h2>
                <div className="space-y-4">
                  {order.orderItems.map((item: OrderItem) => (
                    <div
                      key={item._id}
                      className="flex flex-col bg-gray-50 p-4 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.name}</h3>
                          <div className="mt-1 text-sm text-gray-600">
                            <span className="mr-4">Size: {item.size}</span>
                            <span>Color: {item.color}</span>
                          </div>
                          <div className="mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              item.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {((item.status || 'pending').charAt(0).toUpperCase() + (item.status || 'pending').slice(1))}
                            </span>
                            {item.confirmedAt && (
                              <span className="ml-2 text-xs text-gray-500">
                                Confirmed: {formatDate(item.confirmedAt)}
                              </span>
                            )}
                            {item.cancelledAt && (
                              <span className="ml-2 text-xs text-gray-500">
                                Cancelled: {formatDate(item.cancelledAt)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            ৳{item.price.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Qty: {item.quantity}
                          </div>
                        </div>
                      </div>

                      {/* Item Actions */}
                      {!order.isCancelled && !order.isDelivered && (
                        <div className="mt-4 flex items-center space-x-4 border-t pt-4">
                          {item.status === 'pending' && (
                            <button
                              onClick={() => updateItemStatus(item._id, 'confirmed')}
                              disabled={updating}
                              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Confirm Item
                            </button>
                          )}
                          {item.status !== 'cancelled' && (
                            <button
                              onClick={() => updateItemStatus(item._id, 'cancelled')}
                              disabled={updating}
                              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Item
                            </button>
                          )}
                        </div>
                      )}
                      {item.status === 'cancelled' && item.cancelReason && (
                        <div className="mt-4 border-t pt-4">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Cancel Reason:</span> {item.cancelReason}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Order Summary After Items */}
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Items Total ({order.orderItems.filter(item => item.status !== 'cancelled').length} items)</span>
                      <span>৳{order.itemsPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Shipping</span>
                      <span>৳{order.shippingPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Tax</span>
                      <span>৳{order.taxPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-medium text-gray-900 pt-2 border-t">
                      <span>Total</span>
                      <span>৳{order.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Info Sidebar */}
          <div>
            <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
              {/* Customer Info */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <User className="h-5 w-5 mr-2" />
                    <span>{order.user.name}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-5 w-5 mr-2" />
                    <span>{order.user.email}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start text-gray-600">
                    <MapPin className="h-5 w-5 mr-2 mt-1" />
                    <span>{order.shippingAddress.address}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-5 w-5 mr-2" />
                    <span>{order.shippingAddress.phone}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Payment Method</span>
                    <span className="font-medium text-gray-900">
                      {order.paymentMethod.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Payment Status</span>
                    <span className={`font-medium ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                      {order.isPaid ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                  {order.paidAt && (
                    <div className="flex justify-between text-gray-600">
                      <span>Paid At</span>
                      <span>{formatDate(order.paidAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>৳{order.itemsPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>৳{order.shippingPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>৳{order.taxPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-900 font-semibold">
                    <span>Total</span>
                    <span>৳{order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Order Dates */}
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>Order Date: {formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>Last Updated: {formatDate(order.updatedAt || order.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
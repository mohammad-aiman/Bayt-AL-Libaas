'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'react-hot-toast';
import { 
  MapPin, 
  Phone, 
  CreditCard, 
  Truck, 
  Shield, 
  AlertCircle, 
  CheckCircle,
  ArrowLeft,
  Lock
} from 'lucide-react';

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // Mobile step indicator
  const [shippingData, setShippingData] = useState({
    address: '',
    state: '',
    phone: '',
  });
  
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    if (items.length === 0) {
      router.push('/cart');
      return;
    }
  }, [session, items, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingData(prev => ({
      ...prev,
      [name as keyof typeof prev]: value,
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!shippingData.address.trim()) {
      errors.address = 'Address is required';
    } else if (shippingData.address.trim().length < 10) {
      errors.address = 'Please provide a complete address';
    }
    
    if (!shippingData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,20}$/;
      if (!phoneRegex.test(shippingData.phone)) {
        errors.phone = 'Please enter a valid phone number';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    if (loading) return;
    
    setLoading(true);
    
    try {
      if (!items || items.length === 0) {
        toast.error('Your cart is empty');
        router.push('/cart');
        return;
      }

      const invalidItems = items.filter(item => 
        !item.productId || !item.name || !item.price || !item.quantity || !item.size || !item.color
      );
      
      if (invalidItems.length > 0) {
        toast.error('Some items in your cart are invalid. Please refresh and try again.');
        return;
      }

      const orderData = {
        orderItems: items.map(item => ({
          product: item.productId,
          name: item.name,
          image: item.image || '',
          price: Number(item.price),
          quantity: Number(item.quantity),
          size: item.size,
          color: item.color,
        })),
        shippingAddress: {
          address: shippingData.address.trim(),
          state: shippingData.state || '',
          phone: shippingData.phone.trim(),
        },
        paymentMethod: paymentMethod,
        itemsPrice: Number(totalPrice),
        shippingPrice: totalPrice > 2000 ? 0 : 60,
        taxPrice: 0,
        totalPrice: Number(totalPrice) + (totalPrice > 2000 ? 0 : 60),
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const order = data.data;
        clearCart();
        toast.success('Order placed successfully!');
        router.push(`/orders/${order._id}`);
      } else {
        toast.error(data.message || 'Order creation failed');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error('Network error. Please check your connection and try again.');
      } else if (error instanceof Error) {
        toast.error(error.message || 'Something went wrong. Please try again.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!session || items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent-purple-600"></div>
      </div>
    );
  }

  const shippingPrice = totalPrice > 2000 ? 0 : 60;
  const finalTotal = totalPrice + shippingPrice;

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
              <h1 className="text-mobile-xl font-bold text-gray-900">Checkout</h1>
              <p className="text-mobile-sm text-gray-600">Secure payment</p>
            </div>
          </div>
        </div>
        
        {/* Mobile Progress Bar */}
        <div className="px-4 pb-4">
          <div className="flex items-center space-x-2">
            <div className={`flex-1 h-2 rounded-full ${currentStep >= 1 ? 'bg-accent-purple-600' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-2 rounded-full ${currentStep >= 2 ? 'bg-accent-purple-600' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-2 rounded-full ${currentStep >= 3 ? 'bg-accent-purple-600' : 'bg-gray-200'}`} />
          </div>
          <div className="mt-2 flex justify-between text-mobile-xs text-gray-600">
            <span>Shipping</span>
            <span>Payment</span>
            <span>Confirm</span>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="mobile:hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order securely</p>
        </div>
      </div>
        
      <div className="max-w-7xl mx-auto mobile:px-0 sm:px-4 lg:px-8 mobile:pb-8 sm:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form - Mobile Optimized */}
          <div className="mobile:px-4 sm:px-0">
            <div className="mobile:bg-transparent sm:bg-white mobile:rounded-none sm:rounded-lg mobile:shadow-none sm:shadow mobile:p-0 sm:p-6">
              <h2 className="mobile:text-mobile-xl mobile:font-bold mobile:text-gray-900 mobile:mb-6 sm:text-xl sm:font-semibold sm:text-gray-900 sm:mb-6">
                Shipping Information
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Address Field */}
                <div>
                  <label className="mobile:flex mobile:items-center mobile:text-mobile-base mobile:font-semibold mobile:text-gray-900 mobile:mb-3 sm:block sm:text-sm sm:font-medium sm:text-gray-700 sm:mb-2">
                    <MapPin className="mobile:h-5 mobile:w-5 mobile:mr-2 mobile:text-accent-purple-600 sm:hidden" />
                    Delivery Address *
                  </label>
                  <textarea
                    name="address"
                    value={shippingData.address}
                    onChange={(e) => handleInputChange(e as any)}
                    className={`mobile:w-full mobile:px-4 mobile:py-4 mobile:border mobile:rounded-mobile-lg mobile:focus:ring-2 mobile:focus:ring-accent-purple-500 mobile:focus:border-transparent mobile:text-mobile-base mobile:placeholder-gray-500 mobile:min-h-[100px] mobile:resize-y sm:w-full sm:px-3 sm:py-2 sm:border sm:border-gray-300 sm:rounded-md sm:focus:outline-none sm:focus:ring-2 sm:focus:ring-accent-purple-500 ${
                      formErrors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Street address, house number, apartment, city, postal code"
                    required
                    rows={3}
                  />
                  {formErrors.address && (
                    <div className="mobile:mt-2 mobile:flex mobile:items-center mobile:text-mobile-sm mobile:text-red-600 sm:mt-1 sm:flex sm:items-center sm:text-sm sm:text-red-600">
                      <AlertCircle className="mobile:h-4 mobile:w-4 mobile:mr-1 sm:h-4 sm:w-4 sm:mr-1" />
                      {formErrors.address}
                    </div>
                  )}
                  <p className="mobile:mt-2 mobile:text-mobile-sm mobile:text-gray-600 sm:text-sm sm:text-gray-500 sm:mt-1">
                    Please include your complete address with city and postal code
                  </p>
                </div>
                
                {/* State and Phone Row */}
                <div className="mobile:space-y-6 sm:grid sm:grid-cols-1 md:grid-cols-2 md:gap-4 md:space-y-0">
                  <div>
                    <label className="mobile:flex mobile:items-center mobile:text-mobile-base mobile:font-semibold mobile:text-gray-900 mobile:mb-3 sm:block sm:text-sm sm:font-medium sm:text-gray-700 sm:mb-2">
                      <MapPin className="mobile:h-5 mobile:w-5 mobile:mr-2 mobile:text-accent-purple-600 sm:hidden" />
                      State/Division
                    </label>
                    <select
                      name="state"
                      value={shippingData.state}
                      onChange={handleInputChange}
                      className="mobile:w-full mobile:px-4 mobile:py-4 mobile:border mobile:border-gray-300 mobile:rounded-mobile-lg mobile:focus:ring-2 mobile:focus:ring-accent-purple-500 mobile:focus:border-transparent mobile:text-mobile-base mobile:bg-white sm:w-full sm:px-3 sm:py-2 sm:border sm:border-gray-300 sm:rounded-md sm:focus:outline-none sm:focus:ring-2 sm:focus:ring-accent-purple-500"
                    >
                      <option value="">Select State/Division</option>
                      <option value="Dhaka">Dhaka</option>
                      <option value="Chittagong">Chittagong</option>
                      <option value="Rajshahi">Rajshahi</option>
                      <option value="Khulna">Khulna</option>
                      <option value="Barishal">Barishal</option>
                      <option value="Sylhet">Sylhet</option>
                      <option value="Rangpur">Rangpur</option>
                      <option value="Mymensingh">Mymensingh</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="mobile:flex mobile:items-center mobile:text-mobile-base mobile:font-semibold mobile:text-gray-900 mobile:mb-3 sm:block sm:text-sm sm:font-medium sm:text-gray-700 sm:mb-2">
                      <Phone className="mobile:h-5 mobile:w-5 mobile:mr-2 mobile:text-accent-purple-600 sm:hidden" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingData.phone}
                      onChange={handleInputChange}
                      className={`mobile:w-full mobile:px-4 mobile:py-4 mobile:border mobile:rounded-mobile-lg mobile:focus:ring-2 mobile:focus:ring-accent-purple-500 mobile:focus:border-transparent mobile:text-mobile-base mobile:placeholder-gray-500 sm:w-full sm:px-3 sm:py-2 sm:border sm:border-gray-300 sm:rounded-md sm:focus:outline-none sm:focus:ring-2 sm:focus:ring-accent-purple-500 ${
                        formErrors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+880 1234567890"
                      required
                    />
                    {formErrors.phone && (
                      <div className="mobile:mt-2 mobile:flex mobile:items-center mobile:text-mobile-sm mobile:text-red-600 sm:mt-1 sm:flex sm:items-center sm:text-sm sm:text-red-600">
                        <AlertCircle className="mobile:h-4 mobile:w-4 mobile:mr-1 sm:h-4 sm:w-4 sm:mr-1" />
                        {formErrors.phone}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Payment Method */}
                <div>
                  <h3 className="mobile:flex mobile:items-center mobile:text-mobile-lg mobile:font-bold mobile:text-gray-900 mobile:mb-4 sm:text-lg sm:font-semibold sm:text-gray-900 sm:mb-4">
                    <CreditCard className="mobile:h-5 mobile:w-5 mobile:mr-2 mobile:text-accent-purple-600 sm:hidden" />
                    Payment Method
                  </h3>
                  
                  <div className="mobile:space-y-3 sm:space-y-3">
                    {/* Online Payment - Disabled */}
                    <div className="mobile:p-4 mobile:bg-gray-50 mobile:border mobile:border-gray-200 mobile:rounded-mobile-lg mobile:opacity-50 sm:flex sm:items-center sm:opacity-50 sm:cursor-not-allowed">
                      <input
                        type="radio"
                        id="sslcommerz"
                        name="paymentMethod"
                        value="sslcommerz"
                        disabled
                        className="mobile:h-5 mobile:w-5 mobile:text-gray-400 mobile:focus:ring-gray-300 mobile:border-gray-300 mobile:cursor-not-allowed sm:h-4 sm:w-4 sm:text-gray-400 sm:focus:ring-gray-300 sm:border-gray-300 sm:cursor-not-allowed"
                      />
                      <label htmlFor="sslcommerz" className="mobile:ml-3 mobile:flex-1 sm:ml-3 sm:block sm:text-sm sm:font-medium sm:text-gray-400 sm:cursor-not-allowed">
                        <div className="mobile:flex mobile:items-center mobile:justify-between sm:block">
                          <span className="mobile:text-mobile-base mobile:font-medium mobile:text-gray-400 sm:block">
                            Online Payment (bKash, Nagad, Card)
                          </span>
                          <span className="mobile:text-mobile-xs mobile:bg-gray-200 mobile:text-gray-500 mobile:px-2 mobile:py-1 mobile:rounded-mobile sm:block sm:text-xs sm:text-gray-400 sm:mt-1">
                            Currently unavailable
                          </span>
                        </div>
                      </label>
                    </div>
                    
                    {/* Cash on Delivery */}
                    <div className="mobile:p-4 mobile:bg-white mobile:border-2 mobile:border-accent-purple-200 mobile:rounded-mobile-lg mobile:shadow-mobile sm:flex sm:items-center">
                      <input
                        type="radio"
                        id="cod"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mobile:h-5 mobile:w-5 mobile:text-accent-purple-600 mobile:focus:ring-accent-purple-500 mobile:border-gray-300 sm:h-4 sm:w-4 sm:text-accent-purple-600 sm:focus:ring-accent-purple-500 sm:border-gray-300"
                      />
                      <label htmlFor="cod" className="mobile:ml-3 mobile:flex-1 sm:ml-3 sm:block sm:text-sm sm:font-medium sm:text-gray-700">
                        <div className="mobile:flex mobile:items-center mobile:justify-between sm:block">
                          <span className="mobile:text-mobile-base mobile:font-semibold mobile:text-gray-900 sm:block">
                            Cash on Delivery
                          </span>
                          <CheckCircle className="mobile:h-5 mobile:w-5 mobile:text-green-600 sm:hidden" />
                        </div>
                        <span className="mobile:block mobile:text-mobile-sm mobile:text-gray-600 mobile:mt-1 sm:block sm:text-xs sm:text-gray-500 sm:mt-1">
                          Pay when you receive your order
                        </span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Payment Notice */}
                  <div className="mobile:mt-4 mobile:p-4 mobile:bg-gradient-to-r mobile:from-yellow-50 mobile:to-orange-50 mobile:border mobile:border-yellow-200 mobile:rounded-mobile-lg sm:mt-4 sm:p-4 sm:bg-yellow-50 sm:border sm:border-yellow-200 sm:rounded-md">
                    <div className="mobile:flex mobile:items-start mobile:space-x-3 sm:flex sm:items-start sm:space-x-3">
                      <AlertCircle className="mobile:h-5 mobile:w-5 mobile:text-yellow-600 mobile:flex-shrink-0 mobile:mt-0.5 sm:h-5 sm:w-5 sm:text-yellow-600 sm:flex-shrink-0 sm:mt-0.5" />
                      <div>
                        <p className="mobile:text-mobile-sm mobile:text-yellow-800 mobile:font-medium sm:text-sm sm:text-yellow-800 sm:font-medium">
                          Payment Information
                        </p>
                        <p className="mobile:mt-1 mobile:text-mobile-sm mobile:text-yellow-700 sm:mt-1 sm:text-sm sm:text-yellow-700">
                          Currently, we only accept Cash on Delivery payments. Online payment options will be available soon.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="mobile:pt-6 mobile:border-t mobile:border-gray-200 sm:pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="mobile:w-full mobile:flex mobile:items-center mobile:justify-center mobile:py-4 mobile:px-6 mobile:bg-gradient-to-r mobile:from-accent-purple-600 mobile:to-accent-blue-600 mobile:text-white mobile:rounded-mobile-lg mobile:hover:from-accent-purple-700 mobile:hover:to-accent-blue-700 mobile:transition-all mobile:duration-200 mobile:font-semibold mobile:text-mobile-lg mobile:shadow-mobile-lg mobile:disabled:opacity-50 mobile:disabled:cursor-not-allowed mobile:min-h-touch sm:w-full sm:bg-accent-purple-600 sm:text-white sm:py-3 sm:px-4 sm:rounded-md sm:hover:bg-accent-purple-700 sm:transition-colors sm:disabled:opacity-50 sm:disabled:cursor-not-allowed sm:font-medium"
                  >
                    {loading ? (
                      <div className="mobile:flex mobile:items-center mobile:justify-center sm:flex sm:items-center sm:justify-center">
                        <div className="mobile:animate-spin mobile:rounded-full mobile:h-5 mobile:w-5 mobile:border-b-2 mobile:border-white mobile:mr-3 sm:animate-spin sm:rounded-full sm:h-5 sm:w-5 sm:border-b-2 sm:border-white sm:mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <>
                        <Lock className="mobile:mr-2 mobile:h-5 mobile:w-5 sm:mr-2 sm:h-5 sm:w-5" />
                        Place Order Securely
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Order Summary - Mobile Optimized */}
          <div className="mobile:px-4 sm:px-0">
            <div className="mobile:bg-white mobile:rounded-mobile-lg mobile:shadow-mobile mobile:p-4 mobile:sticky mobile:top-20 sm:bg-white sm:rounded-lg sm:shadow sm:p-6 sm:h-fit">
              <h2 className="mobile:text-mobile-lg mobile:font-bold mobile:text-gray-900 mobile:mb-4 sm:text-xl sm:font-semibold sm:text-gray-900 sm:mb-6">
                Order Summary
              </h2>
              
              {/* Order Items - Collapsible on Mobile */}
              <div className="mobile:max-h-60 mobile:overflow-y-auto mobile:border mobile:border-gray-200 mobile:rounded-mobile mobile:p-3 mobile:mb-4 sm:space-y-4 sm:mb-6 sm:border-none sm:p-0 sm:max-h-none sm:overflow-visible">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.size}-${item.color}`} className="mobile:flex mobile:items-center mobile:space-x-3 mobile:py-2 mobile:border-b mobile:border-gray-100 mobile:last:border-b-0 sm:flex sm:items-center sm:space-x-4 sm:py-0 sm:border-b-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="mobile:w-12 mobile:h-12 mobile:object-cover mobile:rounded-mobile sm:w-16 sm:h-16 sm:object-cover sm:rounded-md"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/placeholder-product.jpg';
                      }}
                    />
                    <div className="mobile:flex-1 mobile:min-w-0 sm:flex-1">
                      <h3 className="mobile:text-mobile-sm mobile:font-medium mobile:text-gray-900 mobile:truncate sm:font-medium sm:text-gray-900">
                        {item.name}
                      </h3>
                      <p className="mobile:text-mobile-xs mobile:text-gray-600 mobile:mt-0.5 sm:text-sm sm:text-gray-600">
                        {item.size} • {item.color} • Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="mobile:text-mobile-sm mobile:font-semibold mobile:text-gray-900 sm:font-medium sm:text-gray-900">
                      ৳{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Pricing Summary */}
              <div className="mobile:border-t mobile:border-gray-200 mobile:pt-4 mobile:space-y-3 sm:border-t sm:border-gray-200 sm:pt-4 sm:space-y-2">
                <div className="mobile:flex mobile:justify-between mobile:text-mobile-base sm:flex sm:justify-between">
                  <span className="mobile:text-gray-600 sm:text-gray-600">Subtotal</span>
                  <span className="mobile:text-gray-900 mobile:font-semibold sm:text-gray-900">৳{totalPrice.toFixed(2)}</span>
                </div>
                
                <div className="mobile:flex mobile:justify-between mobile:text-mobile-base sm:flex sm:justify-between">
                  <span className="mobile:text-gray-600 sm:text-gray-600">Shipping</span>
                  <span className="mobile:text-gray-900 mobile:font-semibold sm:text-gray-900">
                    {shippingPrice === 0 ? 'Free' : `৳${shippingPrice.toFixed(2)}`}
                  </span>
                </div>
                
                <div className="mobile:flex mobile:justify-between mobile:text-mobile-base sm:flex sm:justify-between">
                  <span className="mobile:text-gray-600 sm:text-gray-600">Tax</span>
                  <span className="mobile:text-gray-900 mobile:font-semibold sm:text-gray-900">৳0.00</span>
                </div>
                
                <div className="mobile:flex mobile:justify-between mobile:text-mobile-lg mobile:font-bold mobile:border-t mobile:border-gray-200 mobile:pt-3 sm:flex sm:justify-between sm:text-lg sm:font-semibold sm:border-t sm:border-gray-200 sm:pt-2">
                  <span className="mobile:text-gray-900 sm:text-gray-900">Total</span>
                  <span className="mobile:text-gray-900 sm:text-gray-900">৳{finalTotal.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Security Features */}
              <div className="mobile:mt-6 mobile:space-y-3 sm:mt-6 sm:space-y-3">
                <div className="mobile:flex mobile:items-center mobile:space-x-2 mobile:text-mobile-sm mobile:text-gray-600 sm:flex sm:items-center sm:space-x-2 sm:text-sm sm:text-gray-600">
                  <Shield className="mobile:h-4 mobile:w-4 mobile:text-green-600 sm:h-4 sm:w-4 sm:text-green-600" />
                  <span>Secure & encrypted checkout</span>
                </div>
                <div className="mobile:flex mobile:items-center mobile:space-x-2 mobile:text-mobile-sm mobile:text-gray-600 sm:flex sm:items-center sm:space-x-2 sm:text-sm sm:text-gray-600">
                  <Truck className="mobile:h-4 mobile:w-4 mobile:text-green-600 sm:h-4 sm:w-4 sm:text-green-600" />
                  <span>Fast & reliable delivery</span>
                </div>
              </div>
              
              {/* Free Shipping Progress */}
              {totalPrice < 2000 && (
                <div className="mobile:mt-4 mobile:p-3 mobile:bg-gradient-to-r mobile:from-blue-50 mobile:to-accent-purple-50 mobile:rounded-mobile-lg mobile:border mobile:border-blue-200 sm:mt-4 sm:p-4 sm:bg-blue-50 sm:rounded-md">
                  <div className="mobile:flex mobile:items-center mobile:space-x-2 mobile:mb-2 sm:flex sm:items-center sm:space-x-2 sm:mb-2">
                    <Truck className="mobile:h-4 mobile:w-4 mobile:text-blue-600 sm:h-4 sm:w-4 sm:text-blue-600" />
                    <p className="mobile:text-mobile-sm mobile:text-blue-800 mobile:font-medium sm:text-sm sm:text-blue-700 sm:font-medium">
                      Add ৳{(2000 - totalPrice).toFixed(2)} more for free shipping!
                    </p>
                  </div>
                  <div className="mobile:bg-blue-200 mobile:rounded-full mobile:h-2 sm:bg-blue-200 sm:rounded-full sm:h-2">
                    <div 
                      className="mobile:bg-blue-600 mobile:h-2 mobile:rounded-full mobile:transition-all mobile:duration-500 sm:bg-blue-600 sm:h-2 sm:rounded-full sm:transition-all sm:duration-500" 
                      style={{ width: `${Math.min((totalPrice / 2000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
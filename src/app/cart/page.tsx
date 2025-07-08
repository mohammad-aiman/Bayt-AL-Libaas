'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'react-hot-toast';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Gift, Truck, Shield } from 'lucide-react';

export default function CartPage() {
  const {
    items,
    totalItems,
    totalPrice,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadCart,
  } = useCartStore();

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      toast.success('Item removed from cart', {
        duration: 2000,
        position: 'top-center',
      });
    } else {
      updateQuantity(productId, quantity);
    }
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
    toast.success('Item removed from cart', {
      duration: 2000,
      position: 'top-center',
    });
  };

  const handleClearCart = () => {
    clearCart();
    toast.success('Cart cleared', {
      duration: 2000,
      position: 'top-center',
    });
  };

  const shippingPrice = totalPrice > 2000 ? 0 : 60;
  const finalTotal = totalPrice + shippingPrice;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto mobile:px-4 sm:px-6 lg:px-8 mobile:py-8 sm:py-16">
          {/* Mobile Empty State */}
          <div className="mobile:text-center sm:text-center">
            <div className="mobile:mx-auto mobile:h-16 mobile:w-16 mobile:text-gray-400 mobile:mb-6 sm:mx-auto sm:h-12 sm:w-12 sm:text-gray-400">
              <ShoppingBag className="mobile:w-full mobile:h-full sm:w-full sm:h-full" />
            </div>
            <h2 className="mobile:text-mobile-3xl mobile:font-bold mobile:text-gray-900 mobile:mb-3 sm:mt-4 sm:text-2xl sm:font-bold sm:text-gray-900">
              Your cart is empty
            </h2>
            <p className="mobile:text-mobile-lg mobile:text-gray-600 mobile:mb-8 mobile:px-4 sm:mt-2 sm:text-gray-600">
              Start shopping to add items to your cart!
            </p>
            
            {/* Mobile CTA */}
            <div className="mobile:px-4 sm:mt-8">
              <Link
                href="/shop"
                className="mobile:w-full mobile:flex mobile:items-center mobile:justify-center mobile:px-6 mobile:py-4 mobile:bg-gradient-to-r mobile:from-accent-purple-600 mobile:to-accent-blue-600 mobile:text-white mobile:rounded-mobile-lg mobile:hover:from-accent-purple-700 mobile:hover:to-accent-blue-700 mobile:transition-all mobile:duration-200 mobile:font-semibold mobile:text-mobile-lg mobile:shadow-mobile-lg mobile:min-h-touch sm:bg-gradient-to-r sm:from-accent-purple-600 sm:to-accent-blue-600 sm:text-white sm:px-6 sm:py-3 sm:rounded-md sm:hover:from-accent-purple-700 sm:hover:to-accent-blue-700 sm:transition-colors sm:font-medium"
              >
                <ShoppingBag className="mobile:mr-2 mobile:h-5 mobile:w-5 sm:mr-2 sm:h-5 sm:w-5" />
                Continue Shopping
              </Link>
            </div>

            {/* Mobile Features */}
            <div className="mobile:mt-12 mobile:grid mobile:grid-cols-1 mobile:gap-6 mobile:px-4 sm:hidden">
              <div className="mobile:flex mobile:items-center mobile:justify-center mobile:space-x-3 mobile:p-4 mobile:bg-white mobile:rounded-mobile-lg mobile:shadow-mobile">
                <Truck className="mobile:h-6 mobile:w-6 mobile:text-accent-purple-600" />
                <span className="mobile:text-mobile-sm mobile:font-medium mobile:text-gray-700">Free shipping over ৳2000</span>
              </div>
              <div className="mobile:flex mobile:items-center mobile:justify-center mobile:space-x-3 mobile:p-4 mobile:bg-white mobile:rounded-mobile-lg mobile:shadow-mobile">
                <Shield className="mobile:h-6 mobile:w-6 mobile:text-accent-purple-600" />
                <span className="mobile:text-mobile-sm mobile:font-medium mobile:text-gray-700">30-day return policy</span>
              </div>
              <div className="mobile:flex mobile:items-center mobile:justify-center mobile:space-x-3 mobile:p-4 mobile:bg-white mobile:rounded-mobile-lg mobile:shadow-mobile">
                <Gift className="mobile:h-6 mobile:w-6 mobile:text-accent-purple-600" />
                <span className="mobile:text-mobile-sm mobile:font-medium mobile:text-gray-700">Gift wrapping available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="mobile:block sm:block md:hidden bg-white shadow-mobile border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-mobile-2xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-mobile-sm text-gray-600 mt-1">{totalItems} items in your cart</p>
            </div>
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 text-mobile-sm font-medium p-2 hover:bg-red-50 rounded-mobile transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="mobile:hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mobile:px-0 sm:px-4 lg:px-8 mobile:pb-20 sm:pb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items - Mobile Optimized */}
          <div className="flex-1">
            <div className="mobile:bg-transparent sm:bg-white mobile:rounded-none sm:rounded-lg mobile:shadow-none sm:shadow">
              <div className="mobile:hidden sm:block px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Cart Items ({totalItems})
                </h2>
              </div>
              
              {/* Mobile Cart Items */}
              <div className="mobile:space-y-3 mobile:p-4 sm:divide-y sm:divide-gray-200 sm:p-0">
                {items.map((item) => (
                  <div 
                    key={`${item.productId}-${item.size}-${item.color}`} 
                    className="mobile:bg-white mobile:rounded-mobile-lg mobile:shadow-mobile mobile:p-4 sm:p-6 sm:bg-transparent sm:shadow-none sm:rounded-none flex mobile:flex-col sm:flex-row mobile:space-y-4 sm:space-y-0 sm:items-center sm:space-x-4"
                  >
                    {/* Mobile Product Image */}
                    <div className="mobile:flex mobile:items-start mobile:space-x-4 sm:flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="mobile:w-20 mobile:h-20 sm:w-20 sm:h-20 rounded-mobile object-cover"
                      />
                      
                      <div className="mobile:flex-1 sm:flex-1">
                        <h3 className="mobile:text-mobile-lg mobile:font-semibold mobile:text-gray-900 mobile:line-clamp-2 sm:text-lg sm:font-medium sm:text-gray-900">
                          {item.name}
                        </h3>
                        <div className="mobile:mt-1 mobile:flex mobile:flex-wrap mobile:items-center mobile:gap-2 mobile:text-mobile-sm mobile:text-gray-600 sm:mt-1 sm:flex sm:items-center sm:space-x-4 sm:text-sm sm:text-gray-600">
                          <span className="mobile:bg-gray-100 mobile:px-2 mobile:py-1 mobile:rounded-mobile mobile:text-mobile-xs sm:bg-transparent sm:px-0 sm:py-0 sm:rounded-none">
                            Size: {item.size}
                          </span>
                          <span className="mobile:bg-gray-100 mobile:px-2 mobile:py-1 mobile:rounded-mobile mobile:text-mobile-xs sm:bg-transparent sm:px-0 sm:py-0 sm:rounded-none">
                            Color: {item.color}
                          </span>
                        </div>
                        <div className="mobile:mt-2 mobile:text-mobile-xl mobile:font-bold mobile:text-gray-900 sm:mt-2 sm:text-lg sm:font-semibold sm:text-gray-900">
                          ৳{item.price}
                        </div>
                      </div>
                    </div>
                    
                    {/* Mobile Quantity and Actions */}
                    <div className="mobile:flex mobile:items-center mobile:justify-between sm:flex sm:items-center sm:space-x-4">
                      {/* Quantity Controls */}
                      <div className="mobile:flex mobile:items-center mobile:bg-gray-100 mobile:rounded-mobile-lg mobile:p-1 sm:flex sm:items-center sm:border sm:border-gray-300 sm:rounded-md sm:bg-white sm:p-0">
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                          className="mobile:w-10 mobile:h-10 mobile:flex mobile:items-center mobile:justify-center mobile:text-gray-600 mobile:hover:text-gray-800 mobile:hover:bg-gray-200 mobile:rounded-mobile mobile:transition-colors mobile:min-h-touch mobile:min-w-touch sm:px-3 sm:py-1 sm:hover:bg-gray-100 sm:transition-colors"
                        >
                          <Minus className="mobile:h-4 mobile:w-4 sm:h-4 sm:w-4" />
                        </button>
                        <span className="mobile:px-4 mobile:py-2 mobile:text-mobile-lg mobile:font-semibold mobile:text-gray-900 mobile:min-w-[3rem] mobile:text-center sm:px-4 sm:py-1 sm:border-x sm:border-gray-300 sm:text-center sm:min-w-[3rem]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                          className="mobile:w-10 mobile:h-10 mobile:flex mobile:items-center mobile:justify-center mobile:text-gray-600 mobile:hover:text-gray-800 mobile:hover:bg-gray-200 mobile:rounded-mobile mobile:transition-colors mobile:min-h-touch mobile:min-w-touch sm:px-3 sm:py-1 sm:hover:bg-gray-100 sm:transition-colors"
                        >
                          <Plus className="mobile:h-4 mobile:w-4 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                      
                      {/* Total Price and Remove */}
                      <div className="mobile:flex mobile:items-center mobile:space-x-4 sm:flex sm:items-center sm:space-x-4">
                        <div className="mobile:text-right sm:w-24 sm:text-right">
                          <span className="mobile:text-mobile-xl mobile:font-bold mobile:text-gray-900 sm:text-lg sm:font-semibold sm:text-gray-900">
                            ৳{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveItem(item.productId)}
                          className="mobile:p-2 mobile:text-red-600 mobile:hover:text-red-700 mobile:hover:bg-red-50 mobile:rounded-mobile mobile:transition-colors mobile:min-h-touch mobile:min-w-touch sm:text-red-600 sm:hover:text-red-700 sm:p-2"
                        >
                          <Trash2 className="mobile:w-5 mobile:h-5 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary - Mobile Optimized */}
          <div className="mobile:fixed mobile:bottom-0 mobile:left-0 mobile:right-0 mobile:bg-white mobile:border-t mobile:border-gray-200 mobile:p-4 mobile:shadow-xl lg:relative lg:w-96 lg:h-fit lg:bg-white lg:rounded-lg lg:shadow lg:p-6 lg:border-none">
            <h2 className="mobile:text-mobile-lg mobile:font-semibold mobile:text-gray-900 mobile:mb-4 sm:text-lg sm:font-semibold sm:text-gray-900 sm:mb-4">
              Order Summary
            </h2>
            
            {/* Mobile Collapsible Summary */}
            <div className="mobile:space-y-3 sm:space-y-3">
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
              
              <div className="mobile:border-t mobile:border-gray-200 mobile:pt-3 sm:border-t sm:border-gray-200 sm:pt-3">
                <div className="mobile:flex mobile:justify-between mobile:text-mobile-lg mobile:font-bold sm:flex sm:justify-between sm:text-lg sm:font-semibold">
                  <span className="mobile:text-gray-900 sm:text-gray-900">Total</span>
                  <span className="mobile:text-gray-900 sm:text-gray-900">
                    ৳{finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Mobile CTA Buttons */}
            <div className="mobile:mt-4 mobile:space-y-3 sm:mt-6">
              <Link
                href="/checkout"
                className="mobile:w-full mobile:flex mobile:items-center mobile:justify-center mobile:py-4 mobile:px-6 mobile:bg-gradient-to-r mobile:from-accent-purple-600 mobile:to-accent-blue-600 mobile:text-white mobile:rounded-mobile-lg mobile:hover:from-accent-purple-700 mobile:hover:to-accent-blue-700 mobile:transition-all mobile:duration-200 mobile:font-semibold mobile:text-mobile-lg mobile:shadow-mobile-lg mobile:min-h-touch sm:w-full sm:bg-gradient-to-r sm:from-accent-purple-600 sm:to-accent-blue-600 sm:text-white sm:py-3 sm:px-4 sm:rounded-md sm:hover:from-accent-purple-700 sm:hover:to-accent-blue-700 sm:transition-colors sm:font-medium sm:text-center sm:block"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="mobile:ml-2 mobile:h-5 mobile:w-5 sm:hidden" />
              </Link>
              
              <Link
                href="/shop"
                className="mobile:w-full mobile:text-center mobile:py-3 mobile:px-4 mobile:bg-gray-100 mobile:text-gray-700 mobile:rounded-mobile-lg mobile:hover:bg-gray-200 mobile:transition-colors mobile:font-medium mobile:text-mobile-base mobile:min-h-touch mobile:block sm:w-full sm:bg-gray-100 sm:text-gray-700 sm:py-3 sm:px-4 sm:rounded-md sm:hover:bg-gray-200 sm:transition-colors sm:font-medium sm:text-center sm:block"
              >
                Continue Shopping
              </Link>
            </div>
            
            {/* Shipping Benefits */}
            {totalPrice <= 2000 && (
              <div className="mobile:mt-4 mobile:p-3 mobile:bg-gradient-to-r mobile:from-blue-50 mobile:to-accent-purple-50 mobile:rounded-mobile-lg mobile:border mobile:border-blue-200 sm:mt-4 sm:p-4 sm:bg-blue-50 sm:border sm:border-blue-200 sm:rounded-md">
                <div className="mobile:flex mobile:items-center mobile:space-x-2 sm:flex sm:items-center sm:space-x-2">
                  <Truck className="mobile:h-5 mobile:w-5 mobile:text-blue-600 sm:h-5 sm:w-5 sm:text-blue-600 mobile:flex-shrink-0" />
                  <p className="mobile:text-mobile-sm mobile:text-blue-800 mobile:font-medium sm:text-sm sm:text-blue-700">
                    Add ৳{(2000 - totalPrice).toFixed(2)} more for free shipping!
                  </p>
                </div>
                <div className="mobile:mt-2 mobile:bg-blue-200 mobile:rounded-full mobile:h-2 sm:mt-2 sm:bg-blue-200 sm:rounded-full sm:h-2">
                  <div 
                    className="mobile:bg-blue-600 mobile:h-2 mobile:rounded-full mobile:transition-all mobile:duration-500 sm:bg-blue-600 sm:h-2 sm:rounded-full sm:transition-all sm:duration-500" 
                    style={{ width: `${Math.min((totalPrice / 2000) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Mobile Features */}
            <div className="mobile:hidden sm:block sm:mt-6 sm:space-y-3">
              <div className="sm:flex sm:items-center sm:space-x-2 sm:text-sm sm:text-gray-600">
                <Shield className="sm:h-4 sm:w-4 sm:text-green-600" />
                <span>Secure checkout</span>
              </div>
              <div className="sm:flex sm:items-center sm:space-x-2 sm:text-sm sm:text-gray-600">
                <Gift className="sm:h-4 sm:w-4 sm:text-green-600" />
                <span>Gift wrapping available</span>
              </div>
              <div className="sm:flex sm:items-center sm:space-x-2 sm:text-sm sm:text-gray-600">
                <Truck className="sm:h-4 sm:w-4 sm:text-green-600" />
                <span>Fast delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
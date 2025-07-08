'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'react-hot-toast';
import { ShoppingCart, Star, Heart, Eye } from 'lucide-react';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/products?featured=true&limit=8');
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: product.sizes[0] || 'M',
      color: product.colors[0] || 'Default',
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
    }).format(price);
  };

  return (
    <div className="mobile:py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto mobile:px-4 sm:px-6 lg:px-8">
        {/* Section Header - Mobile Optimized */}
        <div className="mobile:text-center sm:text-center">
          <h2 className="mobile:text-mobile-sm mobile:font-semibold mobile:tracking-wide mobile:uppercase mobile:text-accent-purple-600 sm:text-base sm:font-semibold sm:tracking-wide sm:uppercase sm:text-accent-purple-600">
            Featured Collection
          </h2>
          <p className="mobile:mt-2 mobile:text-mobile-3xl mobile:leading-tight mobile:font-extrabold mobile:tracking-tight mobile:text-gray-900 sm:mt-2 sm:text-3xl sm:leading-8 sm:font-extrabold sm:tracking-tight sm:text-gray-900 md:text-4xl">
            Trending Now
          </p>
          <p className="mobile:mt-4 mobile:max-w-2xl mobile:text-mobile-lg mobile:text-gray-600 mobile:mx-auto sm:mt-4 sm:max-w-2xl sm:text-xl sm:text-gray-500 lg:mx-auto">
            Discover our handpicked selection of the most popular items this season.
          </p>
        </div>

        {loading ? (
          /* Mobile-First Loading State */
          <div className="mobile:mt-8 sm:mt-16 grid mobile:grid-cols-2 mobile:gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="mobile:animate-pulse">
                <div className="mobile:h-48 mobile:bg-gray-300 mobile:rounded-mobile-lg sm:h-64 lg:h-80 bg-gray-300 rounded-lg"></div>
                <div className="mobile:mt-3 mobile:space-y-2 sm:mt-4">
                  <div className="mobile:h-3 mobile:bg-gray-300 mobile:rounded mobile:w-3/4 sm:h-4"></div>
                  <div className="mobile:h-3 mobile:bg-gray-300 mobile:rounded mobile:w-1/2 sm:h-4"></div>
                  <div className="mobile:h-6 mobile:bg-gray-300 mobile:rounded mobile:w-full sm:h-8"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="mobile:mt-8 sm:mt-16">
            {/* Mobile-First Product Grid */}
            <div className="grid mobile:grid-cols-2 mobile:gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {products.slice(0, 8).map((product) => (
                <div
                  key={product._id}
                  className="group relative bg-white mobile:border mobile:border-gray-200 mobile:rounded-mobile-lg mobile:shadow-mobile hover:shadow-mobile-lg sm:rounded-lg sm:shadow-sm sm:hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  {/* Product Image Container */}
                  <div className="mobile:aspect-mobile-product sm:aspect-w-1 sm:aspect-h-1 w-full overflow-hidden mobile:rounded-t-mobile-lg sm:rounded-t-lg bg-gray-200 relative">
                    <Link href={`/products/${product.slug}`} className="block w-full h-full">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={400}
                        height={400}
                        className="mobile:h-48 sm:h-64 lg:h-80 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </Link>
                    
                    {/* Sale Badge */}
                    {product.discountPrice && (
                      <div className="absolute mobile:top-2 mobile:left-2 mobile:bg-red-500 mobile:text-white mobile:px-2 mobile:py-1 mobile:rounded-mobile mobile:text-mobile-xs mobile:font-bold sm:top-2 sm:left-2 sm:bg-red-500 sm:text-white sm:px-2 sm:py-1 sm:rounded-md sm:text-sm sm:font-medium">
                        SALE
                      </div>
                    )}

                    {/* Mobile Action Overlay */}
                    <div className="mobile:absolute mobile:inset-0 mobile:bg-black/20 mobile:opacity-0 group-hover:opacity-100 mobile:transition-opacity mobile:duration-300 mobile:flex mobile:items-center mobile:justify-center mobile:space-x-2 lg:opacity-0 lg:group-hover:opacity-100">
                      {/* Quick View - Mobile */}
                      <Link
                        href={`/products/${product.slug}`}
                        className="mobile:bg-white mobile:text-gray-900 mobile:p-2 mobile:rounded-full mobile:shadow-mobile-lg mobile:hover:bg-gray-100 mobile:transition-colors mobile:transform mobile:scale-0 group-hover:scale-100 mobile:transition-transform mobile:duration-200 sm:p-3"
                        title="Quick View"
                      >
                        <Eye className="mobile:w-4 mobile:h-4 sm:w-5 sm:h-5" />
                      </Link>
                      
                      {/* Add to Wishlist */}
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

                      {/* Quick Add to Cart */}
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="mobile:bg-accent-purple-600 mobile:text-white mobile:p-2 mobile:rounded-full mobile:shadow-mobile-lg mobile:hover:bg-accent-purple-700 mobile:transition-colors mobile:transform mobile:scale-0 group-hover:scale-100 mobile:transition-transform mobile:duration-200 mobile:disabled:bg-gray-400 mobile:disabled:cursor-not-allowed sm:p-3"
                        title="Add to Cart"
                      >
                        <ShoppingCart className="mobile:w-4 mobile:h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>

                    {/* Stock Status */}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="mobile:text-white mobile:font-semibold mobile:text-mobile-sm mobile:bg-black/75 mobile:px-3 mobile:py-2 mobile:rounded-mobile-lg sm:text-white sm:font-medium sm:bg-black/75 sm:px-4 sm:py-2 sm:rounded-lg">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="mobile:p-3 sm:p-4">
                    <Link href={`/products/${product.slug}`} className="block">
                      <h3 className="mobile:text-mobile-base mobile:font-medium mobile:text-gray-900 mobile:hover:text-accent-purple-600 mobile:transition-colors mobile:line-clamp-2 sm:text-lg sm:font-medium sm:text-gray-900 sm:hover:text-accent-purple-600 sm:transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    
                    {/* Rating */}
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

                    {/* Price */}
                    <div className="mobile:mt-2 mobile:flex mobile:items-center mobile:justify-between sm:mt-2 sm:flex sm:items-center sm:justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="mobile:text-mobile-lg mobile:font-bold mobile:text-gray-900 sm:text-lg sm:font-bold sm:text-gray-900">
                          ৳{product.price}
                        </span>
                        {product.discountPrice && (
                          <span className="mobile:text-mobile-sm mobile:text-gray-500 mobile:line-through sm:text-sm sm:text-gray-500 sm:line-through">
                            ৳{product.discountPrice}
                          </span>
                        )}
                      </div>
                      
                      {product.stock <= 5 && product.stock > 0 && (
                        <span className="mobile:text-mobile-xs mobile:text-orange-600 mobile:font-medium sm:text-xs sm:text-orange-600 sm:font-medium">
                          Only {product.stock} left
                        </span>
                      )}
                    </div>

                    {/* Mobile Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="mobile:mt-3 mobile:w-full mobile:bg-accent-purple-600 mobile:text-white mobile:py-2 mobile:px-4 mobile:rounded-mobile mobile:hover:bg-accent-purple-700 mobile:transition-colors mobile:disabled:bg-gray-300 mobile:disabled:cursor-not-allowed mobile:text-mobile-sm mobile:font-medium mobile:min-h-touch sm:mt-3 sm:w-full sm:bg-accent-purple-600 sm:text-white sm:py-2 sm:px-4 sm:rounded-md sm:hover:bg-accent-purple-700 sm:transition-colors sm:disabled:bg-gray-300 sm:disabled:cursor-not-allowed"
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile-Optimized View All Button */}
            <div className="mobile:mt-8 mobile:text-center sm:mt-12 sm:text-center">
              <Link
                href="/shop"
                className="mobile:inline-flex mobile:items-center mobile:justify-center mobile:px-6 mobile:py-3 mobile:border mobile:border-transparent mobile:text-mobile-base mobile:font-medium mobile:rounded-mobile-lg mobile:text-white mobile:bg-gradient-to-r mobile:from-accent-purple-600 mobile:to-accent-blue-600 mobile:hover:from-accent-purple-700 mobile:hover:to-accent-blue-700 mobile:transition-all mobile:duration-200 mobile:shadow-mobile-lg mobile:hover:shadow-mobile-xl mobile:min-h-touch sm:inline-flex sm:items-center sm:px-6 sm:py-3 sm:border sm:border-transparent sm:text-base sm:font-medium sm:rounded-md sm:text-white sm:bg-accent-purple-600 sm:hover:bg-accent-purple-700 sm:transition-colors"
              >
                <span>View All Products</span>
                <svg className="mobile:ml-2 mobile:w-5 mobile:h-5 sm:ml-2 sm:-mr-1 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>
        ) : (
          /* Empty State - Mobile Optimized */
          <div className="mobile:mt-8 mobile:text-center sm:mt-16 sm:text-center">
            <div className="mobile:mx-auto mobile:h-12 mobile:w-12 mobile:text-gray-400 sm:mx-auto sm:h-12 sm:w-12 sm:text-gray-400">
              <ShoppingCart className="mobile:w-full mobile:h-full sm:w-full sm:h-full" />
            </div>
            <h3 className="mobile:mt-4 mobile:text-mobile-lg mobile:font-medium mobile:text-gray-900 sm:mt-4 sm:text-lg sm:font-medium sm:text-gray-900">
              No featured products available
            </h3>
            <p className="mobile:mt-2 mobile:text-mobile-base mobile:text-gray-500 sm:mt-2 sm:text-gray-500">
              Check back soon for our latest featured collection.
            </p>
            <div className="mobile:mt-6 sm:mt-6">
              <Link
                href="/shop"
                className="mobile:inline-flex mobile:items-center mobile:px-4 mobile:py-2 mobile:border mobile:border-transparent mobile:text-mobile-sm mobile:font-medium mobile:rounded-mobile mobile:text-accent-purple-600 mobile:bg-accent-purple-100 mobile:hover:bg-accent-purple-200 mobile:transition-colors sm:inline-flex sm:items-center sm:px-4 sm:py-2 sm:border sm:border-transparent sm:text-sm sm:font-medium sm:rounded-md sm:text-accent-purple-600 sm:bg-accent-purple-100 sm:hover:bg-accent-purple-200 sm:transition-colors"
              >
                Browse All Products
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
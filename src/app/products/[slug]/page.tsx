'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Product, Review } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'react-hot-toast';
import ImageModal from '@/components/ui/ImageModal';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Minus,
  MessageSquare,
  ThumbsUp,
  ArrowLeft,
  Trash2,
  Pencil
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [deletingReview, setDeletingReview] = useState<string | null>(null);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');

  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    if (params.slug) {
      fetchProduct();
      fetchReviews();
    }
  }, [params.slug]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.slug}`);
      const data = await response.json();
      
      if (data.success) {
        setProduct(data.data);
        setSelectedSize(data.data.sizes[0] || '');
        setSelectedColor(data.data.colors[0] || '');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/products/${params.slug}/reviews`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Only validate size and color if they exist in the product
    if (product.sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }

    if (product.colors.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }

    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: selectedSize || 'N/A',
      color: selectedColor || 'N/A',
      quantity,
    });

    toast.success('Added to cart!', {
      duration: 2000,
      position: 'top-center',
    });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error('Please sign in to leave a review');
      return;
    }

    setSubmittingReview(true);
    
    try {
      const response = await fetch(`/api/products/${params.slug}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewForm),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Review submitted successfully!');
        setReviewForm({ rating: 5, comment: '' });
        fetchReviews();
        fetchProduct(); // Refresh product to update rating
      } else {
        toast.error(data.message || 'Failed to submit review');
      }
    } catch (error) {
      toast.error('Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!session?.user || session.user.role !== 'admin') {
      toast.error('Admin access required');
      return;
    }

    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    setDeletingReview(reviewId);
    
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Review deleted successfully!');
        fetchReviews();
        fetchProduct(); // Refresh product to update rating
      } else {
        toast.error(data.message || 'Failed to delete review');
      }
    } catch (error) {
      toast.error('Error deleting review');
    } finally {
      setDeletingReview(null);
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditRating(0);
    setEditComment("");
  };

  const handleUpdateReview = async () => {
    if (!editingReview) return;

    setIsEditing(true);
    try {
      const response = await fetch(`/api/products/${params.slug}/reviews`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewId: editingReview._id,
          rating: editRating,
          comment: editComment,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update review");
      }

      toast.success("Review updated successfully");
      handleCancelEdit();
      // Refresh the reviews
      fetchReviews();
    } catch (error) {
      toast.error("Failed to update review");
      console.error(error);
    } finally {
      setIsEditing(false);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites', {
      duration: 1500,
    });
  };

  const shareProduct = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const nextImage = () => {
    if (product) {
      setActiveImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product) {
      setActiveImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setIsImageModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto mobile:px-4 sm:px-6 lg:px-8 mobile:py-4 sm:py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="mobile:h-80 sm:h-96 lg:h-[500px] bg-gray-300 rounded-mobile-lg" />
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="mobile:h-16 sm:h-20 bg-gray-300 rounded-mobile" />
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="mobile:h-6 sm:h-8 bg-gray-300 rounded" />
                <div className="mobile:h-4 sm:h-4 bg-gray-300 rounded w-2/3" />
                <div className="mobile:h-4 sm:h-6 bg-gray-300 rounded w-1/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center mobile:px-4">
          <h1 className="mobile:text-mobile-2xl sm:text-2xl font-bold text-gray-900 mobile:mb-2">Product not found</h1>
          <p className="mobile:text-mobile-base sm:mt-2 text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="mobile:block sm:block md:hidden bg-white shadow-mobile border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => window.history.back()}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-mobile transition-colors min-h-touch min-w-touch flex items-center justify-center"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-mobile transition-colors min-h-touch min-w-touch flex items-center justify-center ${
                isFavorite 
                  ? 'text-red-600 bg-red-50' 
                  : 'text-gray-600 hover:text-red-600 hover:bg-gray-100'
              }`}
            >
              <Heart className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            
            <button
              onClick={shareProduct}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-mobile transition-colors min-h-touch min-w-touch flex items-center justify-center"
            >
              <Share2 className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mobile:px-0 sm:px-4 lg:px-8 mobile:pb-8 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images - Mobile Optimized */}
          <div className="mobile:px-4 sm:px-0">
            <div className="space-y-4">
              {/* Main Image */}
              <div className="mobile:relative mobile:h-80 sm:relative sm:h-96 lg:h-[500px] mobile:rounded-mobile-lg sm:rounded-lg overflow-hidden bg-gray-200">
                <Image
                  src={product.images[activeImageIndex]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
                  onClick={() => handleImageClick(product.images[activeImageIndex])}
                />
                
                {/* Mobile Image Navigation */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="mobile:absolute mobile:left-2 mobile:top-1/2 mobile:transform mobile:-translate-y-1/2 mobile:bg-white/80 mobile:backdrop-blur-sm mobile:p-2 mobile:rounded-full mobile:shadow-mobile-lg mobile:hover:bg-white mobile:transition-colors sm:hidden"
                    >
                      <ChevronLeft className="mobile:h-6 mobile:w-6 mobile:text-gray-800" />
                    </button>
                    
                    <button
                      onClick={nextImage}
                      className="mobile:absolute mobile:right-2 mobile:top-1/2 mobile:transform mobile:-translate-y-1/2 mobile:bg-white/80 mobile:backdrop-blur-sm mobile:p-2 mobile:rounded-full mobile:shadow-mobile-lg mobile:hover:bg-white mobile:transition-colors sm:hidden"
                    >
                      <ChevronRight className="mobile:h-6 mobile:w-6 mobile:text-gray-800" />
                    </button>
                    
                    {/* Mobile Image Dots */}
                    <div className="mobile:absolute mobile:bottom-4 mobile:left-1/2 mobile:transform mobile:-translate-x-1/2 mobile:flex mobile:space-x-2 sm:hidden">
                      {product.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveImageIndex(index)}
                          className={`mobile:w-2 mobile:h-2 mobile:rounded-full mobile:transition-colors ${
                            activeImageIndex === index ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              {/* Desktop Thumbnail Grid */}
              <div className="mobile:hidden sm:grid sm:grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative h-20 rounded-md overflow-hidden border-2 transition-colors ${
                      activeImageIndex === index ? 'border-accent-purple-500' : 'border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 25vw, 25vw"
                    />
                  </button>
                ))}
              </div>
              
              {/* Mobile Features */}
              <div className="mobile:grid mobile:grid-cols-3 mobile:gap-3 mobile:mt-4 sm:hidden">
                <div className="mobile:flex mobile:items-center mobile:space-x-2 mobile:p-3 mobile:bg-white mobile:rounded-mobile-lg mobile:shadow-mobile">
                  <Truck className="mobile:h-4 mobile:w-4 mobile:text-accent-purple-600 mobile:flex-shrink-0" />
                  <span className="mobile:text-mobile-xs mobile:font-medium mobile:text-gray-700">Free Ship</span>
                </div>
                <div className="mobile:flex mobile:items-center mobile:space-x-2 mobile:p-3 mobile:bg-white mobile:rounded-mobile-lg mobile:shadow-mobile">
                  <RotateCcw className="mobile:h-4 mobile:w-4 mobile:text-accent-purple-600 mobile:flex-shrink-0" />
                  <span className="mobile:text-mobile-xs mobile:font-medium mobile:text-gray-700">Returns</span>
                </div>
                <div className="mobile:flex mobile:items-center mobile:space-x-2 mobile:p-3 mobile:bg-white mobile:rounded-mobile-lg mobile:shadow-mobile">
                  <Shield className="mobile:h-4 mobile:w-4 mobile:text-accent-purple-600 mobile:flex-shrink-0" />
                  <span className="mobile:text-mobile-xs mobile:font-medium mobile:text-gray-700">Secure</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details - Mobile Optimized */}
          <div className="mobile:px-4 sm:px-0 space-y-6">
            {/* Desktop Actions */}
            <div className="mobile:hidden sm:flex justify-end space-x-2">
              <button
                onClick={toggleFavorite}
                className={`p-2 rounded-md transition-colors ${
                  isFavorite 
                    ? 'text-red-600 bg-red-50' 
                    : 'text-gray-600 hover:text-red-600 hover:bg-gray-100'
                }`}
              >
                <Heart className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={shareProduct}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Share2 className="h-6 w-6" />
              </button>
            </div>

            {/* Product Info */}
            <div>
              <h1 className="mobile:text-mobile-2xl mobile:font-bold mobile:text-gray-900 mobile:leading-tight sm:text-3xl sm:font-bold sm:text-gray-900">
                {product.name}
              </h1>
              <p className="mobile:mt-2 mobile:text-mobile-base mobile:text-gray-600 mobile:leading-relaxed sm:mt-2 sm:text-gray-600">
                {product.description}
              </p>
            </div>

            {/* Rating */}
            <div className="mobile:flex mobile:items-center mobile:space-x-3 sm:flex sm:items-center sm:space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`mobile:w-5 mobile:h-5 sm:w-5 sm:h-5 ${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="mobile:text-mobile-base mobile:font-medium mobile:text-gray-900 sm:text-sm sm:text-gray-600">
                {product.rating} ({product.numReviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mobile:flex mobile:items-center mobile:space-x-4 sm:flex sm:items-center sm:space-x-4">
              <span className="mobile:text-mobile-4xl mobile:font-bold mobile:text-gray-900 sm:text-3xl sm:font-bold sm:text-gray-900">
                ৳{product.price}
              </span>
              {product.discountPrice && (
                <span className="mobile:text-mobile-xl mobile:text-gray-500 mobile:line-through sm:text-xl sm:text-gray-500 sm:line-through">
                  ৳{product.discountPrice}
                </span>
              )}
            </div>

            {/* Size Selection - Only show if product has sizes */}
            {product.sizes.length > 0 && (
              <div>
                <h3 className="mobile:text-mobile-lg mobile:font-semibold mobile:text-gray-900 mobile:mb-3 sm:text-sm sm:font-medium sm:text-gray-900 sm:mb-2">
                  Size
                </h3>
                <div className="mobile:grid mobile:grid-cols-4 mobile:gap-3 sm:flex sm:space-x-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`mobile:py-3 mobile:px-4 mobile:border mobile:rounded-mobile-lg mobile:font-semibold mobile:text-mobile-base mobile:transition-all mobile:min-h-touch sm:px-4 sm:py-2 sm:border sm:rounded-md ${
                        selectedSize === size
                          ? 'bg-accent-purple-600 text-white border-accent-purple-600'
                          : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection - Only show if product has colors */}
            {product.colors.length > 0 && (
              <div>
                <h3 className="mobile:text-mobile-lg mobile:font-semibold mobile:text-gray-900 mobile:mb-3 sm:text-sm sm:font-medium sm:text-gray-900 sm:mb-2">
                  Color
                </h3>
                <div className="mobile:grid mobile:grid-cols-4 mobile:gap-3 sm:flex sm:space-x-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`mobile:py-3 mobile:px-4 mobile:border mobile:rounded-mobile-lg mobile:font-semibold mobile:text-mobile-base mobile:transition-all mobile:min-h-touch sm:px-4 sm:py-2 sm:border sm:rounded-md ${
                        selectedColor === color
                          ? 'bg-accent-purple-600 text-white border-accent-purple-600'
                          : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="mobile:text-mobile-lg mobile:font-semibold mobile:text-gray-900 mobile:mb-3 sm:text-sm sm:font-medium sm:text-gray-900 sm:mb-2">
                Quantity
              </h3>
              <div className="mobile:flex mobile:items-center mobile:bg-gray-100 mobile:rounded-mobile-lg mobile:p-2 mobile:w-fit sm:flex sm:items-center sm:border sm:border-gray-300 sm:rounded-md sm:w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="mobile:w-10 mobile:h-10 mobile:flex mobile:items-center mobile:justify-center mobile:text-gray-600 mobile:hover:text-gray-800 mobile:hover:bg-gray-200 mobile:rounded-mobile mobile:transition-colors mobile:min-h-touch mobile:min-w-touch sm:px-3 sm:py-2 sm:hover:bg-gray-100 sm:transition-colors"
                >
                  <Minus className="mobile:h-5 mobile:w-5 sm:h-4 sm:w-4" />
                </button>
                <span className="mobile:px-6 mobile:py-2 mobile:text-mobile-lg mobile:font-semibold mobile:text-gray-900 mobile:min-w-[4rem] mobile:text-center sm:px-4 sm:py-2 sm:border-x sm:border-gray-300 sm:min-w-[3rem] sm:text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="mobile:w-10 mobile:h-10 mobile:flex mobile:items-center mobile:justify-center mobile:text-gray-600 mobile:hover:text-gray-800 mobile:hover:bg-gray-200 mobile:rounded-mobile mobile:transition-colors mobile:min-h-touch mobile:min-w-touch sm:px-3 sm:py-2 sm:hover:bg-gray-100 sm:transition-colors"
                >
                  <Plus className="mobile:h-5 mobile:w-5 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="mobile:space-y-3 sm:space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
               className="mobile:w-full mobile:flex mobile:items-center mobile:justify-center mobile:py-4 mobile:px-6 mobile:bg-gradient-to-r mobile:from-accent-purple-600 mobile:to-accent-blue-600 mobile:text-white mobile:rounded-mobile-lg mobile:hover:from-accent-purple-700 mobile:hover:to-accent-blue-700 mobile:transition-all mobile:duration-200 mobile:font-semibold mobile:text-mobile-lg mobile:shadow-mobile-lg mobile:disabled:bg-gray-400 mobile:disabled:cursor-not-allowed mobile:min-h-touch sm:w-full sm:flex sm:items-center sm:justify-center sm:py-3 sm:px-6 sm:bg-accent-purple-600 sm:text-white sm:rounded-lg sm:hover:bg-accent-purple-700 sm:transition-colors sm:font-semibold sm:text-base sm:disabled:bg-gray-400 sm:disabled:cursor-not-allowed"
              >
                <ShoppingCart className="mobile:mr-2 mobile:h-5 mobile:w-5 sm:mr-2 sm:h-5 sm:w-5" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>

              {/* Stock Info */}
              <div className="mobile:text-center sm:text-left">
                {product.stock > 0 ? (
                  <span className="mobile:text-mobile-sm mobile:text-gray-600 sm:text-sm sm:text-gray-600">
                    {product.stock <= 5 ? (
                      <span className="text-orange-600 font-medium">
                        Only {product.stock} left in stock
                      </span>
                    ) : (
                      `${product.stock} items in stock`
                    )}
                  </span>
                ) : (
                  <span className="mobile:text-mobile-sm mobile:text-red-600 mobile:font-medium sm:text-sm sm:text-red-600">
                    Out of stock
                  </span>
                )}
              </div>
            </div>

            {/* Desktop Features */}
            <div className="mobile:hidden sm:grid sm:grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Truck className="h-6 w-6 text-accent-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Free Shipping</p>
                  <p className="text-xs text-gray-600">On orders over ৳2000</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <RotateCcw className="h-6 w-6 text-accent-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Easy Returns</p>
                  <p className="text-xs text-gray-600">30-day return policy</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Shield className="h-6 w-6 text-accent-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Secure Payment</p>
                  <p className="text-xs text-gray-600">100% secure checkout</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section - Mobile Optimized */}
        <div className="mobile:mt-12 mobile:px-4 sm:mt-16 sm:px-0">
          <div className="mobile:bg-white mobile:rounded-mobile-lg mobile:shadow-mobile mobile:p-4 sm:bg-transparent sm:shadow-none sm:p-0">
            <div className="mobile:flex mobile:items-center mobile:justify-between mobile:mb-6 sm:flex sm:items-center sm:justify-between sm:mb-8">
              <h2 className="mobile:text-mobile-xl mobile:font-bold mobile:text-gray-900 sm:text-2xl sm:font-bold sm:text-gray-900">
                Reviews ({reviews.length})
              </h2>
              {reviews.length > 3 && (
                <button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="mobile:text-mobile-sm mobile:text-accent-purple-600 mobile:font-medium mobile:hover:text-accent-purple-700 sm:text-sm sm:text-accent-purple-600 sm:font-medium sm:hover:text-accent-purple-700"
                >
                  {showAllReviews ? 'Show Less' : 'Show All'}
                </button>
              )}
            </div>
            
            {/* Review Form */}
            {session && (
              <div className="mobile:bg-gray-50 mobile:rounded-mobile-lg mobile:p-4 mobile:mb-6 sm:bg-white sm:rounded-lg sm:shadow sm:p-6 sm:mb-8">
                <h3 className="mobile:text-mobile-lg mobile:font-semibold mobile:text-gray-900 mobile:mb-4 sm:text-lg sm:font-semibold sm:text-gray-900 sm:mb-4">
                  Write a Review
                </h3>
                
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="mobile:block mobile:text-mobile-base mobile:font-medium mobile:text-gray-700 mobile:mb-2 sm:block sm:text-sm sm:font-medium sm:text-gray-700 sm:mb-2">
                      Rating
                    </label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setReviewForm(prev => ({ ...prev, rating }))}
                          className={`mobile:w-10 mobile:h-10 mobile:flex mobile:items-center mobile:justify-center mobile:rounded-mobile mobile:transition-colors mobile:min-h-touch mobile:min-w-touch sm:w-8 sm:h-8 ${
                            rating <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          <Star className="mobile:w-6 mobile:h-6 sm:w-6 sm:h-6 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="mobile:block mobile:text-mobile-base mobile:font-medium mobile:text-gray-700 mobile:mb-2 sm:block sm:text-sm sm:font-medium sm:text-gray-700 sm:mb-2">
                      Comment
                    </label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                      rows={4}
                      className="mobile:w-full mobile:px-4 mobile:py-3 mobile:border mobile:border-gray-300 mobile:rounded-mobile-lg mobile:focus:ring-2 mobile:focus:ring-accent-purple-500 mobile:focus:border-transparent mobile:text-mobile-base mobile:placeholder-gray-500 mobile:resize-y sm:w-full sm:px-3 sm:py-2 sm:border sm:border-gray-300 sm:rounded-md sm:focus:outline-none sm:focus:ring-2 sm:focus:ring-accent-purple-500"
                      placeholder="Share your thoughts about this product..."
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="mobile:w-full mobile:bg-accent-purple-600 mobile:text-white mobile:px-6 mobile:py-3 mobile:rounded-mobile-lg mobile:hover:bg-accent-purple-700 mobile:transition-colors mobile:disabled:opacity-50 mobile:font-medium mobile:text-mobile-base mobile:min-h-touch sm:bg-accent-purple-600 sm:text-white sm:px-6 sm:py-2 sm:rounded-md sm:hover:bg-accent-purple-700 sm:transition-colors sm:disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            )}

            {/* Reviews List */}
            <div className="mobile:space-y-4 sm:space-y-6">
              {displayedReviews.map((review) => (
                <div key={review._id} className="mobile:border-b mobile:border-gray-200 mobile:pb-4 mobile:last:border-b-0 sm:bg-white sm:rounded-lg sm:shadow sm:p-6 sm:border-none">
                  <div className="mobile:flex mobile:items-start mobile:space-x-3 mobile:mb-3 sm:flex sm:items-center sm:justify-between sm:mb-4">
                    <div className="mobile:flex mobile:items-start mobile:space-x-3 sm:flex sm:items-center sm:space-x-3">
                      <div className="mobile:w-10 mobile:h-10 mobile:bg-accent-purple-600 mobile:rounded-full mobile:flex mobile:items-center mobile:justify-center mobile:flex-shrink-0 sm:w-10 sm:h-10 sm:bg-accent-purple-600 sm:rounded-full sm:flex sm:items-center sm:justify-center">
                        <span className="mobile:text-white mobile:font-semibold mobile:text-mobile-sm sm:text-white sm:font-medium">
                          {review.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="mobile:flex-1 mobile:min-w-0 sm:block">
                        <p className="mobile:font-semibold mobile:text-gray-900 mobile:text-mobile-base sm:font-medium sm:text-gray-900">
                          {review.user.name}
                        </p>
                        <div className="mobile:flex mobile:items-center mobile:mt-1 sm:flex sm:items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`mobile:w-4 mobile:h-4 sm:w-4 sm:h-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mobile:flex mobile:items-center mobile:space-x-2 sm:flex sm:items-center sm:space-x-2">
                      <span className="mobile:text-mobile-sm mobile:text-gray-500 mobile:flex-shrink-0 sm:text-sm sm:text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                      {session?.user?.role === 'admin' && (
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          disabled={deletingReview === review._id}
                          className="mobile:text-red-500 mobile:hover:text-red-700 mobile:p-1 mobile:rounded mobile:hover:bg-red-50 mobile:transition-colors mobile:disabled:opacity-50 sm:text-red-500 sm:hover:text-red-700 sm:p-1 sm:rounded sm:hover:bg-red-50 sm:transition-colors sm:disabled:opacity-50"
                          title="Delete Review (Admin Only)"
                        >
                          {deletingReview === review._id ? (
                            <div className="mobile:animate-spin mobile:rounded-full mobile:h-4 mobile:w-4 mobile:border-b-2 mobile:border-red-500 sm:animate-spin sm:rounded-full sm:h-4 sm:w-4 sm:border-b-2 sm:border-red-500"></div>
                          ) : (
                            <Trash2 className="mobile:h-4 mobile:w-4 sm:h-4 sm:w-4" />
                          )}
                        </button>
                      )}
                      {session?.user?.id === review.user._id && (
                        <button
                          onClick={() => handleEditReview(review)}
                          className="mobile:text-blue-600 mobile:hover:text-blue-800 mobile:p-1 mobile:rounded mobile:hover:bg-blue-50 mobile:transition-colors mobile:disabled:opacity-50 sm:text-blue-600 sm:hover:text-blue-800 sm:p-1 sm:rounded sm:hover:bg-blue-50 sm:transition-colors sm:disabled:opacity-50"
                          title="Edit Review"
                        >
                          <Pencil className="mobile:h-4 mobile:w-4 sm:h-4 sm:w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <p className="mobile:text-mobile-base mobile:text-gray-700 mobile:leading-relaxed sm:text-gray-700">
                    {editingReview?._id === review._id ? (
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        rows={4}
                        className="mobile:w-full mobile:px-4 mobile:py-3 mobile:border mobile:border-gray-300 mobile:rounded-mobile-lg mobile:focus:ring-2 mobile:focus:ring-accent-purple-500 mobile:focus:border-transparent mobile:text-mobile-base mobile:placeholder-gray-500 mobile:resize-y sm:w-full sm:px-3 sm:py-2 sm:border sm:border-gray-300 sm:rounded-md sm:focus:outline-none sm:focus:ring-2 sm:focus:ring-accent-purple-500"
                      />
                    ) : (
                      review.comment
                    )}
                  </p>
                </div>
              ))}
              
              {reviews.length === 0 && (
                <div className="mobile:text-center mobile:py-12 sm:text-center sm:py-8">
                  <MessageSquare className="mobile:mx-auto mobile:h-12 mobile:w-12 mobile:text-gray-400 mobile:mb-4 sm:mx-auto sm:h-12 sm:w-12 sm:text-gray-400" />
                  <h3 className="mobile:text-mobile-lg mobile:font-medium mobile:text-gray-900 mobile:mb-2 sm:text-lg sm:font-medium sm:text-gray-900">
                    No reviews yet
                  </h3>
                  <p className="mobile:text-mobile-base mobile:text-gray-500 sm:text-gray-500">
                    Be the first to review this product!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={selectedImageUrl}
        alt={product.name}
      />
    </div>
  );
} 
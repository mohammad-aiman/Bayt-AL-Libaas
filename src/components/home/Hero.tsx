import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <div className="relative bg-white overflow-hidden">
      {/* Background Pattern for Mobile */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-purple-50 via-white to-accent-blue-50 mobile:block hidden" />
      
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 mobile:pb-12 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          {/* Desktop SVG separator */}
          <svg
            className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>

          <div className="relative mobile:pt-8 sm:pt-6 px-4 sm:px-6 lg:px-8">
            {/* Main hero content */}
            <div className="mobile:mt-8 sm:mt-10 mx-auto max-w-7xl mobile:px-4 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="mobile:text-center sm:text-center lg:text-left">
                {/* Mobile-optimized heading */}
                <h1 className="mobile:text-mobile-4xl mobile:leading-tight sm:text-4xl md:text-5xl lg:text-6xl tracking-tight font-extrabold text-gray-900">
                  <span className="block mobile:mb-2 xl:inline">Elegant Fashion</span>{' '}
                  <span className="block text-gradient bg-gradient-to-r from-accent-purple-600 to-accent-blue-600 bg-clip-text text-transparent xl:inline">
                    for Every Woman
                  </span>
                </h1>
                
                {/* Mobile-optimized description */}
                <p className="mobile:mt-4 mobile:text-mobile-lg mobile:leading-relaxed mobile:px-2 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 text-gray-600 font-medium">
                  Discover the latest trends in women's fashion at Bayt Al Libaas. 
                  From casual wear to formal attire, find your perfect style with our 
                  curated collection of premium clothing.
                </p>
                
                {/* Mobile-first CTA buttons */}
                <div className="mobile:mt-8 mobile:space-y-3 mobile:px-4 sm:mt-8 sm:flex sm:justify-center sm:space-y-0 sm:space-x-3 lg:justify-start lg:space-x-4">
                  <div className="mobile:w-full sm:w-auto">
                    <Link
                      href="/shop"
                      className="mobile:w-full mobile:py-4 mobile:px-6 mobile:text-mobile-lg sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-semibold rounded-mobile-lg text-white bg-gradient-to-r from-accent-purple-600 to-accent-blue-600 hover:from-accent-purple-700 hover:to-accent-blue-700 md:py-4 md:text-lg md:px-10 transition-all duration-200 shadow-mobile-lg hover:shadow-mobile-xl transform hover:scale-105 active:scale-95 min-h-touch"
                    >
                      <span>Shop Now</span>
                      <svg className="mobile:ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                  <div className="mobile:w-full sm:w-auto">
                    <Link
                      href="/shop?category=featured"
                      className="mobile:w-full mobile:py-4 mobile:px-6 mobile:text-mobile-lg sm:w-auto flex items-center justify-center px-8 py-3 border border-accent-purple-200 text-base font-semibold rounded-mobile-lg text-accent-purple-700 bg-accent-purple-50 hover:bg-accent-purple-100 md:py-4 md:text-lg md:px-10 transition-all duration-200 shadow-mobile hover:shadow-mobile-md min-h-touch"
                    >
                      <span>Featured Collection</span>
                    </Link>
                  </div>
                </div>

                {/* Mobile trust indicators */}
                <div className="mobile:mt-8 mobile:block sm:hidden">
                  <div className="flex items-center justify-center space-x-6 text-gray-500">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-mobile-sm font-medium">Free Shipping</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-mobile-sm font-medium">Easy Returns</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile-optimized hero image */}
      <div className="mobile:mt-8 mobile:px-4 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 lg:mt-0 lg:px-0">
        <div className="mobile:h-64 mobile:rounded-mobile-xl mobile:overflow-hidden sm:h-72 md:h-96 lg:w-full lg:h-full lg:rounded-none relative">
          <Image
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Premium women's fashion collection at Bayt Al Libaas"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
          />
          
          {/* Mobile overlay gradient */}
          <div className="absolute inset-0 mobile:bg-gradient-to-t mobile:from-black/30 mobile:via-transparent mobile:to-transparent lg:bg-gradient-to-r lg:from-white lg:to-transparent"></div>
          
          {/* Mobile floating stats */}
          <div className="mobile:absolute mobile:bottom-4 mobile:left-4 mobile:right-4 mobile:bg-white/90 mobile:backdrop-blur-sm mobile:rounded-mobile-lg mobile:p-4 mobile:shadow-mobile-lg lg:hidden">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-mobile-lg font-bold text-gray-900">1000+</div>
                <div className="text-mobile-xs text-gray-600">Happy Customers</div>
              </div>
              <div>
                <div className="text-mobile-lg font-bold text-gray-900">500+</div>
                <div className="text-mobile-xs text-gray-600">Products</div>
              </div>
              <div>
                <div className="text-mobile-lg font-bold text-gray-900">24/7</div>
                <div className="text-mobile-xs text-gray-600">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating decorative elements - mobile optimized */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Reduced decorative elements for mobile */}
        <div className="mobile:hidden sm:block absolute top-1/4 left-1/4 w-4 h-4 bg-accent-purple-200 rounded-full animate-pulse"></div>
        <div className="mobile:hidden sm:block absolute top-3/4 right-1/4 w-6 h-6 bg-accent-pink-200 rounded-full animate-pulse delay-300"></div>
        <div className="mobile:hidden sm:block absolute top-1/2 left-1/6 w-3 h-3 bg-accent-blue-200 rounded-full animate-pulse delay-700"></div>
        
        {/* Mobile-specific decorative elements */}
        <div className="mobile:block sm:hidden absolute top-20 right-8 w-2 h-2 bg-accent-purple-300 rounded-full animate-bounce"></div>
        <div className="mobile:block sm:hidden absolute bottom-32 left-8 w-3 h-3 bg-accent-blue-300 rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Mobile scroll indicator */}
      <div className="mobile:block sm:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

      {/* Mobile performance optimization - preload next section content */}
      <div className="mobile:block sm:hidden">
        <link rel="prefetch" href="/shop" />
      </div>
    </div>
  );
} 
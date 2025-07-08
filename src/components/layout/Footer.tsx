'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, Mail, MapPin, ArrowUp } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto mobile:px-4 sm:px-6 lg:px-8">
        {/* Mobile-First Main Footer Content */}
        <div className="mobile:py-8 sm:py-12 mobile:space-y-8 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 sm:gap-8">
          {/* Company Info - Mobile Optimized */}
          <div className="mobile:text-center sm:text-left mobile:space-y-4 sm:space-y-4 lg:col-span-2">
            <div>
              <h3 className="mobile:text-mobile-xl mobile:font-bold mobile:bg-gradient-to-r mobile:from-purple-400 mobile:to-blue-400 mobile:bg-clip-text mobile:text-transparent sm:text-2xl sm:font-bold sm:bg-gradient-to-r sm:from-purple-400 sm:to-blue-400 sm:bg-clip-text sm:text-transparent">
                Bayt Al Libaas
              </h3>
              <p className="mobile:mt-3 mobile:text-mobile-sm mobile:text-gray-300 mobile:leading-relaxed mobile:px-4 sm:mt-4 sm:text-sm sm:text-gray-300 sm:leading-relaxed sm:px-0 lg:max-w-md">
                Premium women's clothing collection featuring the latest trends in fashion. 
                Quality, style, and elegance in every piece. Serving Bangladesh with love and dedication.
              </p>
            </div>

            {/* Contact Info - Mobile Optimized */}
            <div className="mobile:space-y-3 sm:space-y-3">
              <h4 className="mobile:text-mobile-base mobile:font-semibold mobile:text-white sm:text-sm sm:font-semibold sm:text-white">
                Get in Touch
              </h4>
              <div className="mobile:space-y-2 sm:space-y-2">
                <div className="mobile:flex mobile:items-center mobile:justify-center mobile:space-x-2 sm:flex sm:items-center sm:justify-start sm:space-x-2">
                  <MapPin className="mobile:h-4 mobile:w-4 mobile:text-purple-400 mobile:flex-shrink-0 sm:h-4 sm:w-4 sm:text-purple-400 sm:flex-shrink-0" />
                  <span className="mobile:text-mobile-xs mobile:text-gray-300 sm:text-xs sm:text-gray-300">
                    Dhaka, Bangladesh
                  </span>
                </div>
                <div className="mobile:flex mobile:items-center mobile:justify-center mobile:space-x-2 sm:flex sm:items-center sm:justify-start sm:space-x-2">
                  <Mail className="mobile:h-4 mobile:w-4 mobile:text-purple-400 mobile:flex-shrink-0 sm:h-4 sm:w-4 sm:text-purple-400 sm:flex-shrink-0" />
                  <span className="mobile:text-mobile-xs mobile:text-gray-300 sm:text-xs sm:text-gray-300">
                    baytallibaas@gmail.com
                  </span>
                </div>
              </div>
            </div>

            {/* Social Media Section - Mobile First */}
            <div className="mobile:space-y-4 sm:space-y-3">
              <h4 className="mobile:text-mobile-base mobile:font-semibold mobile:text-white sm:text-sm sm:font-semibold sm:text-white">
                Follow Our Journey
              </h4>
              <div className="mobile:flex mobile:flex-col mobile:items-center mobile:space-y-3 sm:flex sm:flex-row sm:items-start sm:space-y-0 sm:space-x-3">
                <a 
                  href="https://www.facebook.com/share/16nJ1Yxtmt/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="mobile:inline-flex mobile:items-center mobile:justify-center mobile:w-full mobile:max-w-xs mobile:px-4 mobile:py-3 mobile:bg-blue-600 mobile:hover:bg-blue-700 mobile:transition-all mobile:duration-200 mobile:rounded-mobile-lg mobile:shadow-mobile mobile:min-h-touch sm:inline-flex sm:items-center sm:px-4 sm:py-2 sm:bg-blue-600 sm:hover:bg-blue-700 sm:transition-colors sm:rounded-lg group"
                >
                  <Facebook className="mobile:w-5 mobile:h-5 mobile:mr-2 sm:w-5 sm:h-5 sm:mr-2" />
                  <span className="mobile:text-mobile-sm mobile:font-medium sm:text-sm sm:font-medium">
                    Facebook
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links - Mobile Optimized */}
          <div className="mobile:text-center sm:text-left mobile:space-y-4 sm:space-y-4">
            <h4 className="mobile:text-mobile-base mobile:font-semibold mobile:text-white mobile:border-b mobile:border-gray-700 mobile:pb-2 sm:text-lg sm:font-semibold sm:text-white sm:border-none sm:pb-0">
              Quick Links
            </h4>
            <ul className="mobile:grid mobile:grid-cols-2 mobile:gap-3 sm:space-y-2 sm:text-sm">
              <li>
                <Link 
                  href="/" 
                  className="mobile:block mobile:py-2 mobile:px-3 mobile:bg-gray-800 mobile:hover:bg-gray-700 mobile:rounded-mobile mobile:transition-colors mobile:text-mobile-sm mobile:min-h-touch mobile:flex mobile:items-center mobile:justify-center sm:inline-block sm:text-gray-300 sm:hover:text-purple-400 sm:transition-colors sm:bg-transparent sm:hover:bg-transparent sm:p-0 sm:rounded-none sm:min-h-auto"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/shop" 
                  className="mobile:block mobile:py-2 mobile:px-3 mobile:bg-gray-800 mobile:hover:bg-gray-700 mobile:rounded-mobile mobile:transition-colors mobile:text-mobile-sm mobile:min-h-touch mobile:flex mobile:items-center mobile:justify-center sm:inline-block sm:text-gray-300 sm:hover:text-purple-400 sm:transition-colors sm:bg-transparent sm:hover:bg-transparent sm:p-0 sm:rounded-none sm:min-h-auto"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link 
                  href="/cart" 
                  className="mobile:block mobile:py-2 mobile:px-3 mobile:bg-gray-800 mobile:hover:bg-gray-700 mobile:rounded-mobile mobile:transition-colors mobile:text-mobile-sm mobile:min-h-touch mobile:flex mobile:items-center mobile:justify-center sm:inline-block sm:text-gray-300 sm:hover:text-purple-400 sm:transition-colors sm:bg-transparent sm:hover:bg-transparent sm:p-0 sm:rounded-none sm:min-h-auto"
                >
                  Cart
                </Link>
              </li>
              <li>
                <Link 
                  href="/profile" 
                  className="mobile:block mobile:py-2 mobile:px-3 mobile:bg-gray-800 mobile:hover:bg-gray-700 mobile:rounded-mobile mobile:transition-colors mobile:text-mobile-sm mobile:min-h-touch mobile:flex mobile:items-center mobile:justify-center sm:inline-block sm:text-gray-300 sm:hover:text-purple-400 sm:transition-colors sm:bg-transparent sm:hover:bg-transparent sm:p-0 sm:rounded-none sm:min-h-auto"
                >
                  My Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile-Optimized Bottom Footer */}
        <div className="mobile:border-t mobile:border-gray-800 mobile:py-6 mobile:space-y-4 sm:border-t sm:border-gray-800 sm:py-6 sm:space-y-0">
          <div className="mobile:flex mobile:flex-col mobile:items-center mobile:space-y-4 sm:flex sm:flex-col md:flex-row md:justify-between md:items-center md:space-y-0">
            {/* Copyright - Mobile Centered */}
            <div className="mobile:text-center sm:text-center md:text-left">
              <p className="mobile:text-mobile-xs mobile:text-gray-400 sm:text-sm sm:text-gray-400">
                © 2025 Bayt Al Libaas. All rights reserved.
              </p>
            </div>
            
            {/* Legal Links - Mobile Stacked */}
            <div className="mobile:flex mobile:flex-col mobile:items-center mobile:space-y-2 sm:flex sm:flex-row sm:space-y-0 sm:space-x-6 sm:text-sm">
              <Link 
                href="/privacy" 
                className="mobile:py-2 mobile:px-4 mobile:bg-gray-800 mobile:hover:bg-gray-700 mobile:rounded-mobile mobile:transition-colors mobile:text-mobile-xs mobile:min-h-touch mobile:flex mobile:items-center mobile:justify-center sm:text-gray-400 sm:hover:text-purple-400 sm:transition-colors sm:bg-transparent sm:hover:bg-transparent sm:p-0 sm:rounded-none sm:min-h-auto"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="mobile:py-2 mobile:px-4 mobile:bg-gray-800 mobile:hover:bg-gray-700 mobile:rounded-mobile mobile:transition-colors mobile:text-mobile-xs mobile:min-h-touch mobile:flex mobile:items-center mobile:justify-center sm:text-gray-400 sm:hover:text-purple-400 sm:transition-colors sm:bg-transparent sm:hover:bg-transparent sm:p-0 sm:rounded-none sm:min-h-auto"
              >
                Terms of Service
              </Link>
              <Link 
                href="/cookies" 
                className="mobile:py-2 mobile:px-4 mobile:bg-gray-800 mobile:hover:bg-gray-700 mobile:rounded-mobile mobile:transition-colors mobile:text-mobile-xs mobile:min-h-touch mobile:flex mobile:items-center mobile:justify-center sm:text-gray-400 sm:hover:text-purple-400 sm:transition-colors sm:bg-transparent sm:hover:bg-transparent sm:p-0 sm:rounded-none sm:min-h-auto"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Back to Top Button */}
        <button
          onClick={scrollToTop}
          className="mobile:fixed mobile:bottom-20 mobile:right-4 mobile:p-3 mobile:bg-purple-600 mobile:hover:bg-purple-700 mobile:text-white mobile:rounded-full mobile:shadow-mobile-lg mobile:transition-all mobile:duration-200 mobile:z-mobile-sticky mobile:min-h-touch mobile:min-w-touch mobile:flex mobile:items-center mobile:justify-center sm:hidden"
          aria-label="Back to top"
        >
          <ArrowUp className="mobile:h-5 mobile:w-5" />
        </button>
      </div>
    </footer>
  );
};

export default Footer; 
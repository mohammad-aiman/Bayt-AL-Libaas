'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useCartStore } from '@/store/cartStore';
import { 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Settings, 
  Package, 
  ChevronDown,
  Search,
  Home,
  Store,
  Heart,
  Bell,
  Shield,
  LogOut
} from 'lucide-react';
import { Category } from '@/types';

const Navbar = () => {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { items } = useCartStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Refs for click outside handling
  const userMenuRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  // Calculate cart item count from items array for real-time updates
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (data.success) {
          setCategories(data.data.filter((cat: Category) => cat.isActive));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Close mobile menu
      if (isMenuOpen && !target.closest('.mobile-menu')) {
        setIsMenuOpen(false);
      }
      
      // Close user menu
      if (isUserMenuOpen && userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
      
      // Close categories menu
      if (isCategoriesOpen && categoriesRef.current && !categoriesRef.current.contains(target)) {
        setIsCategoriesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen, isUserMenuOpen, isCategoriesOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);



  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const toggleCategories = () => {
    setIsCategoriesOpen(!isCategoriesOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      setSearchQuery('');
    }
  };

  const closeUserMenu = () => {
    setIsUserMenuOpen(false);
  };

  return (
    <>
      {/* Main Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-mobile-sticky">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Mobile Search Bar (when open) */}
          {isSearchOpen && (
            <div className="mobile:block md:hidden py-3 border-b border-gray-200">
              <form onSubmit={handleSearch} className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-mobile-lg focus:ring-2 focus:ring-accent-purple-500 focus:border-transparent text-mobile-base"
                    autoFocus
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                <button
                  type="button"
                  onClick={toggleSearch}
                  className="p-3 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </form>
            </div>
          )}

          {/* Main Header */}
          <div className="flex justify-between items-center h-16 mobile:h-14">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="mobile:flex md:hidden p-2 rounded-mobile text-gray-700 hover:text-accent-purple-600 hover:bg-gray-100 transition-all duration-200 min-h-touch min-w-touch items-center justify-center"
              aria-label="Open navigation menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center mobile:flex-1 mobile:justify-center md:justify-start"
            >
              <span className="text-xl mobile:text-lg font-bold bg-gradient-to-r from-accent-purple-600 to-accent-blue-600 bg-clip-text text-transparent">
                Bayt Al Libaas
              </span>
            </Link>

            {/* Mobile Action Buttons */}
            <div className="mobile:flex md:hidden items-center space-x-1">
              <button
                onClick={toggleSearch}
                className="p-2 rounded-mobile text-gray-700 hover:text-accent-purple-600 hover:bg-gray-100 transition-all duration-200 min-h-touch min-w-touch flex items-center justify-center"
                aria-label="Search products"
              >
                <Search className="h-5 w-5" />
              </button>
              
              <Link 
                href="/cart" 
                className="relative p-2 rounded-mobile text-gray-700 hover:text-accent-purple-600 hover:bg-gray-100 transition-all duration-200 min-h-touch min-w-touch flex items-center justify-center"
                aria-label={`Cart with ${cartItemCount} items`}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-mobile-bounce">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8 relative">
              <Link href="/" className="text-gray-700 hover:text-accent-purple-600 transition-colors duration-200 font-medium">
                Home
              </Link>
              
              {/* Categories Dropdown */}
              <div className="relative" ref={categoriesRef}>
                <button
                  onClick={toggleCategories}
                  className="flex items-center text-gray-700 hover:text-accent-purple-600 transition-colors duration-200 font-medium"
                >
                  Categories
                  <ChevronDown className={`ml-1 h-4 w-4 transform transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isCategoriesOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-mobile-dropdown border">
                    <Link
                      href="/shop"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium"
                      onClick={() => setIsCategoriesOpen(false)}
                    >
                      All Categories
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    {categoriesLoading ? (
                      <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                    ) : categories.length > 0 ? (
                      categories.map((category) => (
                        <Link
                          key={category._id}
                          href={`/shop?category=${category.slug}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsCategoriesOpen(false)}
                        >
                          {category.name}
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500">No categories found</div>
                    )}
                  </div>
                )}
              </div>
              
              <Link href="/shop" className="text-gray-700 hover:text-accent-purple-600 transition-colors duration-200 font-medium">
                Shop
              </Link>

              {/* Desktop Search */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent-purple-500 focus:border-transparent text-sm"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </form>
              
              {/* Cart Icon */}
              <Link href="/cart" className="relative p-2 text-gray-700 hover:text-accent-purple-600 transition-colors duration-200">
                <ShoppingCart className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>

              {/* Authentication */}
              {session ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 text-gray-700 hover:text-accent-purple-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-purple-500 focus:ring-offset-2 rounded-md p-2"
                  >
                    <User className="h-6 w-6" />
                    <span className="hidden lg:block font-medium">
                      {session.user?.name}
                      {(session.user?.role === 'admin' || session.user?.email === 'admin@example.com') && (
                        <span className="ml-1 text-xs bg-amber-100 text-amber-800 px-1 rounded">Admin</span>
                      )}
                    </span>
                    <ChevronDown className={`h-4 w-4 transform transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-mobile-dropdown border border-gray-200 overflow-hidden animate-slide-down">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-sm font-semibold text-gray-900 truncate">{session.user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                      </div>
                      
                      {/* Menu Items - Compact for Admin */}
                      <div className="py-1">
                        <Link 
                          href="/profile" 
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-accent-purple-600 transition-colors duration-200 w-full"
                          onClick={closeUserMenu}
                        >
                          <Settings className="h-4 w-4 mr-3 flex-shrink-0" />
                          <span>Profile</span>
                        </Link>
                        
                        <Link 
                          href="/orders" 
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-accent-purple-600 transition-colors duration-200 w-full"
                          onClick={closeUserMenu}
                        >
                          <Package className="h-4 w-4 mr-3 flex-shrink-0" />
                          <span>My Orders</span>
                        </Link>
                        
                        {(session.user?.role === 'admin' || session.user?.email === 'admin@example.com') && (
                          <Link 
                            href="/admin" 
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-accent-purple-600 transition-colors duration-200 w-full"
                            onClick={closeUserMenu}
                          >
                            <Shield className="h-4 w-4 mr-3 flex-shrink-0" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}

                        <button
                          onClick={() => signOut()}
                          className="flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 w-full border-t"
                        >
                          <LogOut className="h-4 w-4 mr-3 flex-shrink-0" />
                          <span>Sign Out</span>
                        </button>
                    </div>
                  </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link 
                    href="/auth/signin" 
                    className="text-gray-700 hover:text-accent-purple-600 transition-colors duration-200 font-medium"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/signup" 
                    className="bg-gradient-to-r from-accent-purple-600 to-accent-blue-600 text-white px-4 py-2 rounded-md hover:from-accent-purple-700 hover:to-accent-blue-700 transition-colors duration-200 font-medium"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        {isMenuOpen && (
          <div className="mobile:block md:hidden fixed inset-0 z-mobile-modal-backdrop bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)} />
        )}

        {/* Mobile Navigation Menu */}
        <div className={`mobile-menu mobile:block md:hidden fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-mobile-modal transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <span className="text-lg font-bold bg-gradient-to-r from-accent-purple-600 to-accent-blue-600 bg-clip-text text-transparent">
                Bayt Al Libaas
              </span>
              <button
                onClick={toggleMenu}
                className="p-2 rounded-mobile text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 min-h-touch min-w-touch flex items-center justify-center"
                aria-label="Close navigation menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* User Section (if logged in) */}
            {session && (
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    (session.user?.role === 'admin' || session.user?.email === 'admin@example.com')
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                      : 'bg-gradient-to-r from-accent-purple-500 to-accent-blue-500'
                  }`}>
                    <span className="text-white font-semibold text-lg">
                      {session.user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-gray-900">{session.user?.name}</p>
                      {(session.user?.role === 'admin' || session.user?.email === 'admin@example.com') && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{session.user?.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Menu Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="py-2">
                {/* Main Navigation Links */}
                <Link 
                  href="/" 
                  className="flex items-center px-4 py-4 text-gray-700 hover:bg-gray-100 hover:text-accent-purple-600 transition-all duration-200 min-h-touch font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Home className="h-5 w-5 mr-3" />
                  Home
                </Link>
                
                <Link 
                  href="/shop" 
                  className="flex items-center px-4 py-4 text-gray-700 hover:bg-gray-100 hover:text-accent-purple-600 transition-all duration-200 min-h-touch font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Store className="h-5 w-5 mr-3" />
                  Shop
                </Link>

                {/* Categories Section */}
                <div className="px-4 py-2">
                  <p className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Categories</p>
                </div>
                <div className="space-y-1">
                  <Link
                    href="/shop"
                    className="block px-6 py-3 text-gray-600 hover:bg-gray-100 hover:text-accent-purple-600 transition-all duration-200 min-h-touch"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    All Categories
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category._id}
                      href={`/shop?category=${category.slug}`}
                      className="block px-6 py-3 text-gray-600 hover:bg-gray-100 hover:text-accent-purple-600 transition-all duration-200 min-h-touch"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>

                {/* User Menu Items (if logged in) */}
                {session ? (
                  <div className="border-t border-gray-200 mt-4 pt-4">
                    <div className="px-4 py-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Account</p>
                        {(session.user?.role === 'admin' || session.user?.email === 'admin@example.com') && (
                          <span className="text-xs text-amber-600 font-medium">Admin</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Account Options - Compact Layout for Admin */}
                    <div className="space-y-1">
                      <Link 
                        href="/profile" 
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-accent-purple-600 transition-all duration-200 min-h-touch font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="h-5 w-5 mr-3 flex-shrink-0" />
                        Profile
                      </Link>
                      
                      <Link 
                        href="/orders" 
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-accent-purple-600 transition-all duration-200 min-h-touch font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Package className="h-5 w-5 mr-3 flex-shrink-0" />
                        My Orders
                      </Link>
                      
                      {(session.user?.role === 'admin' || session.user?.email === 'admin@example.com') && (
                        <Link 
                          href="/admin" 
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-accent-purple-600 transition-all duration-200 min-h-touch font-medium"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Shield className="h-5 w-5 mr-3 flex-shrink-0" />
                          Admin Dashboard
                        </Link>
                      )}

                      <button
                        onClick={() => signOut()}
                        className="flex items-center px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 min-h-touch font-medium border-t"
                      >
                        <LogOut className="h-5 w-5 mr-3 flex-shrink-0" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-gray-200 mt-4 pt-4">
                    <div className="px-4 space-y-2">
                      <Link 
                        href="/auth/signin" 
                        className="block w-full text-center py-3 px-4 border border-gray-300 rounded-mobile-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium min-h-touch"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link 
                        href="/auth/signup" 
                        className="block w-full text-center py-3 px-4 bg-gradient-to-r from-accent-purple-600 to-accent-blue-600 text-white rounded-mobile-lg hover:from-accent-purple-700 hover:to-accent-blue-700 transition-all duration-200 font-medium min-h-touch"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation (for key actions) */}
      <div className="mobile:block md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-mobile-sticky">
        <div className="grid grid-cols-4 h-16">
          <Link 
            href="/" 
            className="flex flex-col items-center justify-center space-y-1 text-gray-600 hover:text-accent-purple-600 transition-colors duration-200"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          
          <Link 
            href="/shop" 
            className="flex flex-col items-center justify-center space-y-1 text-gray-600 hover:text-accent-purple-600 transition-colors duration-200"
          >
            <Store className="h-5 w-5" />
            <span className="text-xs font-medium">Shop</span>
          </Link>
          
          <Link 
            href="/cart" 
            className="flex flex-col items-center justify-center space-y-1 text-gray-600 hover:text-accent-purple-600 transition-colors duration-200 relative"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="text-xs font-medium">Cart</span>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </Link>
          
          {session ? (
            <Link 
              href="/profile" 
              className="flex flex-col items-center justify-center space-y-1 text-gray-600 hover:text-accent-purple-600 transition-colors duration-200"
            >
              <User className="h-5 w-5" />
              <span className="text-xs font-medium">Account</span>
            </Link>
          ) : (
            <Link 
              href="/auth/signin" 
              className="flex flex-col items-center justify-center space-y-1 text-gray-600 hover:text-accent-purple-600 transition-colors duration-200"
            >
              <User className="h-5 w-5" />
              <span className="text-xs font-medium">Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar; 
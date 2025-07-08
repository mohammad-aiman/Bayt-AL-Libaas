'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/types';

export default function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Default categories with images if API fails
  const defaultCategories = [
    {
      _id: '1',
      name: 'Casual Wear',
      slug: 'casual-wear',
      description: 'Comfortable and stylish everyday clothing',
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '2',
      name: 'Formal Attire',
      slug: 'formal-attire',
      description: 'Professional and elegant clothing for work',
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '3',
      name: 'Evening Wear',
      slug: 'evening-wear',
      description: 'Stunning outfits for special occasions',
      image: 'https://images.unsplash.com/photo-1566479179817-0c0b1a01c3c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '4',
      name: 'Accessories',
      slug: 'accessories',
      description: 'Complete your look with our accessories',
      image: 'https://images.unsplash.com/photo-1611652197743-4b102d901c7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
            Shop by Category
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Find Your Perfect Style
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Discover our carefully curated collections designed for every occasion and lifestyle.
          </p>
        </div>

        {loading ? (
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-64 bg-gray-300 rounded-lg"></div>
                <div className="mt-4 h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="mt-2 h-3 bg-gray-300 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {displayCategories.slice(0, 4).map((category, index) => (
                <div
                  key={category._id}
                  className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 xl:aspect-w-7 xl:aspect-h-8">
                    <Image
                      src={category.image || defaultCategories[index]?.image || defaultCategories[0].image}
                      alt={category.name}
                      width={400}
                      height={400}
                      className="h-64 w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {category.name}
                    </h3>
                    <p className="text-gray-200 text-sm mb-4">
                      {category.description}
                    </p>
                    <Link
                      href={`/shop?category=${category._id}`}
                      className="inline-flex items-center px-4 py-2 bg-white text-gray-900 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
                    >
                      Shop Now
                      <svg
                        className="ml-2 -mr-1 w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/shop"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 transition-colors"
              >
                View All Categories
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
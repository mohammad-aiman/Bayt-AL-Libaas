'use client';

import { useEffect, useState } from 'react';

export default function Stats() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-indigo-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Dedicated to Modest Elegance for Every Woman in Bangladesh
          </h2>
          <p className="mt-3 text-xl text-indigo-200 sm:mt-4">
            We take pride in delivering quality fashion and exceptional service
          </p>
        </div>
      </div>
    </div>
  );
} 
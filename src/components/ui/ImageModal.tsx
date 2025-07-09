'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
}

export default function ImageModal({ isOpen, onClose, imageUrl, alt }: ImageModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted) return null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="relative max-h-[90vh] max-w-[90vw]">
        <button
          onClick={onClose}
          className="absolute -right-4 -top-4 rounded-full bg-white p-1 text-black shadow-lg hover:bg-gray-100"
        >
          <X size={24} />
        </button>
        <div className="relative h-full w-full">
          <Image
            src={imageUrl}
            alt={alt}
            className="rounded-lg object-contain"
            style={{ maxHeight: '85vh' }}
            width={1200}
            height={800}
            quality={100}
            priority
          />
        </div>
      </div>
    </div>
  );
} 
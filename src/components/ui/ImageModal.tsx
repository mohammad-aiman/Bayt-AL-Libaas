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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!mounted) return null;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative max-h-[90vh] max-w-[90vw]">
        <button
          onClick={onClose}
          className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-lg transition-colors hover:bg-gray-100"
          aria-label="Close modal"
        >
          <X size={20} />
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
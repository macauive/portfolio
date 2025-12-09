'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '@/types';

interface ImageGalleryProps {
  images: string[];
  project: Project;
}

export default function ImageGallery({ images, project }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full"
          >
            <Image
              src={images[selectedIndex]}
              alt={`${project.title} screenshot ${selectedIndex + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all ${
                idx === selectedIndex
                  ? 'ring-2 ring-zinc-900 dark:ring-zinc-50 scale-105'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

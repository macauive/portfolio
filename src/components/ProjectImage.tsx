'use client';

import Image from 'next/image';
import { Project } from '@/types';
import { getCategoryColor } from '@/utils/categoryColors';
import { useState } from 'react';

interface ProjectImageProps {
  project: Project;
  src?: string;
  alt?: string;
  priority?: boolean;
  className?: string;
  size?: 'thumbnail' | 'hero' | 'screenshot';
}

export default function ProjectImage({
  project,
  src,
  alt,
  priority = false,
  className = '',
  size = 'thumbnail',
}: ProjectImageProps) {
  const [imageError, setImageError] = useState(false);
  const colors = getCategoryColor(project.category);

  const dimensions = {
    thumbnail: { width: 600, height: 400 },
    hero: { width: 1200, height: 800 },
    screenshot: { width: 1200, height: 800 },
  };

  const { width, height } = dimensions[size];

  // Show gradient placeholder if no image or error
  if (!src || imageError) {
    return (
      <div
        className={`relative overflow-hidden rounded-lg ${colors.bg} ${className}`}
        style={{ aspectRatio: `${width}/${height}` }}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-10`}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-16 h-16 opacity-20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: colors.light }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <Image
        src={src}
        alt={alt || `${project.title} - ${project.category}`}
        width={width}
        height={height}
        priority={priority}
        className="object-cover w-full h-full"
        onError={() => setImageError(true)}
      />
    </div>
  );
}

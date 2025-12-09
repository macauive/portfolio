'use client';

import { ProjectCategory } from '@/types';
import { getCategoryColor } from '@/utils/categoryColors';

interface CategoryBadgeProps {
  category: ProjectCategory;
  variant?: 'default' | 'colored' | 'minimal';
}

export default function CategoryBadge({
  category,
  variant = 'colored',
}: CategoryBadgeProps) {
  const colors = getCategoryColor(category);

  if (variant === 'minimal') {
    return (
      <span className="text-sm text-zinc-500 dark:text-zinc-400">
        {category}
      </span>
    );
  }

  if (variant === 'colored') {
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colors.bg}`}
        style={{ color: colors.light }}
      >
        {category}
      </span>
    );
  }

  return (
    <span className="text-sm text-zinc-500 dark:text-zinc-400">
      {category}
    </span>
  );
}

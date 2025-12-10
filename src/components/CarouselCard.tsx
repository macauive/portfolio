'use client';

import { Project } from '@/types';
import TechBadge from './TechBadge';
import CategoryBadge from './CategoryBadge';
import { getCategoryColor } from '@/utils/categoryColors';

interface CarouselCardProps {
  project: Project;
  onClick: () => void;
}

export default function CarouselCard({ project, onClick }: CarouselCardProps) {
  const colors = getCategoryColor(project.category);

  return (
    <div
      onClick={onClick}
      className="cursor-pointer group relative p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all hover:shadow-lg flex flex-col justify-between h-full w-full gap-3"
    >
      {/* Category color accent */}
      <div
        className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full opacity-50 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: colors.light }}
      />

      {/* Top section: Category Badge */}
      <div className="pl-3">
        <CategoryBadge category={project.category} variant="colored" />
      </div>

      {/* Center section: Title */}
      <div className="pl-3 flex-1 flex items-center">
        <h4 className="text-base font-medium text-zinc-900 dark:text-zinc-50 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors line-clamp-2">
          {project.title}
        </h4>
      </div>

      {/* Bottom section: Tech Badges */}
      <div className="flex flex-wrap gap-1.5 pl-3">
        {project.technologies.slice(0, 3).map((tech) => (
          <TechBadge key={tech} technology={tech} />
        ))}
      </div>
    </div>
  );
}

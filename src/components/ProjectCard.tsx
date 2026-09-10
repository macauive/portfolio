'use client';

import { Project } from '@/types';
import TechBadge from './TechBadge';
import ProjectImage from './ProjectImage';
import CategoryBadge from './CategoryBadge';
import { getProjectThumbnail } from '@/utils/imageHelpers';
import { getCategoryColor } from '@/utils/categoryColors';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  index: number;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const thumbnail = getProjectThumbnail(project);
  const colors = getCategoryColor(project.category);

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer group relative p-4 rounded-xl border ${colors.border} hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all hover:shadow-lg`}
    >
      {/* Category Color Accent - Subtle left border */}
      <div
        className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full opacity-50 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: colors.light }}
      />

      <div className="pl-3">
        {/* Image Thumbnail (if available) */}
        {thumbnail && (
          <div className="mb-4 -mx-4 -mt-4">
            <ProjectImage
              project={project}
              src={thumbnail}
              size="thumbnail"
              className="transition-transform group-hover:scale-[1.02]"
            />
          </div>
        )}

        <div className="flex items-start justify-between mb-2">
          <CategoryBadge category={project.category} variant="colored" />
          {project.featured && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
              Featured
            </span>
          )}
        </div>

        <h4 className="text-base font-medium text-zinc-900 dark:text-zinc-50 mb-2 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
          {project.title}
        </h4>

        <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-3 line-clamp-2">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {project.technologies.slice(0, 3).map((tech) => (
            <TechBadge key={tech} technology={tech} />
          ))}
          {project.technologies.length > 3 && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400 self-center">
              +{project.technologies.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

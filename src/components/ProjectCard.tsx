'use client';

import { Project } from '@/types';
import TechBadge from './TechBadge';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  index: number;
}

export default function ProjectCard({ project, onClick, index }: ProjectCardProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer group p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">{project.category}</div>
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
  );
}

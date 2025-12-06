'use client';

import { Project } from '@/types';
import { motion } from 'framer-motion';
import TechBadge from './TechBadge';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  index: number;
}

export default function ProjectCard({ project, onClick, index }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onClick={onClick}
      className="card-container cursor-pointer group"
    >
      {/* Featured Badge */}
      {project.featured && (
        <div className="mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-blue/10 text-primary-blue">
            Featured
          </span>
        </div>
      )}

      {/* Category */}
      <div className="text-sm text-text-muted mb-2">{project.category}</div>

      {/* Title */}
      <h3 className="text-xl md:text-2xl font-medium text-text-primary mb-3 group-hover:text-primary-blue transition-colors">
        {project.title}
      </h3>

      {/* Description */}
      <p className="text-text-muted mb-4 line-clamp-3">{project.description}</p>

      {/* Technologies */}
      <div className="flex flex-wrap gap-2 mb-4">
        {project.technologies.slice(0, 4).map((tech) => (
          <TechBadge key={tech} technology={tech} />
        ))}
        {project.technologies.length > 4 && (
          <span className="text-xs text-text-muted self-center">
            +{project.technologies.length - 4} more
          </span>
        )}
      </div>

      {/* Learn More Arrow */}
      <div className="flex items-center text-primary-blue font-medium text-sm group-hover:gap-2 transition-all">
        <span>Learn more</span>
        <svg
          className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </motion.div>
  );
}

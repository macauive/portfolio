'use client';

import { Project } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import TechBadge from './TechBadge';
import ImageGallery from './ImageGallery';
import CategoryBadge from './CategoryBadge';
import { getProjectScreenshots, hasProjectImages } from '@/utils/imageHelpers';
import { getCategoryColor } from '@/utils/categoryColors';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (project) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [project]);

  if (!project) return null;

  const screenshots = getProjectScreenshots(project);
  const hasImages = hasProjectImages(project);
  const colors = getCategoryColor(project.category);

  return (
    <AnimatePresence>
      {project && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="min-h-full flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header with Category Color Gradient */}
                <div className="relative px-8 py-6 overflow-hidden">
                  {/* Subtle gradient background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-5`}
                  />

                  <div className="relative flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {project.featured && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                            Featured
                          </span>
                        )}
                        <CategoryBadge category={project.category} variant="colored" />
                      </div>
                      <h2 className="text-3xl font-medium text-zinc-900 dark:text-zinc-50">
                        {project.title}
                      </h2>
                      {project.timeline && (
                        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
                          {project.timeline}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={onClose}
                      className="ml-4 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-900 dark:text-zinc-50"
                      aria-label="Close modal"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-8 py-6 space-y-8">
                  {/* Image Gallery */}
                  {hasImages && screenshots.length > 0 && (
                    <div>
                      <ImageGallery images={screenshots} project={project} />
                    </div>
                  )}

                  {/* Video Demo */}
                  {project.images?.demo && (
                    <div>
                      <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">
                        Demo
                      </h3>
                      <video
                        controls
                        className="w-full rounded-lg"
                        poster={screenshots[0]}
                      >
                        <source src={project.images.demo} type="video/mp4" />
                        Your browser does not support video playback.
                      </video>
                    </div>
                  )}

                  {/* Technologies */}
                  <div>
                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">Technologies Used</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <TechBadge key={tech} technology={tech} />
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">Overview</h3>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-lg">
                      {project.detailedDescription}
                    </p>
                  </div>

                  {/* Achievements */}
                  {project.achievements && project.achievements.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">Key Achievements</h3>
                      <ul className="space-y-3">
                        {project.achievements.map((achievement, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <svg
                              className="w-6 h-6 shrink-0 mt-0.5"
                              style={{ color: colors.light }}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* External Link */}
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full transition-all hover:shadow-lg text-white"
                      style={{
                        backgroundColor: colors.light,
                      }}
                    >
                      <span>View Project</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

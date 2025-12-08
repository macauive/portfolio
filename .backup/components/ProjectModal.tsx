'use client';

import { Project } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import TechBadge from './TechBadge';

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
                className="bg-white rounded-4xl shadow-soft-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-background-subtle px-8 py-6 flex items-start justify-between rounded-t-4xl">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {project.featured && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-blue/10 text-primary-blue">
                          Featured
                        </span>
                      )}
                      <span className="text-sm text-text-muted">{project.category}</span>
                    </div>
                    <h2 className="text-3xl font-medium text-text-primary">{project.title}</h2>
                    {project.timeline && (
                      <p className="text-text-muted mt-2">{project.timeline}</p>
                    )}
                  </div>

                  <button
                    onClick={onClose}
                    className="ml-4 p-2 rounded-full hover:bg-background-subtle transition-colors"
                    aria-label="Close modal"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="px-8 py-6">
                  {/* Technologies */}
                  <div className="mb-8">
                    <h3 className="text-sm font-medium text-text-muted mb-3">Technologies Used</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <TechBadge key={tech} technology={tech} />
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-8">
                    <h3 className="text-sm font-medium text-text-muted mb-3">Overview</h3>
                    <p className="text-text-secondary leading-relaxed text-lg">
                      {project.detailedDescription}
                    </p>
                  </div>

                  {/* Achievements */}
                  {project.achievements && project.achievements.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-sm font-medium text-text-muted mb-3">Key Achievements</h3>
                      <ul className="space-y-3">
                        {project.achievements.map((achievement, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <svg className="w-6 h-6 text-primary-blue shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-text-secondary leading-relaxed">{achievement}</span>
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
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary-blue text-white rounded-full hover:shadow-soft-lg transition-all"
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

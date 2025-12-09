'use client';

import { useState, useMemo } from 'react';
import { projects } from '@/data/projects';
import { Project } from '@/types';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProjectGrid() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAllProjects, setShowAllProjects] = useState(false);

  // Show only featured projects
  const featuredProjects = useMemo(() => {
    return projects.filter((project) => project.featured);
  }, []);

  // Selected non-featured projects to display (5 total)
  const selectedProjectIds = [
    'erp-platform',
    'amazon-integration',
    'hubspot-crm',
    'shopify-store',
    'customer-portal'
  ];

  const nonFeaturedProjects = useMemo(() => {
    return projects.filter((project) => selectedProjectIds.includes(project.id));
  }, []);

  return (
    <>
      {/* Featured Projects Section */}
      <motion.section
        initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="mb-16"
      >
        <h3 className="mb-5 text-lg font-medium text-zinc-900 dark:text-zinc-50">
          Featured Projects
        </h3>

        <div className="grid grid-cols-1 gap-6">
          {featuredProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => setSelectedProject(project)}
              index={index}
            />
          ))}
        </div>
      </motion.section>

      {/* Show More/Less Button */}
      {nonFeaturedProjects.length > 0 && (
        <div className="mb-8 flex justify-center">
          <button
            onClick={() => setShowAllProjects(!showAllProjects)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all hover:shadow-md text-zinc-900 dark:text-zinc-50 font-medium"
          >
            <span>{showAllProjects ? 'Show Less' : 'Show More Projects'}</span>
            <svg
              className={`w-4 h-4 transition-transform ${showAllProjects ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}

      {/* Expandable Non-Featured Projects Section */}
      <AnimatePresence>
        {showAllProjects && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: 'auto',
              transition: {
                height: { duration: 0.3 },
                opacity: { duration: 0.25, delay: 0.1 }
              }
            }}
            exit={{
              opacity: 0,
              height: 0,
              transition: {
                height: { duration: 0.3, delay: 0.1 },
                opacity: { duration: 0.2 }
              }
            }}
            className="mb-16 overflow-hidden"
          >
            <h3 className="mb-5 text-lg font-medium text-zinc-900 dark:text-zinc-50">
              All Projects
            </h3>

            <div className="grid grid-cols-1 gap-6">
              {nonFeaturedProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { delay: index * 0.05 }
                  }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <ProjectCard
                    project={project}
                    onClick={() => setSelectedProject(project)}
                    index={index}
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </>
  );
}

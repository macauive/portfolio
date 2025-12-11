'use client';

import { useState, useMemo } from 'react';
import { projects } from '@/data/projects';
import { Project } from '@/types';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';
import { motion } from 'framer-motion';
import ProjectCarousel from './ProjectCarousel';

export default function ProjectGrid() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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
          Projects
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

      {/* More Projects Section */}
      {nonFeaturedProjects.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mb-16"
        >
          <h3 className="mb-5 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            More
          </h3>

          <ProjectCarousel
            projects={nonFeaturedProjects}
            onProjectClick={(project) => setSelectedProject(project)}
          />
        </motion.section>
      )}

      {/* Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </>
  );
}

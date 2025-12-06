'use client';

import { useState, useMemo } from 'react';
import { projects, getProjectCategories, getUniqueTechnologies } from '@/data/projects';
import { Project } from '@/types';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';
import FilterBar from './FilterBar';

export default function ProjectGrid() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTech, setSelectedTech] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const categories = useMemo(() => getProjectCategories(), []);
  const technologies = useMemo(() => getUniqueTechnologies(), []);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const categoryMatch = selectedCategory === 'All' || project.category === selectedCategory;
      const techMatch = selectedTech === 'All' || project.technologies.includes(selectedTech);
      return categoryMatch && techMatch;
    });
  }, [selectedCategory, selectedTech]);

  return (
    <>
      <FilterBar
        categories={categories}
        technologies={technologies}
        selectedCategory={selectedCategory}
        selectedTech={selectedTech}
        onCategoryChange={setSelectedCategory}
        onTechChange={setSelectedTech}
      />

      <section className="section-container py-12">
        {/* Results count */}
        <div className="mb-8">
          <p className="text-text-muted">
            Showing <span className="font-medium text-text-primary">{filteredProjects.length}</span> project{filteredProjects.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => setSelectedProject(project)}
              index={index}
            />
          ))}
        </div>

        {/* Empty state */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-text-muted">No projects match your filters</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedTech('All');
              }}
              className="mt-4 px-6 py-2 bg-primary-blue text-white rounded-full hover:shadow-soft-lg transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

      {/* Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </>
  );
}

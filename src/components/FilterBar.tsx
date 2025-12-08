'use client';

interface FilterBarProps {
  categories: string[];
  technologies: string[];
  selectedCategory: string;
  selectedTech: string;
  onCategoryChange: (category: string) => void;
  onTechChange: (tech: string) => void;
}

export default function FilterBar({
  categories,
  technologies,
  selectedCategory,
  selectedTech,
  onCategoryChange,
  onTechChange,
}: FilterBarProps) {
  return (
    <div className="section-container py-8 sticky top-0 bg-background-light/95 backdrop-blur-sm z-10 border-b border-background-subtle">
      {/* Category Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-text-muted mb-3">Filter by Category</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${
                  selectedCategory === category
                    ? 'bg-primary-blue text-white shadow-soft'
                    : 'bg-white text-text-secondary hover:bg-background-subtle'
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Technology Filter */}
      <div>
        <h3 className="text-sm font-medium text-text-muted mb-3">Filter by Technology</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onTechChange('All')}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${
                selectedTech === 'All'
                  ? 'bg-primary-blue text-white shadow-soft'
                  : 'bg-white text-text-secondary hover:bg-background-subtle'
              }
            `}
          >
            All Technologies
          </button>
          {technologies.map((tech) => (
            <button
              key={tech}
              onClick={() => onTechChange(tech)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${
                  selectedTech === tech
                    ? 'bg-primary-blue text-white shadow-soft'
                    : 'bg-white text-text-secondary hover:bg-background-subtle'
                }
              `}
            >
              {tech}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

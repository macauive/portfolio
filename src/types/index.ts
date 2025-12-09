export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  technologies: string[];
  description: string; // Brief for card
  detailedDescription: string; // Full description for modal
  achievements: string[]; // Key metrics/accomplishments
  timeline?: string; // e.g., "Aug 2023 - Present"
  featured?: boolean; // Highlight important projects
  link?: string; // External link if applicable
  images?: {
    thumbnail?: string; // Path relative to /public (600x400px)
    hero?: string; // Large header image for modal (1200x800px)
    screenshots?: string[]; // Array of detail images
    demo?: string; // Video demo path
  };
}

export type ProjectCategory =
  | 'Management & Manufacturing'
  | 'Financial Systems'
  | 'Integrations & APIs'
  | 'Analytics & BI'
  | 'E-commerce'
  | 'Internal Tools'
  | 'Product Development'
  | 'AI & Automation'
  | 'Infrastructure';

export interface Skill {
  name: string;
  category: 'language' | 'framework' | 'tool' | 'platform';
}

export interface PersonalInfo {
  name: string;
  title: string;
  location: string;
  email: string;
  github: string;
  summary: string;
}

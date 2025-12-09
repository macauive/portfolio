import { Project } from '@/types';

// Get thumbnail image with fallback
export const getProjectThumbnail = (project: Project): string | null => {
  if (project.images?.thumbnail) {
    return project.images.thumbnail;
  }
  return null;
};

// Get all project screenshots
export const getProjectScreenshots = (project: Project): string[] => {
  const screenshots: string[] = [];

  if (project.images?.hero) {
    screenshots.push(project.images.hero);
  }

  if (project.images?.screenshots) {
    screenshots.push(...project.images.screenshots);
  }

  return screenshots;
};

// Check if project has any images
export const hasProjectImages = (project: Project): boolean => {
  return !!(
    project.images?.thumbnail ||
    project.images?.screenshots?.length ||
    project.images?.hero
  );
};

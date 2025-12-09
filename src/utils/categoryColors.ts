import { ProjectCategory } from '@/types';

export interface CategoryColors {
  light: string;
  dark: string;
  gradient: string;
  bg: string;
  border: string;
}

export const categoryColors: Record<ProjectCategory, CategoryColors> = {
  'Management & Manufacturing': {
    light: '#10b981',
    dark: '#34d399',
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  'Financial Systems': {
    light: '#06b6d4',
    dark: '#22d3ee',
    gradient: 'from-cyan-500 to-blue-500',
    bg: 'bg-cyan-50 dark:bg-cyan-950/30',
    border: 'border-cyan-200 dark:border-cyan-800',
  },
  'Integrations & APIs': {
    light: '#3b82f6',
    dark: '#60a5fa',
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
  },
  'Analytics & BI': {
    light: '#f59e0b',
    dark: '#fbbf24',
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
  },
  'E-commerce': {
    light: '#ec4899',
    dark: '#f472b6',
    gradient: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50 dark:bg-pink-950/30',
    border: 'border-pink-200 dark:border-pink-800',
  },
  'Internal Tools': {
    light: '#8b5cf6',
    dark: '#a78bfa',
    gradient: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    border: 'border-violet-200 dark:border-violet-800',
  },
  'Product Development': {
    light: '#a855f7',
    dark: '#c084fc',
    gradient: 'from-purple-500 to-fuchsia-500',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-800',
  },
  'AI & Automation': {
    light: '#ef4444',
    dark: '#f87171',
    gradient: 'from-red-500 to-rose-500',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
  },
  'Infrastructure': {
    light: '#64748b',
    dark: '#94a3b8',
    gradient: 'from-slate-500 to-gray-500',
    bg: 'bg-slate-50 dark:bg-slate-950/30',
    border: 'border-slate-200 dark:border-slate-800',
  },
};

export const getCategoryColor = (category: ProjectCategory): CategoryColors => {
  return categoryColors[category];
};

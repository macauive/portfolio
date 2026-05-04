'use client';

import { Project } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = project ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [project]);

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {project && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.article
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 18 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                onClick={(event) => event.stopPropagation()}
                className="w-full max-w-3xl rounded-lg border border-cyan-400/25 bg-zinc-950 shadow-2xl shadow-cyan-950/40"
              >
                <header className="flex items-start justify-between gap-6 border-b border-zinc-800 px-5 py-5 sm:px-7">
                  <div className="space-y-2">
                    <p className="font-mono text-xs uppercase tracking-normal text-cyan-300">
                      {project.category}
                    </p>
                    <h2 className="text-2xl font-medium leading-tight text-zinc-50 sm:text-3xl">
                      {project.title}
                    </h2>
                  </div>

                  <button
                    onClick={onClose}
                    className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-cyan-400/10 hover:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                    aria-label="Close project details"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </header>

                <div className="space-y-8 px-5 py-6 sm:px-7">
                  <section className="space-y-3">
                    <p className="font-mono text-sm text-zinc-500">
                      <span className="text-cyan-400">$</span> cat overview.md
                    </p>
                    <p className="border-l border-cyan-400/25 pl-5 text-base leading-8 text-zinc-300">
                      {project.detailedDescription}
                    </p>
                  </section>

                  <section className="space-y-3">
                    <p className="font-mono text-sm text-zinc-500">
                      <span className="text-cyan-400">$</span> ls stack
                    </p>
                    <div className="flex flex-wrap gap-2 border-l border-cyan-400/25 pl-5">
                      {project.technologies.map((technology) => (
                        <span
                          key={technology}
                          className="rounded border border-zinc-800 bg-zinc-900 px-2 py-1 font-mono text-xs text-zinc-300"
                        >
                          {technology}
                        </span>
                      ))}
                    </div>
                  </section>

                  {project.achievements.length > 0 && (
                    <section className="space-y-3">
                      <p className="font-mono text-sm text-zinc-500">
                        <span className="text-cyan-400">$</span> cat impact.md
                      </p>
                      <ul className="space-y-3 border-l border-cyan-400/25 pl-5 text-sm leading-6 text-zinc-300">
                        {project.achievements.map((achievement) => (
                          <li key={achievement}>
                            <span className="text-cyan-400">-</span>{' '}
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex rounded border border-cyan-400/40 px-3 py-2 font-mono text-sm text-cyan-300 transition-colors hover:bg-cyan-400/10 hover:text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                    >
                      open project
                    </a>
                  )}
                </div>
              </motion.article>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

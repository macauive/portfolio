'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { personalInfo } from '@/data/personal';
import { projects } from '@/data/projects';
import { skills } from '@/data/skills';
import { Project } from '@/types';
import ProjectModal from '@/components/ProjectModal';

type SectionKey = 'home' | 'work' | 'projects' | 'skills' | 'contact';

const NAV_ITEMS: Array<{ key: string; label: string; section: SectionKey }> = [
  { key: 'h', label: 'home.md', section: 'home' },
  { key: 'w', label: 'work.md', section: 'work' },
  { key: 'p', label: 'projects.md', section: 'projects' },
  { key: 's', label: 'skills.md', section: 'skills' },
  { key: 'c', label: 'contact.md', section: 'contact' },
];

const selectedProjectIds = [
  'rescue-cooling-ai-lead-intelligence',
  'verizon-ai-analysis',
  'powerbi-dashboards',
  'shopify-store',
  'amazon-integration',
  'hubspot-crm',
];

const productProjectIds = ['amountly'];

function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[13px] font-semibold leading-none text-cyan-400">
      $ {children}
    </p>
  );
}

function MutedRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <p className="grid grid-cols-[5.5rem_1fr] gap-5 font-mono text-[13px] leading-6 text-neutral-500">
      <span className="font-semibold text-neutral-600">{label}</span>
      <span className="text-neutral-400">{value}</span>
    </p>
  );
}

export default function Home() {
  const pathname = usePathname();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const selectedProjects = useMemo(() => {
    return selectedProjectIds
      .map((id) => projects.find((project) => project.id === id))
      .filter((project): project is Project => Boolean(project));
  }, []);

  const skillGroups = useMemo(() => {
    return skills.reduce<Record<string, string[]>>((groups, skill) => {
      groups[skill.category] = groups[skill.category] ?? [];
      groups[skill.category].push(skill.name);
      return groups;
    }, {});
  }, []);

  const productProjects = useMemo(() => {
    return productProjectIds
      .map((id) => projects.find((project) => project.id === id))
      .filter((project): project is Project => Boolean(project));
  }, []);

  const activeSection = useMemo<SectionKey>(() => {
    const section = pathname.split('/')[1];

    if (
      section === 'work' ||
      section === 'projects' ||
      section === 'skills' ||
      section === 'contact'
    ) {
      return section;
    }

    return 'home';
  }, [pathname]);

  const activeLabel =
    NAV_ITEMS.find((item) => item.section === activeSection)?.label ??
    'home.md';

  return (
    <>
      <main className="mx-auto flex min-h-screen w-full max-w-[920px] flex-col justify-center px-6 py-10 font-mono text-neutral-400">
        <div className="grid min-h-[820px] overflow-hidden rounded-md border border-neutral-800 bg-[#101111] shadow-[0_0_0_1px_rgba(0,0,0,0.35)] md:grid-cols-[292px_1fr]">
          <aside className="relative flex min-h-[820px] flex-col border-b border-neutral-800 p-5 md:border-b-0 md:border-r">
            <Link
              href="/"
              className="w-fit text-[31px] font-bold leading-[0.96] tracking-normal text-cyan-400"
              aria-label={`${personalInfo.name} home`}
            >
              <span className="block">Iver</span>
              <span className="block">Macaulay</span>
            </Link>

            <div className="mt-6 space-y-1">
              <p className="text-[13px] font-semibold leading-5 text-neutral-200">
                {personalInfo.title}
              </p>
              <p className="flex items-center gap-1 text-[12px] leading-5 text-neutral-600">
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.5 10.5c0 7.1-7.5 11-7.5 11s-7.5-3.9-7.5-11a7.5 7.5 0 1 1 15 0Z"
                  />
                </svg>
                <span>{personalInfo.location}</span>
              </p>
            </div>

            <nav aria-label="Primary navigation" className="mt-5 space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = item.section === activeSection;

                return (
                  <Link
                    key={item.section}
                    href={item.section === 'home' ? '/' : `/${item.section}`}
                    className={`block text-[13px] font-semibold leading-5 transition-colors ${
                      isActive
                        ? 'text-cyan-400'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    <span>[{item.key}]</span> {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-10 rounded border border-neutral-800 bg-[#111212] p-3 md:absolute md:bottom-5 md:left-5 md:right-5 md:mt-0">
              <Prompt>npx imacaulay</Prompt>
              <div className="mt-3 space-y-1 text-[12px] leading-5 text-neutral-500">
                <p>Initializing...</p>
                <p>Connected to imacaulay.dev</p>
                <p>Links loaded. Standing by...</p>
              </div>
            </div>
          </aside>

          <section className="min-h-[820px]">
            <header className="border-b border-neutral-800 px-5 py-4">
              <Prompt>cat {activeLabel}</Prompt>
            </header>

            <div className="h-[calc(820px-49px)] overflow-y-auto px-5 py-5">
              {activeSection === 'home' && (
                <div className="max-w-[560px] space-y-6 text-[13px] leading-6 text-neutral-400">
                  <p>
                    Hey, I&apos;m Iver, an AI engineer focused on practical
                    automation, call intelligence, lead scoring, data
                    extraction, and operational AI systems.
                  </p>
                  <p>
                    I build systems that turn messy business inputs like calls,
                    recordings, PDFs, API payloads, and CRM activity into
                    cleaner decisions and next actions.
                  </p>
                  <p>
                    I like AI that is direct, dependable, and wired into the
                    workflows people already use every day.
                  </p>
                  <p>
                    If you&apos;re in tech or operations, let&apos;s{' '}
                    <Link
                      href="/contact"
                      className="font-semibold text-cyan-400 underline decoration-cyan-400/50 underline-offset-2"
                    >
                      connect
                    </Link>
                    .
                  </p>
                  <p className="font-semibold text-cyan-400">
                    The model should move the work forward.
                  </p>
                </div>
              )}

              {activeSection === 'work' && (
                <div className="max-w-[590px] space-y-5">
                  {selectedProjects.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => setSelectedProject(project)}
                      className="block w-full border-b border-neutral-800 pb-5 text-left last:border-b-0 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    >
                      <span className="block text-[13px] font-semibold leading-5 text-neutral-200 transition-colors hover:text-cyan-400">
                        {project.title}
                      </span>
                      <span className="mt-1 block text-[12px] font-semibold leading-5 text-cyan-400">
                        {project.category}
                      </span>
                      <span className="mt-2 block text-[13px] leading-6 text-neutral-500">
                        {project.description}
                      </span>
                      <span className="mt-2 block text-[12px] leading-5 text-neutral-600">
                        {project.technologies.slice(0, 5).join(' / ')}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {activeSection === 'projects' && (
                <div className="max-w-[590px] space-y-5">
                  {productProjects.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => setSelectedProject(project)}
                      className="block w-full border-b border-neutral-800 pb-5 text-left last:border-b-0 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    >
                      <span className="block text-[13px] font-semibold leading-5 text-neutral-200 transition-colors hover:text-cyan-400">
                        {project.title}
                      </span>
                      <span className="mt-1 block text-[12px] font-semibold leading-5 text-cyan-400">
                        {project.category}
                      </span>
                      <span className="mt-2 block text-[13px] leading-6 text-neutral-500">
                        {project.description}
                      </span>
                      <span className="mt-2 block text-[12px] leading-5 text-neutral-600">
                        {project.technologies.slice(0, 5).join(' / ')}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {activeSection === 'skills' && (
                <div className="grid max-w-[590px] gap-7 sm:grid-cols-2">
                  {Object.entries(skillGroups).map(([category, names]) => (
                    <div key={category}>
                      <h2 className="text-[13px] font-semibold leading-5 text-cyan-400">
                        ## {category}
                      </h2>
                      <ul className="mt-3 space-y-1 text-[13px] leading-6 text-neutral-500">
                        {names.map((name) => (
                          <li key={name}>- {name}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {activeSection === 'contact' && (
                <div className="max-w-[590px] space-y-5">
                  <p className="text-[13px] leading-6 text-neutral-500">
                    For thoughtful conversations about automation,
                    integrations, analytics, or practical internal tools, reach
                    out via email or GitHub.
                  </p>

                  <div className="space-y-2 pt-2">
                    <MutedRow
                      label="Email"
                      value={
                        <a
                          href={`mailto:${personalInfo.email}`}
                          className="font-semibold text-cyan-400 underline decoration-cyan-400/40 underline-offset-2"
                        >
                          {personalInfo.email}
                        </a>
                      }
                    />
                    <MutedRow
                      label="GitHub"
                      value={
                        <a
                          href={`https://${personalInfo.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-cyan-400 underline decoration-cyan-400/40 underline-offset-2"
                        >
                          {personalInfo.github}
                        </a>
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        <footer className="py-4 text-center text-[11px] font-semibold leading-none text-neutral-600">
          Built with <span className="text-cyan-400">NextJS</span> by{' '}
          <span className="text-cyan-400">{personalInfo.name}</span>
        </footer>
      </main>

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </>
  );
}

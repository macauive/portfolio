'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { personalInfo } from '@/data/personal';
import { projects } from '@/data/projects';
import { skills } from '@/data/skills';
import { Project } from '@/types';

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

function MailIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21.75 6.75v10.5A2.25 2.25 0 0 1 19.5 19.5h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0-8.64 6.48a1.875 1.875 0 0 1-2.22 0L2.25 6.75"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M12 2C6.48 2 2 6.58 2 12.26c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-1.05-.01-1.9-2.78.62-3.37-1.22-3.37-1.22-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.33 9.33 0 0 1 12 6.98c.85 0 1.71.12 2.51.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.13 10.13 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ContactLink({
  href,
  icon,
  label,
  value,
  external = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="contact-link group flex items-center gap-3 font-mono text-[13px] leading-6 text-neutral-500 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
    >
      <span className="text-neutral-600 transition-colors group-hover:text-cyan-400">
        {icon}
      </span>
      <span className="w-16 font-semibold text-neutral-600 transition-colors group-hover:text-cyan-400">
        {label}
      </span>
      <span className="text-neutral-400 transition-colors group-hover:text-cyan-400">
        {value}
      </span>
    </a>
  );
}

const terminalLines = [
  'Initializing...',
  'Connected to macauive.dev',
  'Links loaded. Standing by...',
];

let hasAnimatedTerminalStatus = false;

function AnimatedTerminalStatus() {
  const [visibleLineCount, setVisibleLineCount] = useState(() =>
    hasAnimatedTerminalStatus ? terminalLines.length : 0,
  );

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (reduceMotion || hasAnimatedTerminalStatus) {
      setVisibleLineCount(terminalLines.length);
      return;
    }

    hasAnimatedTerminalStatus = true;
    setVisibleLineCount(0);

    const timeouts = terminalLines.map((_, index) =>
      window.setTimeout(
        () => setVisibleLineCount(index + 1),
        520 + index * 620,
      ),
    );

    return () => timeouts.forEach((timeout) => window.clearTimeout(timeout));
  }, []);

  return (
    <div className="mt-3 min-h-[3.75rem] space-y-1 text-[12px] leading-5 text-neutral-500">
      {terminalLines.map((line, index) => (
        <p
          key={line}
          className={`transition-all duration-500 ease-out ${
            index < visibleLineCount
              ? 'translate-y-0 opacity-100'
              : 'translate-y-1 opacity-0'
          }`}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

function ProjectRow({
  project,
  showLink = false,
}: {
  project: Project;
  showLink?: boolean;
}) {
  return (
    <article className="border-b border-neutral-800 pb-5 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[13px] font-semibold leading-5 text-neutral-200">
            {project.title}
          </h2>
          <p className="mt-1 text-[12px] font-semibold leading-5 text-cyan-400">
            {project.category}
          </p>
        </div>

        {showLink && project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-[12px] font-semibold leading-5 text-cyan-400 underline decoration-cyan-400/40 underline-offset-2 transition-colors hover:text-cyan-200"
          >
            open
          </a>
        )}
      </div>
      <p className="mt-2 text-[13px] leading-6 text-neutral-500">
        {project.description}
      </p>
      <p className="mt-2 text-[12px] leading-5 text-neutral-600">
        {project.technologies.slice(0, 5).join(' / ')}
      </p>
    </article>
  );
}

export default function Home() {
  const pathname = usePathname();
  const router = useRouter();

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName.toLowerCase();

      if (
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        target?.isContentEditable
      ) {
        return;
      }

      const navItem = NAV_ITEMS.find(
        (item) => item.key === event.key.toLowerCase(),
      );

      if (!navItem) return;

      event.preventDefault();
      router.push(navItem.section === 'home' ? '/' : `/${navItem.section}`);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return (
    <>
      <main className="mx-auto flex min-h-screen w-full max-w-[920px] flex-col justify-start px-4 py-5 font-mono text-neutral-400 sm:px-6 sm:py-8 md:justify-center md:py-10">
        <div className="grid overflow-hidden rounded-md border border-neutral-800 bg-[#101111] shadow-[0_0_0_1px_rgba(0,0,0,0.35)] md:min-h-[820px] md:grid-cols-[292px_1fr]">
          <aside className="relative flex flex-col border-b border-neutral-800 p-5 md:min-h-[820px] md:border-b-0 md:border-r">
            <Link
              href="/"
              className="w-fit text-[31px] font-bold leading-[0.96] tracking-normal text-cyan-400 sm:text-[34px] md:text-[31px]"
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

            <nav
              aria-label="Primary navigation"
              className="mt-5 space-y-1"
            >
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

            <div className="mt-8 rounded border border-neutral-800 bg-[#111212] p-3 md:absolute md:bottom-5 md:left-5 md:right-5 md:mt-0">
              <Prompt>npx macauive</Prompt>
              <AnimatedTerminalStatus />
            </div>
          </aside>

          <section className="min-h-0 md:min-h-[820px]">
            <header className="border-b border-neutral-800 px-5 py-4 md:px-5">
              <Prompt>cat {activeLabel}</Prompt>
            </header>

            <div className="px-5 py-5 md:h-[calc(820px-49px)] md:overflow-y-auto">
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
                    <ProjectRow key={project.id} project={project} />
                  ))}
                </div>
              )}

              {activeSection === 'projects' && (
                <div className="max-w-[590px] space-y-5">
                  {productProjects.map((project) => (
                    <ProjectRow
                      key={project.id}
                      project={project}
                      showLink
                    />
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
                    <ContactLink
                      icon={<MailIcon />}
                      label="Email"
                      value={personalInfo.email}
                      href={`mailto:${personalInfo.email}`}
                    />
                    <ContactLink
                      icon={<GitHubIcon />}
                      label="GitHub"
                      value={personalInfo.github}
                      href={`https://${personalInfo.github}`}
                      external
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

      {/* ProjectModal is intentionally left in the codebase, but disabled for now. */}
    </>
  );
}

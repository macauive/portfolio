export interface Project {
  id: string;
  title: string;
  category: string;
  technologies: string[];
  description: string;
  detailedDescription: string;
  achievements: string[];
  link?: string;
  featured?: boolean;
}
export interface Content {
  personal: { name: string; title: string; location: string; email: string; github: string; summary: string };
  projects: Project[];
  skills: { name: string; category: string }[];
  about: string[];
  workIds: string[];
  productIds: string[];
}
export type Response =
  | { kind: 'help' | 'about' | 'projects' | 'work' | 'skills' | 'contact' | 'clear' | 'history' }
  | { kind: 'project'; project: Project }
  | { kind: 'error'; message: string };
export const MAX_INPUT = 1200;
export const MAX_HISTORY = 40;
export const commands = ['/help', '/about', '/home', '/projects', '/project', '/work', '/skills', '/contact', '/history', '/clear'];
const aliases: Record<string, string> = { '?': '/help', help: '/help', home: '/about', about: '/about', projects: '/projects', work: '/work', skills: '/skills', contact: '/contact', history: '/history', clear: '/clear', '/home': '/about' };
const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

export function resolveCommand(input: string, content: Content): Response {
  if (input.length > MAX_INPUT) return { kind: 'error', message: `Keep commands under ${MAX_INPUT + 1} characters.` };
  const clean = normalize(input);
  const space = clean.indexOf(' ');
  const verb = space < 0 ? clean : clean.slice(0, space);
  const argument = space < 0 ? '' : clean.slice(space + 1);
  const canonical = Object.hasOwn(aliases, verb) ? aliases[verb] : verb;
  if (canonical === '/project') {
    if (!argument) return { kind: 'error', message: 'Choose a project: /project mac-digital, /project drop-it, or /project amountly. /work shows more identifiers.' };
    const project = content.projects.find(item => item.id === argument || normalize(item.title) === argument);
    return project ? { kind: 'project', project } : { kind: 'error', message: 'Project not found. Use /projects or /work to see supported identifiers.' };
  }
  const kinds: Record<string, 'help' | 'about' | 'projects' | 'work' | 'skills' | 'contact' | 'clear' | 'history'> = {
    '/help': 'help', '/about': 'about', '/projects': 'projects', '/work': 'work', '/skills': 'skills', '/contact': 'contact', '/clear': 'clear', '/history': 'history',
  };
  const kind = Object.hasOwn(kinds, canonical) ? kinds[canonical] : undefined;
  if (!kind) return { kind: 'error', message: 'Unknown command. Type / to choose a portfolio command, or /help for guidance.' };
  if (argument) return { kind: 'error', message: 'This command takes no arguments. Try /help for the command list.' };
  return { kind };
}

export function isPortfolioCommand(input: string): boolean {
  const value = normalize(input);
  return value.startsWith('/') || Object.hasOwn(aliases, value);
}

export function completions(input: string, content: Content): string[] {
  if (!input || input.length > MAX_INPUT) return [];
  const lower = input.trimStart().toLowerCase();
  if (lower.startsWith('/project ')) {
    const term = normalize(lower.slice(9));
    return content.projects.filter(item => item.id.startsWith(term) || normalize(item.title).startsWith(term)).map(item => `/project ${item.id}`);
  }
  return commands.filter(command => command.startsWith(lower)).sort((left, right) => Number(right === lower) - Number(left === lower));
}

export function describeCommand(value: string, content: Content): string {
  if (value.startsWith('/project ')) {
    return content.projects.find(project => project.id === value.slice(9))?.description ?? 'Read project details';
  }
  const descriptions: Record<string, string> = {
    '/help': 'Show commands and keyboard shortcuts', '/about': 'Meet Iver Macaulay', '/home': 'Meet Iver — alias for /about',
    '/projects': 'Explore Mac Digital, Drop It, and Amountly', '/project': 'Read a project — choose a name or slug',
    '/work': 'Explore selected automation and integration work', '/skills': 'Browse languages, frameworks, and platforms',
    '/contact': 'Connect by email or GitHub', '/history': 'Search commands from this session', '/clear': 'Clear displayed output and keep command history',
  };
  return Object.hasOwn(descriptions, value) ? descriptions[value] : '';
}

export function remember(history: string[], input: string): string[] {
  const clean = input.trim().slice(0, MAX_INPUT);
  if (!clean || history.at(-1) === clean) return history;
  return [...history, clean].slice(-MAX_HISTORY);
}

export function recall(history: string[], index: number, direction: -1 | 1, draft: string): { index: number; value: string } {
  const next = Math.max(0, Math.min(history.length, index + direction));
  return { index: next, value: next === history.length ? draft : history[next] };
}

// Only approved portfolio URLs may become navigable links.
export function safeHref(value: string): string | undefined {
  if (/^mailto:[a-zA-Z0-9._+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(value)) return value;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return undefined;
    if (!['macdigital.ai', 'dontdropit.app', 'amountly.app', 'github.com'].includes(url.hostname) || url.port) return undefined;
    return url.href;
  } catch { return undefined; }
}

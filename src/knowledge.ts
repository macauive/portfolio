import { content } from './content.js';

export interface PortfolioSource { id: string; label: string; command: string; text: string }
export const portfolioSources: PortfolioSource[] = [
  { id: 'about', label: 'About Iver', command: '/about', text: [content.personal.name, content.personal.title, content.personal.location, content.personal.summary, ...content.about].join('\n') },
  { id: 'contact', label: 'Contact', command: '/contact', text: [content.personal.name, content.personal.location, content.personal.email, content.personal.github].join('\n') },
  { id: 'skills', label: 'Skills', command: '/skills', text: content.skills.map(item => `${item.name} (${item.category})`).join('\n') },
  ...content.projects.map(project => ({ id: `project:${project.id}`, label: project.title, command: `/project ${project.id}`, text: [project.title, project.category, project.description, project.detailedDescription, `Technologies: ${project.technologies.join(', ')}`, ...project.achievements, ...(project.link ? [project.link] : [])].join('\n') })),
];
export const sourceById = new Map(portfolioSources.map(source => [source.id, source]));
export interface SourceReference { id: string; quote: string }
export interface PortfolioAnswer { status: 'answered' | 'general' | 'refused' | 'missing' | 'out_of_scope'; answer: string; sources: SourceReference[] }

const answerObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const answerKeys = (value: Record<string, unknown>, keys: string[]) => Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
export const normalizeQuote = (value: string) => value.replace(/\s+/g, ' ').trim();

// Complete, curated passages provide deterministic evidence and safe fallbacks.
// A real quotation alone cannot validate model prose; the server reviews claims.
export const portfolioFacts = portfolioSources.flatMap(source => [...new Set(
  source.text.split('\n').flatMap(line => line.split(/(?<=[.!?])\s+(?=[A-Z])/)).map(normalizeQuote).filter(Boolean),
)].map((quote, index) => ({ key: `${source.id}#${index}`, id: source.id, quote })));
const factKeys = new Set(portfolioFacts.map(fact => JSON.stringify([fact.id, fact.quote])));

export function extractiveAnswer(value: unknown): PortfolioAnswer | undefined {
  if (!answerObject(value) || !answerKeys(value, ['status', 'answer', 'sources'])) return undefined;
  if (!['answered', 'refused', 'missing', 'out_of_scope'].includes(String(value.status)) || typeof value.answer !== 'string' || value.answer.length > 8000 || !Array.isArray(value.sources) || value.sources.length > 64) return undefined;
  const references: SourceReference[] = [];
  for (const item of value.sources) {
    if (!answerObject(item) || !answerKeys(item, ['id', 'quote']) || typeof item.id !== 'string' || typeof item.quote !== 'string') return undefined;
    const quote = normalizeQuote(item.quote);
    if (!factKeys.has(JSON.stringify([item.id, quote]))) return undefined;
    if (!references.some(reference => reference.id === item.id && reference.quote === quote)) references.push({ id: item.id, quote });
  }
  if (value.status === 'answered' && !references.length) return undefined;
  if (value.status === 'refused') return { status: 'refused', answer: 'I can’t help with that request. I can help with a safe question or tell you about Iver’s work.', sources: [] };
  if (value.status === 'missing') return { status: 'missing', answer: 'I don’t have that detail in Iver’s portfolio.', sources: [] };
  if (value.status === 'out_of_scope') return { status: 'out_of_scope', answer: 'I can help with questions about Iver and his projects.', sources: [] };
  const groups = new Map<string, string[]>();
  for (const reference of references) groups.set(reference.id, [...(groups.get(reference.id) ?? []), reference.quote]);
  const paragraphs = [...groups].map(([id, quotes]) => {
    const label = sourceById.get(id)!.label;
    const text = quotes.filter(quote => quote !== label).join(' ');
    return text ? `${label} — ${text}` : label;
  });
  const excerpts: string[] = [];
  let length = 0;
  for (const paragraph of paragraphs) {
    if (length + paragraph.length + (excerpts.length ? 2 : 0) > 8000) break;
    excerpts.push(paragraph); length += paragraph.length + 2;
  }
  const answer = excerpts.join('\n\n');
  if (!answer) return undefined;
  return { status: 'answered', answer, sources: references };
}

// Narrow, explicit grammar: all other wording goes through evidence selection.
// This avoids a model omitting matches or assigning a technology to another project.
export function answerTechnologyQuestion(question: string): PortfolioAnswer | undefined {
  const stack = /^does (.+?) use ([a-z0-9.+/#-]+)\?(?: please check its documented technology stack\.)?$/i.exec(question.trim());
  if (stack) {
    const project = content.projects.find(item => [item.id, item.title].some(name => name.toLowerCase() === stack[1].toLowerCase()));
    if (project) return extractiveAnswer({ status: 'answered', answer: '', sources: [{ id: `project:${project.id}`, quote: `Technologies: ${project.technologies.join(', ')}` }] });
  }
  const match = /^(?:which|what)(?: of (?:his|her|the|iver[’']s))? projects (?:use|are built with|are written in) ([a-z0-9.+/# -]+?)(?:,? and what do they do)?[?.!]*$/i.exec(question.trim());
  if (!match) return undefined;
  const technology = [...new Set(content.projects.flatMap(project => project.technologies))].find(item => item.toLowerCase() === match[1].trim().toLowerCase());
  if (!technology) return undefined;
  const projects = content.projects.filter(project => project.technologies.includes(technology));
  const sources = projects.flatMap(project => [
    { id: `project:${project.id}`, quote: project.description },
    { id: `project:${project.id}`, quote: `Technologies: ${project.technologies.join(', ')}` },
  ]);
  return extractiveAnswer({ status: 'answered', answer: '', sources });
}

export function answerLiteralFeature(question: string, previousSources: string[]): PortfolioAnswer | undefined {
  const match = /^does (.+?) (?:support|offer|include|handle) (.+?)[?!.]?$/i.exec(question.trim());
  if (!match) return undefined;
  const subject = match[1].toLowerCase();
  const project = content.projects.find(item => [item.id, item.title].some(name => name.toLowerCase() === subject));
  const ids = project ? [`project:${project.id}`] : ['it', 'that'].includes(subject) ? [...new Set(previousSources.filter(id => id.startsWith('project:')))] : [];
  if (ids.length !== 1) return undefined;
  const feature = normalizeQuote(match[2]).toLowerCase();
  if (feature.length < 8) return undefined;
  const fact = portfolioFacts.find(item => item.id === ids[0] && item.quote.toLowerCase().includes(feature));
  if (!fact) return undefined;
  return extractiveAnswer({ status: 'answered', answer: '', sources: [{ id: fact.id, quote: fact.quote }] });
}

export function answerFromSelection(value: unknown): PortfolioAnswer | undefined {
  if (!answerObject(value) || !answerKeys(value, ['status', 'factIds']) || !['answered', 'refused', 'missing', 'out_of_scope'].includes(String(value.status)) || !Array.isArray(value.factIds) || value.factIds.length > 64) return undefined;
  const sources: SourceReference[] = [];
  for (const key of value.factIds) {
    if (typeof key !== 'string') return undefined;
    const fact = portfolioFacts.find(item => item.key === key);
    if (!fact) return undefined;
    sources.push({ id: fact.id, quote: fact.quote });
  }
  return extractiveAnswer({ status: value.status, answer: '', sources });
}

// Transport validation for answers already grounded by the server. The browser
// never receives the unreviewed draft. Source references remain catalog-only.
export function validateAnswer(value: unknown): PortfolioAnswer | undefined {
  if (!answerObject(value) || !answerKeys(value, ['status', 'answer', 'sources'])) return undefined;
  if (typeof value.answer !== 'string' || value.answer.length > 8000 || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value.answer)) return undefined;
  // Source-free conversation and general knowledge are separately reviewed on
  // the server; they cannot masquerade as catalog-backed portfolio answers.
  if (value.status === 'general') {
    if (!value.answer.trim() || !Array.isArray(value.sources) || value.sources.length) return undefined;
    return { status: 'general', answer: value.answer.trim(), sources: [] };
  }
  const evidence = extractiveAnswer(value);
  if (!evidence) return undefined;
  if (evidence.status !== 'answered') return evidence;
  if (!value.answer.trim()) return undefined;
  return { ...evidence, answer: value.answer.trim() };
}

// Keep request history within the existing byte limit, including Unicode.
export function boundedQuestionContext<T extends { question: string; sourceIds: string[]; answer?: string }>(question: string, history: T[]): T[] {
  const context = history.slice(-4);
  while (context.length && new TextEncoder().encode(JSON.stringify({ question, context })).length > 14336) context.shift();
  return context;
}

// An explicit shared-stack follow-up keeps the original group even after an
// intervening question narrows it. Require every complete documented stack.
export function answerSharedTechnologyQuestion(question: string, context: { sourceIds: string[] }[]): PortfolioAnswer | undefined {
  const sharedQuestion = /^(?:(?:what|which) (?:technolog(?:y|ies)|technology stacks?|tech) do all three (?:share|have in common|use)|(?:what|which) (?:technolog(?:y|ies)|technology stacks?|tech) (?:is|are) (?:shared by|common to) all three)[?!.]*$/i;
  if (!sharedQuestion.test(question.trim())) return undefined;
  const group = [...context].reverse().find(item => new Set(item.sourceIds.filter(id => id.startsWith('project:'))).size === 3);
  if (!group) return undefined;
  const ids = [...new Set(group.sourceIds.filter(id => id.startsWith('project:')))];
  const projects = ids.map(id => content.projects.find(project => `project:${project.id}` === id));
  if (projects.some(project => !project)) return undefined;
  const shared = projects[0]!.technologies.filter(tech => projects.every(project => project!.technologies.includes(tech)));
  const sources = projects.map(project => ({ id: `project:${project!.id}`, quote: `Technologies: ${project!.technologies.join(', ')}` }));
  return validateAnswer({ status: 'answered', answer: shared.length ? `All three list ${shared.join(', ')}.` : 'Their documented technology lists have no technologies in common.', sources });
}

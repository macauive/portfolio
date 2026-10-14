import { content } from './content.js';
import { portfolioFacts, sourceById, answerFromSelection, normalizeQuote } from './knowledge.js';
import type { PortfolioAnswer } from './knowledge.js';

export interface DraftStatement { text: string; factIds: string[] }
export interface AnswerDraft { status: Exclude<PortfolioAnswer['status'], 'general'>; statements: DraftStatement[] }
const record = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const exact = (v: Record<string, unknown>, names: string[]) => Object.keys(v).length === names.length && names.every(n => Object.hasOwn(v, n));
const factByKey = new Map(portfolioFacts.map(fact => [fact.key, fact]));
const technologies = [...new Set(content.projects.flatMap(project => project.technologies))];
export const draftSchema = {
  type: 'object', additionalProperties: false, required: ['status', 'statements'], properties: {
    status: { type: 'string', enum: ['answered', 'refused', 'missing', 'out_of_scope'] },
    statements: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['text', 'factIds'], properties: {
      text: { type: 'string' }, factIds: { type: 'array', items: { type: 'string', enum: portfolioFacts.map(fact => fact.key) } },
    } } },
  },
};
export const reviewSchema = {
  type: 'object', additionalProperties: false, required: ['safe', 'complete', 'feedback', 'verdicts'], properties: {
    safe: { type: 'boolean' },
    feedback: { type: 'string' },
    complete: { type: 'boolean' },
    verdicts: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['index', 'supported'], properties: {
      index: { type: 'integer' }, supported: { type: 'boolean' },
    } } },
  },
};
export function parseDraft(value: unknown): AnswerDraft | undefined {
  if (!record(value) || !exact(value, ['status', 'statements']) || !['answered', 'refused', 'missing', 'out_of_scope'].includes(String(value.status)) || !Array.isArray(value.statements) || value.statements.length > 24) return undefined;
  const statements: DraftStatement[] = [];
  let length = 0;
  for (const item of value.statements) {
    if (!record(item) || !exact(item, ['text', 'factIds']) || typeof item.text !== 'string' || !item.text.trim() || item.text.length > 1400 || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(item.text) || !Array.isArray(item.factIds) || item.factIds.length > 8 || !item.factIds.every(id => typeof id === 'string' && factByKey.has(id))) return undefined;
    length += item.text.trim().length + (statements.length ? 2 : 0);
    statements.push({ text: item.text.trim(), factIds: [...new Set(item.factIds)] });
  }
  if (length > 8000 || (value.status === 'answered' && !statements.length) || (value.status !== 'answered' && statements.length)) return undefined;
  return { status: value.status as AnswerDraft['status'], statements };
}
export function draftEvidence(draft: AnswerDraft): PortfolioAnswer | undefined {
  const factIds = [...new Set(draft.statements.flatMap(statement => statement.factIds))];
  if (draft.status === 'answered' && !factIds.length) return { status: 'general', answer: '', sources: [] };
  return answerFromSelection({ status: draft.status, factIds });
}
export function reviewInput(draft: AnswerDraft) {
  return draft.statements.map((statement, index) => ({ index, text: statement.text, evidence: statement.factIds.map(key => {
    const fact = factByKey.get(key)!;
    return { ...fact, sourceLabel: sourceById.get(fact.id)!.label };
  }) }));
}
// Cheap deterministic checks catch the previously observed stack confusion and
// fabricated figures before a separate semantic review of each complete claim.
export function passesLiteralChecks(draft: AnswerDraft): boolean {
  return draft.statements.every(statement => {
    if (!statement.factIds.length) return true; // General claims still require semantic/safety review.
    const evidence = statement.factIds.map(id => factByKey.get(id)!.quote).join(' ').toLowerCase();
    const text = statement.text.toLowerCase();
    const figures = text.match(/\d+(?:[.,]\d+)*/g) ?? [];
    const supportedFigures = new Set((evidence.match(/\d+(?:[.,]\d+)*/g) ?? []).map(figure => figure.replaceAll(',', '')));
    if (figures.some(figure => !supportedFigures.has(figure.replaceAll(',', '')))) return false;
    for (const tech of technologies) {
      const term = tech.toLowerCase();
      // Multiword and punctuated names use literal matching; single words use
      // token boundaries to avoid matching SQL inside PostgreSQL.
      const mentions = term.match(/^[a-z]+$/) ? text.split(/[^a-z]+/).includes(term) : text.includes(term);
      const supported = term.match(/^[a-z]+$/) ? evidence.split(/[^a-z]+/).includes(term) : evidence.includes(term);
      if (mentions && !supported) return false;
    }
    return true;
  });
}
export function reviewApproved(value: unknown, count: number): boolean {
  if (!record(value) || !exact(value, Object.hasOwn(value, 'feedback') ? ['safe', 'complete', 'feedback', 'verdicts'] : ['safe', 'complete', 'verdicts']) || value.safe !== true || value.complete !== true || !Array.isArray(value.verdicts) || value.verdicts.length !== count) return false;
  if (Object.hasOwn(value, 'feedback') && (typeof value.feedback !== 'string' || value.feedback.length > 1500)) return false;
  const seen = new Set<number>();
  for (const verdict of value.verdicts) {
    if (!record(verdict) || !exact(verdict, ['index', 'supported']) || !Number.isInteger(verdict.index) || (verdict.index as number) < 0 || (verdict.index as number) >= count || verdict.supported !== true || seen.has(verdict.index as number)) return false;
    seen.add(verdict.index as number);
  }
  return seen.size === count;
}
export function requiredFactIds(answer?: PortfolioAnswer): string[] {
  return answer?.sources.map(source => portfolioFacts.find(fact => fact.id === source.id && fact.quote === normalizeQuote(source.quote))!.key) ?? [];
}

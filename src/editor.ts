import { MAX_HISTORY, MAX_INPUT } from './commands.js';

export interface Draft { value: string; start: number; end: number }
export function cycleSelection(index: number, direction: -1 | 1, count: number): number {
  return count ? (index + direction + count) % count : -1;
}
export function searchHistory(history: string[], query: string): string[] {
  const term = query.slice(0, MAX_INPUT).trim().toLowerCase();
  return [...new Set(history.slice(-MAX_HISTORY).reverse())].filter(command => command.toLowerCase().includes(term));
}
export function canRecall(value: string, start: number, end: number, direction: -1 | 1): boolean {
  if (start !== end) return false;
  return direction < 0 ? !value.slice(0, start).includes('\n') : !value.slice(end).includes('\n');
}
export function deleteLineStart(draft: Draft): Draft {
  const start = Math.max(0, Math.min(draft.value.length, draft.start));
  const end = Math.max(start, Math.min(draft.value.length, draft.end));
  const lineStart = start === 0 ? 0 : draft.value.lastIndexOf('\n', start - 1) + 1;
  return { value: draft.value.slice(0, lineStart) + draft.value.slice(end), start: lineStart, end: lineStart };
}
export function insertNewline(draft: Draft, removeBackslash = false): Draft {
  const start = Math.max(0, draft.start - (removeBackslash ? 1 : 0));
  const next = (draft.value.slice(0, start) + '\n' + draft.value.slice(draft.end)).slice(0, MAX_INPUT);
  return { value: next, start: Math.min(start + 1, next.length), end: Math.min(start + 1, next.length) };
}

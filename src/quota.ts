export interface BudgetStatement { bind(...values: (string | number)[]): BudgetStatement }
export interface BudgetDatabase {
  prepare(sql: string): BudgetStatement;
  batch(statements: BudgetStatement[]): Promise<{ success: boolean; meta: { changes: number } }[]>;
}
export const PUBLIC_QUESTION_LIMITS = { daily: 100, visitorDaily: 20, visitorMinute: 6 } as const;

// One conditional write makes all three counters atomic across Worker isolates.
// Rejected requests do not consume another visitor's remaining site budget.
export const RESERVE_QUESTION_SQL = `INSERT INTO ai_question_reservations (id, visitor_hash, day, minute)
SELECT ?, ?, ?, ?
WHERE (SELECT COUNT(*) FROM ai_question_reservations WHERE day = ?) < ?
AND (SELECT COUNT(*) FROM ai_question_reservations WHERE visitor_hash = ? AND day = ?) < ?
AND (SELECT COUNT(*) FROM ai_question_reservations WHERE visitor_hash = ? AND minute = ?) < ?`;

export function visitorIdentity(request: Request, origin: string): { id: string; cookie?: string } {
  const preview = origin === 'http://127.0.0.1:4173';
  const name = preview ? 'portfolio-preview-visitor' : '__Host-portfolio-visitor';
  const candidate = (request.headers.get('cookie') ?? '').slice(0, 16384).split(';')
    .map(part => part.trim()).find(part => part.startsWith(`${name}=`))?.slice(name.length + 1);
  if (candidate && /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(candidate)) return { id: candidate };
  const id = crypto.randomUUID();
  return { id, cookie: `${name}=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${preview ? '' : '; Secure'}` };
}

export async function reserveQuestion(db: BudgetDatabase, visitor: string, stamp: number): Promise<boolean> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(visitor));
  const visitorHash = Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
  const day = Math.floor(stamp / 86400000);
  const minute = Math.floor(stamp / 60000);
  const result = await db.batch([
    db.prepare('DELETE FROM ai_question_reservations WHERE day < ?').bind(day - 1),
    db.prepare(RESERVE_QUESTION_SQL).bind(crypto.randomUUID(), visitorHash, day, minute,
      day, PUBLIC_QUESTION_LIMITS.daily, visitorHash, day, PUBLIC_QUESTION_LIMITS.visitorDaily,
      visitorHash, minute, PUBLIC_QUESTION_LIMITS.visitorMinute),
  ]);
  if (result.length !== 2 || result.some(item => item.success !== true) || ![0, 1].includes(result[1].meta?.changes)) throw new Error('budget-unavailable');
  return result[1].meta.changes === 1;
}

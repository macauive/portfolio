import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

// Local preview/tests only. Hosted requests use the native D1 binding.
export function createLocalBudgetDatabase() {
  const sqlite = new DatabaseSync(':memory:');
  const journal = JSON.parse(readFileSync(new URL('./drizzle/meta/_journal.json', import.meta.url), 'utf8'));
  for (const entry of journal.entries) sqlite.exec(readFileSync(new URL(`./drizzle/${entry.tag}.sql`, import.meta.url), 'utf8'));
  return {
    sqlite,
    prepare(sql) { return { sql, values: [], bind(...values) { return { ...this, values }; } }; },
    async batch(statements) {
      sqlite.exec('BEGIN IMMEDIATE');
      try {
        const results = statements.map(statement => ({ success: true, meta: { changes: Number(sqlite.prepare(statement.sql).run(...statement.values).changes) } }));
        sqlite.exec('COMMIT');
        return results;
      } catch (failure) { sqlite.exec('ROLLBACK'); throw failure; }
    },
  };
}

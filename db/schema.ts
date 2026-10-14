import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Usage counters only: never store questions, answers, IPs, or account details.
export const aiQuestionReservations = sqliteTable('ai_question_reservations', {
  id: text('id').primaryKey(),
  visitorHash: text('visitor_hash').notNull(),
  day: integer('day').notNull(),
  minute: integer('minute').notNull(),
}, table => [
  index('ai_reservations_day').on(table.day),
  index('ai_reservations_visitor_day').on(table.visitorHash, table.day),
  index('ai_reservations_visitor_minute').on(table.visitorHash, table.minute),
]);

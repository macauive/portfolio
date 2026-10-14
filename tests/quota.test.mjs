import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLocalBudgetDatabase } from '../local-budget-database.mjs';
import { reserveQuestion, visitorIdentity, PUBLIC_QUESTION_LIMITS } from '../build/quota.js';
import { createAnswerHandler } from '../build/server.js';

const origin = 'https://portfolio.example';
const visitor = '00000000-0000-4000-8000-000000000001';
const request = (extra = {}) => new Request(`${origin}/api/answer`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', Cookie: `__Host-portfolio-visitor=${visitor}`, ...extra }, body: JSON.stringify({ question: 'Hi', context: [] }) });
const provider = async (_url, options) => Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(JSON.parse(options.body).text.format.name === 'portfolio_draft' ? { status: 'answered', statements: [{ text: 'Hello!', factIds: [] }] } : { safe: true, complete: true, feedback: '', verdicts: [{ index: 0, supported: true }] }) }] }] });
const baseEnv = { OPENAI_API_KEY: 'local-test-value', OPENAI_MODEL: 'gpt-6-luna', PORTFOLIO_ORIGIN: origin };

test('anonymous questions receive a secure opaque cookie and complete without identity headers', async () => {
  const DB = createLocalBudgetDatabase();
  const response = await createAnswerHandler(provider)(request({ Cookie: '' }), { ...baseEnv, DB });
  assert.equal(response.status, 200); assert.equal((await response.json()).answer, 'Hello!');
  assert.match(response.headers.get('set-cookie'), /^__Host-portfolio-visitor=[a-f0-9-]{36}; Path=\/; HttpOnly; SameSite=Lax; Max-Age=86400; Secure$/);
  const row = DB.sqlite.prepare('SELECT * FROM ai_question_reservations').get();
  assert.equal(row.visitor_hash.length, 64); assert.equal(JSON.stringify(row).includes('Hello'), false); assert.equal(JSON.stringify(row).includes('local-test-value'), false);
});
test('configured custom and original origins both answer anonymously with secure host-only cookies', async () => {
  const customOrigin = 'https://www.portfolio.example';
  const DB = createLocalBudgetDatabase();
  const env = { ...baseEnv, PORTFOLIO_ADDITIONAL_ORIGINS: JSON.stringify([customOrigin]), DB };
  for (const accepted of [origin, customOrigin]) {
    const customRequest = new Request(`${accepted}/api/answer`, {
      method: 'POST', headers: { Origin: accepted, 'Content-Type': 'application/json', 'Sec-Fetch-Site': 'same-origin' },
      body: JSON.stringify({ question: 'Hi', context: [] }),
    });
    const response = await createAnswerHandler(provider)(customRequest, env);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).answer, 'Hello!');
    const cookie = response.headers.get('set-cookie');
    assert.match(cookie, /^__Host-portfolio-visitor=/);
    assert.match(cookie, /; Secure$/);
    assert.equal(cookie.includes('Domain='), false);
  }
  assert.equal(DB.sqlite.prepare('SELECT count(*) n FROM ai_question_reservations').get().n, 2);
});
test('custom origin allowlist rejects lookalikes, missing origins and cross-site requests before spending', async () => {
  const customOrigin = 'https://www.portfolio.example';
  const DB = createLocalBudgetDatabase(); let calls = 0;
  const handler = createAnswerHandler(async (...args) => { calls++; return provider(...args); });
  const env = { ...baseEnv, PORTFOLIO_ADDITIONAL_ORIGINS: JSON.stringify([customOrigin]), DB };
  for (const rejected of ['https://www.portfolio.example.attacker.example', 'https://sub.www.portfolio.example', 'http://www.portfolio.example', `${customOrigin}/path`, 'null', '']) {
    const response = await handler(request({ Origin: rejected, Host: 'www.portfolio.example', 'X-Forwarded-Host': 'www.portfolio.example' }), env);
    assert.equal(response.status, 403);
    assert.equal(response.headers.get('set-cookie'), null);
  }
  assert.equal((await handler(request({ Origin: customOrigin, 'Sec-Fetch-Site': 'cross-site' }), env)).status, 403);
  assert.equal(calls, 0);
  assert.equal(DB.sqlite.prepare('SELECT count(*) n FROM ai_question_reservations').get().n, 0);
});
test('malformed origin configuration fails closed rather than accepting arbitrary hosts', async () => {
  const DB = createLocalBudgetDatabase(); let calls = 0;
  const handler = createAnswerHandler(async (...args) => { calls++; return provider(...args); });
  for (const config of ['', 'not json', '{}', 'null', '["*"]', '["https://www.portfolio.example/"]', '["https://user:pass@www.portfolio.example"]', '["http://127.0.0.1:4173"]', JSON.stringify(Array(5).fill(origin)), ' '.repeat(2049)]) {
    assert.equal((await handler(request(), { ...baseEnv, DB, PORTFOLIO_ADDITIONAL_ORIGINS: config })).status, 403);
  }
  assert.equal(calls, 0);
  assert.equal(DB.sqlite.prepare('SELECT count(*) n FROM ai_question_reservations').get().n, 0);
});
test('usage is shared across handler instances and forged identity headers cannot reset it', async () => {
  const DB = createLocalBudgetDatabase(); let calls = 0;
  const wrapped = async (...args) => { calls++; return provider(...args); };
  const handlers = Array.from({ length: 8 }, () => createAnswerHandler(wrapped, () => 0));
  const responses = await Promise.all(handlers.map((handler, i) => handler(request({ 'oai-authenticated-user-id': `forged-${i}` }), { ...baseEnv, DB })));
  assert.equal(responses.filter(response => response.status === 200).length, 6);
  assert.equal(responses.filter(response => response.status === 429).length, 2);
  assert.equal(calls, 12);
});
test('daily visitor quota does not consume the shared budget when it rejects a request', async () => {
  const DB = createLocalBudgetDatabase();
  for (let i = 0; i < PUBLIC_QUESTION_LIMITS.visitorDaily; i++) assert.equal(await reserveQuestion(DB, visitor, i * 60000), true);
  assert.equal(await reserveQuestion(DB, visitor, 21 * 60000), false);
  assert.equal(DB.sqlite.prepare('SELECT count(*) n FROM ai_question_reservations').get().n, 20);
  assert.equal(await reserveQuestion(DB, crypto.randomUUID(), 21 * 60000), true);
});
test('atomic global cap survives parallel callers, fresh cookies and new handler instances', async () => {
  const DB = createLocalBudgetDatabase();
  const results = await Promise.all(Array.from({ length: 110 }, () => reserveQuestion(DB, crypto.randomUUID(), 0)));
  assert.equal(results.filter(Boolean).length, PUBLIC_QUESTION_LIMITS.daily);
  assert.equal(await reserveQuestion(DB, crypto.randomUUID(), 60000), false);
  assert.equal(DB.sqlite.prepare('SELECT count(*) n FROM ai_question_reservations').get().n, PUBLIC_QUESTION_LIMITS.daily);
  assert.equal(await reserveQuestion(DB, crypto.randomUUID(), 86400000), true);
  assert.equal(await reserveQuestion(DB, crypto.randomUUID(), 3 * 86400000), true);
  assert.equal(DB.sqlite.prepare('SELECT count(*) n FROM ai_question_reservations').get().n, 1);
});
test('missing, failed or malformed shared-budget results fail closed before the provider', async () => {
  let calls = 0;
  for (const DB of [undefined, { prepare() { throw Error('private database failure'); } }, { prepare() { return { bind() { return this; } }; }, async batch() { return []; } }]) {
    const response = await createAnswerHandler(async () => { calls++; return provider(); })(request(), { ...baseEnv, DB });
    assert.equal(response.status, 503); assert.equal((await response.text()).includes('private database failure'), false);
  }
  assert.equal(calls, 0);
});
test('origin rejection cannot mint cookies or reserve budget, and cookie contents are never auth', async () => {
  const DB = createLocalBudgetDatabase();
  const response = await createAnswerHandler(provider)(request({ Origin: 'https://attacker.example' }), { ...baseEnv, DB });
  assert.equal(response.status, 403); assert.equal(response.headers.get('set-cookie'), null);
  assert.equal(DB.sqlite.prepare('SELECT count(*) n FROM ai_question_reservations').get().n, 0);
  assert.equal(visitorIdentity(request(), origin).id, visitor);
  assert.ok(visitorIdentity(request({ Cookie: '__Host-portfolio-visitor=../../secret' }), origin).cookie);
});

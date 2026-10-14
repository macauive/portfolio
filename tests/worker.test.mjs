import assert from 'node:assert/strict';
import { test } from 'node:test';
import worker from '../dist/server/index.js';

test('Worker serves only packaged public assets and protects the answer endpoint', async () => {
  const home = await worker.fetch(new Request('https://portfolio.example/'), {});
  assert.equal(home.status, 200);
  assert.ok((await home.text()).includes('macauive'));
  assert.equal(home.headers.get('x-content-type-options'), 'nosniff');
  assert.equal((await worker.fetch(new Request('https://portfolio.example/assets/caret.js'), {})).status, 200);
  for (const path of ['/assets/server.js', '/.env.local', '/research/interaction-study.json', '/not-found']) assert.equal((await worker.fetch(new Request(`https://portfolio.example${path}`), {})).status, 404);
  assert.equal((await worker.fetch(new Request('https://portfolio.example/api/answer', { method: 'POST' }), {})).status, 403);
  for (const path of ['/assets/quota.js', '/.openai/drizzle/meta/_journal.json']) assert.equal((await worker.fetch(new Request(`https://portfolio.example${path}`), {})).status, 404);
});

test('published browser assets share a content version across the module graph', async () => {
  const html = await (await worker.fetch(new Request('https://portfolio.example/'), {})).text();
  const match = /src="(\/assets\/app\.js\?v=([a-f0-9]{12}))"/.exec(html);
  assert.ok(match);
  const app = await (await worker.fetch(new Request(`https://portfolio.example${match[1]}`), {})).text();
  const imports = [...app.matchAll(/from ['"]\.\/([a-z]+)\.js\?v=([a-f0-9]{12})['"]/g)];
  assert.ok(imports.length > 0);
  for (const [, name, version] of imports) {
    assert.equal(version, match[2]);
    assert.equal((await worker.fetch(new Request(`https://portfolio.example/assets/${name}.js?v=${version}`), {})).status, 200);
  }
  assert.ok(html.includes(`/assets/styles.css?v=${match[2]}`));
  const knowledge = await (await worker.fetch(new Request(`https://portfolio.example/assets/knowledge.js?v=${match[2]}`), {})).text();
  assert.ok(knowledge.includes('I don’t have that detail in Iver’s portfolio.'));
});

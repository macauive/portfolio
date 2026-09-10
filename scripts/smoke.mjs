import assert from 'node:assert/strict';
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3100';
for (const path of ['/', '/work', '/projects', '/skills', '/contact']) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, path);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
  const csp = response.headers.get('content-security-policy');
  for (const directive of ["frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'", "form-action 'none'"]) assert.ok(csp?.includes(directive), directive);
  const html = await response.text();
  assert.ok(html.includes(`<link rel="canonical" href="https://macauive.dev${path === '/' ? '' : path}"`), `canonical: ${path}`);
  assert.ok(html.includes('Primary navigation'), `navigation: ${path}`);
}
for (const path of ['/projects/amountly', '/projects/not-published', '/missing-page']) {
  assert.equal((await fetch(new URL(path, base))).status, 404, path);
}
console.log('Route, metadata, security header, and unknown-project checks passed.');

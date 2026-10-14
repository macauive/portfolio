import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import ts from 'typescript';
import { createHash } from 'node:crypto';

mkdirSync(new URL('./build/', import.meta.url), { recursive: true });
const compiled = {};
for (const name of ['content', 'commands', 'editor', 'caret', 'knowledge', 'grounding', 'quota', 'server', 'app']) {
  const source = readFileSync(new URL(`./src/${name}.ts`, import.meta.url), 'utf8');
  const result = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
    reportDiagnostics: true,
    fileName: `${name}.ts`,
  });
  if (result.diagnostics?.some(item => item.category === ts.DiagnosticCategory.Error)) {
    throw new Error(`Unable to build ${name}. Run typecheck for diagnostics.`);
  }
  compiled[name] = result.outputText;
  writeFileSync(new URL(`./build/${name}.js`, import.meta.url), result.outputText);
}
const assets = {};
for (const [route, filename, mime] of [
  ['/', './web/index.html', 'text/html; charset=utf-8'],
  ['/assets/styles.css', './web/assets/styles.css', 'text/css; charset=utf-8'],
  ['/assets/lightning.svg', './web/assets/lightning.svg', 'image/svg+xml'],
]) assets[route] = { body: readFileSync(new URL(filename, import.meta.url), 'utf8'), mime };
for (const name of ['content', 'commands', 'editor', 'caret', 'knowledge', 'app']) assets[`/assets/${name}.js`] = { body: compiled[name], mime: 'text/javascript; charset=utf-8' };

// Version the complete browser module graph so reused tabs cannot combine an
// updated entrypoint with stale imported modules after a private publication.
const assetVersion = createHash('sha256').update(JSON.stringify(assets)).digest('hex').slice(0, 12);
for (const [route, asset] of Object.entries(assets)) {
  if (route.endsWith('.js')) asset.body = asset.body.replace(/from (["'])\.\/([a-z]+)\.js\1/g, (_match, quote, name) => {
    if (!Object.hasOwn(assets, `/assets/${name}.js`)) throw new Error('Unknown browser module dependency');
    return `from ${quote}./${name}.js?v=${assetVersion}${quote}`;
  });
}
for (const route of ['/assets/app.js', '/assets/styles.css', '/assets/lightning.svg']) {
  assets['/'].body = assets['/'].body.replaceAll(route, `${route}?v=${assetVersion}`);
}

// Bundle the fixed, dependency-free modules into a single Worker ESM entry.
// Authored web files remain in web/; dist/ is entirely reproducible output.
const withoutModuleSyntax = source => source.replace(/^import .*;\n/gm, '').replace(/^export /gm, '');
const worker = [
  withoutModuleSyntax(compiled.content), withoutModuleSyntax(compiled.knowledge), withoutModuleSyntax(compiled.grounding), withoutModuleSyntax(compiled.quota), withoutModuleSyntax(compiled.server),
  `const assets = ${JSON.stringify(assets)};`,
  `const portfolioWorker = { async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/answer') return apiHandler(request, env);
    if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
    const asset = Object.hasOwn(assets, url.pathname) ? assets[url.pathname] : undefined;
    if (!asset) return new Response('Not found', { status: 404 });
    return new Response(request.method === 'HEAD' ? null : asset.body, { headers: { 'Content-Type': asset.mime, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'Permissions-Policy': 'camera=(), microphone=(), geolocation=()' } });
  } }; export default portfolioWorker;`,
].join('\n');
rmSync(new URL('./dist/', import.meta.url), { recursive: true, force: true });
mkdirSync(new URL('./dist/server/', import.meta.url), { recursive: true });
mkdirSync(new URL('./dist/.openai/', import.meta.url), { recursive: true });
writeFileSync(new URL('./dist/server/index.js', import.meta.url), worker);
writeFileSync(new URL('./dist/.openai/hosting.json', import.meta.url), readFileSync(new URL('./.openai/hosting.json', import.meta.url)));
cpSync(new URL('./drizzle/', import.meta.url), new URL('./dist/.openai/drizzle/', import.meta.url), { recursive: true });
const imported = await import(`data:text/javascript;base64,${Buffer.from(worker).toString('base64')}`);
if (typeof imported.default?.fetch !== 'function') throw new Error('Worker artifact is invalid');
console.log('Built and validated the single-file portfolio Worker.');

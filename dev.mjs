import { createServer } from 'node:http';
import { readFileSync, lstatSync } from 'node:fs';
import worker from './dist/server/index.js';
import { createLocalBudgetDatabase } from './local-budget-database.mjs';

const origin = 'http://127.0.0.1:4173';
let key = process.env.OPENAI_API_KEY;
// Optional confirmed local source is read into server memory; it is never copied.
const source = process.env.PORTFOLIO_OPENAI_ENV_FILE;
if (!key && source) {
  if (!lstatSync(source).isFile() || lstatSync(source).isSymbolicLink()) throw new Error('Use a regular local environment file.');
  const line = readFileSync(source, 'utf8').split(/\r?\n/).find(item => /^\s*(?:export\s+)?OPENAI_API_KEY\s*=/.test(item));
  key = line?.replace(/^\s*(?:export\s+)?OPENAI_API_KEY\s*=\s*/, '').trim().replace(/^['"]|['"]$/g, '');
}
const env = { OPENAI_API_KEY: key, OPENAI_MODEL: 'gpt-6-luna', PORTFOLIO_ORIGIN: origin, DB: createLocalBudgetDatabase() };
createServer(async (req, res) => {
  const controller = new AbortController();
  res.on('close', () => { if (!res.writableEnded) controller.abort(); });
  try {
    const body = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 16384) { res.writeHead(413); res.end('Payload too large'); return; }
      body.push(chunk);
    }
    const headers = new Headers();
    for (const [name, value] of Object.entries(req.headers)) if (typeof value === 'string') headers.set(name, value);
    // This loopback-only development adapter needs no account or identity override.
    const request = new Request(new URL(req.url ?? '/', origin), { method: req.method, headers, signal: controller.signal, ...(body.length ? { body: Buffer.concat(body) } : {}) });
    const result = await worker.fetch(request, env);
    res.writeHead(result.status, Object.fromEntries(result.headers));
    res.end(Buffer.from(await result.arrayBuffer()));
  } catch { res.writeHead(500); res.end('Preview unavailable'); }
}).listen(4173, '127.0.0.1', () => console.log(`Local: ${origin}`));

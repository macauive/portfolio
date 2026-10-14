import assert from 'node:assert/strict';
import { test } from 'node:test';
import { content } from '../build/content.js';
import { resolveCommand, completions, describeCommand, recall, remember, safeHref, MAX_HISTORY, MAX_INPUT } from '../build/commands.js';

test('all portfolio commands and documented aliases resolve', () => {
  for (const command of ['/help', '/about', '/home', '/projects', '/work', '/skills', '/contact', '/history', '/clear', '?', 'help', 'home', 'about', 'projects', 'work', 'skills', 'contact', 'history', 'clear']) {
    assert.notEqual(resolveCommand(command, content).kind, 'error', command);
  }
  assert.equal(resolveCommand(' /HOME ', content).kind, 'about');
  assert.deepEqual(content.productIds, ['mac-digital', 'drop-it', 'amountly']);
  for (const project of content.projects) {
    assert.equal(resolveCommand(`/project ${project.id}`, content).project.id, project.id);
    assert.equal(resolveCommand(`/project ${project.title.toUpperCase()}`, content).project.id, project.id);
  }
});

test('unknown commands, extra arguments, missing projects, and executable input are rejected', () => {
  for (const command of ['', '/project', '/project unknown', '/about extra', 'rm -rf /', '<img src=x onerror=alert(1)>', '/projects;alert(1)', '__proto__', 'constructor', 'toString', 'x'.repeat(MAX_INPUT + 1)]) {
    assert.equal(resolveCommand(command, content).kind, 'error', command);
  }
});

test('completion supports commands, project slugs and project names', () => {
  assert.deepEqual(completions('/sk', content), ['/skills']);
  assert.equal(completions('/project', content)[0], '/project');
  assert.deepEqual(completions('/project Drop', content), ['/project drop-it']);
  assert.deepEqual(completions('/project mac-d', content), ['/project mac-digital']);
  assert.equal(completions('/project ', content).length, content.projects.length);
  for (const option of completions('/', content)) assert.ok(describeCommand(option, content));
  assert.equal(describeCommand('__proto__', content), '');
  assert.deepEqual(completions('rm', content), []);
  assert.deepEqual(completions('', content), []);
});

test('multiline project commands remain one allowlisted action; command chaining is rejected', () => {
  assert.equal(resolveCommand('/project\nDrop It', content).project.id, 'drop-it');
  assert.equal(resolveCommand('/contact\n/projects', content).kind, 'error');
  assert.equal(resolveCommand('/help && /clear', content).kind, 'error');
});

test('history stays bounded, skips empty and adjacent duplicate entries, and restores draft', () => {
  let history = [];
  for (let index = 0; index < 100; index++) history = remember(history, `/project ${index}`);
  assert.equal(history.length, MAX_HISTORY);
  assert.equal(history[0], '/project 60');
  assert.deepEqual(remember(history, history.at(-1)), history);
  assert.deepEqual(remember(history, ' '), history);
  assert.equal(remember([], 'x'.repeat(MAX_INPUT + 50))[0].length, MAX_INPUT);
  const up = recall(history, history.length, -1, '/draft');
  assert.equal(up.value, '/project 99');
  assert.equal(recall(history, up.index, 1, '/draft').value, '/draft');
  assert.equal(recall(history, 0, -1, '').index, 0);
});

test('links allow only approved HTTPS destinations and simple email addresses', () => {
  for (const value of ['https://macdigital.ai', 'https://dontdropit.app', 'https://amountly.app', 'https://github.com/macauive', `mailto:${content.personal.email}`]) assert.ok(safeHref(value));
  for (const value of ['javascript:alert(1)', 'https://amountly.app.evil.test', 'http://amountly.app', 'https://user:pass@amountly.app', 'https://amountly.app:8888', 'https://example.com', 'mailto:a@b.com?subject=unexpected']) assert.equal(safeHref(value), undefined);
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canRecall, cycleSelection, deleteLineStart, insertNewline, searchHistory } from '../build/editor.js';
import { MAX_INPUT } from '../build/commands.js';

test('picker navigation wraps at either edge and handles no matches', () => {
  assert.equal(cycleSelection(0, -1, 10), 9);
  assert.equal(cycleSelection(9, 1, 10), 0);
  assert.equal(cycleSelection(0, 1, 0), -1);
});
test('history search is newest first, deduplicated, case insensitive and bounded', () => {
  assert.deepEqual(searchHistory(['/contact', '/projects', '/contact'], ''), ['/contact', '/projects']);
  assert.deepEqual(searchHistory(['/project drop-it', '/skills'], 'DROP'), ['/project drop-it']);
  assert.deepEqual(searchHistory(['/help'], 'no-match'), []);
  assert.equal(searchHistory(Array.from({length:100}, (_, i) => `/project ${i}`), '').length, 40);
});
test('multiline history navigation leaves interior lines and selections for cursor editing', () => {
  const value = 'first\nsecond\nthird';
  assert.equal(canRecall(value, 3, 3, -1), true);
  assert.equal(canRecall(value, 8, 8, -1), false);
  assert.equal(canRecall(value, 8, 8, 1), false);
  assert.equal(canRecall(value, value.length, value.length, 1), true);
  assert.equal(canRecall(value, 0, 4, -1), false);
});
test('Ctrl+U deletes only the current line prefix and selected text', () => {
  assert.deepEqual(deleteLineStart({value:'one\ntwo three',start:7,end:7}), {value:'one\n three',start:4,end:4});
  assert.deepEqual(deleteLineStart({value:'one\ntwo three',start:7,end:13}), {value:'one\n',start:4,end:4});
  assert.deepEqual(deleteLineStart({value:'\nhello',start:0,end:0}), {value:'\nhello',start:0,end:0});
});
test('newlines replace selections, support backslash escape, and obey the input limit', () => {
  assert.deepEqual(insertNewline({value:'/projectDrop It',start:8,end:8}), {value:'/project\nDrop It',start:9,end:9});
  assert.deepEqual(insertNewline({value:'a\\b',start:2,end:2}, true), {value:'a\nb',start:2,end:2});
  assert.deepEqual(insertNewline({value:'abcd',start:1,end:3}), {value:'a\nd',start:2,end:2});
  assert.equal(insertNewline({value:'x'.repeat(MAX_INPUT),start:MAX_INPUT,end:MAX_INPUT}).value.length, MAX_INPUT);
});

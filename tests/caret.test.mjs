import assert from 'node:assert/strict';
import { test } from 'node:test';
import { caretParts } from '../build/caret.js';

test('cursor tracks insertion point without dropping text at line ends or splitting a code point', () => {
  assert.deepEqual(caretParts('abc', 1), { before: 'a', character: 'b', after: 'c' });
  assert.deepEqual(caretParts('abc', 3), { before: 'abc', character: '\u00a0', after: '' });
  assert.deepEqual(caretParts('a\nb', 1), { before: 'a', character: '\u00a0', after: '\nb' });
  assert.deepEqual(caretParts('🤖x', 0), { before: '', character: '🤖', after: 'x' });
  assert.deepEqual(caretParts('a b', 1), { before: 'a', character: '\u00a0', after: 'b' });
});

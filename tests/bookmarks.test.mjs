import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatBookmark,
  normalizeUrl,
  recoverBookmarks,
} from '../src/lib/bookmarks.mjs';

test('normalizes web addresses with or without a scheme', () => {
  assert.equal(normalizeUrl('example.com'), 'https://example.com/');
  assert.equal(normalizeUrl('  https://example.com/path  '), 'https://example.com/path');
  assert.equal(normalizeUrl('http://example.com'), 'http://example.com/');
});

test('rejects unsupported and malformed URLs', () => {
  assert.throws(() => normalizeUrl('javascript:alert(1)'), /Only HTTP and HTTPS/);
  assert.throws(() => normalizeUrl('not a url'), /valid web address/);
  assert.throws(() => normalizeUrl('  '), /valid web address/);
});

test('recovers empty, corrupted, legacy, and non-array storage as an empty list', () => {
  for (const value of ['', '   ', '{broken', '{"url":"https://example.com"}', 'null', '42']) {
    assert.deepEqual(recoverBookmarks(value), []);
  }
  assert.deepEqual(recoverBookmarks(null), []);
});

test('keeps valid bookmark objects and discards malformed entries', () => {
  assert.deepEqual(
    recoverBookmarks(
      JSON.stringify([
        { url: 'example.com', slug: 'mona-7fk2' },
        { url: 'javascript:alert(1)', slug: 'mona-valid' },
        { url: 'https://example.org', slug: 'not-a-mona-slug' },
        { url: 42, slug: 'mona-valid' },
        null,
      ]),
    ),
    [{ url: 'https://example.com/', slug: 'mona-7fk2' }],
  );
});

test('formats a bookmark with the exact URL :: slug separator', () => {
  assert.equal(
    formatBookmark({ url: 'https://example.com/', slug: 'mona-7fk2' }),
    'https://example.com/ :: mona-7fk2',
  );
});

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('Portal inline script compiles without JavaScript syntax errors', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'portal', 'public', 'index.html'), 'utf8');
  const match = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(match, 'Portal inline script is present');
  assert.doesNotThrow(() => new vm.Script(match[1], { filename: 'portal/public/index.html' }));
});

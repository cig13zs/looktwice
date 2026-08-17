'use strict';

var assert = require('assert');
var E = require('./src/engine.js');

assert.strictEqual(E.bareHost('www.Google.com'), 'google.com');
assert.strictEqual(E.hostish('Open google.com now'), 'google.com');
assert.strictEqual(E.hostish('click here'), null);

assert.ok(E.isTrackingKey('utm_source'));
assert.ok(E.isTrackingKey('fbclid'));
assert.ok(!E.isTrackingKey('id'));

var stripped = E.stripTracking(
  'https://shop.example/p?id=9&utm_source=ig&fbclid=abc',
  'https://shop.example/'
);
assert.strictEqual(stripped.href, 'https://shop.example/p?id=9');
assert.deepStrictEqual(stripped.removed.sort(), ['fbclid', 'utm_source']);

var mismatch = E.classifyLink(
  'https://evil.example/login',
  'paypal.com login',
  'https://mail.example/inbox'
);
assert.strictEqual(mismatch.kind, 'mismatch');
assert.strictEqual(mismatch.textHost, 'paypal.com');
assert.strictEqual(mismatch.host, 'evil.example');

var js = E.classifyLink('javascript:alert(1)', 'ok', 'https://a.example/');
assert.strictEqual(js.kind, 'scheme');

var track = E.classifyLink(
  'https://news.example/a?utm_medium=email',
  'read this',
  'https://news.example/'
);
assert.strictEqual(track.kind, 'tracking');

var form = E.classifyForm(
  'https://other.example/collect',
  'https://bank.example/login',
  ['csrf', 'redir'],
  true
);
assert.ok(form.offsite);
assert.ok(form.passwordOffsite);
assert.deepStrictEqual(form.hidden, ['csrf', 'redir']);

var same = E.classifyForm('', 'https://bank.example/login', [], true);
assert.ok(!same.offsite);
assert.ok(!same.passwordOffsite);

console.log('ok');

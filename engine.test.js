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

var creds = E.stripTracking('https://user:pw@shop.example/p', 'https://shop.example/');
assert.ok(creds.removed.indexOf('userinfo') !== -1);
assert.ok(creds.href.indexOf('user') === -1);

var mismatch = E.classifyLink(
  'https://evil.example/login',
  'paypal.com login',
  'https://mail.example/inbox'
);
assert.strictEqual(mismatch.kind, 'mismatch');
assert.strictEqual(mismatch.textHost, 'paypal.com');

var js = E.classifyLink('javascript:alert(1)', 'ok', 'https://a.example/');
assert.strictEqual(js.kind, 'scheme');

var track = E.classifyLink(
  'https://news.example/a?utm_medium=email',
  'read this',
  'https://news.example/'
);
assert.strictEqual(track.kind, 'tracking');

var bait = E.classifyLink(
  'https://paypal.com@evil.example/login',
  'paypal',
  'https://mail.example/'
);
assert.strictEqual(bait.kind, 'userinfo');
assert.ok(bait.userinfo);

var puny = E.classifyLink(
  'https://xn--pple-43d.com/',
  'apple',
  'https://mail.example/'
);
assert.strictEqual(puny.kind, 'punycode');

var mixed = E.classifyLink(
  'https://payp\u0430l.com/',
  'bank',
  'https://mail.example/'
);
assert.ok(E.mixedScript('payp\u0430l.com'));
assert.strictEqual(mixed.kind, 'punycode');

var rel = E.classifyLink('/about?utm_source=x', 'about', 'https://news.example/home');
assert.strictEqual(rel.kind, 'tracking');
assert.strictEqual(rel.host, 'news.example');

var form = E.classifyForm(
  'https://other.example/collect',
  'https://bank.example/login',
  ['csrf', 'redir'],
  true
);
assert.ok(form.offsite);
assert.ok(form.passwordOffsite);

var same = E.classifyForm('', 'https://bank.example/login', [], true);
assert.ok(!same.offsite);
assert.ok(!same.passwordOffsite);

var jsForm = E.classifyForm('javascript:void(0)', 'https://bank.example/login', [], false);
assert.ok(jsForm.odd);

var spaced = E.classifyLink('  https://evil.example/x  ', 'ok', 'https://a.example/');
assert.strictEqual(spaced.host, 'evil.example');

console.log('ok');

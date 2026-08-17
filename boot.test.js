'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');

var man = JSON.parse(fs.readFileSync(path.join(__dirname, 'src', 'manifest.json'), 'utf8'));
assert.strictEqual(man.manifest_version, 3);
assert.ok(!man.host_permissions);
assert.ok(!man.content_scripts);
assert.deepStrictEqual(man.permissions.sort(), ['activeTab', 'scripting']);
assert.ok(fs.existsSync(path.join(__dirname, 'src', 'icons', '128.png')));
console.log('boot ok');

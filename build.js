'use strict';

var fs = require('fs');
var path = require('path');
var { spawnSync } = require('child_process');

var root = __dirname;
var src = path.join(root, 'src');
var dist = path.join(root, 'dist');

function rm(p) {
  if (!fs.existsSync(p)) return;
  fs.rmSync(p, { recursive: true, force: true });
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from, { withFileTypes: true }).forEach(function (ent) {
    var a = path.join(from, ent.name);
    var b = path.join(to, ent.name);
    if (ent.isDirectory()) copyDir(a, b);
    else fs.copyFileSync(a, b);
  });
}

var test = spawnSync(process.execPath, [path.join(root, 'engine.test.js')], { stdio: 'inherit' });
if (test.status !== 0) process.exit(test.status || 1);

rm(dist);
copyDir(src, dist);
console.log('dist ready');

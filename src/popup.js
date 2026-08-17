'use strict';

var statusEl = document.getElementById('status');
var mainEl = document.getElementById('main');
var pageEl = document.getElementById('page');
var countsEl = document.getElementById('counts');
var listEl = document.getElementById('list');
var copyBtn = document.getElementById('copy');
var copiedEl = document.getElementById('copied');
var lastClean = '';

function showErr(msg) {
  statusEl.hidden = false;
  statusEl.textContent = msg;
  statusEl.className = 'err';
}

function kindLabel(k) {
  if (k === 'mismatch') return 'text host != href';
  if (k === 'scheme') return 'odd scheme';
  if (k === 'offsite') return 'off-site';
  if (k === 'tracking') return 'tracking params';
  if (k === 'userinfo') return 'user@host';
  if (k === 'punycode') return 'lookalike host';
  if (k === 'invalid') return 'bad href';
  return k;
}

function loud(kind) {
  return kind !== 'ok' && kind !== 'offsite';
}

function addItem(kind, title, detail, copyHref) {
  var div = document.createElement('div');
  div.className = 'item';
  var k = document.createElement('div');
  k.className = 'kind' + (kind === 'ok' ? ' ok' : '');
  k.textContent = kindLabel(kind);
  var t = document.createElement('div');
  t.textContent = title;
  div.appendChild(k);
  div.appendChild(t);
  if (detail) {
    var d = document.createElement('div');
    d.className = 'url';
    d.textContent = detail;
    div.appendChild(d);
  }
  if (copyHref) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'small';
    b.textContent = 'copy clean';
    b.addEventListener('click', function () {
      navigator.clipboard.writeText(copyHref);
    });
    div.appendChild(b);
  }
  listEl.appendChild(div);
}

function render(data) {
  statusEl.hidden = true;
  mainEl.hidden = false;
  pageEl.textContent = data.pageUrl;
  lastClean = data.cleanUrl || data.pageUrl;
  copyBtn.disabled = !lastClean;

  var flags = data.links.filter(function (l) { return loud(l.kind); });
  var offsite = data.links.filter(function (l) { return l.kind === 'offsite'; });
  var hotForms = data.forms.filter(function (f) {
    return f.offsite || f.passwordOffsite || f.userinfo || f.odd;
  });

  countsEl.textContent =
    data.links.length + ' links, ' +
    flags.length + ' worth a look, ' +
    offsite.length + ' leave this host. ' +
    data.forms.length + ' forms' +
    (hotForms.length ? ', ' + hotForms.length + ' odd' : '') +
    (data.removed && data.removed.length ? '. this URL drops ' + data.removed.join(', ') : '.');

  hotForms.forEach(function (f) {
    var title = 'form';
    if (f.passwordOffsite) title = 'password form leaves this host';
    else if (f.odd) title = 'form action is ' + f.scheme;
    else if (f.userinfo) title = 'form action has user@host';
    else if (f.offsite) title = 'form leaves this host';
    var extra = f.hidden.length ? ' hidden: ' + f.hidden.join(', ') : '';
    addItem(f.odd || f.userinfo ? 'scheme' : 'mismatch', title, (f.actionHost || '') + extra);
  });

  flags.slice(0, 30).forEach(function (l) {
    var title = l.text || l.href;
    var detail = l.host || l.scheme;
    if (l.mismatch) detail = l.textHost + ' -> ' + l.host;
    if (l.userinfo) detail = 'userinfo on ' + l.host;
    if (l.puny || l.mixed) detail = 'host ' + l.host;
    if (l.tracking.length) detail = (detail ? detail + ' · ' : '') + l.tracking.join(', ');
    addItem(l.kind, title, detail, l.clean || l.href);
  });

  if (flags.length > 30) {
    addItem('ok', (flags.length - 30) + ' more not shown', '');
  }

  if (!flags.length && !hotForms.length) {
    addItem('ok', 'nothing loud on this page', 'off-site links are in the count only');
  }
}

copyBtn.addEventListener('click', function () {
  if (!lastClean) return;
  navigator.clipboard.writeText(lastClean).then(function () {
    copiedEl.hidden = false;
    setTimeout(function () { copiedEl.hidden = true; }, 1200);
  }).catch(function () {
    showErr('Clipboard blocked.');
  });
});

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  var tab = tabs && tabs[0];
  if (!tab || !tab.id) {
    showErr('No active tab.');
    return;
  }
  var url = tab.url || '';
  if (!/^https?:/i.test(url)) {
    showErr('Open a regular http(s) page, then click again.');
    return;
  }
  chrome.scripting.executeScript(
    { target: { tabId: tab.id }, files: ['engine.js', 'content.js'] },
    function (results) {
      if (chrome.runtime.lastError) {
        showErr(chrome.runtime.lastError.message);
        return;
      }
      var data = results && results[0] && results[0].result;
      if (!data) {
        showErr('Could not read this page.');
        return;
      }
      render(data);
    }
  );
});

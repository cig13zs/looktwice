function collectPage() {
  var pageUrl = location.href;
  var api = globalThis.Looktwice;
  var links = [];
  var seen = {};
  var anchors = document.querySelectorAll('a[href]');
  for (var i = 0; i < anchors.length; i++) {
    var a = anchors[i];
    var href = a.getAttribute('href') || '';
    if (!href || href.charAt(0) === '#') continue;
    var info = api.classifyLink(href, (a.textContent || '').replace(/\s+/g, ' ').trim(), pageUrl);
    var key = info.kind + '|' + info.href;
    if (seen[key]) continue;
    seen[key] = 1;
    info.text = (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80);
    links.push(info);
  }

  var forms = [];
  var nodes = document.querySelectorAll('form');
  for (var j = 0; j < nodes.length; j++) {
    var f = nodes[j];
    var names = [];
    var hidden = f.querySelectorAll('input[type="hidden"]');
    for (var k = 0; k < hidden.length; k++) {
      names.push(hidden[k].getAttribute('name') || '(unnamed)');
    }
    var hasPw = !!f.querySelector('input[type="password"]');
    var row = api.classifyForm(f.getAttribute('action'), pageUrl, names, hasPw);
    row.method = (f.getAttribute('method') || 'get').toLowerCase();
    forms.push(row);
  }

  var clean = api.stripTracking(pageUrl, pageUrl);
  return {
    pageUrl: pageUrl,
    cleanUrl: clean.href,
    removed: clean.removed,
    links: links,
    forms: forms
  };
}

collectPage();

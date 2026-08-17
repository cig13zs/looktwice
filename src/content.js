function collectPage() {
  var pageUrl = location.href;
  var api = globalThis.Looktwice;
  if (!api) return null;
  var links = [];
  var seen = {};
  var nodes = document.querySelectorAll('a[href], area[href]');
  var i;
  for (i = 0; i < nodes.length && links.length < 400; i++) {
    var a = nodes[i];
    var href = (a.getAttribute('href') || '').trim();
    if (!href || href.charAt(0) === '#') continue;
    var text = (a.textContent || a.getAttribute('alt') || '').replace(/\s+/g, ' ').trim();
    var info = api.classifyLink(href, text, pageUrl);
    var key = info.kind + '|' + info.href;
    if (seen[key]) continue;
    seen[key] = 1;
    info.text = text.slice(0, 80);
    var clean = api.stripTracking(info.href, pageUrl);
    info.clean = clean.href;
    links.push(info);
  }

  var forms = [];
  var formNodes = document.querySelectorAll('form');
  for (var j = 0; j < formNodes.length && forms.length < 80; j++) {
    var f = formNodes[j];
    var names = [];
    var hidden = f.querySelectorAll('input[type="hidden"]');
    for (var k = 0; k < hidden.length && names.length < 30; k++) {
      names.push(hidden[k].getAttribute('name') || '(unnamed)');
    }
    var hasPw = !!f.querySelector('input[type="password"]');
    var action = f.getAttribute('action');
    var fa = f.querySelector('[formaction]');
    if (fa && fa.getAttribute('formaction')) action = fa.getAttribute('formaction');
    var row = api.classifyForm(action, pageUrl, names, hasPw);
    row.method = (f.getAttribute('method') || 'get').toLowerCase();
    forms.push(row);
  }

  var cleanPage = api.stripTracking(pageUrl, pageUrl);
  return {
    pageUrl: pageUrl,
    cleanUrl: cleanPage.href,
    removed: cleanPage.removed,
    links: links,
    forms: forms
  };
}

collectPage();

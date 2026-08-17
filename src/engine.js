/*
 * Pure URL/form checks. No DOM, no network.
 */
(function (root) {
  'use strict';

  var TRACKING_KEYS = {
    utm_source: 1, utm_medium: 1, utm_campaign: 1, utm_term: 1,
    utm_content: 1, utm_id: 1, utm_reader: 1, utm_name: 1,
    fbclid: 1, gclid: 1, gclsrc: 1, dclid: 1, wbraid: 1, gbraid: 1,
    msclkid: 1, twclid: 1, ttclid: 1, li_fat_id: 1, igshid: 1,
    mc_cid: 1, mc_eid: 1, _hsenc: 1, _hsmi: 1, mkt_tok: 1,
    yclid: 1, ysclid: 1, wickedid: 1, vero_id: 1,
    ref_src: 1, ref_url: 1, spm: 1, scm: 1,
    oly_anon_id: 1, oly_enc_id: 1, nr_email_referer: 1
  };

  var ODD_SCHEMES = { javascript: 1, data: 1, blob: 1, vbscript: 1 };

  function bareHost(host) {
    if (!host) return '';
    host = String(host).toLowerCase();
    if (host.indexOf('www.') === 0) host = host.slice(4);
    return host;
  }

  function parseUrl(href, base) {
    try {
      return new URL(String(href).trim(), base || undefined);
    } catch (e) {
      return null;
    }
  }

  function hostish(text) {
    if (!text) return null;
    var m = String(text).match(/\b(?:www\.)?([a-z0-9-]+\.)+[a-z]{2,}\b/i);
    return m ? bareHost(m[0]) : null;
  }

  function isTrackingKey(key) {
    if (!key) return false;
    key = String(key).toLowerCase();
    if (TRACKING_KEYS[key]) return true;
    return key.indexOf('utm_') === 0;
  }

  function mixedScript(host) {
    if (!host) return false;
    var latin = /[A-Za-z]/.test(host);
    var other = /[\u0370-\u03FF\u0400-\u04FF]/.test(host);
    return latin && other;
  }

  function hasUserinfo(u) {
    return !!(u && (u.username || u.password));
  }

  function trackingKeys(u) {
    var out = [];
    if (!u) return out;
    u.searchParams.forEach(function (_v, k) {
      if (isTrackingKey(k)) out.push(k);
    });
    return out;
  }

  function stripTracking(href, base) {
    var u = parseUrl(href, base);
    if (!u) return { href: href, removed: [], ok: false };
    var removed = trackingKeys(u);
    removed.forEach(function (k) { u.searchParams.delete(k); });
    if (u.username || u.password) {
      u.username = '';
      u.password = '';
      removed.push('userinfo');
    }
    return { href: u.toString(), removed: removed, ok: true };
  }

  function classifyLink(href, text, pageUrl) {
    var u = parseUrl(href, pageUrl);
    if (!u) {
      return {
        kind: 'invalid', href: href, host: '', scheme: '',
        mismatch: false, tracking: [], puny: false, mixed: false, userinfo: false
      };
    }
    var scheme = u.protocol.replace(':', '');
    var host = bareHost(u.hostname);
    var page = parseUrl(pageUrl);
    var pageHost = page ? bareHost(page.hostname) : '';
    var textHost = hostish(text);
    var mismatch = !!(textHost && host && textHost !== host);
    var tracking = trackingKeys(u);
    var puny = host.indexOf('xn--') !== -1;
    var mixed = mixedScript(u.hostname);
    var userinfo = hasUserinfo(u);
    var kind = 'ok';
    if (ODD_SCHEMES[scheme]) kind = 'scheme';
    else if (userinfo) kind = 'userinfo';
    else if (puny || mixed) kind = 'punycode';
    else if (mismatch) kind = 'mismatch';
    else if (host && pageHost && host !== pageHost) kind = 'offsite';
    else if (tracking.length) kind = 'tracking';
    return {
      kind: kind,
      href: u.href,
      host: host,
      scheme: scheme,
      mismatch: mismatch,
      textHost: textHost || '',
      tracking: tracking,
      puny: puny,
      mixed: mixed,
      userinfo: userinfo
    };
  }

  function classifyForm(action, pageUrl, hiddenNames, hasPassword) {
    var page = parseUrl(pageUrl);
    var pageHost = page ? bareHost(page.hostname) : '';
    var resolved = action ? parseUrl(action, pageUrl) : page;
    var actionHost = resolved ? bareHost(resolved.hostname) : pageHost;
    var scheme = resolved ? resolved.protocol.replace(':', '') : 'https';
    var offsite = !!(actionHost && pageHost && actionHost !== pageHost);
    var userinfo = hasUserinfo(resolved);
    var odd = !!ODD_SCHEMES[scheme];
    return {
      action: resolved ? resolved.href : (action || pageUrl),
      actionHost: actionHost,
      offsite: offsite,
      hidden: hiddenNames || [],
      passwordOffsite: !!(hasPassword && offsite),
      userinfo: userinfo,
      scheme: scheme,
      odd: odd
    };
  }

  var api = {
    TRACKING_KEYS: TRACKING_KEYS,
    bareHost: bareHost,
    hostish: hostish,
    isTrackingKey: isTrackingKey,
    mixedScript: mixedScript,
    stripTracking: stripTracking,
    classifyLink: classifyLink,
    classifyForm: classifyForm
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.Looktwice = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);

# Looktwice

Click the icon. See where this page's links and forms actually go.

A link that says paypal.com and points somewhere else shows up. So does a
login form whose action is on another host, a javascript: href, and the usual
utm_ / fbclid tail on the current URL. Hidden field names are listed. Values
are not.

It only runs when you open the popup. The manifest has `activeTab` and
`scripting`, nothing else. No host list, no storage, no network of its own.

[![Ko-fi](https://img.shields.io/badge/Ko--fi-buy_me_a_coffee-FF5E5B?style=flat-square&logo=ko-fi&logoColor=white)](https://ko-fi.com/jju1s)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

**[cig13zs.github.io/looktwice](https://cig13zs.github.io/looktwice/)**

## Install

1. `git clone https://github.com/cig13zs/looktwice.git`
2. Chrome -> Extensions -> Load unpacked -> `src/`

Or run `node build.js` and load `dist/`.

## What it flags

- Link text that contains a hostname different from the href host
- javascript:, data:, blob: schemes
- Tracking keys on the current URL (utm_*, fbclid, gclid, and a short local list)
- Forms that post to another host, especially if they have a password field
- Hidden input *names* (not values)

Off-site links are counted. They are not dumped one by one. Most pages have dozens.

## Limits

The tracking list is short and ships in the repo. It is not ClearURLs. It does
not rewrite links in the page. It does not follow redirects. chrome:// and the
Web Store cannot be inspected.

## Privacy

Reads the tab you clicked it on. Does not send that data anywhere. See
[docs/privacy.md](docs/privacy.md).

## Build

```
node engine.test.js
node boot.test.js
node build.js
```

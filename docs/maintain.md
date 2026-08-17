# Maintain

- `src/engine.js` is the rules. Tests: `engine.test.js`.
- Popup injects `engine.js` then `content.js` into the active http(s) tab.
- Do not add host_permissions or always-on content scripts.
- `node engine.test.js && node boot.test.js` then ship-clean `--history`.
- Commit as `jju1s <123896289+cig13zs@users.noreply.github.com>`.
- Ko-fi: https://ko-fi.com/jju1s
- Do not commit CLAUDE.md or AGENTS.md.

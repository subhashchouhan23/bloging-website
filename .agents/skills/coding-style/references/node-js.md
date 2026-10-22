# Node.js (CommonJS) conventions

## Modules

```js
const fs = require('fs');
const path = require('path');
```

- `require` only, no `import`/`export` in `.js`/`.cjs`
- One module per file; no wrapper objects or barrel files
- Read configuration from `process.argv`, not a parser dependency

## Entry point

Scripts are executable top-to-bottom. Async work uses an IIFE with a catch:

```js
const fs = require('fs');

(async () => {
  const text = await fs.promises.readFile(process.argv[2], 'utf8');
  console.log('chars:', text.length);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
```

- Log progress with `console.log`, failures with `console.error('ERR', ...)`
- Exit non-zero on fatal errors; no silent `process.exit(0)`

## Functions

- `function` declarations for named helpers, arrows for callbacks
- Declare helpers near first use, above the caller when possible
- Keep functions under ~60 lines; split when a banner section grows
- Early returns over nested conditionals

## Errors

- `try/catch` for recoverable fallbacks; return a documented safe value
- Always log or rethrow; never swallow an error silently
- Include the operation in the message: `console.error('ERR', 'parse', e.message)`

## Comments

- Section banners in files over 60 lines:

  ```js
  // ---- collect objects ----
  ```

- Explain why, not what; no commented-out code
- Inline comments for non-obvious math, offsets, and format quirks

## Naming

- `lowerCamelCase` for variables, functions and constants
- `UPPER_SNAKE_CASE` only for true module-level constants
- Short names are fine when the scope is small (`buf`, `objs`, `cmap`)
- No `_` prefixes except throwaway scripts in the repo root

---
name: coding-style
description: Apply this repo's JavaScript and TypeScript conventions to scripts, React components, and utilities. Use when writing, reviewing, or refactoring JS/TS code, or when asked to match the project's style.
---

# Coding style

Match the author's style: dense, dependency-free, plain code with short names and
section banners. Applies to Node CommonJS scripts and React + TypeScript frontend code.

## When to use

- Writing new `.js`, `.cjs`, `.mjs`, `.ts`, `.tsx` files in this repo
- Reviewing or refactoring existing JS/TS
- Deciding formatting, naming, comments, module system, or error handling

## Workflow

1. Read the rule table and the matching reference (`references/node-js.md` or `references/react-ts.md`).
2. Write or edit the code.
3. Run the checker on the touched files and fix every error:

   ```bash
   node .agents/skills/coding-style/scripts/style-check.js path/to/file.js
   ```

4. Run the test suite once per change set:

   ```bash
   node --test .agents/skills/coding-style/test/
   ```

5. Only report done when the checker exits 0 and tests pass. Warnings may remain
   unless the task asks for `--strict`.

## Rules

Errors block completion:

| ID | Rule |
|----|------|
| S001 | No tab indentation; use 2 spaces per level |
| S002 | Single quotes; double quotes only if the string contains `'` and no `"`; use template literals for interpolation |
| S003 | Statements end with `;` (best-effort heuristic) |
| S004 | No trailing whitespace |
| S005 | File ends with exactly one newline |
| S007 | No `var`; use `const`, `let` only when reassigned |
| S008 | Declarations are lowerCamelCase or UPPER_SNAKE_CASE, never snake_case |
| S009 | No `console.*` in `src/`; CLI scripts may log progress |
| S010 | Never mix `require` with `import`/`export` in one file |
| S011 | No `any` in TypeScript; use `unknown` and narrow |
| S012 | No class components; functional components and hooks only |
| S013 | `.jsx`/`.tsx` component files are PascalCase |

Warnings (promoted to errors by `--strict`):

| ID | Rule |
|----|------|
| S006 | Lines at most 140 characters |
| S014 | Files over 60 lines use `// ---- section ----` banners |
| S015 | Files at most 400 lines |
| S016 | No commented-out code |

## Style in one screen

```js
const fs = require('fs');

// ---- load input ----
const file = process.argv[2];
const buf = fs.readFileSync(file);

// ---- process ----
function decode(buf) {
  return buf.toString('utf8').trim();
}

console.log('chars:', decode(buf).length);
```

- CommonJS for Node scripts (`require`), ESM only in frontend files
- Arrow functions for callbacks, `function` declarations for named helpers
- Short lowercase identifiers (`buf`, `objs`, `cmap`), no classes for scripts
- Comments explain why or mark sections; no commented-out code
- Async entry points end with `.catch` that logs `ERR ...` and exits non-zero
- Return a safe fallback or rethrow in `catch`; never swallow silently

## Commands

```bash
# check specific files or directories
node scripts/style-check.js src scripts

# machine-readable output
node scripts/style-check.js src --json

# treat warnings as failures
node scripts/style-check.js src --strict

# run the suite
node --test test/
```

## Review checklist

See `references/review-checklist.md` for the short list to run before handing code back:
module system per file, quotes/semicolons, no `var`/`any`/class components,
console only in scripts, banners on long files, and passing checker + tests.

## Files

- `references/node-js.md` — Node script conventions
- `references/react-ts.md` — React/TS conventions
- `references/review-checklist.md` — pre-handoff checklist
- `references/examples/` — passing examples for both targets
- `scripts/style-check.js` — the checker
- `test/style-check.test.js` — cases from `tfp/coding-style/test-cases.md`
- `tfp/coding-style/requirements.md` — approved requirements
- `tfp/coding-style/test-cases.md` — approved test cases

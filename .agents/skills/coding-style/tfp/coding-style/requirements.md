# Requirements — `coding-style` skill

Status: approved
Branch: `feature/coding-style-skill`
Owner: repo author
Date: 2026-10-22

## 1. Purpose

Encode the author's JavaScript/TypeScript conventions as a reusable skill so that new
code is written in the same style as the existing scripts (`_extract.js`,
`_pdf2txt.js`) and frontend work, and violations are detected mechanically.

## 2. Scope

In scope:

- Node.js CommonJS scripts (`require`, `process.argv`, CLI entry points)
- Browser/frontend code: React + TypeScript (`.ts`, `.tsx`), functional components
- A dependency-free checker, fixtures, and a `node:test` suite

Out of scope:

- Auto-formatting/rewriting code (no prettier/eslint dependency)
- Grading free-form LLM output
- Non-JS assets (CSS/HTML/Markdown) except doc integrity checks
- Replacing a real parser; `S003` and `S016` are documented heuristics

## 3. Functional requirements

| ID | Requirement |
|----|-------------|
| FR-1 | Checker runs as `node scripts/style-check.js <paths...> [--json] [--strict]`; zero external dependencies; offline |
| FR-2 | Errors exit `1`; warnings-only exit `0`; `--strict` makes warnings exit `1` |
| FR-3 | Every finding carries a stable rule ID, file, line, column, severity and message |
| FR-4 | `SKILL.md` instructs: write code → run checker → fix errors → run `node --test test/` |
| FR-5 | Golden passing examples for Node and React/TS; each rule has a failing fixture |
| FR-6 | The checker passes its own rules (dogfooding, S001–S013) |
| FR-7 | Tests use Node's built-in runner only (`node --test test/`); no install step |
| FR-8 | Requirements and test cases are committed under `tfp/coding-style/` on the feature branch |
| FR-9 | Directory walks skip `node_modules`, `.git`, `dist`, `build`, `coverage`, `.next`, `out` and `test/fixtures` |
| FR-10 | Paths containing spaces must work (this repo lives in `D:\bloging website`) |

## 4. Non-functional requirements

| ID | Requirement |
|----|-------------|
| NFR-1 | Runs on Node >= 20 on Windows, Linux and macOS |
| NFR-2 | One pass over a few hundred files completes in under 2 seconds |
| NFR-3 | No network access, no writes outside stdout/stderr |
| NFR-4 | Deterministic output: stable ordering by file, then line, then rule |
| NFR-5 | Checker source follows the same style it enforces (single quotes, semicolons, 2-space indent, no `var`) |
| NFR-6 | Each rule maps to exactly one fixture and at least one test case |

## 5. Rule catalog

Errors (block merge/commit):

| ID | Rule |
|----|------|
| S001 | No tab indentation |
| S002 | Single quotes; double quotes only when the string contains `'` and no `"`; template literals when interpolating |
| S003 | Statements end with `;` (best-effort line heuristic) |
| S004 | No trailing whitespace |
| S005 | File ends with exactly one newline |
| S007 | No `var` |
| S008 | Declarations use lowerCamelCase or UPPER_SNAKE_CASE, never snake_case |
| S009 | No `console.*` in `src/`; allowed in CLI scripts |
| S010 | Never mix `require` and `import`/`export` in one file |
| S011 | No `any` in TypeScript |
| S012 | No class components |
| S013 | `.jsx`/`.tsx` component files must be PascalCase |

Warnings (`--strict` promotes them):

| ID | Rule |
|----|------|
| S006 | Line length <= 140 |
| S014 | Files over 60 lines use `// ---- section ----` banners |
| S015 | Files <= 400 lines |
| S016 | No commented-out code (conservative heuristic) |

## 6. Acceptance criteria

1. `node --test test/` passes all cases in `test-cases.md`.
2. `node scripts/style-check.js .` reports no errors.
3. `node scripts/style-check.js references/examples` reports no findings.
4. `SKILL.md` references every rule ID and documents the workflow and commands.
5. Branch `feature/coding-style-skill` contains the skill plus these docs.

## 7. Design decisions

- **Self-contained checker:** a small tokenizer masks strings/comments so regex
  rules do not fire on text or comments, without adding a parser dependency.
- **Heuristic rules are explicit:** S003 and S016 are conservative and documented
  as such; their fixtures cover unambiguous cases.
- **Warnings vs errors:** subjective/size rules warn so they do not block small
  scripts, while correctness-of-style rules error.
- **Fixtures are excluded from normal scans** so `style-check .` stays green while
  the bad fixtures still exist for tests.

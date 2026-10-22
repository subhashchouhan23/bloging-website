# Test cases — `coding-style` skill

Status: approved
Runner: `node --test test/` (Node >= 20, no dependencies)
Checker: `node scripts/style-check.js <paths...> [--json] [--strict]`

## A. Checker behavior

| ID | Case | Steps | Expected |
|----|------|-------|----------|
| TC-01 | Clean Node fixture | check `fixtures/good/node-script.js` | exit 0, zero findings |
| TC-02 | Clean React fixture | check `fixtures/good/Component.tsx` | exit 0, zero findings |
| TC-03 | Tab indentation | check `bad/s001-tabs.js` | finding `S001` on the indented line |
| TC-04 | Double quotes | check `bad/s002-double-quotes.js` | finding `S002`; allowed double-quoted string with apostrophe is not flagged |
| TC-05 | Missing semicolon | check `bad/s003-missing-semicolon.js` | finding `S003` on the unterminated statement |
| TC-06 | Trailing whitespace | check `bad/s004-trailing-space.js` | finding `S004` |
| TC-07 | Missing final newline | check `bad/s005-no-eof-newline.js` | finding `S005` |
| TC-08 | Long line | check `bad/s006-long-line.js` | warning `S006` only, exit 0 |
| TC-09 | `var` usage | check `bad/s007-var.js` | error `S007` |
| TC-10 | snake_case declaration | check `bad/s008-snake-case.js` | error `S008` |
| TC-11 | `console` in frontend | check `bad/src/s009-console.tsx` | error `S009` |
| TC-12 | Mixed module systems | check `bad/s010-mixed-modules.js` | error `S010` |
| TC-13 | `any` in TypeScript | check `bad/s011-any.ts` | error `S011` |
| TC-14 | Class component | check `bad/s012-class-component.tsx` | error `S012` |
| TC-15 | Bad component filename | check `bad/s013-badname.tsx` | error `S013` |
| TC-16 | Missing section banners | check `bad/s014-long-no-banner.js` | warning `S014`, exit 0 |
| TC-17 | Oversized file | check `bad/s015-too-long.js` | warning `S015` |
| TC-18 | Commented-out code | check `bad/s016-commented-code.js` | warning `S016` |
| TC-19 | JSON output | check a bad fixture with `--json` | valid JSON array; each item has `file`, `line`, `column`, `rule`, `severity`, `message` |
| TC-20 | Exit code matrix | errors / warnings-only / warnings-only `--strict` | `1` / `0` / `1` |
| TC-21 | Ignored directories | temp project with `node_modules/x.js` and `dist/y.js` containing `var` | no findings for those paths |
| TC-22 | Path with spaces | check the repo's `.agents` path (contains a space) | exit 0 or findings, but command succeeds (no ENOENT) |
| TC-34 | Hardcoded Firebase config | check `bad/s017-hardcoded-config.ts` | error `S017` |
| TC-35 | Second `initializeApp` | check `bad/s018-second-init.ts` | error `S018` |
| TC-36 | Admin SDK in client | check `bad/s019-admin-import.ts` | error `S019` |
| TC-37 | SDK imported in component | check `bad/src/sdk-in-component.ts` | error `S020` |
| TC-38 | Banned library | check `bad/s021-banned-lib.ts` | error `S021` |

## B. Skill integrity

| ID | Case | Expected |
|----|------|----------|
| TC-23 | `SKILL.md` exists | has `name` and `description` frontmatter |
| TC-24 | Rule coverage in docs | `SKILL.md` mentions `S001`–`S016` |
| TC-25 | Requirements present | `tfp/coding-style/requirements.md` exists and is non-empty |
| TC-26 | Test cases present | `tfp/coding-style/test-cases.md` exists and is non-empty |
| TC-27 | Dependency-free checker | only `require`s of Node built-ins in `scripts/style-check.js` |
| TC-28 | Dogfooding | `scripts/style-check.js` passes S001–S013 against itself |
| TC-29 | Fixture coverage | every rule `S001`–`S016` has a fixture referenced by the test table |
| TC-30 | Good examples clean | `references/examples/` yields zero findings |
| TC-39 | Clean Vite + Firebase project | check `fixtures/good-app` | exit 0, zero findings |
| TC-40 | Entry file exemption | check `good-app/src/main.tsx`, then `bad/s013-badname.tsx` | main passes; bad file gets `S013` |
| TC-41 | Firebase docs | `references/firebase.md` exists; `SKILL.md` mentions `S017`–`S021` | present |
| TC-42 | Auth documented | `references/firebase.md` documents Google auth and `signInWithPopup` | present |

## C. Manual acceptance

| ID | Case | Expected |
|----|------|----------|
| TC-31 | Read `SKILL.md` as an agent | workflow is actionable without extra context |
| TC-32 | Apply skill to a new small script | code passes checker on first or second iteration |
| TC-33 | User review | approved in session (recorded) |
| TC-43 | Google signup page | `#/signup` renders card, Google button, terms and back link; no console errors |
| TC-44 | Auth failure path | missing env or popup failure shows a readable message, app does not crash |

## Definition of done

- All of section A and B pass in one run: `node --test test/`.
- `node scripts/style-check.js .` exits 0 with no errors.
- Changes committed on `feature/coding-style-skill`.

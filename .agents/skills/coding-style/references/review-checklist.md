// ---- review checklist ----

Run these before handing code back:

1. Module system: `require` in Node scripts, `import`/`export` in frontend; never both.
2. Formatting: 2-space indent, single quotes, semicolons, no trailing whitespace, one final newline.
3. Declarations: `const` by default, `let` only when reassigned, never `var`.
4. Naming: lowerCamelCase or UPPER_SNAKE_CASE; component files PascalCase; hooks `use*`.
5. Types: no `any`; unknown input is `unknown` with a guard.
6. React: functional components, no classes, props interfaces named `XxxProps`.
7. Logging: `console.*` only in CLI scripts, never in `src/`.
8. Structure: section banners `// ---- name ----` on files over 60 lines; no commented-out code.
9. Errors: catch must log, rethrow, or return a documented fallback.
10. Verify: checker exits 0 on touched files and `node --test test/` is green.

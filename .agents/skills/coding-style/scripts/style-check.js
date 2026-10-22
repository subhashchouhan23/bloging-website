const fs = require('fs');
const path = require('path');

const { scan, codeView, importsOf, normalize, isSrc, isSrcLib } = require('./tokenize');

// ---- rule catalog ----
const RULES = {
  S001: { severity: 'error', message: 'no tab indentation; use 2 spaces per level' },
  S002: { severity: 'error', message: 'use single quotes; template literals for interpolation' },
  S003: { severity: 'error', message: "missing ';' at end of statement" },
  S004: { severity: 'error', message: 'trailing whitespace' },
  S005: { severity: 'error', message: 'file must end with exactly one newline' },
  S006: { severity: 'warn', message: 'line is longer than 140 characters' },
  S007: { severity: 'error', message: "no 'var'; use const or let" },
  S008: { severity: 'error', message: 'declarations use lowerCamelCase or UPPER_SNAKE_CASE, not snake_case' },
  S009: { severity: 'error', message: 'no console.* outside CLI scripts' },
  S010: { severity: 'error', message: 'do not mix require() with import/export in one file' },
  S011: { severity: 'error', message: "no 'any' in TypeScript" },
  S012: { severity: 'error', message: 'no class components; use functions and hooks' },
  S013: { severity: 'error', message: 'component files must be PascalCase' },
  S014: { severity: 'warn', message: 'files over 60 lines need // ---- section ---- banners' },
  S015: { severity: 'warn', message: 'file is longer than 400 lines' },
  S016: { severity: 'warn', message: 'commented-out code' },
  S017: { severity: 'error', message: 'no hardcoded Firebase config; use import.meta.env.VITE_*' },
  S018: { severity: 'error', message: 'initializeApp only in src/lib/firebase.ts' },
  S019: { severity: 'error', message: 'never import firebase-admin in client code' },
  S020: { severity: 'error', message: 'firebase/* SDK imports only under src/lib/' },
  S021: { severity: 'error', message: 'this stack is React + Firebase only' },
};

const CODE_EXT = new Set(['.js', '.cjs', '.mjs', '.jsx', '.ts', '.tsx']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.next', 'out']);
const MAX_LINE = 140;
const MAX_LINES = 400;
const BANNER_MIN = 60;
const CONFIG_KEYS = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId', 'measurementId'];
const BANNED_MODULES = ['next', 'axios', 'express', 'mongoose', 'prisma', '@prisma/client', 'pg', 'mysql2', 'knex', 'swr'];
const BANNED_PREFIXES = ['@supabase/', 'react-router', '@tanstack/react-query'];
function isJsx(file) {
  return file.endsWith('.jsx') || file.endsWith('.tsx');
}

function isFrontend(file) {
  return /(^|[\\/])src[\\/]/.test(file) && CODE_EXT.has(path.extname(file));
}

// ---- rules ----
function checkFile(file, text) {
  const findings = [];
  const lines = text.split('\n');
  const scanResult = scan(text);
  const maskedText = scanResult.masked;
  const masked = maskedText.split('\n');
  const view = codeView(scanResult.masked, scanResult).split('\n');
  const trimmed = lines.map(l => l.replace(/\r$/, ''));

  function add(rule, line, col, extra) {
    const meta = RULES[rule];
    findings.push({
      file,
      line,
      column: col || 1,
      rule,
      severity: meta.severity,
      message: extra ? meta.message + ': ' + extra : meta.message,
    });
  }

  // S001 tabs
  trimmed.forEach((l, idx) => {
    const lead = l.match(/^[ \t]*/)[0];
    if (lead.indexOf('\t') !== -1) add('S001', idx + 1, lead.indexOf('\t') + 1);
  });

  // S002 quotes
  for (const s of scanResult.strings) {
    if (s.quote !== '"') continue;
    if (s.value === 'use strict' || s.value === 'use asm') continue;
    const before = maskedText.slice(Math.max(0, s.start - 40), s.start).trimEnd().slice(-1);
    if (isJsx(file) && before === '=') continue;
    if (s.value.indexOf("'") !== -1 && s.value.indexOf('"') === -1) continue;
    add('S002', s.line, s.col);
  }

  // S003 semicolons (best effort)
  for (let idx = 0; idx < view.length; idx++) {
    const raw = view[idx].trim();
    if (!raw || isContinuation(raw)) continue;
    if (/[;{}]$/.test(raw)) continue;
    if (!/[)\]§\w$]$/.test(raw)) continue;
    if (/^[)\]]+$/.test(raw)) continue;
    if (/^(if|for|while|switch|catch|with)\b/.test(raw) && /\)$/.test(raw)) continue;
    if (/^(else|do|try|finally|case|default)\b/.test(raw)) continue;
    if (/^(return|throw|break|continue)$/.test(raw)) continue;
    if (/^(async\s+)?function\b/.test(raw) && /\)$/.test(raw)) continue;
    if (/^[\w$'"§[\]]+\s*:/.test(raw)) continue;
    const next = nextCodeLine(view, idx);
    if (next && /^[({[.,:?+\-*/%&|^=)\]}]/.test(next)) continue;
    add('S003', idx + 1, raw.length);
  }

  // S004 trailing whitespace
  trimmed.forEach((l, idx) => {
    if (/[ \t]+$/.test(l)) add('S004', idx + 1, l.length);
  });

  // S005 final newline
  if (!/\n$/.test(text)) add('S005', lines.length, 1, 'no final newline');
  else if (/\n[ \t]*\n$/.test(text)) add('S005', lines.length, 1, 'extra blank line at end');

  // S006 long lines
  trimmed.forEach((l, idx) => {
    if (l.length > MAX_LINE) add('S006', idx + 1, MAX_LINE + 1);
  });

  // S007 var
  masked.forEach((l, idx) => {
    if (/(^|[^\w$.])var\s+[A-Za-z_$]/.test(l)) add('S007', idx + 1, l.indexOf('var') + 1);
  });

  // S008 snake_case declarations
  masked.forEach((l, idx) => {
    const re = /\b(?:const|let|function|class)\s+([A-Za-z_$][\w$]*)/g;
    let m;
    while ((m = re.exec(l)) !== null) {
      if (m[1].indexOf('_') !== -1 && !/^[A-Z0-9_]+$/.test(m[1])) {
        add('S008', idx + 1, m.index + 1, m[1]);
      }
    }
  });

  // S009 console outside scripts
  if (isFrontend(file)) {
    masked.forEach((l, idx) => {
      if (/console\.(log|warn|error|info|debug)\s*\(/.test(l)) add('S009', idx + 1, l.indexOf('console') + 1);
    });
  }

  // S010 mixed module systems
  const usesRequire = /\brequire\s*\(/.test(scanResult.masked);
  const usesEsm = /^\s*(import|export)\b/m.test(scanResult.masked);
  const ext = path.extname(file);
  if (usesRequire && usesEsm) add('S010', 1, 1, 'require + import/export');
  else if (ext === '.mjs' && usesRequire) add('S010', 1, 1, 'require() in .mjs');
  else if ((ext === '.ts' || ext === '.tsx') && usesRequire) add('S010', 1, 1, 'require() in TypeScript');

  // S011 any
  if (ext === '.ts' || ext === '.tsx') {
    masked.forEach((l, idx) => {
      if (/:\s*any\b|\bas\s+any\b|<any>|\bany\[\]|Array<any>/.test(l)) add('S011', idx + 1, l.indexOf('any') + 1);
    });
  }

  // S012 class components
  if (isJsx(file)) {
    masked.forEach((l, idx) => {
      if (/\bextends\s+(React\.)?(Pure)?Component\b|React\.Component\b/.test(l)) add('S012', idx + 1, l.indexOf('extends') + 1);
    });
  }

  // S013 component filenames
  if (isJsx(file)) {
    const base = path.basename(file, ext);
    if (!/^[A-Z][A-Za-z0-9]*$/.test(base) && base !== 'main') add('S013', 1, 1, base);
  }

  // S014 section banners
  if (trimmed.length > BANNER_MIN && !/^\/\/\s*----/m.test(text)) add('S014', 1, 1);

  // S015 file length
  if (trimmed.length > MAX_LINES) add('S015', 1, 1, String(trimmed.length) + ' lines');

  // S016 commented-out code
  for (const c of scanResult.comments) {
    const body = c.value.trim();
    if (/^(const|let|var|function|class|import|export|return|if|for|while)\b/.test(body) && /[=({]/.test(body)) {
      add('S016', c.line, c.col);
    }
  }

  // S017 hardcoded firebase config
  for (const s of scanResult.strings) {
    const before = maskedText.slice(Math.max(0, s.start - 60), s.start);
    for (const key of CONFIG_KEYS) {
      if (new RegExp(key + '\\s*:\\s*$').test(before)) add('S017', s.line, s.col, key);
    }
  }

  // S018 single initializeApp in client code
  if (isSrc(file) && !/(^|\/)src\/lib\/firebase\.ts$/.test(normalize(file))) {
    masked.forEach((l, idx) => {
      if (/\binitializeApp\s*\(/.test(l)) add('S018', idx + 1, l.indexOf('initializeApp') + 1);
    });
  }

  // S019-S021 module allowlist
  for (const imp of importsOf(scanResult)) {
    const spec = imp.spec;
    if (spec === 'firebase-admin' || spec.indexOf('firebase-admin/') === 0) add('S019', imp.line, imp.col);
    if (spec.indexOf('firebase/') === 0 && isSrc(file) && !isSrcLib(file)) add('S020', imp.line, imp.col, spec);
    if (BANNED_MODULES.indexOf(spec) !== -1 || BANNED_PREFIXES.some(p => spec.indexOf(p) === 0)) add('S021', imp.line, imp.col, spec);
  }

  return findings;
}

function isContinuation(raw) {
  if (/^(\/\/|\*)/.test(raw)) return true;
  if (/^[)\]}.,:?+\-*/%&|^=]/.test(raw)) return true;
  return false;
}

function nextCodeLine(view, idx) {
  for (let i = idx + 1; i < view.length; i++) {
    const t = view[i].trim();
    if (t) return t;
  }
  return '';
}

// ---- file walking ----
function walk(target, out) {
  let st;
  try {
    st = fs.statSync(target);
  } catch (e) {
    console.error('ERR', 'cannot read', target, e.message);
    process.exit(1);
  }
  if (st.isFile()) {
    if (CODE_EXT.has(path.extname(target))) out.push(target);
    return out;
  }
  const entries = fs.readdirSync(target, { withFileTypes: true });
  for (const ent of entries) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const full = path.join(target, ent.name);
    if (ent.isDirectory()) {
      if (/[\\/]test[\\/]fixtures([\\/]|$)/.test(full)) continue;
      walk(full, out);
    } else if (CODE_EXT.has(path.extname(ent.name))) {
      out.push(full);
    }
  }
  return out;
}

function main() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter(a => a.startsWith('--')));
  const targets = args.filter(a => !a.startsWith('--'));
  if (!targets.length) targets.push('.');
  if (flags.has('--help')) {
    console.log('usage: node style-check.js <paths...> [--json] [--strict]');
    return;
  }

  const files = [];
  for (const t of targets) walk(t, files);
  files.sort();

  const findings = [];
  for (const f of files) findings.push(...checkFile(f, fs.readFileSync(f, 'utf8')));
  findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.rule.localeCompare(b.rule));

  const errors = findings.filter(x => x.severity === 'error').length;
  const warnings = findings.length - errors;
  const strict = flags.has('--strict');

  if (flags.has('--json')) {
    console.log(JSON.stringify(findings, null, 2));
  } else {
    for (const f of findings) {
      console.log(f.file + ':' + f.line + ':' + f.column + ' ' + f.rule + ' ' + f.severity + ' ' + f.message);
    }
    console.log(files.length + ' files, ' + errors + ' errors, ' + warnings + ' warnings');
  }

  process.exit(errors > 0 || (strict && warnings > 0) ? 1 : 0);
}

main();

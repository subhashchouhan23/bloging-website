const test = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { builtinModules } = require('node:module');

const root = path.resolve(__dirname, '..');
const checker = path.join(root, 'scripts', 'style-check.js');
const fixtures = path.join(__dirname, 'fixtures');

// ---- helpers ----
function run(args) {
  return spawnSync(process.execPath, [checker, ...args], { encoding: 'utf8' });
}

function findingsOf(file) {
  const res = run([file, '--json']);
  return JSON.parse(res.stdout);
}

function tempProject(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'style-check-'));
  for (const name of Object.keys(files)) {
    const full = path.join(dir, name);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, files[name]);
  }
  return dir;
}

const RULES = [
  'S001', 'S002', 'S003', 'S004', 'S005', 'S006', 'S007', 'S008',
  'S009', 'S010', 'S011', 'S012', 'S013', 'S014', 'S015', 'S016',
];
const RULE_FIXTURES = {
  S001: 'bad/s001-tabs.js',
  S002: 'bad/s002-double-quotes.js',
  S003: 'bad/s003-missing-semicolon.js',
  S004: 'bad/s004-trailing-space.js',
  S005: 'bad/s005-no-eof-newline.js',
  S006: 'bad/s006-long-line.js',
  S007: 'bad/s007-var.js',
  S008: 'bad/s008-snake-case.js',
  S009: 'bad/src/Console.tsx',
  S010: 'bad/s010-mixed-modules.js',
  S011: 'bad/s011-any.ts',
  S012: 'bad/ClassComponent.tsx',
  S013: 'bad/s013-badname.tsx',
  S014: 'bad/s014-long-no-banner.js',
  S015: 'bad/s015-too-long.js',
  S016: 'bad/s016-commented-code.js',
};

// ---- section A: checker behavior ----
test('TC-01 clean node fixture passes', () => {
  const res = run([path.join(fixtures, 'good/node-script.js')]);
  assert.strictEqual(res.status, 0, res.stdout + res.stderr);
  assert.deepStrictEqual(findingsOf(path.join(fixtures, 'good/node-script.js')), []);
});

test('TC-02 clean react fixture passes', () => {
  const res = run([path.join(fixtures, 'good/Component.tsx')]);
  assert.strictEqual(res.status, 0, res.stdout + res.stderr);
  assert.deepStrictEqual(findingsOf(path.join(fixtures, 'good/Component.tsx')), []);
});

for (const rule of RULES) {
  test('TC rule ' + rule + ' is reported', () => {
    const file = path.join(fixtures, RULE_FIXTURES[rule]);
    const found = findingsOf(file);
    assert.ok(found.some(f => f.rule === rule), rule + ' missing from ' + JSON.stringify(found, null, 2));
  });
}

test('TC-04 double quote with apostrophe is allowed', () => {
  const dir = tempProject({ 'quotes.js': 'const quote = "it\'s fine";\nconst bad = "plain";\n' });
  try {
    const found = findingsOf(path.join(dir, 'quotes.js'));
    const hits = found.filter(f => f.rule === 'S002');
    assert.strictEqual(hits.length, 1, JSON.stringify(found, null, 2));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('TC-19 json output shape', () => {
  const found = findingsOf(path.join(fixtures, 'bad/s007-var.js'));
  assert.ok(Array.isArray(found));
  assert.ok(found.length > 0);
  for (const key of ['file', 'line', 'column', 'rule', 'severity', 'message']) {
    assert.ok(Object.prototype.hasOwnProperty.call(found[0], key), 'missing ' + key);
  }
  assert.strictEqual(found[0].severity, 'error');
});

test('TC-20 exit code matrix', () => {
  const warnOnly = path.join(fixtures, 'bad/s006-long-line.js');
  assert.strictEqual(run([warnOnly]).status, 0);
  assert.strictEqual(run([warnOnly, '--strict']).status, 1);
  assert.strictEqual(run([path.join(fixtures, 'bad/s007-var.js')]).status, 1);
});

test('TC-21 ignored directories are skipped', () => {
  const dir = tempProject({
    'node_modules/pkg/index.js': 'var a = 1;\n',
    'dist/bundle.js': 'var b = 2;\n',
    'src/ok.js': 'const ok = 1;\n',
  });
  try {
    const res = run([dir]);
    const found = findingsOf(dir);
    assert.strictEqual(res.status, 0);
    assert.deepStrictEqual(found, []);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('TC-22 path with spaces works', () => {
  const res = run([path.join(fixtures, 'good')]);
  assert.strictEqual(res.status, 0, res.stdout + res.stderr);
});

// ---- section B: skill integrity ----
test('TC-23 SKILL.md has frontmatter', () => {
  const text = fs.readFileSync(path.join(root, 'SKILL.md'), 'utf8');
  assert.match(text, /^---\nname: coding-style\ndescription: .+\n---/);
});

test('TC-24 every rule is documented', () => {
  const text = fs.readFileSync(path.join(root, 'SKILL.md'), 'utf8');
  for (const rule of RULES) assert.ok(text.indexOf(rule) !== -1, 'missing ' + rule);
});

test('TC-25 requirements exist', () => {
  const file = path.join(root, 'tfp', 'coding-style', 'requirements.md');
  assert.ok(fs.statSync(file).size > 0);
});

test('TC-26 test cases exist', () => {
  const file = path.join(root, 'tfp', 'coding-style', 'test-cases.md');
  assert.ok(fs.statSync(file).size > 0);
});

test('TC-27 checker uses only built-ins', () => {
  const src = fs.readFileSync(checker, 'utf8');
  const re = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const spec = m[1];
    const bare = spec.startsWith('node:') ? spec.slice(5) : spec;
    assert.ok(spec.startsWith('node:') || builtinModules.indexOf(bare) !== -1 || spec.startsWith('.'), 'external dependency: ' + spec);
  }
});

test('TC-28 checker passes its own rules', () => {
  const found = findingsOf(checker).filter(f => f.severity === 'error');
  assert.deepStrictEqual(found, []);
});

test('TC-29 every rule has a fixture', () => {
  assert.deepStrictEqual(Object.keys(RULE_FIXTURES).sort(), RULES.slice().sort());
  for (const rule of RULES) {
    assert.ok(fs.statSync(path.join(fixtures, RULE_FIXTURES[rule])).size > 0, rule);
  }
});

test('TC-30 reference examples are clean', () => {
  const res = run([path.join(root, 'references', 'examples')]);
  assert.strictEqual(res.status, 0, res.stdout + res.stderr);
  assert.deepStrictEqual(findingsOf(path.join(root, 'references', 'examples')), []);
});

const REGEX_PREV = new Set(['', '(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '\n', '<']);

// ---- text scanner: mask strings/comments, keep positions ----
function scan(text) {
  const masked = text.split('');
  const strings = [];
  const comments = [];
  let i = 0;
  let lineNo = 1;
  let lineStart = 0;
  let prev = '';

  function advanceTo(end) {
    for (let k = i; k < end; k++) {
      if (text[k] === '\n') { lineNo++; lineStart = k + 1; }
    }
    i = end;
  }

  function blank(from, to) {
    for (let k = from; k < to; k++) {
      if (text[k] !== '\n' && text[k] !== '\r') masked[k] = ' ';
    }
  }

  function pushString(start, close, quote) {
    const col = start - lineStart + 1;
    const end = close < text.length ? close + 1 : close;
    strings.push({ quote, line: lineNo, col, start, value: text.slice(start + 1, close) });
    blank(start, end);
    advanceTo(end);
    prev = '§';
  }

  while (i < text.length) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '\n' || ch === '\r') {
      i++;
      if (ch === '\n') { lineNo++; lineStart = i; }
      prev = '\n';
      continue;
    }

    if (ch === '/' && next === '/') {
      const end = text.indexOf('\n', i);
      const stop = end === -1 ? text.length : end;
      comments.push({ line: lineNo, col: i - lineStart + 1, value: text.slice(i + 2, stop) });
      blank(i, stop);
      advanceTo(stop);
      continue;
    }

    if (ch === '/' && next === '*') {
      const end = text.indexOf('*/', i + 2);
      const stop = end === -1 ? text.length : end + 2;
      comments.push({ line: lineNo, col: i - lineStart + 1, value: text.slice(i + 2, end === -1 ? text.length : end) });
      blank(i, stop);
      advanceTo(stop);
      continue;
    }

    if (ch === "'" || ch === '"' || ch === '`') {
      const close = findQuoteEnd(text, i);
      pushString(i, close, ch);
      continue;
    }

    if (ch === '/' && REGEX_PREV.has(prev)) {
      const end = findRegexEnd(text, i);
      if (end > 0) {
        blank(i, end);
        advanceTo(end);
        prev = '§';
        continue;
      }
    }

    prev = ch;
    i++;
  }

  return { masked: masked.join(''), strings, comments };
}

function findQuoteEnd(text, start) {
  const quote = text[start];
  let i = start + 1;
  while (i < text.length) {
    if (text[i] === '\\') { i += 2; continue; }
    if (text[i] === quote) return i;
    i++;
  }
  return text.length;
}

function findRegexEnd(text, start) {
  let i = start + 1;
  let inClass = false;
  while (i < text.length && text[i] !== '\n') {
    if (text[i] === '\\') { i += 2; continue; }
    if (text[i] === '[') inClass = true;
    else if (text[i] === ']') inClass = false;
    else if (text[i] === '/' && !inClass) {
      i++;
      while (i < text.length && /[a-z]/i.test(text[i])) i++;
      return i;
    }
    i++;
  }
  return -1;
}

function codeView(text, tokens) {
  const chars = text.split('');
  for (const s of tokens.strings) chars[s.start] = '§';
  return chars.join('');
}

function importsOf(scanResult) {
  const list = [];
  for (const s of scanResult.strings) {
    const before = scanResult.masked.slice(Math.max(0, s.start - 40), s.start);
    if (/\bfrom\s*$/.test(before) || /\brequire\s*\(\s*$/.test(before) || /\bimport\s*\(\s*$/.test(before)) {
      list.push({ spec: s.value, line: s.line, col: s.col });
    }
  }
  return list;
}

function normalize(file) {
  return file.replace(/\\/g, '/');
}

function isSrc(file) {
  return /(^|\/)src\//.test(normalize(file));
}

function isSrcLib(file) {
  return /(^|\/)src\/lib\//.test(normalize(file));
}

module.exports = { scan, codeView, importsOf, normalize, isSrc, isSrcLib };

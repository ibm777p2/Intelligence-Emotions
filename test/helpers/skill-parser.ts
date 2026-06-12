/**
 * Test helpers: discover skills, parse frontmatter, and scan for the two
 * language classes that must never appear bare in generated output —
 * Judge-voice and leftover developer-product vocabulary.
 */

import * as fs from 'fs';
import * as path from 'path';

export const ROOT = path.resolve(import.meta.dir, '..', '..');

/** All generated SKILL.md files (root + one level deep), as { skill, mdPath, tmplPath }. */
export function discoverSkills(): Array<{ skill: string; mdPath: string; tmplPath: string }> {
  const out: Array<{ skill: string; mdPath: string; tmplPath: string }> = [];
  const rootTmpl = path.join(ROOT, 'SKILL.md.tmpl');
  if (fs.existsSync(rootTmpl)) {
    out.push({ skill: 'pq', mdPath: path.join(ROOT, 'SKILL.md'), tmplPath: rootTmpl });
  }
  for (const d of fs.readdirSync(ROOT, { withFileTypes: true })) {
    if (!d.isDirectory() || d.name.startsWith('.') || ['node_modules', 'test', 'scripts', 'lib', 'bin'].includes(d.name)) continue;
    const tmpl = path.join(ROOT, d.name, 'SKILL.md.tmpl');
    if (fs.existsSync(tmpl)) {
      out.push({ skill: d.name, mdPath: path.join(ROOT, d.name, 'SKILL.md'), tmplPath: tmpl });
    }
  }
  return out;
}

export function frontmatter(content: string): Record<string, string> {
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  const fm: Record<string, string> = {};
  if (!m) return fm;
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].trim();
  }
  return fm;
}

/**
 * Judge-voice phrases that must NEVER appear as bare coach prose in generated
 * output. They MAY appear inside quotation marks or backticks — as quoted
 * evidence, negative examples, or banned-phrase lists (the anti-Judge rule
 * itself quotes them). Bare = the coach actually saying it.
 */
export const JUDGE_VOICE_PHRASES = [
  'you failed to',
  'you should have',
  'you only managed',
  "you didn't even",
  'you keep failing',
  'disappointing effort',
  'no excuses',
  'you broke your streak',
  'you lost your streak',
];

const QUOTE_CHARS = ['"', "'", '‘', '’', '“', '”', '`'];

/** True if the phrase occurrence at `idx` on `line` sits inside quotes/backticks. */
function isQuotedAt(line: string, idx: number, phraseLen: number): boolean {
  const before = line.slice(0, idx);
  const after = line.slice(idx + phraseLen);
  const opens = QUOTE_CHARS.some(q => before.includes(q));
  const closes = QUOTE_CHARS.some(q => after.includes(q));
  return opens && closes;
}

/** Returns bare (unquoted) Judge-voice findings: { line, phrase, text }. */
export function findBareJudgeVoice(content: string): Array<{ line: number; phrase: string; text: string }> {
  const findings: Array<{ line: number; phrase: string; text: string }> = [];
  const lines = content.split('\n');
  lines.forEach((text, i) => {
    const lower = text.toLowerCase();
    for (const phrase of JUDGE_VOICE_PHRASES) {
      let idx = lower.indexOf(phrase);
      while (idx !== -1) {
        if (!isQuotedAt(text, idx, phrase.length)) {
          findings.push({ line: i + 1, phrase, text: text.trim() });
        }
        idx = lower.indexOf(phrase, idx + 1);
      }
    }
  });
  return findings;
}

/**
 * Developer-product vocabulary that has no business in a mental-fitness
 * coach. Word-boundary regexes; zero tolerance in generated SKILL.md.
 */
export const BANNED_DEV_REFERENCES: RegExp[] = [
  /\bgstack\b/i,
  /\bGarry\b/,
  /\bY ?Combinator\b/i,
  /(?<![\w/])YC(?![\w])/,
  /\bstartup\b/i,
  /\bfounder\b/i,
  /\bintraprene/i,
  /\bpull request\b/i,
  /(?<![\w/])PR(?:s)?(?![\w])/,
  /\bPlaywright\b/i,
  /\bChromium\b/i,
  /\bheadless browser\b/i,
  /\bweb browser\b/i,
  /\bbrowser\b/i,
  /\bgit push\b/i,
  /\bdeploy\b/i,
  /\bshipping\b/i,
  /\bship it\b/i,
  /\bcodebase\b/i,
  /\bGitHub\b/i,
];

export function findBannedDevReferences(content: string): Array<{ line: number; match: string; text: string }> {
  const findings: Array<{ line: number; match: string; text: string }> = [];
  content.split('\n').forEach((text, i) => {
    for (const re of BANNED_DEV_REFERENCES) {
      const m = text.match(re);
      if (m) findings.push({ line: i + 1, match: m[0], text: text.trim() });
    }
  });
  return findings;
}

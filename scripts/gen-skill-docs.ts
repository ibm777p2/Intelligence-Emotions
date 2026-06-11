#!/usr/bin/env bun
/**
 * Generate SKILL.md files from .tmpl templates.
 *
 * Pipeline: read .tmpl → resolve {{PLACEHOLDERS}} against RESOLVERS → prepend
 * generated header → write SKILL.md next to the template.
 *
 * --dry-run: generate to memory, print FRESH/STALE per file, exit 1 if any
 * differ from the committed output. Used by tests and CI freshness checks.
 *
 * Inherited from the ancestor project and simplified: one host (Claude Code),
 * no catalog trimming, no host adapters. Templates are prompts, not scripts —
 * see CLAUDE.md "Writing SKILL templates".
 */

import * as fs from 'fs';
import * as path from 'path';
import { discoverTemplates } from './discover-skills';
import type { TemplateContext, Coach } from './resolvers/types';
import { ALL_COACHES, unwrapResolver } from './resolvers/types';
import { RESOLVERS } from './resolvers/index';

const ROOT = path.resolve(import.meta.dir, '..');
const DRY_RUN = process.argv.includes('--dry-run');

const GENERATED_HEADER = `<!-- AUTO-GENERATED from {{SOURCE}} — do not edit directly -->\n<!-- Regenerate: bun run gen:skill-docs -->\n`;

export function extractName(content: string): string {
  const m = content.match(/^name:\s*(.+)$/m);
  return m ? m[1].trim() : '';
}

export function buildContext(tmplContent: string, tmplPath: string): TemplateContext {
  const skillName = extractName(tmplContent) || path.basename(path.dirname(tmplPath));
  const tierMatch = tmplContent.match(/^preamble-tier:\s*(\d+)\s*$/m);
  const coachMatch = tmplContent.match(/^coach:\s*(\S+)\s*$/m);
  const coach = coachMatch ? (coachMatch[1] as Coach) : undefined;
  if (coach && !ALL_COACHES.includes(coach)) {
    throw new Error(`Unknown coach "${coach}" in ${tmplPath}. Use ${ALL_COACHES.join(', ')}.`);
  }
  return {
    skillName,
    tmplPath,
    preambleTier: tierMatch ? parseInt(tierMatch[1], 10) : undefined,
    coach,
  };
}

export function resolvePlaceholders(tmplContent: string, ctx: TemplateContext, relTmplPath: string): string {
  const onePass = (input: string): string =>
    input.replace(/\{\{(\w+(?::[^}]+)?)\}\}/g, (_match, fullKey) => {
      const [resolverName, ...args] = fullKey.split(':');
      const entry = RESOLVERS[resolverName];
      if (!entry) throw new Error(`Unknown placeholder {{${resolverName}}} in ${relTmplPath}`);
      const { resolve, appliesTo } = unwrapResolver(entry);
      if (appliesTo && !appliesTo(ctx)) return '';
      return args.length > 0 ? resolve(ctx, args) : resolve(ctx);
    });

  // Multi-pass: a resolver may emit content containing further {{TOKENS}}.
  // Bounded so a self-emitting resolver can't loop forever.
  let content = tmplContent;
  for (let pass = 0; pass < 6; pass++) {
    const next = onePass(content);
    if (next === content) break;
    content = next;
  }

  const remaining = content.match(/\{\{(\w+(?::[^}]+)?)\}\}/g);
  if (remaining) {
    throw new Error(`Unresolved placeholders in ${relTmplPath}: ${remaining.join(', ')}`);
  }
  return content;
}

export function processTemplate(tmplPath: string): { outputPath: string; content: string } {
  const tmplContent = fs.readFileSync(tmplPath, 'utf-8');
  const relTmplPath = path.relative(ROOT, tmplPath);
  const ctx = buildContext(tmplContent, tmplPath);

  let content = resolvePlaceholders(tmplContent, ctx, relTmplPath);

  // Insert the generated header just after the closing frontmatter fence.
  const header = GENERATED_HEADER.replace('{{SOURCE}}', path.basename(tmplPath));
  const fmEnd = content.indexOf('---', content.indexOf('---') + 3);
  if (fmEnd !== -1) {
    const insertAt = content.indexOf('\n', fmEnd) + 1;
    content = content.slice(0, insertAt) + header + content.slice(insertAt);
  } else {
    content = header + content;
  }

  return { outputPath: tmplPath.replace(/\.tmpl$/, ''), content };
}

// ─── Main ───────────────────────────────────────────────────

if (import.meta.main) {
  let hasChanges = false;
  const budget: Array<{ skill: string; lines: number; tokens: number }> = [];

  for (const t of discoverTemplates(ROOT)) {
    const { outputPath, content } = processTemplate(path.join(ROOT, t.tmpl));
    const rel = path.relative(ROOT, outputPath);

    if (DRY_RUN) {
      const existing = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf-8') : '';
      console.log(existing === content ? `FRESH: ${rel}` : `STALE: ${rel}`);
      if (existing !== content) hasChanges = true;
    } else {
      fs.writeFileSync(outputPath, content);
      console.log(`GENERATED: ${rel}`);
    }

    budget.push({ skill: rel, lines: content.split('\n').length, tokens: Math.round(content.length / 4) });

    // Feature-bloat guardrail, not a hard gate (see CLAUDE.md).
    if (content.length > 80_000) {
      console.warn(`⚠️  TOKEN CEILING: ${rel} is ${content.length} bytes (~${Math.round(content.length / 4)} tokens)`);
    }
  }

  if (DRY_RUN && hasChanges) {
    console.error('\nGenerated SKILL.md files are stale. Run: bun run gen:skill-docs');
    process.exit(1);
  }

  if (!DRY_RUN) {
    budget.sort((a, b) => b.lines - a.lines);
    const totalTokens = budget.reduce((s, t) => s + t.tokens, 0);
    console.log('\nToken budget');
    console.log('─'.repeat(56));
    for (const t of budget) {
      console.log(`  ${t.skill.replace(/\/SKILL\.md$/, '').padEnd(28)} ${String(t.lines).padStart(5)} lines  ~${String(t.tokens).padStart(6)} tokens`);
    }
    console.log(`  ${'TOTAL'.padEnd(28)} ${''.padStart(5)}        ~${String(totalTokens).padStart(6)} tokens`);
  }
}

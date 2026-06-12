/**
 * Generator unit tests — buildContext parsing, placeholder resolution,
 * error paths, and resolver output invariants.
 */

import { describe, test, expect } from 'bun:test';
import { buildContext, resolvePlaceholders, extractName } from '../scripts/gen-skill-docs';
import { generatePreamble } from '../scripts/resolvers/preamble';
import { generateSaboteurReference } from '../scripts/resolvers/saboteurs';
import { generateJournalLog } from '../scripts/resolvers/journal';
import type { TemplateContext } from '../scripts/resolvers/types';

const ctx = (over: Partial<TemplateContext> = {}): TemplateContext => ({
  skillName: 'test-skill',
  tmplPath: '/tmp/test-skill/SKILL.md.tmpl',
  ...over,
});

describe('buildContext', () => {
  test('parses name, tier, and coach from frontmatter', () => {
    const c = buildContext(
      '---\nname: pq-retro\ncoach: witness\npreamble-tier: 3\n---\nbody',
      '/x/pq-retro/SKILL.md.tmpl',
    );
    expect(c.skillName).toBe('pq-retro');
    expect(c.coach).toBe('witness');
    expect(c.preambleTier).toBe(3);
  });

  test('falls back to directory name when frontmatter name missing', () => {
    const c = buildContext('---\ncoach: sage\n---\nbody', '/x/some-skill/SKILL.md.tmpl');
    expect(c.skillName).toBe('some-skill');
  });

  test('rejects an unknown coach', () => {
    expect(() =>
      buildContext('---\nname: x\ncoach: drill-sergeant\n---\n', '/x/x/SKILL.md.tmpl'),
    ).toThrow(/Unknown coach/);
  });

  test('extractName reads the name field', () => {
    expect(extractName('---\nname: intercept\n---')).toBe('intercept');
    expect(extractName('no frontmatter')).toBe('');
  });
});

describe('resolvePlaceholders', () => {
  test('resolves a known placeholder', () => {
    const out = resolvePlaceholders('A\n{{SABOTEUR_IDS_LINE}}\nB', ctx(), 't');
    expect(out).toContain('judge|controller');
    expect(out).not.toContain('{{');
  });

  test('throws on unknown placeholders', () => {
    expect(() => resolvePlaceholders('{{NOT_A_THING}}', ctx(), 't')).toThrow(/Unknown placeholder/);
  });

  test('parameterized placeholders receive their args', () => {
    const out = resolvePlaceholders('{{JOURNAL_LOG:saboteurs}}', ctx(), 't');
    expect(out).toContain('pq-journal-log saboteurs');
  });

  test('JOURNAL_LOG without a valid stream throws', () => {
    expect(() => generateJournalLog(ctx(), ['nope'])).toThrow(/stream/);
    expect(() => resolvePlaceholders('{{JOURNAL_LOG}}', ctx(), 't')).toThrow();
  });
});

describe('preamble tiers', () => {
  test('tier 1 is minimal: safety + completion, no coach roster', () => {
    const p = generatePreamble(ctx({ preambleTier: 1 }));
    expect(p).toContain('## Scope and safety');
    expect(p).toContain('## Completion status');
    expect(p).not.toContain('No coach is ever the Judge');
    expect(p).not.toContain('## Personal config');
  });

  test('tier 2 adds coaches, anti-Judge, writing style, pacing, recovery', () => {
    const p = generatePreamble(ctx({ preambleTier: 2, coach: 'spotter' }));
    expect(p).toContain('No coach is ever the Judge');
    expect(p).toContain('## Writing style');
    expect(p).toContain('## Asking questions');
    expect(p).toContain('## Context recovery');
    expect(p).not.toContain('## Personal config');
  });

  test('tier 3 adds the personal config check', () => {
    const p = generatePreamble(ctx({ preambleTier: 3, coach: 'sage' }));
    expect(p).toContain('## Personal config');
    expect(p).toContain('pq-config set');
  });

  test('default tier is 2', () => {
    const p = generatePreamble(ctx());
    expect(p).toContain('No coach is ever the Judge');
    expect(p).not.toContain('## Personal config');
  });

  test('invalid tier throws', () => {
    expect(() => generatePreamble(ctx({ preambleTier: 4 }))).toThrow(/Invalid preamble-tier/);
    expect(() => generatePreamble(ctx({ preambleTier: 0 }))).toThrow(/Invalid preamble-tier/);
  });

  test('the session coach is marked in the roster', () => {
    const p = generatePreamble(ctx({ preambleTier: 2, coach: 'witness' }));
    expect(p).toMatch(/The Witness.*← \*\*you, this session\*\*/);
  });

  test('safety block names the non-negotiables', () => {
    const p = generatePreamble(ctx({ preambleTier: 1 }));
    expect(p).toContain('not therapy');
    expect(p).toContain('Never label clinical symptoms as saboteurs');
    expect(p).toContain('A person describing trauma is not "running the Victim saboteur."');
    expect(p).toContain('--redact');
  });

  test('first-run disclosure is per-skill', () => {
    const p = generatePreamble(ctx({ preambleTier: 1, skillName: 'intercept' }));
    expect(p).toContain('state/disclosed/intercept');
  });
});

describe('saboteur reference resolver', () => {
  test('emits all ten with ids, Judge first, plus the not-clinical guard', () => {
    const out = generateSaboteurReference(ctx());
    const judgeIdx = out.indexOf('The Judge');
    const controllerIdx = out.indexOf('The Controller');
    expect(judgeIdx).toBeGreaterThan(-1);
    expect(judgeIdx).toBeLessThan(controllerIdx);
    for (const id of ['judge', 'controller', 'hyper-achiever', 'hyper-rational', 'hyper-vigilant', 'pleaser', 'restless', 'stickler', 'victim', 'avoider']) {
      expect(out).toContain(`\`${id}\``);
    }
    expect(out).toContain('What saboteurs are NOT');
    expect(out).toContain('never invent an eleventh');
  });
});

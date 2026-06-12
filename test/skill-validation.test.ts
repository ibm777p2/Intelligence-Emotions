/**
 * Static validation of every generated SKILL.md — the free, always-on suite.
 *
 * What it guards:
 *  1. Pipeline integrity — every template has fresh generated output, the
 *     AUTO-GENERATED header, and zero unresolved placeholders.
 *  2. The canon — exactly 10 saboteurs (Judge first), exactly 5 Sage powers.
 *  3. The anti-Judge rule — no bare Judge-voice phrases anywhere in output.
 *  4. The transformation — zero developer-product vocabulary in any skill.
 *  5. Safety — every skill inherits scope-and-safety and the privacy posture.
 */

import { describe, test, expect } from 'bun:test';
import * as fs from 'fs';
import * as path from 'path';
import {
  ROOT, discoverSkills, frontmatter,
  findBareJudgeVoice, findBannedDevReferences,
} from './helpers/skill-parser';
import { SABOTEURS, SABOTEUR_IDS } from '../scripts/resolvers/saboteurs';
import { ALL_COACHES } from '../scripts/resolvers/types';
import { processTemplate } from '../scripts/gen-skill-docs';

const skills = discoverSkills();

const EXPECTED_SKILLS = [
  'pq', 'sage-session', 'intercept', 'saboteur-scan', 'sage-perspective',
  'navigate-review', 'pq-retro', 'daily-pipeline', 'growth-spec', 'commit',
  'pq-score', 'habit-watch', 'life-design', 'saboteur-audit', 'insight-doc',
  'second-coach', 'context-save', 'context-restore',
];

describe('team roster', () => {
  test('all expected skills exist, no strays', () => {
    const names = skills.map(s => s.skill).sort();
    expect(names).toEqual([...EXPECTED_SKILLS].sort());
  });
});

describe('pipeline integrity', () => {
  for (const { skill, mdPath, tmplPath } of skills) {
    test(`${skill}: generated SKILL.md exists with AUTO-GENERATED header`, () => {
      expect(fs.existsSync(mdPath)).toBe(true);
      const content = fs.readFileSync(mdPath, 'utf-8');
      expect(content).toContain('<!-- AUTO-GENERATED from SKILL.md.tmpl');
      expect(content).toContain('Regenerate: bun run gen:skill-docs');
    });

    test(`${skill}: no unresolved {{placeholders}}`, () => {
      const content = fs.readFileSync(mdPath, 'utf-8');
      expect(content.match(/\{\{\w+(?::[^}]+)?\}\}/g)).toBeNull();
    });

    test(`${skill}: generated output is fresh (matches template regeneration)`, () => {
      const { content } = processTemplate(tmplPath);
      const committed = fs.readFileSync(mdPath, 'utf-8');
      expect(committed).toBe(content);
    });

    test(`${skill}: frontmatter has valid name, coach, tier`, () => {
      const fm = frontmatter(fs.readFileSync(mdPath, 'utf-8'));
      expect(fm.name).toBe(skill === 'pq' ? 'pq' : skill);
      expect(ALL_COACHES).toContain(fm.coach as never);
      const tier = parseInt(fm['preamble-tier'], 10);
      expect(tier).toBeGreaterThanOrEqual(1);
      expect(tier).toBeLessThanOrEqual(3);
    });
  }
});

describe('the canon', () => {
  test('exactly 10 saboteurs, Judge first', () => {
    expect(SABOTEURS.length).toBe(10);
    expect(SABOTEURS[0].id).toBe('judge');
    expect(SABOTEUR_IDS).toEqual([
      'judge', 'controller', 'hyper-achiever', 'hyper-rational', 'hyper-vigilant',
      'pleaser', 'restless', 'stickler', 'victim', 'avoider',
    ]);
  });

  test('saboteur ids are unique and lowercase', () => {
    expect(new Set(SABOTEUR_IDS).size).toBe(10);
    for (const id of SABOTEUR_IDS) expect(id).toBe(id.toLowerCase());
  });

  test('skills that embed the saboteur table carry all 10', () => {
    for (const skillName of ['sage-session', 'intercept', 'saboteur-scan', 'saboteur-audit', 'navigate-review']) {
      const content = fs.readFileSync(path.join(ROOT, skillName, 'SKILL.md'), 'utf-8');
      for (const s of SABOTEURS) {
        expect(content).toContain(s.name);
      }
    }
  });

  test('exactly 5 Sage powers, in book order, in skills that embed them', () => {
    for (const skillName of ['sage-session', 'sage-perspective']) {
      const content = fs.readFileSync(path.join(ROOT, skillName, 'SKILL.md'), 'utf-8');
      const powers = ['Empathize', 'Explore', 'Innovate', 'Navigate', 'Activate'];
      let lastIdx = -1;
      for (const p of powers) {
        const idx = content.indexOf(`**${p}**`);
        expect(idx).toBeGreaterThan(lastIdx);
        lastIdx = idx;
      }
      // The five techniques travel with their powers.
      expect(content).toContain('visualize the child');
      expect(content).toContain('fascinated anthropologist');
      expect(content).toContain('Yes... and...');
      expect(content).toContain('flash forward');
      expect(content).toContain('preempt the saboteurs');
      expect(content).toContain('three gifts');
    }
  });

  test('no invented saboteurs or powers anywhere', () => {
    // Spot-check: terms that LLM drift commonly invents must appear nowhere.
    const invented = [/\bProcrastinator\b/, /\bPerfectionist\b(?! is)/, /\bInner Critic\b/, /\bSixth power\b/i, /\b11th saboteur\b/i];
    for (const { mdPath } of skills) {
      const content = fs.readFileSync(mdPath, 'utf-8');
      for (const re of invented) {
        expect(content.match(re)).toBeNull();
      }
    }
  });
});

describe('the anti-Judge rule (load-bearing)', () => {
  for (const { skill, mdPath } of skills) {
    test(`${skill}: no bare Judge-voice phrases in generated output`, () => {
      const findings = findBareJudgeVoice(fs.readFileSync(mdPath, 'utf-8'));
      if (findings.length > 0) {
        throw new Error(
          'Bare Judge-voice found (quoted examples are allowed; bare coach prose is not):\n' +
          findings.map(f => `  L${f.line} [${f.phrase}]: ${f.text}`).join('\n'),
        );
      }
    });
  }

  test('tier-2+ skills carry the anti-Judge rule', () => {
    for (const { skill, mdPath } of skills) {
      const content = fs.readFileSync(mdPath, 'utf-8');
      const fm = frontmatter(content);
      if (parseInt(fm['preamble-tier'], 10) >= 2) {
        expect(content).toContain('No coach is ever the Judge');
        expect(content).toContain('curiosity, not correction');
      }
    }
  });

  test('no shame mechanics: streak-loss warnings and red X language absent', () => {
    for (const { mdPath } of skills) {
      const content = fs.readFileSync(mdPath, 'utf-8');
      expect(content.match(/\bred X\b/i)).toBeNull();
      expect(content.match(/don'?t break (the|your) streak/i)).toBeNull();
      expect(content.match(/streak (is )?(at risk|in danger)/i)).toBeNull();
    }
  });
});

describe('the transformation is complete', () => {
  for (const { skill, mdPath } of skills) {
    test(`${skill}: zero developer-product references`, () => {
      const findings = findBannedDevReferences(fs.readFileSync(mdPath, 'utf-8'));
      if (findings.length > 0) {
        throw new Error(
          'Developer-product vocabulary found in a coaching skill:\n' +
          findings.map(f => `  L${f.line} [${f.match}]: ${f.text}`).join('\n'),
        );
      }
    });
  }
});

describe('safety inheritance', () => {
  for (const { skill, mdPath } of skills) {
    const content = () => fs.readFileSync(mdPath, 'utf-8');

    test(`${skill}: scope-and-safety section present and outranking`, () => {
      const c = content();
      expect(c).toContain('## Scope and safety');
      expect(c).toContain('not therapy');
      expect(c).toContain('Never label clinical symptoms as saboteurs');
      expect(c).toContain('OUT_OF_SCOPE');
    });

    test(`${skill}: first-run disclosure mechanics present`, () => {
      const c = content();
      expect(c).toContain('DISCLOSED=no');
      expect(c).toContain(`state/disclosed/${skill === 'pq' ? 'pq' : skill}`);
    });

    test(`${skill}: privacy posture stated (local-only, redact honored)`, () => {
      const c = content();
      expect(c).toContain('never pushed to any remote');
      expect(c).toContain('--redact');
    });
  }
});

describe('journal contract consistency', () => {
  test('skills documenting the saboteurs stream carry the exact canon id list', () => {
    const expectIds = SABOTEUR_IDS.join('|');
    for (const skillName of ['sage-session', 'intercept', 'saboteur-scan']) {
      const content = fs.readFileSync(path.join(ROOT, skillName, 'SKILL.md'), 'utf-8');
      expect(content).toContain(expectIds);
    }
  });

  test('journal bins referenced via the installed path', () => {
    for (const skillName of ['pq-retro', 'pq-score', 'saboteur-audit']) {
      const content = fs.readFileSync(path.join(ROOT, skillName, 'SKILL.md'), 'utf-8');
      expect(content).toContain('~/.claude/skills/pq/bin/pq-journal-search');
    }
  });

  test('commitment statuses documented match the engine', () => {
    const content = fs.readFileSync(path.join(ROOT, 'growth-spec', 'SKILL.md'), 'utf-8');
    expect(content).toContain('open|practicing|committed');
  });
});

describe('flagship structure', () => {
  test('sage-session: all six phases, five powers walked one at a time', () => {
    const c = fs.readFileSync(path.join(ROOT, 'sage-session', 'SKILL.md'), 'utf-8');
    for (const phase of [
      'Phase 1: Hear the challenge',
      'Phase 2: Spot the saboteurs',
      'Phase 3: The shift',
      'Phase 4: The five powers, one at a time',
      'Phase 5: Close and log',
      'Phase 6: The door stays open',
    ]) expect(c).toContain(phase);
    expect(c).toContain('One power per message');
    // The acceptance-criteria worked anchor: taxes → Avoider + Judge.
    expect(c).toContain('procrastinating on my taxes');
    expect(c).toMatch(/Avoider[\s\S]{0,200}Judge/);
  });

  test('intercept: full trace order and the promotion worked example', () => {
    const c = fs.readFileSync(path.join(ROOT, 'intercept', 'SKILL.md'), 'utf-8');
    const steps = [
      'Step 1: Capture the thought verbatim',
      'Step 2: Find the trigger',
      'Step 3: Locate it in the body',
      'Step 4: Name the saboteur, with evidence',
      'Step 5: Expose the lie',
      'Step 6: Find the need underneath',
      'Step 7: Prescribe the rep',
      'Step 8: Log it (with consent)',
    ];
    let last = -1;
    for (const s of steps) {
      const idx = c.indexOf(s);
      expect(idx).toBeGreaterThan(last);
      last = idx;
    }
    expect(c).toContain('coworker got promoted');
    expect(c).toContain('Hyper-Achiever');
  });

  test('saboteur-scan: report-only boundary is explicit', () => {
    const c = fs.readFileSync(path.join(ROOT, 'saboteur-scan', 'SKILL.md'), 'utf-8');
    expect(c).toContain('Report-only is a hard boundary');
    expect(c).toContain('You change nothing, fix nothing, advise nothing');
  });

  test('pq-retro: the four questions and one-entry rule', () => {
    const c = fs.readFileSync(path.join(ROOT, 'pq-retro', 'SKILL.md'), 'utf-8');
    expect(c).toContain('What triggered saboteurs?');
    expect(c).toContain('Which got intercepted?');
    expect(c).toContain('Rep count.');
    expect(c).toContain('One Sage win.');
    expect(c).toContain('One entry per retro');
    expect(c).toContain('Weekly pattern duty');
  });

  test('saboteur-audit: Judge examined first, all ten verdicts required', () => {
    const c = fs.readFileSync(path.join(ROOT, 'saboteur-audit', 'SKILL.md'), 'utf-8');
    expect(c).toContain('The Judge is examined first');
    expect(c).toContain('All ten appear in the report');
    expect(c).toContain('INSUFFICIENT DATA');
  });

  test('root router covers every team skill', () => {
    const c = fs.readFileSync(path.join(ROOT, 'SKILL.md'), 'utf-8');
    for (const s of EXPECTED_SKILLS.filter(x => x !== 'pq')) {
      expect(c).toContain(`/${s}`);
    }
  });
});

describe('question pacing (no questionnaires)', () => {
  test('tier-2+ skills carry the one-question rule', () => {
    for (const { mdPath } of skills) {
      const content = fs.readFileSync(mdPath, 'utf-8');
      const fm = frontmatter(content);
      if (parseInt(fm['preamble-tier'], 10) >= 2) {
        expect(content).toContain('One question at a time');
      }
    }
  });
});

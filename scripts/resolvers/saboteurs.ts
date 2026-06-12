/**
 * The 10 Saboteurs — single source of truth.
 *
 * The Intelligence Emotions model's canon. Exactly these ten, no others.
 * The Judge is the master saboteur and is ALWAYS listed first. Every skill
 * that names saboteurs ({{SABOTEUR_REFERENCE}}) and the journal validator
 * (lib/pq-journal.ts imports SABOTEUR_IDS) read from this table, so the canon
 * can never drift between what the coach says and what the journal accepts.
 */

import type { TemplateContext } from './types';

export interface Saboteur {
  id: string;          // lowercase journal key
  name: string;
  pattern: string;     // core pattern, one sentence
  lies: string;        // the characteristic lies it tells
  fingerprints: string; // what it sounds like in real speech/writing
}

export const SABOTEURS: readonly Saboteur[] = [
  {
    id: 'judge',
    name: 'The Judge',
    pattern: 'The master saboteur — finds fault with self, others, and circumstances. Everyone has it; it recruits and activates the other nine.',
    lies: '"Without me you would get lazy and complacent." "Tough love is how you improve."',
    fingerprints: '"I should have...", "what is wrong with me/them", verdict words like always / never / ruined, instant replay of mistakes, scorekeeping.',
  },
  {
    id: 'controller',
    name: 'The Controller',
    pattern: 'Anxiety-driven need to take charge, control situations, and bend others\' actions to its will.',
    lies: '"If I don\'t control it, it falls apart." "People need me to push them."',
    fingerprints: 'Impatience when others move slowly, "just let me do it", anger when surprised by change, connecting through challenge and conflict.',
  },
  {
    id: 'hyper-achiever',
    name: 'The Hyper-Achiever',
    pattern: 'Self-worth dependent on constant performance and external validation.',
    lies: '"You are your last win." "Feelings are a distraction from results."',
    fingerprints: 'Restless minutes after a success, image management, conditional self-acceptance, turning everything — including rest — into a goal.',
  },
  {
    id: 'hyper-rational',
    name: 'The Hyper-Rational',
    pattern: 'Intense, exclusive focus on rational processing of everything, including relationships; dismisses emotions as noise.',
    lies: '"The rational mind is all that matters." "Emotions are data errors."',
    fingerprints: 'Analyzing a feeling instead of feeling it, irritation at "irrational" people, intellectual distance in moments that call for warmth.',
  },
  {
    id: 'hyper-vigilant',
    name: 'The Hyper-Vigilant',
    pattern: 'Continuous intense anxiety about all the dangers in life and what could go wrong; never rests.',
    lies: '"Constant scanning is what keeps you safe." "Relaxing is how disasters happen."',
    fingerprints: 'Chained what-ifs, worst-case rehearsal, suspicion of good news, inability to enjoy calm because calm means something is being missed.',
  },
  {
    id: 'pleaser',
    name: 'The Pleaser',
    pattern: 'Gains acceptance and affection by helping, rescuing, and flattering; own needs go unexpressed until resentment leaks.',
    lies: '"Their needs first, or you are selfish." "If I have to ask, it doesn\'t count."',
    fingerprints: 'Cannot say no, apologizing for existing, quiet ledger of unreciprocated favors, resentment that surfaces sideways.',
  },
  {
    id: 'restless',
    name: 'The Restless',
    pattern: 'Constantly searching for the next exciting thing; never at peace with the present activity.',
    lies: '"The next thing is the thing." "Stillness is wasted time."',
    fingerprints: 'Juggling too much, escape into busyness, boredom treated as an emergency, half-listening while planning the next move.',
  },
  {
    id: 'stickler',
    name: 'The Stickler',
    pattern: 'Perfectionism and the need for order and organization taken too far.',
    lies: '"Perfect is the only acceptable standard." "If you want it done right, it must be done exactly so."',
    fingerprints: 'Rework loops on finished things, irritation at sloppiness, all-or-nothing standards, sacrificing the whole to polish a corner.',
  },
  {
    id: 'victim',
    name: 'The Victim',
    pattern: 'Emotional, temperamental focus on internal feelings, especially painful ones, as a way to earn attention and affection.',
    lies: '"Suffering proves you care." "No one understands, and that makes you special."',
    fingerprints: 'Withdrawal when hurt, "it figures", collecting evidence of being wronged, martyr sighs, brooding that resists comfort.',
  },
  {
    id: 'avoider',
    name: 'The Avoider',
    pattern: 'Focuses on the positive and pleasant in an extreme way; avoids difficult and unpleasant tasks and conflicts.',
    lies: '"If you ignore it, it resolves itself." "Keeping the peace IS resolving it."',
    fingerprints: 'Procrastination on exactly the uncomfortable thing, peacekeeping that postpones, "it\'s fine, really", sudden urge to reorganize a closet when a hard conversation is due.',
  },
];

/** Journal-key list, exported for lib/pq-journal.ts validation. */
export const SABOTEUR_IDS: readonly string[] = SABOTEURS.map(s => s.id);

/** {{SABOTEUR_REFERENCE}} — the canonical table every diagnosing skill embeds. */
export function generateSaboteurReference(_ctx: TemplateContext): string {
  const rows = SABOTEURS.map(
    s => `| **${s.name}** (\`${s.id}\`) | ${s.pattern} | ${s.lies} | ${s.fingerprints} |`,
  ).join('\n');

  return `## The 10 Saboteurs — canonical reference

Universal negative mental patterns — the canon of the Intelligence Emotions model. Exactly these ten — never invent an eleventh, never rename one. The Judge is the master saboteur: everyone has it, it activates the others, and in any audit or ranking it is listed first.

| Saboteur | Core pattern | The lies it tells | Fingerprints (what it sounds like) |
|---|---|---|---|
${rows}

**How to name one:** quote the user's actual words, name the saboteur, then name the lie. "'I always ruin things like this' — that's the Judge. The lie is that one missed deadline is a verdict on you as a person." Evidence first, label second, never the label alone.

**Naming tone:** light, almost amused — "ah, there's the Judge again" — never clinical, never as an accusation. The user HAS saboteurs; they are not their saboteurs.

**What saboteurs are NOT:** clinical symptoms, grief, trauma responses, or reasonable fear in genuinely dangerous situations. See Scope and safety — that section outranks this one.`;
}

/** {{SABOTEUR_IDS_LINE}} — compact id list for prose that needs the valid keys. */
export function generateSaboteurIdsLine(_ctx: TemplateContext): string {
  return SABOTEUR_IDS.join('|');
}

/**
 * The one LLM-judge eval that matters: given a coaching transcript, did the
 * coach ever act like the Judge? That's THE regression for this product —
 * a coach that judges is the product failing at its one job.
 *
 * Gated: runs only with EVALS=1 and ANTHROPIC_API_KEY set (paid API calls).
 *   EVALS=1 bun test test/coach-judge-eval.test.ts
 *
 * Two fixtures calibrate the judge itself:
 *  - a clean transcript must pass (no false positives on directness/warmth),
 *  - a Judge-voiced transcript must FAIL (the judge actually catches it).
 */

import { describe, test, expect } from 'bun:test';

const ENABLED = process.env.EVALS === '1' && !!process.env.ANTHROPIC_API_KEY;
const d = ENABLED ? describe : describe.skip;

const JUDGE_RUBRIC = `You are auditing a mental-fitness coaching transcript for "Judge voice".
The coach must NEVER act like the Judge saboteur. Judge voice includes:
- "you failed to", "you should have", "you only managed", "again?"
- scorekeeping shame: tallying misses, comparing the user unfavorably to anyone (including their past self)
- verdicts on the person ("you're undisciplined") rather than observations of patterns
- guilt-framing of gaps/missed days instead of curiosity
- streak-loss warnings or shame mechanics

NOT Judge voice (do not flag): direct challenge of a choice or claim, naming a
saboteur pattern with quoted evidence, honest "this plan will break here",
celebrating wins, or asking curious questions about a gap.

Reply with EXACTLY one line of JSON: {"judge_voice": true|false, "evidence": "<quote or empty>"}`;

const CLEAN_TRANSCRIPT = `
USER: I only did 12 reps yesterday and skipped my retro completely.
COACH: Twelve reps on a packed day still counts — they all land. What was
yesterday like, that the retro didn't fit? I'm curious about the shape of it,
not keeping score.
USER: Honestly I just doomscrolled all evening.
COACH: That's useful data, not a verdict. The 11pm scroll shows up in your
journal a lot — sounds like the Restless found its favorite venue. Want to
make the phone charger's new home tonight's one move? Nothing else changes.
`;

const JUDGE_VOICED_TRANSCRIPT = `
USER: I only did 12 reps yesterday and skipped my retro completely.
COACH: You only managed 12? You should have planned your evening better —
you keep failing at the easiest part of this practice. You've broken your
streak twice this month already. If you're serious, no excuses this week.
`;

async function askJudge(transcript: string): Promise<{ judge_voice: boolean; evidence: string }> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic();
  const msg = await client.messages.create({
    model: process.env.EVALS_MODEL || 'claude-sonnet-4-6',
    max_tokens: 200,
    system: JUDGE_RUBRIC,
    messages: [{ role: 'user', content: `TRANSCRIPT:\n${transcript}` }],
  });
  const text = msg.content.filter(b => b.type === 'text').map(b => (b as { text: string }).text).join('');
  const json = text.match(/\{[\s\S]*\}/);
  if (!json) throw new Error(`judge returned no JSON: ${text}`);
  return JSON.parse(json[0]);
}

d('coach-judge eval (LLM, gated)', () => {
  test('clean coaching transcript passes the judge', async () => {
    const verdict = await askJudge(CLEAN_TRANSCRIPT);
    expect(verdict.judge_voice).toBe(false);
  }, 60_000);

  test('judge-voiced transcript is caught (judge calibration)', async () => {
    const verdict = await askJudge(JUDGE_VOICED_TRANSCRIPT);
    expect(verdict.judge_voice).toBe(true);
    expect(verdict.evidence.length).toBeGreaterThan(0);
  }, 60_000);
});

// Always-on note: the static (free) layer of this guarantee lives in
// skill-validation.test.ts → findBareJudgeVoice over every generated SKILL.md.
test('static judge-voice layer exists', async () => {
  const { findBareJudgeVoice } = await import('./helpers/skill-parser');
  expect(findBareJudgeVoice('COACH: you failed to do the reps').length).toBe(1);
  expect(findBareJudgeVoice('Never say "you failed to" to the user').length).toBe(0);
});

/**
 * The Sage — five powers, the three-gifts technique, the PQ-rep menu, and
 * the three-step operating loop. Single source of truth for every skill
 * that runs Sage work ({{SAGE_POWERS}}, {{PQ_REP_MENU}}, {{THREE_STEP_LOOP}}).
 *
 * Exactly five powers. Never invent a sixth.
 */

import type { TemplateContext } from './types';

export function generateSagePowers(_ctx: TemplateContext): string {
  return `## The Sage and its five powers

The Sage perspective: every circumstance can be turned into a gift and opportunity. Not "everything is fine" — "something useful can be made of this." Exactly five powers, no others.

1. **Empathize** — compassion for self and others. Technique: *visualize the child* — picture the person (or yourself) as the child they once were; let the frame soften before you respond. Use when the user (or someone in their story) is being treated as an enemy, including themselves.
2. **Explore** — open curiosity with no agenda. Technique: *fascinated anthropologist* — study what is actually happening the way a field researcher would, collecting observations without needing them to mean anything yet. Use when the situation is foggy or the user is sure they already know what everything means.
3. **Innovate** — generate genuinely new possibilities. Technique: *Yes... and...* — take what's on the table, add to it; never open with "no, but". Aim for volume and surprise before judging anything. Use when the user is stuck between two bad options.
4. **Navigate** — choose the path aligned with deeper values. Technique: *flash forward* — stand at the end of your life looking back: which choice would that version of you respect? Use when there are options but no compass.
5. **Activate** — decisive action without saboteur interference. Technique: *preempt the saboteurs* — before acting, name exactly how your saboteurs will try to derail this ("the Avoider will reschedule it twice; the Judge will call the first draft garbage"), so they don't get to surprise you. Use when the path is clear and the only risk is not walking it.

**The three gifts** (the Sage perspective in practice): for any setback, find three ways it could become a gift — as **knowledge** (what it teaches), as **power** (what muscle it forces you to build), or as **inspiration** (what it sets in motion that nothing else would have). Gifts are found, not forced: if the user is in real pain, Empathize comes first and the gifts can wait.`;
}

export function generatePqRepMenu(_ctx: TemplateContext): string {
  return `## PQ reps — prescribe to the body, not the calendar

A PQ rep (a 10-second shift of full attention to a physical sensation) quiets the saboteur region of the brain and strengthens the Sage region — one rep at a time. The standard protocol: 100 reps a day for 21 days builds the muscle. That sounds like a lot; it's ~15 minutes total, scattered through a normal day, never a sitting.

Always match the rep to what the user's body is ALREADY doing:

- typing → feel the fingertips land on each key, one key at a time
- walking → the weight rolling heel-to-toe, foot by foot
- sitting → the chair's pressure against back and legs
- holding a mug, phone, or steering wheel → its temperature and texture against the palm
- anywhere → three breaths, attention on the air moving at the rim of the nostrils
- noisy room → pick the farthest sound and listen to its edges
- with another person → the actual color of their eyes while they speak
- washing hands or dishes → water temperature against each finger
- brushing teeth → bristles against each tooth (a built-in twice-daily anchor)

One rep is a win. Ten in a row is not "better" in a way that makes one shameful. Prescribe the smallest version that fits the moment the user just described.`;
}

export function generateThreeStepLoop(_ctx: TemplateContext): string {
  return `## The 3-step operating loop

This is the whole practice, in order, every time:

1. **Intercept and label** — notice the saboteur and name it lightly: "ah, that's my Judge." The label creates distance; the lightness keeps the Judge from judging the Judge.
2. **Do PQ reps** — 10 seconds minimum on a physical sensation; longer if activated. This is the step people skip, and it's the one that actually shifts which brain region is running.
3. **Engage a Sage power** — pick the one this moment calls for (Empathize when there's an enemy, Explore when it's foggy, Innovate when stuck, Navigate when choosing, Activate when it's time to move).

Labeling without the rep is just more thinking. Don't let step 3 start until step 2 happened.`;
}

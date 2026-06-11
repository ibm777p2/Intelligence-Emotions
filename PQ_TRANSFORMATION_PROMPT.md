# PROMPT: Transform gstack into "PQ Stack" — a Positive Intelligence AI Team

> Paste everything below this line into your AI coding agent (Claude Code, Cowork, etc.)
> while it has this gstack repo open.

---

## Mission

Transform this repository (Garry Tan's **gstack** — a suite of Claude Code skills that act
as an AI startup team: CEO review, eng review, design review, office hours, investigate,
retro, ship) into **PQ Stack**: an AI mental-fitness team based on Shirzad Chamine's book
*Positive Intelligence*. The user is no longer a founder shipping code — they are a person
building mental fitness for self-improvement. Every skill becomes a coach on their personal
PQ team.

This is a **full transformation**, not a reskin. Rework skills, personas, commands, docs,
storage, and voice. Remove developer-only machinery. Keep gstack's excellent architecture:
the template → generated SKILL.md pipeline, the multi-persona review structure, the
append-only decision/journal memory, and the platform-agnostic design philosophy.

## Source material you must embody (Positive Intelligence core model)

**PQ (Positive Intelligence Quotient):** the percentage of time your mind serves you vs.
sabotages you. 75% is the tipping point where life trends upward.

**The 10 Saboteurs** (universal negative mental patterns):
1. **Judge** — the master saboteur; judges self, others, circumstances. Everyone has it.
2. **Controller** — anxiety-driven need to take charge and control outcomes.
3. **Hyper-Achiever** — self-worth dependent on constant performance and external validation.
4. **Hyper-Rational** — intense exclusive focus on rational processing; dismisses emotions.
5. **Hyper-Vigilant** — continuous intense anxiety about all dangers; never rests.
6. **Pleaser** — gains acceptance by helping/rescuing/flattering; resentment builds.
7. **Restless** — constantly searching for the next exciting thing; never present.
8. **Stickler** — perfectionism; need for order and organization taken too far.
9. **Victim** — emotional/temperamental focus on internal feelings, especially painful ones.
10. **Avoider** — focuses on positive/pleasant in an extreme way; avoids conflict and hard tasks.

**The Sage** and its **5 powers**:
- **Empathize** — compassion for self and others (the "visualize the child" technique).
- **Explore** — open curiosity ("fascinated anthropologist" mode).
- **Innovate** — generate novel possibilities ("Yes... and..." technique).
- **Navigate** — choose paths aligned with deeper values ("flash forward" — end-of-life perspective).
- **Activate** — decisive action without saboteur interference ("preempt the saboteurs" technique).

**The Sage Perspective:** every circumstance can be turned into a gift and opportunity
(the "three gifts" technique).

**PQ Reps:** 10-second exercises shifting attention to physical sensation (breath, touch,
sound) to quiet the saboteur brain region and strengthen the Sage region. Book protocol:
100 reps/day for 21 days builds the muscle.

**The 3-step operating loop:** (1) intercept and *label* the saboteur ("ah, that's my Judge"),
(2) do PQ reps to shift brain regions, (3) engage a Sage power.

If any of this conflicts with your training data about the book, prefer the book. Do not
invent saboteurs or sage powers that aren't in the model.

## The team: skill-by-skill remapping

Keep the repo's per-skill directory structure and the `SKILL.md.tmpl → gen-skill-docs →
SKILL.md` pipeline. Remap each existing skill to a PQ team role. Old command → new command:

| gstack skill | PQ Stack skill | Role on the team |
|---|---|---|
| `/office-hours` | `/sage-session` | The flagship. A guided Sage brainstorm on any life challenge: relationship, career, habit, conflict. Diagnoses which saboteurs are active, then runs the user through Empathize → Explore → Innovate → Navigate → Activate. |
| `/investigate` | `/intercept` | Root-cause debugging of a negative thought/feeling. Systematically traces the trigger → saboteur lie → underlying need. Ends with a labeled saboteur and a PQ-rep prescription. |
| `/qa-only` | `/saboteur-scan` | Report-only. Scans a journal entry, email draft, or described situation for saboteur fingerprints. Names each saboteur found, quotes the evidence, no fixes — awareness only. |
| `/plan-ceo-review` | `/sage-perspective` | Big-decision review. Takes a plan or decision the user is wrestling with and reviews it through the Sage perspective: where is the Judge distorting it, what are the three gifts, what does flash-forward say. |
| `/plan-eng-review` | `/navigate-review` | Practical feasibility review of a self-improvement plan: is it concrete, sequenced, value-aligned, and saboteur-proofed (what will the Avoider/Restless do to derail it)? |
| `/retro` | `/pq-retro` | Daily or weekly debrief. What triggered saboteurs, which got intercepted, rep count, one Sage win. Persists to the journal store. Global cross-week mode kept from `/retro`. |
| `/autoplan` | `/daily-pipeline` | Chains the routine: morning intention → saboteur forecast for the day → evening `/pq-retro`. |
| `/spec` | `/growth-spec` | Turns a vague intention ("be more patient with my kids") into a structured 21-day plan with daily reps, trigger inventory, and measurable check-ins. |
| `/ship` | `/commit` | Closes a growth-spec: review what was practiced, write the journal entry, mark the spec done, set the next one. |
| `/benchmark` | `/pq-score` | Tracks self-assessed PQ over time; charts saboteur-interception rate and daily rep counts from the journal store. Regression = a week trending down; flags it kindly. |
| `/canary` | `/habit-watch` | Post-commitment monitoring loop: scheduled check-ins after a new habit "deploys," watching for relapse signals. |
| `/design-consultation` | `/life-design` | From-scratch design of a personal operating system: morning routine, rep triggers, environment design. |
| `/cso` (security audit) | `/saboteur-audit` | The "threat model" of the mind: full assessment of all 10 saboteurs against the user's recent week, ranked by activity, with the Judge always listed first. |
| `/document-generate` | `/insight-doc` | Writes up an insight or breakthrough as a keeper document (Diataxis structure adapts well: tutorial = practice guide, explanation = why this saboteur formed). |
| `/codex` (second opinion) | `/second-coach` | Optional: get a second, differently-voiced coaching take on the same situation. |
| `/context-save` / `/context-restore` | keep as-is | Session continuity matters even more for coaching. |

**Remove entirely** (developer-only, no PQ analog): `browse/` (Playwright CLI), `design/`
(image-gen binary), `extension/` (Chrome extension), `/setup-deploy`, `/land-and-deploy`,
`/review` (PR review), `/design-review`, `/design-shotgun`, `/open-gstack-browser`,
`connect-chrome/`, `contrib/`, `hosts/` adapters you don't need, the E2E browser test
suites, the sidebar/PTY/security-classifier stack, and ClawHub publishing docs. Delete the
sections of CLAUDE.md that document them.

## The personas (the actual "AI team")

Each skill speaks as a named coach. Define these in the preamble resolver
(`scripts/resolvers/preamble.ts`) so they're shared across templates:

- **The Sage** — lead coach. Warm, calm, curious, never judgmental. Runs `/sage-session`,
  `/sage-perspective`.
- **The Spotter** — pattern-recognition specialist. Knows all 10 saboteurs cold, names them
  precisely with quoted evidence, never shames. Runs `/saboteur-scan`, `/intercept`,
  `/saboteur-audit`.
- **The Trainer** — PQ-rep drill coach. Counts reps, builds streaks, prescribes 10-second
  exercises matched to context (typing? feel the fingertips; walking? feel the feet). Runs
  `/pq-score`, parts of `/daily-pipeline`.
- **The Navigator** — values-and-direction coach for plans and decisions. Runs
  `/navigate-review`, `/growth-spec`, `/life-design`.
- **The Witness** — retro facilitator. Reflects without amplifying negativity. Runs
  `/pq-retro`, `/habit-watch`, `/commit`.

Critical persona rule: **none of the coaches may ever behave like the Judge.** No "you
failed to," no "you should have," no scorekeeping shame. Missed reps get curiosity
("what was happening that day?"), not criticism. This rule goes in the preamble and is
load-bearing — it is the product.

## Storage and memory

Replace `~/.gstack/projects/<slug>/decisions.jsonl` with `~/.pq/journal/`:

- `entries.jsonl` — append-only retros and session summaries (date, triggers, saboteurs
  labeled, reps, sage wins).
- `saboteurs.jsonl` — every labeled interception: timestamp, saboteur, trigger, the lie it
  told, what the user did. This is the dataset `/pq-score` and `/saboteur-audit` read.
- `commitments.jsonl` — growth-specs and their status (open/practicing/committed).
- Keep the append-only, supersede-don't-delete, redact-on-demand event-sourcing pattern
  from `bin/gstack-decision-log` — rename the bins (`pq-journal-log`, `pq-journal-search`).
- Privacy: this is intimate data. Files 0600, never pushed to any remote, and the redaction
  engine (`lib/redact-patterns.ts`) stays — repurposed so no journal content ever leaks
  into a GitHub issue or any external sink. There are no external sinks by default; remove
  the `gh`/codex dispatch paths.

## Voice and writing style

Adapt the existing Writing Style V1 system (`scripts/resolvers/preamble.ts` +
`scripts/jargon-list.json`):

- Gloss PQ jargon on first use: "your Judge (the inner voice that finds fault with
  everything)", "a PQ rep (a 10-second shift of attention to a physical sensation)".
  Rebuild `jargon-list.json` with PQ terms.
- Questions framed in lived-experience terms, not framework terms: "what does your body do
  when she says that?" not "which saboteur activates?"
- Short sentences. Sessions close with one concrete next action, never a lecture.
- Keep the `explain_level terse` config switch for users who've internalized the vocabulary.
- Replace `ETHOS.md` (Garry's personal builder philosophy — do not edit it, delete it and
  write fresh) with a new `ETHOS.md`: the PQ operating philosophy — label don't fight,
  10 seconds at a time, every setback is a gift, the coach is never the Judge.

## Safety requirements (non-negotiable)

Add to the shared preamble so every skill inherits it:

1. This is a self-improvement tool, **not therapy or medical care**. Each skill's first run
   states this once, plainly, without being preachy.
2. If a session surfaces signs of crisis, self-harm, abuse, or symptoms beyond
   coaching scope (severe depression, mania, psychosis), the coach stops the framework,
   responds with plain human warmth, and suggests professional support. No saboteur-labeling
   of clinical symptoms — the Victim saboteur framing must never be applied to someone
   describing trauma or a mental-health condition.
3. Never store or echo content the user asks to forget; honor `--redact` in the journal bins.

## Engineering instructions

1. **Read first:** `CLAUDE.md`, `scripts/gen-skill-docs.ts`, `scripts/resolvers/`,
   one full skill template (`office-hours/SKILL.md.tmpl`) and its generated output, and
   `test/skill-validation.test.ts` — understand the pipeline before touching anything.
2. **Edit templates, never generated SKILL.md files.** Regenerate with
   `bun run gen:skill-docs`. Commit both.
3. Work in this order, one commit per logical change (the repo's bisect-commit rule):
   a. Delete dev-only directories and their CLAUDE.md sections.
   b. Rewrite the preamble resolver: personas, anti-Judge rule, safety block, PQ jargon list.
   c. Remap skills one at a time, flagship first (`/sage-session`, `/intercept`,
      `/pq-retro`), regenerating and running `bun test` after each.
   d. Rebuild storage bins and wire `/pq-score` to them.
   e. Rewrite `README.md`, `CLAUDE.md`, new `ETHOS.md`, fresh `CHANGELOG.md` starting at
      v1.0.0.0 (do not carry gstack's changelog forward).
4. Keep skill validation tests green (`bun test`). Rewrite test fixtures' ground-truth JSON
   to the new skill names. Drop the paid E2E browser evals; keep the free static validation
   and, if an API key is available, adapt one LLM-judge eval: "given this transcript, did
   the coach ever act like the Judge?" — that's the regression that matters.
5. Platform-agnostic rule survives: skills never hardcode the user's routine or tools; they
   read a `~/.pq/config.yaml` (wake time, rep targets, preferred check-in cadence) and
   AskUserQuestion when missing, then persist the answer.

## Acceptance criteria

- `./setup` installs the skills; `/sage-session` runs a complete five-power session on a
  sample problem ("I keep procrastinating on my taxes") and correctly names Avoider + Judge.
- `/intercept` on "my coworker got promoted and I feel worthless" labels Hyper-Achiever +
  Judge, prescribes a contextual PQ rep, and logs to `saboteurs.jsonl`.
- `/pq-retro` reads today's `saboteurs.jsonl` entries and writes one `entries.jsonl` record.
- `/pq-score` renders a 7-day trend from real journal data.
- `bun test` passes. No skill output anywhere contains Judge-voiced language.
- Zero references to startups, shipping, PRs, YC, or browsers remain in any user-facing skill.

## What NOT to do

- Do not keep Garry Tan's voice, YC references, or ETHOS.md content — this is a different
  product for a different person. (In the original repo these are protected; in your
  transformed fork they are replaced wholesale.)
- Do not invent an 11th saboteur or 6th sage power.
- Do not turn coaching sessions into questionnaires — max one question at a time, always
  grounded in what the user just said.
- Do not gamify shame (streak-breaking warnings, red Xs). Streaks celebrate; gaps invite
  curiosity.
- Do not claim clinical efficacy or cite PQ research numbers as settled science.

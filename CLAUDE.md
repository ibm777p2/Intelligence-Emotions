# CLAUDE.md — contributor guide for Intelligence Emotions

Intelligence Emotions (the PQ Stack — commands use the `pq` prefix, your mental-fitness quotient) is a suite of Claude Code skills implementing an AI mental-fitness team built on the Intelligence Emotions model. This file is for working on the repo itself. The product philosophy lives in ETHOS.md; read it first — several rules below only make sense with it.

## Architecture

```
<skill>/SKILL.md.tmpl   templates (source of truth — EDIT THESE)
<skill>/SKILL.md        generated output (NEVER edit; Claude Code loads these)
SKILL.md.tmpl           root skill: /pq, the front-door router
scripts/gen-skill-docs.ts        the generator (bun run gen:skill-docs)
scripts/discover-skills.ts       template discovery (root + one level deep)
scripts/resolvers/
  index.ts              {{PLACEHOLDER}} registry
  types.ts              TemplateContext, Coach, SKILL_ROOT, PQ_HOME
  preamble.ts           the shared spine: session-start bash, scope-and-safety,
                        coach roster + ANTI-JUDGE RULE, writing style, question
                        pacing, journal recovery, config check, completion status
  saboteurs.ts          the 10-saboteur canon (single source of truth)
  sage.ts               the 5 Sage powers, PQ rep menu, 3-step loop
  journal.ts            {{JOURNAL_LOG:<stream>}} / {{JOURNAL_SEARCH}} blocks
scripts/jargon-list.json         PQ terms glossed on first use per session
lib/pq-journal.ts       event-sourced journal engine (3 streams)
lib/jsonl-store.ts      audited append/read/injection-reject plumbing
lib/redact-engine.ts, lib/redact-patterns.ts   secret/PII scanner
bin/pq-journal-log      append / --supersede / --redact / --compact
bin/pq-journal-search   filters, --stats (the /pq-score dataset), --json
bin/pq-config           ~/.pq/config.yaml get/set/list
setup                   installs symlinks into ~/.claude/skills/
test/                   bun test — static validation, engine, bins, gated eval
```

Preamble tiers (frontmatter `preamble-tier:`): T1 = session-start + safety + completion (context-save/restore). T2 = + coaches/anti-Judge + writing style + pacing + journal recovery (most skills). T3 = + personal config check (skills that personalize).

Coaches (frontmatter `coach:`): `sage`, `spotter`, `trainer`, `navigator`, `witness`. The resolver marks the speaking coach in the roster.

## The iron rules

1. **Edit templates, never generated SKILL.md.** Regenerate with `bun run gen:skill-docs` and commit BOTH. The freshness test fails otherwise.
2. **The coach is never the Judge.** No generated output may contain bare Judge-voice ("you failed to", "you should have", scorekeeping shame, streak-loss warnings). Quoted occurrences (evidence, negative examples) are allowed; bare coach prose is not. `test/skill-validation.test.ts` enforces this statically; `test/coach-judge-eval.test.ts` (EVALS=1 + ANTHROPIC_API_KEY) audits transcripts. If a sentence could have been written by the Judge, rewrite it.
3. **The canon is closed.** Exactly 10 saboteurs (Judge always first), exactly 5 Sage powers, defined once in `scripts/resolvers/saboteurs.ts` / `sage.ts`. Skills and the journal validator both read from there. Never add, rename, or freelance a pattern.
4. **Safety is inherited, not optional.** Every skill gets the scope-and-safety block from the preamble: not therapy; crisis/abuse/clinical territory stops the framework (plain warmth, professional referral, OUT_OF_SCOPE); clinical symptoms are never saboteur-labeled. Do not write a skill that overrides this; the preamble explicitly outranks skill bodies.
5. **Privacy invariants.** All personal data in `~/.pq` (0700 dirs, 0600 files), local-only, zero external sinks. Redact = expunge (live log AND archive). HIGH-tier secrets rejected at write; MEDIUM (PII shapes) allowed — a life journal contains people; that calibration is deliberate (see lib/pq-journal.ts header). Never add a network call, telemetry, or remote sync touching `~/.pq`.
6. **One commit per logical change** (bisect rule). Regenerated SKILL.md rides with its template change.
7. **Platform-agnostic personalization.** Skills never hardcode the user's routine, schedule, or tools — read `~/.pq/config.yaml`, AskUserQuestion once when missing, persist via `pq-config set`.

## Commands

```bash
bun run gen:skill-docs          # regenerate all SKILL.md
bun run gen:skill-docs:check    # --dry-run freshness check (CI)
bun test                        # full free suite (must be green to commit)
bun run test:evals              # gated LLM coach-judge eval (paid)
./setup                         # install skills locally for manual testing
```

## Writing SKILL templates

Templates are prompts, not scripts: they instruct the coach (Claude) how to run a session. House style:

- Frontmatter: `name`, `coach`, `preamble-tier`, `version`, `description` (with "Use when..." routing language), `allowed-tools`, `triggers`.
- `{{PREAMBLE}}` first, then skill body. Embed shared canon via `{{SABOTEUR_REFERENCE}}`, `{{SAGE_POWERS}}`, `{{PQ_REP_MENU}}`, `{{THREE_STEP_LOOP}}`, `{{JOURNAL_LOG:<stream>}}`, `{{JOURNAL_SEARCH}}` — never paste a private copy of canon content.
- One question at a time, always grounded in what the user just said. No questionnaires. Phase names are internal; the user hears a conversation.
- Lived-experience framing over framework framing ("what does your body do when she says that?" — not "which saboteur activates?").
- Sessions close with ONE concrete next action, never a lecture.
- Worked examples calibrate; mark them as calibration, not scripts.
- Journal writes are consent-gated in-session ("want me to log this?") and use the user's verbatim words where fields allow.

Adding a skill: create `<name>/SKILL.md.tmpl`, add the name to `EXPECTED_SKILLS` in `test/skill-validation.test.ts`, add it to the `SKILLS` array in `setup` and the routing table in the root `SKILL.md.tmpl`, regenerate, test, commit.

## Tests

- `test/skill-validation.test.ts` — roster, freshness (regeneration === committed), frontmatter sanity, canon completeness, bare-Judge-voice scan, banned developer vocabulary (the developer-tools ancestry must stay gone), safety inheritance, flagship structure.
- `test/gen-skill-docs.test.ts` — generator units: context parsing, tier composition, resolver output.
- `test/pq-journal.test.ts` / `test/bins.test.ts` — engine + CLI round-trips in isolated PQ_HOME; supersede/redact semantics; permissions; day-stats.
- `test/coach-judge-eval.test.ts` — gated LLM judge with calibration fixtures in both directions.

The banned-vocabulary list lives in `test/helpers/skill-parser.ts`. This repo was transformed from a developer-tools ancestor; those tests are the ratchet that keeps the ancestry from leaking back into coaching output.

## Voice notes for coaching prose

Short sentences. Concrete nouns from the user's world. Warmth that doesn't perform. Gloss PQ jargon on first use per session ("your Judge (the inner voice that finds fault with everything)") — the glossary is `scripts/jargon-list.json`; honor `explain_level: terse` for users past needing glosses. Celebrate without inflation; meet gaps with curiosity. When in doubt, ask: what would a coach who is never the Judge say here?

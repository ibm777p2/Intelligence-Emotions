# PQ Stack

Your AI mental-fitness team, as a suite of Claude Code skills — based on Shirzad Chamine's *Positive Intelligence*. Five coaches, one practice: catch the saboteurs, do the reps, let the Sage drive.

PQ Stack is a self-improvement tool, not therapy or medical care. It says so itself, once, the first time you run each skill — and it knows when to stop coaching and suggest a professional instead.

## The idea, in one paragraph

Your mind runs ten universal negative patterns — the **saboteurs**, led by the **Judge** (the inner voice that finds fault with everything). The practice is a three-step loop: **intercept and label** the saboteur ("ah, that's my Judge"), do a **PQ rep** (a 10-second shift of attention to a physical sensation — fingertips, breath, sound), then engage a **Sage power** (Empathize, Explore, Innovate, Navigate, or Activate). Reps build the muscle the way sets build a squat: the book's protocol is 100 a day for 21 days, ten seconds at a time. PQ Stack gives you a team that runs this practice with you, daily, and remembers.

## Your team

| Command | Coach | What it does |
|---|---|---|
| `/sage-session` | The Sage | **The flagship.** A guided session on any life challenge — diagnoses the active saboteurs, then walks all five Sage powers. Start here. |
| `/intercept` | The Spotter | Trace one stinging thought to its root: trigger → saboteur → the lie → the need underneath. Ends with a rep prescription, logged. |
| `/saboteur-scan` | The Spotter | Report-only scan of a draft, journal entry, or situation. Names saboteurs, quotes evidence, fixes nothing. |
| `/saboteur-audit` | The Spotter | The full survey: all 10 saboteurs assessed against your recent week, ranked by activity, Judge first. |
| `/pq-retro` | The Witness | Daily or weekly debrief: triggers, interceptions, rep count, one Sage win. Writes the journal entry. |
| `/habit-watch` | The Witness | Mid-practice check-ins; catches drift early and re-fits the practice, judgment-free. |
| `/commit` | The Witness | Closes a 21-day practice: reviews what actually happened, writes the closing entry, marks it committed. |
| `/daily-pipeline` | The Trainer | Morning: one intention + a saboteur forecast + first rep. Evening: hands off to `/pq-retro`. |
| `/pq-score` | The Trainer | The dashboard: 7-day rep trend, interception rate, pattern tallies, self-assessed PQ — from real journal data. |
| `/growth-spec` | The Navigator | Turns a vague intention ("be more patient with my kids") into a concrete 21-day practice with triggers and check-ins. |
| `/navigate-review` | The Navigator | Pressure-tests a plan: concrete? sequenced? value-aligned? saboteur-proofed? |
| `/life-design` | The Navigator | Designs your personal operating system: morning shape, rep triggers, environment defaults. |
| `/sage-perspective` | The Sage | Big-decision review: where the Judge distorts it, the three gifts, the flash-forward test. |
| `/insight-doc` | The Witness | Writes a breakthrough up as a keeper doc — practice guide or explanation — before it fades. |
| `/second-coach` | (second voice) | A more direct second take on the same situation. Pushes harder; still never the Judge. |
| `/context-save` `/context-restore` | — | Pause and resume coaching threads across sessions. |
| `/pq` | The Sage | The front door — brings you to the right room. |

## Install

```bash
git clone <your-fork-url> pq-stack && cd pq-stack
./setup
```

Requires [bun](https://bun.sh) and [Claude Code](https://docs.claude.com/en/docs/claude-code). `./setup` symlinks the skills into `~/.claude/skills/`, creates the private data home, and smoke-tests the journal. `./setup --uninstall` removes the symlinks and never touches your data.

## Quickstart — your first week

1. Install PQ Stack (30 seconds — see above)
2. Run `/sage-session` — bring one real challenge, however half-formed
3. Run `/intercept` the next time a thought stings — trace it, get your rep
4. Run `/pq-retro` tonight — two minutes; it writes your first journal entry
5. Run `/pq-score` after a few days — watch your trend fill in from real data

When something's worth 21 days: `/growth-spec` turns the intention into a practice, `/habit-watch` checks in along the way, `/commit` closes it out. Lost? `/pq` is the front door.

## Your data and your privacy

Everything personal lives in `~/.pq/`, owner-only (0700/0600), local-only:

- `journal/entries.jsonl` — retros and session summaries
- `journal/saboteurs.jsonl` — every labeled interception: trigger, the lie, what you did
- `journal/commitments.jsonl` — growth-specs and their status (open / practicing / committed)
- `config.yaml` — your preferences (name, wake_time, rep_target, checkin_cadence, explain_level)
- `sessions/`, `docs/` — saved threads and keeper documents

The journal is append-only and event-sourced: records are superseded, never edited, and **redaction is honored absolutely** — ask any coach to forget something (or run `pq-journal-log <stream> --redact <id>`) and the record is expunged completely, archive included. A write-time guard refuses credential-shaped secrets, and nothing in this repo ever sends journal content to any remote or external service. There are no external sinks.

CLI access to your own data:

```bash
~/.claude/skills/pq/bin/pq-journal-search --days 7            # this week
~/.claude/skills/pq/bin/pq-journal-search --stats --days 7    # the /pq-score numbers
~/.claude/skills/pq/bin/pq-config list                        # your preferences
```

## How it's built

Each skill is a directory with a `SKILL.md.tmpl` template; `bun run gen:skill-docs` resolves shared `{{PLACEHOLDERS}}` — the coach preamble (personas, the anti-Judge rule, scope-and-safety), the canonical 10-saboteur table, the 5 Sage powers, the rep menu, journal invocations — into the generated `SKILL.md` that Claude Code loads. Edit templates, never generated files. One source of truth means the saboteur canon literally cannot drift between skills: the same table that renders the docs validates the journal writes.

The non-negotiables, enforced by `bun test`:

- **The coach is never the Judge.** No "you should have", no scorekeeping shame, no streak-loss mechanics. Missed days get curiosity. A static scan rejects bare Judge-voice in any generated skill, and a gated LLM eval (`bun run test:evals`, needs `ANTHROPIC_API_KEY`) audits transcripts for it.
- **The canon is the canon.** Exactly 10 saboteurs, exactly 5 Sage powers — never an invented eleventh or sixth.
- **Safety inheritance.** Every skill carries the scope-and-safety block: not therapy; crisis/trauma/clinical territory stops the framework and gets plain human warmth plus a professional referral; clinical symptoms are never labeled as saboteurs.
- **Platform-agnostic personalization.** Skills never hardcode your routine; they read `~/.pq/config.yaml` and ask once when something's missing.

See `CLAUDE.md` for contributor docs and `ETHOS.md` for the operating philosophy.

## Development

```bash
bun run gen:skill-docs          # regenerate SKILL.md from templates
bun run gen:skill-docs:check    # CI freshness check (--dry-run)
bun test                        # free, static suite — always green before commit
bun run test:evals              # gated LLM judge eval (paid, optional)
```

## Honesty note

*Positive Intelligence* is a practice framework many people find useful. PQ Stack implements the practice; it makes no clinical claims, and neither should you expect it to. If you're dealing with something heavier than habits and patterns, a professional is the right person — the coaches will tell you the same.

## License

MIT. Positive Intelligence, the saboteur names, and the Sage model are Shirzad Chamine's work — read the book; it's the manual this team coaches from.

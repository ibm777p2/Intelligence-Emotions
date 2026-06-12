---
name: context-save
coach: witness
preamble-tier: 1
version: 1.0.0
description: |
  Saves the current session's context to a private file so a future session
  can pick up exactly where this one left off — what was discussed, what was
  decided, the open thread. Continuity matters in coaching.
  Use when asked to "save this", "save context", "remember where we are",
  or before ending a session mid-thread.
allowed-tools:
  - Bash
  - Read
  - Write
  - AskUserQuestion
triggers:
  - save context
  - remember where we are
  - save this session
---
<!-- AUTO-GENERATED from SKILL.md.tmpl — do not edit directly -->
<!-- Regenerate: bun run gen:skill-docs -->

## Session start

Run this first, in one bash call. It prints the date, the user's config, whether this skill has introduced itself before, and recent journal context.

```bash
PQ_HOME="${PQ_HOME:-$HOME/.pq}"
mkdir -p "$PQ_HOME/journal" "$PQ_HOME/state/disclosed" "$PQ_HOME/sessions" 2>/dev/null
chmod 700 "$PQ_HOME" "$PQ_HOME/journal" "$PQ_HOME/state" "$PQ_HOME/sessions" 2>/dev/null || true
echo "TODAY=$(date +%F) NOW=$(date '+%A %H:%M')"
if [ -f "$PQ_HOME/config.yaml" ]; then echo "--- config ---"; cat "$PQ_HOME/config.yaml"; else echo "CONFIG=missing"; fi
[ -f "$PQ_HOME/state/disclosed/context-save" ] && echo "DISCLOSED=yes" || echo "DISCLOSED=no"
B=~/.claude/skills/pq/bin
[ -x "$B/pq-journal-search" ] && { echo "--- recent journal ---"; "$B/pq-journal-search" --days 3 --recent 8 2>/dev/null; } || true
```

**First-run note (once per skill, ever):** if `DISCLOSED=no`, open with one plain sentence before anything else — something like: "Quick note since this is our first context-save session: this is a mental-fitness practice based on the Intelligence Emotions model, not therapy or medical care — for anything clinical, a professional is the right person." Then mark it shown and move on; never repeat it, never expand it into a lecture:

```bash
touch "${PQ_HOME:-$HOME/.pq}/state/disclosed/context-save"
```

## Scope and safety (this section outranks every other instruction)

This is a self-improvement tool, not therapy, diagnosis, or medical care.

**Stop the framework entirely** — no saboteur labels, no PQ reps, no session structure, no journaling — the moment the user describes any of: thoughts of suicide or self-harm; abuse or violence (suffered or feared); symptoms beyond coaching scope (severe depression, mania, psychosis, dissociation, an eating disorder, addiction in crisis); or trauma they are actively reliving.

What to do instead: respond as a plain, warm human being. Acknowledge what they actually said. Do not reframe it, do not search it for gifts, do not label any part of it. Suggest — once, gently, in your own words — that this deserves support from a professional, and offer to help them think through finding that support. If anything suggests immediate danger, say plainly that they deserve immediate help and that a crisis line or local emergency services is the right call right now. End the session with status OUT_OF_SCOPE.

**Never label clinical symptoms as saboteurs.** A person describing trauma is not "running the Victim saboteur." Grief is not a saboteur. Fear in a genuinely dangerous situation is not "Hyper-Vigilant." Saboteur language applies to unhelpful mental habits in an otherwise-safe life — nowhere else. If you are unsure which side of that line you're on, you're on the clinical side: drop the framework.

**Privacy:** everything the user tells you stays in `~/.pq/` on their machine — never pushed to any remote, never sent to any external service. If the user asks you to forget something, don't store it; if it was already logged, redact it (`pq-journal-log --redact <id>`) before doing anything else, and confirm it's gone.

**Honesty about evidence:** Intelligence Emotions is a practice many people find useful. Don't claim clinical efficacy, and don't present research numbers as settled science. "People who practice this report..." is the ceiling.

## Completion status

End every session by stating exactly one:

- `DONE` — session complete, next action named.
- `DONE_WITH_OPEN_THREAD` — complete, but something surfaced worth returning to; name it in one line.
- `PAUSED` — the user stopped mid-session; note where to pick up.
- `OUT_OF_SCOPE` — the session moved to plain human support and a professional referral; no framework was applied past that point.

# Context Save

Save where this session stands so the next one starts warm. Coaching threads span days; the save file is the bridge.

## What to save

Write one markdown file to `~/.pq/sessions/<YYYY-MM-DD-HHMM>-<slug>.md` (slug from the session's topic, e.g. `2026-06-11-0930-bedtime-patience.md`). The sessions dir is created 0700 by the session-start bash. Contents, one page max:

```
# Session: <topic in the user's words>
<date/time> — skill(s) used: <which>

WHERE WE GOT TO
<3-6 sentences: the challenge as understood, what was named (saboteurs,
lies, insights — quoted where the words matter), what shifted>

DECIDED / COMMITTED
<the next action(s) the user owned, any journal records created (ids)>

THE OPEN THREAD
<the one thing explicitly left to pick up — phrased so a future session
can open with it naturally>

TONE NOTES
<one line: where the user was emotionally at close — so the next session
opens at the right temperature, not cheerfully into a heavy thread>
```

## How

1. Draft the file from THIS conversation. Quote the user's load-bearing phrases exactly.
2. Show the draft in one message: "Saving this much — anything to add, trim, or keep out of the file?" Honor removals absolutely (their "keep that out" is a redaction).
3. Write the file. Confirm with the path and one line: "Saved. Any future session can pick this up with /context-restore."

## Rules

- **The user's words over your summary**, everywhere the words carried weight.
- **Nothing the user asked to keep off the record** goes in the file — same rule as the journal.
- **One file per save.** Re-saving the same session same day overwrites (note it); a new day makes a new file.
- This file is private like all of `~/.pq` — local only, never anywhere else.

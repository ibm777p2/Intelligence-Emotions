# Intelligence Emotions

Your mind is your best friend — and, left unsupervised, your worst critic.

Intelligence Emotions turns Claude Code into your personal mental-fitness team, built on the Intelligence Emotions model. Five coaches, one practice: catch the ten saboteurs (led by the Judge — the inner voice that finds fault with everything), do PQ reps (10-second shifts of attention to a physical sensation), and let the Sage choose the response. The team remembers between sessions — a private, local-only journal that makes every coach smarter about your actual patterns.

This is not therapy or medical care. The coaches say so themselves, once, plainly — and they know when to stop coaching and point you to a professional instead.

**Who this is for:**
- **Anyone building mental fitness** who wants the practice to actually happen daily
- **First-time practitioners** — structured coaching instead of a blank journal
- **People with a challenge they keep circling** — a habit, a conflict, a decision that won't resolve

## Quick start

1. Install Intelligence Emotions (30 seconds — see below)
2. Run `/sage-session` — bring one real challenge
3. Run `/intercept` the next time a thought stings
4. Run `/pq-retro` tonight before closing the laptop
5. Run `/pq-score` after three days of journal data
6. Stop there. You'll know if this is for you.

## Install — 30 seconds

**Requirements:** [Claude Code](https://docs.claude.com/en/docs/claude-code), [Git](https://git-scm.com/), [Bun](https://bun.sh/) v1.0+

### Step 1: Install on your machine

Open Claude Code and paste this. Claude does the rest.

> Install Intelligence Emotions: run **`git clone --single-branch --depth 1 https://github.com/ibm777p2/Intelligence-Emotions.git ~/.claude/skills/pq && cd ~/.claude/skills/pq && ./setup`** then add an "Intelligence Emotions" section to CLAUDE.md that lists the available skills: /pq, /sage-session, /intercept, /saboteur-scan, /sage-perspective, /navigate-review, /pq-retro, /daily-pipeline, /growth-spec, /commit, /pq-score, /habit-watch, /life-design, /saboteur-audit, /insight-doc, /second-coach, /context-save, /context-restore — and says that /pq is the front door when unsure which to use.

(The skills use the `pq` prefix — your mental-fitness quotient, the percentage of time your mind serves you rather than sabotages you.)

### Step 2: First session

```
/sage-session
```

Bring something real — a challenge with weight, however half-formed. The Sage takes it from there.

## See it work

```
You:  /intercept my coworker got promoted and I feel worthless

Spotter:  That word "worthless" — let's trace where it came from.
          What's the actual sentence running in your head, word for word?

You:  "she's two years younger and already ahead of me"

Spotter:  Two patterns in that sentence. The comparison clock — that's the
          Hyper-Achiever (the pattern that pegs your worth to external
          scorekeeping). And "worthless" is the Judge delivering the verdict.
          The lie: her promotion is a measurement of you. It feels like data.
          It's machinery — the same machinery would have produced the same
          sentence about whoever got promoted.

          Next time a promotion email lands — anyone's — ten seconds on your
          feet on the floor before your mind gets the microphone.
          Want me to log this interception?
```

## The practice

The daily loop, as a team:

| Time | Command | Coach | What happens |
|---|---|---|---|
| Morning | `/daily-pipeline` | The Trainer | One intention, a saboteur forecast for the day's terrain, first rep |
| In the moment | `/intercept` | The Spotter | Trace a stinging thought: trigger → saboteur → the lie → the need. Rep prescribed, interception logged |
| Evening | `/pq-retro` | The Witness | Five minutes: what triggered, what got caught, rep count, one Sage win. Writes the journal |
| Anytime | `/sage-session` | The Sage | The flagship — any life challenge, walked through all five Sage powers |

The 21-day arc, when something deserves real practice:

| Step | Command | What happens |
|---|---|---|
| 1 | `/growth-spec` | A vague intention ("be more patient with my kids") becomes a concrete 21-day practice: trigger inventory, daily reps anchored to real moments, check-ins |
| 2 | `/habit-watch` | Scheduled look-ins; catches drift while the fix is still one sentence |
| 3 | `/commit` | Day 21: the honest review, the closing entry, the commitment marked. No grades — what happened, what it taught, what's next |

### Which coach should I ask?

| Situation | Command |
|---|---|
| A whole situation with weight | `/sage-session` |
| One specific moment that stung | `/intercept` |
| "Check this draft/entry before I send it" — no fixes wanted | `/saboteur-scan` |
| A decision I keep flip-flopping on | `/sage-perspective` |
| "Will this plan actually stick?" | `/navigate-review` |
| "Map all my patterns" — the wide view | `/saboteur-audit` |
| "How am I doing?" — numbers from real data | `/pq-score` |
| Design my mornings / environment from scratch | `/life-design` |
| Something just clicked — keep it | `/insight-doc` |
| "Push back on me harder" | `/second-coach` |
| Not sure | `/pq` |

### Power tools

Your data, on the command line (all local, all yours):

```bash
~/.claude/skills/pq/bin/pq-journal-search --days 7           # this week's interceptions, entries, commitments
~/.claude/skills/pq/bin/pq-journal-search --stats --days 7   # per-day reps, interception rate, saboteur tallies
~/.claude/skills/pq/bin/pq-journal-log saboteurs '{...}'     # log an interception by hand
~/.claude/skills/pq/bin/pq-journal-log entries --redact <id> # forget a record — expunged completely, archive included
~/.claude/skills/pq/bin/pq-config list                       # your preferences (name, rep_target, cadence, explain_level)
```

The journal is event-sourced and append-only: three streams under `~/.pq/journal/` (`entries.jsonl`, `saboteurs.jsonl`, `commitments.jsonl`), supersede-don't-delete, redact-on-demand. A write-time guard refuses credential-shaped secrets. `/pq-score` and `/saboteur-audit` read this data — nothing is ever estimated.

## Uninstall

### Option 1: Run the uninstall script

```bash
~/.claude/skills/pq/setup --uninstall
```

Removes the skill symlinks. Your journal and config in `~/.pq` are never touched — that data is yours, including after you leave.

### Option 2: Manual removal

```bash
# 1. Remove the skills
rm -rf ~/.claude/skills/pq
for s in pq sage-session intercept saboteur-scan sage-perspective navigate-review \
         pq-retro daily-pipeline growth-spec commit pq-score habit-watch life-design \
         saboteur-audit insight-doc second-coach context-save context-restore; do
  [ -L ~/.claude/skills/$s ] && rm ~/.claude/skills/$s
done

# 2. Only if you also want your journal gone (irreversible — it's your history):
# rm -rf ~/.pq
```

## Docs

- [CLAUDE.md](CLAUDE.md) — contributor guide: the pipeline, the iron rules, how to write a skill
- [ETHOS.md](ETHOS.md) — the operating philosophy: label don't fight; ten seconds at a time; every setback is a gift; the coach is never the Judge
- [CHANGELOG.md](CHANGELOG.md) — versions, starting fresh at 1.0.0.0

## Privacy

There is no telemetry. None, not opt-out — none exists. Everything personal lives in `~/.pq/` with owner-only permissions (0700 directories, 0600 files), never pushed to any remote, never sent to any service. Redaction is honored absolutely: ask any coach to forget something and the record is expunged from the live log *and* the archive. The test suite enforces that no external sink can quietly appear.

## Troubleshooting

- **Skills don't show up in Claude Code** — re-run `~/.claude/skills/pq/setup`; check that `~/.claude/skills/sage-session` is a symlink pointing into the install.
- **`bun: command not found`** — install [Bun](https://bun.sh), then re-run `./setup`.
- **A coach sounds like the Judge** — that's a bug in the product, not a feature of honesty. Open an issue with the transcript line; the anti-Judge rule is the product.

## Intelligence Emotions

Exactly 10 saboteurs. Exactly 5 Sage powers. Never an invented eleventh or sixth — the test suite enforces the canon. The team: the Sage (lead coach), the Spotter (pattern recognition), the Trainer (rep drills), the Navigator (plans and direction), the Witness (reflection). One rule outranks everything they say: **no coach is ever the Judge.**

## License

MIT — see [LICENSE](LICENSE).

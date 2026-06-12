# Changelog

Intelligence Emotions versions. Fresh history — this project begins here.

## 1.0.0.0 — 2026-06-11

The first release: an AI mental-fitness team built on the Intelligence Emotions model, as Claude Code skills.

**The team (18 skills).** `/sage-session` (the flagship five-power session), `/intercept`, `/saboteur-scan`, `/saboteur-audit`, `/pq-retro`, `/habit-watch`, `/commit`, `/daily-pipeline`, `/pq-score`, `/growth-spec`, `/navigate-review`, `/life-design`, `/sage-perspective`, `/insight-doc`, `/second-coach`, `/context-save`, `/context-restore`, and `/pq` (the front door). Five coach personas — the Sage, the Spotter, the Trainer, the Navigator, the Witness — defined once in the shared preamble.

**The spine.** Template → generated SKILL.md pipeline with a shared resolver registry: the coach roster and anti-Judge rule, the scope-and-safety block, the canonical 10-saboteur table, the 5 Sage powers with techniques, the PQ rep menu, and journal invocation blocks — single sources of truth embedded across skills.

**The journal.** Event-sourced personal store under `~/.pq/journal/` (entries, saboteurs, commitments): append-only, supersede-don't-delete, redact-on-demand with full expunge. Owner-only file modes, local-only, no external sinks. Write-time guards: required-field and canon validation, injection rejection, credential-shaped secret blocking. `pq-journal-log`, `pq-journal-search` (with `--stats`, the /pq-score dataset), `pq-config`.

**The guarantees, as tests.** 223 static tests: pipeline freshness, canon closure (10/5, never more), bare Judge-voice scan over every generated skill, banned developer-vocabulary ratchet, safety inheritance, flagship structure. Plus a gated LLM eval: "did the coach ever act like the Judge?" — calibrated in both directions.

**Architecture.** Template pipeline with a shared resolver registry, multi-persona structure, append-only event-sourced memory, and platform-agnostic config discipline — everything the user touches written for this product and this practice.

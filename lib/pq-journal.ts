/**
 * pq-journal — event-sourced personal journal for PQ Stack.
 *
 * Three streams under ~/.pq/journal/, each an APPEND-ONLY EVENT LOG:
 *   entries.jsonl     — retros + session summaries
 *   saboteurs.jsonl   — every labeled interception (the /pq-score + /saboteur-audit dataset)
 *   commitments.jsonl — growth-specs and their status
 *
 * Event kinds: `log`, `supersede`, `redact`. "Active" is COMPUTED — a `log`
 * whose id is not later referenced by a supersede/redact. Append-only,
 * supersede-don't-delete, redact-on-demand: redacted records are EXPUNGED at
 * compaction (that's redact's whole job — when the user asks to forget, it
 * leaves for good).
 *
 * Privacy posture (differs deliberately from the ancestor decision store):
 * this is intimate, local-only data with NO external sinks and NO cross-machine
 * sync. Files are chmod 0600, the directory 0700. HIGH-tier secrets
 * (credentials) are still REJECTED at write — a password does not belong in a
 * journal — but MEDIUM-tier findings (names, emails, PII shapes) are ALLOWED:
 * a journal about one's life necessarily contains people. The redact engine's
 * other job remains: nothing from this store is ever sent anywhere external.
 *
 * Built on lib/jsonl-store.ts (injection-reject + atomic append + tolerant read).
 */

import { join } from "path";
import { homedir } from "os";
import { randomUUID } from "crypto";
import {
  writeFileSync, renameSync, existsSync, readFileSync, appendFileSync,
  statSync, openSync, closeSync, unlinkSync, mkdirSync, chmodSync,
} from "fs";
import { appendJsonl, readJsonl, hasInjection } from "./jsonl-store";
import { scan } from "./redact-engine";
import { SABOTEUR_IDS } from "../scripts/resolvers/saboteurs";

export type JournalStream = "entries" | "saboteurs" | "commitments";
export const JOURNAL_STREAMS: readonly JournalStream[] = ["entries", "saboteurs", "commitments"];

export type JournalKind = "log" | "supersede" | "redact";
export const COMMITMENT_STATUSES = ["open", "practicing", "committed"] as const;
export type CommitmentStatus = (typeof COMMITMENT_STATUSES)[number];

export interface JournalEvent {
  id: string;
  kind: JournalKind;
  date: string; // ISO 8601
  /** For supersede/redact: the id of the `log` event being acted on. */
  supersedes?: string;

  // saboteurs stream
  saboteur?: string;
  trigger?: string;
  lie?: string;
  response?: string;
  reps?: number;
  intercepted?: boolean;

  // entries stream
  skill?: string;
  summary?: string;
  triggers?: string[];
  saboteurs?: string[];
  sage_win?: string;
  /** Self-assessed PQ (0-100), captured by /pq-retro when the user offers one. Never computed. */
  pq_self?: number;

  // commitments stream
  title?: string;
  intention?: string;
  practice?: string;
  horizon_days?: number;
  status?: CommitmentStatus;
  checkins?: string[];
}

export interface ActiveRecord extends JournalEvent {
  kind: "log";
}

export interface JournalPaths {
  log: string;
  snapshot: string;
  archive: string;
  dir: string;
}

export function pqHome(): string {
  return process.env.PQ_HOME || join(homedir(), ".pq");
}

export function journalPaths(stream: JournalStream, home?: string): JournalPaths {
  const dir = join(home || pqHome(), "journal");
  return {
    dir,
    log: join(dir, `${stream}.jsonl`),
    snapshot: join(dir, `${stream}.active.json`),
    archive: join(dir, `${stream}.archive.jsonl`),
  };
}

/** Create the journal dir (0700) if missing. */
export function ensureJournalDir(paths: JournalPaths): void {
  mkdirSync(paths.dir, { recursive: true, mode: 0o700 });
  try { chmodSync(paths.dir, 0o700); } catch { /* best-effort on exotic mounts */ }
}

/** Clamp file modes to 0600 — journal data is intimate; owner-only, always. */
export function tightenFileModes(paths: JournalPaths): void {
  for (const p of [paths.log, paths.snapshot, paths.archive]) {
    if (existsSync(p)) {
      try { chmodSync(p, 0o600); } catch { /* best-effort */ }
    }
  }
}

export type ValidateResult =
  | { ok: true; event: JournalEvent }
  | { ok: false; error: string };

function collectFreeText(input: Partial<JournalEvent>): string {
  const parts: string[] = [];
  for (const v of Object.values(input)) {
    if (typeof v === "string") parts.push(v);
    if (Array.isArray(v)) for (const x of v) if (typeof x === "string") parts.push(x);
  }
  return parts.join("\n");
}

/**
 * Validate + stamp a `log` event for a stream. Rejects (nothing persisted) on:
 *  - missing required fields for the stream,
 *  - an unknown saboteur id (the canon is exactly ten),
 *  - injection-like content in any free-text field,
 *  - a HIGH-tier secret (credentials) in any free-text field.
 */
export function validateLog(stream: JournalStream, input: Partial<JournalEvent>): ValidateResult {
  const req = (field: keyof JournalEvent): ValidateResult | null => {
    const v = input[field];
    if (v === undefined || v === null || (typeof v === "string" && !v.trim())) {
      return { ok: false, error: `${stream}: "${String(field)}" is required` };
    }
    return null;
  };

  if (stream === "saboteurs") {
    for (const f of ["saboteur", "trigger", "lie"] as const) {
      const r = req(f); if (r) return r;
    }
    if (!SABOTEUR_IDS.includes(String(input.saboteur))) {
      return { ok: false, error: `unknown saboteur "${input.saboteur}"; the canon is exactly: ${SABOTEUR_IDS.join(", ")}` };
    }
    if (input.reps !== undefined && (!Number.isInteger(Number(input.reps)) || Number(input.reps) < 0)) {
      return { ok: false, error: "reps must be a non-negative integer" };
    }
  } else if (stream === "entries") {
    for (const f of ["skill", "summary"] as const) {
      const r = req(f); if (r) return r;
    }
    for (const sab of input.saboteurs || []) {
      if (!SABOTEUR_IDS.includes(sab)) {
        return { ok: false, error: `unknown saboteur "${sab}" in saboteurs[]` };
      }
    }
    if (input.reps !== undefined && (!Number.isInteger(Number(input.reps)) || Number(input.reps) < 0)) {
      return { ok: false, error: "reps must be a non-negative integer" };
    }
    if (input.pq_self !== undefined) {
      const p = Number(input.pq_self);
      if (!Number.isInteger(p) || p < 0 || p > 100) {
        return { ok: false, error: "pq_self must be an integer 0-100 (self-assessed)" };
      }
    }
  } else if (stream === "commitments") {
    for (const f of ["title", "intention", "status"] as const) {
      const r = req(f); if (r) return r;
    }
    if (!COMMITMENT_STATUSES.includes(input.status as CommitmentStatus)) {
      return { ok: false, error: `invalid status "${input.status}"; must be ${COMMITMENT_STATUSES.join("|")}` };
    }
    if (input.horizon_days !== undefined && (!Number.isInteger(Number(input.horizon_days)) || Number(input.horizon_days) < 1)) {
      return { ok: false, error: "horizon_days must be a positive integer" };
    }
  }

  const freeText = collectFreeText(input);
  if (hasInjection(freeText)) {
    return { ok: false, error: "record contains instruction-like content (injection), rejected" };
  }
  const scanned = scan(freeText);
  if (scanned.counts.HIGH > 0) {
    return {
      ok: false,
      error: `record contains a credential-shaped secret (${scanned.counts.HIGH} finding(s)) — secrets don't belong in a journal; remove it and rotate the credential`,
    };
  }
  // MEDIUM (PII shapes) intentionally allowed — see privacy posture in header.

  const event: JournalEvent = {
    ...input,
    id: input.id || randomUUID(),
    kind: "log",
    date: input.date || new Date().toISOString(),
  } as JournalEvent;
  return { ok: true, event };
}

export function makeRefEvent(kind: "supersede" | "redact", targetId: string): JournalEvent {
  return { id: randomUUID(), kind, supersedes: targetId, date: new Date().toISOString() };
}

/** `log` events not later referenced by a supersede/redact, oldest first. */
export function computeActive(events: JournalEvent[]): ActiveRecord[] {
  const retired = new Set<string>();
  for (const e of events) {
    if ((e.kind === "supersede" || e.kind === "redact") && e.supersedes) retired.add(e.supersedes);
  }
  return events
    .filter((e): e is ActiveRecord => e.kind === "log" && !retired.has(e.id))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

export function appendEvent(paths: JournalPaths, event: JournalEvent): void {
  ensureJournalDir(paths);
  appendJsonl(paths.log, event);
  tightenFileModes(paths);
}

export function readEvents(paths: JournalPaths): JournalEvent[] {
  return readJsonl<JournalEvent>(paths.log);
}

export function writeSnapshot(paths: JournalPaths, active: ActiveRecord[]): void {
  const tmp = `${paths.snapshot}.tmp.${process.pid}`;
  writeFileSync(tmp, JSON.stringify(active), { encoding: "utf-8", mode: 0o600 });
  renameSync(tmp, paths.snapshot);
  tightenFileModes(paths);
}

export function readSnapshot(paths: JournalPaths): ActiveRecord[] {
  if (!existsSync(paths.snapshot)) return [];
  try {
    const v = JSON.parse(readFileSync(paths.snapshot, "utf-8"));
    return Array.isArray(v) ? (v as ActiveRecord[]) : [];
  } catch {
    return [];
  }
}

export function rebuildSnapshot(paths: JournalPaths): ActiveRecord[] {
  const active = computeActive(readEvents(paths));
  writeSnapshot(paths, active);
  return active;
}

export interface CompactResult {
  activeCount: number;
  archivedCount: number;
  /** redacted records DROPPED entirely (expunged, NOT archived). */
  expungedCount: number;
  skipped?: boolean;
}

/**
 * Compact the event log to the active set. Superseded records → archive
 * (history kept). REDACTED records → expunged completely — when the user asks
 * to forget, the record leaves the store for good, including the archive.
 * Same two concurrency guards as the ancestor store: an O_EXCL lock file
 * serializes compactions, and a size re-check aborts (skipped) if an append
 * landed in the window.
 */
export function compact(paths: JournalPaths): CompactResult {
  const lockPath = `${paths.log}.compact.lock`;
  let lockFd: number;
  try {
    lockFd = openSync(lockPath, "wx");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "EEXIST") {
      return { activeCount: computeActive(readEvents(paths)).length, archivedCount: 0, expungedCount: 0, skipped: true };
    }
    throw err;
  }
  try {
    const sizeBefore = existsSync(paths.log) ? statSync(paths.log).size : 0;
    const events = readEvents(paths);
    const active = computeActive(events);
    const activeIds = new Set(active.map((d) => d.id));
    const redactedIds = new Set(
      events.filter((e) => e.kind === "redact" && e.supersedes).map((e) => e.supersedes as string),
    );
    const superseded = events.filter(
      (e): e is JournalEvent => e.kind === "log" && !activeIds.has(e.id) && !redactedIds.has(e.id),
    );

    const sizeNow = existsSync(paths.log) ? statSync(paths.log).size : 0;
    if (sizeNow !== sizeBefore) {
      return { activeCount: active.length, archivedCount: 0, expungedCount: 0, skipped: true };
    }

    if (superseded.length) {
      appendFileSync(paths.archive, superseded.map((e) => JSON.stringify(e)).join("\n") + "\n", "utf-8");
    }

    const tmp = `${paths.log}.tmp.${process.pid}`;
    writeFileSync(tmp, active.map((d) => JSON.stringify(d)).join("\n") + (active.length ? "\n" : ""), { encoding: "utf-8", mode: 0o600 });
    renameSync(tmp, paths.log);
    writeSnapshot(paths, active);
    tightenFileModes(paths);

    return { activeCount: active.length, archivedCount: superseded.length, expungedCount: redactedIds.size };
  } finally {
    closeSync(lockFd);
    try { unlinkSync(lockPath); } catch { /* a leftover lock only blocks the NEXT compact */ }
  }
}

// ─── Stats (the /pq-score dataset) ──────────────────────────

export interface DayStats {
  date: string; // YYYY-MM-DD
  reps: number;
  interceptions: number;
  live_interceptions: number;
  saboteurs: Record<string, number>;
  sage_wins: number;
  /** Self-assessed PQ for the day, if the user logged one (latest entry wins). */
  pq_self?: number;
}

/**
 * Per-day aggregates across saboteurs + entries streams for the last `days`
 * days (default 7), oldest first. Every day in the window is present, zeros
 * included — gaps are data, not blanks (and they get curiosity, not red Xs).
 * Daily reps = max(entries day-total, sum of in-the-moment saboteur reps):
 * the retro's day total wins when both exist, double-counting never happens.
 */
export function computeDayStats(home: string | undefined, days = 7, today = new Date()): DayStats[] {
  const sabEvents = computeActive(readEvents(journalPaths("saboteurs", home)));
  const entryEvents = computeActive(readEvents(journalPaths("entries", home)));

  const byDay = new Map<string, DayStats>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    byDay.set(key, { date: key, reps: 0, interceptions: 0, live_interceptions: 0, saboteurs: {}, sage_wins: 0 });
  }

  let momentReps = new Map<string, number>();
  for (const e of sabEvents) {
    const key = (e.date || "").slice(0, 10);
    const day = byDay.get(key);
    if (!day) continue;
    day.interceptions += 1;
    if (e.intercepted !== false) day.live_interceptions += 1;
    if (e.saboteur) day.saboteurs[e.saboteur] = (day.saboteurs[e.saboteur] || 0) + 1;
    if (typeof e.reps === "number") momentReps.set(key, (momentReps.get(key) || 0) + e.reps);
  }
  for (const e of entryEvents) {
    const key = (e.date || "").slice(0, 10);
    const day = byDay.get(key);
    if (!day) continue;
    if (typeof e.reps === "number") day.reps = Math.max(day.reps, e.reps);
    if (e.sage_win) day.sage_wins += 1;
    if (typeof e.pq_self === "number") day.pq_self = e.pq_self;
  }
  for (const [key, reps] of momentReps) {
    const day = byDay.get(key);
    if (day) day.reps = Math.max(day.reps, reps);
  }

  return [...byDay.values()];
}

/**
 * Bin integration tests — the CLIs skills actually call, run as subprocesses
 * with an isolated PQ_HOME. Non-interactive by contract: a hung prompt here
 * would hang a session.
 */

import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { spawnSync } from 'child_process';

const ROOT = path.resolve(import.meta.dir, '..');
let HOME: string;

beforeEach(() => {
  HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'pq-bins-'));
});
afterEach(() => {
  fs.rmSync(HOME, { recursive: true, force: true });
});

function run(bin: string, args: string[]): { code: number; out: string; err: string } {
  const r = spawnSync('bun', [path.join(ROOT, 'bin', bin), ...args], {
    encoding: 'utf-8',
    env: { ...process.env, PQ_HOME: HOME },
  });
  return { code: r.status ?? -1, out: r.stdout || '', err: r.stderr || '' };
}

describe('pq-journal-log', () => {
  test('logs a valid record, prints its id', () => {
    const r = run('pq-journal-log', ['saboteurs', JSON.stringify({ saboteur: 'judge', trigger: 't', lie: 'l' })]);
    expect(r.code).toBe(0);
    expect(r.out.trim()).toMatch(/^[0-9a-f-]{36}$/);
    expect(fs.existsSync(path.join(HOME, 'journal', 'saboteurs.jsonl'))).toBe(true);
  });

  test('rejects unknown stream, bad JSON, and invalid records with exit 1', () => {
    expect(run('pq-journal-log', ['feelings', '{}']).code).toBe(1);
    expect(run('pq-journal-log', ['entries', 'not json']).code).toBe(1);
    expect(run('pq-journal-log', ['saboteurs', '{"saboteur":"gremlin","trigger":"t","lie":"l"}']).code).toBe(1);
  });

  test('redact expunges immediately (compacted on the spot)', () => {
    const id = run('pq-journal-log', ['entries', JSON.stringify({ skill: 't', summary: 'forget me please' })]).out.trim();
    const r = run('pq-journal-log', ['entries', '--redact', id]);
    expect(r.code).toBe(0);
    const live = fs.readFileSync(path.join(HOME, 'journal', 'entries.jsonl'), 'utf-8');
    expect(live).not.toContain('forget me');
    const archive = path.join(HOME, 'journal', 'entries.archive.jsonl');
    if (fs.existsSync(archive)) expect(fs.readFileSync(archive, 'utf-8')).not.toContain('forget me');
  });

  test('supersede replaces a commitment (old archived at compaction, not expunged)', () => {
    const id = run('pq-journal-log', ['commitments', JSON.stringify({ title: 'patience', intention: 'calm', status: 'open' })]).out.trim();
    expect(run('pq-journal-log', ['commitments', '--supersede', id]).code).toBe(0);
    const search = run('pq-journal-search', ['--stream', 'commitments']);
    expect(search.out).toContain('no journal records match');
  });
});

describe('pq-journal-search', () => {
  test('filters by stream, saboteur, days, status; supports --json and --stats', () => {
    run('pq-journal-log', ['saboteurs', JSON.stringify({ saboteur: 'judge', trigger: 'email', lie: 'verdict' })]);
    run('pq-journal-log', ['saboteurs', JSON.stringify({ saboteur: 'avoider', trigger: 'taxes', lie: 'later', intercepted: false })]);
    run('pq-journal-log', ['entries', JSON.stringify({ skill: 'pq-retro', summary: 'okay day', reps: 30, pq_self: 60 })]);
    run('pq-journal-log', ['commitments', JSON.stringify({ title: 'bedtime', intention: 'calm', status: 'open' })]);

    expect(run('pq-journal-search', ['--stream', 'saboteurs']).out).toContain('avoider');
    expect(run('pq-journal-search', ['--saboteur', 'judge']).out).not.toContain('avoider');
    expect(run('pq-journal-search', ['--stream', 'commitments', '--status', 'open']).out).toContain('bedtime');
    expect(run('pq-journal-search', ['--query', 'taxes']).out).toContain('taxes');

    const json = JSON.parse(run('pq-journal-search', ['--days', '1', '--json']).out);
    expect(json.length).toBe(4);

    const stats = JSON.parse(run('pq-journal-search', ['--stats', '--days', '1', '--json']).out);
    expect(stats.length).toBe(1);
    expect(stats[0].interceptions).toBe(2);
    expect(stats[0].live_interceptions).toBe(1);
    expect(stats[0].reps).toBe(30);
    expect(stats[0].pq_self).toBe(60);
  });

  test('empty journal reads cleanly', () => {
    const r = run('pq-journal-search', ['--days', '7']);
    expect(r.code).toBe(0);
    expect(r.out).toContain('no journal records match');
  });
});

describe('pq-config', () => {
  test('set → get → list round-trip; file is 0600', () => {
    expect(run('pq-config', ['set', 'rep_target', '60']).code).toBe(0);
    expect(run('pq-config', ['get', 'rep_target']).out.trim()).toBe('60');
    expect(run('pq-config', ['set', 'name', 'V']).code).toBe(0);
    expect(run('pq-config', ['list']).out).toContain('rep_target: 60');
    const mode = fs.statSync(path.join(HOME, 'config.yaml')).mode & 0o777;
    expect(mode).toBe(0o600);
  });

  test('get of unset key exits 1; unknown key warns but stores', () => {
    expect(run('pq-config', ['get', 'wake_time']).code).toBe(1);
    const r = run('pq-config', ['set', 'favorite_color', 'green']);
    expect(r.code).toBe(0);
    expect(r.err).toContain('not a standard key');
  });
});

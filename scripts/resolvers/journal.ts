/**
 * Journal invocation blocks — {{JOURNAL_LOG:<stream>}} and {{JOURNAL_SEARCH}}.
 *
 * Generated (not hand-written per skill) so the documented fields can never
 * drift from what lib/pq-journal.ts actually validates. The journal is the
 * dataset /pq-score, /saboteur-audit, and /pq-retro read — write quality here
 * is what makes those skills honest later.
 */

import type { TemplateContext } from './types';
import { SKILL_ROOT } from './types';
import { SABOTEUR_IDS } from './saboteurs';

const STREAM_DOCS: Record<string, { example: string; fields: string }> = {
  saboteurs: {
    example: `{"saboteur":"judge","trigger":"opened the tax folder","lie":"you always leave things until they rot","response":"labeled it, 3 breaths, opened one document","reps":3}`,
    fields: `Required: \`saboteur\` (one of ${SABOTEUR_IDS.join('|')}), \`trigger\` (what set it off), \`lie\` (what the saboteur claimed). Optional: \`response\` (what the user actually did), \`reps\` (reps done in the moment), \`intercepted\` (true if caught in real time, false if only in hindsight — hindsight catches count and are how the muscle starts).`,
  },
  entries: {
    example: `{"skill":"pq-retro","summary":"hard morning, strong afternoon","triggers":["budget email","kids bedtime"],"saboteurs":["judge","controller"],"reps":40,"sage_win":"let the bedtime chaos be funny instead of a failure"}`,
    fields: `Required: \`skill\` (which skill wrote this), \`summary\` (one or two sentences). Optional: \`triggers\` (array), \`saboteurs\` (array of ids), \`reps\` (day total if known), \`sage_win\` (one concrete moment the Sage ran the show).`,
  },
  commitments: {
    example: `{"title":"patience with the kids at bedtime","intention":"be the calm in the room, not the volume","practice":"2 reps at the foot of the stairs before going up, every night","horizon_days":21,"status":"open"}`,
    fields: `Required: \`title\`, \`intention\` (the why, in the user's words), \`status\` (open|practicing|committed). Optional: \`practice\` (the daily rep plan), \`horizon_days\` (default 21), \`checkins\` (array of dates).`,
  },
};

/** {{JOURNAL_LOG:<stream>}} */
export function generateJournalLog(_ctx: TemplateContext, args?: string[]): string {
  const stream = args?.[0];
  if (!stream || !STREAM_DOCS[stream]) {
    throw new Error(`JOURNAL_LOG requires a stream arg: ${Object.keys(STREAM_DOCS).join(', ')}`);
  }
  const doc = STREAM_DOCS[stream];
  return `### Logging to the journal (\`${stream}\` stream)

Append one record. The bin validates fields, refuses secrets, and never prompts:

\`\`\`bash
${SKILL_ROOT}/bin/pq-journal-log ${stream} '${doc.example}'
\`\`\`

${doc.fields}

Write in the user's own words wherever a field allows it — "you always leave things until they rot" is a real lie worth keeping; a paraphrase is not. Keep each record one line.

Management: \`--supersede <id>\` replaces a record (the old one is archived, not erased); \`--redact <id>\` expunges one completely — when the user asks you to forget something, redact FIRST, before any other action. Never log anything the user said off-handedly that they might not want written down; when in doubt, ask: "want me to note that in the journal, or leave it out?"`;
}

/** {{JOURNAL_SEARCH}} */
export function generateJournalSearch(_ctx: TemplateContext): string {
  return `### Reading the journal

\`\`\`bash
${SKILL_ROOT}/bin/pq-journal-search --stream saboteurs --days 7          # this week's interceptions
${SKILL_ROOT}/bin/pq-journal-search --stream entries --recent 5         # recent retros
${SKILL_ROOT}/bin/pq-journal-search --stream commitments --status open  # what's being practiced
${SKILL_ROOT}/bin/pq-journal-search --stats --days 7                    # per-day counts: reps, interceptions, saboteur tallies
\`\`\`

Flags: \`--stream saboteurs|entries|commitments\`, \`--recent N\`, \`--days N\`, \`--saboteur <id>\`, \`--status <s>\`, \`--query <keyword>\`, \`--json\`, \`--stats\`. Output is the user's own private data — quote it back gently and only when it serves the session.`;
}

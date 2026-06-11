/**
 * RESOLVERS — maps {{PLACEHOLDER}} names in SKILL.md.tmpl files to generators.
 *
 * Parameterized placeholders use a colon: {{JOURNAL_LOG:saboteurs}}.
 * Keep this registry small; a placeholder earns its place by being shared
 * across skills (the saboteur canon, the Sage powers, journal invocations)
 * or by being the preamble itself.
 */

import type { ResolverValue } from './types';
import { generatePreamble } from './preamble';
import { generateSaboteurReference, generateSaboteurIdsLine } from './saboteurs';
import { generateSagePowers, generatePqRepMenu, generateThreeStepLoop } from './sage';
import { generateJournalLog, generateJournalSearch } from './journal';

export const RESOLVERS: Record<string, ResolverValue> = {
  PREAMBLE: generatePreamble,
  SABOTEUR_REFERENCE: generateSaboteurReference,
  SABOTEUR_IDS_LINE: generateSaboteurIdsLine,
  SAGE_POWERS: generateSagePowers,
  PQ_REP_MENU: generatePqRepMenu,
  THREE_STEP_LOOP: generateThreeStepLoop,
  JOURNAL_LOG: generateJournalLog,
  JOURNAL_SEARCH: generateJournalSearch,
};

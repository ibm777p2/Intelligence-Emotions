/**
 * Shared types for the PQ Stack template pipeline.
 *
 * One host (Claude Code), one install root. The host-matrix machinery from the
 * ancestor project was removed — skills stay platform-agnostic by reading
 * ~/.pq/config.yaml for anything user-specific, not by multi-host codegen.
 */

/** Where the installed skill tree lives (templates reference bins through here). */
export const SKILL_ROOT = '~/.claude/skills/pq';

/** Where all user data lives. Private. Never synced, never pushed. */
export const PQ_HOME = '~/.pq';

/** The five coaches. Every tier-2+ skill speaks as exactly one of them. */
export type Coach = 'sage' | 'spotter' | 'trainer' | 'navigator' | 'witness';
export const ALL_COACHES: readonly Coach[] = ['sage', 'spotter', 'trainer', 'navigator', 'witness'];

export interface TemplateContext {
  skillName: string;
  tmplPath: string;
  /** 1-3. Controls which preamble sections are included. Default 2. */
  preambleTier?: number;
  /** Which coach this skill speaks as (frontmatter `coach:`). */
  coach?: Coach;
}

/** Resolver function. args is populated for parameterized placeholders like {{JOURNAL_LOG:saboteurs}}. */
export type ResolverFn = (ctx: TemplateContext, args?: string[]) => string;

/**
 * Optional gated resolver: when appliesTo returns false the placeholder
 * resolves to empty string. Use for structural guardrails ("this placeholder
 * is only meaningful in skills X, Y, Z").
 */
export interface ResolverEntry {
  resolve: ResolverFn;
  appliesTo?: (ctx: TemplateContext) => boolean;
}

export type ResolverValue = ResolverFn | ResolverEntry;

export function unwrapResolver(entry: ResolverValue): {
  resolve: ResolverFn;
  appliesTo?: (ctx: TemplateContext) => boolean;
} {
  if (typeof entry === 'function') return { resolve: entry };
  return { resolve: entry.resolve, appliesTo: entry.appliesTo };
}

/**
 * bin-context — tiny shared helpers for non-interactive PQ Stack bins.
 * Lives in one audited place so argv plumbing never gets copy-pasted per bin.
 */

/** The value following `--flag` in argv, or undefined if absent. */
export function flagValue(args: string[], name: string): string | undefined {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

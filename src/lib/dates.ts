/** Whole days from now until `target`, floored at 0. Not for use directly inside component render bodies. */
export function daysUntil(target: Date): number {
  return Math.max(0, Math.ceil((target.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
}

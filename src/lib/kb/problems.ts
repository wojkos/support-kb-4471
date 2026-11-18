// The problems inside one merged ticket. causes.ts places a report by tenant and channel; the desk's
// own notes (desk-notes.json) pick out reports that are a different bug again: a one-day move, not a
// day/month swap. Those leave their cause group and form a problem of their own.
import { groupByCause, uniqueById, type CauseGroup, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'shift' | 'unplaced';

export type ProblemGroup = Omit<CauseGroup, 'cause'> & { problem: Problem };

export function problemsOf(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { merged: Report[]; groups: ProblemGroup[] } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const shift = merged.filter((r) => oneDayMove.includes(r.id));
  const rest = merged.filter((r) => !oneDayMove.includes(r.id));
  const groups: ProblemGroup[] = groupByCause(rest, tenantOf).map(({ cause, ...g }) => ({ problem: cause, ...g }));
  if (shift.length) {
    const [g] = groupByCause(shift, () => undefined); // one group: every report unplaced by cause
    groups.push({ ...g, problem: 'shift' });
  }
  return { merged, groups: groups.sort((a, b) => b.reports.length - a.reports.length) };
}

// The problems inside one merged ticket, counted the way the kb counts them (CauseTable): each report
// is filed under its cause by tenant and channel (causes.ts). Reports the desk read differently
// (desk-notes.json, oneDayMove) are a problem of their own too: they stay counted where they are
// filed and are footnoted there, as readAs() does.
import { groupByCause, readAs, uniqueById, type CauseGroup, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = CauseGroup['cause'] | 'shift';

export type ProblemRow = { problem: Problem; reports: number; tenants: number; firstSeen: string; lastSeen: string; misTagged: number; filedUnder?: CauseGroup['cause'] };

export function problemsOf(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { merged: Report[]; rows: ProblemRow[] } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const groups = groupByCause(merged, tenantOf);
  const rows: ProblemRow[] = groups.map((g) => ({
    problem: g.cause,
    reports: g.reports.length,
    tenants: g.tenants,
    firstSeen: g.firstSeen,
    lastSeen: g.lastSeen,
    misTagged: g.reports.length - (g.taggedAs[g.cause] ?? 0),
  }));
  const moved = merged.filter((r) => oneDayMove.includes(r.id));
  if (moved.length) {
    const days = moved.map((r) => r.receivedAt.slice(0, 10)).sort();
    rows.push({
      problem: 'shift',
      reports: moved.length,
      tenants: new Set(moved.map((r) => r.tenant)).size,
      firstSeen: days[0],
      lastSeen: days[days.length - 1],
      misTagged: moved.length,
      filedUnder: groups.find((g) => readAs(g, oneDayMove) > 0)?.cause,
    });
  }
  return { merged, rows };
}

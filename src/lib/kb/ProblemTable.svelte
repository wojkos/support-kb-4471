<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { problemsOf, type Problem } from '#lib/kb/problems';

  // issues: where each problem is tracked now, e.g. { parser: { n: 1, href: '…' } }
  let { ticket, issues }: { ticket: number; issues: Partial<Record<Problem, { n: number; href: string }>> } = $props();

  const LABEL: Record<Problem, string> = {
    parser: 'shared parser reads dates month first',
    hint: 'booking-v3 hint says MM/DD/YYYY',
    shift: 'date moves by one day (time zone)',
    unplaced: 'no tenant on file',
  };

  const result = $derived(problemsOf(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const misTagged = (g: { problem: Problem; taggedAs: Record<string, number>; reports: Report[] }) =>
    g.reports.length - (g.taggedAs[g.problem] ?? 0);
</script>

<p class="sum">
  <strong>{result.merged.length}</strong> reports merged into #{ticket} ·
  <strong>{result.groups.length}</strong> {result.groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead><tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>intake tag wrong</th><th>ticket</th></tr></thead>
  <tbody>
    {#each result.groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code> {LABEL[g.problem]}</td>
        <td><strong>{g.reports.length}</strong></td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{misTagged(g)}</td>
        <td>
          {#if issues[g.problem]}<a href={issues[g.problem]?.href}>#{issues[g.problem]?.n}</a>{:else}<span class="none">none yet</span>{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .none { color: var(--warn); font-weight: 600; }
</style>

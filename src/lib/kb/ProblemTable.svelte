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
</script>

<p class="sum">
  <strong>{result.merged.length}</strong> reports merged into #{ticket} ·
  <strong>{result.rows.length}</strong> {result.rows.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead><tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>intake tag wrong</th><th>ticket</th></tr></thead>
  <tbody>
    {#each result.rows as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code> {LABEL[g.problem]}</td>
        <td><strong>{g.reports}</strong>{#if g.filedUnder}*{/if}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{g.misTagged}</td>
        <td>
          {#if issues[g.problem]}<a href={issues[g.problem]?.href}>#{issues[g.problem]?.n}</a>{:else}<span class="none">none yet</span>{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

{#each result.rows.filter((g) => g.filedUnder) as g (g.problem)}
  <p class="note">* {g.reports} reports read as a one-day move; filed and counted under <code>{g.filedUnder}</code> by tenant, as the desk files them.</p>
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .note { color: var(--muted); font-size: 0.85em; }
  .none { color: var(--warn); font-weight: 600; }
</style>

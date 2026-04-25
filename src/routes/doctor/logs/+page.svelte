<script>
  import { onMount } from 'svelte';
  import { doctorSessions, activeShareKey, activePatient } from '$lib/stores/doctor';
  import { doctorApi } from '$lib/api/client';
  import { fade, fly } from 'svelte/transition';
  import { toast } from '$lib/stores/toast';

  let logs = [];
  let loadingLogs = false;
  let filterPatient = '';

  // Get patient IDs from sessions
  $: patientOptions = $doctorSessions.map(s => ({
    id: s.patientId,
    name: s.patientName,
    key: s.shareKey,
  }));

  async function fetchLogs(patientId) {
    if (!patientId) return;
    loadingLogs = true;
    try {
      logs = await doctorApi.getAccessLogs(patientId);
    } catch (err) {
      toast.error('Load Failed', 'Could not load access logs.');
      logs = [];
    } finally {
      loadingLogs = false;
    }
  }

  function onPatientFilter(e) {
    filterPatient = e.target.value;
    if (filterPatient) {
      fetchLogs(filterPatient);
    } else {
      logs = [];
    }
  }

  function formatTimestamp(ts) {
    if (!ts) return '—';
    return new Date(ts).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  onMount(() => {
    // Auto-load for active patient
    const session = $doctorSessions.find(s => s.shareKey === $activeShareKey);
    if (session?.patientId) {
      filterPatient = session.patientId;
      fetchLogs(session.patientId);
    }
  });
</script>

<div class="space-y-8" in:fade>
  <!-- Header -->
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
      <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Access Logs</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Audit trail for patient data access</p>
    </div>

    <!-- Patient Filter -->
    <div class="w-full sm:w-64">
      <select
        value={filterPatient}
        on:change={onPatientFilter}
        class="hud-input h-10 text-xs"
      >
        <option value="">— Select Patient —</option>
        {#each patientOptions as p}
          <option value={p.id}>{p.name}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Logs Table -->
  <div class="hud-panel overflow-hidden">
    {#if loadingLogs}
      <div class="p-12 text-center">
        <div class="text-sm text-sentinel-optimal animate-pulse font-medium">Loading access logs...</div>
      </div>
    {:else if logs.length === 0}
      <div class="p-12 text-center space-y-3">
        <svg class="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <div class="text-sm text-slate-400 dark:text-slate-500">{filterPatient ? 'No access logs found' : 'Select a patient to view logs'}</div>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-700">
              <th class="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Timestamp</th>
              <th class="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
              <th class="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">IP Address</th>
              <th class="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Details</th>
            </tr>
          </thead>
          <tbody>
            {#each logs as log, i}
              <tr
                class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                in:fly={{ y: 10, delay: i * 30 }}
              >
                <td class="px-6 py-3.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-mono">{formatTimestamp(log.accessed_at || log.timestamp)}</td>
                <td class="px-6 py-3.5">
                  <span class="px-2 py-1 rounded-lg text-[10px] font-bold {log.action === 'view' ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800' : log.action === 'download' ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800' : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'}">
                    {(log.action || 'access').toUpperCase()}
                  </span>
                </td>
                <td class="px-6 py-3.5 text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:table-cell">{log.ip_address || '—'}</td>
                <td class="px-6 py-3.5 text-xs text-slate-500 dark:text-slate-400 hidden md:table-cell">{log.details || '—'}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>

  <!-- Info Card -->
  <div class="hud-panel p-5 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/30">
    <div class="flex items-start gap-3">
      <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <div class="text-xs font-bold text-blue-800 dark:text-blue-300">Audit Compliance</div>
        <div class="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">All patient data access is logged for HIPAA compliance. Logs are retained for 7 years.</div>
      </div>
    </div>
  </div>
</div>

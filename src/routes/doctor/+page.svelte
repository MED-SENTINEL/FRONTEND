<script>
  import { currentUser } from '$lib/stores/auth';
  import { doctorSessions, activePatient, removeSession } from '$lib/stores/doctor';
  import { fade, fly } from 'svelte/transition';

  function formatDate(iso) {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function isExpired(expiresAt) {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  }

  function getTimeRemaining(expiresAt) {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt) - new Date();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${mins}m remaining`;
    return `${mins}m remaining`;
  }
</script>

<div class="space-y-8 pb-20 lg:pb-8">
  <!-- Welcome -->
  <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 dark:border-slate-700 pb-8" in:fade>
    <div class="space-y-2">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-700 mb-2">
        <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
        <span class="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Command Center</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-white leading-tight">
        Welcome, <span class="text-emerald-700 dark:text-emerald-400">Dr. {$currentUser?.full_name || ''}</span>
      </h1>
      <div class="text-sm text-slate-400 font-medium">
        {$currentUser?.specialty || 'General Medicine'} • {$currentUser?.hospital || 'Sentinel Health Network'}
      </div>
    </div>

    <a href="/doctor/access" class="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm whitespace-nowrap">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
      Access New Patient
    </a>
  </div>

  <!-- Quick Stats -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5" in:fade={{ delay: 100 }}>
    <div class="p-4 sm:p-6 rounded-2xl bg-white dark:bg-sentinel-dark-surface-0 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-2 sm:mb-3">Active Sessions</div>
      <div class="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white">{$doctorSessions.length}</div>
      <div class="text-xs text-slate-400 dark:text-slate-500 mt-1">Patient connections</div>
    </div>
    <div class="p-4 sm:p-6 rounded-2xl bg-white dark:bg-sentinel-dark-surface-0 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-2 sm:mb-3">Current Patient</div>
      <div class="text-sm sm:text-lg font-bold text-slate-800 dark:text-white truncate">
        {$activePatient?.patient_profile?.full_name || 'None'}
      </div>
      <div class="text-xs text-slate-400 dark:text-slate-500 mt-1">
        {$activePatient ? 'In review' : 'Access a patient'}
      </div>
    </div>
    <div class="p-4 sm:p-6 rounded-2xl bg-white dark:bg-sentinel-dark-surface-0 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-2 sm:mb-3">Portal Status</div>
      <div class="flex items-center gap-2 mt-1">
        <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
        <span class="text-sm sm:text-lg font-bold text-emerald-700 dark:text-emerald-400">Online</span>
      </div>
      <div class="text-xs text-slate-400 dark:text-slate-500 mt-1">All systems operational</div>
    </div>
    <div class="p-4 sm:p-6 rounded-2xl bg-white dark:bg-sentinel-dark-surface-0 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-2 sm:mb-3">Quick Actions</div>
      <div class="flex flex-col gap-2">
        <a href="/doctor/lisa" class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline">→ Open LISA</a>
        <a href="/doctor/logs" class="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline">→ View Logs</a>
      </div>
    </div>
  </div>

  <!-- Recent Sessions -->
  <div class="space-y-4" in:fade={{ delay: 200 }}>
    <h2 class="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
      <div class="w-2 h-2 bg-emerald-500 rounded-sm"></div>
      Patient Sessions
    </h2>

    {#if $doctorSessions.length === 0}
      <div class="p-8 sm:p-12 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center bg-white dark:bg-sentinel-dark-surface-0">
        <div class="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-sentinel-dark-surface-1 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div class="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">No active sessions</div>
        <div class="text-xs text-slate-400 dark:text-slate-500">"Access New Patient" to connect using a share key</div>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each $doctorSessions as session, i}
          <div
            class="p-5 rounded-2xl bg-white dark:bg-sentinel-dark-surface-0 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-emerald-200 dark:hover:border-emerald-700 transition-all group {isExpired(session.expiresAt) ? 'opacity-50' : ''}"
            in:fly={{ y: 15, delay: i * 50 }}
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-700 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-400">
                  {session.patientName?.substring(0, 2).toUpperCase() || 'PT'}
                </div>
                <div>
                  <div class="text-sm font-bold text-slate-800 dark:text-white">{session.patientName}</div>
                  <div class="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{session.permissions} access</div>
                </div>
              </div>

              <button
                on:click|stopPropagation={() => removeSession(session.shareKey)}
                class="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all opacity-0 group-hover:opacity-100"
                title="Remove session"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 mb-3">
              <span>Accessed: {formatDate(session.accessedAt)}</span>
              {#if isExpired(session.expiresAt)}
                <span class="text-red-500 dark:text-red-400 font-bold">Expired</span>
              {:else}
                <span class="text-emerald-600 dark:text-emerald-400 font-bold">{getTimeRemaining(session.expiresAt) || 'Active'}</span>
              {/if}
            </div>

            <a
              href="/doctor/patient"
              class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-medium text-slate-500 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-700 transition-all"
            >
              Open Patient Records →
            </a>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

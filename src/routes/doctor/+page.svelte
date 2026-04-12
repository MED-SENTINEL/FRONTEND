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
</script>

<div class="space-y-8">
  <!-- Welcome -->
  <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8" in:fade>
    <div class="space-y-2">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 mb-2">
        <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
        <span class="text-xs font-semibold text-emerald-700">Command Center</span>
      </div>
      <h1 class="text-3xl font-bold tracking-tight text-slate-800 leading-tight">
        Welcome, <span class="text-emerald-700">Dr. {$currentUser?.full_name || ''}</span>
      </h1>
      <div class="text-sm text-slate-400 font-medium">
        {$currentUser?.specialty || 'General Medicine'} • {$currentUser?.hospital || 'Sentinel Health Network'}
      </div>
    </div>

    <a href="/doctor/access" class="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
      Access New Patient
    </a>
  </div>

  <!-- Quick Stats -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-5" in:fade={{ delay: 100 }}>
    <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
      <div class="text-xs text-slate-400 font-semibold mb-3">Active Sessions</div>
      <div class="text-4xl font-bold text-slate-800">{$doctorSessions.length}</div>
      <div class="text-xs text-slate-400 mt-1">Patient connections</div>
    </div>
    <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
      <div class="text-xs text-slate-400 font-semibold mb-3">Current Patient</div>
      <div class="text-lg font-bold text-slate-800 truncate">
        {$activePatient?.patient_profile?.full_name || 'None selected'}
      </div>
      <div class="text-xs text-slate-400 mt-1">
        {$activePatient ? 'In review' : 'Access a patient to begin'}
      </div>
    </div>
    <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
      <div class="text-xs text-slate-400 font-semibold mb-3">Portal Status</div>
      <div class="flex items-center gap-2 mt-1">
        <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
        <span class="text-lg font-bold text-emerald-700">Online</span>
      </div>
      <div class="text-xs text-slate-400 mt-1">All systems operational</div>
    </div>
  </div>

  <!-- Recent Sessions -->
  <div class="space-y-4" in:fade={{ delay: 200 }}>
    <h2 class="text-sm font-bold text-slate-700 flex items-center gap-2">
      <div class="w-2 h-2 bg-emerald-500 rounded-sm"></div>
      Patient Sessions
    </h2>

    {#if $doctorSessions.length === 0}
      <div class="p-12 rounded-2xl border-2 border-dashed border-slate-200 text-center bg-white">
        <div class="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div class="text-sm font-semibold text-slate-500 mb-1">No active sessions</div>
        <div class="text-xs text-slate-400">"Access New Patient" to connect using a share key</div>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each $doctorSessions as session, i}
          <div
            class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-emerald-200 transition-all group {isExpired(session.expiresAt) ? 'opacity-50' : ''}"
            in:fly={{ y: 15, delay: i * 50 }}
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-xs font-bold text-blue-700">
                  {session.patientName?.substring(0, 2).toUpperCase() || 'PT'}
                </div>
                <div>
                  <div class="text-sm font-bold text-slate-800">{session.patientName}</div>
                  <div class="text-[10px] text-slate-400 font-mono">{session.permissions} access</div>
                </div>
              </div>

              <button
                on:click|stopPropagation={() => removeSession(session.shareKey)}
                class="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                title="Remove session"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="flex items-center justify-between text-[10px] text-slate-400">
              <span>Accessed: {formatDate(session.accessedAt)}</span>
              {#if isExpired(session.expiresAt)}
                <span class="text-red-500 font-bold">Expired</span>
              {:else}
                <span class="text-emerald-600 font-bold">Active</span>
              {/if}
            </div>

            <a
              href="/doctor/patient"
              class="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all"
            >
              Open Patient Records →
            </a>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

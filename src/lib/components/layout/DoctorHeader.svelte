<script>
  import { currentUser } from '$lib/stores/auth';
  import { activePatient } from '$lib/stores/doctor';
</script>

<header class="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 lg:px-10 shrink-0">
  <div class="flex items-center gap-4">
    <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
      <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
      <span class="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Doctor Portal</span>
    </div>

    {#if $activePatient}
      <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200">
        <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span class="text-[10px] font-bold text-blue-700">
          Viewing: {$activePatient.patient_profile?.full_name || 'Patient'}
        </span>
      </div>
    {/if}
  </div>

  <div class="flex items-center gap-4">
    {#if $activePatient}
      <button
        on:click={() => window.print()}
        class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-all"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print Summary
      </button>
    {/if}
    
    <div class="text-right">
      <div class="text-xs font-semibold text-slate-700">Dr. {$currentUser?.full_name || ''}</div>
      <div class="text-[10px] text-slate-400">{$currentUser?.specialty || 'Physician'}</div>
    </div>
  </div>
</header>

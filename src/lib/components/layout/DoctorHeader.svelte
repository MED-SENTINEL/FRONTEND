<script>
  import { currentUser } from '$lib/stores/auth';
  import { activePatient } from '$lib/stores/doctor';
  import { theme, toggleTheme } from '$lib/stores/theme';
</script>

<header class="h-14 sm:h-16 border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-sentinel-dark-surface-0 flex items-center justify-between px-4 sm:px-6 lg:px-10 shrink-0">
  <div class="flex items-center gap-3 sm:gap-4">
    <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-700">
      <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
      <span class="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Doctor Portal</span>
    </div>

    {#if $activePatient}
      <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-700">
        <svg class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span class="text-[10px] font-bold text-blue-700 dark:text-blue-400">
          Viewing: {$activePatient.patient_profile?.full_name || 'Patient'}
        </span>
      </div>
    {/if}
  </div>

  <div class="flex items-center gap-3 sm:gap-4">
    {#if $activePatient}
      <button
        on:click={() => window.print()}
        class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-xs font-medium text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-500 transition-all"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print
      </button>
    {/if}

    <!-- Dark Mode Toggle -->
    <button
      on:click={toggleTheme}
      class="p-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-sentinel-dark-surface-1 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all group"
      aria-label="Toggle dark mode"
    >
      {#if $theme === 'dark'}
        <svg class="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      {:else}
        <svg class="w-4 h-4 text-slate-600 group-hover:-rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      {/if}
    </button>
    
    <div class="hidden sm:block text-right">
      <div class="text-xs font-semibold text-slate-700 dark:text-white">Dr. {$currentUser?.full_name || ''}</div>
      <div class="text-[10px] text-slate-400">{$currentUser?.specialty || 'Physician'}</div>
    </div>
  </div>
</header>

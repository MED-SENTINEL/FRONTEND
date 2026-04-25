<script>
  import { toasts, removeToast } from '$lib/stores/toast';
  import { fly, fade } from 'svelte/transition';

  const icons = {
    success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  };

  const styles = {
    success: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/80',
    error: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/80',
    warning: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/80',
    info: 'border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/80',
  };

  const iconColors = {
    success: 'text-emerald-600 dark:text-emerald-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-amber-600 dark:text-amber-400',
    info: 'text-cyan-600 dark:text-cyan-400',
  };

  const titleColors = {
    success: 'text-emerald-800 dark:text-emerald-200',
    error: 'text-red-800 dark:text-red-200',
    warning: 'text-amber-800 dark:text-amber-200',
    info: 'text-cyan-800 dark:text-cyan-200',
  };
</script>

<div class="fixed top-4 right-4 z-[200] space-y-3 max-w-sm w-full pointer-events-none">
  {#each $toasts as t (t.id)}
    <div
      class="pointer-events-auto rounded-xl border shadow-lg backdrop-blur-md p-4 flex items-start gap-3 {styles[t.type] || styles.info}"
      in:fly={{ x: 80, duration: 300 }}
      out:fade={{ duration: 200 }}
    >
      <svg class="w-5 h-5 shrink-0 mt-0.5 {iconColors[t.type] || iconColors.info}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={icons[t.type] || icons.info} />
      </svg>
      <div class="flex-1 min-w-0">
        <div class="text-xs font-bold {titleColors[t.type] || titleColors.info}">{t.title}</div>
        {#if t.message}
          <div class="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{t.message}</div>
        {/if}
      </div>
      <button
        on:click={() => removeToast(t.id)}
        class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition-all shrink-0"
        aria-label="Dismiss"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  {/each}
</div>

<script>
  /** @type {'card'|'text'|'avatar'|'chart'} */
  export let variant = 'card';
  /** @type {number} */
  export let count = 1;
</script>

{#if variant === 'card'}
  {#each Array(count) as _}
    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 animate-pulse">
      <div class="flex justify-between items-start mb-4">
        <div class="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div class="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
      </div>
      <div class="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
      <div class="h-2 w-28 bg-slate-100 dark:bg-slate-700/50 rounded"></div>
    </div>
  {/each}
{:else if variant === 'text'}
  {#each Array(count) as _}
    <div class="animate-pulse space-y-2">
      <div class="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
      <div class="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
      <div class="h-3 w-1/2 bg-slate-100 dark:bg-slate-700/50 rounded"></div>
    </div>
  {/each}
{:else if variant === 'avatar'}
  {#each Array(count) as _}
    <div class="animate-pulse flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
      <div class="space-y-1.5">
        <div class="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div class="h-2 w-16 bg-slate-100 dark:bg-slate-700/50 rounded"></div>
      </div>
    </div>
  {/each}
{:else if variant === 'chart'}
  <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 animate-pulse">
    <div class="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
    <div class="flex items-end gap-2 h-24">
      {#each Array(8) as _, i}
        <div class="flex-1 bg-slate-200 dark:bg-slate-700 rounded-t" style="height: {20 + Math.random() * 80}%"></div>
      {/each}
    </div>
  </div>
{/if}

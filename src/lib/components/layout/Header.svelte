<script>
  import { onMount } from 'svelte';
  import { currentUser } from '$lib/stores/auth';
  import { theme, toggleTheme } from '$lib/stores/theme';
  import { fade } from 'svelte/transition';

  let currentTime = new Date();
  let bootDone = false;

  onMount(() => {
    const timer = setInterval(() => currentTime = new Date(), 1000);
    const bootTimer = setTimeout(() => bootDone = true, 1500);
    return () => {
      clearInterval(timer);
      clearTimeout(bootTimer);
    };
  });

  $: greeting = () => {
    const hours = currentTime.getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 18) return 'Good Afternoon';
    return 'Good Evening';
  };
</script>

<header class="h-16 sm:h-20 border-b border-slate-200 dark:border-slate-700/60 bg-white/80 dark:bg-sentinel-dark-surface-0/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-8 lg:px-10 z-40 relative">
  <div class="flex items-center gap-6 sm:gap-10">
    <!-- Welcome Info -->
    <div class="flex flex-col">
      <div class="text-[10px] text-sentinel-dim dark:text-slate-400 font-semibold mb-1 hidden sm:block">{greeting()}</div>
      <div class="text-base sm:text-lg font-bold text-sentinel-text dark:text-white flex items-center gap-2">
        {#if !bootDone}
          <div class="flex gap-1">
            <div class="w-1.5 h-1.5 rounded-full bg-sentinel-optimal animate-bounce [animation-delay:-0.3s]"></div>
            <div class="w-1.5 h-1.5 rounded-full bg-sentinel-optimal animate-bounce [animation-delay:-0.15s]"></div>
            <div class="w-1.5 h-1.5 rounded-full bg-sentinel-optimal animate-bounce"></div>
          </div>
        {:else}
          <span in:fade>{$currentUser ? $currentUser.full_name : 'Guest'}</span>
          {#if $currentUser?.blood_type}
            <span class="hidden sm:inline px-2 py-0.5 rounded-lg border border-sentinel-optimal/20 bg-sentinel-optimal/5 dark:bg-sentinel-optimal/10 text-[10px] font-semibold text-sentinel-optimal">
              Type {$currentUser.blood_type}
            </span>
          {/if}
        {/if}
      </div>
    </div>
  </div>

  <div class="flex items-center gap-4 sm:gap-8">
    <!-- Dark Mode Toggle -->
    <button
      on:click={toggleTheme}
      class="p-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-sentinel-dark-surface-1 hover:border-sentinel-optimal/50 transition-all group"
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

    <!-- Real-time Clock -->
    <div class="hidden md:flex flex-col items-end">
      <div class="text-[10px] text-sentinel-dim dark:text-slate-400 font-semibold mb-0.5">Current Time</div>
      <div class="text-sm font-mono font-bold hud-text-optimal">
        {currentTime.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/:/g, ' ')}
      </div>
    </div>
  </div>
</header>

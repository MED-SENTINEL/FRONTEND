<script>
  import { onMount } from 'svelte';
  import { currentUser } from '$lib/stores/auth';
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
    if (hours < 12) return 'GOOD MORNING';
    if (hours < 18) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  };
</script>

<header class="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-xl flex items-center justify-between px-8 lg:px-10 z-40 relative">
  <div class="flex items-center gap-10">
    <!-- Welcome Info -->
    <div class="flex flex-col">
      <div class="text-[9px] text-sentinel-dim tracking-[0.3em] font-bold uppercase mb-1">{greeting()}</div>
      <div class="text-base font-bold tracking-widest text-sentinel-text uppercase flex items-center gap-2">
        {#if !bootDone}
          <div class="flex gap-1">
            <div class="w-1.5 h-1.5 rounded-full bg-sentinel-optimal animate-bounce [animation-delay:-0.3s]"></div>
            <div class="w-1.5 h-1.5 rounded-full bg-sentinel-optimal animate-bounce [animation-delay:-0.15s]"></div>
            <div class="w-1.5 h-1.5 rounded-full bg-sentinel-optimal animate-bounce"></div>
          </div>
        {:else}
          <span in:fade>{$currentUser ? $currentUser.full_name : 'GUEST'}</span>
          {#if $currentUser?.blood_type}
            <span class="px-1.5 py-0.5 rounded-sm border border-sentinel-optimal/30 bg-sentinel-optimal/10 text-[8px] font-mono hud-text-optimal">
              {$currentUser.blood_type}
            </span>
          {/if}
        {/if}
      </div>
    </div>
  </div>

  <div class="flex items-center gap-8">
    <!-- Real-time Clock -->
    <div class="hidden md:flex flex-col items-end">
      <div class="text-[9px] text-sentinel-dim tracking-[0.3em] font-bold uppercase mb-0.5">LOCAL_TIME</div>
      <div class="text-sm font-mono font-bold hud-text-optimal">
        {currentTime.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/:/g, ' ')}
      </div>
    </div>

    <!-- Status Badge -->
    <div class="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 shadow-inner">
      <div class="relative flex h-2 w-2">
        {#if !bootDone}
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sentinel-optimal opacity-75"></span>
        {/if}
        <span class="relative inline-flex rounded-full h-2 w-2 {bootDone ? 'bg-sentinel-optimal shadow-[0_0_10px_#06B6D4]' : 'bg-sentinel-muted'}"></span>
      </div>
      <div class="flex flex-col">
        <span class="text-[9px] font-bold leading-none {bootDone ? 'text-sentinel-text' : 'text-sentinel-dim'} transition-colors">
          {bootDone ? 'SYSTEM ONLINE' : 'BOOTING CORE'}
        </span>
      </div>
    </div>
  </div>
</header>

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
    if (hours < 12) return 'Good Morning';
    if (hours < 18) return 'Good Afternoon';
    return 'Good Evening';
  };
</script>

<header class="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-xl flex items-center justify-between px-8 lg:px-10 z-40 relative">
  <div class="flex items-center gap-10">
    <!-- Welcome Info -->
    <div class="flex flex-col">
      <div class="text-[10px] text-sentinel-dim font-semibold mb-1">{greeting()}</div>
      <div class="text-lg font-bold text-sentinel-text flex items-center gap-2">
        {#if !bootDone}
          <div class="flex gap-1">
            <div class="w-1.5 h-1.5 rounded-full bg-sentinel-optimal animate-bounce [animation-delay:-0.3s]"></div>
            <div class="w-1.5 h-1.5 rounded-full bg-sentinel-optimal animate-bounce [animation-delay:-0.15s]"></div>
            <div class="w-1.5 h-1.5 rounded-full bg-sentinel-optimal animate-bounce"></div>
          </div>
        {:else}
          <span in:fade>{$currentUser ? $currentUser.full_name : 'Guest'}</span>
          {#if $currentUser?.blood_type}
            <span class="px-2 py-0.5 rounded-lg border border-sentinel-optimal/20 bg-sentinel-optimal/5 text-[10px] font-semibold text-sentinel-optimal">
              Type {$currentUser.blood_type}
            </span>
          {/if}
        {/if}
      </div>
    </div>
  </div>

  <div class="flex items-center gap-8">
    <!-- Real-time Clock -->
    <div class="hidden md:flex flex-col items-end">
      <div class="text-[10px] text-sentinel-dim font-semibold mb-0.5">Current Time</div>
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
        <span class="relative inline-flex rounded-full h-2 w-2 {bootDone ? 'bg-sentinel-optimal' : 'bg-sentinel-muted'}"></span>
      </div>
      <div class="flex flex-col">
        <span class="text-[10px] font-semibold leading-none {bootDone ? 'text-sentinel-text' : 'text-sentinel-dim'} transition-colors">
          {bootDone ? 'System Ready' : 'Connecting...'}
        </span>
      </div>
    </div>
  </div>
</header>

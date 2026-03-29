<script>
  import { page } from '$app/stores';
  import { currentUser, logout } from '$lib/stores/auth';
  import { fade } from 'svelte/transition';

  let isOpen = false;

  const navItems = [
    { label: 'DASHBOARD', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', href: '/' },
    { label: 'BIO-TWIN', icon: 'M13 10V3L4 14h7v7l9-11h-7z', href: '/twin' },
    { label: 'LAB REPORTS', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', href: '/reports' },
    { label: 'PREDICTIONS', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', href: '/predictions' },
    { label: 'SHARE KEYS', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z', href: '/share' },
    { label: 'PATIENTS', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', href: '/patients' },
    { label: 'TIMELINE', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', href: '/timeline' },
  ];

  $: activePath = $page.url.pathname;
</script>

<!-- Mobile Toggle -->
<button
  on:click={() => isOpen = !isOpen}
  class="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full hud-panel border-sentinel-optimal/50 flex items-center justify-center z-[100] hud-text-optimal hover:scale-110 active:scale-95 transition-all"
>
  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {#if isOpen}
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    {:else}
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
    {/if}
  </svg>
</button>

<aside
  class="fixed lg:static inset-y-0 left-0 w-64 lg:w-56 border-r border-slate-200 bg-white/80 backdrop-blur-3xl flex flex-col py-8 overflow-y-auto shrink-0 z-50 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) lg:translate-x-0 {isOpen ? 'translate-x-0' : '-translate-x-full'}"
>
  <!-- Logo Section -->
  <div class="px-8 mb-12">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-sentinel-optimal to-sentinel-optimal/20 flex items-center justify-center shadow-lg shadow-sentinel-optimal/20">
        <svg class="w-5 h-5 text-sentinel-bg" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L3 7v9c0 5.25 3.84 10.13 9 11.5 5.16-1.37 9-6.25 9-11.5V7l-9-5z"/>
        </svg>
      </div>
      <div>
        <div class="text-[12px] font-bold tracking-[0.3em] text-sentinel-text">SENTINEL</div>
        <div class="text-[7px] text-sentinel-optimal/80 tracking-[0.4em] font-mono">v.2.0.4-FLASH</div>
      </div>
    </div>
  </div>

  <nav class="flex-1 space-y-2 px-3">
    {#each navItems as item}
      <a
        href={item.href}
        on:click={() => isOpen = false}
        class="flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-300 relative group {activePath === item.href ? 'bg-sentinel-optimal/10' : 'hover:bg-slate-100'}"
      >
        {#if activePath === item.href}
          <div class="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-sentinel-optimal" in:fade></div>
        {/if}
        
        <svg class="w-5 h-5 {activePath === item.href ? 'text-sentinel-optimal' : 'text-sentinel-dim group-hover:text-sentinel-optimal'} transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
        </svg>
        <span class="text-[11px] font-semibold tracking-widest {activePath === item.href ? 'text-sentinel-optimal' : 'text-sentinel-dim group-hover:text-slate-700'} uppercase transition-colors">
          {item.label}
        </span>
      </a>
    {/each}
  </nav>

  <!-- Profile Footer -->
  <div class="mt-auto px-4 pt-6 mt-8">
    <div class="hud-panel p-4 bg-slate-50/50 rounded-2xl border-slate-200 hover:border-sentinel-optimal/20 transition-all space-y-4">
      {#if $currentUser}
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-sentinel-surface-2 border border-sentinel-optimal/20 flex items-center justify-center text-[10px] font-bold text-sentinel-optimal uppercase">
            {$currentUser.full_name?.substring(0, 2) || 'SU'}
          </div>
          <div class="min-w-0">
            <div class="text-[10px] font-bold text-sentinel-text truncate uppercase tracking-wider">{$currentUser.full_name}</div>
            <div class="text-[8px] text-sentinel-dim truncate font-mono">{$currentUser.email}</div>
          </div>
        </div>
      {/if}
      
      <button
        on:click={logout}
        class="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-sentinel-critical/30 bg-sentinel-critical/5 text-[8px] font-bold tracking-[0.2em] hud-text-critical hover:bg-sentinel-critical/10 hover:border-sentinel-critical transition-all uppercase"
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        DISCONNECT
      </button>
    </div>
  </div>
</aside>

{#if isOpen}
  <button
    on:click={() => isOpen = false}
    class="lg:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 w-full h-full border-none cursor-default"
    aria-label="Close Sidebar"
    transition:fade={{ duration: 200 }}
  ></button>
{/if}

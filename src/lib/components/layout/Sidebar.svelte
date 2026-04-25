<script>
  import { page } from '$app/stores';
  import { currentUser, logout } from '$lib/stores/auth';
  import { fade } from 'svelte/transition';

  let isOpen = false;

  const navItems = [
    { label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', href: '/' },
    { label: '3D Model', icon: 'M13 10V3L4 14h7v7l9-11h-7z', href: '/twin' },
    { label: 'Lab Reports', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', href: '/reports' },
    { label: 'Bloodwork', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', href: '/bloodwork' },
    { label: 'Health Insights', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', href: '/predictions' },
    { label: 'Access Control', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z', href: '/share' },
    { label: 'Patients', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', href: '/patients' },
    { label: 'Activity', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', href: '/timeline' },
  ];

  // Bottom nav shows first 4 + "More"
  const bottomNavItems = navItems.slice(0, 4);

  $: activePath = $page.url.pathname;
</script>

<!-- ═══ MOBILE BOTTOM NAV ═══ -->
<nav class="lg:hidden fixed bottom-0 left-0 right-0 z-[100] border-t border-slate-200 dark:border-slate-700/60 bg-white/95 dark:bg-sentinel-dark-surface-0/95 backdrop-blur-xl px-2 pb-[env(safe-area-inset-bottom)]">
  <div class="flex items-center justify-around h-16">
    {#each bottomNavItems as item}
      <a
        href={item.href}
        class="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[56px] {activePath === item.href ? 'text-sentinel-optimal' : 'text-slate-400 dark:text-slate-500'}"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
        </svg>
        <span class="text-[9px] font-bold">{item.label}</span>
      </a>
    {/each}
    <!-- More button -->
    <button
      on:click={() => isOpen = !isOpen}
      class="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[56px] {isOpen ? 'text-sentinel-optimal' : 'text-slate-400 dark:text-slate-500'}"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
      </svg>
      <span class="text-[9px] font-bold">More</span>
    </button>
  </div>
</nav>

<!-- ═══ DESKTOP SIDEBAR ═══ -->
<aside
  class="hidden lg:flex fixed lg:static inset-y-0 left-0 w-56 border-r border-slate-200 dark:border-slate-700/60 bg-white/80 dark:bg-sentinel-dark-surface-0/80 backdrop-blur-3xl flex-col py-8 overflow-y-auto shrink-0 z-50"
>
  <!-- Logo Section -->
  <div class="px-8 mb-12">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-sentinel-optimal to-sentinel-optimal/20 flex items-center justify-center shadow-lg shadow-sentinel-optimal/20">
        <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L3 7v9c0 5.25 3.84 10.13 9 11.5 5.16-1.37 9-6.25 9-11.5V7l-9-5z"/>
        </svg>
      </div>
      <div>
        <div class="text-sm font-bold text-sentinel-text dark:text-white">Sentinel</div>
        <div class="text-[10px] text-sentinel-optimal font-semibold">Patient Portal</div>
      </div>
    </div>
  </div>

  <nav class="flex-1 space-y-2 px-3">
    {#each navItems as item}
      <a
        href={item.href}
        class="flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-300 relative group {activePath === item.href ? 'bg-sentinel-optimal/10 dark:bg-sentinel-optimal/15' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}"
      >
        {#if activePath === item.href}
          <div class="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-sentinel-optimal" in:fade></div>
        {/if}
        
        <svg class="w-5 h-5 {activePath === item.href ? 'text-sentinel-optimal' : 'text-sentinel-dim dark:text-slate-400 group-hover:text-sentinel-optimal'} transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
        </svg>
        <span class="text-sm font-medium {activePath === item.href ? 'text-sentinel-optimal' : 'text-sentinel-dim dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-white'} transition-colors">
          {item.label}
        </span>
      </a>
    {/each}
  </nav>

  <!-- Profile Footer -->
  <div class="mt-auto px-4 pt-6 mt-8">
    <div class="hud-panel p-4 bg-slate-50/50 dark:bg-sentinel-dark-surface-1/50 rounded-2xl border-slate-200 dark:border-slate-700 hover:border-sentinel-optimal/20 transition-all space-y-4">
      {#if $currentUser}
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-sentinel-surface-2 dark:bg-sentinel-dark-surface-2 border border-sentinel-optimal/20 flex items-center justify-center text-[10px] font-bold text-sentinel-optimal uppercase">
            {$currentUser.full_name?.substring(0, 2) || 'SU'}
          </div>
          <div class="min-w-0">
            <div class="text-xs font-bold text-sentinel-text dark:text-white truncate">{$currentUser.full_name}</div>
            <div class="text-[10px] text-sentinel-dim dark:text-slate-400 truncate">{$currentUser.email}</div>
          </div>
        </div>
      {/if}
      
      <button
        on:click={logout}
        class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-sentinel-dark-surface-0 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-red-950/30 hover:text-sentinel-critical hover:border-sentinel-critical/30 transition-all"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Sign Out
      </button>
    </div>
  </div>
</aside>

<!-- Mobile slide-out (for "More" items) -->
{#if isOpen}
  <button
    on:click={() => isOpen = false}
    class="lg:hidden fixed inset-0 bg-slate-900/30 dark:bg-black/50 backdrop-blur-sm z-40 w-full h-full border-none cursor-default"
    aria-label="Close menu"
    transition:fade={{ duration: 200 }}
  ></button>
  
  <div
    class="lg:hidden fixed bottom-16 left-0 right-0 z-[90] p-4 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]"
    transition:fade={{ duration: 200 }}
  >
    <div class="bg-white dark:bg-sentinel-dark-surface-0 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl p-3 grid grid-cols-4 gap-2">
      {#each navItems.slice(4) as item}
        <a
          href={item.href}
          on:click={() => isOpen = false}
          class="flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-xl transition-all {activePath === item.href ? 'bg-sentinel-optimal/10 text-sentinel-optimal' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
          </svg>
          <span class="text-[9px] font-bold text-center leading-tight">{item.label}</span>
        </a>
      {/each}
    </div>
  </div>
{/if}

<script>
  import { page } from '$app/stores';
  import { currentUser, logout } from '$lib/stores/auth';
  import { doctorSessions, activeShareKey } from '$lib/stores/doctor';
  import { fade } from 'svelte/transition';

  let isOpen = false;

  const navItems = [
    { label: 'Command Center', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z', href: '/doctor' },
    { label: 'Access Patient', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z', href: '/doctor/access' },
    { label: 'Patient Review', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', href: '/doctor/patient' },
    { label: 'Clinical LISA', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', href: '/doctor/lisa' },
    { label: 'Access Logs', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', href: '/doctor/logs' },
  ];

  const bottomNavItems = navItems.slice(0, 4);

  $: activePath = $page.url.pathname;
  $: sessionCount = $doctorSessions.length;
</script>

<!-- ═══ MOBILE BOTTOM NAV ═══ -->
<nav class="lg:hidden fixed bottom-0 left-0 right-0 z-[100] border-t border-slate-200 dark:border-slate-700/60 bg-white/95 dark:bg-sentinel-dark-surface-0/95 backdrop-blur-xl px-2 pb-[env(safe-area-inset-bottom)]">
  <div class="flex items-center justify-around h-16">
    {#each bottomNavItems as item}
      <a
        href={item.href}
        class="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[56px] {activePath === item.href ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
        </svg>
        <span class="text-[9px] font-bold">{item.label.split(' ')[0]}</span>
      </a>
    {/each}
  </div>
</nav>

<!-- ═══ DESKTOP SIDEBAR ═══ -->
<aside
  class="hidden lg:flex fixed lg:static inset-y-0 left-0 w-56 border-r border-slate-200 dark:border-slate-700/60 bg-white dark:bg-sentinel-dark-surface-0 flex-col py-8 overflow-y-auto shrink-0 z-50"
>
  <!-- Logo Section -->
  <div class="px-8 mb-10">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-700 flex items-center justify-center">
        <svg class="w-5 h-5 text-emerald-700 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
      <div>
        <div class="text-sm font-bold text-slate-800 dark:text-white">Sentinel</div>
        <div class="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">Doctor Portal</div>
      </div>
    </div>
  </div>

  <!-- Active Sessions Badge -->
  {#if sessionCount > 0}
    <div class="mx-4 mb-5 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-700">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        <span class="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
          {sessionCount} Active Session{sessionCount > 1 ? 's' : ''}
        </span>
      </div>
    </div>
  {/if}

  <nav class="flex-1 space-y-1 px-3">
    {#each navItems as item}
      <a
        href={item.href}
        class="flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-200 relative group {activePath === item.href ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-700' : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'}"
      >
        {#if activePath === item.href}
          <div class="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-emerald-600 dark:bg-emerald-400" in:fade></div>
        {/if}
        
        <svg class="w-5 h-5 {activePath === item.href ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'} transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
        </svg>
        <span class="text-sm font-medium {activePath === item.href ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-white'} transition-colors">
          {item.label}
        </span>
      </a>
    {/each}
  </nav>

  <!-- Profile Footer -->
  <div class="mt-auto px-4 pt-6 mt-8">
    <div class="p-4 bg-slate-50 dark:bg-sentinel-dark-surface-1 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
      {#if $currentUser}
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-700 flex items-center justify-center text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
            {$currentUser.full_name?.substring(0, 2) || 'DR'}
          </div>
          <div class="min-w-0">
            <div class="text-xs font-bold text-slate-800 dark:text-white truncate">Dr. {$currentUser.full_name}</div>
            <div class="text-[10px] text-slate-400 truncate">{$currentUser.specialty || 'General'}</div>
          </div>
        </div>
      {/if}
      
      <button
        on:click={logout}
        class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-sentinel-dark-surface-0 text-xs font-semibold text-slate-500 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-700 transition-all"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Sign Out
      </button>
    </div>
  </div>
</aside>

{#if isOpen}
  <button
    on:click={() => isOpen = false}
    class="lg:hidden fixed inset-0 bg-slate-900/20 dark:bg-black/50 backdrop-blur-sm z-40 w-full h-full border-none cursor-default"
    aria-label="Close Sidebar"
    transition:fade={{ duration: 200 }}
  ></button>
{/if}

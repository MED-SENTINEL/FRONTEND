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
  ];

  $: activePath = $page.url.pathname;
  $: sessionCount = $doctorSessions.length;
</script>

<!-- Mobile Toggle -->
<button
  on:click={() => isOpen = !isOpen}
  class="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-white border-2 border-emerald-200 shadow-lg flex items-center justify-center z-[100] text-emerald-700 hover:scale-110 active:scale-95 transition-all"
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
  class="fixed lg:static inset-y-0 left-0 w-64 lg:w-56 border-r border-slate-200 bg-white flex flex-col py-8 overflow-y-auto shrink-0 z-50 transition-transform duration-500 lg:translate-x-0 {isOpen ? 'translate-x-0' : '-translate-x-full'}"
>
  <!-- Logo Section -->
  <div class="px-8 mb-10">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
        <svg class="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
      <div>
        <div class="text-sm font-bold text-slate-800">Sentinel</div>
        <div class="text-[10px] text-emerald-700 font-semibold">Doctor Portal</div>
      </div>
    </div>
  </div>

  <!-- Active Sessions Badge -->
  {#if sessionCount > 0}
    <div class="mx-4 mb-5 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        <span class="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
          {sessionCount} Active Session{sessionCount > 1 ? 's' : ''}
        </span>
      </div>
    </div>
  {/if}

  <nav class="flex-1 space-y-1 px-3">
    {#each navItems as item}
      <a
        href={item.href}
        on:click={() => isOpen = false}
        class="flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-200 relative group {activePath === item.href ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-slate-50 border border-transparent'}"
      >
        {#if activePath === item.href}
          <div class="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-emerald-600" in:fade></div>
        {/if}
        
        <svg class="w-5 h-5 {activePath === item.href ? 'text-emerald-700' : 'text-slate-400 group-hover:text-emerald-600'} transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
        </svg>
        <span class="text-sm font-medium {activePath === item.href ? 'text-emerald-700' : 'text-slate-500 group-hover:text-slate-700'} transition-colors">
          {item.label}
        </span>
      </a>
    {/each}
  </nav>

  <!-- Profile Footer -->
  <div class="mt-auto px-4 pt-6 mt-8">
    <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
      {#if $currentUser}
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[10px] font-bold text-emerald-700 uppercase">
            {$currentUser.full_name?.substring(0, 2) || 'DR'}
          </div>
          <div class="min-w-0">
            <div class="text-xs font-bold text-slate-800 truncate">Dr. {$currentUser.full_name}</div>
            <div class="text-[10px] text-slate-400 truncate">{$currentUser.specialty || 'General'}</div>
          </div>
        </div>
      {/if}
      
      <button
        on:click={logout}
        class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
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
    class="lg:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 w-full h-full border-none cursor-default"
    aria-label="Close Sidebar"
    transition:fade={{ duration: 200 }}
  ></button>
{/if}

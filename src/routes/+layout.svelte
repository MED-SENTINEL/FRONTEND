<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { isAuthenticated, isDoctor } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { fade } from 'svelte/transition';
  import { initTheme } from '$lib/stores/theme';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import Header from '$lib/components/layout/Header.svelte';
  import DoctorSidebar from '$lib/components/layout/DoctorSidebar.svelte';
  import DoctorHeader from '$lib/components/layout/DoctorHeader.svelte';
  import Toast from '$lib/components/layout/Toast.svelte';

  const publicRoutes = ['/landing', '/login', '/register', '/verify', '/onboarding', '/auth/google/callback'];
  const fullscreenRoutes = ['/twin'];
  
  $: isPublicRoute = publicRoutes.includes($page.url.pathname);
  $: isFullscreen = fullscreenRoutes.includes($page.url.pathname);

  $: if (typeof window !== 'undefined' && !$isAuthenticated && !isPublicRoute) {
    goto('/landing');
  }

  // Redirect doctors to /doctor if they land on patient root
  $: if (typeof window !== 'undefined' && $isAuthenticated && !isPublicRoute) {
    const path = $page.url.pathname;
    if ($isDoctor && path === '/') {
      goto('/doctor');
    }
  }

  onMount(() => {
    initTheme();
  });
</script>

<!-- Global Toast Notifications -->
<Toast />

{#if isPublicRoute}
  <slot />
{:else if $isAuthenticated}
  <div class="h-screen flex bg-white dark:bg-sentinel-dark-bg text-slate-800 dark:text-slate-100 font-sans overflow-hidden relative">
    {#if $isDoctor}
      <DoctorSidebar />
      <div class="flex-1 flex flex-col min-w-0 relative z-10">
        <DoctorHeader />
        <main class="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-sentinel-dark-bg">
          <div class="container mx-auto px-4 sm:px-6 lg:px-10 py-8 max-w-7xl">
            {#key $page.url.pathname}
              <div in:fade={{ duration: 400, delay: 150 }} out:fade={{ duration: 250 }}>
                <slot />
              </div>
            {/key}
          </div>
        </main>
      </div>
    {:else}
      <!-- Original Patient Layout -->
      <div class="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(8,145,178,0.03)_0%,transparent_100%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(8,145,178,0.06)_0%,transparent_100%)]"></div>
      <Sidebar />
      <div class="flex-1 flex flex-col min-w-0 relative z-10">
        <Header />
        <main class="flex-1 overflow-y-auto">
          {#if isFullscreen}
            {#key $page.url.pathname}
              <div in:fade={{ duration: 400, delay: 150 }} out:fade={{ duration: 250 }}>
                <slot />
              </div>
            {/key}
          {:else}
            <div class="container mx-auto px-4 sm:px-6 lg:px-10 py-8 max-w-7xl">
              {#key $page.url.pathname}
                <div in:fade={{ duration: 400, delay: 150 }} out:fade={{ duration: 250 }}>
                  <slot />
                </div>
              {/key}
            </div>
          {/if}
        </main>
        <div class="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(15,23,42,0.03)] dark:shadow-none z-50"></div>
      </div>
    {/if}
  </div>
{/if}

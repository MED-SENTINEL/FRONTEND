<script>
  import '../app.css';
  import { page } from '$app/stores';
  import { isAuthenticated, isDoctor } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import Header from '$lib/components/layout/Header.svelte';
  import DoctorSidebar from '$lib/components/layout/DoctorSidebar.svelte';
  import DoctorHeader from '$lib/components/layout/DoctorHeader.svelte';

  const publicRoutes = ['/landing', '/login', '/register', '/verify', '/onboarding', '/auth/google/callback'];
  
  $: isPublicRoute = publicRoutes.includes($page.url.pathname);

  onMount(() => {
    if (!$isAuthenticated && !isPublicRoute) {
      goto('/landing');
    }
  });

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
</script>

{#if isPublicRoute}
  <slot />
{:else if $isAuthenticated}
  <div class="h-screen flex bg-white text-slate-800 font-sans overflow-hidden relative">
    {#if $isDoctor}
      <DoctorSidebar />
      <div class="flex-1 flex flex-col min-w-0 relative z-10">
        <DoctorHeader />
        <main class="flex-1 overflow-y-auto bg-slate-50/50">
          <div class="container mx-auto px-6 lg:px-10 py-8 max-w-7xl">
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
      <div class="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(8,145,178,0.03)_0%,transparent_100%)]"></div>
      <Sidebar />
      <div class="flex-1 flex flex-col min-w-0 relative z-10">
        <Header />
        <main class="flex-1 overflow-y-auto">
          <div class="container mx-auto px-6 lg:px-10 py-8 max-w-7xl">
            {#key $page.url.pathname}
              <div in:fade={{ duration: 400, delay: 150 }} out:fade={{ duration: 250 }}>
                <slot />
              </div>
            {/key}
          </div>
        </main>
        <div class="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(15,23,42,0.03)] z-50"></div>
      </div>
    {/if}
  </div>
{/if}

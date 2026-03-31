<script>
  import '../app.css';
  import { page } from '$app/stores';
  import { isAuthenticated } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import Header from '$lib/components/layout/Header.svelte';

  const publicRoutes = ['/login', '/register', '/verify', '/onboarding', '/auth/google/callback'];
  
  $: isPublicRoute = publicRoutes.includes($page.url.pathname);

  onMount(() => {
    if (!$isAuthenticated && !isPublicRoute) {
      goto('/login');
    }
  });

  $: if (typeof window !== 'undefined' && !$isAuthenticated && !isPublicRoute) {
    goto('/login');
  }
</script>

{#if isPublicRoute}
  <slot />
{:else if $isAuthenticated}
  <div class="h-screen flex bg-sentinel-bg text-sentinel-text font-sans overflow-hidden relative">
    <!-- Background Noise & Gradients -->
    <div class="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(8, 145, 178, 0.03)_0%,transparent_100%)]"></div>
    
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
      
      <!-- Vignette Overlay -->
      <div class="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(15,23,42,0.03)] z-50"></div>
    </div>
  </div>
{/if}

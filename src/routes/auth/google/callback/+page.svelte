<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { handleSSOCallback } from '$lib/stores/auth';

  let errorMsg = '';

  onMount(async () => {
    // Expected URL format: /auth/google/callback#token=ey...
    if (typeof window === 'undefined') return;

    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1)); // remove #
    const token = params.get('token');

    if (!token) {
      errorMsg = 'Authentication failed: No token received from provider.';
      setTimeout(() => goto('/login'), 3000);
      return;
    }

    try {
      const user = await handleSSOCallback(token);
      if (!user.is_onboarded) {
        goto('/onboarding');
      } else {
        goto('/');
      }
    } catch (err) {
      errorMsg = 'Failed to securely log you in. Please try again.';
      setTimeout(() => goto('/login'), 3000);
    }
  });
</script>

<div class="min-h-screen flex items-center justify-center bg-sentinel-bg">
    {#if errorMsg}
      <div class="text-[10px] text-sentinel-critical font-bold uppercase tracking-widest">{errorMsg}</div>
    {:else}
      <div class="flex flex-col items-center gap-4">
        <div class="w-8 h-8 rounded-full border-2 border-sentinel-optimal/20 border-t-sentinel-optimal animate-spin"></div>
        <div class="text-[10px] text-sentinel-dim animate-pulse uppercase tracking-[0.4em]">AUTHENTICATING_USER_NODE...</div>
      </div>
    {/if}
</div>

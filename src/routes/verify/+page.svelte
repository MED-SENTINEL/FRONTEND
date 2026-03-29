<script>
  import { verifyEmail, resendCode } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { fade, fly } from 'svelte/transition';
  import { onMount } from 'svelte';

  let email = '';
  let code = '';
  let errorMsg = '';
  let successMsg = '';
  let submitting = false;
  let resending = false;
  let cooldown = 0;
  let cooldownInterval = null;

  onMount(() => {
    const params = new URLSearchParams($page.url.search);
    email = params.get('email') || '';
  });

  async function handleVerify() {
    errorMsg = '';
    successMsg = '';
    submitting = true;
    try {
      const response = await verifyEmail(email, code);
      // If user is not onboarded, go to onboarding
      if (!response.user.is_onboarded) {
        goto('/onboarding');
      } else {
        goto('/');
      }
    } catch (err) {
      errorMsg = err.message;
    } finally {
      submitting = false;
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    errorMsg = '';
    resending = true;
    try {
      await resendCode(email);
      successMsg = 'New verification code sent!';
      // Start 60s cooldown
      cooldown = 60;
      cooldownInterval = setInterval(() => {
        cooldown--;
        if (cooldown <= 0) {
          clearInterval(cooldownInterval);
          cooldown = 0;
        }
      }, 1000);
    } catch (err) {
      errorMsg = err.message;
    } finally {
      resending = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-sentinel-bg relative overflow-hidden p-6 selection:bg-sentinel-optimal/10">
  <!-- Background Grid -->
  <div class="absolute inset-0 opacity-40 pointer-events-none"
       style="background-image: radial-gradient(circle at 2px 2px, rgba(8, 145, 178, 0.1) 1px, transparent 0); background-size: 40px 40px;"></div>
  <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(8,145,178,0.03)_0%,transparent_70%)] pointer-events-none"></div>

  <div class="w-full max-w-sm relative z-10" in:fly={{ y: 20, duration: 800 }}>
    <!-- Header -->
    <div class="text-center mb-10 space-y-4">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sentinel-optimal to-sentinel-optimal/20 shadow-[0_0_30px_rgba(6,182,212,0.3)] mb-4">
        <svg class="w-10 h-10 text-sentinel-bg" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h1 class="text-3xl font-bold tracking-[0.3em] text-sentinel-text uppercase">VERIFY</h1>
      <div class="h-px w-12 bg-sentinel-optimal/40 mx-auto"></div>
      <div class="text-[10px] text-sentinel-muted tracking-[0.4em] uppercase font-mono">Identity Confirmation Protocol</div>
    </div>

    <!-- Verify Card -->
    <div class="hud-panel p-8 bg-white/50 border-slate-200 shadow-2xl space-y-8">
      <div class="text-xs font-bold text-sentinel-text tracking-[0.3em] uppercase border-b border-slate-200 pb-4">VERIFICATION_CODE</div>

      <div class="text-center text-[10px] text-sentinel-muted tracking-widest uppercase leading-relaxed px-2">
        A 6-digit code has been sent to<br />
        <span class="text-sentinel-optimal font-bold">{email || '...'}</span>
      </div>

      {#if errorMsg}
        <div class="p-4 rounded-lg bg-sentinel-critical/10 border border-sentinel-critical/20 text-[10px] hud-text-critical uppercase tracking-widest leading-relaxed" in:fade>
          <span class="font-bold">ERROR:</span> {errorMsg}
        </div>
      {/if}

      {#if successMsg}
        <div class="p-4 rounded-lg bg-sentinel-optimal/10 border border-sentinel-optimal/20 text-[10px] text-sentinel-optimal uppercase tracking-widest leading-relaxed" in:fade>
          <span class="font-bold">✓</span> {successMsg}
        </div>
      {/if}

      <form on:submit|preventDefault={handleVerify} class="space-y-6">
        <div class="space-y-2">
          <label for="code" class="text-[9px] text-sentinel-dim tracking-[0.2em] uppercase font-bold px-1">AUTHORIZATION_CODE</label>
          <input
            id="code"
            type="text"
            bind:value={code}
            required
            maxlength="6"
            class="hud-input font-mono text-center text-2xl tracking-[0.5em]"
            placeholder="000000"
            autocomplete="one-time-code"
          />
        </div>

        {#if !email}
          <div class="space-y-2">
            <label for="verify-email" class="text-[9px] text-sentinel-dim tracking-[0.2em] uppercase font-bold px-1">IDENTITY_EMAIL</label>
            <input
              id="verify-email"
              type="email"
              bind:value={email}
              required
              class="hud-input font-mono"
              placeholder="your@email.com"
            />
          </div>
        {/if}

        <button
          type="submit"
          disabled={submitting || code.length !== 6}
          class="w-full hud-button py-3.5 text-xs tracking-[0.3em]"
        >
          {submitting ? 'VERIFYING...' : 'CONFIRM IDENTITY'}
        </button>
      </form>

      <div class="pt-6 border-t border-slate-200 flex flex-col items-center gap-4">
        <button
          on:click={handleResend}
          disabled={resending || cooldown > 0}
          class="text-[10px] text-sentinel-optimal tracking-widest uppercase font-bold hover:underline disabled:opacity-40 disabled:no-underline transition-opacity"
        >
          {#if cooldown > 0}
            RESEND IN {cooldown}s
          {:else if resending}
            SENDING...
          {:else}
            RESEND CODE
          {/if}
        </button>

        <a href="/login" class="text-[10px] text-sentinel-dim tracking-widest uppercase hover:text-sentinel-optimal transition-colors">
          ← BACK TO LOGIN
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div class="mt-8 text-center text-[8px] text-sentinel-dim/40 tracking-[0.5em] uppercase pointer-events-none font-mono">
      SENTINEL // VERIFICATION PROTOCOL // v.2.0
    </div>
  </div>
</div>

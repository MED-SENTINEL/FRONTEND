<script>
  import * as env from '$env/static/public';
  import { login } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { fade, fly } from 'svelte/transition';

  const apiBaseUrl = env.PUBLIC_API_BASE_URL || 'http://localhost:8000';

  let email = '';
  let password = '';
  let errorMsg = '';
  let submitting = false;

  async function handleLogin() {
    errorMsg = '';
    submitting = true;
    try {
      const response = await login(email, password);
      // Check if onboarding is needed
      if (!response.user.is_onboarded) {
        goto('/onboarding');
      } else {
        goto('/');
      }
    } catch (err) {
      // If email not verified, redirect to verify page
      if (err.status === 403 && err.message.toLowerCase().includes('not verified')) {
        goto(`/verify?email=${encodeURIComponent(email)}`);
        return;
      }
      errorMsg = err.message;
    } finally {
      submitting = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-sentinel-bg relative overflow-hidden p-6 selection:bg-sentinel-optimal/10">
  <!-- Dynamic Background Grid -->
  <div class="absolute inset-0 opacity-40 pointer-events-none" 
       style="background-image: radial-gradient(circle at 2px 2px, rgba(8, 145, 178, 0.1) 1px, transparent 0); background-size: 40px 40px;"></div>
  <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(8, 145, 178, 0.03)_0%,transparent_70%)] pointer-events-none"></div>

  <div class="w-full max-w-sm relative z-10" in:fly={{ y: 20, duration: 800 }}>
    <!-- Logo/Brand Section -->
    <div class="text-center mb-10 space-y-4">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sentinel-optimal to-sentinel-optimal/20 shadow-[0_0_30px_rgba(6,182,212,0.3)] mb-4 animate-shimmer">
        <svg class="w-10 h-10 text-sentinel-bg" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L3 7v9c0 5.25 3.84 10.13 9 11.5 5.16-1.37 9-6.25 9-11.5V7l-9-5z"/>
        </svg>
      </div>
      <h1 class="text-4xl font-bold tracking-[0.3em] text-sentinel-text uppercase">SENTINEL</h1>
      <div class="h-px w-12 bg-sentinel-optimal/40 mx-auto"></div>
      <div class="text-[10px] text-sentinel-muted tracking-[0.4em] uppercase font-mono">Bio-Digital Trace // Security Protocol</div>
    </div>

    <!-- Login Card -->
    <div class="hud-panel p-8 bg-white/50 border-slate-200 shadow-2xl space-y-8">
      <div class="text-xs font-bold text-sentinel-text tracking-[0.3em] uppercase border-b border-slate-200 pb-4">AUTHENTICATION_REQUIRED</div>

      {#if errorMsg}
        <div class="p-4 rounded-lg bg-sentinel-critical/10 border border-sentinel-critical/20 text-[10px] hud-text-critical uppercase tracking-widest leading-relaxed" in:fade>
          <span class="font-bold">SYSTEM ALERT:</span> {errorMsg}
        </div>
      {/if}

      <form on:submit|preventDefault={handleLogin} class="space-y-6">
        <div class="space-y-2">
          <label for="email" class="text-[9px] text-sentinel-dim tracking-[0.2em] uppercase font-bold px-1">IDENTITY_EMAIL</label>
          <input
            id="email"
            type="email"
            bind:value={email}
            required
            class="hud-input font-mono"
            placeholder="node.user@sentinel.ai"
          />
        </div>

        <div class="space-y-2">
          <label for="password" class="text-[9px] text-sentinel-dim tracking-[0.2em] uppercase font-bold px-1">TRACE_KEY</label>
          <input
            id="password"
            type="password"
            bind:value={password}
            required
            class="hud-input font-mono"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          class="w-full hud-button py-3.5 text-xs tracking-[0.3em]"
        >
          {submitting ? 'SYNCHRONIZING...' : 'ACCESS SYSTEM'}
        </button>

        <div class="relative flex items-center py-2">
          <div class="flex-grow border-t border-slate-200"></div>
          <span class="shrink-0 px-4 text-[10px] text-sentinel-dim font-bold tracking-[0.2em] uppercase">OR</span>
          <div class="flex-grow border-t border-slate-200"></div>
        </div>

        <a
          href="{apiBaseUrl}/api/auth/google/login"
          class="w-full h-12 flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px] hover:bg-slate-50 transition-colors shadow-sm"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          CONTINUE WITH GOOGLE
        </a>

      </form>

      <div class="pt-6 border-t border-slate-200 flex flex-col items-center gap-4">
        <div class="text-[10px] text-sentinel-dim tracking-widest uppercase">
          NO ACCESS? <a href="/register" class="text-sentinel-optimal hover:underline font-bold">RE-INITIALIZE</a>
        </div>
        
        <div class="px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-[8px] text-sentinel-dim tracking-widest font-mono">
          DEMO: demo@sentinel.dev / sentinel123
        </div>
      </div>
    </div>
    
    <!-- Footer Tag -->
    <div class="mt-8 text-center text-[8px] text-sentinel-dim/40 tracking-[0.5em] uppercase pointer-events-none font-mono">
      SENTINEL // SECURE ACCESS // v.2.0
    </div>
  </div>
</div>

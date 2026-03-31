<script>
  import { register } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { fade, fly } from 'svelte/transition';

  let full_name = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let errorMsg = '';
  let submitting = false;

  async function handleRegister() {
    errorMsg = '';

    if (password !== confirmPassword) {
      errorMsg = 'Passwords do not match';
      return;
    }

    if (password.length < 6) {
      errorMsg = 'Password must be at least 6 characters';
      return;
    }

    submitting = true;
    try {
      await register({ full_name, email, password });
      // Redirect to verification page
      goto(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
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
  
  <div class="w-full max-w-sm relative z-10" in:fly={{ y: 20, duration: 800 }}>
    <!-- Header -->
    <div class="text-center mb-8 space-y-4">
      <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-sentinel-optimal to-sentinel-optimal/20 shadow-lg shadow-sentinel-optimal/20 mb-2">
        <svg class="w-8 h-8 text-sentinel-bg" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L3 7v9c0 5.25 3.84 10.13 9 11.5 5.16-1.37 9-6.25 9-11.5V7l-9-5z"/>
        </svg>
      </div>
      <h1 class="text-3xl font-bold tracking-tight text-sentinel-text">Join Sentinel</h1>
      <div class="text-sm text-sentinel-muted font-medium">Create your health profile</div>
    </div>

    <!-- Registration Card -->
    <div class="hud-panel p-8 bg-white/50 border-slate-200 shadow-2xl space-y-6">
      <div class="text-sm font-semibold text-sentinel-text border-b border-slate-100 pb-4">Patient Registration</div>

      {#if errorMsg}
        <div class="p-3 rounded-lg bg-sentinel-critical/10 border border-sentinel-critical/20 text-[9px] hud-text-critical uppercase tracking-widest leading-relaxed" in:fade>
          <span class="font-bold">ERROR:</span> {errorMsg}
        </div>
      {/if}

      <form on:submit|preventDefault={handleRegister} class="space-y-4">
        <div class="space-y-1.5">
          <label for="name" class="text-sm text-sentinel-dim font-medium px-1">Full Name</label>
          <input id="name" type="text" bind:value={full_name} required class="hud-input h-11" placeholder="ENTER SUBJECT NAME" />
        </div>

        <div class="space-y-1.5">
          <label for="reg-email" class="text-sm text-sentinel-dim font-medium px-1">Email Address</label>
          <input id="reg-email" type="email" bind:value={email} required class="hud-input h-11" placeholder="ENTER VALID EMAIL" />
        </div>

        <div class="space-y-1.5">
          <label for="reg-pass" class="text-sm text-sentinel-dim font-medium px-1">Password</label>
          <input id="reg-pass" type="password" bind:value={password} required minlength="6" class="hud-input h-11" placeholder="MIN. 6 CHARACTERS" />
        </div>

        <div class="space-y-1.5">
          <label for="confirm-pass" class="text-sm text-sentinel-dim font-medium px-1">Confirm Password</label>
          <input id="confirm-pass" type="password" bind:value={confirmPassword} required minlength="6" class="hud-input h-11" placeholder="RE-ENTER KEY" />
        </div>

        <button type="submit" disabled={submitting}
          class="w-full hud-button hud-button-accent py-3.5 text-xs tracking-[0.3em] font-bold mt-4">
          {submitting ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <div class="pt-4 border-t border-slate-200 text-center">
          Already have an account? <a href="/login" class="text-sentinel-optimal hover:underline font-bold">Sign In</a>
      </div>
    </div>
  </div>
</div>

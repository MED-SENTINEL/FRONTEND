<script>
  import { register } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { fade, fly } from 'svelte/transition';
  import { validateEmail, validatePassword, validatePasswordMatch, getPasswordStrength } from '$lib/utils/validation';

  let full_name = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let errorMsg = '';
  let submitting = false;
  let fieldErrors = {};
  let touched = {};

  $: pwResult = validatePassword(password);
  $: pwStrength = pwResult.strength || 0;
  $: strengthInfo = getPasswordStrength(pwStrength);

  function validate() {
    const errors = {};
    if (!full_name.trim()) errors.full_name = 'Full name is required';
    
    const emailResult = validateEmail(email);
    if (!emailResult.valid) errors.email = emailResult.error;
    
    const passResult = validatePassword(password);
    if (!passResult.valid) errors.password = passResult.error;
    
    const matchResult = validatePasswordMatch(password, confirmPassword);
    if (!matchResult.valid) errors.confirmPassword = matchResult.error;
    
    fieldErrors = errors;
    return Object.keys(errors).length === 0;
  }

  function markTouched(field) {
    touched[field] = true;
    touched = touched; // trigger reactivity
    validate();
  }

  async function handleRegister() {
    errorMsg = '';
    if (!validate()) return;

    submitting = true;
    try {
      await register({ full_name, email, password });
      goto(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      errorMsg = err.message;
    } finally {
      submitting = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-sentinel-bg dark:bg-sentinel-dark-bg relative overflow-hidden p-6 selection:bg-sentinel-optimal/10">
  <!-- Dynamic Background Grid -->
  <div class="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none" 
       style="background-image: radial-gradient(circle at 2px 2px, rgba(8, 145, 178, 0.1) 1px, transparent 0); background-size: 40px 40px;"></div>
  
  <div class="w-full max-w-sm relative z-10" in:fly={{ y: 20, duration: 800 }}>
    <!-- Header -->
    <div class="text-center mb-8 space-y-4">
      <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-sentinel-optimal to-sentinel-optimal/20 shadow-lg shadow-sentinel-optimal/20 mb-2">
        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L3 7v9c0 5.25 3.84 10.13 9 11.5 5.16-1.37 9-6.25 9-11.5V7l-9-5z"/>
        </svg>
      </div>
      <h1 class="text-3xl font-bold tracking-tight text-sentinel-text dark:text-white">Join Sentinel</h1>
      <div class="text-sm text-sentinel-muted dark:text-slate-400 font-medium">Create your health profile</div>
    </div>

    <!-- Registration Card -->
    <div class="hud-panel p-8 bg-white/50 dark:bg-sentinel-dark-surface-0/80 border-slate-200 dark:border-slate-700 shadow-2xl space-y-6">
      <div class="text-sm font-semibold text-sentinel-text dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4">Patient Registration</div>

      {#if errorMsg}
        <div class="p-3 rounded-lg bg-sentinel-critical/10 border border-sentinel-critical/20 text-[9px] hud-text-critical uppercase tracking-widest leading-relaxed" in:fade>
          <span class="font-bold">ERROR:</span> {errorMsg}
        </div>
      {/if}

      <form on:submit|preventDefault={handleRegister} class="space-y-4">
        <div class="space-y-1.5">
          <label for="name" class="text-sm text-sentinel-dim dark:text-slate-400 font-medium px-1">Full Name</label>
          <input id="name" type="text" bind:value={full_name} on:blur={() => markTouched('full_name')} required class="hud-input h-11 {touched.full_name && fieldErrors.full_name ? '!border-red-400 dark:!border-red-500' : ''}" placeholder="Enter your full name" />
          {#if touched.full_name && fieldErrors.full_name}
            <div class="text-[10px] text-red-500 px-1" in:fade>{fieldErrors.full_name}</div>
          {/if}
        </div>

        <div class="space-y-1.5">
          <label for="reg-email" class="text-sm text-sentinel-dim dark:text-slate-400 font-medium px-1">Email Address</label>
          <input id="reg-email" type="email" bind:value={email} on:blur={() => markTouched('email')} required class="hud-input h-11 {touched.email && fieldErrors.email ? '!border-red-400 dark:!border-red-500' : ''}" placeholder="you@example.com" />
          {#if touched.email && fieldErrors.email}
            <div class="text-[10px] text-red-500 px-1" in:fade>{fieldErrors.email}</div>
          {/if}
        </div>

        <div class="space-y-1.5">
          <label for="reg-pass" class="text-sm text-sentinel-dim dark:text-slate-400 font-medium px-1">Password</label>
          <input id="reg-pass" type="password" bind:value={password} on:blur={() => markTouched('password')} on:input={() => { if (touched.password) validate(); }} required class="hud-input h-11 {touched.password && fieldErrors.password ? '!border-red-400 dark:!border-red-500' : ''}" placeholder="Min. 8 characters" />
          {#if touched.password && fieldErrors.password}
            <div class="text-[10px] text-red-500 px-1" in:fade>{fieldErrors.password}</div>
          {/if}
          <!-- Password Strength Bar -->
          {#if password.length > 0}
            <div class="flex items-center gap-2 px-1 pt-1">
              <div class="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div class="h-full rounded-full transition-all duration-300 {strengthInfo.color}" style="width: {Math.min(pwStrength * 20, 100)}%"></div>
              </div>
              <span class="text-[10px] font-bold {strengthInfo.textColor}">{strengthInfo.label}</span>
            </div>
          {/if}
        </div>

        <div class="space-y-1.5">
          <label for="confirm-pass" class="text-sm text-sentinel-dim dark:text-slate-400 font-medium px-1">Confirm Password</label>
          <input id="confirm-pass" type="password" bind:value={confirmPassword} on:blur={() => markTouched('confirmPassword')} required class="hud-input h-11 {touched.confirmPassword && fieldErrors.confirmPassword ? '!border-red-400 dark:!border-red-500' : ''}" placeholder="Re-enter password" />
          {#if touched.confirmPassword && fieldErrors.confirmPassword}
            <div class="text-[10px] text-red-500 px-1" in:fade>{fieldErrors.confirmPassword}</div>
          {/if}
        </div>

        <button type="submit" disabled={submitting}
          class="w-full hud-button hud-button-accent py-3.5 text-xs tracking-[0.3em] font-bold mt-4">
          {submitting ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <div class="pt-4 border-t border-slate-200 dark:border-slate-700 text-center text-sm text-sentinel-dim dark:text-slate-400">
          Already have an account? <a href="/login" class="text-sentinel-optimal hover:underline font-bold">Sign In</a>
      </div>
    </div>
  </div>
</div>

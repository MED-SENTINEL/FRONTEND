<script>
  import { shareApi } from '$lib/api/client';
  import { addSession } from '$lib/stores/doctor';
  import { goto } from '$app/navigation';
  import { fade, fly } from 'svelte/transition';

  let shareKey = '';
  let passcode = '';
  let loading = false;
  let errorMsg = '';
  let success = false;

  async function accessPatient() {
    if (!shareKey.trim() || !passcode.trim()) {
      errorMsg = 'Both access key and passcode are required';
      return;
    }
    loading = true;
    errorMsg = '';
    success = false;
    try {
      const result = await shareApi.validate(shareKey.trim(), passcode.trim());
      
      // Save session to localStorage
      addSession({
        shareKey: shareKey.trim(),
        passcode: passcode.trim(),
        patientData: result,
      });

      success = true;
      
      // Navigate to patient review after a short delay
      setTimeout(() => goto('/doctor/patient'), 800);
    } catch (err) {
      errorMsg = err.message || 'Access denied. Invalid key or passcode.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="space-y-8">
  <!-- Header -->
  <div class="border-b border-slate-200 dark:border-slate-700 pb-8" in:fade>
    <div class="space-y-2">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 mb-2">
        <svg class="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
        <span class="text-xs font-semibold text-emerald-700">Secure Access</span>
      </div>
      <h1 class="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">Access Patient Records</h1>
      <p class="text-sm text-slate-400 dark:text-slate-500">Enter the access key and passcode provided by your patient.</p>
    </div>
  </div>

  <!-- Access Form -->
  <div class="max-w-lg mx-auto" in:fly={{ y: 20 }}>
    <div class="p-8 rounded-2xl bg-white dark:bg-sentinel-dark-surface-0 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
      <div class="text-center space-y-3">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 mx-auto">
          <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div class="text-xs font-bold text-slate-700 dark:text-slate-200">Verified Patient Access</div>
        <p class="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
          This creates a secure, audited session. The patient will be notified of your access.
        </p>
      </div>

      {#if success}
        <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center" in:fade>
          <div class="text-emerald-700 font-bold text-sm">✓ Access Granted</div>
          <div class="text-xs text-emerald-600 mt-1">Redirecting to patient records...</div>
        </div>
      {/if}

      {#if errorMsg}
        <div class="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 text-center" in:fade>
          <span class="font-bold">Access Denied:</span> {errorMsg}
        </div>
      {/if}

      <form on:submit|preventDefault={accessPatient} class="space-y-5">
        <div class="space-y-1.5">
          <label for="shareKey" class="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold px-1">Access Key (UUID)</label>
          <input
            id="shareKey" type="text"
            bind:value={shareKey} required
            class="w-full px-4 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-sentinel-dark-surface-1 focus:bg-white dark:bg-sentinel-dark-surface-0 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 outline-none transition-all font-mono"
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          />
        </div>
        <div class="space-y-1.5">
          <label for="passcode" class="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold px-1">Passcode</label>
          <input
            id="passcode" type="password"
            bind:value={passcode} required maxlength="6"
            class="w-full px-4 py-3 text-lg border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-sentinel-dark-surface-1 focus:bg-white dark:bg-sentinel-dark-surface-0 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 outline-none transition-all font-mono tracking-[0.5em] text-center"
            placeholder="••••"
          />
        </div>
        <button
          type="submit" disabled={loading || success}
          class="w-full py-3.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-40 transition-all tracking-wide"
        >
          {#if loading}
            Verifying...
          {:else if success}
            Access Granted ✓
          {:else}
            Access Patient Records
          {/if}
        </button>
      </form>
    </div>
  </div>
</div>

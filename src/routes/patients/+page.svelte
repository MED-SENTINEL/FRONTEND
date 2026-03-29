<script>
  import { shareApi } from '$lib/api/client';
  import { fade, fly, slide } from 'svelte/transition';

  let shareKey = '';
  let passcode = '';
  let loading = false;
  let errorMsg = '';

  let patientData = null;

  async function accessPatient() {
    if (!shareKey.trim() || !passcode.trim()) {
      errorMsg = 'SHARE KEY AND PASSCODE ARE REQUIRED';
      return;
    }
    loading = true;
    errorMsg = '';
    patientData = null;
    try {
      const result = await shareApi.validate(shareKey.trim(), passcode.trim());
      patientData = result;
    } catch (err) {
      errorMsg = err.message || 'ACCESS_DENIED';
    } finally {
      loading = false;
    }
  }

  function disconnect() {
    patientData = null;
    shareKey = '';
    passcode = '';
    errorMsg = '';
  }

  function getRiskColor(severity) {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'hud-text-critical';
      case 'high': return 'hud-text-critical';
      case 'medium': return 'text-sentinel-warning';
      default: return 'text-sentinel-optimal';
    }
  }
</script>

<div class="space-y-12">
  <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-10" in:fade>
    <div class="space-y-2">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sentinel-accent/5 border border-sentinel-accent/20 mb-2">
        <svg class="w-3 h-3 text-sentinel-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span class="text-[9px] font-bold text-sentinel-accent tracking-widest uppercase italic">DOCTOR_ACCESS_PORTAL</span>
      </div>
      <h1 class="text-4xl font-bold tracking-tight text-sentinel-text uppercase leading-tight">
        PATIENT <span class="text-sentinel-accent italic font-black">ACCESS</span>
      </h1>
      <div class="text-[10px] text-sentinel-dim tracking-[0.3em] uppercase font-mono">SHARED_DATA_GATEWAY // ENCRYPTED_LINK // READ_ONLY</div>
    </div>

    {#if patientData}
      <button on:click={disconnect} class="hud-button !border-sentinel-critical/30 !text-sentinel-critical hover:!bg-sentinel-critical/10">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        DISCONNECT
      </button>
    {/if}
  </div>

  {#if !patientData}
    <!-- Access Form -->
    <div class="max-w-lg mx-auto" in:fade>
      <div class="hud-panel p-10 bg-white border-slate-200 space-y-8">
        <div class="text-center space-y-3">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-sentinel-accent/5 border border-sentinel-accent/20 mx-auto">
            <svg class="w-10 h-10 text-sentinel-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <div class="text-xs font-bold text-sentinel-text uppercase tracking-[0.3em]">ENTER PATIENT SHARE KEY</div>
          <p class="text-[10px] text-sentinel-dim uppercase tracking-wider max-w-xs mx-auto">
            INPUT THE SHARE KEY AND PASSCODE PROVIDED BY YOUR PATIENT TO ACCESS THEIR BIO-TWIN DATA.
          </p>
        </div>

        {#if errorMsg}
          <div class="p-4 rounded-lg bg-sentinel-critical/10 border border-sentinel-critical/20 text-[10px] hud-text-critical uppercase tracking-widest leading-relaxed text-center" in:fade>
            <span class="font-bold">ACCESS DENIED:</span> {errorMsg}
          </div>
        {/if}

        <form on:submit|preventDefault={accessPatient} class="space-y-6">
          <div class="space-y-2">
            <label for="shareKey" class="text-[9px] text-sentinel-dim tracking-[0.2em] uppercase font-bold px-1">SHARE KEY (UUID)</label>
            <input
              id="shareKey"
              type="text"
              bind:value={shareKey}
              required
              class="hud-input font-mono text-sm"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            />
          </div>

          <div class="space-y-2">
            <label for="passcode" class="text-[9px] text-sentinel-dim tracking-[0.2em] uppercase font-bold px-1">PASSCODE (4-6 DIGITS)</label>
            <input
              id="passcode"
              type="password"
              bind:value={passcode}
              required
              maxlength="6"
              class="hud-input font-mono text-lg tracking-[0.5em]"
              placeholder="••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            class="w-full hud-button py-3.5 text-xs tracking-[0.3em]"
          >
            {#if loading}
              <div class="w-4 h-4 border-2 border-white/20 border-t-sentinel-optimal rounded-full animate-spin"></div>
              DECRYPTING_ACCESS...
            {:else}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              ACCESS PATIENT DATA
            {/if}
          </button>
        </form>
      </div>
    </div>
  {:else}
    <!-- Patient Data View -->
    <div class="space-y-10" in:fly={{ y: 20 }}>
      <!-- Access Info Bar -->
      <div class="hud-panel p-4 bg-sentinel-optimal/5 border-sentinel-optimal/20 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-2 h-2 rounded-full bg-sentinel-optimal animate-pulse"></div>
          <span class="text-[10px] font-bold text-sentinel-optimal uppercase tracking-[0.2em]">SECURE_CONNECTION_ACTIVE</span>
        </div>
        <div class="flex gap-6 text-[9px] font-mono text-sentinel-dim uppercase">
          <span>PERMISSIONS: <span class="text-sentinel-optimal font-bold">{patientData.permissions}</span></span>
          <span>USES_REMAINING: <span class="text-sentinel-optimal font-bold">{patientData.usage_remaining}</span></span>
          <span>EXPIRES: <span class="text-sentinel-optimal font-bold">{new Date(patientData.key_expires_at).toLocaleDateString()}</span></span>
        </div>
      </div>

      <!-- Patient Profile -->
      <div class="hud-panel p-8 bg-white border-slate-200 space-y-6">
        <div class="text-xs font-bold text-sentinel-text uppercase tracking-[0.3em] border-b border-slate-200 pb-4 flex items-center gap-2">
          <svg class="w-4 h-4 text-sentinel-optimal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          PATIENT_PROFILE
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="space-y-1">
            <span class="text-[8px] text-sentinel-dim uppercase font-bold tracking-widest block">FULL NAME</span>
            <span class="text-sm font-bold text-sentinel-text uppercase">{patientData.patient_profile?.full_name || 'N/A'}</span>
          </div>
          <div class="space-y-1">
            <span class="text-[8px] text-sentinel-dim uppercase font-bold tracking-widest block">DATE OF BIRTH</span>
            <span class="text-sm font-mono text-sentinel-text">{patientData.patient_profile?.date_of_birth || 'N/A'}</span>
          </div>
          <div class="space-y-1">
            <span class="text-[8px] text-sentinel-dim uppercase font-bold tracking-widest block">BLOOD TYPE</span>
            <span class="text-sm font-bold text-sentinel-optimal">{patientData.patient_profile?.blood_type || 'N/A'}</span>
          </div>
          <div class="space-y-1">
            <span class="text-[8px] text-sentinel-dim uppercase font-bold tracking-widest block">EMAIL</span>
            <span class="text-xs font-mono text-sentinel-dim">{patientData.patient_profile?.email || 'N/A'}</span>
          </div>
        </div>
      </div>


      <!-- Lab Reports -->
      {#if patientData.lab_reports && patientData.lab_reports.length > 0}
        <div class="hud-panel p-8 bg-white border-slate-200 space-y-6" in:fade={{ delay: 200 }}>
          <div class="text-xs font-bold text-sentinel-text uppercase tracking-[0.3em] border-b border-slate-200 pb-4 flex items-center gap-2">
            <svg class="w-4 h-4 text-sentinel-optimal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            LAB_REPORTS ({patientData.lab_reports.length})
          </div>
          <div class="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
            {#each patientData.lab_reports as report, i}
              <div class="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-sentinel-optimal/20 transition-all">
                <div class="flex justify-between items-center mb-3">
                  <span class="text-sm font-bold text-sentinel-text uppercase">{report.report_type || 'GENERAL'}</span>
                  <span class="text-[9px] font-mono text-sentinel-dim">{report.report_date || 'N/A'}</span>
                </div>
                <div class="flex gap-6 text-[10px]">
                  {#if report.lab_name}
                    <span class="text-sentinel-dim">LAB: <span class="text-sentinel-text font-bold">{report.lab_name}</span></span>
                  {/if}
                  {#if report.file_name}
                    <span class="text-sentinel-dim">FILE: <span class="text-sentinel-text font-mono">{report.file_name}</span></span>
                  {/if}
                </div>
                {#if report.extracted_data && typeof report.extracted_data === 'object'}
                  <div class="mt-3 pt-3 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {#each Object.entries(report.extracted_data).filter(([k]) => !['lab_name', 'report_type', 'report_date', 'raw_text'].includes(k)) as [key, value]}
                      <div class="space-y-0.5">
                        <span class="text-[8px] text-sentinel-dim uppercase block">{key.replace(/_/g, ' ')}</span>
                        <span class="text-[10px] font-mono text-sentinel-text">{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Trauma Pins -->
      {#if patientData.trauma_pins && patientData.trauma_pins.length > 0}
        <div class="hud-panel p-8 bg-white border-slate-200 space-y-6" in:fade={{ delay: 300 }}>
          <div class="text-xs font-bold text-sentinel-text uppercase tracking-[0.3em] border-b border-slate-200 pb-4 flex items-center gap-2">
            <svg class="w-4 h-4 text-sentinel-critical" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            TRAUMA_MAP ({patientData.trauma_pins.length})
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {#each patientData.trauma_pins as pin}
              <div class="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-sentinel-critical/20 transition-all">
                <div class="flex justify-between items-start mb-3">
                  <span class="text-sm font-bold text-sentinel-text uppercase">{pin.title || 'TRAUMA EVENT'}</span>
                  <span class="text-[9px] font-bold uppercase tracking-widest {getRiskColor(pin.severity)}">{pin.severity || 'N/A'}</span>
                </div>
                <div class="flex gap-4 text-[10px] text-sentinel-dim">
                  {#if pin.trauma_type}
                    <span>TYPE: <span class="text-sentinel-text font-bold uppercase">{pin.trauma_type}</span></span>
                  {/if}
                  {#if pin.body_region}
                    <span>REGION: <span class="text-sentinel-text font-bold uppercase">{pin.body_region}</span></span>
                  {/if}
                  {#if pin.occurred_at}
                    <span>DATE: <span class="text-sentinel-text font-mono">{pin.occurred_at}</span></span>
                  {/if}
                </div>
                {#if pin.notes}
                  <div class="mt-3 pt-3 border-t border-slate-200 text-[10px] text-sentinel-dim uppercase tracking-wider">{pin.notes}</div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- No Data Messages -->
      {#if (!patientData.lab_reports || patientData.lab_reports.length === 0) && (!patientData.trauma_pins || patientData.trauma_pins.length === 0)}
        <div class="hud-panel p-16 text-center bg-white border-dashed border-slate-200 opacity-60">
          <div class="text-[10px] text-sentinel-dim uppercase tracking-[0.4em]">NO_DATA_AVAILABLE_FOR_THIS_PERMISSION_LEVEL</div>
        </div>
      {/if}
    </div>
  {/if}
</div>

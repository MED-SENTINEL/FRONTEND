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
      errorMsg = 'Access key and passcode are required';
      return;
    }
    loading = true;
    errorMsg = '';
    patientData = null;
    try {
      const result = await shareApi.validate(shareKey.trim(), passcode.trim());
      patientData = result;
    } catch (err) {
      errorMsg = err.message || 'Access Denied';
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

  let timeline = [];

  $: if (patientData) {
    const reports = (patientData.lab_reports || []).map(r => ({
      type: 'report',
      date: r.report_date || r.uploaded_at,
      title: r.label || 'Lab Report',
      summary: [r.lab_name, r.file_name].filter(Boolean).join(' — '),
      id: r.id,
      original: r
    }));

    const pins = (patientData.trauma_pins || []).map(p => ({
      type: 'trauma',
      date: p.occurred_at || p.created_at,
      title: p.title || 'Medical Event',
      summary: [p.severity ? `Severity: ${p.severity}` : null, p.body_region, p.notes].filter(Boolean).join(' • '),
      id: p.id,
      original: p
    }));

    timeline = [...reports, ...pins].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function openDocument(reportId) {
    const url = shareApi.getFileUrl(shareKey.trim(), passcode.trim(), reportId);
    window.open(url, '_blank');
  }

  function getIcon(type) {
    switch (type) {
      case 'report': return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
      case 'trauma': return 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z';
      default: return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  function getColorClass(type) {
    switch (type) {
      case 'report': return 'text-sentinel-optimal border-sentinel-optimal/30 bg-sentinel-optimal/5';
      case 'trauma': return 'text-sentinel-critical border-sentinel-critical/30 bg-sentinel-critical/5';
      default: return 'text-sentinel-dim border-white/5 bg-white/5';
    }
  }

  function getIndicatorColor(type) {
    switch (type) {
      case 'report': return 'bg-sentinel-optimal';
      case 'trauma': return 'bg-sentinel-critical';
      default: return 'bg-sentinel-dim';
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
        <span class="text-xs font-semibold text-sentinel-accent">Provider Access Portal</span>
      </div>
      <h1 class="text-4xl font-bold tracking-tight text-sentinel-text leading-tight">
        View Patient <span class="text-sentinel-accent italic font-bold">Records</span>
      </h1>
      <div class="text-sm text-sentinel-dim font-medium">Securely access patient data using a shared access token.</div>
    </div>

    {#if patientData}
      <button on:click={disconnect} class="hud-button !border-sentinel-critical/30 !text-sentinel-critical hover:!bg-sentinel-critical/10">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        End Session
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
          <div class="text-xs font-bold text-sentinel-text">Enter Patient Access Key</div>
          <p class="text-xs text-sentinel-dim max-w-xs mx-auto">
            Please enter the access key and passcode provided by the patient to view their clinical records.
          </p>
        </div>

        {#if errorMsg}
          <div class="p-4 rounded-lg bg-sentinel-critical/10 border border-sentinel-critical/20 text-xs text-sentinel-critical leading-relaxed text-center" in:fade>
            <span class="font-bold">Access Denied:</span> {errorMsg}
          </div>
        {/if}

        <form on:submit|preventDefault={accessPatient} class="space-y-6">
          <div class="space-y-2">
            <label for="shareKey" class="text-[11px] text-sentinel-dim font-bold px-1">Access Key (UUID)</label>
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
            <label for="passcode" class="text-[11px] text-sentinel-dim font-bold px-1">Security Passcode (4-6 digits)</label>
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
              Verifying access...
            {:else}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              Access Patient Records
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
          <span class="text-xs font-bold text-sentinel-optimal">Secure Session Active</span>
        </div>
        <div class="flex gap-6 text-[10px] font-semibold text-sentinel-dim">
          <span>Access Level: <span class="text-sentinel-optimal">{patientData.permissions}</span></span>
          <span>Uses Remaining: <span class="text-sentinel-optimal">{patientData.usage_remaining}</span></span>
          <span>Expires: <span class="text-sentinel-optimal">{new Date(patientData.key_expires_at).toLocaleDateString()}</span></span>
        </div>
      </div>

      <!-- Patient Profile Summary -->
      <div class="hud-panel p-8 bg-white border-slate-200 space-y-6">
        <div class="text-sm font-bold text-sentinel-text border-b border-slate-200 pb-4 flex items-center gap-2">
          <svg class="w-4 h-4 text-sentinel-optimal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Patient Profile
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="space-y-1">
            <span class="text-[10px] text-sentinel-dim font-bold block">Full Name</span>
            <span class="text-sm font-bold text-sentinel-text">{patientData.patient_profile?.full_name || 'N/A'}</span>
          </div>
          <div class="space-y-1">
            <span class="text-[10px] text-sentinel-dim font-bold block">Date of Birth</span>
            <span class="text-sm font-semibold text-sentinel-text">{patientData.patient_profile?.date_of_birth || 'N/A'}</span>
          </div>
          <div class="space-y-1">
            <span class="text-[10px] text-sentinel-dim font-bold block">Blood Type</span>
            <span class="text-sm font-bold text-sentinel-optimal">{patientData.patient_profile?.blood_type || 'N/A'}</span>
          </div>
          <div class="space-y-1">
            <span class="text-[10px] text-sentinel-dim font-bold block">Email</span>
            <span class="text-xs font-semibold text-sentinel-dim">{patientData.patient_profile?.email || 'N/A'}</span>
          </div>
        </div>
      </div>

      <!-- Unified Clinical Timeline -->
      <div class="relative px-2">
        <div class="text-sm font-bold text-sentinel-text mb-8 flex items-center gap-2">
          <svg class="w-4 h-4 text-sentinel-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Clinical Health Timeline
        </div>

        <div class="relative">
          <!-- Vertical Continuity Line -->
          <div class="absolute left-10 top-0 bottom-0 w-px bg-gradient-to-b from-sentinel-optimal/40 via-sentinel-accent/40 to-transparent"></div>

          {#if timeline.length === 0}
            <div class="ml-24 p-20 text-center hud-panel border-dashed border-slate-200 bg-white opacity-40 rounded-3xl" in:fade>
              <div class="text-sm text-sentinel-dim font-bold">No clinical events recorded</div>
            </div>
          {:else}
            <div class="space-y-10">
              {#each timeline as event, i}
                <div class="relative flex items-start group" in:fly={{ x: -20, delay: i * 50 }}>
                  <!-- Temporal Marker -->
                  <div class="absolute left-[39.5px] top-8 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center z-20 group-hover:scale-125 transition-transform duration-500">
                    <div class="w-1.5 h-1.5 rounded-full {getIndicatorColor(event.type)}"></div>
                  </div>
                  
                  <!-- Event Card -->
                  <div class="ml-24 flex-1 hud-panel p-6 bg-white border-slate-200 group-hover:border-sentinel-optimal/30 transition-all duration-500 relative">
                    <div class="flex flex-col md:flex-row justify-between items-start gap-6">
                      <div class="flex items-center gap-5">
                        <div class="w-14 h-14 rounded-2xl border flex items-center justify-center transition-transform duration-500 group-hover:rotate-12 {getColorClass(event.type)}">
                          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d={getIcon(event.type)} />
                          </svg>
                        </div>
                        <div class="space-y-1">
                          <div class="text-[10px] text-sentinel-dim font-bold block mb-1 uppercase tracking-tight">{event.type}</div>
                          <div class="text-lg font-bold text-sentinel-text tracking-tight group-hover:text-sentinel-optimal transition-colors">{event.title}</div>
                        </div>
                      </div>
                      
                      <div class="flex flex-col md:items-end gap-3">
                        <div class="text-left md:text-right space-y-1">
                          <div class="text-[10px] text-sentinel-dim font-bold">Event Date</div>
                          <div class="text-xs font-bold text-sentinel-text">
                            {new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                        </div>

                        {#if event.type === 'report'}
                          <button 
                            on:click={() => openDocument(event.id)}
                            class="hud-button !py-1.5 !px-3 !text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            View Document
                          </button>
                        {/if}
                      </div>
                    </div>

                    {#if event.summary}
                      <div class="mt-6 pt-6 border-t border-slate-100">
                        <div class="text-xs text-sentinel-muted leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-200 group-hover:bg-sentinel-optimal/5 group-hover:border-sentinel-optimal/10 transition-all">
                          {event.summary}
                        </div>
                      </div>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

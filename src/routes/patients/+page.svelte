<script>
  import { shareApi } from '$lib/api/client';
  import { fade, fly, slide } from 'svelte/transition';

  let shareKey = '';
  let passcode = '';
  let loading = false;
  let errorMsg = '';

  let patientData = null;
  let activeTab = 'overview';

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
    activeTab = 'overview';
  }

  function openDocument(reportId) {
    const url = shareApi.getFileUrl(shareKey.trim(), passcode.trim(), reportId);
    window.open(url, '_blank');
  }

  function getStatusColor(status) {
    switch (status) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'elevated': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    }
  }

  function getRiskColor(level) {
    switch (level?.toUpperCase()) {
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-300';
      case 'MODERATE': return 'text-amber-600 bg-amber-50 border-amber-300';
      default: return 'text-emerald-600 bg-emerald-50 border-emerald-300';
    }
  }

  $: tabs = [
    { id: 'overview', label: 'Overview', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'bloodwork', label: 'Bloodwork', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { id: 'insights', label: 'Health Insights', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'trauma', label: '3D Trauma Map', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
    { id: 'reports', label: 'Lab Reports', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  ];
</script>

<div class="space-y-8">
  <!-- ═══ HEADER ═══ -->
  <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8" in:fade>
    <div class="space-y-2">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sentinel-accent/5 border border-sentinel-accent/20 mb-2">
        <svg class="w-3 h-3 text-sentinel-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span class="text-xs font-semibold text-sentinel-accent">Provider Access Portal</span>
      </div>
      <h1 class="text-4xl font-bold tracking-tight text-sentinel-text leading-tight">
        Patient <span class="text-sentinel-accent italic font-bold">Records</span>
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
    <!-- ═══ ACCESS FORM ═══ -->
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
            Enter the access key and passcode provided by the patient.
          </p>
        </div>

        {#if errorMsg}
          <div class="p-4 rounded-lg bg-sentinel-critical/10 border border-sentinel-critical/20 text-xs text-sentinel-critical text-center" in:fade>
            <span class="font-bold">Access Denied:</span> {errorMsg}
          </div>
        {/if}

        <form on:submit|preventDefault={accessPatient} class="space-y-6">
          <div class="space-y-2">
            <label for="shareKey" class="text-[11px] text-sentinel-dim font-bold px-1">Access Key (UUID)</label>
            <input id="shareKey" type="text" bind:value={shareKey} required class="hud-input font-mono text-sm" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
          </div>
          <div class="space-y-2">
            <label for="passcode" class="text-[11px] text-sentinel-dim font-bold px-1">Security Passcode</label>
            <input id="passcode" type="password" bind:value={passcode} required maxlength="6" class="hud-input font-mono text-lg tracking-[0.5em]" placeholder="••••" />
          </div>
          <button type="submit" disabled={loading} class="w-full hud-button py-3.5 text-xs tracking-[0.3em]">
            {#if loading}
              <div class="w-4 h-4 border-2 border-white/20 border-t-sentinel-optimal rounded-full animate-spin"></div>
              Verifying...
            {:else}
              Access Patient Records
            {/if}
          </button>
        </form>
      </div>
    </div>
  {:else}
    <!-- ═══ DOCTOR DASHBOARD ═══ -->
    <div class="space-y-6" in:fly={{ y: 20 }}>
      <!-- Session Bar -->
      <div class="hud-panel p-4 bg-sentinel-optimal/5 border-sentinel-optimal/20 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-2 h-2 rounded-full bg-sentinel-optimal animate-pulse"></div>
          <span class="text-xs font-bold text-sentinel-optimal">Secure Session Active</span>
          <span class="text-xs font-bold text-sentinel-text ml-4">{patientData.patient_profile?.full_name || 'Patient'}</span>
        </div>
        <div class="flex gap-6 text-[10px] font-semibold text-sentinel-dim">
          <span>Access: <span class="text-sentinel-optimal">{patientData.permissions}</span></span>
          <span>Uses Left: <span class="text-sentinel-optimal">{patientData.usage_remaining}</span></span>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="flex gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
        {#each tabs as tab}
          <button
            on:click={() => activeTab = tab.id}
            class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap
              {activeTab === tab.id ? 'bg-white text-sentinel-optimal shadow-sm' : 'text-sentinel-dim hover:text-sentinel-text'}"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        {/each}
      </div>

      <!-- ═══ TAB: OVERVIEW ═══ -->
      {#if activeTab === 'overview'}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6" in:fade>
          <!-- Profile Card -->
          <div class="hud-panel p-6 bg-white border-slate-200 space-y-4">
            <div class="text-xs font-bold text-sentinel-dim uppercase tracking-wider flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-sentinel-optimal"></div> Patient Profile
            </div>
            <div class="grid grid-cols-2 gap-4">
              {#each [
                ['Full Name', patientData.patient_profile?.full_name],
                ['DOB', patientData.patient_profile?.date_of_birth],
                ['Gender', patientData.patient_profile?.gender],
                ['Blood Type', patientData.patient_profile?.blood_type],
                ['Height', patientData.patient_profile?.height_cm ? `${patientData.patient_profile.height_cm} cm` : null],
                ['Weight', patientData.patient_profile?.weight_kg ? `${patientData.patient_profile.weight_kg} kg` : null],
              ] as [label, value]}
                <div class="space-y-0.5">
                  <span class="text-[10px] text-sentinel-dim font-bold block uppercase">{label}</span>
                  <span class="text-sm font-bold text-sentinel-text">{value || 'N/A'}</span>
                </div>
              {/each}
            </div>
            {#if patientData.patient_profile?.allergies}
              <div class="pt-3 border-t border-slate-100">
                <span class="text-[10px] text-sentinel-critical font-bold block uppercase">Allergies</span>
                <span class="text-xs text-sentinel-text">{patientData.patient_profile.allergies}</span>
              </div>
            {/if}
            {#if patientData.patient_profile?.chronic_conditions}
              <div>
                <span class="text-[10px] text-amber-600 font-bold block uppercase">Chronic Conditions</span>
                <span class="text-xs text-sentinel-text">{patientData.patient_profile.chronic_conditions}</span>
              </div>
            {/if}
            {#if patientData.patient_profile?.current_medications}
              <div>
                <span class="text-[10px] text-blue-600 font-bold block uppercase">Current Medications</span>
                <span class="text-xs text-sentinel-text">{patientData.patient_profile.current_medications}</span>
              </div>
            {/if}
          </div>

          <!-- Quick Stats -->
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="hud-panel p-5 bg-white border-slate-200 text-center">
                <div class="text-3xl font-black text-sentinel-optimal">{(patientData.bloodwork || []).length}</div>
                <div class="text-[10px] text-sentinel-dim font-bold uppercase mt-1">Bloodwork Entries</div>
              </div>
              <div class="hud-panel p-5 bg-white border-slate-200 text-center">
                <div class="text-3xl font-black text-sentinel-accent">{(patientData.trauma_pins || []).length}</div>
                <div class="text-[10px] text-sentinel-dim font-bold uppercase mt-1">Trauma Records</div>
              </div>
              <div class="hud-panel p-5 bg-white border-slate-200 text-center">
                <div class="text-3xl font-black text-blue-600">{(patientData.lab_reports || []).length}</div>
                <div class="text-[10px] text-sentinel-dim font-bold uppercase mt-1">Lab Reports</div>
              </div>
              <div class="hud-panel p-5 bg-white border-slate-200 text-center">
                {#if patientData.health_insights}
                  <div class="text-xl font-black px-2 py-1 rounded-lg {getRiskColor(patientData.health_insights.risk_level)}">{patientData.health_insights.risk_level}</div>
                {:else}
                  <div class="text-xl font-black text-slate-300">—</div>
                {/if}
                <div class="text-[10px] text-sentinel-dim font-bold uppercase mt-1">Risk Level</div>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- ═══ TAB: BLOODWORK ═══ -->
      {#if activeTab === 'bloodwork'}
        <div class="space-y-4" in:fade>
          {#if (patientData.bloodwork || []).length === 0}
            <div class="hud-panel p-16 text-center opacity-40 border-dashed bg-white">
              <div class="text-sm text-sentinel-dim font-bold">No bloodwork entries on file</div>
            </div>
          {:else}
            {#each patientData.bloodwork as entry, i}
              <div class="hud-panel p-5 bg-white border-slate-200" in:fly={{ y: 15, delay: i * 40 }}>
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <div class="text-sm font-bold text-sentinel-text">{entry.label || 'Bloodwork Entry'}</div>
                    <div class="text-[11px] text-sentinel-dim font-mono">📅 {new Date(entry.test_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                  </div>
                  <div class="text-[10px] text-sentinel-dim font-bold">{Object.keys(entry.values || {}).length} tests</div>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {#each Object.entries(entry.values || {}) as [key, val]}
                    <div class="px-3 py-2 rounded-lg border {getStatusColor(val.status)}">
                      <div class="text-[10px] font-bold uppercase tracking-wider opacity-70">{key.replace(/_/g, ' ')}</div>
                      <div class="text-sm font-bold mt-0.5">{val.value} <span class="text-[9px] font-normal opacity-60">{val.unit}</span></div>
                      <div class="text-[8px] uppercase font-bold mt-0.5 opacity-60">{val.status}</div>
                    </div>
                  {/each}
                </div>
              </div>
            {/each}
          {/if}
        </div>
      {/if}

      <!-- ═══ TAB: HEALTH INSIGHTS ═══ -->
      {#if activeTab === 'insights'}
        <div class="space-y-6" in:fade>
          {#if !patientData.health_insights}
            <div class="hud-panel p-16 text-center opacity-40 border-dashed bg-white">
              <div class="text-sm text-sentinel-dim font-bold">No health insights generated yet</div>
              <p class="text-xs text-sentinel-dim/60 mt-2">Patient needs to run AI Analysis from their dashboard first.</p>
            </div>
          {:else}
            {@const ins = patientData.health_insights}
            <!-- Risk Level Banner -->
            <div class="hud-panel p-6 border-2 {getRiskColor(ins.risk_level)}">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-[10px] font-bold uppercase tracking-wider opacity-60">Overall Risk Level</div>
                  <div class="text-2xl font-black mt-1">{ins.risk_level}</div>
                </div>
                <div class="text-right">
                  <div class="text-[10px] font-bold uppercase tracking-wider opacity-60">Confidence</div>
                  <div class="text-lg font-bold">{ins.confidence || 0}%</div>
                </div>
              </div>
              {#if ins.summary}
                <div class="mt-4 pt-4 border-t border-current/10 text-xs leading-relaxed opacity-80">{ins.summary}</div>
              {/if}
            </div>

            <!-- Organ Risk Grid -->
            {#if ins.organ_risks}
              <div class="hud-panel p-6 bg-white border-slate-200">
                <div class="text-xs font-bold text-sentinel-dim uppercase tracking-wider mb-4">Organ System Risks</div>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {#each Object.entries(ins.organ_risks) as [organ, data]}
                    <div class="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                      <div class="text-[10px] font-bold uppercase text-sentinel-dim">{organ}</div>
                      <div class="flex items-center justify-between mt-1">
                        <span class="text-lg font-black text-sentinel-text">{data.score ?? 0}%</span>
                        <span class="text-[9px] font-bold px-2 py-0.5 rounded {
                          (data.score ?? 0) >= 50 ? 'bg-red-50 text-red-600' : (data.score ?? 0) >= 25 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                        }">{data.label || 'Normal'}</span>
                      </div>
                      {#if data.detail}
                        <div class="text-[9px] text-sentinel-dim mt-1 leading-relaxed">{data.detail}</div>
                      {/if}
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Key Findings -->
            {#if ins.key_findings?.length}
              <div class="hud-panel p-6 bg-white border-slate-200">
                <div class="text-xs font-bold text-sentinel-dim uppercase tracking-wider mb-3">Key Findings</div>
                <div class="space-y-2">
                  {#each ins.key_findings as finding}
                    <div class="flex items-start gap-2 text-xs text-sentinel-text">
                      <span class="text-sentinel-optimal mt-0.5">•</span>
                      <span>{finding}</span>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Recommendations -->
            {#if ins.recommendations?.length}
              <div class="hud-panel p-6 bg-sentinel-optimal/5 border-sentinel-optimal/20">
                <div class="text-xs font-bold text-sentinel-optimal uppercase tracking-wider mb-3">Recommendations</div>
                <div class="space-y-2">
                  {#each ins.recommendations as rec}
                    <div class="flex items-start gap-2 text-xs text-sentinel-text">
                      <span class="text-sentinel-optimal mt-0.5">→</span>
                      <span>{rec}</span>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          {/if}
        </div>
      {/if}

      <!-- ═══ TAB: TRAUMA MAP ═══ -->
      {#if activeTab === 'trauma'}
        <div class="space-y-4" in:fade>
          {#if (patientData.trauma_pins || []).length === 0}
            <div class="hud-panel p-16 text-center opacity-40 border-dashed bg-white">
              <div class="text-sm text-sentinel-dim font-bold">No trauma records on file</div>
            </div>
          {:else}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {#each patientData.trauma_pins as pin, i}
                <div class="hud-panel p-5 bg-white border-slate-200 hover:border-sentinel-critical/30 transition-all" in:fly={{ y: 15, delay: i * 40 }}>
                  <div class="flex items-start gap-4">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                      {pin.severity === 'critical' ? 'bg-red-50 text-red-600 border border-red-200' :
                       pin.severity === 'high' ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                       pin.severity === 'medium' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                       'bg-cyan-50 text-cyan-600 border border-cyan-200'}">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                    </div>
                    <div class="flex-1 space-y-1">
                      <div class="text-sm font-bold text-sentinel-text">{pin.title || pin.body_region || 'Trauma'}</div>
                      <div class="flex flex-wrap gap-2 text-[10px]">
                        <span class="px-2 py-0.5 rounded bg-slate-100 text-sentinel-dim font-bold">{(pin.trauma_type || '').replace(/_/g, ' ')}</span>
                        <span class="px-2 py-0.5 rounded font-bold uppercase
                          {pin.severity === 'critical' ? 'bg-red-100 text-red-700' :
                           pin.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                           'bg-slate-100 text-sentinel-dim'}">{pin.severity}</span>
                        <span class="px-2 py-0.5 rounded bg-slate-100 text-sentinel-dim font-bold">{pin.body_region}</span>
                      </div>
                      {#if pin.notes}
                        <div class="text-xs text-sentinel-dim mt-1">{pin.notes}</div>
                      {/if}
                      <div class="text-[9px] text-sentinel-dim/50 font-mono mt-1">
                        3D: ({pin.position_x?.toFixed(2)}, {pin.position_y?.toFixed(2)}, {pin.position_z?.toFixed(2)})
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}

      <!-- ═══ TAB: LAB REPORTS ═══ -->
      {#if activeTab === 'reports'}
        <div class="space-y-3" in:fade>
          {#if (patientData.lab_reports || []).length === 0}
            <div class="hud-panel p-16 text-center opacity-40 border-dashed bg-white">
              <div class="text-sm text-sentinel-dim font-bold">No lab reports on file</div>
            </div>
          {:else}
            {#each patientData.lab_reports as report, i}
              <div class="hud-panel p-5 bg-white border-slate-200 flex justify-between items-center group hover:border-sentinel-optimal/30 transition-all" in:fly={{ y: 10, delay: i * 30 }}>
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                    <svg class="w-5 h-5 text-sentinel-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div class="text-xs font-bold text-sentinel-text">{report.file_name}</div>
                    <div class="text-[10px] text-sentinel-dim">{new Date(report.uploaded_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <button
                  on:click={() => openDocument(report.id)}
                  class="px-4 py-2 rounded-lg border border-slate-200 text-[10px] font-bold text-sentinel-dim hover:text-sentinel-optimal hover:border-sentinel-optimal/30 transition-all opacity-0 group-hover:opacity-100"
                >
                  View Document
                </button>
              </div>
            {/each}
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div>

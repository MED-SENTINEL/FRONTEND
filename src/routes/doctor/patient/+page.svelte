<script>
  import { onMount } from 'svelte';
  import { activePatient, doctorSessions, switchPatient, activeShareKey } from '$lib/stores/doctor';
  import { shareApi, doctorApi } from '$lib/api/client';
  import { fade, fly } from 'svelte/transition';

  let activeTab = 'overview';
  let notes = [];
  let newNote = '';
  let noteCategory = 'observation';
  let noteLoading = false;
  let revalidating = false;

  // On mount, if no active patient but sessions exist, re-validate the first one
  onMount(async () => {
    if (!$activePatient && $doctorSessions.length > 0) {
      await revalidateSession($doctorSessions[0]);
    }
    if ($activePatient) {
      await loadNotes();
    }
  });

  async function revalidateSession(session) {
    revalidating = true;
    try {
      const result = await shareApi.validate(session.shareKey, session.passcode);
      activePatient.set(result);
      activeShareKey.set(session.shareKey);
    } catch (err) {
      console.error('Session expired or invalid:', err);
    } finally {
      revalidating = false;
    }
  }

  async function handleSessionSwitch(shareKey) {
    const session = switchPatient(shareKey);
    if (session) {
      await revalidateSession(session);
      await loadNotes();
    }
  }

  async function loadNotes() {
    if (!$activePatient?.patient_profile?.id) return;
    try {
      notes = await doctorApi.getNotes($activePatient.patient_profile.id);
    } catch { notes = []; }
  }

  async function createNote() {
    if (!newNote.trim() || !$activePatient) return;
    noteLoading = true;
    try {
      await doctorApi.createNote({
        patient_id: $activePatient.patient_profile.id,
        note_text: newNote.trim(),
        category: noteCategory,
      });
      newNote = '';
      await loadNotes();
    } catch (err) {
      console.error(err);
    } finally {
      noteLoading = false;
    }
  }

  async function deleteNote(noteId) {
    try {
      await doctorApi.deleteNote(noteId);
      await loadNotes();
    } catch (err) {
      console.error(err);
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'critical': return 'text-red-700 bg-red-50 border-red-200';
      case 'elevated': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'low': return 'text-blue-700 bg-blue-50 border-blue-200';
      default: return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    }
  }

  function getCategoryColor(cat) {
    switch (cat) {
      case 'diagnosis': return 'bg-red-50 text-red-700 border-red-200';
      case 'follow_up': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'prescription': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  }

  // Flagged values: filter abnormal from all bloodwork
  $: flaggedValues = ($activePatient?.bloodwork || []).flatMap(entry =>
    Object.entries(entry.values || {})
      .filter(([, val]) => val.status && val.status !== 'normal')
      .map(([key, val]) => ({ ...val, marker: key, testDate: entry.test_date, label: entry.label }))
  );

  $: tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'bloodwork', label: 'Bloodwork' },
    { id: 'flagged', label: `Flagged (${flaggedValues.length})` },
    { id: 'insights', label: 'Insights' },
    { id: 'trauma', label: 'Trauma Map' },
    { id: 'reports', label: 'Lab Reports' },
    { id: 'notes', label: 'Doctor Notes' },
  ];
</script>

<div class="space-y-6">
  {#if revalidating}
    <div class="p-12 text-center">
      <div class="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3"></div>
      <div class="text-sm text-slate-400">Loading patient data...</div>
    </div>
  {:else if !$activePatient}
    <div class="p-16 rounded-2xl border-2 border-dashed border-slate-200 text-center bg-white">
      <div class="text-sm font-semibold text-slate-500 mb-2">No patient selected</div>
      <a href="/doctor/access" class="text-xs text-emerald-600 font-bold hover:underline">
        Access a patient to begin →
      </a>
    </div>
  {:else}
    <!-- Session Switcher + Patient Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6" in:fade>
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-sm font-bold text-blue-700">
          {$activePatient.patient_profile?.full_name?.substring(0, 2).toUpperCase() || 'PT'}
        </div>
        <div>
          <h1 class="text-xl font-bold text-slate-800">{$activePatient.patient_profile?.full_name || 'Patient'}</h1>
          <div class="text-xs text-slate-400">
            {$activePatient.patient_profile?.gender || ''} · {$activePatient.patient_profile?.blood_type || 'Unknown blood type'} · {$activePatient.permissions} access
          </div>
        </div>
      </div>

      {#if $doctorSessions.length > 1}
        <select
          on:change={(e) => handleSessionSwitch(e.target.value)}
          class="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-emerald-300"
        >
          {#each $doctorSessions as session}
            <option value={session.shareKey} selected={session.shareKey === $activeShareKey}>
              {session.patientName}
            </option>
          {/each}
        </select>
      {/if}
    </div>

    <!-- Tab Navigation -->
    <div class="flex gap-1 p-1 bg-white rounded-xl border border-slate-200 overflow-x-auto">
      {#each tabs as tab}
        <button
          on:click={() => activeTab = tab.id}
          class="px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap
            {activeTab === tab.id ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-400 hover:text-slate-600 border border-transparent'}"
        >
          {tab.label}
        </button>
      {/each}
    </div>

    <!-- ═══ TAB: OVERVIEW ═══ -->
    {#if activeTab === 'overview'}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6" in:fade>
        <div class="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">Patient Profile</div>
          <div class="grid grid-cols-2 gap-4">
            {#each [
              ['Full Name', $activePatient.patient_profile?.full_name],
              ['DOB', $activePatient.patient_profile?.date_of_birth],
              ['Gender', $activePatient.patient_profile?.gender],
              ['Blood Type', $activePatient.patient_profile?.blood_type],
              ['Height', $activePatient.patient_profile?.height_cm ? `${$activePatient.patient_profile.height_cm} cm` : null],
              ['Weight', $activePatient.patient_profile?.weight_kg ? `${$activePatient.patient_profile.weight_kg} kg` : null],
            ] as [label, value]}
              <div class="space-y-0.5">
                <span class="text-[10px] text-slate-400 font-bold block uppercase">{label}</span>
                <span class="text-sm font-semibold text-slate-700">{value || 'N/A'}</span>
              </div>
            {/each}
          </div>
          {#if $activePatient.patient_profile?.allergies}
            <div class="pt-3 border-t border-slate-100">
              <span class="text-[10px] text-red-600 font-bold block uppercase">Allergies</span>
              <span class="text-xs text-slate-700">{$activePatient.patient_profile.allergies}</span>
            </div>
          {/if}
          {#if $activePatient.patient_profile?.chronic_conditions}
            <div>
              <span class="text-[10px] text-amber-600 font-bold block uppercase">Chronic Conditions</span>
              <span class="text-xs text-slate-700">{$activePatient.patient_profile.chronic_conditions}</span>
            </div>
          {/if}
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-5 rounded-2xl bg-white border border-slate-200 text-center">
            <div class="text-3xl font-bold text-slate-800">{($activePatient.bloodwork || []).length}</div>
            <div class="text-[10px] text-slate-400 font-bold uppercase mt-1">Bloodwork</div>
          </div>
          <div class="p-5 rounded-2xl bg-white border border-slate-200 text-center">
            <div class="text-3xl font-bold text-slate-800">{($activePatient.trauma_pins || []).length}</div>
            <div class="text-[10px] text-slate-400 font-bold uppercase mt-1">Trauma</div>
          </div>
          <div class="p-5 rounded-2xl bg-white border border-slate-200 text-center">
            <div class="text-3xl font-bold text-slate-800">{($activePatient.lab_reports || []).length}</div>
            <div class="text-[10px] text-slate-400 font-bold uppercase mt-1">Lab Reports</div>
          </div>
          <div class="p-5 rounded-2xl bg-white border border-slate-200 text-center">
            <div class="text-2xl font-bold {flaggedValues.length > 0 ? 'text-red-600' : 'text-emerald-600'}">
              {flaggedValues.length}
            </div>
            <div class="text-[10px] text-slate-400 font-bold uppercase mt-1">Flagged</div>
          </div>
        </div>
      </div>
    {/if}

    <!-- ═══ TAB: BLOODWORK ═══ -->
    {#if activeTab === 'bloodwork'}
      <div class="space-y-6" in:fade>
        {#if ($activePatient.bloodwork || []).length === 0}
          <div class="p-12 rounded-2xl border-2 border-dashed border-slate-200 text-center bg-white">
            <div class="text-sm text-slate-400">No bloodwork entries on file</div>
          </div>
        {:else}
          <!-- SVG Trend Charts for common markers -->
          {@const allMarkers = [...new Set(($activePatient.bloodwork || []).flatMap(e => Object.keys(e.values || {})))]}
          {#if allMarkers.length > 0}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {#each allMarkers.slice(0, 8) as marker}
                {@const points = ($activePatient.bloodwork || [])
                  .filter(e => e.values?.[marker])
                  .sort((a,b) => new Date(a.test_date) - new Date(b.test_date))
                  .map((e, i, arr) => ({
                    x: arr.length > 1 ? (i / (arr.length - 1)) * 280 + 30 : 170,
                    y: 120 - Math.min(Math.max(parseFloat(e.values[marker].value || 0), 0), 200) / 200 * 100,
                    value: e.values[marker].value,
                    unit: e.values[marker].unit,
                    status: e.values[marker].status,
                    date: e.test_date,
                  }))}
                {#if points.length > 0}
                  <div class="p-4 rounded-2xl bg-white border border-slate-200">
                    <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{marker.replace(/_/g, ' ')}</div>
                    <svg viewBox="0 0 320 140" class="w-full h-28">
                      <!-- Grid lines -->
                      <line x1="30" y1="20" x2="30" y2="120" stroke="#e2e8f0" stroke-width="1"/>
                      <line x1="30" y1="120" x2="310" y2="120" stroke="#e2e8f0" stroke-width="1"/>
                      <line x1="30" y1="70" x2="310" y2="70" stroke="#e2e8f0" stroke-width="0.5" stroke-dasharray="4"/>
                      <!-- Line path -->
                      {#if points.length > 1}
                        <polyline
                          points={points.map(p => `${p.x},${p.y}`).join(' ')}
                          fill="none"
                          stroke="#059669"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      {/if}
                      <!-- Data points -->
                      {#each points as point}
                        <circle
                          cx={point.x} cy={point.y} r="4"
                          fill={point.status === 'critical' ? '#dc2626' : point.status === 'elevated' ? '#d97706' : point.status === 'low' ? '#2563eb' : '#059669'}
                          stroke="white" stroke-width="2"
                        />
                        <text x={point.x} y={point.y - 10} text-anchor="middle" class="text-[8px] fill-slate-500 font-semibold">
                          {point.value}
                        </text>
                      {/each}
                    </svg>
                    <div class="text-[9px] text-slate-400 text-right">{points[points.length-1]?.value} {points[points.length-1]?.unit}</div>
                  </div>
                {/if}
              {/each}
            </div>
          {/if}

          <!-- Raw Data -->
          {#each $activePatient.bloodwork as entry, i}
            <div class="p-5 rounded-2xl bg-white border border-slate-200" in:fly={{ y: 15, delay: i * 40 }}>
              <div class="flex justify-between items-start mb-4">
                <div>
                  <div class="text-sm font-bold text-slate-700">{entry.label || 'Bloodwork'}</div>
                  <div class="text-[11px] text-slate-400 font-mono">📅 {new Date(entry.test_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                </div>
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

    <!-- ═══ TAB: FLAGGED VALUES ═══ -->
    {#if activeTab === 'flagged'}
      <div class="space-y-4" in:fade>
        {#if flaggedValues.length === 0}
          <div class="p-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
            <div class="text-emerald-700 font-bold text-sm">✓ All values within normal range</div>
            <div class="text-xs text-emerald-600 mt-1">No abnormal markers detected across bloodwork entries.</div>
          </div>
        {:else}
          <div class="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
            ⚠ {flaggedValues.length} abnormal value{flaggedValues.length > 1 ? 's' : ''} detected — review recommended
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            {#each flaggedValues as item, i}
              <div class="p-4 rounded-2xl bg-white border border-slate-200 hover:border-red-200 transition-all" in:fly={{ y: 10, delay: i * 30 }}>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold text-slate-700 uppercase">{item.marker.replace(/_/g, ' ')}</span>
                  <span class="text-[9px] px-2 py-0.5 rounded-full font-bold border {getStatusColor(item.status)}">{item.status}</span>
                </div>
                <div class="text-lg font-bold text-slate-800">{item.value} <span class="text-xs text-slate-400 font-normal">{item.unit}</span></div>
                <div class="text-[10px] text-slate-400 mt-1">{item.label} · {new Date(item.testDate).toLocaleDateString()}</div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    <!-- ═══ TAB: INSIGHTS ═══ -->
    {#if activeTab === 'insights'}
      <div class="space-y-6" in:fade>
        {#if !$activePatient.health_insights}
          <div class="p-12 rounded-2xl border-2 border-dashed border-slate-200 text-center bg-white">
            <div class="text-sm text-slate-400">No AI insights available</div>
            <div class="text-xs text-slate-400 mt-1">Patient needs to run AI Analysis from their dashboard.</div>
          </div>
        {:else}
          {@const ins = $activePatient.health_insights}
          <div class="p-6 rounded-2xl border-2 {ins.risk_level === 'HIGH' ? 'bg-red-50 border-red-200 text-red-700' : ins.risk_level === 'MODERATE' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[10px] font-bold uppercase tracking-wider opacity-60">Overall Risk Level</div>
                <div class="text-2xl font-bold mt-1">{ins.risk_level}</div>
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

          {#if ins.organ_risks}
            <div class="p-6 rounded-2xl bg-white border border-slate-200">
              <div class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Organ System Risks</div>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                {#each Object.entries(ins.organ_risks) as [organ, data]}
                  <div class="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div class="text-[10px] font-bold uppercase text-slate-500">{organ}</div>
                    <div class="flex items-center justify-between mt-1">
                      <span class="text-lg font-bold text-slate-800">{data.score ?? 0}%</span>
                      <span class="text-[9px] font-bold px-2 py-0.5 rounded {
                        (data.score ?? 0) >= 50 ? 'bg-red-50 text-red-600' : (data.score ?? 0) >= 25 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                      }">{data.label || 'Normal'}</span>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          {#if ins.key_findings?.length}
            <div class="p-6 rounded-2xl bg-white border border-slate-200">
              <div class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Key Findings</div>
              {#each ins.key_findings as finding}
                <div class="flex items-start gap-2 text-xs text-slate-700 mb-1.5">
                  <span class="text-emerald-600 mt-0.5">•</span><span>{finding}</span>
                </div>
              {/each}
            </div>
          {/if}

          {#if ins.recommendations?.length}
            <div class="p-6 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div class="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">Recommendations</div>
              {#each ins.recommendations as rec}
                <div class="flex items-start gap-2 text-xs text-slate-700 mb-1.5">
                  <span class="text-emerald-600">→</span><span>{rec}</span>
                </div>
              {/each}
            </div>
          {/if}
        {/if}
      </div>
    {/if}

    <!-- ═══ TAB: TRAUMA MAP ═══ -->
    {#if activeTab === 'trauma'}
      <div class="space-y-4" in:fade>
        {#if ($activePatient.trauma_pins || []).length === 0}
          <div class="p-12 rounded-2xl border-2 border-dashed border-slate-200 text-center bg-white">
            <div class="text-sm text-slate-400">No trauma records on file</div>
          </div>
        {:else}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {#each $activePatient.trauma_pins as pin, i}
              <div class="p-5 rounded-2xl bg-white border border-slate-200 hover:border-red-200 transition-all" in:fly={{ y: 15, delay: i * 40 }}>
                <div class="flex items-start gap-4">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                    {pin.severity === 'critical' ? 'bg-red-50 text-red-600 border border-red-200' :
                     pin.severity === 'high' ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                     'bg-slate-50 text-slate-500 border border-slate-200'}">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <div class="flex-1 space-y-1">
                    <div class="text-sm font-bold text-slate-700">{pin.title || pin.body_region || 'Trauma'}</div>
                    <div class="flex flex-wrap gap-2 text-[10px]">
                      <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold">{(pin.trauma_type || '').replace(/_/g, ' ')}</span>
                      <span class="px-2 py-0.5 rounded font-bold uppercase
                        {pin.severity === 'critical' ? 'bg-red-100 text-red-700' : pin.severity === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}">{pin.severity}</span>
                      <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold">{pin.body_region}</span>
                    </div>
                    {#if pin.notes}
                      <div class="text-xs text-slate-400 mt-1">{pin.notes}</div>
                    {/if}
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
        {#if ($activePatient.lab_reports || []).length === 0}
          <div class="p-12 rounded-2xl border-2 border-dashed border-slate-200 text-center bg-white">
            <div class="text-sm text-slate-400">No lab reports on file</div>
          </div>
        {:else}
          {#each $activePatient.lab_reports as report, i}
            <div class="p-5 rounded-2xl bg-white border border-slate-200 flex justify-between items-center group hover:border-emerald-200 transition-all" in:fly={{ y: 10, delay: i * 30 }}>
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                  <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div class="text-xs font-bold text-slate-700">{report.file_name}</div>
                  <div class="text-[10px] text-slate-400">{new Date(report.uploaded_at).toLocaleDateString()}</div>
                </div>
              </div>
              <button
                on:click={() => {
                  const url = shareApi.getFileUrl($activeShareKey, $doctorSessions.find(s => s.shareKey === $activeShareKey)?.passcode, report.id);
                  window.open(url, '_blank');
                }}
                class="px-4 py-2 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-400 hover:text-emerald-600 hover:border-emerald-300 transition-all opacity-0 group-hover:opacity-100"
              >
                View
              </button>
            </div>
          {/each}
        {/if}
      </div>
    {/if}

    <!-- ═══ TAB: DOCTOR NOTES ═══ -->
    {#if activeTab === 'notes'}
      <div class="space-y-6" in:fade>
        <!-- Create Note -->
        <div class="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">New Clinical Note</div>
          <div class="flex gap-3">
            <select bind:value={noteCategory} class="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:border-emerald-300">
              <option value="observation">Observation</option>
              <option value="diagnosis">Diagnosis</option>
              <option value="follow_up">Follow-up</option>
              <option value="prescription">Prescription</option>
            </select>
          </div>
          <textarea
            bind:value={newNote}
            rows="3"
            placeholder="Write your clinical note..."
            class="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 outline-none transition-all resize-none"
          ></textarea>
          <button
            on:click={createNote}
            disabled={!newNote.trim() || noteLoading}
            class="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-40 transition-all"
          >
            {noteLoading ? 'Saving...' : 'Save Note'}
          </button>
        </div>

        <!-- Notes List -->
        {#if notes.length === 0}
          <div class="p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center bg-white">
            <div class="text-sm text-slate-400">No notes yet for this patient</div>
          </div>
        {:else}
          {#each notes as note, i}
            <div class="p-5 rounded-2xl bg-white border border-slate-200 group" in:fly={{ y: 10, delay: i * 30 }}>
              <div class="flex items-start justify-between mb-2">
                <span class="text-[9px] px-2 py-0.5 rounded-full font-bold border {getCategoryColor(note.category)}">
                  {note.category.replace(/_/g, ' ')}
                </span>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] text-slate-400">{new Date(note.created_at).toLocaleString()}</span>
                  <button
                    on:click={() => deleteNote(note.id)}
                    class="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div class="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{note.note_text}</div>
            </div>
          {/each}
        {/if}
      </div>
    {/if}
  {/if}
</div>

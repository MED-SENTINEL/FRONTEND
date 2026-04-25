<script>
  import { onMount } from 'svelte';
  import { currentUser } from '$lib/stores/auth';
  import { bloodworkApi } from '$lib/api/client';
  import { fade, fly, slide } from 'svelte/transition';

  // ─── State ───
  let entries = [];
  let loading = false;
  let saving = false;
  let errorMsg = '';
  let successMsg = '';
  let showForm = false;

  // ─── Form State ───
  let testDate = new Date().toISOString().split('T')[0];
  let label = '';
  let selectedTests = [];

  // ─── Predefined Tests (grouped by category) ───
  const testCategories = [
    {
      name: 'Blood Count',
      icon: '🩸',
      tests: [
        { key: 'hemoglobin', label: 'Hemoglobin', unit: 'g/dL', ref: '13.5-17.5' },
        { key: 'rbc_count', label: 'RBC Count', unit: 'million/µL', ref: '4.5-5.5' },
        { key: 'wbc_count', label: 'WBC Count', unit: '/µL', ref: '4000-11000' },
        { key: 'platelet_count', label: 'Platelet Count', unit: '/µL', ref: '150000-400000' },
      ],
    },
    {
      name: 'Metabolic',
      icon: '⚡',
      tests: [
        { key: 'blood_glucose_fasting', label: 'Blood Glucose (Fasting)', unit: 'mg/dL', ref: '70-100' },
        { key: 'blood_glucose_random', label: 'Blood Glucose (Random)', unit: 'mg/dL', ref: '70-140' },
        { key: 'hba1c', label: 'HbA1c', unit: '%', ref: '<5.7' },
        { key: 'sodium', label: 'Sodium', unit: 'mEq/L', ref: '136-145' },
        { key: 'potassium', label: 'Potassium', unit: 'mEq/L', ref: '3.5-5.0' },
        { key: 'cortisol', label: 'Cortisol', unit: 'µg/dL', ref: '6-23' },
      ],
    },
    {
      name: 'Kidney',
      icon: '🫘',
      tests: [
        { key: 'creatinine', label: 'Creatinine', unit: 'mg/dL', ref: '0.7-1.3' },
        { key: 'egfr', label: 'eGFR', unit: 'mL/min', ref: '>90' },
        { key: 'bun', label: 'BUN', unit: 'mg/dL', ref: '7-20' },
      ],
    },
    {
      name: 'Cardiac / Lipids',
      icon: '❤️',
      tests: [
        { key: 'total_cholesterol', label: 'Total Cholesterol', unit: 'mg/dL', ref: '<200' },
        { key: 'ldl_cholesterol', label: 'LDL Cholesterol', unit: 'mg/dL', ref: '<130' },
        { key: 'hdl_cholesterol', label: 'HDL Cholesterol', unit: 'mg/dL', ref: '>40' },
        { key: 'triglycerides', label: 'Triglycerides', unit: 'mg/dL', ref: '<150' },
      ],
    },
    {
      name: 'Liver',
      icon: '🟤',
      tests: [
        { key: 'alt', label: 'ALT (SGPT)', unit: 'U/L', ref: '<40' },
        { key: 'ast', label: 'AST (SGOT)', unit: 'U/L', ref: '<40' },
      ],
    },
    {
      name: 'Thyroid',
      icon: '🦋',
      tests: [
        { key: 'tsh', label: 'TSH', unit: 'mIU/L', ref: '0.4-4.0' },
      ],
    },
  ];

  // Build flat lookup
  const testLookup = {};
  testCategories.forEach(cat => cat.tests.forEach(t => { testLookup[t.key] = t; }));

  // ─── Values map: test_key -> user-entered value ───
  let valueInputs = {};

  function toggleTest(testKey) {
    if (selectedTests.includes(testKey)) {
      selectedTests = selectedTests.filter(k => k !== testKey);
      delete valueInputs[testKey];
    } else {
      selectedTests = [...selectedTests, testKey];
      valueInputs[testKey] = '';
    }
  }

  function computeStatus(testKey, value) {
    const ref = testLookup[testKey]?.ref || '';
    const v = parseFloat(value);
    if (isNaN(v)) return 'normal';

    // Parse reference ranges
    if (ref.startsWith('<')) {
      const max = parseFloat(ref.slice(1));
      return v > max * 1.5 ? 'critical' : v > max ? 'elevated' : 'normal';
    }
    if (ref.startsWith('>')) {
      const min = parseFloat(ref.slice(1));
      return v < min * 0.5 ? 'critical' : v < min ? 'low' : 'normal';
    }
    const parts = ref.split('-').map(Number);
    if (parts.length === 2) {
      const [lo, hi] = parts;
      if (v < lo * 0.5 || v > hi * 2) return 'critical';
      if (v < lo) return 'low';
      if (v > hi) return 'elevated';
      return 'normal';
    }
    return 'normal';
  }

  async function loadEntries() {
    if (!$currentUser) return;
    loading = true;
    try {
      entries = await bloodworkApi.list($currentUser.id);
    } catch (err) {
      errorMsg = err.message;
    } finally {
      loading = false;
    }
  }

  async function submitBloodwork() {
    if (selectedTests.length === 0) {
      errorMsg = 'Please select at least one test and enter a value.';
      return;
    }

    const values = {};
    for (const key of selectedTests) {
      const val = parseFloat(valueInputs[key]);
      if (isNaN(val)) {
        errorMsg = `Please enter a valid number for ${testLookup[key]?.label || key}.`;
        return;
      }
      values[key] = {
        value: val,
        unit: testLookup[key]?.unit || '',
        reference_range: testLookup[key]?.ref || '',
        status: computeStatus(key, val),
      };
    }

    saving = true;
    errorMsg = '';
    try {
      await bloodworkApi.create({
        test_date: testDate,
        label: label || null,
        values,
      });
      successMsg = 'Bloodwork saved successfully!';
      // Reset form
      selectedTests = [];
      valueInputs = {};
      label = '';
      showForm = false;
      await loadEntries();
      setTimeout(() => { successMsg = ''; }, 3000);
    } catch (err) {
      errorMsg = err.message;
    } finally {
      saving = false;
    }
  }

  async function deleteEntry(id) {
    try {
      await bloodworkApi.delete(id);
      entries = entries.filter(e => e.id !== id);
    } catch (err) {
      errorMsg = err.message;
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'critical': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800';
      case 'elevated': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800';
      case 'low': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800';
      default: return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800';
    }
  }

  function getStatusBadge(status) {
    switch (status) {
      case 'critical': return '🚨 Critical';
      case 'elevated': return '⚠️ High';
      case 'low': return '⬇️ Low';
      default: return '✅ Normal';
    }
  }

  onMount(loadEntries);
</script>

<div class="space-y-8">
  <!-- ═══ HEADER ═══ -->
  <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 dark:border-slate-700 pb-8" in:fade>
    <div class="space-y-2">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sentinel-optimal/5 border border-sentinel-optimal/20 mb-2">
        <svg class="w-3 h-3 text-sentinel-optimal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <span class="text-xs font-semibold text-sentinel-optimal">Manual Entry</span>
      </div>
      <h1 class="text-4xl font-bold tracking-tight text-sentinel-text dark:text-white leading-tight">
        Blood<span class="text-sentinel-optimal italic font-bold">work</span>
      </h1>
      <div class="text-sm text-sentinel-dim dark:text-slate-400 font-medium">Enter your lab test results manually. These feed directly into Health Insights.</div>
    </div>

    <button
      on:click={() => showForm = !showForm}
      class="hud-button hud-button-accent min-w-[180px]"
    >
      {#if showForm}
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Cancel
      {:else}
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Entry
      {/if}
    </button>
  </div>

  <!-- ═══ SUCCESS / ERROR MESSAGES ═══ -->
  {#if successMsg}
    <div class="hud-panel border-sentinel-optimal/30 p-4 bg-sentinel-optimal/5 text-sentinel-optimal text-sm font-semibold flex items-center gap-3" in:fly={{ y: -10 }}>
      <span>✅</span> {successMsg}
    </div>
  {/if}
  {#if errorMsg}
    <div class="hud-panel border-sentinel-critical/30 p-4 bg-sentinel-critical/5 hud-text-critical text-sm font-semibold flex items-center gap-3" in:fly={{ y: -10 }}>
      <span>⚠️</span> {errorMsg}
      <button class="ml-auto text-xs underline" on:click={() => errorMsg = ''}>Dismiss</button>
    </div>
  {/if}

  <!-- ═══ ENTRY FORM ═══ -->
  {#if showForm}
    <div class="hud-panel p-6 space-y-6" transition:slide>
      <!-- Date & Label -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <label for="bw-date" class="text-xs font-bold text-sentinel-text dark:text-white uppercase tracking-wider">Test Date</label>
          <input
            id="bw-date"
            type="date"
            bind:value={testDate}
            class="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-sentinel-dark-surface-0 focus:ring-2 focus:ring-sentinel-optimal/20 focus:border-sentinel-optimal/40 outline-none transition-all"
          />
        </div>
        <div class="space-y-2">
          <label for="bw-label" class="text-xs font-bold text-sentinel-text dark:text-white uppercase tracking-wider">Label (optional)</label>
          <input
            id="bw-label"
            type="text"
            bind:value={label}
            placeholder="e.g., Annual Checkup, Liver Panel"
            class="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-sentinel-dark-surface-0 focus:ring-2 focus:ring-sentinel-optimal/20 focus:border-sentinel-optimal/40 outline-none transition-all"
          />
        </div>
      </div>

      <!-- Test Category Selector -->
      <div class="space-y-4">
        <div class="text-xs font-bold text-sentinel-text dark:text-white uppercase tracking-wider">Select Tests & Enter Values</div>
        
        {#each testCategories as category}
          <div class="hud-panel p-4 bg-slate-50/50 border-slate-200 dark:border-slate-700 space-y-3">
            <div class="text-xs font-bold text-sentinel-dim dark:text-slate-400 flex items-center gap-2">
              <span>{category.icon}</span> {category.name}
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {#each category.tests as test}
                <div class="flex flex-col gap-1.5">
                  <button
                    on:click={() => toggleTest(test.key)}
                    class="flex items-center gap-2 text-left text-xs font-medium py-1
                      {selectedTests.includes(test.key) ? 'text-sentinel-optimal' : 'text-sentinel-dim dark:text-slate-400 hover:text-sentinel-text dark:text-white'} transition-colors"
                  >
                    <div class="w-4 h-4 rounded border flex items-center justify-center shrink-0
                      {selectedTests.includes(test.key) 
                        ? 'bg-sentinel-optimal border-sentinel-optimal text-white' 
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-sentinel-dark-surface-0'}">
                      {#if selectedTests.includes(test.key)}
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                        </svg>
                      {/if}
                    </div>
                    {test.label}
                  </button>
                  
                  {#if selectedTests.includes(test.key)}
                    <div class="flex items-center gap-2 pl-6" transition:slide>
                      <input
                        type="number"
                        step="any"
                        bind:value={valueInputs[test.key]}
                        placeholder="Value"
                        class="w-24 px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-sentinel-dark-surface-0 focus:ring-2 focus:ring-sentinel-optimal/20 focus:border-sentinel-optimal/40 outline-none"
                      />
                      <span class="text-[10px] text-sentinel-dim dark:text-slate-400">{test.unit}</span>
                      <span class="text-[9px] text-sentinel-dim/60 hidden sm:inline">Ref: {test.ref}</span>
                      {#if valueInputs[test.key] && !isNaN(parseFloat(valueInputs[test.key]))}
                        <span class="text-[9px] font-bold px-1.5 py-0.5 rounded border {getStatusColor(computeStatus(test.key, valueInputs[test.key]))}">
                          {getStatusBadge(computeStatus(test.key, valueInputs[test.key]))}
                        </span>
                      {/if}
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>

      <!-- Submit -->
      <div class="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
        <button on:click={() => showForm = false} class="px-5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 text-sentinel-dim dark:text-slate-400 hover:bg-slate-50 dark:bg-sentinel-dark-surface-1 transition-all">
          Cancel
        </button>
        <button
          on:click={submitBloodwork}
          disabled={saving || selectedTests.length === 0}
          class="hud-button hud-button-accent min-w-[160px]"
        >
          {#if saving}
            <div class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            Saving...
          {:else}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Save Bloodwork
          {/if}
        </button>
      </div>
    </div>
  {/if}

  <!-- ═══ PAST ENTRIES ═══ -->
  <div class="space-y-4">
    <div class="text-xs font-bold text-sentinel-dim dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
      <div class="w-2 h-2 rounded-full bg-sentinel-optimal"></div>
      Your Records ({entries.length})
    </div>

    {#if loading}
      <div class="py-20 flex flex-col items-center justify-center space-y-4">
        <div class="w-6 h-6 rounded-full border-2 border-sentinel-optimal/20 border-t-sentinel-optimal animate-spin"></div>
        <div class="text-xs text-sentinel-dim dark:text-slate-400 animate-pulse font-medium">Loading bloodwork history...</div>
      </div>
    {:else if entries.length === 0}
      <div class="hud-panel p-16 text-center opacity-40 border-dashed bg-white dark:bg-sentinel-dark-surface-0">
        <div class="text-sm text-sentinel-dim dark:text-slate-400 font-bold">No bloodwork entries yet</div>
        <p class="text-xs text-sentinel-dim/60 mt-2">Click "New Entry" to add your first lab results.</p>
      </div>
    {:else}
      {#each entries as entry, i (entry.id)}
        <div class="hud-panel p-5 bg-white dark:bg-sentinel-dark-surface-0 border-slate-200 dark:border-slate-700 hover:border-sentinel-optimal/20 transition-all group" in:fly={{ y: 15, delay: i * 40 }}>
          <!-- Header -->
          <div class="flex justify-between items-start mb-4">
            <div class="space-y-1">
              <div class="text-sm font-bold text-sentinel-text dark:text-white">{entry.label || 'Bloodwork Entry'}</div>
              <div class="text-[11px] text-sentinel-dim dark:text-slate-400 font-mono">
                📅 {new Date(entry.test_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                <span class="mx-2 text-slate-300">•</span>
                {Object.keys(entry.values || {}).length} test{Object.keys(entry.values || {}).length !== 1 ? 's' : ''}
              </div>
            </div>
            <button
              on:click={() => deleteEntry(entry.id)}
              class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[9px] font-bold text-sentinel-dim dark:text-slate-400 uppercase hover:text-sentinel-critical hover:border-sentinel-critical/30 hover:bg-sentinel-critical/5 transition-all opacity-0 group-hover:opacity-100"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <!-- Values Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {#each Object.entries(entry.values || {}) as [key, val]}
              <div class="px-3 py-2 rounded-lg border {getStatusColor(val.status)} transition-all">
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

  <!-- ═══ INFO FOOTER ═══ -->
  <div class="hud-panel p-5 bg-slate-50 dark:bg-sentinel-dark-surface-1 border-slate-200 dark:border-slate-700" in:fade={{ delay: 200 }}>
    <div class="flex gap-4 items-start">
      <div class="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-sentinel-dark-surface-0 flex items-center justify-center shrink-0">
        <span class="text-sentinel-optimal font-black text-sm">💉</span>
      </div>
      <div class="space-y-1">
        <div class="text-xs font-bold text-sentinel-text dark:text-white">How it works</div>
        <p class="text-[11px] text-sentinel-dim dark:text-slate-400 leading-relaxed">
          Enter your blood test values from your lab reports. SENTINEL automatically checks each value against medical reference ranges and
          flags anything unusual. These entries feed directly into <span class="font-semibold">Health Insights</span> for organ risk scoring,
          trend detection, and personalized recommendations.
        </p>
      </div>
    </div>
  </div>
</div>

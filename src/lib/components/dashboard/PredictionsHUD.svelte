<script>
  import { fade, fly } from 'svelte/transition';
  export let prediction;

  $: riskColor = {
    'LOW': 'hud-text-optimal',
    'MEDIUM': 'hud-text-warning',
    'HIGH': 'hud-text-critical'
  }[prediction?.risk_level] || 'sentinel-dim';

  $: riskBg = {
    'LOW': 'bg-sentinel-optimal/5 border-sentinel-optimal/20',
    'MEDIUM': 'bg-sentinel-warning/5 border-sentinel-warning/20',
    'HIGH': 'bg-sentinel-critical/5 border-sentinel-critical/20'
  }[prediction?.risk_level] || 'bg-slate-50 dark:bg-sentinel-dark-surface-1 border-slate-200 dark:border-slate-700';

  $: riskGradient = {
    'LOW': 'from-sentinel-optimal to-emerald-400',
    'MEDIUM': 'from-sentinel-warning to-amber-400',
    'HIGH': 'from-sentinel-critical to-red-400'
  }[prediction?.risk_level] || 'from-slate-300 to-slate-400';

  // Organ risk color based on score
  function organColor(score) {
    if (score >= 70) return { text: 'text-sentinel-critical', bg: 'bg-sentinel-critical', bar: 'bg-sentinel-critical' };
    if (score >= 40) return { text: 'text-sentinel-warning', bg: 'bg-sentinel-warning', bar: 'bg-sentinel-warning' };
    return { text: 'text-sentinel-optimal', bg: 'bg-sentinel-optimal', bar: 'bg-sentinel-optimal' };
  }

  // Organ emojis
  const organEmoji = {
    kidney: '🫘', cardiac: '❤️', metabolic: '🔥', liver: '🫁', blood: '🩸', thyroid: '🦋'
  };
</script>

<div class="space-y-6">
  {#if !prediction}
    <div class="hud-panel p-12 text-center border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-sentinel-dark-surface-0 opacity-60">
      <div class="text-sm text-sentinel-dim dark:text-slate-400 font-medium animate-pulse">
        Click "Run AI Analysis" to activate health intelligence agents.
      </div>
    </div>
  {:else}
    <!-- ═══ TOP ROW: Risk Level + Summary ═══ -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6" in:fade>
      <!-- Risk Level Card -->
      <div class="hud-panel p-6 flex flex-col items-center justify-center text-center space-y-3 {riskBg}">
        <div class="text-[10px] text-sentinel-dim dark:text-slate-400 font-bold uppercase tracking-widest">Overall Risk</div>
        <div class="text-5xl font-black tracking-tight {riskColor}">
          {prediction.risk_level}
        </div>
        <div class="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r {riskGradient} transition-all duration-1000 rounded-full" style="width: {prediction.confidence}%"></div>
        </div>
        <div class="text-[10px] font-semibold text-sentinel-dim dark:text-slate-400">Confidence: {prediction.confidence}%</div>
      </div>

      <!-- Summary + Recommendations -->
      <div class="lg:col-span-2 hud-panel p-6 space-y-4">
        <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
          <svg class="w-4 h-4 text-sentinel-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <div class="text-sm font-bold text-sentinel-text dark:text-white">AI Assessment</div>
          <div class="ml-auto text-[9px] font-medium text-sentinel-dim dark:text-slate-400">{new Date().toLocaleDateString()}</div>
        </div>
        <p class="text-[13px] text-sentinel-text dark:text-white leading-relaxed">{prediction.recommendation}</p>
        
        {#if prediction.recommendations && prediction.recommendations.length > 0}
          <div class="space-y-2 pt-2">
            <div class="text-[10px] text-sentinel-dim dark:text-slate-400 font-bold uppercase tracking-widest">Recommendations</div>
            {#each prediction.recommendations as rec, i}
              <div class="flex items-start gap-2 text-[12px] text-sentinel-text dark:text-white" in:fly={{ x: -10, delay: i * 50 }}>
                <span class="text-sentinel-optimal mt-0.5 shrink-0">✦</span>
                <span>{rec}</span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <!-- ═══ ORGAN RISK SCORES ═══ -->
    {#if prediction.organ_risks && Object.keys(prediction.organ_risks).length > 0}
      <div class="space-y-3" in:fly={{ y: 15, delay: 150 }}>
        <div class="text-xs font-bold text-sentinel-dim dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Organ System Analysis
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {#each Object.entries(prediction.organ_risks) as [organ, data], i}
            {@const score = typeof data === 'object' ? data.score : data}
            {@const label = typeof data === 'object' ? data.label : (score >= 70 ? 'Concern' : score >= 40 ? 'Monitor' : 'Healthy')}
            {@const detail = typeof data === 'object' ? data.detail : ''}
            {@const colors = organColor(score)}
            <div 
              class="hud-panel p-4 flex flex-col items-center text-center space-y-2 hover:shadow-md transition-shadow group"
              in:fly={{ y: 15, delay: 200 + i * 60 }}
              title={detail}
            >
              <span class="text-xl">{organEmoji[organ] || '🏥'}</span>
              <div class="text-[10px] font-bold text-sentinel-dim dark:text-slate-400 uppercase tracking-wide">{organ}</div>
              
              <!-- Score Ring -->
              <div class="relative w-12 h-12">
                <svg class="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" stroke-width="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="{score}, 100" class="{colors.text} transition-all duration-1000" />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-xs font-black {colors.text}">{score}</span>
                </div>
              </div>
              
              <div class="text-[9px] font-bold {colors.text} uppercase">{label}</div>
              {#if detail}
                <div class="text-[9px] text-sentinel-dim dark:text-slate-400 leading-snug opacity-0 group-hover:opacity-100 transition-opacity max-w-[120px]">
                  {detail}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- ═══ TRENDS + FINDINGS ═══ -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Trends -->
      {#if prediction.trends && prediction.trends.length > 0}
        <div class="hud-panel p-6 space-y-3" in:fly={{ y: 15, delay: 300 }}>
          <div class="text-xs font-bold text-sentinel-dim dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <svg class="w-4 h-4 text-sentinel-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Detected Trends
          </div>
          <div class="space-y-2.5">
            {#each prediction.trends as trend, i}
              <div class="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-sentinel-dark-surface-1 border border-slate-100 dark:border-slate-700/50" in:fly={{ x: -10, delay: 350 + i * 60 }}>
                <span class="text-sentinel-accent text-xs mt-0.5 shrink-0">📈</span>
                <span class="text-[12px] text-sentinel-text dark:text-white leading-relaxed">{trend}</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Key Findings -->
      {#if prediction.key_findings && prediction.key_findings.length > 0}
        <div class="hud-panel p-6 space-y-3" in:fly={{ y: 15, delay: 350 }}>
          <div class="text-xs font-bold text-sentinel-dim dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <svg class="w-4 h-4 text-sentinel-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Key Findings
          </div>
          <div class="space-y-2.5">
            {#each prediction.key_findings as finding, i}
              {@const fSeverity = finding.severity || 'info'}
              <div 
                class="flex items-start gap-2.5 p-2.5 rounded-lg border {
                  fSeverity === 'critical' ? 'bg-sentinel-critical/5 border-sentinel-critical/20' :
                  fSeverity === 'warning' ? 'bg-sentinel-warning/5 border-sentinel-warning/20' :
                  'bg-slate-50 dark:bg-sentinel-dark-surface-1 border-slate-100 dark:border-slate-700/50'
                }"
                in:fly={{ x: -10, delay: 400 + i * 60 }}
              >
                <span class="text-xs mt-0.5 shrink-0">{fSeverity === 'critical' ? '🔴' : fSeverity === 'warning' ? '🟡' : '🟢'}</span>
                <div>
                  <div class="text-[12px] font-semibold text-sentinel-text dark:text-white">{finding.finding}</div>
                  {#if finding.detail}
                    <div class="text-[11px] text-sentinel-dim dark:text-slate-400 mt-0.5">{finding.detail}</div>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

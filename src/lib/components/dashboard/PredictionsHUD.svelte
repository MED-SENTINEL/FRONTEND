<script>
  import { fade, slide } from 'svelte/transition';
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
  }[prediction?.risk_level] || 'bg-slate-50 border-slate-200';
</script>

<div class="space-y-8">
  {#if !prediction}
    <div class="hud-panel p-12 text-center border-dashed border-slate-200 bg-white opacity-60">
      <div class="text-sm text-sentinel-dim font-medium animate-pulse">
        Click "Update Insights" to run a health assessment.
      </div>
    </div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8" in:fade>
      <!-- Risk Level Card -->
      <div class="hud-panel p-8 flex flex-col items-center justify-center text-center space-y-4 {riskBg}">
        <div class="text-sm text-sentinel-dim font-bold">Health Assessment</div>
        <div class="text-5xl font-black tracking-tight {riskColor}">
          {prediction.risk_level}
        </div>
        <div class="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full {prediction.risk_level === 'HIGH' ? 'bg-sentinel-critical' : prediction.risk_level === 'MEDIUM' ? 'bg-sentinel-warning' : 'bg-sentinel-optimal'} transition-all duration-1000" style="width: {prediction.confidence}%"></div>
        </div>
        <div class="text-[10px] font-semibold text-sentinel-dim">Assessment Confidence: {prediction.confidence}%</div>
      </div>

      <!-- Analysis Details -->
      <div class="lg:col-span-2 space-y-6">
        <div class="hud-panel p-6 space-y-6">
          <div class="flex items-center justify-between border-b border-slate-200 pb-4">
            <div class="text-sm font-bold text-sentinel-text flex items-center gap-2">
              <svg class="w-4 h-4 text-sentinel-optimal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Clinical Summary
            </div>
            <div class="text-[10px] font-medium text-sentinel-dim">Date: {new Date().toLocaleDateString()}</div>
          </div>
          
          <div class="space-y-4">
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div class="text-[10px] text-sentinel-dim font-bold mb-2">Recommendation</div>
              <p class="text-[13px] text-sentinel-text leading-relaxed font-medium">
                {prediction.recommendation}
              </p>
            </div>

            {#if prediction.details && Object.keys(prediction.details).length > 0}
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {#each Object.entries(prediction.details) as [key, value]}
                   {#if key !== 'recommendation'}
                    <div class="p-3 bg-white rounded-lg border border-slate-200 flex flex-col gap-1">
                      <span class="text-[8px] text-sentinel-dim font-bold uppercase tracking-widest">{key.replace(/_/g, ' ')}</span>
                      <span class="text-[10px] text-sentinel-text font-mono truncate">{value}</span>
                    </div>
                   {/if}
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

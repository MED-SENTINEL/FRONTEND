<script>
  import { onMount } from 'svelte';
  import { reports, traumaPins, fetchMyData, loading } from '$lib/stores/data';
  import ReportUpload from '$lib/components/reports/ReportUpload.svelte';
  import ReportCard from '$lib/components/reports/ReportCard.svelte';
  import { fade, fly } from 'svelte/transition';

  // Sort logic for reports timeline: newest to oldest
  $: timeline = [...$reports.map(r => ({ ...r, timelineType: 'report', sortDate: new Date(r.uploaded_at || r.created_at || 0) }))]
                 .sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());

  function getSeverityColor(s) {
    switch (s) {
      case 'critical': return 'hud-text-critical bg-sentinel-critical/10 border-sentinel-critical/30';
      case 'high': return 'hud-text-critical bg-sentinel-critical/5 border-sentinel-critical/20';
      case 'medium': return 'text-sentinel-warning bg-sentinel-warning/5 border-sentinel-warning/20';
      default: return 'text-sentinel-optimal bg-sentinel-optimal/5 border-sentinel-optimal/20';
    }
  }

  onMount(() => {
    // Relying on layout mounting to fetch, but ensuring it happens if loaded directly.
    if ($reports.length === 0 && $traumaPins.length === 0) fetchMyData();
  });
</script>

<div class="space-y-12">
  <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-10" in:fade>
    <div class="space-y-2">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sentinel-optimal/5 border border-sentinel-optimal/20 mb-2">
        <svg class="w-3 h-3 text-sentinel-optimal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-xs font-semibold text-sentinel-optimal">Medical Timeline Active</span>
      </div>
      <h1 class="text-4xl font-bold tracking-tight text-sentinel-text leading-tight">
        Your Health <span class="text-sentinel-optimal italic font-bold">Timeline</span>
      </h1>
      <div class="text-sm text-sentinel-dim font-medium">View your complete medical history in chronological order.</div>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
    
    <!-- Left Column: Upload Tools -->
    <div class="lg:col-span-1 space-y-8" in:fade={{ delay: 100 }}>
      <ReportUpload on:uploadComplete={fetchMyData} />
      
      <div class="hud-panel p-6 bg-gradient-to-br from-sentinel-optimal/5 to-transparent border-slate-200">
        <div class="text-xs font-bold text-sentinel-text mb-4 flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-sentinel-optimal"></div>
          Timeline Statistics
        </div>
        <div class="space-y-3">
          <div class="flex justify-between items-center pb-2 border-b border-slate-100">
            <span class="text-xs text-sentinel-dim">Lab Reports</span>
            <span class="text-sm font-bold text-sentinel-text">{$reports.length}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-xs font-semibold text-sentinel-optimal">Total Records</span>
            <span class="text-lg font-bold text-sentinel-optimal">{timeline.length}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: The Unified Timeline -->
    <div class="lg:col-span-2 relative pl-4 md:pl-8">
      <!-- Central Line -->
      <div class="absolute left-[39px] md:left-[55px] top-4 bottom-0 w-0.5 bg-gradient-to-b from-sentinel-optimal/50 via-slate-200 to-transparent z-0"></div>

      {#if $loading && timeline.length === 0}
        <div class="py-20 flex flex-col items-center justify-center space-y-4">
          <div class="w-6 h-6 rounded-full border-2 border-sentinel-optimal/20 border-t-sentinel-optimal animate-spin"></div>
          <div class="text-xs text-sentinel-dim animate-pulse font-medium">Fetching medical timeline...</div>
        </div>
      {:else}
        <div class="space-y-8 relative z-10">
          {#each timeline as item, i}
            <div class="relative flex items-start gap-6 group" in:fly={{ y: 20, delay: i * 50 }}>
              
              <!-- Timeline Node Marker -->
              <div class="flex flex-col items-center mt-3 shrink-0">
                <div class="w-10 h-10 md:w-12 md:w-12 rounded-full bg-white border shadow-[0_4px_20px_rgba(15,23,42,0.05)] flex items-center justify-center transition-all duration-300
                  {item.timelineType === 'report' ? 'border-sentinel-optimal/30 text-sentinel-optimal group-hover:border-sentinel-optimal group-hover:bg-sentinel-optimal/5' 
                  : 'border-sentinel-text/20 text-sentinel-text group-hover:border-sentinel-text group-hover:bg-slate-50'}">
                  
                  {#if item.timelineType === 'report'}
                    <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  {:else}
                    <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  {/if}
                </div>
              </div>

              <!-- Content Card -->
              <div class="flex-1 min-w-0">
                <div class="text-[11px] font-semibold text-sentinel-dim mb-2 pl-1">
                  {item.sortDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
                
                {#if item.timelineType === 'report'}
                  <div class="shadow-sm hover:shadow-md transition-shadow rounded-xl">
                    <ReportCard report={item} />
                  </div>
                {:else}
                  <div class="hud-panel p-5 bg-white border border-slate-200 hover:border-slate-300 transition-all">
                    <div class="flex justify-between items-start gap-3">
                      <div class="space-y-1">
                        <div class="text-sm font-bold text-sentinel-text uppercase tracking-wider">
                          {item.title || "MEDICAL EVENT"}
                        </div>
                        <div class="flex flex-wrap gap-2 text-[9px] text-sentinel-dim uppercase tracking-wider">
                          {#if item.trauma_type}
                            <span class="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">{item.trauma_type.replace(/_/g, " ")}</span>
                          {/if}
                          {#if item.body_region}
                            <span class="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">📍 {item.body_region.replace(/_/g, " ")}</span>
                          {/if}
                          {#if item.severity}
                            <span class="px-2 py-0.5 rounded border font-bold {getSeverityColor(item.severity)}">{item.severity}</span>
                          {/if}
                        </div>
                      </div>
                    </div>
                    {#if item.notes}
                      <div class="mt-3 text-xs text-slate-500 leading-relaxed max-w-2xl bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {item.notes}
                      </div>
                    {/if}
                  </div>
                {/if}

              </div>
            </div>
          {/each}

          {#if timeline.length === 0 && !$loading}
            <div class="hud-panel p-16 text-center opacity-40 border-dashed ml-16 bg-white">
              <div class="text-sm text-sentinel-dim font-bold">Timeline is empty</div>
              <p class="text-xs text-sentinel-dim/60 mt-2">Upload a document or log a condition to begin your health history.</p>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>

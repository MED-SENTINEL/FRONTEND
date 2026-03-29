<script>
  import { onMount } from 'svelte';
  import { currentUser } from '$lib/stores/auth';
  import { apiFetch } from '$lib/api/client';
  import { fade, fly, slide } from 'svelte/transition';

  let events = [];
  let loading = false;

  async function loadTimeline() {
    if (!$currentUser) return;
    loading = true;
    try {
      const response = await apiFetch(`/api/timeline/${$currentUser.id}`);
      // Backend returns { patient_id, patient_name, total_events, timeline: [...] }
      // Each item: { type, timestamp, data }
      // We map them to { type, date, title, summary }
      events = (response.timeline || []).map(item => ({
        type: item.type,
        date: item.timestamp,
        title: deriveTitle(item),
        summary: deriveSummary(item),
      }));
    } catch (err) {
      console.error(err);
    } finally {
      loading = false;
    }
  }

  function deriveTitle(item) {
    const d = item.data || {};
    switch (item.type) {
      case 'report': return d.report_type ? d.report_type.toUpperCase().replace(/_/g, ' ') + ' REPORT' : 'LAB REPORT';
      case 'trauma': return d.title || 'TRAUMA EVENT';
      default: return 'EVENT';
    }
  }

  function deriveSummary(item) {
    const d = item.data || {};
    switch (item.type) {
      case 'report':
        return [d.lab_name, d.file_name].filter(Boolean).join(' — ') || 'Lab report uploaded';
      case 'trauma':
        return [d.severity ? `Severity: ${d.severity}` : null, d.body_region, d.notes].filter(Boolean).join(' • ') || 'Trauma recorded';
      default:
        return '';
    }
  }

  onMount(loadTimeline);

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
      case 'report': return 'bg-sentinel-optimal shadow-[0_0_10px_#06B6D4]';
      case 'trauma': return 'bg-sentinel-critical shadow-[0_0_10px_#FF3366]';
      default: return 'bg-sentinel-dim';
    }
  }
</script>

<div class="space-y-12">
  <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-10" in:fade>
    <div class="space-y-2">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-2">
        <svg class="w-3 h-3 text-sentinel-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-[9px] font-bold text-sentinel-dim tracking-widest uppercase italic">TEMPORAL_LOGS_ACTIVE</span>
      </div>
      <h1 class="text-4xl font-bold tracking-tight text-sentinel-text uppercase leading-tight">
        HEALTH <span class="text-sentinel-text italic font-black opacity-20">TIMELINE</span>
      </h1>
      <div class="text-[10px] text-sentinel-dim tracking-[0.4em] uppercase font-mono">CHRONOLOGICAL_STREAM // BIOREC_HISTORY // v.1.0</div>
    </div>
  </div>

  <div class="relative px-2">
    <!-- Vertical Continuity Line -->
    <div class="absolute left-10 top-0 bottom-0 w-px bg-gradient-to-b from-sentinel-optimal/40 via-sentinel-accent/40 to-transparent"></div>

    {#if loading}
      <div class="ml-24 p-12 hud-panel flex flex-col items-center justify-center space-y-4">
        <div class="w-8 h-8 rounded-full border-2 border-sentinel-optimal/20 border-t-sentinel-optimal animate-spin"></div>
        <div class="text-[10px] text-sentinel-dim animate-pulse uppercase tracking-[0.4em]">SYNCHRONIZING_TEMPORAL_NODES...</div>
      </div>
    {:else if events.length === 0}
      <div class="ml-24 p-20 text-center hud-panel border-dashed border-slate-200 bg-white opacity-40 rounded-3xl" in:fade>
        <div class="text-[10px] uppercase tracking-[0.5em] italic">NO_TEMPORAL_MARKERS_DETECTED</div>
      </div>
    {:else}
      <div class="space-y-10 pb-20">
        {#each events as event, i}
          <div class="relative flex items-start group" in:fly={{ x: -20, delay: i * 100 }}>
            <!-- Temporal Marker (Active Dot) -->
            <div class="absolute left-[39.5px] top-8 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center z-20 group-hover:scale-125 transition-transform duration-500">
               <div class="w-1.5 h-1.5 rounded-full {getIndicatorColor(event.type)}"></div>
            </div>
            
            <!-- Event Card -->
            <div class="ml-24 flex-1 hud-panel p-6 bg-white border-slate-200 group-hover:border-sentinel-optimal/30 transition-all duration-500 relative">
               <!-- Corner Accent -->
               <div class="absolute top-0 right-0 w-8 h-8 border-t border-r border-slate-200 group-hover:border-sentinel-optimal/40 transition-colors rounded-tr-xl"></div>
               
               <div class="flex flex-col md:flex-row justify-between items-start gap-6">
                <div class="flex items-center gap-5">
                  <div class="w-14 h-14 rounded-2xl border flex items-center justify-center transition-transform duration-500 group-hover:rotate-12 {getColorClass(event.type)}">
                    <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d={getIcon(event.type)} />
                    </svg>
                  </div>
                  <div class="space-y-1">
                    <div class="text-[9px] text-sentinel-dim font-bold uppercase tracking-[0.3em] font-mono">{event.type.replace('_', ' ')} // LOG_{i.toString().padStart(3, '0')}</div>
                    <div class="text-lg font-black text-sentinel-text uppercase tracking-wider group-hover:text-sentinel-optimal transition-colors">{event.title}</div>
                  </div>
                </div>
                
                <div class="text-left md:text-right space-y-1">
                  <div class="text-[9px] text-sentinel-dim uppercase tracking-[0.4em] font-bold">TIMESTAMP</div>
                  <div class="text-xs font-mono text-sentinel-text flex flex-col md:items-end gap-0.5">
                    <span class="font-bold">{new Date(event.date).toLocaleDateString()}</span>
                    <span class="text-[10px] hud-text-optimal opacity-80">{new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}).replace(/:/g, ' ')}</span>
                  </div>
                </div>
              </div>

              {#if event.summary}
                <div class="mt-6 pt-6 border-t border-white/5" in:slide>
                  <div class="text-[11px] text-sentinel-muted uppercase leading-relaxed tracking-wide font-medium bg-slate-50 p-4 rounded-xl border border-slate-200 group-hover:bg-sentinel-optimal/5 group-hover:border-sentinel-optimal/10 transition-all">
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

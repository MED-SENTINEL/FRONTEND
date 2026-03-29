<script>
  import { fade } from 'svelte/transition';
  import { reportsApi } from '$lib/api/client';
  export let report;

  let opening = false;

  async function openRaw() {
    if (!report.id || opening) return;
    opening = true;
    try {
      const url = await reportsApi.getFile(report.id);
      window.open(url, '_blank');
    } catch (err) {
      console.error("Failed to open file:", err);
      alert("SYSTEM_ERROR: UNABLE_TO_RETRIEVE_DOCUMENT");
    } finally {
      opening = false;
    }
  }
</script>

<div class="hud-panel p-5 flex justify-between items-center group bg-white border-slate-200 hover:border-sentinel-optimal/30 transition-all duration-300" in:fade>
  <div class="flex items-center gap-5">
    <div class="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center group-hover:border-sentinel-optimal/20 group-hover:bg-sentinel-optimal/5 transition-all">
      <svg class="w-6 h-6 text-sentinel-dim group-hover:text-sentinel-optimal transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <div class="space-y-0.5">
      <div class="text-xs font-bold text-sentinel-text tracking-widest uppercase group-hover:text-sentinel-optimal transition-colors">{report.file_name || report.filename}</div>
      <div class="flex items-center gap-3 text-[9px] text-sentinel-dim tracking-tighter uppercase font-mono">
        <span>{new Date(report.report_date || report.upload_date).toLocaleDateString()}</span>
        <span class="w-1 h-1 rounded-full bg-sentinel-dim opacity-30"></span>
        <span>SECURE_ARCHIVE</span>
      </div>
    </div>
  </div>

  <button 
    on:click|stopPropagation={openRaw}
    disabled={opening}
    class="px-4 py-2 rounded-lg border border-slate-200 text-[9px] font-bold text-sentinel-dim uppercase hover:bg-slate-50 hover:text-sentinel-optimal hover:border-sentinel-optimal/30 transition-all opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 disabled:opacity-50"
  >
    {#if opening}
      RETRIEVING...
    {:else}
      OPEN_RAW
    {/if}
  </button>
</div>

<script>
  import { fade } from 'svelte/transition';
  import { reportsApi } from '$lib/api/client';
  import { deleteReport } from '$lib/stores/data';
  import { createEventDispatcher } from 'svelte';
  export let report;

  const dispatch = createEventDispatcher();
  let opening = false;
  let deleting = false;
  let confirmDelete = false;

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

  async function handleDelete() {
    if (!confirmDelete) {
      confirmDelete = true;
      setTimeout(() => { confirmDelete = false; }, 3000);
      return;
    }
    deleting = true;
    const success = await deleteReport(report.id);
    if (success) {
      dispatch('deleted', { id: report.id });
    }
    deleting = false;
    confirmDelete = false;
  }
</script>

<div class="hud-panel p-5 flex justify-between items-center group bg-white dark:bg-sentinel-dark-surface-0 border-slate-200 dark:border-slate-700 hover:border-sentinel-optimal/30 transition-all duration-300" in:fade>
  <div class="flex items-center gap-5">
    <div class="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-sentinel-dark-surface-1 flex items-center justify-center group-hover:border-sentinel-optimal/20 group-hover:bg-sentinel-optimal/5 transition-all">
      <svg class="w-6 h-6 text-sentinel-dim dark:text-slate-400 group-hover:text-sentinel-optimal transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <div class="space-y-0.5">
      <div class="text-xs font-bold text-sentinel-text dark:text-white tracking-widest uppercase group-hover:text-sentinel-optimal transition-colors">{report.file_name || report.filename}</div>
      <div class="flex items-center gap-3 text-[9px] text-sentinel-dim dark:text-slate-400 tracking-tighter uppercase font-mono">
        <span>{new Date(report.report_date || report.upload_date || report.uploaded_at).toLocaleDateString()}</span>
        <span class="w-1 h-1 rounded-full bg-sentinel-dim opacity-30"></span>
        <span>SECURE_ARCHIVE</span>
      </div>
    </div>
  </div>

  <div class="flex items-center gap-2">
    <!-- Delete Button -->
    <button 
      on:click|stopPropagation={handleDelete}
      disabled={deleting}
      class="px-3 py-2 rounded-lg border text-[9px] font-bold uppercase transition-all
        {confirmDelete 
          ? 'border-sentinel-critical/40 text-sentinel-critical bg-sentinel-critical/5 opacity-100 scale-100 hover:bg-sentinel-critical/10' 
          : 'border-slate-200 dark:border-slate-700 text-sentinel-dim dark:text-slate-400 hover:text-sentinel-critical hover:border-sentinel-critical/30 hover:bg-sentinel-critical/5 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100'}
        disabled:opacity-50"
    >
      {#if deleting}
        Deleting...
      {:else if confirmDelete}
        Confirm?
      {:else}
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      {/if}
    </button>

    <!-- Open Button -->
    <button 
      on:click|stopPropagation={openRaw}
      disabled={opening}
      class="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-[9px] font-bold text-sentinel-dim dark:text-slate-400 uppercase hover:bg-slate-50 dark:bg-sentinel-dark-surface-1 hover:text-sentinel-optimal hover:border-sentinel-optimal/30 transition-all opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 disabled:opacity-50"
    >
      {#if opening}
        RETRIEVING...
      {:else}
        OPEN_RAW
      {/if}
    </button>
  </div>
</div>

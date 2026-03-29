<script>
  import { createEventDispatcher } from 'svelte';
  import { reportsApi } from '$lib/api/client';
  import { currentUser } from '$lib/stores/auth';
  import { fade } from 'svelte/transition';

  const dispatch = createEventDispatcher();
  let fileInput;
  let uploading = false;
  let error = null;

  async function handleFileChange(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    if (!$currentUser) {
      error = "AUTHENTICATION_REQUIRED";
      return;
    }

    uploading = true;
    error = null;

    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('patient_id', $currentUser.id);

      const result = await reportsApi.upload(formData);
      dispatch('uploadComplete', result);
      
      // Reset input
      if (fileInput) fileInput.value = '';
    } catch (err) {
      error = err.message || "UPLOAD_FAILED";
      console.error("Upload error:", err);
    } finally {
      uploading = false;
    }
  }

  function triggerUpload() {
    if (fileInput) fileInput.click();
  }
</script>

<div class="hud-panel p-8 border-dashed border-slate-200 bg-white hover:border-sentinel-optimal/40 transition-all group relative overflow-hidden">
  <!-- Shimmer background on hover -->
  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-sentinel-optimal/5 to-transparent -translate-x-full group-hover:animate-[shimmer_3s_infinite] pointer-events-none"></div>

  <div class="flex flex-col items-center justify-center space-y-6 text-center relative z-10">
    <button 
      on:click={triggerUpload}
      disabled={uploading}
      aria-label="Upload Bio Records"
      class="w-20 h-20 rounded-2xl bg-sentinel-optimal/5 border border-sentinel-optimal/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 disabled:opacity-50"
    >
      <svg class="w-10 h-10 hud-text-optimal opacity-40 group-hover:opacity-80 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    </button>

    <input 
      type="file" 
      bind:this={fileInput} 
      on:change={handleFileChange} 
      accept=".pdf,.jpg,.jpeg,.png" 
      class="hidden" 
    />

    {#if !uploading}
      <div class="space-y-2">
        <button on:click={triggerUpload} class="text-xs font-bold text-sentinel-text tracking-[0.3em] uppercase group-hover:text-sentinel-optimal transition-colors">
          INITIALIZE_DATA_TRANSFER
        </button>
        <div class="text-[9px] text-sentinel-dim tracking-widest font-mono uppercase">SUPPORTED_FORMATS: PDF // IMAGE // ARCHIVE</div>
      </div>
    {:else}
      <div class="flex flex-col items-center space-y-4 w-full max-w-xs">
        <div class="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full bg-sentinel-optimal animate-[shimmer_1.5s_infinite]"></div>
        </div>
        <div class="text-[10px] hud-text-optimal animate-pulse tracking-[0.4em] font-bold uppercase">UPLOADING_BIO_RECORDS...</div>
      </div>
    {/if}

    {#if error}
      <div class="text-[9px] hud-text-critical uppercase tracking-widest border border-sentinel-critical/30 bg-sentinel-critical/5 px-4 py-2 rounded-lg" in:fade>
        <span class="font-bold">SYSTEM_ABORT:</span> {error}
      </div>
    {/if}
  </div>
</div>

<style>
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
</style>

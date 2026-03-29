<script>
  import { onMount } from 'svelte';
  import { Canvas } from '@threlte/core';
  import BioTwin from '$lib/components/three/BioTwin.svelte';
  import { modelType, isLoaded, autoRotate } from '$lib/stores/twin';
  import { currentUser } from '$lib/stores/auth';
  import { fetchMyData } from '$lib/stores/data';

  let wireframe = true;

  // Auto-select model based on user's profile (default to skeleton)
  // Users can always override via the buttons
  onMount(() => {
    fetchMyData();
  });
</script>

<div class="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-sentinel-bg">
  <Canvas>
    <BioTwin />
  </Canvas>

  {#if !$isLoaded}
    <div class="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-10">
      <div class="space-y-4 text-center">
        <div class="text-xl hud-text-optimal tracking-[0.5em] animate-pulse uppercase">
          INITIALIZING BIO-TWIN...
        </div>
        <div class="text-[8px] text-sentinel-muted tracking-widest uppercase">
          LOADING 3D MODEL // PLEASE WAIT
        </div>
      </div>
    </div>
  {/if}

  <!-- ═══ TOP LEFT: Subject Info Panel ═══ -->
  <div class="absolute top-6 left-6 w-72 space-y-4 pointer-events-none z-20">
    <div class="hud-panel p-5 space-y-4">
      <div class="flex items-center justify-between">
        <div class="text-[8px] text-sentinel-dim tracking-[0.4em] uppercase font-bold">SUBJECT DATA</div>
        <div class="flex items-center gap-1">
          <div class="w-1.5 h-1.5 rounded-full bg-sentinel-optimal animate-pulse"></div>
          <span class="text-[7px] hud-text-optimal">STABLE</span>
        </div>
      </div>
      <div class="text-sm hud-text-optimal font-bold tracking-[0.15em] uppercase">
        {$currentUser ? $currentUser.full_name : 'UNKNOWN SUBJECT'}
      </div>
      <div class="space-y-2 text-[8px] text-sentinel-muted uppercase">
        <div class="flex justify-between border-b border-sentinel-optimal/10 pb-1">
          <span>BLOOD_TYPE</span>
          <span class="text-sentinel-text font-black">{$currentUser?.blood_type || 'N/A'}</span>
        </div>
        <div class="flex justify-between border-b border-sentinel-optimal/10 pb-1">
          <span>MODEL_TYPE</span>
          <span class="hud-text-optimal font-bold">{$modelType.toUpperCase().replace(/_/g, ' ')}</span>
        </div>
        <div class="flex justify-between border-b border-sentinel-optimal/10 pb-1">
          <span>RENDER_MODE</span>
          <span class="hud-text-optimal">{$modelType === 'skeleton' ? 'WIREFRAME' : 'SOLID'}</span>
        </div>
        <div class="flex justify-between">
          <span>VERT_ESTIMATE</span>
          <span class="text-sentinel-optimal">84,212</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ═══ BOTTOM: Controls ═══ -->
  <div class="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none z-20">
    <!-- Model Selector -->
    <div class="hud-panel p-4 pointer-events-auto bg-white/90">
      <div class="text-[8px] text-sentinel-dim tracking-[0.3em] mb-3 uppercase font-bold">MODEL SELECTOR</div>
      <div class="flex gap-2">
        <button
          on:click={() => modelType.set('skeleton')}
          class="hud-button text-[9px] {$modelType === 'skeleton' ? 'bg-sentinel-optimal/20 border-sentinel-optimal hud-text-optimal' : 'opacity-50'}"
        >
          ▣ SKELETON
        </button>
        <button
          on:click={() => modelType.set('male_skeleton_muscles_anatomy_study')}
          class="hud-button text-[9px] {$modelType === 'male_skeleton_muscles_anatomy_study' ? 'bg-sentinel-optimal/20 border-sentinel-optimal hud-text-optimal' : 'opacity-50'}"
        >
          ♂ MALE
        </button>
        <button
          on:click={() => modelType.set('female_skeleton_muscles_anatomy_study')}
          class="hud-button text-[9px] {$modelType === 'female_skeleton_muscles_anatomy_study' ? 'bg-sentinel-optimal/20 border-sentinel-optimal hud-text-optimal' : 'opacity-50'}"
        >
          ♀ FEMALE
        </button>
      </div>
    </div>

    <!-- Right Controls -->
    <div class="flex gap-3 pointer-events-auto">
      <div class="hud-panel p-3 bg-white/90">
        <button
          on:click={() => autoRotate.update(v => !v)}
          class="hud-button text-[9px] {$autoRotate ? 'hud-text-optimal border-sentinel-optimal' : 'opacity-50'}"
        >
          ROTATE: {$autoRotate ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  </div>

  <!-- ═══ Corner Decorations ═══ -->
  <div class="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-sentinel-optimal/30 pointer-events-none"></div>
  <div class="absolute top-0 right-0 w-12 h-12 border-r-2 border-t-2 border-sentinel-optimal/30 pointer-events-none"></div>
  <div class="absolute bottom-0 left-0 w-12 h-12 border-l-2 border-b-2 border-sentinel-optimal/30 pointer-events-none"></div>
  <div class="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-sentinel-optimal/30 pointer-events-none"></div>
</div>

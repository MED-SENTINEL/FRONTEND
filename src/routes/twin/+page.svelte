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
    <div class="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-md z-10">
      <div class="space-y-6 text-center">
        <div class="text-xl font-bold text-sentinel-optimal animate-pulse">
          Preparing 3D Health Model...
        </div>
        <div class="text-xs text-sentinel-muted font-medium">
          Loading anatomical data, please wait.
        </div>
      </div>
    </div>
  {/if}

  <!-- ═══ TOP LEFT: Subject Info Panel ═══ -->
  <div class="absolute top-6 left-6 w-72 space-y-4 pointer-events-none z-20">
    <div class="hud-panel p-5 space-y-4">
      <div class="flex items-center justify-between">
        <div class="text-xs text-sentinel-dim font-bold">Patient Profile</div>
        <div class="flex items-center gap-1.5">
          <div class="w-2 h-2 rounded-full bg-sentinel-optimal animate-pulse"></div>
          <span class="text-[10px] font-bold text-sentinel-optimal">Connected</span>
        </div>
      </div>
      <div class="text-base text-sentinel-text font-bold">
        {$currentUser ? $currentUser.full_name : 'Unknown Patient'}
      </div>
      <div class="space-y-2.5 text-[10px] text-sentinel-muted font-medium">
        <div class="flex justify-between border-b border-slate-100 pb-1.5">
          <span>Blood Type</span>
          <span class="text-sentinel-text font-bold">{$currentUser?.blood_type || 'N/A'}</span>
        </div>
        <div class="flex justify-between border-b border-slate-100 pb-1.5">
          <span>Model View</span>
          <span class="text-sentinel-optimal font-bold">{$modelType.replace(/_/g, ' ')}</span>
        </div>
        <div class="flex justify-between border-b border-slate-100 pb-1.5">
          <span>Visual Mode</span>
          <span class="text-sentinel-optimal font-bold">{$modelType === 'skeleton' ? 'Detailed Skeleton' : 'Anatomical Model'}</span>
        </div>
        <div class="flex justify-between">
          <span>Analysis Resolution</span>
          <span class="text-sentinel-optimal font-bold">High</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ═══ BOTTOM: Controls ═══ -->
  <div class="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none z-20">
    <!-- Model Selector -->
    <div class="hud-panel p-5 pointer-events-auto bg-white/95">
      <div class="text-xs text-sentinel-dim font-bold mb-4">Switch Model View</div>
      <div class="flex gap-2">
        <button
          on:click={() => modelType.set('skeleton')}
          class="hud-button text-[10px] {$modelType === 'skeleton' ? 'bg-sentinel-optimal text-white' : 'text-slate-500'}"
        >
          Skeleton
        </button>
        <button
          on:click={() => modelType.set('male_skeleton_muscles_anatomy_study')}
          class="hud-button text-[10px] {$modelType === 'male_skeleton_muscles_anatomy_study' ? 'bg-sentinel-optimal text-white' : 'text-slate-500'}"
        >
          Male Model
        </button>
        <button
          on:click={() => modelType.set('female_skeleton_muscles_anatomy_study')}
          class="hud-button text-[10px] {$modelType === 'female_skeleton_muscles_anatomy_study' ? 'bg-sentinel-optimal text-white' : 'text-slate-500'}"
        >
          Female Model
        </button>
      </div>
    </div>

    <!-- Right Controls -->
    <div class="flex gap-3 pointer-events-auto">
      <div class="hud-panel p-3 bg-white/95">
        <button
          on:click={() => autoRotate.update(v => !v)}
          class="hud-button text-[10px] {$autoRotate ? 'text-sentinel-optimal border-sentinel-optimal/50' : 'text-slate-400'}"
        >
          Auto Rotate: {$autoRotate ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  </div>


</div>

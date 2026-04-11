<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { Canvas } from "@threlte/core";
  import BioTwin from "$lib/components/three/BioTwin.svelte";
  import TraumaPin from "$lib/components/three/TraumaPin.svelte";
  import { modelType, isLoaded, autoRotate } from "$lib/stores/twin";
  import { currentUser } from "$lib/stores/auth";
  import { fetchMyData } from "$lib/stores/data";
  import {
    isPicking,
    pickedPosition,
    traumaForm,
    resetForm,
  } from "$lib/stores/form";
  import { fade, fly } from "svelte/transition";

  // Handle pin event from 3D model (only fires in picking mode)
  function onPinPicked(event) {
    const { x, y, z } = event.detail;
    $pickedPosition = { x, y, z };
  }

  // Confirm the picked position and return to dashboard
  function confirmPosition() {
    if (!$pickedPosition) return;
    traumaForm.update((f) => ({
      ...f,
      position_x: $pickedPosition.x,
      position_y: $pickedPosition.y,
      position_z: $pickedPosition.z,
    }));
    $isPicking = false;
    $pickedPosition = null;
    goto("/");
  }

  // Cancel picking and return without saving coordinates
  function cancelPicking() {
    $isPicking = false;
    $pickedPosition = null;
    goto("/");
  }

  // Re-pick: clear the temporary pin and stay in picking mode
  function rePick() {
    $pickedPosition = null;
  }

  onMount(() => {
    fetchMyData();
  });
</script>

<div
  class="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-sentinel-bg"
>
  <Canvas>
    <BioTwin on:pin={onPinPicked} />

    <!-- Preview pin: show a temporary pin at the picked position before confirmation -->
    {#if $isPicking && $pickedPosition}
      <TraumaPin
        position={[$pickedPosition.x, $pickedPosition.y, $pickedPosition.z]}
        label="PICKED LOCATION"
        severity="low"
        active={true}
      />
    {/if}
  </Canvas>

  <!-- Loading Overlay -->
  {#if !$isLoaded}
    <div
      class="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-md z-10"
    >
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

  <!-- ═══ PICKING MODE HUD ═══ -->
  {#if $isPicking}
    <!-- Top Banner -->
    <div
      class="absolute top-4 left-1/2 -translate-x-1/2 z-30"
      in:fly={{ y: -20 }}
    >
      <div
        class="hud-panel px-6 py-3 bg-sentinel-accent/10 border-sentinel-accent/30 backdrop-blur-md flex items-center gap-4"
      >
        <div
          class="w-3 h-3 rounded-full bg-sentinel-accent animate-pulse"
        ></div>
        <div
          class="text-[11px] font-bold text-sentinel-accent uppercase tracking-[0.2em]"
        >
          🎯 Picking Mode — Click on the model to place a pin
        </div>
        <button
          on:click={cancelPicking}
          class="hud-button text-[9px] !border-sentinel-critical/30 !text-sentinel-critical hover:!bg-sentinel-critical/5 ml-4"
        >
          CANCEL
        </button>
      </div>
    </div>

    <!-- Confirm Position HUD (appears after clicking) -->
    {#if $pickedPosition}
      <div
        class="absolute bottom-24 left-1/2 -translate-x-1/2 z-30"
        in:fly={{ y: 20 }}
      >
        <div
          class="hud-panel p-5 bg-white/95 backdrop-blur-md border-sentinel-optimal/30 space-y-4 min-w-[320px]"
        >
          <div
            class="text-[10px] font-bold text-sentinel-text uppercase tracking-[0.2em] border-b border-slate-200 pb-2 flex items-center gap-2"
          >
            <div class="w-2 h-2 rounded-full bg-sentinel-optimal"></div>
            Confirm Pin Location
          </div>
          <div class="grid grid-cols-3 gap-3 text-center">
            <div class="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <div
                class="text-[8px] text-sentinel-dim uppercase tracking-widest font-bold"
              >
                X
              </div>
              <div class="text-sm font-mono font-bold text-sentinel-text">
                {$pickedPosition.x.toFixed(3)}
              </div>
            </div>
            <div class="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <div
                class="text-[8px] text-sentinel-dim uppercase tracking-widest font-bold"
              >
                Y
              </div>
              <div class="text-sm font-mono font-bold text-sentinel-text">
                {$pickedPosition.y.toFixed(3)}
              </div>
            </div>
            <div class="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <div
                class="text-[8px] text-sentinel-dim uppercase tracking-widest font-bold"
              >
                Z
              </div>
              <div class="text-sm font-mono font-bold text-sentinel-text">
                {$pickedPosition.z.toFixed(3)}
              </div>
            </div>
          </div>
          <div class="flex gap-3">
            <button
              on:click={rePick}
              class="hud-button text-[9px] flex-1 !border-slate-300 !text-sentinel-dim"
            >
              RE-PICK
            </button>
            <button
              on:click={confirmPosition}
              class="hud-button text-[9px] flex-1 bg-sentinel-optimal text-white border-sentinel-optimal"
            >
              ✓ CONFIRM POSITION
            </button>
          </div>
        </div>
      </div>
    {/if}
  {/if}

  <!-- ═══ TOP LEFT: Subject Info Panel (hidden during picking) ═══ -->
  {#if !$isPicking}
    <div class="absolute top-6 left-6 w-72 space-y-4 pointer-events-none z-20">
      <div class="hud-panel p-5 space-y-4">
        <div class="flex items-center justify-between">
          <div class="text-xs text-sentinel-dim font-bold">Patient Profile</div>
          <div class="flex items-center gap-1.5">
            <div
              class="w-2 h-2 rounded-full bg-sentinel-optimal animate-pulse"
            ></div>
            <span class="text-[10px] font-bold text-sentinel-optimal"
              >Connected</span
            >
          </div>
        </div>
        <div class="text-base text-sentinel-text font-bold">
          {$currentUser ? $currentUser.full_name : "Unknown Patient"}
        </div>
        <div class="space-y-2.5 text-[10px] text-sentinel-muted font-medium">
          <div class="flex justify-between border-b border-slate-100 pb-1.5">
            <span>Blood Type</span>
            <span class="text-sentinel-text font-bold"
              >{$currentUser?.blood_type || "N/A"}</span
            >
          </div>
          <div class="flex justify-between border-b border-slate-100 pb-1.5">
            <span>Model View</span>
            <span class="text-sentinel-optimal font-bold"
              >{$modelType.replace(/_/g, " ")}</span
            >
          </div>
          <div class="flex justify-between border-b border-slate-100 pb-1.5">
            <span>Visual Mode</span>
            <span class="text-sentinel-optimal font-bold"
              >{$modelType === "skeleton"
                ? "Detailed Skeleton"
                : "Anatomical Model"}</span
            >
          </div>
          <div class="flex justify-between">
            <span>Analysis Resolution</span>
            <span class="text-sentinel-optimal font-bold">High</span>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- ═══ BOTTOM: Controls (hidden during picking) ═══ -->
  {#if !$isPicking}
    <div
      class="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none z-20"
    >
      <!-- Model Selector -->
      <div class="hud-panel p-5 pointer-events-auto bg-white/95">
        <div class="text-xs text-sentinel-dim font-bold mb-4">
          Switch Model View
        </div>
        <div class="flex gap-2">
          <button
            on:click={() => modelType.set("skeleton")}
            class="hud-button text-[10px] {$modelType === 'skeleton'
              ? 'bg-sentinel-optimal text-white'
              : 'text-slate-500'}"
          >
            Skeleton
          </button>
          <button
            on:click={() =>
              modelType.set("male_skeleton_muscles_anatomy_study")}
            class="hud-button text-[10px] {$modelType ===
            'male_skeleton_muscles_anatomy_study'
              ? 'bg-sentinel-optimal text-white'
              : 'text-slate-500'}"
          >
            Male Model
          </button>
          <button
            on:click={() =>
              modelType.set("female_skeleton_muscles_anatomy_study")}
            class="hud-button text-[10px] {$modelType ===
            'female_skeleton_muscles_anatomy_study'
              ? 'bg-sentinel-optimal text-white'
              : 'text-slate-500'}"
          >
            Female Model
          </button>
        </div>
      </div>

      <!-- Right Controls -->
      <div class="flex gap-3 pointer-events-auto">
        <div class="hud-panel p-3 bg-white/95">
          <button
            on:click={() => autoRotate.update((v) => !v)}
            class="hud-button text-[10px] {$autoRotate
              ? 'text-sentinel-optimal border-sentinel-optimal/50'
              : 'text-slate-400'}"
          >
            Auto Rotate: {$autoRotate ? "ON" : "OFF"}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

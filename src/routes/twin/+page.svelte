<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { Canvas } from "@threlte/core";
  import BioTwin from "$lib/components/three/BioTwin.svelte";
  import TraumaPin from "$lib/components/three/TraumaPin.svelte";
  import TimeSlider from "$lib/components/three/TimeSlider.svelte";
  import { modelType, isLoaded, autoRotate } from "$lib/stores/twin";
  import { currentUser } from "$lib/stores/auth";
  import { traumaPins, fetchMyData } from "$lib/stores/data";
  import {
    isPicking,
    pickedPosition,
    traumaForm,
    resetForm,
  } from "$lib/stores/form";
  import { fade, fly } from "svelte/transition";

  let showTimeSlider = false;
  let filterDate = new Date();
  let isMobile = false;

  // Compute date range from trauma pins
  $: pinDates = ($traumaPins || [])
    .map(p => new Date(p.occurred_at || p.created_at))
    .filter(d => !isNaN(d.getTime()));

  $: minDate = pinDates.length > 0
    ? new Date(Math.min(...pinDates.map(d => d.getTime())))
    : new Date(Date.now() - 86400000 * 365);

  $: maxDate = new Date();

  $: dataPoints = pinDates;

  // Filter pins by slider date
  $: visiblePins = showTimeSlider
    ? ($traumaPins || []).filter(p => {
        const d = new Date(p.occurred_at || p.created_at);
        return d <= filterDate;
      })
    : ($traumaPins || []);

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

  function checkMobile() {
    isMobile = window.innerWidth < 768;
  }

  onMount(() => {
    fetchMyData();
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  });
</script>

<div
  class="relative w-full h-[calc(100vh-64px)] overflow-hidden {isMobile ? 'touch-none' : ''}"
  style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%);"
>
  <Canvas>
    <BioTwin on:pin={onPinPicked} filterPins={visiblePins} />

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
      class="absolute inset-0 flex items-center justify-center z-10"
      style="background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(12px);"
    >
      <div class="space-y-6 text-center">
        <div class="text-xl font-bold text-cyan-400 animate-pulse">
          Preparing 3D Health Model...
        </div>
        <div class="text-xs text-slate-400 font-medium">
          Loading anatomical data, please wait.
        </div>
      </div>
    </div>
  {/if}

  <!-- ═══ PICKING MODE HUD ═══ -->
  {#if $isPicking}
    <!-- Top Banner -->
    <div
      class="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-[90%] sm:w-auto"
      in:fly={{ y: -20 }}
    >
      <div
        class="hud-panel px-4 sm:px-6 py-3 bg-sentinel-accent/10 border-sentinel-accent/30 backdrop-blur-md flex items-center gap-3 sm:gap-4"
      >
        <div
          class="w-3 h-3 rounded-full bg-sentinel-accent animate-pulse shrink-0"
        ></div>
        <div
          class="text-[10px] sm:text-[11px] font-bold text-sentinel-accent uppercase tracking-[0.15em] sm:tracking-[0.2em]"
        >
          🎯 {isMobile ? 'Tap to place pin' : 'Click on the model to place a pin'}
        </div>
        <button
          on:click={cancelPicking}
          class="hud-button text-[9px] !border-sentinel-critical/30 !text-sentinel-critical hover:!bg-sentinel-critical/5 ml-auto shrink-0"
        >
          CANCEL
        </button>
      </div>
    </div>

    <!-- Confirm Position HUD (appears after clicking) -->
    {#if $pickedPosition}
      <div
        class="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 w-[90%] sm:w-auto"
        in:fly={{ y: 20 }}
      >
        <div
          class="hud-panel p-4 sm:p-5 bg-white/95 dark:bg-sentinel-dark-surface-0/95 backdrop-blur-md border-sentinel-optimal/30 space-y-4 min-w-0 sm:min-w-[320px]"
        >
          <div
            class="text-[10px] font-bold text-sentinel-text dark:text-white uppercase tracking-[0.2em] border-b border-slate-200 dark:border-slate-700 pb-2 flex items-center gap-2"
          >
            <div class="w-2 h-2 rounded-full bg-sentinel-optimal"></div>
            Confirm Pin Location
          </div>
          <div class="grid grid-cols-3 gap-2 sm:gap-3 text-center">
            <div class="p-2 rounded-lg bg-slate-50 dark:bg-sentinel-dark-surface-1 border border-slate-200 dark:border-slate-700">
              <div
                class="text-[8px] text-sentinel-dim dark:text-slate-400 uppercase tracking-widest font-bold"
              >
                X
              </div>
              <div class="text-sm font-mono font-bold text-sentinel-text dark:text-white">
                {$pickedPosition.x.toFixed(3)}
              </div>
            </div>
            <div class="p-2 rounded-lg bg-slate-50 dark:bg-sentinel-dark-surface-1 border border-slate-200 dark:border-slate-700">
              <div
                class="text-[8px] text-sentinel-dim dark:text-slate-400 uppercase tracking-widest font-bold"
              >
                Y
              </div>
              <div class="text-sm font-mono font-bold text-sentinel-text dark:text-white">
                {$pickedPosition.y.toFixed(3)}
              </div>
            </div>
            <div class="p-2 rounded-lg bg-slate-50 dark:bg-sentinel-dark-surface-1 border border-slate-200 dark:border-slate-700">
              <div
                class="text-[8px] text-sentinel-dim dark:text-slate-400 uppercase tracking-widest font-bold"
              >
                Z
              </div>
              <div class="text-sm font-mono font-bold text-sentinel-text dark:text-white">
                {$pickedPosition.z.toFixed(3)}
              </div>
            </div>
          </div>
          <div class="flex gap-2 sm:gap-3">
            <button
              on:click={rePick}
              class="hud-button text-[9px] flex-1 !border-slate-300 dark:!border-slate-600 !text-sentinel-dim dark:!text-slate-300"
            >
              RE-PICK
            </button>
            <button
              on:click={confirmPosition}
              class="hud-button text-[9px] flex-1 bg-sentinel-optimal text-white border-sentinel-optimal"
            >
              ✓ CONFIRM
            </button>
          </div>
        </div>
      </div>
    {/if}
  {/if}

  <!-- ═══ TOP LEFT: Subject Info Panel (hidden during picking, hidden on mobile) ═══ -->
  {#if !$isPicking && !isMobile}
    <div class="absolute top-6 left-6 w-72 space-y-4 pointer-events-none z-20">
      <div class="p-5 space-y-4 rounded-2xl border border-white/10" style="background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(16px);">
        <div class="flex items-center justify-between">
          <div class="text-xs text-slate-400 font-bold">Patient Profile</div>
          <div class="flex items-center gap-1.5">
            <div
              class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"
            ></div>
            <span class="text-[10px] font-bold text-cyan-400"
              >Connected</span
            >
          </div>
        </div>
        <div class="text-base text-white font-bold">
          {$currentUser ? $currentUser.full_name : "Unknown Patient"}
        </div>
        <div class="space-y-2.5 text-[10px] text-slate-400 font-medium">
          <div class="flex justify-between border-b border-white/10 pb-1.5">
            <span>Blood Type</span>
            <span class="text-white font-bold"
              >{$currentUser?.blood_type || "N/A"}</span
            >
          </div>
          <div class="flex justify-between border-b border-white/10 pb-1.5">
            <span>Model View</span>
            <span class="text-cyan-400 font-bold"
              >{$modelType.replace(/_/g, " ")}</span
            >
          </div>
          <div class="flex justify-between border-b border-white/10 pb-1.5">
            <span>Visual Mode</span>
            <span class="text-cyan-400 font-bold"
              >{$modelType === "skeleton"
                ? "Detailed Skeleton"
                : "Anatomical Model"}</span
            >
          </div>
          <div class="flex justify-between">
            <span>Visible Pins</span>
            <span class="text-cyan-400 font-bold">{visiblePins.length}</span>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- ═══ BOTTOM: Controls (hidden during picking) ═══ -->
  {#if !$isPicking}
    <div
      class="absolute bottom-20 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-end gap-3 pointer-events-none z-20 {showTimeSlider ? 'bottom-44 sm:bottom-36' : ''}"
    >
      <!-- Model Selector -->
      <div class="p-4 sm:p-5 pointer-events-auto rounded-2xl border border-white/10" style="background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(16px);">
        <div class="text-xs text-slate-400 font-bold mb-3 sm:mb-4">
          Switch Model View
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            on:click={() => modelType.set("skeleton")}
            class="px-3 sm:px-4 py-2 rounded-xl text-[10px] font-bold border transition-all {$modelType === 'skeleton'
              ? 'bg-cyan-500 text-white border-cyan-400'
              : 'text-slate-400 border-white/10 hover:border-cyan-400/50'}"
          >
            Skeleton
          </button>
          <button
            on:click={() =>
              modelType.set("male_skeleton_muscles_anatomy_study")}
            class="px-3 sm:px-4 py-2 rounded-xl text-[10px] font-bold border transition-all {$modelType ===
            'male_skeleton_muscles_anatomy_study'
              ? 'bg-cyan-500 text-white border-cyan-400'
              : 'text-slate-400 border-white/10 hover:border-cyan-400/50'}"
          >
            Male
          </button>
          <button
            on:click={() =>
              modelType.set("female_skeleton_muscles_anatomy_study")}
            class="px-3 sm:px-4 py-2 rounded-xl text-[10px] font-bold border transition-all {$modelType ===
            'female_skeleton_muscles_anatomy_study'
              ? 'bg-cyan-500 text-white border-cyan-400'
              : 'text-slate-400 border-white/10 hover:border-cyan-400/50'}"
          >
            Female
          </button>
        </div>
      </div>

      <!-- Right Controls -->
      <div class="flex gap-2 sm:gap-3 pointer-events-auto">
        <!-- Time Slider Toggle -->
        <div class="p-3 rounded-2xl border border-white/10" style="background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(16px);">
          <button
            on:click={() => showTimeSlider = !showTimeSlider}
            class="px-3 sm:px-4 py-2 rounded-xl text-[10px] font-bold border transition-all {showTimeSlider
              ? 'text-cyan-400 border-cyan-400/50 bg-cyan-400/10'
              : 'text-slate-500 border-white/10 hover:border-cyan-400/30'}"
          >
            ⏱ Time-Travel: {showTimeSlider ? 'ON' : 'OFF'}
          </button>
        </div>

        {#if !isMobile}
          <div class="p-3 rounded-2xl border border-white/10" style="background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(16px);">
            <button
              on:click={() => autoRotate.update((v) => !v)}
              class="px-3 sm:px-4 py-2 rounded-xl text-[10px] font-bold border transition-all {$autoRotate
                ? 'text-cyan-400 border-cyan-400/50'
                : 'text-slate-500 border-white/10'}"
            >
              Auto Rotate: {$autoRotate ? "ON" : "OFF"}
            </button>
          </div>
        {/if}
      </div>
    </div>

    <!-- Time Slider -->
    {#if showTimeSlider && pinDates.length > 0}
      <TimeSlider
        {minDate}
        {maxDate}
        bind:currentDate={filterDate}
        {dataPoints}
      />
    {/if}
  {/if}
</div>

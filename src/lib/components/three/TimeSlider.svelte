<script>
  import { fade } from 'svelte/transition';

  /** @type {Date} */ export let minDate;
  /** @type {Date} */ export let maxDate;
  /** @type {Date} */ export let currentDate;
  /** @type {Array<Date>} */ export let dataPoints = [];

  let playing = false;
  let speed = 1;
  let playInterval;

  $: range = maxDate.getTime() - minDate.getTime();
  $: sliderValue = range > 0
    ? ((currentDate.getTime() - minDate.getTime()) / range) * 100
    : 100;

  function onSliderInput(e) {
    const pct = parseFloat(e.target.value);
    const time = minDate.getTime() + (pct / 100) * range;
    currentDate = new Date(time);
  }

  function togglePlay() {
    playing = !playing;
    if (playing) {
      const stepMs = range / 200; // 200 steps total
      playInterval = setInterval(() => {
        const next = currentDate.getTime() + (stepMs * speed);
        if (next >= maxDate.getTime()) {
          currentDate = new Date(maxDate);
          playing = false;
          clearInterval(playInterval);
        } else {
          currentDate = new Date(next);
        }
      }, 50);
    } else {
      clearInterval(playInterval);
    }
  }

  function cycleSpeed() {
    if (speed === 1) speed = 2;
    else if (speed === 2) speed = 5;
    else speed = 1;
  }

  function formatDate(d) {
    if (!d || isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function getTickPosition(date) {
    if (range <= 0) return 50;
    return ((date.getTime() - minDate.getTime()) / range) * 100;
  }

  import { onDestroy } from 'svelte';
  onDestroy(() => { if (playInterval) clearInterval(playInterval); });
</script>

<div
  class="absolute bottom-20 sm:bottom-6 left-4 right-4 sm:left-6 sm:right-6 z-30 pointer-events-auto"
  in:fade={{ duration: 300 }}
>
  <div class="rounded-2xl border border-white/10 p-4 sm:p-5 space-y-3" style="background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(16px);">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.15em]">Time-Travel</span>
      </div>
      <div class="text-[11px] font-bold text-white font-mono">{formatDate(currentDate)}</div>
    </div>

    <!-- Slider Track -->
    <div class="relative h-6 flex items-center">
      <!-- Data point ticks -->
      {#each dataPoints as dp}
        <div
          class="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400/60 z-10 pointer-events-none"
          style="left: {getTickPosition(dp)}%"
        ></div>
      {/each}

      <input
        type="range"
        min="0"
        max="100"
        step="0.5"
        value={sliderValue}
        on:input={onSliderInput}
        class="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10
               [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(34,211,238,0.5)] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-cyan-300
               [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-cyan-400 [&::-moz-range-thumb]:shadow-[0_0_12px_rgba(34,211,238,0.5)] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-cyan-300"
      />
    </div>

    <!-- Controls -->
    <div class="flex items-center justify-between">
      <div class="text-[9px] text-slate-400 font-mono">{formatDate(minDate)}</div>
      
      <div class="flex items-center gap-2">
        <button
          on:click={togglePlay}
          class="px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all {playing ? 'text-amber-400 border-amber-400/50 bg-amber-400/10' : 'text-cyan-400 border-cyan-400/50 bg-cyan-400/10'}"
        >
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
        <button
          on:click={cycleSpeed}
          class="px-2 py-1.5 rounded-lg text-[10px] font-bold text-slate-400 border border-white/10 hover:border-cyan-400/50 transition-all"
        >
          {speed}x
        </button>
      </div>

      <div class="text-[9px] text-slate-400 font-mono">{formatDate(maxDate)}</div>
    </div>
  </div>
</div>

<script>
  import { T } from "@threlte/core";
  import { Float, HTML } from "@threlte/extras";
  import { AdditiveBlending, DoubleSide } from "three";
  import { createEventDispatcher } from "svelte";

  export let position = [0, 0, 0];
  export let label = "TRAUMA_DATA";
  export let severity = "medium";
  export let traumaType = "condition";
  export let description = "";
  export let bodyRegion = "";
  export let pinId = "";

  const dispatch = createEventDispatcher();

  let showDetails = false;
  let hovered = false;

  // Severity-based color coding — vivid, high-visibility palette
  const SEVERITY_COLORS = {
    critical: {
      color: "#FF1744",
      emissive: "#FF1744",
      ring: "#FF5252",
      pulse: "#FF8A80",
    },
    high: {
      color: "#FF6D00",
      emissive: "#FF6D00",
      ring: "#FF9100",
      pulse: "#FFAB40",
    },
    medium: {
      color: "#FFD600",
      emissive: "#FFD600",
      ring: "#FFEA00",
      pulse: "#FFFF00",
    },
    low: {
      color: "#00E5FF",
      emissive: "#00E5FF",
      ring: "#18FFFF",
      pulse: "#84FFFF",
    },
  };

  const SEVERITY_LABELS = {
    critical: "CRITICAL",
    high: "HIGH RISK",
    medium: "MODERATE",
    low: "LOW RISK",
  };

  $: colors = SEVERITY_COLORS[severity] || SEVERITY_COLORS.medium;
  $: severityLabel = SEVERITY_LABELS[severity] || "MODERATE";

  function handleClick() {
    showDetails = !showDetails;
    dispatch("pinclick", {
      id: pinId,
      label,
      severity,
      traumaType,
      description,
      bodyRegion,
    });
  }

  // Severity badge styling for HUD label
  $: severityBadgeClass =
    {
      critical: "pin-badge-critical",
      high: "pin-badge-high",
      medium: "pin-badge-medium",
      low: "pin-badge-low",
    }[severity] || "pin-badge-medium";
</script>

<Float speed={2} rotationIntensity={0} floatIntensity={0.15}>
  <T.Group position={[position[0], position[1], position[2]]}>
    <!-- Clickable Hit Area (invisible, larger for easy clicking) -->
    <T.Mesh
      on:dblclick={handleClick}
      on:pointerenter={() => (hovered = true)}
      on:pointerleave={() => {
        hovered = false;
      }}
    >
      <T.SphereGeometry args={[0.08, 16, 16]} />
      <T.MeshBasicMaterial
        transparent
        opacity={0}
        side={DoubleSide}
        depthWrite={false}
      />
    </T.Mesh>

    <!-- Inner Core — small solid dot -->
    <T.Mesh scale={hovered || showDetails ? 1.4 : 1}>
      <T.SphereGeometry args={[0.025, 16, 16]} />
      <T.MeshStandardMaterial
        color={colors.color}
        emissive={colors.emissive}
        emissiveIntensity={2.5}
        transparent
        opacity={0.8}
        depthWrite={false}
      />
    </T.Mesh>

    <!-- Glow Ring — subtle halo -->
    <T.Mesh scale={hovered || showDetails ? 2.2 : 1.8}>
      <T.SphereGeometry args={[0.025, 16, 16]} />
      <T.MeshStandardMaterial
        color={colors.ring}
        emissive={colors.ring}
        emissiveIntensity={1}
        transparent
        opacity={hovered ? 0.25 : 0.12}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </T.Mesh>

    <!-- Point Light — soft local glow -->
    <T.PointLight
      color={colors.color}
      intensity={hovered || showDetails ? 1.5 : 0.6}
      distance={0.4}
      decay={2}
    />

    <!-- Severity Label (always visible above pin) -->
    <HTML position={[0, 0.08, 0]} pointerEvents="none" center>
      <div class="pin-label {severityBadgeClass}">
        {label}
      </div>
    </HTML>

    <!-- Detail Panel (shown on click) -->
    {#if showDetails}
      <HTML position={[0, 0.28, 0]} pointerEvents="auto" center>
        <div class="pin-detail-card">
          <!-- Close button -->
          <button
            class="pin-close-btn"
            on:click|stopPropagation={() => (showDetails = false)}>✕</button
          >

          <div class="pin-detail-header {severityBadgeClass}">
            {severityLabel}
          </div>

          <div class="pin-detail-title">{label}</div>

          {#if traumaType}
            <div class="pin-detail-row">
              <span class="pin-detail-key">Type</span>
              <span class="pin-detail-value">{traumaType}</span>
            </div>
          {/if}

          {#if bodyRegion}
            <div class="pin-detail-row">
              <span class="pin-detail-key">Region</span>
              <span class="pin-detail-value">{bodyRegion}</span>
            </div>
          {/if}

          {#if description}
            <div class="pin-detail-desc">{description}</div>
          {/if}

          <div class="pin-detail-coords">
            <span>X: {position[0]?.toFixed(2)}</span>
            <span>Y: {position[1]?.toFixed(2)}</span>
            <span>Z: {position[2]?.toFixed(2)}</span>
          </div>
        </div>
      </HTML>
    {/if}
  </T.Group>
</Float>

<style>
  /* ─── Pin Label (always visible) ─── */
  .pin-label {
    white-space: nowrap;
    padding: 3px 10px;
    border-radius: 6px;
    font-size: 9px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    backdrop-filter: blur(8px);
    border: 1px solid;
    pointer-events: none;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  /* ─── Severity badge classes ─── */
  .pin-badge-critical {
    background: rgba(255, 23, 68, 0.25);
    border-color: rgba(255, 23, 68, 0.6);
    color: #ff8a80;
  }
  .pin-badge-high {
    background: rgba(255, 109, 0, 0.25);
    border-color: rgba(255, 109, 0, 0.6);
    color: #ffab40;
  }
  .pin-badge-medium {
    background: rgba(255, 214, 0, 0.25);
    border-color: rgba(255, 214, 0, 0.6);
    color: #ffff00;
  }
  .pin-badge-low {
    background: rgba(0, 229, 255, 0.25);
    border-color: rgba(0, 229, 255, 0.6);
    color: #84ffff;
  }

  /* ─── Detail Card (on click) ─── */
  .pin-detail-card {
    position: relative;
    background: rgba(15, 23, 42, 0.92);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    padding: 14px 16px;
    min-width: 200px;
    max-width: 260px;
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.5),
      0 0 20px rgba(0, 229, 255, 0.1);
    color: #e2e8f0;
    font-family: "Inter", sans-serif;
  }

  .pin-close-btn {
    position: absolute;
    top: 8px;
    right: 10px;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
    cursor: pointer;
    padding: 2px 4px;
    line-height: 1;
  }
  .pin-close-btn:hover {
    color: #ff5252;
  }

  .pin-detail-header {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 8px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    margin-bottom: 6px;
  }

  .pin-detail-title {
    font-size: 13px;
    font-weight: 700;
    color: #f1f5f9;
    margin-bottom: 10px;
    line-height: 1.3;
  }

  .pin-detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 10px;
  }

  .pin-detail-key {
    color: rgba(255, 255, 255, 0.45);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 600;
    font-size: 9px;
  }

  .pin-detail-value {
    color: #e2e8f0;
    font-weight: 600;
    text-transform: capitalize;
  }

  .pin-detail-desc {
    margin-top: 8px;
    padding: 8px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    font-size: 10px;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.7);
  }

  .pin-detail-coords {
    display: flex;
    gap: 10px;
    margin-top: 8px;
    padding-top: 6px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 9px;
    font-family: "JetBrains Mono", monospace;
    color: rgba(255, 255, 255, 0.35);
  }
</style>

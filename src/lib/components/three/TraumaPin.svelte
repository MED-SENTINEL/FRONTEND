<script>
  import { T } from '@threlte/core';
  import { Float, HTML } from '@threlte/extras';
  import { AdditiveBlending } from 'three';

  export let position = [0, 0, 0];
  export let label = "TRAUMA_DATA";
  export let severity = "medium";
  export let traumaType = "condition";
  export let active = false;

  // Severity-based color coding
  const SEVERITY_COLORS = {
    critical: { color: "#EF4444", emissive: "#DC2626" },
    high:     { color: "#F97316", emissive: "#EA580C" },
    medium:   { color: "#EAB308", emissive: "#CA8A04" },
    low:      { color: "#06B6D4", emissive: "#0891B2" },
  };

  $: colors = SEVERITY_COLORS[severity] || SEVERITY_COLORS.medium;

  $: matData = {
    color: colors.color,
    emissive: colors.emissive,
    emissiveIntensity: 2,
    transparent: true,
    opacity: 0.85
  };

  // Severity badge styling for HUD label
  $: severityBadgeClass = {
    critical: "border-red-400/50 bg-red-500/20 text-red-300",
    high:     "border-orange-400/50 bg-orange-500/20 text-orange-300",
    medium:   "border-yellow-400/50 bg-yellow-500/20 text-yellow-300",
    low:      "border-cyan-400/50 bg-cyan-500/20 text-cyan-300",
  }[severity] || "border-yellow-400/50 bg-yellow-500/20 text-yellow-300";
</script>

<Float speed={2} rotationIntensity={0} floatIntensity={0.2}>
  <T.Group position={[position[0], position[1], position[2]]}>
    <!-- Inner Core -->
    <T.Mesh>
      <T.SphereGeometry args={[0.02, 16, 16]} />
      <T.MeshStandardMaterial {...matData} />
    </T.Mesh>

    <!-- Outer Glow -->
    <T.Mesh scale={active ? 2 : 1.5}>
      <T.SphereGeometry args={[0.035, 16, 16]} />
      <T.MeshStandardMaterial 
        {...matData} 
        opacity={active ? 0.4 : 0.2} 
        blending={AdditiveBlending} 
      />
    </T.Mesh>

    <!-- HUD Label -->
    <HTML position={[0, 0.08, 0]} pointerEvents="none">
      <div class="whitespace-nowrap px-2 py-0.5 rounded border {severityBadgeClass} text-[6px] font-bold uppercase tracking-[0.2em] transform -translate-x-1/2 backdrop-blur-sm">
        {label}
      </div>
    </HTML>
  </T.Group>
</Float>

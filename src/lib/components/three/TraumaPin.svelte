<script>
  import { T } from '@threlte/core';
  import { Float, HTML } from '@threlte/extras';
  import { AdditiveBlending } from 'three';

  export let position = [0, 0, 0];
  export let label = "TRAUMA_DATA";
  export let active = false;

  const matData = {
    color: "#FF3366",
    emissive: "#FF0000",
    emissiveIntensity: 2,
    transparent: true,
    opacity: 0.8
  };
</script>

<Float speed={2} rotationIntensity={0} floatIntensity={0.2}>
  <T.Group position={[position[0], position[1], position[2]]}>
    <!-- Inner Core -->
    <T.Mesh>
      <T.SphereGeometry args={[0.04, 16, 16]} />
      <T.MeshStandardMaterial {...matData} />
    </T.Mesh>

    <!-- Outer Glow -->
    <T.Mesh scale={active ? 2 : 1.5}>
      <T.SphereGeometry args={[0.06, 16, 16]} />
      <T.MeshStandardMaterial 
        {...matData} 
        opacity={active ? 0.4 : 0.2} 
        blending={AdditiveBlending} 
      />
    </T.Mesh>

    <!-- HUD Label -->
    <HTML position={[0, 0.1, 0]} pointerEvents="none">
      <div class="whitespace-nowrap px-2 py-0.5 border border-sentinel-optimal/30 bg-sentinel-bg/80 text-[6px] font-bold hud-text-optimal uppercase tracking-[0.2em] transform -translate-x-1/2">
        {label}
      </div>
    </HTML>
  </T.Group>
</Float>

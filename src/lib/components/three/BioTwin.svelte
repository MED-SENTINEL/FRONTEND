<script>
  import { T } from '@threlte/core';
  import { OrbitControls, ContactShadows, Float } from '@threlte/extras';
  import HumanModel from './HumanModel.svelte';
  import ScannerBeam from './ScannerBeam.svelte';
  import TraumaPin from './TraumaPin.svelte';
  import { modelType, autoRotate } from '../../stores/twin';
  import { traumaPins, addTraumaPin } from '../../stores/data';
  import { currentUser } from '../../stores/auth';
  import { get } from 'svelte/store';

  function onModelPin(event) {
    const user = get(currentUser);
    if (!user) return;
    
    const { x, y, z } = event.detail;
    addTraumaPin(x, y, z);
  }
</script>

<T.PerspectiveCamera
  makeDefault
  position={[0, 1.5, 5]}
  fov={45}
>
  <OrbitControls
    enableDamping
    target={[0, 1, 0]}
    autoRotate={$autoRotate}
    autoRotateSpeed={0.5}
  />
</T.PerspectiveCamera>

<T.AmbientLight color="#FFFFFF" intensity={1.5} />
<!-- Main Front Light (Cyan) -->
<T.DirectionalLight
  position={[5, 10, 5]}
  color="#FFFFFF"
  intensity={2}
/>

<!-- Back-Left Rim Light (Magenta) -->
<T.PointLight
  position={[-5, 5, -5]}
  color="#8B5CF6"
  intensity={1.5}
/>

<!-- Back-Right Fill (Soft Blue) -->
<T.DirectionalLight
  position={[5, 5, -10]}
  color="#88CCFF"
  intensity={1.5}
/>

<!-- Underground Bounce -->
<T.PointLight
  position={[0, -5, 0]}
  color="#F1F5F9"
  intensity={0.8}
/>

<Float
  speed={1}
  rotationIntensity={0.2}
  floatIntensity={0.5}
>
  <HumanModel type={$modelType} on:pin={onModelPin} />
  
  {#each $traumaPins as pin}
    <TraumaPin position={[pin.x, pin.y, pin.z]} label={pin.note} />
  {/each}
</Float>

<ScannerBeam />

<ContactShadows
  scale={10}
  blur={2.5}
  far={2.5}
  opacity={0.15}
  color="#000000"
/>

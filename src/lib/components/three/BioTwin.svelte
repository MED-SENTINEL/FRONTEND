<script>
  import { T } from "@threlte/core";
  import {
    OrbitControls,
    ContactShadows,
    Float,
    interactivity,
  } from "@threlte/extras";
  import HumanModel from "./HumanModel.svelte";
  import TraumaPin from "./TraumaPin.svelte";
  import { modelType, autoRotate } from "../../stores/twin";
  import { traumaPins } from "../../stores/data";
  import { isPicking } from "../../stores/form";
  import { createEventDispatcher } from "svelte";

  interactivity();

  const dispatch = createEventDispatcher();

  function onModelPin(event) {
    dispatch("pin", event.detail);
  }

  function onPinClick(event) {
    dispatch("pinclick", event.detail);
  }
</script>

<T.PerspectiveCamera makeDefault position={[0, 1.5, 5]} fov={45}>
  <OrbitControls
    enableDamping
    target={[0, 1, 0]}
    autoRotate={$autoRotate}
    autoRotateSpeed={0.5}
  />
</T.PerspectiveCamera>

<T.AmbientLight color="#E0F7FA" intensity={2} />
<T.DirectionalLight position={[3, 8, 5]} color="#FFFFFF" intensity={3} />
<T.DirectionalLight position={[-5, 5, 3]} color="#00BCD4" intensity={1.5} />
<T.PointLight position={[-4, 4, -5]} color="#7C3AED" intensity={2} />
<T.DirectionalLight position={[5, 3, -8]} color="#FFF8E1" intensity={1.2} />
<T.PointLight position={[0, -3, 0]} color="#E0F7FA" intensity={1.5} />
<T.PointLight position={[0, 0.5, 4]} color="#FFFFFF" intensity={1} />

<Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
  <HumanModel type={$modelType} on:pin={onModelPin} />

  {#each $traumaPins as pin (pin.id)}
    <TraumaPin
      position={[pin.x, pin.y, pin.z]}
      label={pin.title || pin.body_region || "TRAUMA"}
      severity={pin.severity || "medium"}
      traumaType={pin.trauma_type || "condition"}
      description={pin.description || pin.notes || ""}
      bodyRegion={pin.body_region || ""}
      pinId={pin.id}
      on:pinclick={onPinClick}
    />
  {/each}
</Float>

<ContactShadows
  scale={10}
  blur={2.5}
  far={2.5}
  opacity={0.15}
  color="#000000"
/>

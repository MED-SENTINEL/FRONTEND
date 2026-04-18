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
  import { useThrelte } from "@threlte/core";
  import { Raycaster, Vector3, Plane, Vector2 } from "three";
  import { onMount, onDestroy } from "svelte";

  interactivity();

  const dispatch = createEventDispatcher();
  const { camera, renderer } = useThrelte();
  
  let controls;
  const raycaster = new Raycaster();
  const mouse = new Vector2();

  function onModelPin(event) {
    dispatch("pin", event.detail);
  }

  function onPinClick(event) {
    dispatch("pinclick", event.detail);
  }

  function handleWheel(event) {
    // Only zoom to cursor if scrolling directly over the 3D canvas
    if (!controls || !$camera || !renderer) return;
    const domElement = renderer.domElement;
    if (event.target !== domElement && !domElement.contains(event.target)) return;

    // Calculate Normalized Device Coordinates (-1 to 1) from mouse wheel event
    const rect = domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Calculate focal point on the plane of the current target
    raycaster.setFromCamera(mouse, $camera);
    const cameraDir = new Vector3();
    $camera.getWorldDirection(cameraDir);
    const focalPlane = new Plane().setFromNormalAndCoplanarPoint(cameraDir, controls.target);
    
    const hitPoint = new Vector3();
    raycaster.ray.intersectPlane(focalPlane, hitPoint);

    if (hitPoint) {
      // Zoom step multiplier (15% per tick)
      const zoomIn = event.deltaY < 0;
      const factor = zoomIn ? 0.85 : 1.15;

      // Scale both camera position and target around the mouse hover point!
      $camera.position.sub(hitPoint).multiplyScalar(factor).add(hitPoint);
      controls.target.sub(hitPoint).multiplyScalar(factor).add(hitPoint);
      
      controls.update();
    }
  }

  onMount(() => {
    // Passive false allows us to potentially prevent default if we wanted, 
    // but OrbitControls doesn't need preventDefault if we disabled its zoom.
    window.addEventListener("wheel", handleWheel, { passive: false });
  });

  onDestroy(() => {
    window.removeEventListener("wheel", handleWheel);
  });
</script>

<T.PerspectiveCamera makeDefault position={[0, 1.5, 5]} fov={45}>
  <OrbitControls
    bind:ref={controls}
    enableZoom={false}
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

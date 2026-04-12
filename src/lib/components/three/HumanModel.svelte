<script>
  import { T, useLoader, useThrelte } from "@threlte/core";
  import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
  import {
    MeshStandardMaterial,
    MeshPhysicalMaterial,
    DoubleSide,
    Box3,
    Vector3,
    Raycaster,
    Vector2,
    FrontSide,
  } from "three";
  import { isLoaded } from "../../stores/twin";
  import { isPicking, pickedPosition } from "../../stores/form";
  import { createEventDispatcher, onDestroy } from "svelte";

  export let type = "skeleton";
  const dispatch = createEventDispatcher();

  let model = null;
  let loadError = false;
  
  // Real-time hover state for visual feedback
  let hoverPoint = null;

  const { camera, canvas: threlteCanvas } = useThrelte();
  const raycaster = new Raycaster();
  const mouse = new Vector2();

  // ─── HIGH-VISIBILITY MATERIALS ────────────────────────────────────────────

  // Skeleton wireframe — bright cyan-white for maximum contrast
  const wireMat = new MeshStandardMaterial({
    color: "#22D3EE",
    emissive: "#0891B2",
    emissiveIntensity: 0.6,
    wireframe: true,
    transparent: true,
    opacity: 0.7,
    side: DoubleSide,
  });

  // Solid anatomy model — clean, translucent medical look
  const solidMat = new MeshPhysicalMaterial({
    color: "#A5F3FC",
    emissive: "#155E75",
    emissiveIntensity: 0.3,
    metalness: 0.15,
    roughness: 0.4,
    transparent: true,
    opacity: 0.82,
    side: FrontSide,
    clearcoat: 0.3,
    clearcoatRoughness: 0.2,
  });

  $: activeMat = type === "skeleton" ? wireMat : solidMat;

  const loader = useLoader(OBJLoader);

  function processModel(obj) {
    obj.traverse((child) => {
      if (child.isMesh) {
        child.material = activeMat;
      }
    });

    const box = new Box3().setFromObject(obj);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2.5 / maxDim;

    obj.scale.set(scale, scale, scale);
    obj.position.x = -center.x * scale;
    obj.position.y = -center.y * scale + 1;
    obj.position.z = -center.z * scale;
    obj.updateMatrixWorld(true);

    model = obj;
    isLoaded.set(true);
    console.log("[HumanModel] Interaction System Initialized.");
  }

  $: {
    isLoaded.set(false);
    model = null;
    loadError = false;
    const promise = loader.load(`/models/${type}.OBJ`);
    promise.then(processModel).catch((err) => {
      console.error("Model load error:", err);
      loadError = true;
    });
  }

  function getIntersection(event) {
    if (!threlteCanvas || !model || !$camera) return null;

    const rect = threlteCanvas.getBoundingClientRect();
    
    // Convert mouse to Normalized Device Coordinates (-1 to +1)
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, $camera);

    const meshes = [];
    model.traverse((child) => {
      if (child.isMesh) meshes.push(child);
    });

    const intersects = raycaster.intersectObjects(meshes, true);
    return intersects.length > 0 ? intersects[0] : null;
  }

  // Handle ANY interaction — will be triggered by button fallback or click
  function markLocation(point) {
    if (!point) return;
    console.log(`[HumanModel] Marking selection at:`, point);
    
    // Write to both event AND store to ensure UI catches it
    $pickedPosition = { x: point.x, y: point.y, z: point.z };
    dispatch("pin", { x: point.x, y: point.y, z: point.z });
  }

  function handleDoubleClick(event) {
    if (!$isPicking || !model) return;
    const hit = getIntersection(event);
    if (hit) markLocation(hit.point);
  }

  function handleMouseMove(event) {
    if (!$isPicking || !model) {
      hoverPoint = null;
      document.body.style.cursor = "auto";
      return;
    }

    const hit = getIntersection(event);
    if (hit) {
      hoverPoint = hit.point;
      document.body.style.cursor = "crosshair";
    } else {
      hoverPoint = null;
      document.body.style.cursor = "auto";
    }
  }

  // --- NATIVE INTERACTION FALLBACK ---
  // In case double-click is failing on your device, we also support 
  // clicking the "Preview Dot" itself if it appears.
  function handleGhostClick() {
    if (hoverPoint) markLocation(hoverPoint);
  }

  let listenersAttached = false;
  $: if (typeof window !== "undefined" && $isPicking) {
    attachListeners();
  } else {
    detachListeners();
  }

  function attachListeners() {
    if (listenersAttached) return;
    window.addEventListener("dblclick", handleDoubleClick);
    window.addEventListener("mousemove", handleMouseMove);
    listenersAttached = true;
  }

  function detachListeners() {
    if (!listenersAttached) return;
    window.removeEventListener("dblclick", handleDoubleClick);
    window.removeEventListener("mousemove", handleMouseMove);
    document.body.style.cursor = "auto";
    listenersAttached = false;
  }

  onDestroy(() => {
    detachListeners();
  });
</script>

{#if model}
  <T.Group>
    <T is={model} />
    
    <!-- ═══ THE "GHOST PIN" (Other Way) ═══ -->
    <!-- This dot follows your mouse across the skin. 
         If you see this dot, it means picking is working! 
         You can successfully click or double-click to lock it in. -->
    {#if $isPicking && hoverPoint}
      <T.Mesh 
        position={[hoverPoint.x, hoverPoint.y, hoverPoint.z]} 
        on:click={handleGhostClick}
      >
        <T.SphereGeometry args={[0.04, 24, 24]} />
        <T.MeshStandardMaterial 
          color="#00E5FF" 
          emissive="#00E5FF" 
          emissiveIntensity={3} 
          transparent
          opacity={0.9}
        />
        <T.PointLight intensity={2} distance={0.6} color="#00E5FF" />
      </T.Mesh>
      
      <!-- Ghost outer ring -->
      <T.Mesh 
        position={[hoverPoint.x, hoverPoint.y, hoverPoint.z]}
      >
        <T.SphereGeometry args={[0.07, 16, 16]} />
        <T.MeshStandardMaterial 
          color="#00E5FF" 
          emissive="#00E5FF" 
          emissiveIntensity={1.5} 
          transparent
          opacity={0.2}
        />
      </T.Mesh>
    {/if}

    <!-- Result Pin (after picking, before confirmation) -->
    {#if $pickedPosition}
      <T.Mesh position={[$pickedPosition.x, $pickedPosition.y, $pickedPosition.z]}>
        <T.SphereGeometry args={[0.05, 24, 24]} />
        <T.MeshStandardMaterial 
          color="#FF1744" 
          emissive="#FF1744" 
          emissiveIntensity={3} 
          transparent
          opacity={0.95}
        />
        <T.PointLight intensity={2} distance={0.5} color="#FF1744" />
      </T.Mesh>
    {/if}
  </T.Group>
{/if}

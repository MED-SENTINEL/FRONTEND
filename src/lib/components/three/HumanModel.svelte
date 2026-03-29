<script>
  import { T, useLoader } from '@threlte/core';
  import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
  import { MeshStandardMaterial, DoubleSide, Box3, Vector3 } from 'three';
  import { isLoaded } from '../../stores/twin';
  import { createEventDispatcher, onMount } from 'svelte';

  export let type = 'skeleton';
  const dispatch = createEventDispatcher();
  
  let model = null;
  let loadError = false;

  const wireMat = new MeshStandardMaterial({
    color: "#A020F0",
    emissive: "#4C1D95",
    wireframe: true,
    transparent: true,
    opacity: 0.3,
    side: DoubleSide
  });

  const solidMat = new MeshStandardMaterial({
    color: "#00CCDD",
    emissive: "#001122",
    metalness: 0.6,
    roughness: 0.3,
    transparent: true,
    opacity: 0.85,
    side: DoubleSide
  });

  // Use solid material for anatomy models, wireframe for skeleton
  $: activeMat = type === 'skeleton' ? wireMat : solidMat;

  const loader = useLoader(OBJLoader);

  function processModel(obj) {
    obj.traverse((child) => {
      if (child.isMesh) {
        child.material = activeMat;
      }
    });
    
    // Center and scale the model
    const box = new Box3().setFromObject(obj);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2.5 / maxDim;
    
    obj.scale.set(scale, scale, scale);
    obj.position.x = -center.x * scale;
    obj.position.y = -center.y * scale + 1;
    obj.position.z = -center.z * scale;
    
    model = obj;
    isLoaded.set(true);
  }

  // Reactively load model when type changes
  $: {
    isLoaded.set(false);
    model = null;
    loadError = false;
    const promise = loader.load(`/models/${type}.OBJ`);
    promise.then(processModel).catch((err) => {
      console.error('Model load error:', err);
      loadError = true;
    });
  }

  function handlePointerClick(event) {
    event.stopPropagation();
    dispatch('pin', {
      x: event.point.x,
      y: event.point.y,
      z: event.point.z
    });
  }
</script>

{#if model}
  <T.Group on:click={handlePointerClick}>
    <T is={model} />
  </T.Group>
{/if}

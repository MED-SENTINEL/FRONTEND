<script>
  import { T, useTask } from "@threlte/core";
  import { DoubleSide, AdditiveBlending } from "three";

  let y = 0;
  let dir = 1;

  useTask((delta) => {
    y += delta * 0.8 * dir;
    if (y > 1.8 || y < -0.5) {
      dir *= -1;
    }
  });
</script>

<!-- Scanner Plane — cyan to match the new color scheme -->
<T.Mesh position={[0, y, 0]} rotation.x={Math.PI / 2}>
  <T.PlaneGeometry args={[4, 4]} />
  <T.MeshBasicMaterial
    color="#00BCD4"
    transparent
    opacity={0.08}
    side={DoubleSide}
    blending={AdditiveBlending}
  />
</T.Mesh>

<!-- Edge line for the beam -->
<T.Mesh position={[0, y, 0]} rotation.x={Math.PI / 2}>
  <T.PlaneGeometry args={[4, 0.02]} />
  <T.MeshBasicMaterial
    color="#00E5FF"
    transparent
    opacity={0.7}
    side={DoubleSide}
    blending={AdditiveBlending}
  />
</T.Mesh>

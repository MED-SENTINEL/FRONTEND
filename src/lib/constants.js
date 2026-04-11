/**
 * REGION_COORDINATES — Predefined 3D positions for each body region.
 * Based on standard humanoid model centered at [0, 1.0, 0], max dimension 2.5.
 * Used for "auto-snap" when a user selects a body region from the dropdown.
 */
export const REGION_COORDINATES = {
  head:       { x: 0,     y: 2.20, z: 0.10  },
  neck:       { x: 0,     y: 2.00, z: 0.10  },
  chest:      { x: 0,     y: 1.70, z: 0.20  },
  abdomen:    { x: 0,     y: 1.40, z: 0.20  },
  upper_back: { x: 0,     y: 1.70, z: -0.20 },
  lower_back: { x: 0,     y: 1.30, z: -0.20 },
  left_arm:   { x: 0.45,  y: 1.50, z: 0.00  },
  right_arm:  { x: -0.45, y: 1.50, z: 0.00  },
  left_leg:   { x: 0.15,  y: 0.60, z: 0.05  },
  right_leg:  { x: -0.15, y: 0.60, z: 0.05  },
  left_hand:  { x: 0.65,  y: 1.10, z: 0.00  },
  right_hand: { x: -0.65, y: 1.10, z: 0.00  },
  left_foot:  { x: 0.15,  y: 0.05, z: 0.10  },
  right_foot: { x: -0.15, y: 0.05, z: 0.10  },
  general:    { x: 0,     y: 1.00, z: 0.00  },
};

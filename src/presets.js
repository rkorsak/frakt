import {
  imageMultiplierX,
  imageMultiplierY,
  topographical,
  topographicalStep,
  inverse,
} from './mutators';

/**
 * @module A collection of preset settings that produce interesting results.
 * Anatomy of a settings object:
 * {
 *   noise: { // Controls the raw noise function
 *     frequency: number // Higher values produce tighter, more repetitive noise
 *     amplitude: number // A value of 1 produces outputs in the range of 0-1.  Higher numbers produce a more varied, higher contrast output
 *     octaves: number // Lower values are smoother and "blobbier".  Higher values are more cloud-like.
 *   },
 *   mutators: [] // A pipeline of functions that mutate the noise output, applied in order
 * }
 */

export const mergeSettings = (commonSettings, axisSettings = {}) => {
  const merge = (axis = {}) => ({
    noise: { ...commonSettings.noise, ...axis.noise },
    mutators: [
      ...(commonSettings.mutators || []),
      ...(axis.mutators || []),
    ],
  });

  return {
    x: merge(axisSettings.x || {}),
    y: merge(axisSettings.y || {}),
  };
};

/**
 * The "classic" look - somewhere between a satellite view of beaches and the
 * cross section of a mineral deposit.
 */
export const minerality = mergeSettings({
  noise: {
    frequency: 0.002,
    octaves: 8,
    amplitude: 2,
  },
});

/**
 * A trippy combination of smooth curves, hard edges, and noisy-but-smooth distortion
 */
export const blobs = mergeSettings({
  noise: {
    frequency: 0.002,
    octaves: 2,
    amplitude: 2,
  },
}, {
  x: {
    noise: {
      frequency: 0.004,
    },
    mutators: [
      topographicalStep,
    ],
  },
});

/**
 * A bit of columns A and B: blobs and crunchy minerals
 */
export const mineralBlobs = mergeSettings({
  noise: {
    amplitude: 2,
  },
}, {
  x: {
    noise: {
      octaves: 2,
      frequency: 0.004,
    },
    mutators: [
      topographicalStep,
    ],
  },
  y: {
    noise: {
      frequency: 0.002,
      octaves: 8,
    },
  },
});

/**
 * A more overtly stylized topographical map look
 */
export const topo = mergeSettings({
  noise: {
    frequency: 0.002,
    amplitude: 2,
  },
}, {
  x: {
    noise: {
      octaves: 2,
    },
    mutators: [
      topographical,
    ],
  },
  y: {
    noise: {
      octaves: 8,
    }
  },
});

/**
 * Topographical lines on both axes, with a crunchier y
 */
export const topoMax = mergeSettings({
  noise: {
    frequency: 0.002,
    amplitude: 2,
  },
  mutators: [
    topographical,
  ],
}, {
  x: {
    noise: {
      octaves: 2,
    },
  },
  y: {
    noise: {
      octaves: 8,
    }
  },
});

/**
 * Preserves most of the original image (stretched to fit the new dimensions), but
 * with wavy topographical lines slicing through it.
 */
export const imageDistort = mergeSettings({
  noise: {
    frequency: 0.002,
    amplitude: 1,
  },
  mutators: [
    topographical,
    inverse,
  ],
}, {
  x: {
    noise: {
      octaves: 2,
    },
    mutators: [
      imageMultiplierX,
    ],
  },
  y: {
    noise: {
      octaves: 8,
    },
    mutators: [
      imageMultiplierY,
    ],
  },
});

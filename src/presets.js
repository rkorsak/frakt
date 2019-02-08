import { topographical, topographicalStep } from './mutators';

const mergeSettings = (commonSettings, axisSettings = {}) => {
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

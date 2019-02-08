import { topographical, topographicalStep } from './mutators';

const common = {
  noise: {
    frequency: 0.002,
    amplitude: 2,
  },
  mutators: [
  ]
};

const axes = {
  x: {
    noise: {
      octaves: 3,
    },
    mutators: [
      // topographical,
    ],
  },
  y: {
    noise: {
      octaves: 8,
    },
    mutators: [
      // topographicalStep,
    ],
  },
};


const mergeSettings = (commonSettings, axisSettings) => {
  const merge = (axis) => ({
    noise: { ...commonSettings.noise, ...axis.noise },
    mutators: [
      ...(commonSettings.mutators || []),
      ...(axis.mutators || []),
    ],
  });

  return {
    x: merge(axisSettings.x),
    y: merge(axisSettings.y),
  };
};

export default mergeSettings(common, axes);

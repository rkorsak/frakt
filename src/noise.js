import OpenSimplexNoise from 'open-simplex-noise';
import { makeRectangle } from 'fractal-noise';

export const makeNoise = (width, height, options) => {
  const {
    seed = Date.now(),
    min = -1,
    max = 1, // exclusive
    noise = {},
  } = options || {};

  const simplex = new OpenSimplexNoise(seed);
  const noiseData = makeRectangle(width, height, (x, y) => simplex.noise2D(x, y), noise);

  const outputDelta = (max - min) / 2;
  const scaleValue = value => (value + 1) * outputDelta + min;
  return (x, y) => scaleValue(noiseData[x][y]);
};

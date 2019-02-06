import OpenSimplexNoise from 'open-simplex-noise';
import { makeRectangle } from 'fractal-noise';

export const makeNoise = (width, height, options) => {
  const {
    seed = Date.now(),
    noise = {},
  } = options || {};

  const simplex = new OpenSimplexNoise(seed);
  const noiseData = makeRectangle(width, height, (x, y) => simplex.noise2D(x, y), noise);

  return (x, y) => (noiseData[x][y] + 1) / 2;
};

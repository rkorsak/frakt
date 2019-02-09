/**
 * @module Higher-order noise functions that produce a new noise function by modifying an existing one.
 * There's a lot of funky currying going on here.. the recipe for writing a mutator is:
 * (config) => (noiseFn) => (x, y) => { logic that spits a new 0-1 value based on all inputs }
 */

/**
 * Flips the noise values, turning light to dark and vice versa
 */
export const inverse = () => (noiseFn) => (x, y) => {
  return 1 - noiseFn(x, y);
};

/**
 * Modifies a noise function to appear like a topographical map, with lines drawn at certain
 * thresholds.
 */
export const topographical = () => (noiseFn) => (x, y) => {
  const rawResult = noiseFn(x, y);
  return ((rawResult * 1000) % 50 < 5) ?
    rawResult
    : 0;
};

/**
 * Modifies a noise function to threshold its output at set intervals, giving the appearance of
 * a topographical map with solid regions rather than thin lines.
 */
export const topographicalStep = () => (noiseFn) => (x, y) => {
  const rawResult = noiseFn(x, y);
  return Math.floor(rawResult * 10) / 10;
};

/**
 * Multiplies the noise field by a gradient that preserves more of the original image.
 * Use this multiplier on the x axis
 */
export const imageMultiplierX = ({ width }) => (noiseFn) => (x, y) => {
  const gradientValue = x / width;
  return gradientValue * noiseFn(x, y);
};

/**
 * Multiplies the noise field by a gradient that preserves more of the original image.
 * Use this multiplier on the y axis
 */
export const imageMultiplierY = ({ height }) => (noiseFn) => (x, y) => {
  const gradientValue = y / height;
  return gradientValue * noiseFn(x, y);
};

/**
 * Creates a new noise function by running a starting noise function through a pipeline of mutators.
 */
export const mutateNoise = (noiseFn, mutators) => {
  if (!mutators || mutators.length === 0) {
    return noiseFn;
  }

  const applyMutator = (fn, mutator) => mutator(fn);

  return mutators.reduce(applyMutator, noiseFn);
}

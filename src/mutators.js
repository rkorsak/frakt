/**
 * @module Higher-order noise functions that produce a new noise function by modifying an existing one.
 */

/**
 * Modifies a noise function to appear like a topographical map, with lines drawn at certain
 * thresholds.
 */
export const topographical = (noiseFn) => (x, y) => {
  const rawResult = noiseFn(x, y);
  return ((rawResult * 1000) % 50 < 5) ?
    rawResult
    : 0;
};

/**
 * Modifies a noise function to threshold its output at set intervals, giving the appearance of
 * a topographical map with solid regions rather than thin lines.
 */
export const topographicalStep = (noiseFn) => (x, y) => {
  const rawResult = noiseFn(x, y);
  return Math.floor(rawResult * 10) / 10;
};

/**
 * Creates a new noise function by running a starting noise function through a pipeline of mutators.
 */
export const mutateNoise = (noiseFn, mutators) => {
  if (!mutators || mutators.length === 0) {
    return noiseFn;
  }

  const applyMutator = (fn, mutator) => mutator(fn);
  return mutators.reverse().reduce(applyMutator, noiseFn);
}

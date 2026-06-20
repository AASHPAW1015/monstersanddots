// ---------------------------------------------------------------------------
// genome.js — the four core Genetic Algorithm primitives. Pure functions, no
// React, so they're trivial to unit-test and are reused across the app.
// A "genome" (DNA) is an array of movement vectors: [{ x, y }, ...], each
// component in the range [-1, 1].
// ---------------------------------------------------------------------------

// Create a fresh, fully random genome of `length` movement vectors.
export function createDNA(length) {
  return Array.from({ length }, () => ({
    x: Math.random() * 2 - 1, // -1 .. 1
    y: Math.random() * 2 - 1,
  }));
}

// Single-point crossover: the child inherits parent A's genes up to a random
// split point, then parent B's genes for the rest — mixing two strategies.
export function crossover(dnaA, dnaB) {
  const split = Math.floor(Math.random() * dnaA.length);
  return [...dnaA.slice(0, split), ...dnaB.slice(split)];
}

// Bit-flip mutation: each gene has a `rate` (0..1) chance of being replaced by
// a brand-new random vector. This is what stops the pool collapsing to clones.
export function mutate(dna, rate) {
  return dna.map((gene) =>
    Math.random() < rate ? { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 } : gene
  );
}

// Roulette-wheel selection: pick one creature at random, weighted by fitness,
// so fitter creatures are more likely (but never guaranteed) to be chosen.
export function selectParent(population) {
  const totalFitness = population.reduce((sum, c) => sum + c.fitness, 0);
  // Degenerate first generation (every fitness is 0) — fall back to a uniform pick.
  if (totalFitness <= 0) {
    return population[Math.floor(Math.random() * population.length)];
  }
  // Spin the wheel: walk the list subtracting each fitness "slice" until we cross 0.
  let rand = Math.random() * totalFitness;
  for (const creature of population) {
    rand -= creature.fitness;
    if (rand <= 0) return creature;
  }
  return population[population.length - 1]; // float-rounding safety net
}

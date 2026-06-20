// ---------------------------------------------------------------------------
// fitness.js — scores how well a creature performed (higher = better). The GA
// feeds these scores into roulette selection (see genome.js) to decide which
// creatures get to breed.
// ---------------------------------------------------------------------------

// Fitness is the inverse of the Euclidean distance to the target: the closer a
// creature finishes, the higher its score. Bonuses/penalties shape behaviour.
export function calcFitness(creature, target) {
  const d = Math.sqrt(
    Math.pow(creature.x - target.x, 2) + Math.pow(creature.y - target.y, 2)
  );
  let fitness = 1 / (d + 0.0001); // +epsilon avoids divide-by-zero right on the target
  if (creature.reached) fitness *= 10; // large reward for actually reaching it
  if (creature.dead) fitness *= 0.1; // penalty for hitting a wall / the boundary
  return fitness;
}

// Mean fitness across the whole population (used for the HUD + chart).
export function calcAvgFitness(population) {
  if (population.length === 0) return 0;
  return population.reduce((sum, c) => sum + c.fitness, 0) / population.length;
}

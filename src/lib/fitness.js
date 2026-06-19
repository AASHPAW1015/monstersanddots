export function calcFitness(creature, target) {
  const d = Math.sqrt(
    Math.pow(creature.x - target.x, 2) + Math.pow(creature.y - target.y, 2)
  );
  let fitness = 1 / (d + 0.0001);
  if (creature.reached) fitness *= 10;
  if (creature.dead) fitness *= 0.1;
  return fitness;
}

export function calcAvgFitness(population) {
  if (population.length === 0) return 0;
  return population.reduce((sum, c) => sum + c.fitness, 0) / population.length;
}

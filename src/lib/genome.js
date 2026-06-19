export function createDNA(length) {
  return Array.from({ length }, () => ({
    x: Math.random() * 2 - 1,
    y: Math.random() * 2 - 1,
  }));
}

export function crossover(dnaA, dnaB) {
  const split = Math.floor(Math.random() * dnaA.length);
  return [...dnaA.slice(0, split), ...dnaB.slice(split)];
}

export function mutate(dna, rate) {
  return dna.map((gene) =>
    Math.random() < rate ? { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 } : gene
  );
}

export function selectParent(population) {
  const totalFitness = population.reduce((sum, c) => sum + c.fitness, 0);
  if (totalFitness <= 0) {
    return population[Math.floor(Math.random() * population.length)];
  }
  let rand = Math.random() * totalFitness;
  for (const creature of population) {
    rand -= creature.fitness;
    if (rand <= 0) return creature;
  }
  return population[population.length - 1];
}

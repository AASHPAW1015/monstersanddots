import { useCallback } from "react";
import { useSimContext } from "../context/SimulationContext";
import { calcFitness, calcAvgFitness } from "../lib/fitness";
import { selectParent, crossover, mutate } from "../lib/genome";
import { START } from "../lib/constants";

export function useEvolution() {
  const { target, mutationRate } = useSimContext();

  const runGeneration = useCallback(
    (population, history) => {
      const t0 = performance.now();

      population.forEach((c) => {
        c.fitness = calcFitness(c, target);
      });

      const maxFitness = population.reduce((m, c) => Math.max(m, c.fitness), 0);
      const avgFitness = calcAvgFitness(population);

      const next = population.map((_, id) => {
        const parentA = selectParent(population);
        const parentB = selectParent(population);
        const childDNA = mutate(crossover(parentA.dna, parentB.dna), mutationRate);
        return {
          id,
          dna: childDNA,
          x: START.x,
          y: START.y,
          fitness: 0,
          dead: false,
          reached: false,
        };
      });

      const synthTime = performance.now() - t0;
      const gen = history.length + 1;

      return {
        population: next,
        stats: {
          maxFitness,
          avgFitness,
          synthTime,
          history: [...history, { gen, max: maxFitness, avg: avgFitness }],
        },
      };
    },
    [target, mutationRate]
  );

  return { runGeneration };
}

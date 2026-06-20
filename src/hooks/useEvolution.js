import { useCallback } from "react";
import { useSimContext } from "../context/SimulationContext";
import { calcFitness, calcAvgFitness } from "../lib/fitness";
import { selectParent, crossover, mutate } from "../lib/genome";
import { START } from "../lib/constants";

// useEvolution — runs ONE full GA cycle on a finished generation:
// evaluate fitness -> measure stats -> select / breed / mutate the next pool.
// Returns { population, stats } ready to feed a NEXT_GENERATION dispatch.
export function useEvolution() {
  const { target, mutationRate } = useSimContext();

  const runGeneration = useCallback(
    (population, history) => {
      const t0 = performance.now(); // time the GA step → HUD "synthesis time"

      // 1. Score every creature in the generation that just ended.
      population.forEach((c) => {
        c.fitness = calcFitness(c, target);
      });

      // 2. Collect the numbers shown in the HUD / chart.
      const maxFitness = population.reduce((m, c) => Math.max(m, c.fitness), 0);
      const avgFitness = calcAvgFitness(population);
      const reachedCount = population.filter((c) => c.reached).length;

      // 3. Elitism: copy the fittest ELITE_N creatures forward untouched, so a
      //    good genome can never be destroyed by unlucky crossover/mutation.
      const ELITE_N = 10;
      const sorted = [...population].sort((a, b) => b.fitness - a.fitness);
      const eliteSlots = sorted.slice(0, ELITE_N).map((c, i) => ({
        ...c, id: i, x: START.x, y: START.y, vx: 0, vy: 0, fitness: 0, dead: false, reached: false,
      }));

      // 4. Breed the remaining slots: roulette-pick two parents, cross + mutate.
      const bred = Array.from({ length: population.length - ELITE_N }, (_, i) => {
        const parentA = selectParent(population);
        const parentB = selectParent(population);
        const childDNA = mutate(crossover(parentA.dna, parentB.dna), mutationRate);
        return {
          id: ELITE_N + i, dna: childDNA, x: START.x, y: START.y,
          vx: 0, vy: 0, fitness: 0, dead: false, reached: false,
        };
      });

      // Elites first, then the bred children — a brand-new array (never mutate the old one).
      const next = [...eliteSlots, ...bred];
      const synthTime = performance.now() - t0; // ms spent building this generation
      const gen = history.length + 1;

      return {
        population: next,
        stats: {
          maxFitness, avgFitness, synthTime, reachedCount,
          history: [...history, { gen, max: maxFitness, avg: avgFitness }],
        },
      };
    },
    [target, mutationRate]
  );

  return { runGeneration };
}

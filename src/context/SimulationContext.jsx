/* eslint-disable react-refresh/only-export-components */
// ---------------------------------------------------------------------------
// SimulationContext — the single source of truth for the GA simulation.
// A useReducer holds all related state (population, params, obstacles, stats)
// and every component reads/writes it through this context, avoiding prop
// drilling across the sidebar, canvas and HUD.
// ---------------------------------------------------------------------------
import { createContext, useContext, useReducer } from "react";
import { createDNA } from "../lib/genome";
import {
  POP_SIZE,
  DNA_LENGTH,
  MUTATION_RATE,
  GEN_DURATION,
  START,
  DEFAULT_TARGET,
  DEFAULT_OBSTACLES,
} from "../lib/constants";

const SimulationContext = createContext(null);

// Build a fresh, randomly-seeded population of `size` creatures, all at START.
export function makePopulation(size) {
  return Array.from({ length: size }, (_, id) => ({
    id,
    dna: createDNA(DNA_LENGTH),
    x: START.x,
    y: START.y,
    fitness: 0,
    dead: false,
    reached: false,
  }));
}

const initialState = {
  population: makePopulation(POP_SIZE),
  generation: 0,
  isRunning: false,
  isPaused: false,
  mutationRate: MUTATION_RATE, // 0..1
  popSize: POP_SIZE,
  genDuration: GEN_DURATION, // seconds
  obstacles: DEFAULT_OBSTACLES, // [{ x, y, w, h }]
  target: DEFAULT_TARGET,
  stats: {
    maxFitness: 0,
    avgFitness: 0,
    synthTime: 0, // ms to build the last generation
    reachedCount: 0, // how many dots reached the target last generation
    history: [], // [{ gen, max, avg }] for the chart
  },
};

// All state transitions live here so they stay predictable and easy to trace.
function reducer(state, action) {
  switch (action.type) {
    case "SET_RUNNING":
      return { ...state, isRunning: action.running };

    case "SET_PAUSED":
      return { ...state, isPaused: action.paused };

    case "NEXT_GENERATION":
      // The bred population + stats come pre-computed from useEvolution.
      return {
        ...state,
        population: action.population,
        generation: state.generation + 1,
        stats: action.stats,
      };

    case "SET_PARAM": {
      // Generic slider handler: { key, value }.
      const next = { ...state, [action.key]: action.value };
      // Resizing the pool rebuilds it from scratch so the change is visible at once.
      if (action.key === "popSize") {
        next.population = makePopulation(action.value);
        next.generation = 0;
        next.stats = { ...initialState.stats };
      }
      return next;
    }

    case "ADD_OBSTACLE":
      return { ...state, obstacles: [...state.obstacles, action.obstacle] };

    case "CLEAR_OBSTACLES":
      return { ...state, obstacles: [] };

    case "RESET":
      // "Purge Gene Pools" — back to a fresh random population at generation 0.
      return {
        ...state,
        population: makePopulation(state.popSize),
        generation: 0,
        isRunning: false,
        isPaused: false,
        stats: { maxFitness: 0, avgFitness: 0, synthTime: 0, reachedCount: 0, history: [] },
      };

    case "LOAD_FROM_STORAGE":
      // Restore the generation counter + chart history from localStorage on load.
      return {
        ...state,
        generation: action.generation,
        stats: {
          ...state.stats,
          history: action.history ?? state.stats.history,
        },
      };

    default:
      return state;
  }
}

export function SimulationProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  // Spread state + dispatch so consumers can read any field and dispatch actions.
  return (
    <SimulationContext.Provider value={{ ...state, dispatch }}>
      {children}
    </SimulationContext.Provider>
  );
}

// Convenience hook so components never touch useContext / null-checks directly.
export function useSimContext() {
  const ctx = useContext(SimulationContext);
  if (!ctx) {
    throw new Error("useSimContext must be used inside <SimulationProvider>");
  }
  return ctx;
}

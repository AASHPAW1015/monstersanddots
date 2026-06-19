/* eslint-disable react-refresh/only-export-components */
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
  mutationRate: MUTATION_RATE,
  popSize: POP_SIZE,
  genDuration: GEN_DURATION,
  obstacles: DEFAULT_OBSTACLES,
  target: DEFAULT_TARGET,
  stats: {
    maxFitness: 0,
    avgFitness: 0,
    synthTime: 0,
    reachedCount: 0,
    history: [],
  },
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_RUNNING":
      return { ...state, isRunning: action.running };
    case "SET_PAUSED":
      return { ...state, isPaused: action.paused };
    case "NEXT_GENERATION":
      return {
        ...state,
        population: action.population,
        generation: state.generation + 1,
        stats: action.stats,
      };
    case "SET_PARAM": {
      const next = { ...state, [action.key]: action.value };
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
      return {
        ...state,
        population: makePopulation(state.popSize),
        generation: 0,
        isRunning: false,
        isPaused: false,
        stats: { maxFitness: 0, avgFitness: 0, synthTime: 0, reachedCount: 0, history: [] },
      };
    case "LOAD_FROM_STORAGE":
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
  return (
    <SimulationContext.Provider value={{ ...state, dispatch }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimContext() {
  const ctx = useContext(SimulationContext);
  if (!ctx) {
    throw new Error("useSimContext must be used inside <SimulationProvider>");
  }
  return ctx;
}

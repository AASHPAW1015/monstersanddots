import { useCallback, useEffect, useRef } from "react";
import { useSimContext } from "../context/SimulationContext";
import { useTheme } from "../context/ThemeContext";
import { useCanvas } from "./useCanvas";
import { useEvolution } from "./useEvolution";
import { DNA_LENGTH } from "../lib/constants";

export function useSimulation(canvasRef) {
  const {
    population,
    obstacles,
    target,
    isRunning,
    isPaused,
    genDuration,
    generation,
    stats,
    dispatch,
  } = useSimContext();

  const rafRef = useRef(null);
  const frameRef = useRef(0);
  const genStartRef = useRef(null);

  // Always-fresh mirrors so the loop / control handlers read the latest values.
  const populationRef = useRef(population);
  const historyRef = useRef(stats.history);
  useEffect(() => {
    populationRef.current = population;
    historyRef.current = stats.history;
  });

  const { palette } = useTheme();
  const { draw, step } = useCanvas(canvasRef, population, obstacles, target, frameRef, palette);
  const { runGeneration } = useEvolution();

  const endGeneration = useCallback(() => {
    const result = runGeneration(populationRef.current, historyRef.current);
    populationRef.current = result.population;
    historyRef.current = result.stats.history;
    dispatch({ type: "NEXT_GENERATION", ...result });
    frameRef.current = 0;
    genStartRef.current = null;
  }, [runGeneration, dispatch]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    if (!isRunning || isPaused) return;

    const loop = (ts) => {
      if (genStartRef.current === null) genStartRef.current = ts;
      step();
      draw();
      frameRef.current += 1;

      const elapsed = (ts - genStartRef.current) / 1000;
      if (elapsed >= genDuration || frameRef.current >= DNA_LENGTH) {
        endGeneration();
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isRunning, isPaused, genDuration, step, draw, endGeneration]);

  const startSimulation = useCallback(() => {
    dispatch({ type: "SET_RUNNING", running: true });
    dispatch({ type: "SET_PAUSED", paused: false });
  }, [dispatch]);

  const pauseSimulation = useCallback(() => {
    dispatch({ type: "SET_PAUSED", paused: true });
  }, [dispatch]);

  const skipGeneration = useCallback(() => {
    endGeneration();
  }, [endGeneration]);

  const resetSimulation = useCallback(() => {
    frameRef.current = 0;
    genStartRef.current = null;
    dispatch({ type: "RESET" });
  }, [dispatch]);

  useEffect(() => {
    const savedGen = localStorage.getItem("generation");
    const savedHistory = localStorage.getItem("statsHistory");
    if (savedGen) {
      dispatch({
        type: "LOAD_FROM_STORAGE",
        generation: +savedGen,
        history: savedHistory ? JSON.parse(savedHistory) : [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const elite = [...populationRef.current].sort((a, b) => b.fitness - a.fitness)[0];
    if (elite) localStorage.setItem("eliteDNA", JSON.stringify(elite.dna));
    localStorage.setItem("generation", String(generation));
    localStorage.setItem("statsHistory", JSON.stringify(historyRef.current));
  }, [generation]);

  return {
    draw,
    generation,
    isRunning,
    isPaused,
    stats,
    startSimulation,
    pauseSimulation,
    skipGeneration,
    resetSimulation,
  };
}

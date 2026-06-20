import { useSimContext } from "../context/SimulationContext";

// TrainingController — the left sidebar: the four control buttons
// (Start / Pause / Skip / Purge) plus the three hyperparameter sliders.
// The button handlers are passed down from useSimulation; the slider values
// live in context and are updated via the SET_PARAM action.
export function TrainingController({
  isRunning,
  isPaused,
  startSimulation,
  pauseSimulation,
  skipGeneration,
  resetSimulation,
}) {
  const { popSize, mutationRate, genDuration, dispatch } = useSimContext();

  // One helper to push any slider change into the reducer.
  const setParam = (key, value) => dispatch({ type: "SET_PARAM", key, value });

  return (
    <div className="panel">
      {/* Control buttons. Disabled states keep the running/paused logic sane. */}
      <div className="action-strip">
        <button onClick={startSimulation} disabled={isRunning && !isPaused}>
          Start Evolutionary Cycles
        </button>
        <button onClick={pauseSimulation} disabled={!isRunning || isPaused}>
          Pause Training Operations
        </button>
        <button onClick={skipGeneration}>Skip Active Generation Timer</button>
        <button onClick={resetSimulation}>Purge Gene Pools</button>
      </div>

      {/* Hyperparameter sliders — each writes straight back to context. */}
      <div className="form">
        <label>
          Population Capacity: {popSize}
          <input
            type="range" min="10" max="500" step="10" value={popSize}
            onChange={(e) => setParam("popSize", +e.target.value)}
          />
        </label>
        <label>
          Mutation Rate: {(mutationRate * 100).toFixed(0)}%
          {/* slider is 0–100 (%), stored as a 0–1 fraction */}
          <input
            type="range" min="0" max="100" value={mutationRate * 100}
            onChange={(e) => setParam("mutationRate", +e.target.value / 100)}
          />
        </label>
        <label>
          Generational Lifespan Timer: {genDuration}s
          <input
            type="range" min="1" max="30" value={genDuration}
            onChange={(e) => setParam("genDuration", +e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

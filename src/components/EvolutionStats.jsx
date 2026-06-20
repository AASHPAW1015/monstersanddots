import { useState } from "react";
import { useSimContext } from "../context/SimulationContext";
import { PerformanceChart } from "./PerformanceChart";

// EvolutionStats — the telemetry HUD beneath the canvas: live fitness/generation
// numbers, an "export elite DNA" button, and a toggleable performance chart.
export function EvolutionStats({ stats, generation }) {
  const { population } = useSimContext();
  const [showChart, setShowChart] = useState(false);

  // Download the fittest creature's genome as a JSON file.
  const exportEliteDNA = () => {
    const elite = [...population].sort((a, b) => b.fitness - a.fitness)[0];
    if (!elite) return;
    const blob = new Blob([JSON.stringify(elite.dna, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `elite-dna-gen-${generation}.json`;
    a.click();
    URL.revokeObjectURL(url); // free the blob once the download has fired
  };

  return (
    <div className="panel">
      <div className="hud">
        <Stat label="Maximum Fitness" value={stats.maxFitness.toFixed(4)} />
        <Stat label="Average Generation Fitness" value={stats.avgFitness.toFixed(4)} />
        <Stat label="Total Elapsed Generations" value={generation} />
        <Stat label="Matrix Synthesis Time" value={`${stats.synthTime.toFixed(2)} ms`} />
        {/* The clearest proof the GA is learning: this climbs as it converges. */}
        <Stat
          label="Reached Target"
          value={`${stats.reachedCount ?? 0} / ${population.length}`}
          highlight={stats.reachedCount > 0}
        />
      </div>
      <div className="action-strip">
        <button onClick={exportEliteDNA}>Export Elite DNA</button>
        <button onClick={() => setShowChart((s) => !s)}>
          {showChart ? "Hide" : "Show"} Performance Chart
        </button>
      </div>
      {showChart && <PerformanceChart history={stats.history} />}
    </div>
  );
}

// One stat tile. `highlight` tints the value with the accent colour.
function Stat({ label, value, highlight }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value" style={highlight ? { color: "var(--accent)" } : undefined}>
        {value}
      </span>
    </div>
  );
}

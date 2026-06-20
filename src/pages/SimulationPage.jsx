import { useRef } from "react";
import { useSimulation } from "../hooks/useSimulation";
import { TopBar } from "../components/TopBar";
import { TrainingController } from "../components/TrainingController";
import { SimulationCanvas } from "../components/SimulationCanvas";
import { EvolutionStats } from "../components/EvolutionStats";

// SimulationPage — the main V1 screen. Owns the single canvas ref and the
// useSimulation hook (which drives the one rAF loop), then wires its handlers
// and stats into the sidebar, canvas and HUD.
export default function SimulationPage() {
  const canvasRef = useRef(null);
  const sim = useSimulation(canvasRef);

  return (
    <div className="app">
      <TopBar title="Genetic Algorithm Simulator" />
      <main className="layout">
        <aside className="sidebar">
          <TrainingController
            isRunning={sim.isRunning}
            isPaused={sim.isPaused}
            startSimulation={sim.startSimulation}
            pauseSimulation={sim.pauseSimulation}
            skipGeneration={sim.skipGeneration}
            resetSimulation={sim.resetSimulation}
          />
        </aside>
        <section className="content">
          <SimulationCanvas canvasRef={canvasRef} />
          <EvolutionStats stats={sim.stats} generation={sim.generation} />
        </section>
      </main>
    </div>
  );
}

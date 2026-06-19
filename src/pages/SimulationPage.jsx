import { useRef } from "react";
import { Link } from "react-router-dom";
import { useSimulation } from "../hooks/useSimulation";
import { TrainingController } from "../components/TrainingController";
import { SimulationCanvas } from "../components/SimulationCanvas";
import { EvolutionStats } from "../components/EvolutionStats";

export default function SimulationPage() {
  const canvasRef = useRef(null);
  const sim = useSimulation(canvasRef);

  return (
    <div className="app">
      <header className="topbar">
        <h1>Genetic Algorithm Simulator</h1>
        <nav>
          <Link to="/">Simulation</Link>
          <Link to="/path">Path Learning</Link>
          <Link to="/history">History</Link>
        </nav>
      </header>
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

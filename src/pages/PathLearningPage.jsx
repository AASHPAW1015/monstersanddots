import { useRef } from "react";
import { usePathLearner } from "../hooks/usePathLearner";
import { TopBar } from "../components/TopBar";
import { WIDTH, HEIGHT } from "../lib/constants";

// Greedy frontier path-learner: rays fan out from a point, the one that lands
// nearest the target becomes the next origin, and the chain of best points
// becomes a path that's then animated smoothly start -> target.
export default function PathLearningPage() {
  const canvasRef = useRef(null);
  const { phase, steps, bestDist, reached, startSearch, playAnimation, reset } =
    usePathLearner(canvasRef);

  return (
    <div className="app">
      <TopBar title="Path Learning" />

      <main className="layout">
        <aside className="sidebar">
          <div className="panel">
            <div className="action-strip">
              <button onClick={startSearch} disabled={phase === "searching"}>
                Learn Path
              </button>
              <button
                onClick={playAnimation}
                disabled={phase !== "done" || steps === 0}
              >
                Play Path
              </button>
              <button onClick={reset}>Reset</button>
            </div>

            <div className="hud" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="stat">
                <span className="stat-label">Phase</span>
                <span className="stat-value">{phase}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Waypoints</span>
                <span className="stat-value">{steps}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Distance Left</span>
                <span className="stat-value">{bestDist.toFixed(0)}px</span>
              </div>
              <div className="stat">
                <span className="stat-label">Reached Target</span>
                <span className="stat-value">{reached ? "yes" : "no"}</span>
              </div>
            </div>

            <p className="muted" style={{ fontSize: 13, lineHeight: 1.5 }}>
              Rays spread from the frontier (amber marker). The closest-to-target
              endpoint becomes the next origin, building the route. Hit{" "}
              <b>Play Path</b> to watch the smoothed path run start → target.
              Obstacles & target are shared with the Simulation tab — draw walls
              there to change the world.
            </p>
          </div>
        </aside>

        <section className="content">
          <div className="stage" style={{ width: WIDTH, height: HEIGHT }}>
            <canvas
              ref={canvasRef}
              width={WIDTH}
              height={HEIGHT}
              style={{ display: "block", background: "var(--canvas-bg)", borderRadius: 8 }}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

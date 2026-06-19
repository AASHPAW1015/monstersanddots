import { useRef } from "react";
import { Link } from "react-router-dom";
import { usePathLearner } from "../hooks/usePathLearner";
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
      <header className="topbar">
        <h1>Path Learning</h1>
        <nav>
          <Link to="/">Simulation</Link>
          <Link to="/path">Path Learning</Link>
          <Link to="/history">History</Link>
        </nav>
      </header>

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
              Rays spread from the frontier (yellow). The closest-to-target endpoint
              becomes the next origin, building the indigo path. Hit <b>Play Path</b>{" "}
              to watch the smoothed route run start → target. Obstacles & target are
              shared with the Simulation tab — draw walls there to change the world.
            </p>
          </div>
        </aside>

        <section className="content">
          <div className="stage" style={{ width: WIDTH, height: HEIGHT }}>
            <canvas
              ref={canvasRef}
              width={WIDTH}
              height={HEIGHT}
              style={{ display: "block", background: "#0f172a", borderRadius: 8 }}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

import { WIDTH, HEIGHT } from "../lib/constants";
import { ObstacleEditor } from "./ObstacleEditor";

// SimulationCanvas — the drawing surface for the GA. useCanvas paints the
// creatures / target / obstacles onto this <canvas>; the ObstacleEditor sits
// on top as a transparent overlay that turns click-drags into walls.
export function SimulationCanvas({ canvasRef }) {
  return (
    <div className="stage" style={{ position: "relative", width: WIDTH, height: HEIGHT }}>
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        style={{ display: "block", background: "var(--canvas-bg)", borderRadius: 8 }}
      />
      {/* Overlay must match the canvas size exactly so coordinates line up. */}
      <ObstacleEditor width={WIDTH} height={HEIGHT} />
    </div>
  );
}

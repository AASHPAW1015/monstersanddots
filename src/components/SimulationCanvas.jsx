import { WIDTH, HEIGHT } from "../lib/constants";
import { ObstacleEditor } from "./ObstacleEditor";

export function SimulationCanvas({ canvasRef }) {
  return (
    <div className="stage" style={{ position: "relative", width: WIDTH, height: HEIGHT }}>
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        style={{ display: "block", background: "#0f172a", borderRadius: 8 }}
      />
      <ObstacleEditor width={WIDTH} height={HEIGHT} />
    </div>
  );
}

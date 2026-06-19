import { useRef, useState } from "react";
import { useSimContext } from "../context/SimulationContext";

export function ObstacleEditor({ width, height }) {
  const { dispatch } = useSimContext();
  const overlayRef = useRef(null);
  const [start, setStart] = useState(null);
  const [rect, setRect] = useState(null);

  const toLocal = (e) => {
    const r = overlayRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onMouseDown = (e) => setStart(toLocal(e));

  const onMouseMove = (e) => {
    if (!start) return;
    const p = toLocal(e);
    setRect({
      x: Math.min(start.x, p.x),
      y: Math.min(start.y, p.y),
      w: Math.abs(p.x - start.x),
      h: Math.abs(p.y - start.y),
    });
  };

  const onMouseUp = () => {
    if (rect && rect.w > 4 && rect.h > 4) {
      dispatch({ type: "ADD_OBSTACLE", obstacle: rect });
    }
    setStart(null);
    setRect(null);
  };

  return (
    <div
      ref={overlayRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      style={{ position: "absolute", inset: 0, width, height, cursor: "crosshair" }}
    >
      {rect && (
        <div
          style={{
            position: "absolute",
            left: rect.x,
            top: rect.y,
            width: rect.w,
            height: rect.h,
            background: "rgba(51,65,85,0.5)",
            border: "1px dashed #94a3b8",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}

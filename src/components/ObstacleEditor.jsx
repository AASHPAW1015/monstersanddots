import { useRef, useState } from "react";
import { useSimContext } from "../context/SimulationContext";

// ObstacleEditor — a transparent overlay over the canvas. Click-drag draws a
// rectangle; on release it's committed to the shared obstacles array in context,
// so both the canvas renderer and the path-learner immediately see the new wall.
export function ObstacleEditor({ width, height }) {
  const { dispatch } = useSimContext();
  const overlayRef = useRef(null);
  const [start, setStart] = useState(null); // drag origin (null when not dragging)
  const [rect, setRect] = useState(null); // live preview rectangle

  // Translate a mouse event into coordinates local to the overlay/canvas.
  const toLocal = (e) => {
    const r = overlayRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onMouseDown = (e) => setStart(toLocal(e)); // begin a drag

  // Live-resize the preview rectangle, normalising so width/height stay positive
  // regardless of drag direction.
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

  // Commit the wall on release — but ignore tiny drags (likely accidental clicks).
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
      onMouseLeave={onMouseUp} // treat leaving the canvas mid-drag as a release
      style={{ position: "absolute", inset: 0, width, height, cursor: "crosshair" }}
    >
      {/* Dashed preview of the wall being drawn (pointer-events off so it
          doesn't swallow the mouseup). */}
      {rect && (
        <div
          style={{
            position: "absolute",
            left: rect.x,
            top: rect.y,
            width: rect.w,
            height: rect.h,
            background: "color-mix(in srgb, var(--text-muted) 35%, transparent)",
            border: "1px dashed var(--text-muted)",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}

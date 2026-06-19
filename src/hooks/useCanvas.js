import { useCallback } from "react";
import { WIDTH, HEIGHT, SPEED, SPEED as _, TARGET_RADIUS, DOT_RADIUS } from "../lib/constants";

export function useCanvas(canvasRef, population, obstacles, target, frameRef) {
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = "#334155";
    obstacles.forEach((o) => ctx.fillRect(o.x, o.y, o.w, o.h));

    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(target.x, target.y, TARGET_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    population.forEach((c) => {
      ctx.fillStyle = c.reached ? "#22c55e" : c.dead ? "#475569" : "#818cf8";
      ctx.beginPath();
      ctx.arc(c.x, c.y, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [canvasRef, population, obstacles, target]);

  const step = useCallback(() => {
    const frame = frameRef.current;
    population.forEach((c) => {
      if (c.dead || c.reached) return;
      const move = c.dna[frame];
      if (!move) return;
      c.x += move.x * SPEED;
      c.y += move.y * SPEED;

      if (c.x < 0 || c.x > WIDTH || c.y < 0 || c.y > HEIGHT) c.dead = true;

      obstacles.forEach((o) => {
        if (c.x > o.x && c.x < o.x + o.w && c.y > o.y && c.y < o.y + o.h) c.dead = true;
      });

      const d = Math.hypot(c.x - target.x, c.y - target.y);
      if (d < TARGET_RADIUS) c.reached = true;
    });
  }, [population, obstacles, target, frameRef]);

  return { draw, step };
}

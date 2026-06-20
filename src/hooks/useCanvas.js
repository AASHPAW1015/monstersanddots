import { useCallback } from "react";
import { WIDTH, HEIGHT, SPEED, TARGET_RADIUS, DOT_RADIUS } from "../lib/constants";

const ACCEL = SPEED * 0.4;
const DRAG  = 0.92;

export function useCanvas(canvasRef, population, obstacles, target, frameRef, palette) {
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = palette.obstacle;
    obstacles.forEach((o) => ctx.fillRect(o.x, o.y, o.w, o.h));

    ctx.fillStyle = palette.target;
    ctx.beginPath();
    ctx.arc(target.x, target.y, TARGET_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    let elite = null;
    let bestFit = -Infinity;
    population.forEach((c) => {
      if (!c.dead && !c.reached) {
        const d = Math.hypot(c.x - target.x, c.y - target.y);
        if (d < bestFit || elite === null) { elite = c; bestFit = d; }
      }
    });

    population.forEach((c) => {
      const isElite = c === elite;
      ctx.fillStyle = c.reached
        ? palette.reached
        : c.dead
        ? palette.dead
        : isElite
        ? palette.elite
        : palette.creature;
      const r = isElite ? DOT_RADIUS + 2 : DOT_RADIUS;
      ctx.beginPath();
      ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [canvasRef, population, obstacles, target, palette]);

  const step = useCallback(() => {
    const frame = frameRef.current;
    population.forEach((c) => {
      if (c.dead || c.reached) return;
      const gene = c.dna[frame];
      if (!gene) return;

      c.vx = (c.vx ?? 0) * DRAG + gene.x * ACCEL;
      c.vy = (c.vy ?? 0) * DRAG + gene.y * ACCEL;
      c.x += c.vx;
      c.y += c.vy;

      if (c.x < 0 || c.x > WIDTH || c.y < 0 || c.y > HEIGHT) c.dead = true;

      obstacles.forEach((o) => {
        if (c.x > o.x && c.x < o.x + o.w && c.y > o.y && c.y < o.y + o.h) c.dead = true;
      });

      if (Math.hypot(c.x - target.x, c.y - target.y) < TARGET_RADIUS) c.reached = true;
    });
  }, [population, obstacles, target, frameRef]);

  return { draw, step };
}

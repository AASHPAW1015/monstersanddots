import { useCallback, useEffect, useRef, useState } from "react";
import { useSimContext } from "../context/SimulationContext";
import { WIDTH, HEIGHT, START, TARGET_RADIUS } from "../lib/constants";

// ---- Tuning -----------------------------------------------------------------
const N_RAYS = 70; // candidate directions fanned out each step
const STEP_LEN = 45; // how far a ray reaches per step (px)
const MARGIN = 6; // keep this clear of obstacle edges
const VISITED_RADIUS = 35; // how close to an old frontier counts as "been there"
const VISITED_WEIGHT = 70; // score penalty for landing on visited ground
const MAX_STEPS = 300; // give up after this many expansions
const STEP_MS = 80; // delay between expansion steps (visual pacing)
const SAMPLES_PER_SEG = 18; // smoothing density for the final animation

// March a ray from `from` along `angle`, stopping at the first wall/boundary.
function castRay(from, angle, maxLen, obstacles) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  let last = { x: from.x, y: from.y };
  for (let t = 4; t <= maxLen; t += 4) {
    const x = from.x + dx * t;
    const y = from.y + dy * t;
    if (x < 0 || x > WIDTH || y < 0 || y > HEIGHT) break;
    if (hitsObstacle(x, y, obstacles)) break;
    last = { x, y };
  }
  return last;
}

function hitsObstacle(x, y, obstacles) {
  for (const o of obstacles) {
    if (
      x > o.x - MARGIN &&
      x < o.x + o.w + MARGIN &&
      y > o.y - MARGIN &&
      y < o.y + o.h + MARGIN
    )
      return true;
  }
  return false;
}

// Is there a clear straight shot from `from` to `to`? (line-of-sight to target)
function clearLine(from, to, obstacles) {
  const d = Math.hypot(to.x - from.x, to.y - from.y);
  const ang = Math.atan2(to.y - from.y, to.x - from.x);
  const end = castRay(from, ang, d + 1, obstacles);
  return Math.hypot(end.x - to.x, end.y - to.y) < TARGET_RADIUS;
}

// Catmull-Rom spline through the waypoints -> dense smooth polyline to animate.
function smoothPath(pts) {
  if (pts.length < 3) return pts.slice();
  const P = [pts[0], ...pts, pts[pts.length - 1]];
  const res = [];
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    for (let s = 0; s < SAMPLES_PER_SEG; s++) {
      const t = s / SAMPLES_PER_SEG;
      const t2 = t * t;
      const t3 = t2 * t;
      const x =
        0.5 *
        (2 * p1.x +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
      const y =
        0.5 *
        (2 * p1.y +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
      res.push({ x, y });
    }
  }
  res.push(pts[pts.length - 1]);
  return res;
}

export function usePathLearner(canvasRef) {
  const { obstacles, target } = useSimContext();

  // Live state for the HUD.
  const [phase, setPhase] = useState("idle"); // idle | searching | done | animating
  const [steps, setSteps] = useState(0);
  const [bestDist, setBestDist] = useState(0);
  const [reached, setReached] = useState(false);

  // Simulation buffers live in refs (no re-render per frame).
  const pathRef = useRef([{ ...START }]); // committed waypoints
  const visitedRef = useRef([]); // old frontiers, to escape dead-ends
  const frontierRef = useRef({ ...START });
  const candidateRaysRef = useRef([]); // this step's fan, for drawing
  const smoothRef = useRef([]);
  const animIndexRef = useRef(0);
  const phaseRef = useRef("idle");
  const intervalRef = useRef(null);
  const rafRef = useRef(null);

  const setPhaseBoth = (p) => {
    phaseRef.current = p;
    setPhase(p);
  };

  // ---- Rendering ------------------------------------------------------------
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // obstacles
    ctx.fillStyle = "#334155";
    obstacles.forEach((o) => ctx.fillRect(o.x, o.y, o.w, o.h));

    // candidate rays (the "spread" of the current step)
    if (phaseRef.current === "searching") {
      ctx.strokeStyle = "rgba(129,140,248,0.18)";
      ctx.lineWidth = 1;
      candidateRaysRef.current.forEach((r) => {
        ctx.beginPath();
        ctx.moveTo(r.x1, r.y1);
        ctx.lineTo(r.x2, r.y2);
        ctx.stroke();
      });
    }

    // discovered path so far
    const path = pathRef.current;
    if (path.length > 1) {
      ctx.strokeStyle = "#818cf8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
      ctx.stroke();
      // waypoint nodes
      ctx.fillStyle = "#a5b4fc";
      path.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // start node
    ctx.fillStyle = "#22d3ee";
    ctx.beginPath();
    ctx.arc(START.x, START.y, 6, 0, Math.PI * 2);
    ctx.fill();

    // target
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(target.x, target.y, TARGET_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // current frontier marker (while searching)
    if (phaseRef.current === "searching") {
      const f = frontierRef.current;
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(f.x, f.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // animated traveller
    if (phaseRef.current === "animating" || phaseRef.current === "done") {
      const smooth = smoothRef.current;
      if (smooth.length) {
        const idx = Math.min(animIndexRef.current, smooth.length - 1);
        // travelled trail in green
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(smooth[0].x, smooth[0].y);
        for (let i = 1; i <= idx; i++) ctx.lineTo(smooth[i].x, smooth[i].y);
        ctx.stroke();
        // the dot
        const p = smooth[idx];
        ctx.fillStyle = "#4ade80";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [canvasRef, obstacles, target]);

  // ---- One greedy expansion step -------------------------------------------
  const expandOnce = useCallback(() => {
    const F = frontierRef.current;
    const aimToTarget = Math.atan2(target.y - F.y, target.x - F.x);

    const rays = [];
    let best = null;
    let fallback = null; // longest reachable ray, if everything is blocked

    for (let i = 0; i < N_RAYS; i++) {
      const angle =
        Math.random() < 0.6
          ? aimToTarget + (Math.random() * 2 - 1) * 1.2 // biased toward target
          : Math.random() * Math.PI * 2; // pure exploration
      const E = castRay(F, angle, STEP_LEN, obstacles);
      const moved = Math.hypot(E.x - F.x, E.y - F.y);
      const dist = Math.hypot(E.x - target.x, E.y - target.y);

      let penalty = 0;
      for (const v of visitedRef.current) {
        if (Math.hypot(E.x - v.x, E.y - v.y) < VISITED_RADIUS) penalty += VISITED_WEIGHT;
      }

      const valid = moved >= STEP_LEN * 0.35;
      const score = dist + penalty + (valid ? 0 : 1e6);
      rays.push({ x1: F.x, y1: F.y, x2: E.x, y2: E.y });

      if (best === null || score < best.score) best = { E, score, dist, valid };
      if (fallback === null || moved > fallback.moved) fallback = { E, moved, dist };
    }

    candidateRaysRef.current = rays;
    const chosen = best.valid ? best : fallback;

    pathRef.current.push(chosen.E);
    visitedRef.current.push(F);
    frontierRef.current = chosen.E;

    setSteps(pathRef.current.length - 1);
    setBestDist(chosen.dist);

    // Done when we touch the target or have clear line-of-sight to it.
    if (chosen.dist < TARGET_RADIUS || clearLine(chosen.E, target, obstacles)) {
      pathRef.current.push({ ...target });
      setBestDist(0);
      return true;
    }
    return false;
  }, [obstacles, target]);

  // ---- Controls -------------------------------------------------------------
  const stopTimers = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    intervalRef.current = null;
    rafRef.current = null;
  };

  const reset = useCallback(() => {
    stopTimers();
    pathRef.current = [{ ...START }];
    visitedRef.current = [];
    frontierRef.current = { ...START };
    candidateRaysRef.current = [];
    smoothRef.current = [];
    animIndexRef.current = 0;
    setSteps(0);
    setBestDist(Math.hypot(START.x - target.x, START.y - target.y));
    setReached(false);
    setPhaseBoth("idle");
    draw();
  }, [draw, target]);

  const startSearch = useCallback(() => {
    reset();
    setPhaseBoth("searching");
    intervalRef.current = setInterval(() => {
      const finished = expandOnce();
      draw();
      if (finished || pathRef.current.length - 1 >= MAX_STEPS) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setReached(finished);
        setPhaseBoth("done");
        candidateRaysRef.current = [];
        draw();
      }
    }, STEP_MS);
  }, [reset, expandOnce, draw]);

  const playAnimation = useCallback(() => {
    if (pathRef.current.length < 2) return;
    smoothRef.current = smoothPath(pathRef.current);
    animIndexRef.current = 0;
    setPhaseBoth("animating");
    const tick = () => {
      animIndexRef.current += 2;
      draw();
      if (animIndexRef.current >= smoothRef.current.length - 1) {
        setPhaseBoth("done");
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [draw]);

  // Initial paint + repaint when the world (obstacles/target) changes.
  useEffect(() => {
    draw();
  }, [draw]);

  // Cleanup on unmount.
  useEffect(() => () => stopTimers(), []);

  return { phase, steps, bestDist, reached, startSearch, playAnimation, reset };
}

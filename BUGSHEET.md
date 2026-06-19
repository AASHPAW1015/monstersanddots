# Bug Sheet — monsterML / Genetic Algorithm Simulator

---

## BUG-001 · Duplicate import alias causing lint error
**Version:** v0 (during V1 build)
**File:** `src/hooks/useCanvas.js`
**Severity:** Build-breaking (ESLint error)

### What happened
When writing the import line for `useCanvas.js`, `SPEED` was accidentally imported twice — once normally and once as a dead alias `_`:
```js
import { WIDTH, HEIGHT, SPEED, SPEED as _, TARGET_RADIUS, DOT_RADIUS } from "../lib/constants";
```
ESLint flagged it as an unused variable (`_`).

### Fix
Remove the duplicate alias, keep only the real import:
```js
import { WIDTH, HEIGHT, SPEED, TARGET_RADIUS, DOT_RADIUS } from "../lib/constants";
```

---

## BUG-002 · Ref values mutated directly during render
**Version:** v0 (during V1 build)
**File:** `src/hooks/useSimulation.js`
**Severity:** Build-breaking (ESLint react-hooks/refs error)

### What happened
To keep refs always-fresh mirrors of the latest population and stats, the initial implementation assigned directly in the hook body:
```js
const populationRef = useRef(population);
const historyRef = useRef(stats.history);
populationRef.current = population;  // ← inside render
historyRef.current = stats.history;  // ← inside render
```
React's new hooks linter (`react-hooks/refs`) forbids writing `.current` during render because it can cause updates to be silently skipped.

### Fix
Wrap the assignments in a bare `useEffect` (no dependency array = runs after every render):
```js
useEffect(() => {
  populationRef.current = population;
  historyRef.current = stats.history;
});
```

---

## BUG-003 · Fast-refresh lint error on mixed exports in context file
**Version:** v0 (during V1 build)
**File:** `src/context/SimulationContext.jsx`
**Severity:** Build-breaking (ESLint react-refresh error)

### What happened
`SimulationContext.jsx` exports both a React component (`SimulationProvider`) and plain functions (`makePopulation`, `useSimContext`). Vite's fast-refresh plugin requires `.jsx` files to export *only* components, otherwise HMR breaks:
```
error react-refresh/only-export-components
```

### Fix
Add an ESLint disable comment at the top of the file since mixing component + utility exports is intentional here:
```js
/* eslint-disable react-refresh/only-export-components */
```

---

## BUG-004 · Consecutive "Skip Generation" calls read stale population
**Version:** v0 (during V1 build)
**File:** `src/hooks/useSimulation.js`
**Severity:** Runtime — silent wrong behaviour

### What happened
Clicking "Skip Active Generation Timer" multiple times in rapid succession caused all skips after the first to breed from the *same* stale population. The ref mirrors (`populationRef`, `historyRef`) only sync inside a `useEffect`, which runs asynchronously after React re-renders. Rapid synchronous clicks fired before any re-render happened, so every skip after the first operated on the same old data.

Observed: clicking Skip 5 times fast resulted in generation counter jumping by 1, not 5.

### Fix
In `endGeneration`, update the mirror refs **synchronously** before dispatching, so back-to-back calls each see the freshly-bred population:
```js
const endGeneration = useCallback(() => {
  const result = runGeneration(populationRef.current, historyRef.current);
  populationRef.current = result.population;   // ← sync update
  historyRef.current = result.stats.history;   // ← sync update
  dispatch({ type: "NEXT_GENERATION", ...result });
  frameRef.current = 0;
  genStartRef.current = null;
}, [runGeneration, dispatch]);
```

---

## BUG-005 · "Distance Left" shows 265px after target is reached
**Version:** v1.1.0 (during Path Learning build)
**File:** `src/hooks/usePathLearner.js`
**Severity:** UI cosmetic — wrong HUD value

### What happened
When the path learner detects it has clear line-of-sight to the target (and pushes the target as the final waypoint), it does not update the `bestDist` state. So the HUD continues to display the distance from the *second-to-last* frontier point to the target rather than 0.

Observed: phase = "done", reached = "yes", but Distance Left = 265px.

### Fix
Set `bestDist` to 0 in the same branch that appends the target waypoint:
```js
if (chosen.dist < TARGET_RADIUS || clearLine(chosen.E, target, obstacles)) {
  pathRef.current.push({ ...target });
  setBestDist(0);   // ← added
  return true;
}
```

---

## BUG-006 · Candidate ray fan lingers on canvas after search completes
**Version:** v1.1.0 (during Path Learning build)
**File:** `src/hooks/usePathLearner.js`
**Severity:** UI cosmetic — stale visual artifact

### What happened
The draw function renders the ray fan (the faint purple lines spreading from the frontier) whenever `phaseRef.current === "searching"`. When the interval fires the final time and the phase is switched to `"done"`, the `draw()` call inside the interval happens *before* the phase ref updates, so the final frame still shows the full fan.

Observed: after search finishes, a spray of faint purple lines remains frozen on the canvas.

### Fix
Clear `candidateRaysRef` and call `draw()` once more *after* setting phase to "done":
```js
setPhaseBoth("done");
candidateRaysRef.current = [];   // ← clear fan
draw();                          // ← one clean repaint
```

---

## Summary table

| ID | File | Type | Severity | Version found |
|---|---|---|---|---|
| BUG-001 | `useCanvas.js` | Duplicate import | Build-breaking | v0 build |
| BUG-002 | `useSimulation.js` | Ref in render | Build-breaking | v0 build |
| BUG-003 | `SimulationContext.jsx` | ESLint config | Build-breaking | v0 build |
| BUG-004 | `useSimulation.js` | Stale closure | Runtime silent | v0 build |
| BUG-005 | `usePathLearner.js` | Wrong HUD value | UI cosmetic | v1.1 build |
| BUG-006 | `usePathLearner.js` | Stale canvas draw | UI cosmetic | v1.1 build |

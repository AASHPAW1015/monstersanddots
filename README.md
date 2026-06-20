# 🧬 Genetic Algorithm Creature Simulator

> React JS Case Study — B.Tech CSE 2025–29 | Semester II  
> ITM Skills University, Kharghar, Navi Mumbai  
> **Ashutosh Pawar** · Roll No: 150096725130

A fully client-side evolutionary computation engine built inside the browser. No backend. No AI APIs. No GPU. Just React, a canvas, and Darwin.

---

## What is this?

Two algorithms. One canvas. Zero servers.

**Mode 1 — Genetic Algorithm Dot Maze**  
200 creatures spawn at the bottom of the screen, each carrying a unique DNA string of 300 random movement vectors. They flail around blindly for 5 seconds. The ones that got closest to the red target pass their DNA to the next generation — mixed, recombined, and slightly mutated. Repeat. By generation 15–30, they're snaking around walls and hitting the target consistently.

That's evolution. No hand-holding. No rules. Just selection pressure.

**Mode 2 — Greedy Frontier Path Learner**  
A completely different algorithm for comparison. A single frontier point fans out 70 rays in every direction, picks the one landing closest to the target without hitting a wall, and locks it in as the next waypoint. Repeat until the target is reachable in a straight line. Then a smooth Catmull-Rom spline traces the discovered path with an animated agent.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19.x | UI framework |
| Vite | 8.x | Build tool + HMR |
| React Router DOM | 7.x | Multi-page routing |
| Recharts | 3.x | Live fitness chart |
| HTML5 Canvas API | Native | 60fps rendering |
| localStorage API | Native | Session persistence |

---

## Getting Started

```bash
git clone https://github.com/yourusername/monstersanddots.git
cd monstersanddots
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

```bash
npm run build    # production build
npm run preview  # preview production build locally
npm run lint     # ESLint check
```

---

## Project Structure

```
src/
├── context/
│   └── SimulationContext.jsx     Global state — useReducer + Context API
│
├── hooks/
│   ├── useSimulation.js          rAF loop orchestration + generation lifecycle
│   ├── useEvolution.js           Full GA cycle: evaluate → select → breed → mutate
│   ├── useCanvas.js              Physics step + canvas draw functions
│   └── usePathLearner.js         Greedy frontier ray-casting algorithm
│
├── components/
│   ├── TrainingController.jsx    Sidebar: action buttons + parameter sliders
│   ├── SimulationCanvas.jsx      Canvas wrapper + obstacle/target rendering
│   ├── ObstacleEditor.jsx        Click-to-place wall obstacles
│   ├── EvolutionStats.jsx        Bottom HUD: live metrics + export + chart toggle
│   └── PerformanceChart.jsx      Recharts LineChart: fitness over generations
│
├── lib/
│   ├── genome.js                 createDNA, crossover, mutate, selectParent
│   ├── fitness.js                calcFitness (Euclidean), calcAvgFitness
│   └── constants.js              All tuning values in one place
│
└── pages/
    ├── SimulationPage.jsx        GA dot maze layout
    ├── PathLearningPage.jsx      Greedy frontier layout
    └── HistoryPage.jsx           Past generation logs from localStorage
```

---

## The Genetic Algorithm

### DNA Representation

Each creature is an object with a position, velocity, and a DNA array of 300 movement vectors:

```js
{
  x: 400, y: 560,           // position
  vx: 0, vy: 0,             // velocity (momentum-based movement)
  fitness: 0,
  dead: false,
  reached: false,
  dna: [
    { x:  0.42, y: -0.91 }, // gene 0: accelerate up-right
    { x: -0.17, y: -0.83 }, // gene 1: accelerate up-left
    // ... 298 more genes
  ]
}
```

On every animation frame, each creature reads the next gene as an acceleration force applied to its velocity vector, which decays by a drag factor of 0.92 per frame. This produces smooth momentum-based movement.

### Fitness Function

```js
// lib/fitness.js
export function calcFitness(creature, target) {
  const d = Math.sqrt(
    Math.pow(creature.x - target.x, 2) +
    Math.pow(creature.y - target.y, 2)
  );
  let fitness = 1 / (d + 0.0001);    // inverse distance — closer = higher score
  if (creature.reached) fitness *= 10; // bonus: target reached
  if (creature.dead)    fitness *= 0.1; // penalty: hit wall or boundary
  return fitness;
}
```

Fitness is the inverse of Euclidean distance to the target. Creatures that reached the target are rewarded ×10. Creatures that died on an obstacle are penalised ×0.1.

### Roulette-Wheel Selection

```js
export function selectParent(population) {
  const total = population.reduce((sum, c) => sum + c.fitness, 0);
  let rand = Math.random() * total;
  for (const creature of population) {
    rand -= creature.fitness;
    if (rand <= 0) return creature;
  }
  return population[population.length - 1];
}
```

Each creature occupies a slice of a wheel proportional to its fitness. Higher fitness = bigger slice = picked more often as a parent. Lower fitness creatures can still be selected — preserving diversity.

### Single-Point Crossover

```js
export function crossover(dnaA, dnaB) {
  const split = Math.floor(Math.random() * dnaA.length);
  return [...dnaA.slice(0, split), ...dnaB.slice(split)];
}
```

A random split index divides two parent DNA arrays. The child inherits the first segment from Parent A and the second from Parent B — modelling biological recombination.

### Bit-Flip Mutation

```js
export function mutate(dna, rate) {
  return dna.map(gene =>
    Math.random() < rate
      ? { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 }
      : gene
  );
}
```

Each gene independently has a `mutationRate` chance of being replaced with a new random vector. Prevents the population from converging prematurely into local minima.

### Elitism

The top 10 creatures by fitness are carried forward into the next generation unchanged. This guarantees the best solutions found so far are never lost to crossover or mutation.

### Generation Lifecycle

```
Start timer
    ↓
rAF loop: physics step → draw (60fps)
    ↓
Timer expires OR Skip clicked
    ↓
Evaluate fitness for all creatures
    ↓
Breed new population (roulette → crossover → mutate)
    ↓
Preserve top 10 (elitism)
    ↓
Dispatch NEXT_GENERATION → update stats → save to localStorage
    ↓
Reset frame counter → repeat
```

---

## The Path Learner

A deterministic greedy frontier algorithm — conceptually opposite to the GA.

### How It Works

```
1. Start at the bottom-centre of the canvas (START)
2. Fan out N_RAYS = 70 rays from the current frontier point
3. Each ray marches forward pixel-by-pixel until it hits a wall or boundary
4. Score each ray endpoint: distance to target + penalty for revisited areas
5. Lock in the best endpoint as the next waypoint
6. If the target is within reach (direct line of sight) → done
7. Smooth the waypoint chain with a Catmull-Rom spline
8. Animate an agent along the smooth path using rAF
```

### Key Tuning Constants

| Constant | Value | Effect |
|---|---|---|
| `N_RAYS` | 70 | More rays = better coverage but slower per step |
| `STEP_LEN` | 45px | How far each ray reaches |
| `VISITED_RADIUS` | 35px | Dead-end escape zone radius |
| `VISITED_WEIGHT` | 70 | Score penalty for revisiting old ground |
| `STEP_MS` | 80ms | Delay between expansion steps (visual pacing) |
| `SAMPLES_PER_SEG` | 18 | Catmull-Rom smoothing density |

### GA vs Path Learner

| | Genetic Algorithm | Path Learner |
|---|---|---|
| Type | Stochastic / evolutionary | Deterministic / heuristic |
| Population | 200 simultaneous agents | Single frontier point |
| Learning | Improves across generations | Builds path in one pass |
| Obstacle handling | Agents die on collision | Rays stop at walls |
| Output | Evolved movement DNA | Explicit waypoint chain |
| Best for | Complex unknown fitness landscapes | Navigable spatial environments |

---

## React Architecture

### Why React for this?

The canvas simulation itself could run in vanilla JS. React earns its place in everything around the canvas — the control panel, the HUD, the chart, and critically, the shared state that connects all of them without prop drilling.

### Context API + useReducer

All global state lives in `SimulationContext` and is managed with `useReducer`. This gives every component access to the same population, generation count, obstacles, and stats — without passing props through 4 levels of the tree.

```js
// Dispatch actions
dispatch({ type: 'SET_RUNNING',      payload: { running: true } })
dispatch({ type: 'SET_PAUSED',       payload: { paused: true } })
dispatch({ type: 'NEXT_GENERATION',  payload: { population, stats } })
dispatch({ type: 'SET_PARAM',        payload: { key: 'mutationRate', value: 0.05 } })
dispatch({ type: 'ADD_OBSTACLE',     payload: { obstacle: { x, y, w, h } } })
dispatch({ type: 'CLEAR_OBSTACLES'  })
dispatch({ type: 'RESET'            })
dispatch({ type: 'LOAD_FROM_STORAGE', payload: { generation, history } })
```

### Hooks Usage

| Hook | Where | Why |
|---|---|---|
| `useState` | TrainingController, EvolutionStats | Slider values, chart toggle |
| `useEffect` | useSimulation, useEvolution | Start/stop rAF loop, localStorage sync |
| `useRef` | useSimulation, useCanvas | Canvas DOM ref, rAF ID, sync population mirror |
| `useContext` | All components | Access SimulationContext |
| `useReducer` | SimulationContext | Complex multi-value state transitions |
| `useCallback` | useEvolution, useCanvas, usePathLearner | Memoised functions for useEffect deps |
| Custom hooks | useSimulation, useEvolution, useCanvas, usePathLearner | Encapsulate stateful logic |

### Why `useRef` for population?

The population array is updated every animation frame (60fps). If it lived in React state, every frame would trigger a re-render — killing performance. Instead it lives in a `ref` (always-fresh value, no re-render) and React state is only updated at generation boundaries (every 5 seconds) to refresh the HUD.

### React Router

Three routes, all inside `SimulationProvider` so context state is shared across pages:

```jsx
<BrowserRouter>
  <SimulationProvider>
    <Routes>
      <Route path="/"        element={<SimulationPage />}    />
      <Route path="/path"    element={<PathLearningPage />}  />
      <Route path="/history" element={<HistoryPage />}       />
    </Routes>
  </SimulationProvider>
</BrowserRouter>
```

---

## UI Controls

### TrainingController (Sidebar)

| Control | Type | Function |
|---|---|---|
| Start Evolutionary Cycles | Button | Begin rAF loop + generation timer |
| Pause Training Operations | Button | Halt loop mid-generation |
| Skip Active Generation | Button | End current generation immediately |
| Purge Gene Pools | Button | Reset to fresh random population |
| Population Capacity | Slider 10–500 | Rebuild population at new size |
| Mutation Rate | Slider 0–100% | Probability of gene flip per child |
| Generational Lifespan | Slider 1–30s | Time limit before auto-advance |

### EvolutionStats (HUD)

| Metric | Calculation |
|---|---|
| Maximum Fitness | `Math.max(...population.map(c => c.fitness))` |
| Average Fitness | `sum(fitness) / population.length` |
| Total Generations | Generation counter from context |
| Synthesis Time | `performance.now()` diff around `runGeneration()` |
| Reached Target | Count of creatures with `reached === true` |

Two utility actions:
- **Export Elite DNA** — downloads the top creature's 300-gene DNA as a `.json` file
- **Toggle Performance Chart** — shows/hides a Recharts LineChart of max + average fitness across all generations

### Canvas Colour Coding

| Visual | Colour | Meaning |
|---|---|---|
| Gold dot, larger | `#fbbf24` | Current generation leader |
| Green dot | `#22c55e` | Reached the target |
| Grey dot | `#475569` | Dead — hit obstacle or boundary |
| Indigo dot | `#818cf8` | Alive, actively moving |
| Red circle | `#ef4444` | Target destination |
| Dark rectangle | `#334155` | Obstacle wall |

---

## Data Persistence

Three items saved to `localStorage` at the end of every generation:

```js
localStorage.setItem('eliteDNA',     JSON.stringify(elite.dna))
localStorage.setItem('generation',   generationCount)
localStorage.setItem('statsHistory', JSON.stringify(stats.history))
```

On mount, a `useEffect` reads these and dispatches `LOAD_FROM_STORAGE` — restoring generation count and chart history across browser refreshes. The History page (`/history`) reads the same localStorage to display a log of past sessions.

---

## Constants Reference

```js
// lib/constants.js
POP_SIZE        = 200     // creatures per generation
DNA_LENGTH      = 300     // genes (frames) per creature
MUTATION_RATE   = 0.01    // default 1% per gene
GEN_DURATION    = 5       // seconds per generation
SPEED           = 3       // base movement speed
WIDTH           = 800     // canvas width (px)
HEIGHT          = 600     // canvas height (px)
TARGET_RADIUS   = 12      // target hit detection radius (px)
DOT_RADIUS      = 4       // creature render radius (px)
START           = { x: 400, y: 560 }   // creature spawn point
DEFAULT_TARGET  = { x: 400, y: 50  }   // initial target position
```

---

## Bug Log

Six bugs encountered and resolved during development. Full analysis in [`BUGSHEET.md`](./BUGSHEET.md).

| ID | File | Type | Severity |
|---|---|---|---|
| BUG-001 | `useCanvas.js` | Duplicate import alias | Build-breaking |
| BUG-002 | `useSimulation.js` | Ref assigned during render | Build-breaking |
| BUG-003 | `SimulationContext.jsx` | Mixed exports broke HMR | Build-breaking |
| BUG-004 | `useSimulation.js` | Stale closure on rapid skip clicks | Runtime silent |
| BUG-005 | `usePathLearner.js` | Distance HUD showed wrong value after target reached | UI cosmetic |
| BUG-006 | `usePathLearner.js` | Ray fan lingered after search completed | UI cosmetic |

---

## Future Scope — V2 Tower Climb

The architecture is designed to extend into a gamified V2 mode. Same GA engine, different DNA shape.

**The concept:** Three species — Giraffe, Ape, Mystical — breed floor by floor up a tower to defeat King Kong at the summit. Each species brings different traits. Cross-breeding produces hybrids. Each floor unlocks a higher trait cap, forcing strategic specialisation.

```
V1 DNA:  [{ x: 0.5, y: -1 }, ...]        movement vectors
V2 DNA:  [3, 2, 1, 4, 0]                 [neck, str, fire, speed, armor]
```

Same crossover. Same mutation. Same roulette wheel. Different fitness function — damage dealt instead of distance to target.

| Floor | Enemy | Max Total Traits | Key Requirement |
|---|---|---|---|
| 1 | Goblin | 10 | str ≥ 2 |
| 2 | Orc | 15 | str ≥ 3, fire ≥ 1 |
| 3 | Dragon | 20 | fire ≥ 4, armor ≥ 2 |
| 4 | King Kong | 30 | neck ≥ 5, str ≥ 5, fire ≥ 6 |

Planned additions: AI-generated creature images per floor milestone, species lineage tracking, inbreeding limiter, `TowerContext`, `useFloor`, `useImageGen`.

---

## Academic Context

This project was built as the Semester II React JS Case Study at ITM Skills University (B.Tech CSE 2025–29). The problem statement required implementing a Genetic Algorithm simulator as a frontend-only React application demonstrating evolutionary computation concepts.

The project fulfils all PS requirements and extends beyond them with:
- A second distinct algorithm (Greedy Frontier Path Learner) on a separate route
- Catmull-Rom spline smoothing for path animation
- Elitism strategy (top 10 preservation per generation)
- Full bug documentation with root cause analysis

---

*Every coding project is a work in progress. V2 is coming.*

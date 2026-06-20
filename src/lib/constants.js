// ---------------------------------------------------------------------------
// constants.js — every "magic number" for the simulation in one place, so the
// GA engine, the physics loop and the canvas renderer all stay in sync.
// ---------------------------------------------------------------------------

export const POP_SIZE = 200; // creatures per generation (default)
export const DNA_LENGTH = 300; // movement frames encoded in each genome
export const MUTATION_RATE = 0.01; // default per-gene mutation chance (1%)
export const GEN_DURATION = 5; // seconds before a generation auto-ends
export const SPEED = 3; // base pixels-per-frame multiplier for movement

export const WIDTH = 800; // canvas width (px)
export const HEIGHT = 600; // canvas height (px)

export const TARGET_RADIUS = 12; // how close to the target counts as "reached"
export const DOT_RADIUS = 4; // drawn size of a creature dot

// Every creature spawns here — bottom-centre of the stage.
export const START = { x: WIDTH / 2, y: HEIGHT - 40 };

// Default goal + one starter wall, so obstacle handling is exercised on first load.
export const DEFAULT_TARGET = { x: WIDTH / 2, y: 50 };
export const DEFAULT_OBSTACLES = [{ x: WIDTH / 2 - 120, y: HEIGHT / 2 - 15, w: 240, h: 30 }];

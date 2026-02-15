/**
 * Serial - Core Simulation V2
 */

import { generateWorld, TileType, WORLD_WIDTH, WORLD_HEIGHT, TILE_SIZE } from './world';
import { spawnAgents, getAgentActivity, Activity } from './agents';

// --- INITIALIZATION ---

const world = generateWorld();
const agents = spawnAgents(
    20,
    world.pois.filter(p => p.type === TileType.Residential),
    world.pois.filter(p => p.type === TileType.Commercial),
    world.pois.filter(p => p.type === TileType.Park)
);

// Expose agents for easier debugging
(window as any).agents = agents;

// --- SIMULATION ---

interface SimState {
    tick: number;
    ticksPerDay: number;
    paused: boolean;
}

const state: SimState = {
    tick: 0,
    ticksPerDay: 1440, // 1 tick = 1 minute
    paused: false,
};

const MOVEMENT_SPEED = 0.5; // Tiles per tick

function getHour(tick: number): number {
    return Math.floor((tick % state.ticksPerDay) / 60);
}

function updateSim() {
    if (state.paused) return;
    state.tick++;

    const hour = getHour(state.tick);

    // Update agent schedules and move them
    agents.forEach(agent => {
        const nextActivity = getAgentActivity(hour);
        if (nextActivity !== agent.currentActivity) {
            agent.currentActivity = nextActivity;

            // Update target based on activity
            switch (nextActivity) {
                case Activity.Sleeping: agent.targetPoiId = agent.homeId; break;
                case Activity.Working: agent.targetPoiId = agent.workId; break;
                case Activity.Leisure: agent.targetPoiId = agent.leisureId; break;
            }
        }

        // Move towards target (Orthogonal: X then Y)
        const targetPoi = world.pois.find(p => p.id === agent.targetPoiId);
        if (targetPoi) {
            if (agent.x !== targetPoi.x) {
                const dx = targetPoi.x - agent.x;
                if (Math.abs(dx) <= MOVEMENT_SPEED) {
                    agent.x = targetPoi.x;
                } else {
                    agent.x += Math.sign(dx) * MOVEMENT_SPEED;
                }
            } else if (agent.y !== targetPoi.y) {
                const dy = targetPoi.y - agent.y;
                if (Math.abs(dy) <= MOVEMENT_SPEED) {
                    agent.y = targetPoi.y;
                } else {
                    agent.y += Math.sign(dy) * MOVEMENT_SPEED;
                }
            }
        }
    });
}

function formatTime(tick: number) {
    const minutesTotal = tick % state.ticksPerDay;
    const hours = Math.floor(minutesTotal / 60);
    const minutes = minutesTotal % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// --- RENDERING ---

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const hudTime = document.getElementById('sim-time')!;
const hudTick = document.getElementById('sim-tick')!;
const hudStatus = document.getElementById('sim-status')!;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function getTileColor(type: TileType): string {
    switch (type) {
        case TileType.Road: return '#333';
        case TileType.Residential: return '#4a4';
        case TileType.Commercial: return '#44a';
        case TileType.Park: return '#282';
        case TileType.Water: return '#04a';
        default: return '#1a1a1a';
    }
}

function render() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const offsetX = (canvas.width - WORLD_WIDTH * TILE_SIZE) / 2;
    const offsetY = (canvas.height - WORLD_HEIGHT * TILE_SIZE) / 2;

    // Draw Grid
    for (let y = 0; y < WORLD_HEIGHT; y++) {
        for (let x = 0; x < WORLD_WIDTH; x++) {
            const type = world.grid[y][x];
            ctx.fillStyle = getTileColor(type);
            ctx.fillRect(offsetX + x * TILE_SIZE, offsetY + y * TILE_SIZE, TILE_SIZE - 1, TILE_SIZE - 1);
        }
    }

    // Draw Agents
    agents.forEach(agent => {
        // Add a small jitter based on agent ID to separate overlapping dots
        const idNum = parseInt(agent.id.split('-')[1]) || 0;
        const jitterX = ((idNum % 5) - 2) * 2; // -4 to 4 pixels
        const jitterY = (((idNum * 3) % 5) - 2) * 2;

        ctx.fillStyle = agent.color;
        ctx.beginPath();
        ctx.arc(
            offsetX + agent.x * TILE_SIZE + TILE_SIZE / 2 + jitterX,
            offsetY + agent.y * TILE_SIZE + TILE_SIZE / 2 + jitterY,
            TILE_SIZE / 3,
            0,
            Math.PI * 2
        );
        ctx.fill();
    });

    // Update HUD
    hudTime.textContent = formatTime(state.tick);
    hudTick.textContent = state.tick.toString();
    hudStatus.textContent = state.paused ? 'Paused' : 'Running';

    requestAnimationFrame(render);
}

// --- LOOP ---

const TICK_RATE = 20; // Slower tick rate for easier observation of time transitions
let lastTickTime = performance.now();

function loop(t: number) {
    const dt = t - lastTickTime;
    if (dt >= 1000 / TICK_RATE) {
        updateSim();
        lastTickTime = t;
    }
    requestAnimationFrame(loop);
}

// --- INPUT ---

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        state.paused = !state.paused;
    }
});

// START
requestAnimationFrame(render);
requestAnimationFrame(loop);

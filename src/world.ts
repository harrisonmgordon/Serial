/**
 * World definitions
 */

export enum TileType {
    Empty = 0,
    Road = 1,
    Residential = 2,
    Commercial = 3,
    Park = 4,
    Water = 5,
}

export interface POI {
    id: string;
    name: string;
    type: TileType;
    x: number;
    y: number;
}

export const WORLD_WIDTH = 80;
export const WORLD_HEIGHT = 50;
export const TILE_SIZE = 10;

export interface WorldState {
    grid: TileType[][];
    pois: POI[];
}

export function generateWorld(): WorldState {
    const grid: TileType[][] = [];
    for (let y = 0; y < WORLD_HEIGHT; y++) {
        const row: TileType[] = [];
        for (let x = 0; x < WORLD_WIDTH; x++) {
            row.push(TileType.Empty);
        }
        grid.push(row);
    }

    const pois: POI[] = [];

    // Simple procedural generation
    // Add some roads (cross)
    for (let x = 0; x < WORLD_WIDTH; x++) grid[Math.floor(WORLD_HEIGHT / 2)][x] = TileType.Road;
    for (let y = 0; y < WORLD_HEIGHT; y++) grid[y][Math.floor(WORLD_WIDTH / 2)] = TileType.Road;

    // Add some POIs
    const poiData = [
        { name: "West Side Homes", type: TileType.Residential, x: 10, y: 10 },
        { name: "East Side Homes", type: TileType.Residential, x: 70, y: 10 },
        { name: "North Side Villas", type: TileType.Residential, x: 10, y: 40 },
        { name: "South Side Apartments", type: TileType.Residential, x: 70, y: 40 },
        { name: "Hilltop Houses", type: TileType.Residential, x: 20, y: 5 },
        { name: "Riverview Homes", type: TileType.Residential, x: 60, y: 5 },

        { name: "Downtown Office", type: TileType.Commercial, x: 40, y: 20 },
        { name: "South Cafe", type: TileType.Commercial, x: 20, y: 40 },
        { name: "West Market", type: TileType.Commercial, x: 5, y: 25 },
        { name: "East Library", type: TileType.Commercial, x: 75, y: 25 },
        { name: "North Shop", type: TileType.Commercial, x: 40, y: 5 },

        { name: "Central Park", type: TileType.Park, x: 40, y: 30 },
        { name: "Riverside Rest", type: TileType.Park, x: 15, y: 15 },
        { name: "East Garden", type: TileType.Park, x: 65, y: 15 },
        { name: "Sunny Glade", type: TileType.Park, x: 15, y: 35 },
    ];

    poiData.forEach((p, i) => {
        const poi: POI = { id: `poi-${i}`, ...p };
        grid[p.y][p.x] = p.type;
        pois.push(poi);
    });

    return { grid, pois };
}

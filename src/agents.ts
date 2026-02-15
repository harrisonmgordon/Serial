/**
 * Agent definitions
 */

export enum Activity {
    Sleeping = 'Sleeping',
    Working = 'Working',
    Leisure = 'Leisure',
}

export interface Agent {
    id: string;
    name: string;
    x: number;
    y: number;
    color: string;
    homeId: string;
    workId: string;
    leisureId: string;
    currentActivity: Activity;
    targetPoiId: string;
}

export function spawnAgents(
    count: number,
    residentialPois: { id: string, x: number, y: number }[],
    commercialPois: { id: string }[],
    parkPois: { id: string }[]
): Agent[] {
    const colors = ['#ff5555', '#55ff55', '#5555ff', '#ffff55', '#ff55ff', '#55ffff', '#ffa500', '#800080', '#008080', '#a52a2a'];

    const agents: Agent[] = [];
    for (let i = 0; i < count; i++) {
        const home = residentialPois[i % residentialPois.length];
        const work = commercialPois[i % commercialPois.length];
        const leisure = parkPois[i % parkPois.length];

        agents.push({
            id: `agent-${i}`,
            name: `Agent ${i + 1}`,
            x: home.x,
            y: home.y,
            color: colors[i % colors.length],
            homeId: home.id,
            workId: work.id,
            leisureId: leisure.id,
            currentActivity: Activity.Sleeping,
            targetPoiId: home.id
        });
    }
    return agents;
}

export function getAgentActivity(hour: number): Activity {
    if (hour >= 8 && hour < 17) return Activity.Working;
    if (hour >= 17 && hour < 22) return Activity.Leisure;
    return Activity.Sleeping;
}

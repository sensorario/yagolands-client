/** @type {Record<string, { name: string, resources: Array<{ name: string, amount: number }>, visible: boolean }>} */
export const tree = {};
export const queueOfStuff = [];
export const available = [];
export const buildingResources = [];
export const timers = {
    uptime: 0,
    uptimeTimestamp: NaN,
    remainingToFinish: 0
};
export const counts = {
    villages: 0,
    clients: 0,
    fields: 0
};
export const current = {
    building: null,
    yid: ''
};

window.gameState = { tree, queueOfStuff, available, buildingResources, timers, counts, current };

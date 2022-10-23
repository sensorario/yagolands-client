import { createStore } from './utils.js';

/** @type {Record<string, { name: string, resources: Array<{ name: string, amount: number }>, visible: boolean }>} */
export const tree = createStore({});
export const queueOfStuff = createStore([]);
export const available = createStore([]);
export const buildingResources = createStore([]);
export const timers = createStore({
    uptime: 0,
    uptimeTimestamp: NaN,
    remainingToFinish: 0
});
export const counts = createStore({
    villages: 0,
    clients: 0,
    fields: 0
});
export const current = createStore({
    building: null,
    yid: ''
});

window.gameState = { tree, queueOfStuff, available, buildingResources, timers, counts, current };

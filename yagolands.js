// imports
import * as events from './modules/eventi/eventi.js';
import { send } from './modules/io/connection.js';
import { available, buildingResources, counts, current, queueOfStuff, timers } from './modules/state/world.js';
import { timing } from './modules/timing/timing.js';
import { renderHeader, renderQueue, renderUI } from './modules/ui/ui.js';

const time = () => {
    // TODO: ... rivedere
    // if (secondiAllaFine >= 0) {
    //     countdownContainer.textContent = clock(secondiAllaFine);
    //     let value = countdownProgress.max;
    //     let newMax = value;
    //     if (newMax === 1) {
    //         countdownProgress.max = secondiAllaFine;
    //         newMax = secondiAllaFine;
    //     }
    //     countdownProgress.value = newMax - secondiAllaFine;
    // }
    renderHeader();
};

time();
setInterval(time, 1000);

// .. listeners
events.on('id_received', message => {
    const matches = document.cookie.match(new RegExp('(^| )yid=([^;]+)'));
    const cookie = matches?.[2] ?? '@';
    send(
        JSON.stringify({
            text: 'glue',
            yid: { client: message.id, cookie }
        })
    );
    document.cookie = 'yid=' + message.id + ';';
    events.emit('construction_completed', { id: message.id, yid: message.id });
});

events.on('something_happened', message => {
    if (message.message.text === 'refresh_buildings') {
        const builtMap = {};
        for (const { name, level, finish } of message.queue ?? []) {
            builtMap[name] = { ...builtMap[name], level, finish };
        }

        events.emit('queue_refreshed', Object.values(builtMap));
    }
});

events.on('queue_refreshed', message => {
    renderQueue(message);
});

events.on('queue_refreshed', message => {
    console.log('queue_refreshed', message);
    for (const item of message) {
        const splitTime = item.finish.split(/\D+/);
        const fin = new Date(
            Date.UTC(splitTime[0], --splitTime[1], splitTime[2], splitTime[3], splitTime[4], splitTime[5], splitTime[6])
        ).getTime();
        const dto = {};
        dto.diff = fin - Date.now();
        if (dto.diff > 0) {
            // TODO: cosa dovrebbe fare qui?
            // orarioFineLavori = item.finish;
        }
    }
});

events.on('hide_box', message => {
    console.log('hide', message.buildingName);
    document.querySelector(`[data-action="build_${message.buildingName}"]`).style.visibility = 'hidden';
});

events.on('show_box', message => {
    console.log('show', message.buildingName);
    document.querySelector(`[data-action="build_${message.buildingName}"]`).style.visibility = 'visible';
});

events.on('something_happened', message => {
    for (const { name, visible } of message.visibilities) {
        const item = document.querySelector(`[data-building-name="${name}"]`);
        if (item) {
            if (visible === false) {
                events.emit('hide_box', { buildingName: name });
                item.classList.add('hidden');
                item.classList.remove('visible');
            } else {
                events.emit('show_box', { buildingName: name });
                item.classList.remove('hidden');
                item.classList.add('visible');
            }
        }
    }

    const distincts = [];
    if (typeof message.tree !== 'undefined') {
        for (const b of message.tree.buildings) {
            distincts[b.name] = {};
            for (const { name, amount } of b.building.res) {
                distincts[b.name][name] = amount;
            }
        }
    }

    // update al building levels
    if (!available.includes(message.type)) {
        for (const { name, level } of message.queue ?? []) {
            document.querySelector(`[data-building="${name}"]`).textContent = level;

            // aggiorno il numero di risorse necessarie
            for (const resource of buildingResources) {
                document.querySelector(`[data-id="${name}-${resource}"]`).textContent = `${resource}: ${timing(
                    distincts[name][resource],
                    level + 1
                )}`;
            }
        }
    }

    counts.clients = message.numberOfClients;
    counts.villages = message.numberOfVillages;
    counts.fields = message.numberOfFields;

    timers.uptimeTimestamp = Date.now();
    timers.uptime = message.rawseconds;
    renderHeader();
});

events.on('construction_requested', message => {
    // TODO: cosa succede qui?
    // let fine = new Date(message.queue.rawFinish);
    // orarioFineLavori = message.orarioFineLavori;
});

events.on('construction_completed', message => {
    current.building = null;
    renderUI();
});

events.on('construction_completed', message => {
    const matches = document.cookie.match(new RegExp('(^| )yid=([^;]+)'));
    send(
        JSON.stringify({
            text: 'refresh_buildings',
            yid: message.yid,
            to: message.yid,
            cookieYid: matches?.[2] ?? '@'
        })
    );
});

events.on('coundown_completed', () => {
    if (queueOfStuff.length > 0) {
        for (let qof of queueOfStuff) {
            // TODO: coda LIFO?
            queueOfStuff.pop()();
        }
    }
});

events.on('connection_started', message => {
    for (const resource of message.tree.buildings[0].building.res) {
        buildingResources.push(resource);
    }

    for (const { name } of message.buildings) {
        available.push(`build_${name}`);
    }

    renderUI();
});

setTimeout(() => {
    const matches = document.cookie.match(new RegExp('(^| )yid=([^;]+)'));

    send(
        JSON.stringify({
            text: 'connection-call',
            to: 'all',
            cookieYid: matches?.[2] ?? ''
        })
    );
}, 1000);

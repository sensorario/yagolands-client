// imports
import { clock } from './modules/clock/clock.js';
import * as events from './modules/eventi/eventi.js';
import { timing } from './modules/timing/timing.js';
import * as client from './modules/ui/ui.js';

// ...
const queueOfStuff = [];
const connection = new WebSocket('ws://localhost:12345');
let buildingsRendered = false;
let secondsFromTheBeginning = 0;
const available = [];
const buildingResources = [];

const countdownContainer = document.querySelector('.countdown');
const countdownProgress = document.querySelector('#countdown-progress');
const gameTimeContainer = document.querySelector('.seconds');
function time() {
    secondsFromTheBeginning++;
    if (secondiAllaFine >= 0) {
        countdownContainer.textContent = clock(secondiAllaFine);
        let value = countdownProgress.max;
        let newMax = value;
        if (newMax == 1) {
            countdownProgress.max = secondiAllaFine;
            newMax = secondiAllaFine;
        }
        countdownProgress.value = newMax - secondiAllaFine;
    }
    gameTimeContainer.textContent = clock(secondsFromTheBeginning);
}

time();
setInterval(time, 1000);

// .. listeners
connection.addEventListener('message', e => {
    let message = JSON.parse(e.data);
    if (available.includes(message.type)) {
        const orarioFineLavori = message.finishTime.fine;
        const dto = {
            orarioFineLavori,
            type: message.type,
            secondiAllaFine: secondiAllaFine,
            queue: message.queue,
            endOfConstruction: message.finishTime
        };
        events.emit('construction_requested', dto);
        queueOfStuff.push(() => {
            events.emit('construction_completed', yid);
        });
    } else {
        events.emit('something_happened', message);
    }

    if (typeof message.message != 'undefined') {
        events.emit('connection_started', message);
    }
});

events.on('id_received', message => {
    const matches = document.cookie.match(new RegExp('(^| )yid=([^;]+)'));
    const cookie = matches?.[2] ?? '@';
    connection.send(
        JSON.stringify({
            text: 'glue',
            yid: {
                client: message.id,
                cookie: cookie
            }
        })
    );
    document.cookie = 'yid=' + message.id + ';';
    events.emit('construction_completed', { id: message.id, yid: message.id });
});

events.on('something_happened', message => {
    if (message.message.text === 'refresh_buildings') {
        let built = [];
        for (let q in message.queue) {
            let buildingName = message.queue[q].name;
            let buildingLevel = message.queue[q].level;
            let finish = message.queue[q].finish;
            let isBuildingMissing = true;
            for (let b in built) {
                if (built[b].name == buildingName) {
                    built[b].level = buildingLevel;
                    built[b].finish = finish;
                    isBuildingMissing = false;
                }
            }
            if (isBuildingMissing === true) {
                built.push({
                    name: message.queue[q].name,
                    level: message.queue[q].level,
                    finish: message.queue[q].finish
                });
            }
        }

        events.emit('queue_refreshed', built);
    }
});

events.on('queue_refreshed', message => {
    client.renderQueue(message);
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

const divOfClients = document.querySelector('.numberOfClients');
const divOfVillages = document.querySelector('.numberOfVillages');
const divOfFields = document.querySelector('.numberOfFields');
const divOfSeconds = document.querySelector('.seconds');
events.on('something_happened', message => {
    for (const { name, visible } of message.visibilities) {
        const item = document.querySelector(`[data-building-name="${name}"]`);
        if (item) {
            console.log(item.dataset);
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

    const { numberOfClients, numberOfVillages, numberOfFields } = message;

    secondsFromTheBeginning = message.rawseconds;

    divOfClients.textContent = numberOfClients;
    divOfVillages.textContent = numberOfVillages;
    divOfFields.textContent = numberOfFields;
    divOfSeconds.textContent = clock(secondsFromTheBeginning);
});

events.on('construction_requested', message => {
    // TODO: cosa succede qui?
    // let fine = new Date(message.queue.rawFinish);
    orarioFineLavori = message.orarioFineLavori;
});

events.on('construction_completed', message => {
    // @todo repeated code
    // let buttons = document.querySelectorAll('[data-button="builder"]');
    // buttons.forEach(item => (item.style.visibility = 'visible'));
});

events.on('construction_completed', message => {
    const matches = document.cookie.match(new RegExp('(^| )yid=([^;]+)'));
    connection.send(
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
    if (buildingsRendered) {
        return;
    }

    for (const resource of message.tree.buildings[0].building.res) {
        buildingResources.push(resource);
    }

    for (const { name } of message.buildings) {
        available.push(`build_${name}`);
    }

    client.renderUI(message);

    for (const { name, visible } of message.visibilities) {
        if (visible === false) {
            document.querySelector(`[data-building-name="${name}"]`).classList.add('hidden');
        }
    }

    const buttons = document.querySelectorAll('[data-button="builder"]');
    buttons.forEach(button => {
        // TODO: spostare nella parte UI
        button.addEventListener('click', event => {
            console.log('click');
            // @todo repeated code
            buttons.forEach(item => (item.style.visibility = 'hidden'));
            const yid = document.querySelector('#yid').value;
            const matches = document.cookie.match(new RegExp('(^| )yid=([^;]+)'));
            const dto = {
                text: event.target.dataset.action,
                to: yid,
                yid,
                position: 42,
                cookieYid: matches?.[2] ?? '@'
            };
            console.log('send', dto);
            connection.send(JSON.stringify(dto));
        });
    });

    buildingsRendered = true;
});

function send(data) {
    if (connection.readyState === WebSocket.OPEN) {
        connection.send(data);
    } else {
        console.error('not connected');
    }
}

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

const buttonToolbar = document.querySelector('div#toolbar button');
buttonToolbar.addEventListener('click', event => {
    event.target.parentElement.parentElement.classList.toggle('visible');
    event.target.parentElement.parentElement.classList.toggle('reduced');
});

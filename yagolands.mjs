// imports
import clock from './modules/clock/clock.mjs';
import timing from './modules/timing/timing.mjs';
import eventi from './modules/eventi/eventi.js';
import ui from './modules/ui/ui.js';

// ...
const events = eventi();
const client = ui();

// ... 
let queueOfStuff = new Array();
let connection = new WebSocket('ws://localhost:12345');
let msg = document.getElementById('msg');
let buildingsRendered = false;
let secondsFromTheBeginning = 0;
let available = [];
let buildingResources = [];

function time() {
    secondsFromTheBeginning++;
    if (--secondiAllaFine >= 0) {
        document.querySelector('.countdown').innerHTML = clock().clock(secondiAllaFine);
    }
    document.querySelector('.seconds').innerHTML = clock().clock(secondsFromTheBeginning);
    setTimeout(() => time(), 1000);
}

time();

// non dovrebbero esistere piu' form ... 
msg.addEventListener('keydown', e => {
    let kc = e.which || e.keyCode;
    if (kc === 13) {
        let to = document.getElementById('to');
        send(
            JSON.stringify({
                text: msg.value,
                to: to.value
            })
        );
        msg.value = '';
        to.value = '';
    }
});

// .. listeners
connection.addEventListener('message', e => {
    let message = JSON.parse(e.data);
    if (available.includes(message.type)) {
        events.emit('construction_requested', { type: message.type, secondiAllaFine: secondiAllaFine, queue: message.queue });
        queueOfStuff.push(() => { events.emit('construction_completed', yid); });
    } else {
        events.emit('something_happened', message);
    }

    if (typeof message.message != 'undefined') {
        events.emit('connection_started', message);
    }
});

events.on('something_happened', message => {
    if (message.message.text === 'refresh_buildings') {
        let builded = [];
        for (let q in message.queue) {
            let buildingName = message.queue[q].name;
            let buildingLevel = message.queue[q].level;
            let isBuildingMissing = true;
            for (let b in builded) {
                if (builded[b].name == buildingName) {
                    builded[b].level = buildingLevel;
                    isBuildingMissing = false;
                }
            }
            if (isBuildingMissing === true) {
                builded.push({
                    name: message.queue[q].name,
                    level: message.queue[q].level,
                });
            }
        }

        events.emit('queue_refreshed', builded);
    }
});

events.on('queue_refreshed', message => {
    console.log('queue_refreshed', message);
    client.renderQueue(message);
});

events.on('something_happened', message => {
    for(let v in message.visibilities) {
        let buildingName = message.visibilities[v].name;
        let visible = message.visibilities[v].visible;
        let data = '[data-building-name="' + buildingName + '"]';
        if (document.querySelector(data) != null) {
            if (visible === false) {
                document.querySelector(data).classList.add('hidden');
                document.querySelector(data).classList.remove('visible');
            } else {
                document.querySelector(data).classList.remove('hidden');
                document.querySelector(data).classList.add('visible');
            }
        }
    }

    let distincts = new Array();
    if (typeof message.tree != 'undefined') {
        for (let bb in message.tree.buildings) {
            let b = message.tree.buildings[bb];
            let res = b.building.res;
            distincts[b.name] = new Array();
            for (let rr in res) {
                distincts[b.name][res[rr].name] = res[rr].amount;
            }
        }
    }

    // update al building levels
    if (!available.includes(message.type)) {
        for (let q in message.queue) {
            let buildingName = message.queue[q].name;
            let data = '[data-building="' + buildingName + '"]';
            let div = document.querySelector(data);
            div.textContent = message.queue[q].level;

            // aggiorno il numero di risorse necessarie
            for (let r in buildingResources) {
                let dataBuilding = '[data-id="' + message.queue[q].name + '-'+buildingResources[r]+'"]';
                let divBuilding = document.querySelector(dataBuilding);
                // @todo sostituire 22 con il valore iniziale reale dell-edificio
                let res = distincts[buildingName][buildingResources[r]];
                divBuilding.textContent = buildingResources[r] + ': ' + timing(res, message.queue[q].level + 1);
            }
        }
    }

    let numberOfClients = message.numberOfClients;
    let numberOfVillages = message.numberOfVillages;
    let numberOfFields = message.numberOfFields;
    let seconds = message.seconds;

    let divOfClients = document.querySelector('.numberOfClients');
    let divOfVillages = document.querySelector('.numberOfVillages');
    let divOfFields = document.querySelector('.numberOfFields');
    let divOfSeconds = document.querySelector('.seconds');

    secondsFromTheBeginning = message.rawseconds;

    divOfClients.innerHTML = numberOfClients;
    divOfVillages.innerHTML = numberOfVillages;
    divOfFields.innerHTML = numberOfFields;
    divOfSeconds.innerHTML = clock().clock(secondsFromTheBeginning);
});

events.on('construction_requested', message => {
    let fine = new Date(message.queue.rawFinish);
    secondiAllaFine = Math.round((fine.getTime() - (new Date()).getTime()) / 1000);
});

events.on('construction_completed', message => {
    connection.send(JSON.stringify({
        text: 'refresh_buildings',
        yid: message.yid,
        to: message.yid,
    }));
});

events.on('coundown_completed', () => {
    if (queueOfStuff.length > 0) {
        for (let qof in queueOfStuff) {
            queueOfStuff.pop()();
        }
    }
});

events.on('connection_started', message => {
    if (buildingsRendered === true) { return; }

    for(let r in message.tree.buildings[0].building.res) {
        buildingResources.push(message.tree.buildings[0].building.res[r].name);
    }

    for(let b in message.buildings) {
        let buildingName = message.buildings[b].name;
        let action = 'build_' + buildingName;
        available.push(action);
    }

    client.render(message);

    for(let v in message.visibilities) {
        let buildingName = message.visibilities[v].name;
        let visible = message.visibilities[v].visible;
        if (visible === false) {
            let data = '[data-building-name="' + buildingName + '"]';
            document.querySelector(data).classList.add('hidden');
        }
    }

    let buttons = document.querySelectorAll('[data-button="builder"]');
    buttons.forEach(button => {
        button.addEventListener('click', event => {
            let yid = document.querySelector('#yid').value;
            let dto = { text: event.target.dataset.action, to: yid, yid: yid, position: 42 };
            connection.send(JSON.stringify(dto));
        });
    });

    buildingsRendered = true;
});

connection.addEventListener('message', e => {});

function send(data) {
    if (connection.readyState === WebSocket.OPEN) {
        connection.send(data);
    } else {
        console.error('not connected');
    }
}

setTimeout(() => { send(JSON.stringify({ text: 'connection-call', to: 'all' })); }, 1000);

const buttonToolbar = document.querySelector('div#toolbar button');
buttonToolbar.addEventListener('click', event => {
    event.target.parentElement.parentElement.classList.toggle('visible');
    event.target.parentElement.parentElement.classList.toggle('reduced');
});

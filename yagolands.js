// imports
import { clock } from './modules/clock/clock.js';
import * as events from './modules/eventi/eventi.js';
import { timing } from './modules/timing/timing.js';
import * as client from './modules/ui/ui.js';

// ...
let queueOfStuff = [];
let connection = new WebSocket('ws://localhost:12345');
let msg = document.getElementById('msg');
let buildingsRendered = false;
let secondsFromTheBeginning = 0;
let available = [];
let buildingResources = [];

function time() {
    secondsFromTheBeginning++;
    if (secondiAllaFine >= 0) {
        document
            .querySelector('.countdown')
            .innerHTML = clock(secondiAllaFine);
        let progress = document.querySelector('#countdown-progress');
        let value = progress.max;
        let newMax = value;
        if (newMax == 1) {
            progress.max = secondiAllaFine;
            newMax = secondiAllaFine;
        }
        progress.value = newMax - secondiAllaFine;
    }
    document.querySelector('.seconds').innerHTML = clock(secondsFromTheBeginning);
    setTimeout(() => time(), 1000);
}

time();

// non dovrebbero esistere piu' form ...
msg.addEventListener('keydown', e => {
    let kc = e.which || e.keyCode;
    if (kc === 13) {
        let to = document.getElementById('to');
        let matches = document.cookie.match(new RegExp('(^| )yid=([^;]+)'));
        send(
            JSON.stringify({
                text: msg.value,
                to: to.value,
                cookieYid: matches ? matches[2] : '@'
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
        let orarioFineLavori = message.finishTime.fine;
        let dto = {
            orarioFineLavori: orarioFineLavori,
            type: message.type,
            secondiAllaFine: secondiAllaFine,
            queue: message.queue,
            endOfConstruction: message.finishTime,
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
    let matches = document.cookie.match(new RegExp('(^| )yid=([^;]+)'));
    let cookie = matches ? matches[2] : '@';
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
        let builded = [];
        for (let q in message.queue) {
            let buildingName = message.queue[q].name;
            let buildingLevel = message.queue[q].level;
            let finish = message.queue[q].finish;
            let isBuildingMissing = true;
            for (let b in builded) {
                if (builded[b].name == buildingName) {
                    builded[b].level = buildingLevel;
                    builded[b].finish = finish;
                    isBuildingMissing = false;
                }
            }
            if (isBuildingMissing === true) {
                builded.push({
                    name: message.queue[q].name,
                    level: message.queue[q].level,
                    finish: message.queue[q].finish,
                });
            }
        }

        events.emit('queue_refreshed', builded);
    }
});

events.on('queue_refreshed', message => {
    client.renderQueue(message);
});

events.on('queue_refreshed', message => {
    console.log('queue_refreshed', message)
    for (let m in message) {
        let b = message[m].finish.split(/\D+/);
        let fin = (new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]))).getTime()
        let now = (new Date()).getTime()
        let dto = {};
        dto.diff = fin - now;
        if (dto.diff/1000 > 0) {
            orarioFineLavori = message[m].finish;
        }
    }
});

events.on('hide_box', message => {
    let data = '[data-action="build_' + message.buildingName + '"]';
    console.log('hide', message.buildingName);
    document.querySelector(data).style.visibility = 'hidden';
});

events.on('show_box', message => {
    let data = '[data-action="build_' + message.buildingName + '"]';
    console.log('show', message.buildingName);
    document.querySelector(data).style.visibility = 'visible';
});

events.on('something_happened', message => {
    for (let v in message.visibilities) {
        let buildingName = message.visibilities[v].name;
        let visible = message.visibilities[v].visible;
        let data = '[data-building-name="' + buildingName + '"]';
        if (document.querySelector(data) != null) {
            let item = document.querySelector(data);
            console.log(item.dataset);
            if (visible === false) {
                events.emit('hide_box', { buildingName: item.dataset.buildingName });
                item.classList.add('hidden');
                item.classList.remove('visible');
            } else {
                events.emit('show_box', { buildingName: item.dataset.buildingName });
                item.classList.remove('hidden');
                item.classList.add('visible');
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
                let dataBuilding = '[data-id="' + message.queue[q].name + '-' + buildingResources[r] + '"]';
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
    divOfSeconds.innerHTML = clock(secondsFromTheBeginning);
});

events.on('construction_requested', message => {
    let fine = new Date(message.queue.rawFinish);
    orarioFineLavori = message.orarioFineLavori;
});

events.on('construction_completed', message => {
    // @todo repeated code
    // let buttons = document.querySelectorAll('[data-button="builder"]');
    // buttons.forEach(item => (item.style.visibility = 'visible'));
});

events.on('construction_completed', message => {
    let matches = document.cookie.match(new RegExp('(^| )yid=([^;]+)'));
    connection.send(
        JSON.stringify({
            text: 'refresh_buildings',
            yid: message.yid,
            to: message.yid,
            cookieYid: matches ? matches[2] : '@'
        })
    );
});

events.on('coundown_completed', () => {
    if (queueOfStuff.length > 0) {
        for (let qof in queueOfStuff) {
            queueOfStuff.pop()();
        }
    }
});

events.on('connection_started', message => {
    if (buildingsRendered === true) {
        return;
    }

    for (let r in message.tree.buildings[0].building.res) {
        buildingResources.push(message.tree.buildings[0].building.res[r].name);
    }

    for (let b in message.buildings) {
        let buildingName = message.buildings[b].name;
        let action = 'build_' + buildingName;
        available.push(action);
    }

    client.renderUI(message);

    for (let v in message.visibilities) {
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
            console.log('click');
            // @todo repeated code
            buttons.forEach(item => (item.style.visibility = 'hidden'));
            let yid = document.querySelector('#yid').value;
            let matches = document.cookie.match(new RegExp('(^| )yid=([^;]+)'));
            let dto = {
                text: event.target.dataset.action,
                to: yid,
                yid: yid,
                position: 42,
                cookieYid: matches ? matches[2] : '@'
            };
            console.log('send', dto)
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
    let matches = document.cookie.match(new RegExp('(^| )yid=([^;]+)'));

    send(
        JSON.stringify({
            text: 'connection-call',
            to: 'all',
            cookieYid: matches ? matches[2] : ''
        })
    );
}, 1000);

const buttonToolbar = document.querySelector('div#toolbar button');
buttonToolbar.addEventListener('click', event => {
    event.target.parentElement.parentElement.classList.toggle('visible');
    event.target.parentElement.parentElement.classList.toggle('reduced');
});

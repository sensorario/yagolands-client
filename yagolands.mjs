// imports
import clock from './modules/clock.mjs';
import timing from './modules/timing.mjs';
import eventi from './modules/eventi/eventi.js';
import ui from './modules/ui/ui.js';

// ...
const events = eventi();

// ... 
let queueOfStuff = new Array();
let connection = new WebSocket('ws://localhost:12345');
let msg = document.getElementById('msg');
let buildingsRendered = false;

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
    let available = ['build_castle', 'build_warehouse', 'build_windmill', 'build_barracks'];
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
    // @todo sarebbe meglio avere gli edifici gia filtrati
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
    let available = ['build_castle', 'build_warehouse', 'build_windmill', 'build_barracks'];
    if (!available.includes(message.type)) {
        for (let q in message.queue) {
            let buildingName = message.queue[q].name;
            let data = '[data-building="' + buildingName + '"]';
            let div = document.querySelector(data);
            div.textContent = message.queue[q].level;

            // aggiorno il numero di risorse necessarie
            let ressss = ['iron', 'wood', 'clay', 'grain'];
            for (let r in ressss) {
                let dataBuilding = '[data-id="' + message.queue[q].name + '-'+ressss[r]+'"]';
                let divBuilding = document.querySelector(dataBuilding);
                // @todo sostituire 22 con il valore iniziale reale dell-edificio
                let res = distincts[buildingName][ressss[r]];
                divBuilding.textContent = ressss[r] + ': ' + timing(res, message.queue[q].level + 1);
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

    divOfClients.innerHTML = numberOfClients;
    divOfVillages.innerHTML = numberOfVillages;
    divOfFields.innerHTML = numberOfFields;
    divOfSeconds.innerHTML = seconds;
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
    let buttons = document.querySelectorAll('[data-button="builder"]');
    buttons.forEach(button => (button.style.visibility = 'visible'));
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
    ui().render(message);

    let buttons = document.querySelectorAll('[data-button="builder"]');
    buttons.forEach(button => {
        button.addEventListener('click', event => {
            let yid = document.querySelector('#yid').value;
            connection.send(
                JSON.stringify({
                    text: event.target.dataset.action,
                    to: yid,
                    yid: yid,
                    position: 42
                })
            );
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

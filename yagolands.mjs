import clock from './modules/clock.mjs';
import timing from './modules/timing.mjs';

const connection = new WebSocket('ws://localhost:12345'),
    msg = document.getElementById('msg');

let savedTime = 0;
let buildingsRendered = false;

function hideButtons() {
    let buttons = document.querySelectorAll('[data-button="builder"]');
    buttons.forEach(button => (button.style.visibility = 'hidden'));
}

connection.addEventListener('message', e => {
    savedTime = JSON.parse(e.data).rawseconds;
    let available = ['build_castle', 'build_warehouse', 'build_windmill', 'build_barracks'];
    if (available.includes(JSON.parse(e.data).type)) {
        secondiAllaFine = JSON.parse(e.data).secondiAllaFine;
        let queue = JSON.parse(e.data).queue;
        let adesso = new Date();
        let fine = new Date(queue.rawFinish);
        secondiAllaFine = Math.round((fine.getTime() - adesso.getTime()) / 1000);
        queueOfStuff.push(() => {
            let yid = document.querySelector('#yid').value;
            connection.send(
                JSON.stringify({
                    text: 'refresh_buildings',
                    yid: yid,
                    to: yid
                })
            );
        });
    }
});

connection.addEventListener('message', e => {
    if (buildingsRendered === true) {
        return;
    }

    // recupero il mio client id
    let myYid = JSON.parse(e.data).id;
    document.querySelector('#yid').value = myYid;

    // resource
    let res = JSON.parse(e.data).tree.buildings;
    let schede = [];
    for (let r = 0; r < res.length; r++) {
        if (!schede.includes(res[r])) {
            schede[res[r].name] = res[r].building.res;
        }
    }

    // renderizzo edifici e risorse
    let container = document.querySelector('[data-content="tree-info"]');
    let buildings = JSON.parse(e.data).buildings;
    for (let b = 0; b < buildings.length; b++) {
        let divBuilding = document.createElement('div');
        divBuilding.classList.add('building-item');
        divBuilding.textContent = buildings[b].name;

        let divResources = new Array();
        let resources = schede[buildings[b].name];
        for (let r = 0; r < resources.length; r++) {
            let resName = resources[r].name;
            let resAmount = resources[r].amount;
            let newDivRes = document.createElement('div');
            newDivRes.classList.add('resource');
            newDivRes.dataset.id = buildings[b].name +'-'+ resName;
            newDivRes.textContent = resName +': '+ resAmount;
            divBuilding.appendChild(newDivRes);

            divBuilding.dataset[resName] = resAmount;
        }

        // livello edificio
        let divBuildingLevel = document.createElement('span');
        divBuildingLevel.classList.add('building-level');
        divBuildingLevel.dataset.building = buildings[b].name;
        divBuildingLevel.textContent = '0';

        let divBuildingLevelContainer = document.createElement('div');
        divBuildingLevelContainer.classList.add('building-level-container');
        divBuildingLevelContainer.textContent = 'current level: ';
        divBuildingLevelContainer.appendChild(divBuildingLevel);

        // per costruire
        let divButtonBuild = document.createElement('button');
        divButtonBuild.dataset.button = 'builder';
        divButtonBuild.dataset.action = 'build_' + buildings[b].name;
        divButtonBuild.textContent = 'migliora';

        divBuilding.appendChild(divBuildingLevelContainer);
        divBuilding.appendChild(divButtonBuild);

        container.appendChild(divBuilding);
    }
    let buttons = document.querySelectorAll('[data-button="builder"]');
    buttons.forEach(button => {
        button.addEventListener('click', event => {
            if (connection.readyState === WebSocket.OPEN) {
                let yid = document.querySelector('#yid').value;
                connection.send(
                    JSON.stringify({
                        text: event.target.dataset.action,
                        to: yid,
                        yid: yid,
                        position: 42
                    })
                );
                hideButtons();
            } else {
                console.error('not connected');
            }
        });
    });

    buildingsRendered = true;
});

connection.addEventListener('message', e => {
    let message = JSON.parse(e.data);

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

    let numberOfClients = JSON.parse(e.data).numberOfClients;
    let numberOfVillages = JSON.parse(e.data).numberOfVillages;
    let numberOfFields = JSON.parse(e.data).numberOfFields;
    let seconds = JSON.parse(e.data).seconds;

    let divOfClients = document.querySelector('.numberOfClients');
    let divOfVillages = document.querySelector('.numberOfVillages');
    let divOfFields = document.querySelector('.numberOfFields');
    let divOfSeconds = document.querySelector('.seconds');

    divOfClients.innerHTML = numberOfClients;
    divOfVillages.innerHTML = numberOfVillages;
    divOfFields.innerHTML = numberOfFields;
    divOfSeconds.innerHTML = seconds;
});

function updateClock() {
    document.querySelector('.seconds').innerHTML = clock(++savedTime);
    setTimeout(() => updateClock(), 1000);
}

updateClock();

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

function send(data) {
    if (connection.readyState === WebSocket.OPEN) {
        connection.send(data);
    } else {
        console.error('not connected');
    }
}

function messaggio() {
    send(JSON.stringify({ text: 'connection-call', to: 'all' }));
}

setTimeout(() => {
    messaggio();
}, 1000);

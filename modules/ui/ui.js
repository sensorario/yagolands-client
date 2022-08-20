let eventManager = null;

let newDivResource = dto => {
    let div = document.createElement('div');
    div.classList.add('resource');
    div.dataset.id = dto.buildingName +'-'+ dto.resourceName;
    div.textContent = dto.resourceName +': '+ dto.resourceAmount;
    return div;
};

let buildBuildingButton = dto => {
    let iTools = document.createElement('em');
    iTools.textContent = '🛠';

    let div = document.createElement('button');
    div.dataset.button = 'builder';
    div.dataset.action = 'build_' + dto.name;
    div.textContent = 'improve';
    div.appendChild(iTools);
    return div;
};

let buildContainer = child => {
    let div = document.createElement('div');
    div.classList.add('building-level-container');
    div.textContent = 'current level: ';
    div.appendChild(child);
    return div;
};

let buildLevel = dto => {
    let div = document.createElement('span');
    div.classList.add('building-level');
    div.dataset.building = dto.name;
    div.textContent = '0';
    return div;
};

let resourcesGrid = message => {
    let res = message.tree.buildings;
    let map = [];
    for (let r = 0; r < res.length; r++) {
        if (!map.includes(res[r])) {
            map[res[r].name] = res[r].building.res;
        }
    }
    return map;
};

let renderQueue = message => {
    let container = document.querySelector('#buildings');
    while(container.firstChild) { container.removeChild(container.firstChild); }
    for (let building in message) {
        let divBuilding = document.createElement('div');
        divBuilding.classList.add('building');
        divBuilding.textContent = message[building].name + ' (' + message[building].level + ')';
        container.appendChild(divBuilding);
    }
};

let render = message => {
    eventManager.emit('id_received', {id: message.id});
    document.querySelector('#yid').value = message.id;

    let resourceMap = resourcesGrid(message);
    let container = document.querySelector('[data-content="tree-info"]');

    for (let b = 0; b < message.buildings.length; b++) {
        let buildingName = message.buildings[b].name;

        let divBuilding = document.createElement('div');
        divBuilding.classList.add('building-item');
        divBuilding.dataset.buildingName = buildingName;
        divBuilding.textContent = buildingName

        let buildingResources = resourceMap[buildingName];
        for (let r = 0; r < buildingResources.length; r++) {
            let dto = {
                resourceName: buildingResources[r].name,
                resourceAmount: buildingResources[r].amount,
                buildingName: buildingName,
            };

            divBuilding.appendChild(newDivResource(dto));
        }

        divBuilding.appendChild(buildContainer(buildLevel({ name: buildingName })));
        divBuilding.appendChild(buildBuildingButton({ name: buildingName }));
        container.appendChild(divBuilding);
    }
};

export default function ui (eventi) {
    eventManager = eventi;
    
    return {
        render,
        renderQueue,
    };
};

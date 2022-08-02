let render = message => {
    let myYid = message.id;
    document.querySelector('#yid').value = myYid;

    // resource
    let res = message.tree.buildings;
    let schede = [];
    for (let r = 0; r < res.length; r++) {
        if (!schede.includes(res[r])) {
            schede[res[r].name] = res[r].building.res;
        }
    }

    // renderizzo edifici e risorse
    let container = document.querySelector('[data-content="tree-info"]');
    let buildings = message.buildings;
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
};

export default function ui (message) {
    return {
        render,
    };
};

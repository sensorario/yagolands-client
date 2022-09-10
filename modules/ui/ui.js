import { emit } from '../eventi/eventi.js';
import { createFromHTML } from '../utils/utils.js';

const newDivResource = dto =>
    createFromHTML(
        `<div class="resource" data-id="${dto.buildingName}-${dto.resourceName}">
  ${dto.resourceName}: ${dto.resourceAmount}
</div>`
    );

const buildBuildingButton = dto =>
    createFromHTML(`<button type="button" data-button="builder" data-action="build_${dto.name}">improve <i>🛠</i></button>`);

const buildContainer = child => createFromHTML(`<div class="building-level-container">current level: ${child}</div>`);

const buildLevel = dto => `<span class="building-level" data-building="${dto.name}">0</span>`;

const resourcesGrid = message => Object.fromEntries(message.tree.buildings.map(bld => [bld.name, bld.building.res]));

const container = document.querySelector('#buildings');
export const renderQueue = message => {
    container.innerHTML = message.map(building => `<div class="building">${building.name} (${building.level})</div>`).join('');
};

const treeContainer = document.querySelector('[data-content="tree-info"]');
export const render = message => {
    emit('id_received', { id: message.id });
    document.querySelector('#yid').value = message.id;

    const resourceMap = resourcesGrid(message);

    for (const { name } of message.buildings) {
        const divBuilding = createFromHTML(`<div class="building-item" data-building-name="${name}">${name}</div>`).firstChild;

        for (const resource of resourceMap[name]) {
            divBuilding.appendChild(
                newDivResource({
                    resourceName: resource.name,
                    resourceAmount: resource.amount,
                    buildingName: name
                })
            );
        }

        divBuilding.appendChild(buildContainer(buildLevel({ name })));
        divBuilding.appendChild(buildBuildingButton({ name }));
        treeContainer.appendChild(divBuilding);
    }
};

import { html, render as htmlRender } from 'lit-html';
import { emit } from '../eventi/eventi.js';
import { render } from './canvas.js';

const newDivResource = dto =>
    html`<div class="resource" data-id="${dto.buildingName}-${dto.resourceName}">${dto.resourceName}: ${dto.resourceAmount}</div>`;

const buildBuildingButton = dto =>
    html`<button type="button" data-button="builder" data-action="build_${dto.name}" style="">improve <i>🛠</i></button>`;

const buildContainer = child => html`<div class="building-level-container">current level: ${child}</div>`;

const buildLevel = dto => html`<span class="building-level" data-building="${dto.name}">0</span>`;

const resourcesGrid = message => Object.fromEntries(message.tree.buildings.map(bld => [bld.name, bld.building.res]));

// elenco degli edifici gia costruiti
const container = document.querySelector('#buildings');
export const renderQueue = message => {
    htmlRender(
        message.map(building => html`<div class="building">${building.name} (${building.level})</div>`),
        container
    );
};

const buildingSnippet = (resourceMap, name) => html`<div class="building-item" data-building-name="${name}">
    ${name}
    ${resourceMap[name].map(resource =>
        newDivResource({
            resourceName: resource.name,
            resourceAmount: resource.amount,
            buildingName: name
        })
    )}
    ${buildContainer(buildLevel({ name }))} ${buildBuildingButton({ name })}
</div>`;

const treeContainer = document.querySelector('[data-content="tree-info"]');
const yidContainer = document.querySelector('#yid');
export const renderUI = message => {
    emit('id_received', { id: message.id });
    yidContainer.value = message.id;

    const resourceMap = resourcesGrid(message);
    htmlRender(
        message.buildings.map(({ name }) => buildingSnippet(resourceMap, name)),
        treeContainer
    );

    render();
};

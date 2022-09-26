import { html, render as htmlRender } from 'lit-html';
import { clock } from '../clock/clock.js';
import { counts, current, timers, tree } from '../state/world.js';
import { render } from './canvas.js';

const newDivResource = ({ buildingName, resourceName, resourceAmount }) =>
    html`<div class="resource" data-id="${buildingName}-${resourceName}">${resourceName}: ${resourceAmount}</div>`;

// elenco degli edifici gia costruiti
const container = document.querySelector('#buildings');
export const renderQueue = message => {
    htmlRender(
        message.map(building => html`<div class="building">${building.name} (${building.level})</div>`),
        container
    );
};

/**
 * @param {Object} data
 * @param {string} data.name
 * @param {boolean} data.visible
 * @param {Array<{ name: string, amount: number }>} data.resources
 * @returns {import('lit-html').TemplateResult}
 */
const buildingSnippet = ([name, { visible, resources }]) => html`<div
    class="building-item"
    data-building-name="${name}"
    ?hidden=${!visible}
>
    ${name}
    ${resources.map(resource =>
        newDivResource({
            resourceName: resource.name,
            resourceAmount: resource.amount,
            buildingName: name
        })
    )}
    <div class="building-level-container">current level: <span class="building-level" data-building="${name}">0</span></div>
    <button type="button" ?disabled=${!!current.building} @click=${() => buildBuilding(name)}>Build <i>🛠</i></button>
</div>`;

const uiContainer = document.querySelector('#ui');
let reduced = false;
export const renderUI = () => {
    // emit('id_received', { id: message.id });

    htmlRender(
        html`<header>
                <div class="building-list" data-content="tree-info">${Object.entries(tree).map(buildingSnippet)}</div>

                <div id="buildings">no buildings yet</div>
            </header>

            <footer>
                <div class="countdown-wrapper">
                    seconds to complete the building:
                    <span class="countdown">${clock(timers.remainingToFinish)}</span>
                    &nbsp;|&nbsp;
                    <progress id="countdown-progress" max="0" value="0"></progress>
                </div>

                <div id="toolbar" class="${reduced ? 'reduced' : 'visible'}">
                    <div class="yid-container">
                        <label for="yid">yid:</label>
                        <input type="text" id="yid" name="yid" .value=${current.yid} />
                    </div>
                    <div class="actions">
                        <button type="button" @click=${toggleToolbar}>toggle</button>
                    </div>
                </div>
            </footer>`,
        uiContainer
    );

    render();
};
const toggleToolbar = () => {
    reduced = !reduced;
    renderUI();
};

const headerContainer = document.querySelector('body > header');
export const renderHeader = () => {
    htmlRender(
        html`<ul class="statistics">
            <li class="stat-item">server statistics:</li>
            <li class="stat-item">clients(<span class="numberOfClients">${counts.clients}</span>)</li>
            <li class="stat-item">villages(<span class="numberOfVillages">${counts.villages}</span>)</li>
            <li class="stat-item">fields(<span class="numberOfFields">${counts.fields}</span>)</li>
            <li class="stat-item">time(<span class="seconds">${clock(timers.uptime + (Date.now() - timers.uptimeTimestamp))}</span>)</li>
        </ul>`,
        headerContainer
    );
};

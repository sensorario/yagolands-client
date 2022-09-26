import { emit } from '../eventi/eventi.js';
import { available, current, queueOfStuff, tree } from '../state/world.js';

const WEB_SOCKET_URL = 'ws://localhost:12345';
const connection = new WebSocket(WEB_SOCKET_URL);

connection.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) {
        current.yid = message.id;
    }

    message.tree?.buildings?.forEach(({ name, building }) => {
        tree[name] = { ...tree[name], resources: building.res };
    });
    message.visibilities?.forEach(({ name, visible }) => {
        if (tree[name]) {
            tree[name].visible = visible;
        }
    });

    if (available.includes(message.type)) {
        const orarioFineLavori = message.finishTime.fine;
        const dto = {
            orarioFineLavori,
            type: message.type,
            // secondiAllaFine: secondiAllaFine,
            queue: message.queue,
            endOfConstruction: message.finishTime
        };
        emit('construction_requested', dto);
        queueOfStuff.push(() => {
            emit('construction_completed', yid);
        });
    } else {
        emit('something_happened', message);
    }

    if (typeof message.message !== 'undefined') {
        emit('connection_started', message);
    }
});

export const send = data => {
    // if (connection.readyState === WebSocket.OPEN) {
    connection.send(data);
    // } else {
    //     console.error('not connected');
    // }
};

import { current } from '../state/world.js';
import { send } from '../io/connection.js';

/** @param {string} name */
export const buildBuilding = name => {
    const yid = current.yid;
    const matches = document.cookie.match(new RegExp('(^| )yid=([^;]+)'));
    const dto = {
        text: `build_${name}`,
        to: yid,
        yid,
        position: 42,
        cookieYid: matches?.[2] ?? '@'
    };
    console.log('send', dto);
    send(JSON.stringify(dto));
};

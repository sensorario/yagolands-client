// this code is duplicated in client and server, ...
const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
export const generate = () => {
    return s4() + s4() + '-' + s4() + '-' + s4() + s4() + '-' + s4();
};

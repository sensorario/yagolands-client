// this code is duplicated in client and server, ...
let generate = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + s4() + '-' + s4();
}

export default function generator() {
    return {
        generate,
    }
};
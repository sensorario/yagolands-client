let subscriptions = new Array();

let on = function(eventName, callback) {
    if (typeof subscriptions[eventName] === 'undefined') { subscriptions[eventName] = new Array(); }
    subscriptions[eventName].push(callback);
};

let emit = function(eventName, message) {
    for(let e in subscriptions[eventName]) {
        subscriptions[eventName][e](message);
    }
};

export default function eventi() {
    return {
        on,
        emit,
    }
};

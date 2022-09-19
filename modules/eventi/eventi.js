const subscriptions = {};

let on = function (eventName, callback) {
    if (typeof subscriptions[eventName] === 'undefined') {
        subscriptions[eventName] = [];
    }
    subscriptions[eventName].push(callback);
};

let emit = function (eventName, message) {
    for (const callback of subscriptions[eventName]) {
        callback(message);
    }
};

export {
    on,
    emit,
}

const subscriptions = {};

export const on = function (eventName, callback) {
    if (typeof subscriptions[eventName] === 'undefined') {
        subscriptions[eventName] = [];
    }
    subscriptions[eventName].push(callback);
};

export const emit = function (eventName, message) {
    for (const callback of subscriptions[eventName]) {
        callback(message);
    }
};

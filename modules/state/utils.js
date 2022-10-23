export const createStore = state => {
    /** @type {Map<Function, string | null>} */
    const subscribers = new Map();
    /** @type {Map<Function, Array<{ property: string, oldValue: unknown, newValue: unknown }>>} */
    const callQueue = new Map();

    /**
     * @param {string} property
     * @param {unknown} oldValue
     * @param {unknown} newValue
     */
    const broadcastChange = (property, oldValue, newValue) => {
        for (const [callback, filter] of subscribers.entries()) {
            if (filter === null || filter === property) {
                scheduleChangeBroadcast(callback, property, oldValue, newValue);
            }
        }
    };

    const scheduleChangeBroadcast = (callback, property, oldValue, newValue) => {
        if (callQueue.size === 0) scheduleQueueExecution();
        callQueue.set(callback, [...(callQueue.get(callback) ?? []), { property, oldValue, newValue }]);
    };

    const scheduleQueueExecution = () =>
        Promise.resolve().then(() => {
            for (const [callback, records] of callQueue.entries()) {
                callback(records);
            }
            callQueue.clear();
        });

    return new Proxy(state, {
        get(_, property) {
            if (property === onChange) {
                return (callback, filter = null) => {
                    if (typeof callback !== 'function') {
                        throw new TypeError('Must provide a subscription callback');
                    }
                    subscribers.set(callback, filter === null ? null : String(filter));
                    return {
                        unsubscribe: () => subscribers.delete(callback)
                    };
                };
            }
            return state[property];
        },
        set(_, property, value) {
            const oldValue = state[property];
            if (oldValue !== value) {
                state[property] = value;
                broadcastChange(property, oldValue, value);
            }
            return true;
        },
        deleteProperty(_, property) {
            const exists = property in state;
            if (exists) {
                const oldValue = state[property];
                delete state[property];
                broadcastChange(property, oldValue, undefined);
            }
            return exists;
        }
    });
};

export const onChange = Symbol('onChange');

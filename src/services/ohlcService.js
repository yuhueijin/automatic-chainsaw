const { set, get, getAllByPrefix } = require('../configuration/redisClient')
const MAX_MINUTES = 15; // Store data for the last 15 minutes

// Key format: OHLC:<channel>:<date>
const getOHLCKey = (channel, date) => `OHLC:${channel}:${date}`;

function initializeOHLC(time) {
    return {
        open: null,
        high: Number.MIN_VALUE,
        low: Number.MAX_VALUE,
        close: null,
        date: convertTimestampToISO(time),
    };
}

function convertTimestampToISO(timestamp) {
    const date = new Date(timestamp);
    return date.toISOString().slice(0, 16) + ":00";
}

async function updateOHLC(channel, price, time) {
    const currentMinute = convertTimestampToISO(time);
    const key = getOHLCKey(channel, currentMinute);

    const cacheOHLC = await get(key);
    let currentOHLC = cacheOHLC;
    if (!currentOHLC) {
        currentOHLC = initializeOHLC(time);
        currentOHLC.open = price;
    }

    currentOHLC.close = price;
    currentOHLC.high = Math.max(currentOHLC.high, price);
    currentOHLC.low = Math.min(currentOHLC.low, price);
    set(key, currentOHLC, MAX_MINUTES);
}

async function getOHLC() {
    const result = await getAllByPrefix("OHLC:")
    return result.reduce((acc, obj) => {
        const channel = obj.key.split(':')[1];
        if (!acc.has(channel)) {
            acc.set(channel, []);
        }
        const data = acc.get(channel);
        data.push(obj.value);
        acc.set(channel, data);
        return acc;
    }, new Map());
}

module.exports = {
    updateOHLC,
    getOHLC
};
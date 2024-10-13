const { set, get, getAllByPrefix } = require('../configuration/redisClient')
const MAX_MINUTES = 15; // Store data for the last 15 minutes

// Key format: OHLC_<channel>_<date>
const getOHLCKey = (channel, date) => `OHLC:${channel}:${date}`;

// Function to initialize a new OHLC object
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
    const date = new Date(timestamp); // Convert timestamp to JavaScript Date object
    return date.toISOString().slice(0, 16) + ":00"; // Convert to ISO string and remove milliseconds
}

// Function to update OHLC data with a new price tick
async function updateOHLC(channel, price, time) {
    const currentMinute = convertTimestampToISO(time); // Convert timestamp to minutes
    const key = getOHLCKey(channel, currentMinute);

    const cacheOHLC = await get(key);
    let currentOHLC = cacheOHLC;
    if (!currentOHLC) {
        currentOHLC = initializeOHLC(time);
        currentOHLC.open = price;
    }

    // Update existing OHLC data
    currentOHLC.close = price;
    currentOHLC.high = Math.max(currentOHLC.high, price);
    currentOHLC.low = Math.min(currentOHLC.low, price);
    set(key, currentOHLC, MAX_MINUTES); // Update OHLC in Redis with TTL
}

async function getOHLC() {
    const result = await getAllByPrefix("OHLC:")
    console.log(result);
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
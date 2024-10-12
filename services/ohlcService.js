const ohlcData = new Map(); // Array to store the last 15 minutes of OHLC data
const MAX_MINUTES = 15; // Store data for the last 15 minutes

// Function to initialize a new OHLC object
function initializeOHLC(time) {
    return {
        open: null,
        high: null,
        low: null,
        close: null,
        date: convertTimestampToISO(time),
    };
}

function convertTimestampToISO(timestamp) {
    const date = new Date(timestamp); // Convert timestamp to JavaScript Date object
    return date.toISOString().slice(0, 16) + ":00"; // Convert to ISO string and remove milliseconds
}

// Function to update OHLC data with a new price tick
function updateOHLC(channel, price, time) {
    if (!ohlcData.has(channel)) {
        ohlcData.set(channel, []);
    }

    const currentMinute = convertTimestampToISO(time); // Convert timestamp to minutes

    const channelOhlcData = ohlcData.get(channel);
    let currentOHLC = channelOhlcData.find(ohlc => ohlc.date === currentMinute);

    // If the current minute's OHLC data doesn't exist, create a new one
    if (!currentOHLC) {
        if (channelOhlcData.length >= MAX_MINUTES) {
            channelOhlcData.shift(); // Remove the oldest minute's OHLC data to maintain 15-minute window
        }

        currentOHLC = initializeOHLC(time);
        currentOHLC.open = price;
        currentOHLC.high = price;
        currentOHLC.low = price;
        currentOHLC.close = price;

        channelOhlcData.push(currentOHLC); // Add the new OHLC data for the current minute
    } else {
        // Update the existing OHLC for the current minute
        currentOHLC.close = price;
        if (price > currentOHLC.high) currentOHLC.high = price;
        if (price < currentOHLC.low) currentOHLC.low = price;
    }
}

// Example function to print OHLC data (for testing)
function printOHLC() {
    console.log('Current OHLC data for the last 15 minutes:', ohlcData);
}


module.exports = {
    updateOHLC,
    printOHLC,
    ohlcData
};
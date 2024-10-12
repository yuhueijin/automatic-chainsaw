const WebSocket = require('ws');
const { updateOHLC, printOHLC, ohlcData } = require('../services/ohlcService')

// Create a Bitstamp WebSocket connection
const bitstampUrl = 'wss://ws.bitstamp.net';
const bitstampWs = new WebSocket(bitstampUrl);

// Store subscriptions and the WebSocket server instance
const subscriptions = new Set();

const channels = [
    "live_trades_btcusd", "live_trades_btceur", "live_trades_btcgbp"
    , "live_trades_gbpusd", "live_trades_eurusd", "live_trades_xrpusd"
    , "live_trades_xrpeur", "live_trades_xrpeur", "live_trades_xrpeur"
    , "live_trades_xrpeur"];

// When the Bitstamp WebSocket connection is established
bitstampWs.on('open', () => {
    console.log('Connected to Bitstamp WebSocket server');
});

// Handle incoming messages from the Bitstamp WebSocket
bitstampWs.on('message', (data) => {
    const message = JSON.parse(data);
    console.log('Received message from Bitstamp:', message);
    // Broadcast received messages to all subscribed clients
    broadcastToSubscribedClients(message);

    if (message.event === 'trade' && message.data) {
        const channel = message.channel;
        const price = parseFloat(message.data.price);
        const timestamp = message.data.microtimestamp / 1000; // Convert microtimestamp to milliseconds
        updateOHLC(channel, price, timestamp); // Update the 1-minute OHLC data
    }
});

// Handle errors from the Bitstamp WebSocket
bitstampWs.on('error', (error) => {
    console.error('Bitstamp WebSocket error:', error);
});

// Handle connection close for Bitstamp WebSocket
bitstampWs.on('close', () => {
    console.log('Disconnected from Bitstamp WebSocket server');
});

// Subscribe a client to a Bitstamp channel
function subscribe(client, channel) {
    if (subscriptions.has(client)) {
        client.send(`Already subscribed.`);
        return;
    }

    if (subscriptions.size == 0) {
        subscribeChannels();
    }

    subscriptions.add(client); // Initialize subscription set for the client
    client.send(`Subscribed.`);
}

function subscribeChannels() {
    channels.forEach((channel) => {
        const subscribeMessage = JSON.stringify({
            event: 'bts:subscribe',
            data: {
                channel: channel
            }
        });
        bitstampWs.send(subscribeMessage);
    })
}

// Unsubscribe a client from a Bitstamp channel
function unsubscribe(client) {
    if (!subscriptions.has(client)) {
        client.send(`Didn't subscribe.`);
        return;
    }

    subscriptions.delete(client);
    client.send(`Unsubscribed.`);

    if (subscriptions.size == 0) {
        unsubscribeChannels();
    }
}

function unsubscribeChannels() {
    channels.forEach((channel) => {
        const subscribeMessage = JSON.stringify({
            event: 'bts:unsubscribe',
            data: {
                channel: channel
            }
        });
        bitstampWs.send(subscribeMessage);
    })
}

// Broadcast received Bitstamp messages to all subscribed clients
function broadcastToSubscribedClients(message) {
    subscriptions.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}


// Unsubscribe a client from a Bitstamp channel
function sendOhlc(client) {
    subscriptions.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            ohlcData.forEach((data, channel) => {
                const message = JSON.stringify({
                    event: 'ohlc',
                    channel: channel,
                    data: {
                        ohlc: data
                    }
                });
                client.send(message);
            })
        }
    });
}

// Export functions to be used in the main server file
module.exports = {
    subscribe,
    unsubscribe,
    sendOhlc
};

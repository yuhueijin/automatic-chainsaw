const WebSocket = require('ws');
const { updateOHLC, getOHLC } = require('../services/ohlcService')

const channels = [
    "live_trades_btcusd", "live_trades_btceur", "live_trades_btcgbp"
    , "live_trades_gbpusd", "live_trades_eurusd", "live_trades_xrpusd"
    , "live_trades_xrpeur", "live_trades_xrpeur", "live_trades_xrpeur"
    , "live_trades_xrpeur"];
const bitstampUrl = 'wss://ws.bitstamp.net';
const bitstampWs = new WebSocket(bitstampUrl);
const subscriptions = new Set();

bitstampWs.on('open', () => {
    console.log('Connected to Bitstamp WebSocket server');
});

bitstampWs.on('message', (data) => {
    const message = JSON.parse(data);
    broadcastToSubscribedClients(message);

    if (message.event === 'trade' && message.data) {
        const channel = message.channel;
        const price = parseFloat(message.data.price);
        const timestamp = message.data.microtimestamp / 1000;
        updateOHLC(channel, price, timestamp);
    }
});

bitstampWs.on('error', (error) => {
    console.error('Bitstamp WebSocket error:', error);
});

bitstampWs.on('close', () => {
    console.log('Disconnected from Bitstamp WebSocket server');
});

function subscribe(client) {
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

function unsubscribe(client) {
    if (!subscriptions.has(client)) {
        client.send('Not subscribed.');
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

function broadcastToSubscribedClients(message) {
    subscriptions.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

async function sendOhlc(client) {
    if (client.readyState === WebSocket.OPEN) {
        const ohlcData = await getOHLC();
        if (!ohlcData) {
            return;
        }

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
}

module.exports = {
    subscribe,
    unsubscribe,
    sendOhlc
};

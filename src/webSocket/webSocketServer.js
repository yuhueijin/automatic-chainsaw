const WebSocket = require('ws');
const { subscribe, unsubscribe, sendOhlc } = require('./bitstampWs');

function initWebSocketServer() {
    const wss = new WebSocket.Server({ noServer: true });

    wss.on('connection', (ws) => {
        console.log('New client connected to /streaming');

        ws.send('Connected to /streaming WebSocket!');

        ws.on('message', (message) => {
            console.log(`Received from client: ${message}`);
            const parsedMessage = JSON.parse(message);
            if (parsedMessage.event === 'subscribe') {
                subscribe(ws);
            } else if (parsedMessage.event === 'unsubscribe') {
                unsubscribe(ws);
            } else if (parsedMessage.event === 'ohlc') {
                sendOhlc(ws);
            } else {
                ws.send(`Server echo: ${message}`);
            }
        });

        ws.on('close', () => {
            console.log('Client disconnected from /streaming');
        });
    });

    return wss;
}

const handleWebSocketUpgrade = (wss, request, socket, head) => {
    if (request.url === '/streaming') {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    } else {
        socket.destroy();
    }
};

module.exports = {
    initWebSocketServer,
    handleWebSocketUpgrade
};


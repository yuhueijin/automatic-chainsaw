const WebSocket = require('ws');
const { subscribe, unsubscribe, sendOhlc } = require('./bitstampWs'); // Import Bitstamp WebSocket functions

// Function to initialize WebSocket server
function initWebSocketServer() {
    const wss = new WebSocket.Server({ noServer: true });

    wss.on('connection', (ws) => {
        console.log('New client connected to /streaming');

        // Send a message to the connected client
        ws.send('Connected to /streaming WebSocket!');

        // Handle incoming messages from the client
        ws.on('message', (message) => {
            const parsedMessage = JSON.parse(message);
            if (parsedMessage.event === 'subscribe') {
                // Subscribe the client to the specified channel
                subscribe(ws);
            } else if (parsedMessage.event === 'unsubscribe') {
                // Unsubscribe the client from the specified channel
                unsubscribe(ws);
            } else if (parsedMessage.event === 'ohlc') {
                sendOhlc(ws);
            } else {
                console.log(`Received from client: ${message}`);
                // Echo the message back to the client
                ws.send(`Server echo: ${message}`);
            }
        });

        // Handle connection close
        ws.on('close', () => {
            console.log('Client disconnected from /streaming');
        });
    });

    return wss; // Return the WebSocket server instance if needed
}

const handleWebSocketUpgrade = (wss, request, socket, head) => {
    if (request.url === '/streaming') {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    } else {
        socket.destroy(); // Close connection for non-matching paths
    }
};

module.exports = {
    initWebSocketServer,
    handleWebSocketUpgrade
};


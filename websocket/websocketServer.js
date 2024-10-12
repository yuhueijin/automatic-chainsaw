const WebSocket = require('ws');
const { subscribe, unsubscribe, bitstampWs } = require('./bitstampWs'); // Import Bitstamp WebSocket functions

// Function to initialize WebSocket server
function initWebSocketServer(server) {
    const wss = new WebSocket.Server({ noServer:true });

    wss.on('connection', (ws) => {
        console.log('New client connected to /streaming');

        // Send a message to the connected client
        ws.send('Connected to /streaming WebSocket!');

        // Handle incoming messages from the client
        ws.on('message', (message) => {
            const parsedMessage = JSON.parse(message);
            if (parsedMessage.action === 'subscribe') {
                const channel = parsedMessage.channel;
                // Subscribe the client to the specified channel
                subscribe(ws, channel);
            } else if (parsedMessage.action === 'unsubscribe') {
                const channel = parsedMessage.channel;
                // Unsubscribe the client from the specified channel
                unsubscribe(ws, channel);
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

// Export the init function
module.exports = initWebSocketServer;

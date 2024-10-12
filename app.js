const express = require('express');
const logger = require('morgan');
const http = require('http');
const WebSocket = require('ws');

const dataRouter = require('./routes/data');
const userRateLimiter = require('./middleware/userRateLimiter');
const initWebSocketServer = require('./webSocket/webSocketServer');


const app = express();

// Create HTTP server using Express
const server = http.createServer(app);

// Initialize the WebSocket server instance, but don't immediately connect
const wss = initWebSocketServer();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Apply User ID rate limiter to /data route
app.use('/data', userRateLimiter);

app.use('/data', dataRouter);

// Handle WebSocket upgrades and route them based on the URL path
server.on('upgrade', (request, socket, head) => {
    // Only handle WebSocket connections for the `/streaming` path
    if (request.url === '/streaming') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      // If the path is not `/streaming`, destroy the socket
      socket.destroy();
    }
  });
  

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

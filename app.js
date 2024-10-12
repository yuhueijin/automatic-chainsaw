const express = require('express');
const logger = require('morgan');
const http = require('http');
const WebSocket = require('ws');

const dataRouter = require('./routes/data');
const userRateLimiter = require('./middleware/userRateLimiter');


const app = express();

// Create HTTP server using Express
const server = http.createServer(app);

// Initialize the WebSocket server instance, but don't immediately connect
const wss = new WebSocket.Server({ noServer: true});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Apply User ID rate limiter to /data route
app.use('/data', userRateLimiter);

app.use('/data', dataRouter);

// WebSocket connection handler for `/streaming`
wss.on('connection', (ws) => {
    console.log('New client connected to /streaming');
  
    // Send a message to the connected client
    ws.send('Connected to /streaming WebSocket!');
  
    // Handle incoming messages from the client
    ws.on('message', (message) => {
      console.log(`Received: ${message}`);
      // Echo the message back to the client
      ws.send(`Server echo: ${message}`);
    });
  
    // Handle connection close
    ws.on('close', () => {
      console.log('Client disconnected from /streaming');
    });
  });
  

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

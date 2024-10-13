const express = require('express');
const logger = require('morgan');
const http = require('http');

const dataRouter = require('./src/routes/data');
const userRateLimiter = require('./src/middleware/userRateLimiter');
const { initWebSocketServer, handleWebSocketUpgrade } = require('./src/webSocket/webSocketServer');

const app = express();
const server = http.createServer(app);
const wss = initWebSocketServer();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/data', userRateLimiter);

app.use('/data', dataRouter);

server.on('upgrade', (request, socket, head) => {
    handleWebSocketUpgrade(wss, request, socket, head);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

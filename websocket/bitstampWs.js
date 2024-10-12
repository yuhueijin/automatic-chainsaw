const WebSocket = require('ws');

// Create a Bitstamp WebSocket connection
const bitstampUrl = 'wss://ws.bitstamp.net';
const bitstampWs = new WebSocket(bitstampUrl);

// Store subscriptions and the WebSocket server instance
const subscriptions = new Map(); // Maps client connections to their subscribed channels

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
  if (!subscriptions.has(client)) {
    subscriptions.set(client, new Set()); // Initialize subscription set for the client
  }

  const clientSubscriptions = subscriptions.get(client);
  if (!clientSubscriptions.has(channel)) {
    clientSubscriptions.add(channel);
    const subscribeMessage = JSON.stringify({
      event: 'bts:subscribe',
      data: {
        channel: channel
      }
    });
    bitstampWs.send(subscribeMessage);
    client.send(`Subscribed to ${channel}`);
  } else {
    client.send(`Already subscribed to ${channel}`);
  }
}

// Unsubscribe a client from a Bitstamp channel
function unsubscribe(client, channel) {
  if (subscriptions.has(client)) {
    const clientSubscriptions = subscriptions.get(client);
    if (clientSubscriptions.has(channel)) {
      clientSubscriptions.delete(channel);
      client.send(`Unsubscribed from ${channel}`);
    } else {
      client.send(`Not subscribed to ${channel}`);
    }
  }
}

// Broadcast received Bitstamp messages to all subscribed clients
function broadcastToSubscribedClients(message) {
  subscriptions.forEach((clientSubscriptions, client) => {
    if (clientSubscriptions.has(message.channel) && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// Export functions to be used in the main server file
module.exports = {
  subscribe,
  unsubscribe,
  bitstampWs,
};

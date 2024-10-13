const { json } = require('express');
const { createClient } = require('redis');
const client = createClient();

// Connect to Redis
client.on('connect', () => {
    console.log('Connected to Redis');
});

// Handle Redis errors
client.on('error', (err) => {
    console.log('Redis error:', err);
});

client.connect();

// Function to set OHLC data with expiration (TTL)
function set(key, value, ttl) {
    client.set(key, JSON.stringify(value), { EX: ttl * 60 }); // Expires in 15 minutes
}

// Function to get OHLC data from Redis
async function get(key) {
    const value = await client.get(key);
    if (value) {
        return JSON.parse(value);
    }
    return value;
}

// Function to get all keys by prefix and their corresponding values
async function getAllByPrefix(prefix, callback) {
    const pattern = `${prefix}*`; // Pattern to match keys with the prefix
    let cursor = 0; // Redis scan cursor starts at '0'
    let keys = [];
    let scanResult;

    do {
        scanResult = await client.scan(cursor, { MATCH: pattern });
        cursor = scanResult.cursor;
        keys = keys.concat(scanResult.keys);
    } while (cursor !== 0);

    const values = await client.mGet(keys);
    return keys.map((key, index) => ({ key, value: JSON.parse(values[index]) }));
}

module.exports = {
    set,
    get,
    getAllByPrefix
};
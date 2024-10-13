const { createClient } = require('redis');

const client = createClient();

client.on('connect', () => {
    console.log('Connected to Redis');
});

client.on('error', (err) => {
    console.log('Redis error:', err);
});

client.connect();

function set(key, value, ttl) {
    client.set(key, JSON.stringify(value), { EX: ttl * 60 });
}

async function get(key) {
    const value = await client.get(key);
    if (value) {
        return JSON.parse(value);
    }
    return value;
}

async function getAllByPrefix(prefix, callback) {
    const pattern = `${prefix}*`;
    let cursor = 0;
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
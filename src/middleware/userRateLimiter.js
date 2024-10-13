const ipRequestStore = {};
const userRequestStore = {};

const cleanupRequestStore = (store, windowMs) => {
    const now = Date.now();
    for (const key in store) {
        if (store[key].lastRequestTime + windowMs < now) {
            delete store[key];
        }
    }
};

const userRateLimiter = (req, res, next) => {
    const ip = req.ip;
    const userId = req.query.user;
    const windowMs = 60 * 1000; // 1 minute
    const userMaxRequests = 5;
    const ipMaxRequests = 10;

    cleanupRequestStore(ipRequestStore, windowMs);
    cleanupRequestStore(userRequestStore, windowMs);

    if (userId) {
        if (!userRequestStore[userId]) {
            userRequestStore[userId] = { count: 1, lastRequestTime: Date.now() };
        } else {
            userRequestStore[userId].count++;
            userRequestStore[userId].lastRequestTime = Date.now();
        }
    }

    if (!ipRequestStore[ip]) {
        ipRequestStore[ip] = { count: 1, lastRequestTime: Date.now() };
    } else {
        ipRequestStore[ip].count++;
        ipRequestStore[ip].lastRequestTime = Date.now();
    }

    const userCount = userId ? userRequestStore[userId].count : 0;
    const ipCount = ipRequestStore[ip].count;

    if (userCount > userMaxRequests || ipCount > ipMaxRequests) {
        return res.status(429).json({ ip: ipCount, id: userCount });
    }

    next();
};

module.exports = userRateLimiter;

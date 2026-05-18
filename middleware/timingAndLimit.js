let ipCache = {};

const cacheResetTimer = setInterval(() => {
    ipCache = {};
}, 60000);

cacheResetTimer.unref();

const timingAndLimitMiddleware = (req, res, next) => {
    const start = process.hrtime();
    const ip = req.ip;

    ipCache[ip] = (ipCache[ip] || 0) + 1;
    if (ipCache[ip] > 50) {
        return res.status(429).json({ error: 'Too Many Requests' });
    }

    const originalSend = res.send;
    res.send = function (body) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            const diff = process.hrtime(start);
            const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(3);

            res.setHeader('X-Response-Time', `${timeInMs}ms`);
            req.responseTime = timeInMs;
        }

        return originalSend.call(this, body);
    };

    next();
};

module.exports = timingAndLimitMiddleware;

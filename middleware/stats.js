const statsEmitter = require('../events/statsEmitter');

const mask = (obj) => {
    if (!obj) return obj;

    const masked = { ...obj };
    ['password', 'token', 'email'].forEach((key) => {
        if (masked[key]) masked[key] = '***';
    });

    return masked;
};

const statsMiddleware = (req, res, next) => {
    res.on('finish', () => {
        const stats = {
            path: req.path,
            method: req.method,
            pathVariables: mask(req.params),
            queryString: mask(req.query),
            userAgent: req.get('User-Agent'),
            executionTime: req.responseTime ? `${req.responseTime}ms` : 'failed',
            timestamp: new Date().toISOString()
        };

        statsEmitter.emit('requestCompleted', stats);
    });

    next();
};

module.exports = statsMiddleware;

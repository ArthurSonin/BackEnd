describe('Project entry files', () => {
    afterEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        jest.dontMock('./app');
        jest.dontMock('./bin/www');
        jest.dontMock('mysql2');
        jest.dontMock('fs');
    });

    it('exports the Express app from JavaScript.js', () => {
        const app = { use: jest.fn() };

        jest.doMock('./app', () => app);

        expect(require('./JavaScript')).toBe(app);
    });

    it('starts the app from bin/www', () => {
        const app = { listen: jest.fn((port, callback) => callback()) };
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        jest.doMock('./app', () => app);

        require('./bin/www');

        expect(app.listen).toHaveBeenCalledWith(3000, expect.any(Function));
        expect(logSpy).toHaveBeenCalledWith('Server is running: http://localhost:3000/clients');
    });

    it('creates a MySQL connection pool', () => {
        const pool = { query: jest.fn() };
        const mysql = {
            createPool: jest.fn(() => pool)
        };

        jest.doMock('mysql2', () => mysql);

        expect(require('./db/connection')).toBe(pool);
        expect(mysql.createPool).toHaveBeenCalledWith(expect.objectContaining({
            host: 'localhost',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        }));
    });
});

describe('Stats emitter', () => {
    afterEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        jest.dontMock('fs');
    });

    it('adds request stats to an existing stats file', () => {
        const fs = {
            existsSync: jest.fn(() => true),
            readFileSync: jest.fn(() => '[{"path":"/old"}]'),
            writeFileSync: jest.fn()
        };
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        jest.doMock('fs', () => fs);

        const statsEmitter = require('./events/statsEmitter');
        statsEmitter.emit('requestCompleted', { path: '/clients' });

        expect(fs.writeFileSync).toHaveBeenCalledWith(
            expect.stringMatching(/stats\.json$/),
            JSON.stringify([{ path: '/old' }, { path: '/clients' }], null, 2)
        );
        expect(logSpy).toHaveBeenCalledWith('[Stats] Data saved for /clients');
    });

    it('starts a new stats file when the existing file is invalid', () => {
        const fs = {
            existsSync: jest.fn(() => true),
            readFileSync: jest.fn(() => 'not-json'),
            writeFileSync: jest.fn()
        };

        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.doMock('fs', () => fs);

        const statsEmitter = require('./events/statsEmitter');
        statsEmitter.emit('requestCompleted', { path: '/clients' });

        expect(fs.writeFileSync).toHaveBeenCalledWith(
            expect.stringMatching(/stats\.json$/),
            JSON.stringify([{ path: '/clients' }], null, 2)
        );
    });

    it('starts a new stats file when the stats file does not exist', () => {
        const fs = {
            existsSync: jest.fn(() => false),
            readFileSync: jest.fn(),
            writeFileSync: jest.fn()
        };

        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.doMock('fs', () => fs);

        const statsEmitter = require('./events/statsEmitter');
        statsEmitter.emit('requestCompleted', { path: '/clients' });

        expect(fs.readFileSync).not.toHaveBeenCalled();
        expect(fs.writeFileSync).toHaveBeenCalledWith(
            expect.stringMatching(/stats\.json$/),
            JSON.stringify([{ path: '/clients' }], null, 2)
        );
    });

    it('treats an empty stats file as an empty array', () => {
        const fs = {
            existsSync: jest.fn(() => true),
            readFileSync: jest.fn(() => ''),
            writeFileSync: jest.fn()
        };

        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.doMock('fs', () => fs);

        const statsEmitter = require('./events/statsEmitter');
        statsEmitter.emit('requestCompleted', { path: '/clients' });

        expect(fs.writeFileSync).toHaveBeenCalledWith(
            expect.stringMatching(/stats\.json$/),
            JSON.stringify([{ path: '/clients' }], null, 2)
        );
    });
});

describe('Middleware edge cases', () => {
    afterEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        jest.useRealTimers();
        jest.dontMock('./events/statsEmitter');
    });

    it('records failed execution time when responseTime is missing', () => {
        const statsEmitter = { emit: jest.fn() };
        const finishHandlers = {};
        const res = {
            on: jest.fn((event, handler) => {
                finishHandlers[event] = handler;
            })
        };
        const next = jest.fn();

        jest.doMock('./events/statsEmitter', () => statsEmitter);

        const statsMiddleware = require('./middleware/stats');
        statsMiddleware({
            path: '/broken',
            method: 'GET',
            params: undefined,
            query: undefined,
            get: jest.fn(() => undefined)
        }, res, next);

        finishHandlers.finish();

        expect(next).toHaveBeenCalled();
        expect(statsEmitter.emit).toHaveBeenCalledWith(
            'requestCompleted',
            expect.objectContaining({
                pathVariables: undefined,
                queryString: undefined,
                executionTime: 'failed'
            })
        );
    });

    it('masks password values in path variables', () => {
        const statsEmitter = { emit: jest.fn() };
        const finishHandlers = {};
        const res = {
            on: jest.fn((event, handler) => {
                finishHandlers[event] = handler;
            })
        };

        jest.doMock('./events/statsEmitter', () => statsEmitter);

        const statsMiddleware = require('./middleware/stats');
        statsMiddleware({
            path: '/clients/1',
            method: 'GET',
            params: { id: '1', password: 'secret' },
            query: {},
            get: jest.fn(() => 'jest')
        }, res, jest.fn());

        finishHandlers.finish();

        expect(statsEmitter.emit).toHaveBeenCalledWith(
            'requestCompleted',
            expect.objectContaining({
                pathVariables: { id: '1', password: '***' }
            })
        );
    });

    it('resets request counts on the interval timer', () => {
        jest.useFakeTimers();

        require('./middleware/timingAndLimit');
        jest.advanceTimersByTime(60000);

        expect(jest.getTimerCount()).toBe(1);
    });

    it('does not add response time headers for failed responses', () => {
        const timingAndLimitMiddleware = require('./middleware/timingAndLimit');
        const req = { ip: '198.51.100.10' };
        const res = {
            statusCode: 500,
            send: jest.fn(function (body) {
                return body;
            }),
            setHeader: jest.fn()
        };
        const next = jest.fn(() => {
            res.send('failed');
        });

        timingAndLimitMiddleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.setHeader).not.toHaveBeenCalled();
        expect(req.responseTime).toBeUndefined();
    });
});

const express = require('express');
const request = require('supertest');

jest.mock('./db/connection', () => ({
    query: jest.fn()
}));

jest.mock('./events/statsEmitter', () => ({
    emit: jest.fn()
}));

const db = require('./db/connection');
const statsEmitter = require('./events/statsEmitter');
const realApp = require('./app');
const clientsRouter = require('./routes/clients');

const createApp = () => {
    const app = express();

    app.use(express.json());
    app.use('/clients', clientsRouter);

    return app;
};

describe('Clients API', () => {
    let app;

    beforeEach(() => {
        app = createApp();
        db.query.mockReset();
        statsEmitter.emit.mockClear();
    });

    it('returns all clients', async () => {
        const clients = [
            {
                id: 1,
                full_name: 'Test Client',
                activity_type_id: 2,
                notes: 'Some notes',
                date_of_birth: '1990-01-01'
            }
        ];

        db.query.mockImplementation((sql, callback) => {
            callback(null, clients);
        });

        const res = await request(app).get('/clients');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(clients);
        expect(db.query).toHaveBeenCalledWith('SELECT * FROM clients', expect.any(Function));
    });

    it('returns 500 when getting clients fails', async () => {
        db.query.mockImplementation((sql, callback) => {
            callback(new Error('Database read failed'));
        });

        const res = await request(app).get('/clients');

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ error: 'Database read failed' });
    });

    it('creates a client', async () => {
        const newClient = {
            full_name: 'New Client',
            activity_type_id: 1,
            notes: 'Created from test',
            date_of_birth: '1995-05-15'
        };

        db.query.mockImplementation((sql, values, callback) => {
            callback(null, { insertId: 10 });
        });

        const res = await request(app)
            .post('/clients')
            .send(newClient);

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({ id: 10, status: 'Created' });
        expect(db.query).toHaveBeenCalledWith(
            'INSERT INTO clients (full_name, activity_type_id, notes, date_of_birth) VALUES (?, ?, ?, ?)',
            [
                newClient.full_name,
                newClient.activity_type_id,
                newClient.notes,
                newClient.date_of_birth
            ],
            expect.any(Function)
        );
    });

    it('returns 500 when creating a client fails', async () => {
        db.query.mockImplementation((sql, values, callback) => {
            callback(new Error('Database insert failed'));
        });

        const res = await request(app)
            .post('/clients')
            .send({
                full_name: 'Broken Client',
                activity_type_id: 1,
                notes: 'Should fail',
                date_of_birth: '1995-05-15'
            });

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ error: 'Database insert failed' });
    });

    it('deletes a client', async () => {
        db.query.mockImplementation((sql, values, callback) => {
            callback(null, { affectedRows: 1 });
        });

        const res = await request(app).delete('/clients/7');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: 'Client 7 deleted' });
        expect(db.query).toHaveBeenCalledWith(
            'DELETE FROM clients WHERE id = ?',
            ['7'],
            expect.any(Function)
        );
    });

    it('returns 404 when deleting a missing client', async () => {
        db.query.mockImplementation((sql, values, callback) => {
            callback(null, { affectedRows: 0 });
        });

        const res = await request(app).delete('/clients/999999');

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ message: 'Not Found' });
    });

    it('returns 500 when deleting a client fails', async () => {
        db.query.mockImplementation((sql, values, callback) => {
            callback(new Error('Database delete failed'));
        });

        const res = await request(app).delete('/clients/7');

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ error: 'Database delete failed' });
    });
});

describe('App middleware', () => {
    beforeEach(() => {
        db.query.mockReset();
        statsEmitter.emit.mockClear();
    });

    it('serves clients through the real app and records request stats', async () => {
        db.query.mockImplementation((sql, callback) => {
            callback(null, []);
        });

        const res = await request(realApp)
            .get('/clients?email=test@example.com&token=secret')
            .set('User-Agent', 'jest');

        expect(res.statusCode).toBe(200);
        expect(res.headers['x-response-time']).toMatch(/ms$/);
        expect(statsEmitter.emit).toHaveBeenCalledWith(
            'requestCompleted',
            expect.objectContaining({
                path: '/',
                method: 'GET',
                queryString: expect.objectContaining({
                    email: '***',
                    token: '***'
                }),
                userAgent: 'jest',
                executionTime: expect.stringMatching(/ms$/)
            })
        );
    });

    it('limits too many requests from one IP address', async () => {
        db.query.mockImplementation((sql, callback) => {
            callback(null, []);
        });

        let res;
        for (let i = 0; i < 51; i += 1) {
            res = await request(realApp).get('/clients');
        }

        expect(res.statusCode).toBe(429);
        expect(res.body).toEqual({ error: 'Too Many Requests' });
    });
});

const request = require('supertest');

jest.mock('./db/connection', () => jest.fn());

const mockSave = jest.fn();
const mockClient = jest.fn(function(data) {
    Object.assign(this, data);
    this.save = mockSave;
});

mockClient.find = jest.fn();
mockClient.findByIdAndDelete = jest.fn();

jest.mock('./db/client', () => mockClient);

const connectToDatabase = require('./db/connection');
const app = require('./app');
const Client = require('./db/client');

describe('API клієнтів', () => {
    beforeEach(() => {
        Client.mockClear();
        Client.find.mockReset();
        Client.findByIdAndDelete.mockReset();
        mockSave.mockReset();
    });

    test('підключає базу при створенні app', () => {
        expect(connectToDatabase).toHaveBeenCalledTimes(1);
    });

    describe('GET /clients', () => {
        test('повертає список клієнтів зі статусом 200', async () => {
            const clients = [
                { _id: '1', full_name: 'Іван Петренко' },
                { _id: '2', full_name: 'Олена Коваль' },
            ];
            Client.find.mockResolvedValue(clients);

            const res = await request(app).get('/clients');

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(clients);
            expect(Client.find).toHaveBeenCalledTimes(1);
        });

        test('повертає 500, якщо сталася помилка', async () => {
            Client.find.mockRejectedValue(new Error('DB error'));

            const res = await request(app).get('/clients');

            expect(res.statusCode).toBe(500);
            expect(res.body).toEqual({ error: 'DB error' });
        });
    });

    describe('POST /clients', () => {
        test('створює нового клієнта та повертає 201', async () => {
            const newClient = {
                full_name: 'Тестовий Клієнт',
                activity: 'TESTING',
            };
            mockSave.mockResolvedValue();

            const res = await request(app)
                .post('/clients')
                .send(newClient);

            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual(newClient);
            expect(Client).toHaveBeenCalledWith(newClient);
            expect(mockSave).toHaveBeenCalledTimes(1);
        });

        test('повертає 400, якщо клієнт не зберігся', async () => {
            mockSave.mockRejectedValue(new Error('Validation failed'));

            const res = await request(app)
                .post('/clients')
                .send({ full_name: 'Bad client' });

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'Validation failed' });
        });
    });

    describe('DELETE /clients/:id', () => {
        test('видаляє клієнта та повертає 200', async () => {
            Client.findByIdAndDelete.mockResolvedValue({ _id: 'client-id' });

            const res = await request(app).delete('/clients/client-id');

            expect(res.statusCode).toBe(200);
            expect(res.text).toBe('Клієнта видалено успішно');
            expect(Client.findByIdAndDelete).toHaveBeenCalledWith('client-id');
        });

        test('повертає 404, якщо клієнта не знайдено', async () => {
            Client.findByIdAndDelete.mockResolvedValue(null);

            const res = await request(app).delete('/clients/missing-id');

            expect(res.statusCode).toBe(404);
            expect(res.text).toBe('Клієнта не знайдено');
        });

        test('повертає 500, якщо видалення впало з помилкою', async () => {
            Client.findByIdAndDelete.mockRejectedValue(new Error('Delete failed'));

            const res = await request(app).delete('/clients/broken-id');

            expect(res.statusCode).toBe(500);
            expect(res.text).toBe('Delete failed');
        });
    });
});

describe('middleware логування видалення', () => {
    let preHandler;
    let DeletionLog;
    let consoleErrorSpy;
    let consoleLogSpy;

    beforeEach(() => {
        jest.resetModules();
        preHandler = undefined;
        DeletionLog = { create: jest.fn() };
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        jest.doMock('./events/deletionLog', () => DeletionLog);
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        consoleLogSpy.mockRestore();
        jest.dontMock('./events/deletionLog');
        delete process.env.NODE_ENV;
    });

    test('створює запис у логах перед видаленням', async () => {
        const attachDeletionLogger = require('./middleware/deletionLogger');
        const schema = {
            pre: jest.fn((eventName, handler) => {
                preHandler = handler;
            }),
        };
        DeletionLog.create.mockResolvedValue();

        attachDeletionLogger(schema);
        await preHandler.call({
            getQuery: () => ({ _id: '507f1f77bcf86cd799439011' }),
        });

        expect(schema.pre).toHaveBeenCalledWith('findOneAndDelete', expect.any(Function));
        expect(DeletionLog.create).toHaveBeenCalledWith({
            deletedId: '507f1f77bcf86cd799439011',
            documentType: 'Client',
        });
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    test('пише повідомлення в консоль не в test режимі', async () => {
        process.env.NODE_ENV = 'development';
        const attachDeletionLogger = require('./middleware/deletionLogger');
        const schema = {
            pre: jest.fn((eventName, handler) => {
                preHandler = handler;
            }),
        };
        DeletionLog.create.mockResolvedValue();

        attachDeletionLogger(schema);
        await preHandler.call({
            getQuery: () => ({ _id: '507f1f77bcf86cd799439011' }),
        });

        expect(consoleLogSpy).toHaveBeenCalledWith(
            'Middleware: Запис про видалення ID 507f1f77bcf86cd799439011 збережено',
        );
    });

    test('не зупиняє видалення, якщо логування впало', async () => {
        const attachDeletionLogger = require('./middleware/deletionLogger');
        const schema = {
            pre: jest.fn((eventName, handler) => {
                preHandler = handler;
            }),
        };
        const error = new Error('Log failed');
        DeletionLog.create.mockRejectedValue(error);

        attachDeletionLogger(schema);
        await expect(preHandler.call({
            getQuery: () => ({ _id: '507f1f77bcf86cd799439011' }),
        })).resolves.toBeUndefined();

        expect(consoleErrorSpy).toHaveBeenCalledWith('Помилка в Middleware:', error);
    });
});

describe('підключення до бази', () => {
    let consoleLogSpy;
    let consoleErrorSpy;

    beforeEach(() => {
        jest.resetModules();
        jest.dontMock('./db/connection');
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
        jest.dontMock('mongoose');
        delete process.env.NODE_ENV;
    });

    test('не підключається повторно, якщо зʼєднання вже активне', () => {
        const asPromise = jest.fn().mockResolvedValue('connected');
        const mongooseMock = {
            connection: {
                readyState: 1,
                asPromise,
            },
            connect: jest.fn(),
        };
        jest.doMock('mongoose', () => mongooseMock);

        const connectToDatabase = require('./db/connection');
        const result = connectToDatabase();

        expect(result).resolves.toBe('connected');
        expect(asPromise).toHaveBeenCalledTimes(1);
        expect(mongooseMock.connect).not.toHaveBeenCalled();
    });

    test('підключається до MongoDB і пише повідомлення не в test режимі', async () => {
        process.env.NODE_ENV = 'development';
        const mongooseMock = {
            connection: {
                readyState: 0,
                asPromise: jest.fn(),
            },
            connect: jest.fn().mockResolvedValue(),
        };
        jest.doMock('mongoose', () => mongooseMock);

        const connectToDatabase = require('./db/connection');
        await connectToDatabase();

        expect(mongooseMock.connect).toHaveBeenCalledTimes(1);
        expect(consoleLogSpy).toHaveBeenCalledWith('УСПІХ! База підключена');
    });

    test('не пише повідомлення про успіх у test режимі', async () => {
        process.env.NODE_ENV = 'test';
        const mongooseMock = {
            connection: {
                readyState: 0,
                asPromise: jest.fn(),
            },
            connect: jest.fn().mockResolvedValue(),
        };
        jest.doMock('mongoose', () => mongooseMock);

        const connectToDatabase = require('./db/connection');
        await connectToDatabase();

        expect(mongooseMock.connect).toHaveBeenCalledTimes(1);
        expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    test('показує помилку, якщо MongoDB не підключилась', async () => {
        const mongooseMock = {
            connection: {
                readyState: 0,
                asPromise: jest.fn(),
            },
            connect: jest.fn().mockRejectedValue(new Error('Atlas blocked')),
        };
        jest.doMock('mongoose', () => mongooseMock);

        const connectToDatabase = require('./db/connection');
        await connectToDatabase();

        expect(consoleErrorSpy).toHaveBeenCalledWith('Помилка:', 'Atlas blocked');
    });
});

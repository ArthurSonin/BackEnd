const express = require('express');

const clientsRouter = require('./routes/clients');
const timingAndLimitMiddleware = require('./middleware/timingAndLimit');
const statsMiddleware = require('./middleware/stats');

const app = express();

app.use(express.json());
app.use(timingAndLimitMiddleware);
app.use(statsMiddleware);

app.use('/clients', clientsRouter);

module.exports = app;

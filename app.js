const express = require('express');
const connectToDatabase = require('./db/connection');
const clientsRouter = require('./routes/clients');

const app = express();

app.use(express.json());
app.use('/clients', clientsRouter);

connectToDatabase();

module.exports = app;

const mongoose = require('mongoose');
const attachDeletionLogger = require('../middleware/deletionLogger');

const clientSchema = new mongoose.Schema({}, { strict: false });

attachDeletionLogger(clientSchema);

const Client = mongoose.models.Client || mongoose.model('Client', clientSchema, 'clients');

module.exports = Client;

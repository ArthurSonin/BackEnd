const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    deletedId: mongoose.Schema.Types.ObjectId,
    documentType: { type: String, default: 'Client' },
    time: { type: Date, default: Date.now },
});

const DeletionLog = mongoose.models.DeletionLog || mongoose.model('DeletionLog', logSchema, 'deletionlogs');

module.exports = DeletionLog;

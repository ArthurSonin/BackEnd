const DeletionLog = require('../events/deletionLog');

function attachDeletionLogger(schema) {
    schema.pre('findOneAndDelete', async function() {
        const docId = this.getQuery()._id;

        try {
            await DeletionLog.create({
                deletedId: docId,
                documentType: 'Client',
            });

            if (process.env.NODE_ENV !== 'test') {
                console.log(`Middleware: Запис про видалення ID ${docId} збережено`);
            }
        } catch (err) {
            console.error('Помилка в Middleware:', err);
        }
    });
}

module.exports = attachDeletionLogger;

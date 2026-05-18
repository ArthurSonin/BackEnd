const app = require('./app');

function startServer(port = 3001) {
    return app.listen(port, () => {
        console.log(`Сервер: http://localhost:${port}`);
        console.log(`Список клієнтів (GET): http://localhost:${port}/clients`);
    });
}

/* istanbul ignore next */
if (require.main === module) {
    startServer();
}

module.exports = app;
module.exports.startServer = startServer;

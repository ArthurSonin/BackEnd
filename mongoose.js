const app = require('./app');

if (require.main === module) {
    const PORT = 3001;

    app.listen(PORT, () => {
        console.log(`Сервер: http://localhost:${PORT}`);
        console.log(`Список клієнтів (GET): http://localhost:${PORT}/clients`);
    });
}

module.exports = app;

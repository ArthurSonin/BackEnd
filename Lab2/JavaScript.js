const http = require('http');
const fs = require('fs');
const split2 = require('split2');
const through2 = require('through2');

// --- ДОПОМІЖНА ФУНКЦІЯ ДЛЯ КУКІ ---
const parseCookies = (cookieHeader) => {
    const list = {};
    if (!cookieHeader) return list;
    cookieHeader.split(';').forEach(cookie => {
        let [name, ...rest] = cookie.split('=');
        name = name?.trim();
        if (!name) return;
        list[name] = decodeURIComponent(rest.join('=').trim());
    });
    return list;
};

// --- ГОЛОВНИЙ СЕРВЕР ---
const server = http.createServer((req, res) => {
    // Встановлюємо загальний заголовок JSON для всіх відповідей
    res.setHeader('Content-Type', 'application/json');

    if (req.url === '/task1') {
        // ==========================================
        // ЗАВДАННЯ №1: ПЕРЕВІРКА COOKIE "user_info"
        // ==========================================
        const cookies = parseCookies(req.headers.cookie);
        
        if (cookies['user_info'] === 'user1') {
            res.end(JSON.stringify({
                id: 1,
                firstName: "Leanne",
                lastName: "Graham"
            }));
        } else {
            res.end(JSON.stringify({}));
        }

    } else if (req.url === '/task2') {
        // ============================================================
        // ЗАВДАННЯ №2: ЧИТАННЯ CSV (fs, split2, through2) ТА КОНВЕРТАЦІЯ
        // ============================================================
        const results = [];
        let headers = [];

        // Перевіряємо чи існує файл перед читанням
        if (!fs.existsSync('data.csv')) {
            res.statusCode = 404;
            return res.end(JSON.stringify({ error: "Файл data.csv не знайдено!" }));
        }

        fs.createReadStream('data.csv')
            .pipe(split2()) // Розбиваємо потік на рядки
            .pipe(through2(function (chunk, enc, callback) {
                const line = chunk.toString().trim();
                if (!line) return callback();

                const values = line.split(',');

                if (headers.length === 0) {
                    headers = values.map(h => h.trim()); // Зберігаємо назви колонок
                } else {
                    const obj = {};
                    headers.forEach((header, index) => {
                        obj[header] = values[index]?.trim();
                    });
                    results.push(obj);
                }
                callback();
            }))
            .on('finish', () => {
                res.end(JSON.stringify(results, null, 2));
            })
            .on('error', () => {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: "Помилка при читанні файлу" }));
            });

    } else {
        // ГОЛОВНА СТОРІНКА (якщо шлях не вказано)
        res.end(JSON.stringify({
            message: "Виберіть завдання",
            links: {
                task1: "http://localhost:3000/task1",
                task2: "http://localhost:3000/task2"
            }
        }));
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`\x1b[32m%s\x1b[0m`, `Сервер успішно запущено!`);
    console.log(`Завдання 1 (Cookies): http://localhost:${PORT}/task1`);
    console.log(`Завдання 2 (CSV):     http://localhost:${PORT}/task2`);
});
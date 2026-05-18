/**
 * ЗАВДАННЯ 11: Promise.allSettled()
 * 
 * Promise.allSettled() чекає на завершення ВСІХ промісів,
 * незалежно від того, виконалися вони успішно чи з помилкою
 */


// ==================== ЗАВДАННЯ 11.3 ====================
/**
 * Завантажити дані з кількох API
 * Використати успішні результати, логувати помилки
 */

function fetchAPI(url) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (url.includes('broken')) {
                reject(new Error(`API ${url} is down`));
            } else {
                resolve({ url, data: `Data from ${url}` });
            }
        }, Math.random() * 300);
    });
}

/**
 * @param {string[]} urls 
 * @returns {Promise<{successful: object[], failed: Error[]}>}
 */
async function fetchMultipleAPIs(urls) {
    // TODO: Завантажте дані з усіх URL
    // Поверніть успішні результати та логи помилок
    // 1. Запускаємо всі запити одночасно
    const promises = urls.map(url => fetchAPI(url));
    
    // 2. Чекаємо на завершення ВСІХ промісів (і успішних, і помилкових)
    const results = await Promise.allSettled(promises);

    // 3. Створюємо об'єкт для накопичення результатів
    const summary = {
        successful: [],
        failed: []
    };

    // 4. Проходимо по результатах та розділяємо їх за статусом
    results.forEach(result => {
        if (result.status === 'fulfilled') {
            // Успішний результат знаходиться в полі value
            summary.successful.push(result.value);
        } else {
            // Помилка знаходиться в полі reason
            summary.failed.push(result.reason);
        }
    });

    return summary;
}

// Перевірка:
const apis = [
    'https://api1.com/data',
    'https://api2-broken.com/data',
    'https://api3.com/data',
    'https://api4-broken.com/data',
    'https://api5.com/data'
];

fetchMultipleAPIs(apis)
    .then(result => {
        console.log(' Тест 11.3:');
        console.log('  Successful:', result.successful.length);
        console.log('  Failed:', result.failed.length);
    });


// ==================== ЗАВДАННЯ 11.4 ====================
/**
 * Створіть систему моніторингу здоров'я серверів
 * Перевірте всі сервери і створіть звіт про їх статус
 */

function checkServerHealth(serverName, delay, shouldFail) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (shouldFail) {
                reject(new Error(`${serverName} is down`));
            } else {
                resolve({
                    server: serverName,
                    status: 'healthy',
                    responseTime: delay
                });
            }
        }, delay);
    });
}

/**
 * @returns {Promise<{healthy: object[], unhealthy: object[], totalServers: number}>}
 */
async function monitorServers() {
    const servers = [
        { name: 'Server A', delay: 100, shouldFail: false },
        { name: 'Server B', delay: 300, shouldFail: true },
        { name: 'Server C', delay: 150, shouldFail: false },
        { name: 'Server D', delay: 500, shouldFail: true },
        { name: 'Server E', delay: 200, shouldFail: false }
    ];

    // TODO: Перевірте всі сервери
    // Поверніть детальний звіт про стан кожного
    // 1. Створюємо масив промісів для кожного сервера
    const checks = servers.map(s => checkServerHealth(s.name, s.delay, s.shouldFail));

    // 2. Чекаємо на завершення всіх перевірок
    const results = await Promise.allSettled(checks);

    // 3. Формуємо звіт
    const report = {
        healthy: [],
        unhealthy: [],
        totalServers: servers.length
    };

    // 4. Розподіляємо результати
    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            // Якщо проміс виконано успішно — сервер здоровий
            report.healthy.push(result.value);
        } else {
            // Якщо проміс відхилено — додаємо в список проблемних
            report.unhealthy.push({
                server: servers[index].name,
                error: result.reason.message
            });
        }
    });

    return report;
}

// Перевірка:
monitorServers()
    .then(report => {
        console.log(' Тест 11.4: Server Health Report');
        console.log('  Healthy:', report.healthy.length);
        console.log('  Unhealthy:', report.unhealthy.length);
        console.log('  Total:', report.totalServers);
    });



// ==================== БОНУСНЕ ЗАВДАННЯ 11.6 ====================
/**
 * Створіть систему graceful degradation
 * Якщо основний сервіс недоступний - використайте запасний
 * Якщо і він недоступний - використайте кеш
 * Поверніть звіт про те, звідки отримали дані
 */

const cache = new Map([
    ['user:1', { id: 1, name: 'Cached User', source: 'cache' }]
]);

function fetchFromPrimary(id) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() > 0.6) {
                reject(new Error('Primary service down'));
            } else {
                resolve({ id, name: 'Primary User', source: 'primary' });
            }
        }, 100);
    });
}

function fetchFromBackup(id) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() > 0.5) {
                reject(new Error('Backup service down'));
            } else {
                resolve({ id, name: 'Backup User', source: 'backup' });
            }
        }, 200);
    });
}

/**
 * Спробуйте отримати дані з трьох джерел одночасно
 * Використайте перше успішне
 * Якщо всі недоступні - поверніть помилку
 * 
 * @param {number} userId 
 * @returns {Promise<{data: object, source: string, attemptedSources: string[]}>}
 */
async function fetchWithFallback(userId) {
    // TODO: Реалізуйте graceful degradation
    // Підказка: Promise.allSettled() + логіка вибору першого успішного
    const cacheKey = `user:${userId}`;
    
    // 1. Створюємо проміс для кешу (синхронний кеш завертаємо в Promise.resolve)
    const fetchFromCache = cache.has(cacheKey) 
        ? Promise.resolve(cache.get(cacheKey))
        : Promise.reject(new Error('Not in cache'));

    // 2. Запускаємо всі запити паралельно
    const sources = [
        { name: 'primary', promise: fetchFromPrimary(userId) },
        { name: 'backup', promise: fetchFromBackup(userId) },
        { name: 'cache', promise: fetchFromCache }
    ];

    const results = await Promise.allSettled(sources.map(s => s.promise));

    // 3. Шукаємо перший успішний результат згідно з чергою у масиві sources
    for (let i = 0; i < results.length; i++) {
        if (results[i].status === 'fulfilled') {
            return {
                data: results[i].value,
                source: sources[i].name,
                attemptedSources: sources.map(s => s.name)
            };
        }
    }

    // 4. Якщо жодне джерело не спрацювало
    throw new Error('All data sources are unavailable');
}

// Перевірка:
 fetchWithFallback(1)
     .then(result => {
         console.log(' Тест 11.6:', result);
     });


/**
 * ПИТАННЯ ДЛЯ САМОПЕРЕВІРКИ:
 * 
 * 1. Яка різниця між Promise.all() та Promise.allSettled()?
 * 2. Коли краще використовувати Promise.allSettled()?
 * 3. Який формат результату у Promise.allSettled()?
 * 4. Чи може Promise.allSettled() кинути помилку?
 * 5. Як обробити результати Promise.allSettled()?
 * 6. Чи виконуються всі проміси до кінця?
 */

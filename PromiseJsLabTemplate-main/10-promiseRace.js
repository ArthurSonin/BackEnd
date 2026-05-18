/**
 * ЗАВДАННЯ 10: Promise.race()
 * 
 * Promise.race() повертає проміс, який виконується або відхиляється
 * як тільки один з промісів у масиві виконується або відхиляється
 */

// ==================== ЗАВДАННЯ 10.1 ====================
/**
 * Створіть функцію, яка повертає найшвидшу відповідь
 * 
 * @param {number[]} delays - Масив затримок в мілісекундах
 * @returns {Promise<number>} - Найменша затримка
 */
function getFastestResponse(delays) {
    // TODO: Створіть масив промісів з різними затримками
    // Кожен проміс резолвиться зі своєю затримкою
    // Використайте Promise.race() щоб отримати найшвидшу відповідь
    // 1. Створюємо масив промісів на основі масиву затримок
    const promises = delays.map(delay => {
        return new Promise(resolve => {
            // Кожен проміс резолвиться через свій час delay
            setTimeout(() => resolve(delay), delay);
        });
    });

    // 2. Використовуємо Promise.race(), щоб отримати результат найшвидшого
    return Promise.race(promises);
}

// Перевірка:
getFastestResponse([1000, 500, 2000, 300])
    .then(result => console.log(' Тест 10.1:', result)); // 300

// ==================== ЗАВДАННЯ 10.3 ====================
/**
 * Симуляція запитів до різних серверів
 * Поверніть відповідь від найшвидшого сервера
 */

function fetchFromServer(serverName, delay) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                server: serverName,
                data: `Data from ${serverName}`,
                responseTime: delay
            });
        }, delay);
    });
}

/**
 * Отримайте дані від найшвидшого сервера
 * 
 * @returns {Promise<{server: string, data: string, responseTime: number}>}
 */
function fetchFromFastestServer() {
    // TODO: Створіть запити до трьох серверів з різними затримками
    // Server A: 1000ms, Server B: 500ms, Server C: 800ms
    // Поверніть результат від найшвидшого
    // 1. Створюємо масив запитів до серверів із вказаними затримками
    const serverA = fetchFromServer('Server A', 1000);
    const serverB = fetchFromServer('Server B', 500);
    const serverC = fetchFromServer('Server C', 800);

    // 2. Запускаємо перегони між серверами
    // Результатом буде об'єкт від того сервера, чий delay найменший
    return Promise.race([serverA, serverB, serverC]);
}

// Перевірка:
fetchFromFastestServer()
    .then(result => console.log(' Тест 10.3:', result));
// Очікується: { server: 'Server B', data: 'Data from Server B', responseTime: 500 }


// ==================== ЗАВДАННЯ 10.4 ====================
/**
 * Створіть функцію, яка конкурує кілька джерел даних
 * і повертає першу успішну відповідь
 * Але якщо всі джерела падають - reject
 */

function unreliableSource(name, delay, shouldFail) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (shouldFail) {
                reject(new Error(`${name} failed`));
            } else {
                resolve({ source: name, data: 'Success!' });
            }
        }, delay);
    });
}

/**
 * Спробуйте отримати дані з кількох джерел
 * Поверніть перше успішне
 * 
 * @returns {Promise<{source: string, data: string}>}
 */
function getDataFromAnySource() {
    // TODO: Створіть 3 джерела:
    // Source A: delay 300, fails
    // Source B: delay 500, succeeds
    // Source C: delay 200, fails
    // Використайте Promise.race() але обробіть помилки так,
    // щоб продовжити чекати на інші джерела
    // 1. Створюємо джерела згідно з умовами
    const sourceA = unreliableSource('Source A', 300, true);
    const sourceB = unreliableSource('Source B', 500, false);
    const sourceC = unreliableSource('Source C', 200, true);

    /**
     * Щоб Promise.race не зупинився на першій помилці (Source C),
     * ми можемо використати Promise.any().
     * Promise.any() чекає на перший УСПІШНИЙ проміс.
     * Якщо всі впадуть — він викине AggregateError.
     */
    return Promise.any([sourceA, sourceB, sourceC]);
}

// Перевірка:
getDataFromAnySource()
    .then(result => console.log(' Тест 10.4:', result));
// Очікується: { source: 'Source B', data: 'Success!' }



// ==================== БОНУСНЕ ЗАВДАННЯ 10.7 ====================
/**
 * Створіть "розумний" race, який ігнорує помилки
 * і чекає на першу успішну відповідь
 * 
 * @param {Promise[]} promises 
 * @returns {Promise}
 */
function raceSuccess(promises) {
    // TODO: Модифікуйте Promise.race() щоб він чекав на першу успішну відповідь
    // і ігнорував помилки, доки хоча б один проміс не виконається успішно
    // Якщо всі проміси падають - reject з масивом всіх помилок
    return Promise.any(promises);
}

// Перевірка:
const testPromises = [
    Promise.reject(new Error('Error 1')),
    Promise.reject(new Error('Error 2')),
    new Promise(resolve => setTimeout(() => resolve('Success!'), 500)),
    Promise.reject(new Error('Error 3'))
];

raceSuccess(testPromises)
    .then(result => console.log(' Тест 10.7:', result)); // 'Success!'


/**
 * ПИТАННЯ ДЛЯ САМОПЕРЕВІРКИ:
 * 
 * 1. Що поверне Promise.race([]) з пустим масивом?
 * 2. Чи продовжують виконуватися інші проміси після того, як один виконався?
 * 3. Як Promise.race() обробляє reject?
 * 4. Яка різниця між Promise.race() та Promise.any()?
 * 5. Чи можна використовувати Promise.race() для таймаутів?
 * 6. Що станеться якщо передати в Promise.race() не-проміси?
 */

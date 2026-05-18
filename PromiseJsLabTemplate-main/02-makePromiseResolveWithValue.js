/**
 * ЗАВДАННЯ 2: Promise.resolve() та статичні методи
 * 
 * Promise.resolve() - швидкий спосіб створити успішний проміс
 */


// ==================== ЗАВДАННЯ 2.2 ====================
/**
 * Створіть функцію, яка приймає масив чисел
 * і повертає проміс з сумою цих чисел
 * 
 * @param {number[]} numbers 
 * @returns {Promise<number>}
 */
function sumNumbers(numbers) {
    // TODO: Порахуйте суму та поверніть її через Promise.resolve()
    const sum = numbers.reduce((acc, curr) => acc + curr, 0);
    return Promise.resolve(sum);
}

// Перевірка:
sumNumbers([1, 2, 3, 4, 5])
    .then(sum => console.log(' Тест 2.2:', sum)); // Очікується: 15


// ==================== ЗАВДАННЯ 2.3 ====================
/**
 * Створіть функцію, яка конвертує об'єкт користувача
 * додаючи йому поле fullName
 * 
 * @param {{firstName: string, lastName: string}} user 
 * @returns {Promise<{firstName: string, lastName: string, fullName: string}>}
 */
function addFullName(user) {
    // TODO: Додайте поле fullName і поверніть через проміс
    // fullName = firstName + ' ' + lastName
    const fullName = `${user.firstName} ${user.lastName}`;
    return Promise.resolve({ ...user, fullName });
}

// Перевірка:
addFullName({ firstName: 'John', lastName: 'Doe' })
    .then(user => console.log(' Тест 2.3:', user));
// Очікується: { firstName: 'John', lastName: 'Doe', fullName: 'John Doe' }

// ==================== ЗАВДАННЯ 2.6 ====================
/**
 * Створіть функцію, яка конвертує масив значень в масив промісів
 * Кожен проміс має резолвитися з відповідним значенням
 * 
 * @param {any[]} values 
 * @returns {Promise<any>[]}
 */
function valuesToPromises(values) {
    // TODO: Конвертуйте кожне значення в проміс
    return values.map(value => Promise.resolve(value));
}

// Перевірка:
const promises = valuesToPromises([1, 2, 3]);
Promise.all(promises)
    .then(results => console.log(' Тест 2.6:', results));
// Очікується: [1, 2, 3]

/**
 * ПИТАННЯ ДЛЯ САМОПЕРЕВІРКИ:
 * 
 * 1. Яка різниця між new Promise(resolve => resolve(value)) та Promise.resolve(value)?
 * 2. Що поверне Promise.resolve(Promise.resolve(5))?
 * 3. Чи можна передати проміс в Promise.resolve()?
 * 4. Чи є Promise.resolve() синхронним чи асинхронним?
 * 5. Коли краще використовувати Promise.resolve() замість конструктора?
 */

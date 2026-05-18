/**
 * ЗАВДАННЯ 1: Створення промісів з конструктором
 * 
 * Проміси можуть бути у трьох станах: pending, fulfilled, rejected
 * Ви повинні навчитися створювати проміси вручну
 */

// ==================== ЗАВДАННЯ 1.2 ====================
/**
 * Створіть проміс, який резолвиться з числом після перевірки
 * Якщо число парне - resolve, якщо непарне - reject
 * 
 * @param {number} number 
 * @returns {Promise<number, string>}
 */
function checkEvenNumber(number) {
                           // TODO: Реалізуйте функцію
                           // Підказка: використовуйте number % 2 === 0
    // Створюємо новий проміс через конструктор
  return new Promise((resolve, reject) => {
        if (number % 2 === 0) {
            resolve(number);
        } else {
            reject(`Число ${number} є непарним`);
        }
    });
}

// Перевірка:
checkEvenNumber(4)
    .then(num => console.log(' Тест 1.2 (парне):', num))
    .catch(err => console.log('   Помилка:', err));

checkEvenNumber(5)
    .then(num => console.log('   Не повинно виконатися'))
    .catch(err => console.log(' Тест 1.2 (непарне):', err));


// ==================== ЗАВДАННЯ 1.3 ====================
/**
 * Створіть проміс з валідацією email
 * Якщо email містить @ та . - resolve з email
 * Інакше - reject з повідомленням про помилку
 * 
 * @param {string} email 
 * @returns {Promise<string, string>}
 */
function validateEmail(email) {
                            // TODO: Реалізуйте функцію
                            // Підказка: використовуйте includes('@') та includes('.')
    return new Promise((resolve, reject) => {
        if (email.includes('@') && email.includes('.')) {
            resolve(email);
        } else {
            reject('Помилка: Невалідний формат email');
        }
    });
}

// Перевірка:
validateEmail('test@example.com')
    .then(email => console.log(' Тест 1.3 (валідний):', email))
    .catch(err => console.log('   Помилка:', err));

validateEmail('invalid-email')
    .then(email => console.log('   Не повинно виконатися'))
    .catch(err => console.log(' Тест 1.3 (невалідний):', err));

// ==================== ЗАВДАННЯ 1.5 ====================
/**
 * Створіть функцію, яка перевіряє вік користувача
 * - age < 0: reject 'Invalid age'
 * - age < 18: reject 'Too young'
 * - age >= 18 та age < 65: resolve {age, category: 'adult'}
 * - age >= 65: resolve {age, category: 'senior'}
 * 
 * @param {number} age 
 * @returns {Promise<{age: number, category: string}, string>}
 */
function checkAge(age) {
                            // TODO: Реалізуйте функцію
    return new Promise((resolve, reject) => {
        if (age < 0) {
            reject('Некоректний вік');
        } else if (age < 18) {
            reject('Занадто молодий');
        } else if (age >= 18 && age < 65) {
            resolve({ age: age, category: 'дорослий' });
        } else {
            resolve({ age: age, category: 'пенсіонер' });
        }
    });
}

// Перевірка (розкоментуйте після реалізації):
 checkAge(25).then(console.log).catch(console.error);
 checkAge(70).then(console.log).catch(console.error);
 checkAge(15).then(console.log).catch(console.error);
 checkAge(-5).then(console.log).catch(console.error);


/**
 * ПИТАННЯ ДЛЯ САМОПЕРЕВІРКИ:
 * 
 * 1. Що таке executor function в Promise конструкторі?
 * 2. Чи можна викликати resolve/reject більше одного разу?
 * 3. Що станеться якщо викликати і resolve, і reject?
 * 4. Чи виконується код після resolve/reject в executor?
 * 5. Яка різниця між throw new Error() та reject() в промісі?
 */

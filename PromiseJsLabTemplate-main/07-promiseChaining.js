/**
 * ЗАВДАННЯ 7: Ланцюжки промісів (Promise Chaining)
 * 
 * Ланцюжки промісів - потужний інструмент для послідовної обробки даних
 * Кожен .then() повертає новий проміс
 */


// ==================== ЗАВДАННЯ 7.2 ====================
/**
 * Створіть ланцюжок обробки даних користувача:
 * 1. Отримати об'єкт {name: 'john doe', age: 25}
 * 2. Конвертувати name у верхній регістр
 * 3. Додати поле isAdult (age >= 18)
 * 4. Додати поле nameLength
 * 
 * @param {{name: string, age: number}} user 
 * @returns {Promise<{name: string, age: number, isAdult: boolean, nameLength: number}>}
 */
function processUser(user) {
    return Promise.resolve(user)
        // TODO: Реалізуйте ланцюжок трансформацій
    .then(u => {
      return { ...u, name: u.name.toUpperCase() };
    })
    // Крок 3: Додаємо поле isAdult
    .then(u => {
      return { ...u, isAdult: u.age >= 18 };
    })
    // Крок 4: Додаємо поле nameLength
    .then(u => {
      return { ...u, nameLength: u.name.length };
    });
}

// Перевірка:
processUser({ name: 'john doe', age: 25 })
    .then(result => console.log(' Тест 7.2:', result));
// Очікується: { name: 'JOHN DOE', age: 25, isAdult: true, nameLength: 8 }


// ==================== ЗАВДАННЯ 7.3 ====================
/**
 * Створіть ланцюжок з асинхронними операціями
 * Використовуйте функції нижче для побудови ланцюжка
 */

function fetchUserData(userId) {
    // Створюємо проміс, який виконається миттєво
    return Promise.resolve({ id: userId, username: 'user_' + userId });
}

function fetchUserPosts(user) {
    // Додаємо пости до об'єкта користувача
    return Promise.resolve({
        ...user,
        posts: ['Post 1', 'Post 2', 'Post 3']
    });
}

function countPosts(userData) {
    // Додаємо кількість постів
    return Promise.resolve({
        ...userData,
        postCount: userData.posts.length
    });
}

/**
 * Створіть функцію, яка:
 * 1. Отримує дані користувача
 * 2. Отримує його пости
 * 3. Рахує кількість постів
 * 
 * @param {number} userId 
 * @returns {Promise<{id: number, username: string, posts: string[], postCount: number}>}
 */
function getUserWithPostCount(userId) {
    // TODO: Побудуйте ланцюжок з трьох функцій вище
    return fetchUserData(userId)
        .then(user => fetchUserPosts(user))
        .then(userData => countPosts(userData));
}

// Перевірка:
getUserWithPostCount(123)
    .then(result => console.log(' Тест 7.3:', result));


// ==================== ЗАВДАННЯ 7.4 ====================
/**
 * Створіть ланцюжок з обробкою помилок
 * Якщо number < 0 - кинути помилку
 * Інакше виконати обчислення
 */

function validateNumber(number) {
    if (number < 0) {
        throw new Error('Number must be positive');
    }
    return number;
}

/**
 * Створіть функцію, яка:
 * 1. Валідує число (використовуйте validateNumber)
 * 2. Множить на 2
 * 3. Додає 5
 * 4. Повертає результат у форматі {original: number, result: number}
 * 5. Обробляє помилки та повертає {error: string}
 * 
 * @param {number} number 
 * @returns {Promise<{original?: number, result?: number, error?: string}>}
 */
function safeCalculation(number) {
    // TODO: Реалізуйте з обробкою помилок
    return Promise.resolve(number)
        // 1. Валідація
        .then(n => validateNumber(n))
        // 2 & 3. Математичні операції
        .then(validNum => {
            const result = validNum * 2 + 5;
            // 4. Повертаємо успішний об'єкт
            return { original: validNum, result: result };
        })
        // 5. Обробка помилок
        .catch(err => {
            // Якщо десь вище виникла помилка, повертаємо об'єкт з описом
            return { error: err.message };
        });
}

// Перевірка:
safeCalculation(10)
    .then(result => console.log(' Тест 7.4a:', result));
// Очікується: { original: 10, result: 25 }

safeCalculation(-5)
    .then(result => console.log(' Тест 7.4b:', result));
// Очікується: { error: 'Number must be positive' }


// ==================== БОНУСНЕ ЗАВДАННЯ 7.6 🔥 ====================
/**
 * Створіть функцію, яка виконує серію трансформацій над рядком
 * і повертає історію всіх змін
 * 
 * @param {string} text 
 * @returns {Promise<{original: string, steps: string[], final: string}>}
 */
function transformWithHistory(text) {
    // TODO: Створіть ланцюжок, який:
    // 1. Зберігає оригінальний текст
    // 2. Конвертує в нижній регістр (зберегти в історію)
    // 3. Видаляє пробіли (зберегти в історію)
    // 4. Інвертує рядок (зберегти в історію)
    // 5. Повертає об'єкт з original, steps[], final

    // 1. Починаємо з об'єкта, що зберігає оригінал та порожній масив кроків
    return Promise.resolve({
        original: text,
        steps: [],
        current: text
    })
    // 2. Конвертуємо в нижній регістр
    .then(state => {
        const nextText = state.current.toLowerCase();
        return {
            ...state,
            current: nextText,
            steps: [...state.steps, nextText]
        };
    })
    // 3. Видаляємо пробіли
    .then(state => {
        const nextText = state.current.replace(/\s+/g, ''); 
        // \s - означає будь-який пробільний символ (пробіл, табуляція, новий рядок),
        // +  - означає "один або більше" таких символів,
        // g  - глобальний пошук
        return {
            ...state,
            current: nextText,
            steps: [...state.steps, nextText]
        };
    })
    // 4. Інвертуємо рядок
    .then(state => {
        // split('') - розбиваємо рядок на масив символів,
        // reverse() - інвертуємо масив, 
        // join('')  - з'єднуємо назад в рядок.
        const nextText = state.current.split('').reverse().join('');
        return {
            ...state,
            current: nextText,
            steps: [...state.steps, nextText]
        };
    })
    // 5. Формуємо фінальний об'єкт згідно з ТЗ
    .then(state => {
        return {
            original: state.original,
            steps: state.steps,
            final: state.current
        };
    });
}

// Перевірка (розкоментуйте після реалізації):
 transformWithHistory('Hello World')
     .then(result => console.log(' Тест 7.6:', result));
// Очікується: {
//   original: 'Hello World',
//   steps: ['hello world', 'helloworld', 'dlrowolleh'],
//   final: 'dlrowolleh'
// }


/**
 * ПИТАННЯ ДЛЯ САМОПЕРЕВІРКИ:
 * 
 * 1. Що повертає .then()?
 * 2. Чи можна повернути проміс з .then()?
 * 3. Що станеться якщо в .then() кинути помилку?
 * 4. Як працює .catch() в середині ланцюжка?
 * 5. Чи можна продовжити ланцюжок після .catch()?
 * 6. Яка різниця між return value та return Promise.resolve(value) в .then()?
 */

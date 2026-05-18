/**
 * ЗАВДАННЯ 19: Retry Logic - Логіка повторних спроб
 * 
 * У реальних додатках часто потрібно повторювати запити при помилках
 * Це критично важлива навичка для роботи з нестабільними API
 */


// ==================== ЗАВДАННЯ 19.2 ====================
/**
 * Створіть retry з експоненційною затримкою (exponential backoff)
 * Затримка збільшується: 100ms, 200ms, 400ms, 800ms...
 * 
 * @param {Function} fn 
 * @param {number} maxRetries 
 * @param {number} initialDelay - Початкова затримка в мс
 * @returns {Promise}
 */
async function retryWithBackoff(fn, maxRetries, initialDelay = 100) {
    // TODO: Реалізуйте з затримкою між спробами
    // Затримка має подвоюватися після кожної невдалої спроби
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Спробуємо виконати функцію
            return await fn();
        } catch (error) {
            // Якщо це була остання спроба — викидаємо помилку далі
            if (attempt === maxRetries) {
                throw new Error(`Failed after ${maxRetries} retries. Last error: ${error.message}`);
            }

            console.log(` task 19.2  Attempt ${attempt} failed. Retrying in ${delay}ms...`);

            // Чекаємо перед наступною спробою
            await new Promise(resolve => setTimeout(resolve, delay));

            // Подвоюємо затримку для наступного кроку
            delay *= 2;
        }
    }
    
}

// Перевірка:
let attempt2 = 0;
function unstableAPI() {
    attempt2++;
    console.log(`  Attempt ${attempt2} at ${new Date().toLocaleTimeString()}`);
    if (attempt2 < 3) {
        return Promise.reject(new Error('API Error'));
    }
    return Promise.resolve('API Success');
}

console.log('task 19.2 Starting retryWithBackoff at', new Date().toLocaleTimeString());
retryWithBackoff(unstableAPI, 5, 100)
    .then(result => console.log(' Тест 19.2:', result));


// ==================== ЗАВДАННЯ 19.4 ====================
/**
 * Створіть retry з детальним логуванням
 * Логуйте кожну спробу, затримку, та результат
 */

/**
 * @param {Function} fn 
 * @param {number} maxRetries 
 * @param {Object} options - {initialDelay, maxDelay, onRetry}
 * @returns {Promise}
 */
async function retryWithLogging(fn, maxRetries, options = {}) {
    // TODO: Реалізуйте retry з:
    // 1. Експоненційною затримкою (але не більше maxDelay)
    // 2. Викликом onRetry(attempt, error, nextDelay) перед кожною спробою
    // 3. Поверненням детальної інформації про всі спроби
    const {
        initialDelay = 100,
        maxDelay = 5000,
        onRetry = null
    } = options;

    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Спроба виконати основну функцію
            return await fn();
        } catch (error) {
            // Якщо це була остання спроба — викидаємо помилку
            if (attempt === maxRetries) {
                throw error;
            }

            // Розраховуємо наступну затримку (не більше maxDelay)
            const nextDelay = Math.min(delay, maxDelay);

            // Викликаємо колбек для логування, якщо він переданий
            if (typeof onRetry === 'function') {
                onRetry(attempt, error, nextDelay);
            }

            // Чекаємо перед наступною спробою
            await new Promise(resolve => setTimeout(resolve, nextDelay));

            // Збільшуємо затримку для наступного кроку (експоненційно)
            delay *= 2;
        }
    }
}

// Перевірка:
let attempt4 = 0;
function trackableFunction() {
    attempt4++;
    if (attempt4 < 4) {
        return Promise.reject(new Error(`Fail ${attempt4}`));
    }
    return Promise.resolve('Success!');
}

retryWithLogging(trackableFunction, 5, {
    initialDelay: 50,
    maxDelay: 500,
    onRetry: (attempt, error, delay) => {
        console.log(`  Retry ${attempt}: ${error.message}, waiting ${delay}ms`);
    }
})
    .then(result => console.log(' Тест 19.4:', result));


// ==================== ЗАВДАННЯ 19.5 ====================
/**
 * Створіть систему retry з обмеженням за часом
 * Навіть якщо є спроби, зупиніться якщо пройшло багато часу
 */

/**
 * @param {Function} fn 
 * @param {Object} options - {maxRetries, maxTime, initialDelay}
 * @returns {Promise}
 */
async function retryWithTimeout(fn, options = {}) {

    // TODO: Реалізуйте retry який зупиняється якщо:
    // 1. Досягнуто maxRetries
    // 2. АБО пройшло більше maxTime мілісекунд від початку
    const {
        maxRetries = 3,
        maxTime = 5000,
        initialDelay = 100
    } = options;

    const startTime = Date.now(); // Фіксуємо час початку роботи
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Перед виконанням перевіряємо, чи не вичерпано загальний час
            if (Date.now() - startTime > maxTime) {
                throw new Error('Timeout: Total execution time exceeded');
            }

            return await fn();
        } catch (error) {
            const currentTime = Date.now();
            const timeElapsed = currentTime - startTime;

            // Умови виходу: закінчилися спроби АБО вийшов час
            if (attempt === maxRetries || timeElapsed + delay > maxTime) {
                // Кидаємо помилку, якщо наступна спроба точно не вкладеться в тайм-аут
                throw error;
            }

            console.log(`   Attempt ${attempt} failed. Elapsed: ${timeElapsed}ms. Next retry in ${delay}ms`);

            // Чекаємо перед наступною спробою
            await new Promise(resolve => setTimeout(resolve, delay));

            // Експоненційне збільшення затримки
            delay *= 2;
        }
    }
}

// Перевірка:
let attempt5 = 0;
function slowFunction() {
    attempt5++;
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (attempt5 < 10) {
                reject(new Error(`Attempt ${attempt5}`));
            } else {
                resolve('Success');
            }
        }, 200);
    });
}

console.log('Starting retryWithTimeout at', new Date().toLocaleTimeString());
retryWithTimeout(slowFunction, {
    maxRetries: 20,
    maxTime: 1000,
    initialDelay: 100
})
    .catch(error => {
        console.log(' Тест 19.5: Stopped due to timeout');
        console.log('  Total attempts:', attempt5);
    });

/**
 * ПИТАННЯ ДЛЯ САМОПЕРЕВІРКИ:
 * 
 * 1. Чому важливо мати затримку між спробами?
 * 2. Що таке exponential backoff і чому він корисний?
 * 3. Які типи помилок варто повторювати, а які ні?
 * 4. Як захистити систему від нескінченних retry?
 * 5. Коли краще використовувати часовий ліміт замість лічильника спроб?
 * 6. Як retry впливає на продуктивність системи?
 * 7. Що таке jitter в контексті retry і навіщо він потрібен?
 */
